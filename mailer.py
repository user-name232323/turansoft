#!/usr/bin/env python3
"""
mailer.py — простой бот для почтовой рассылки через SMTP (mail.ru / list.ru)

Использование (рекомендуется):
  export EMAIL_USER="galina.korotkaya@list.ru"
  export EMAIL_PASS="(секретный пароль или апк-пароль)"
  python3 mailer.py --recipients recipients.csv --subject "Тема" --template template.html --rate 20

Формат recipients.csv (header обязательный):
email,name
user1@example.com,Иван
user2@example.com,Мария

template.html может содержать токены вида {{name}} для подстановки.
"""

import os
import csv
import time
import argparse
import logging
import smtplib
from email.message import EmailMessage
from email.utils import formataddr
from string import Template
from typing import List, Dict

# Настройка логов
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')
logger = logging.getLogger("mailer")

# --- HELPERS ---
def load_recipients(path: str) -> List[Dict[str,str]]:
    recipients = []
    with open(path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if 'email' not in row:
                raise ValueError("CSV должен содержать колонку 'email'")
            recipients.append(row)
    return recipients

def load_template(path: str) -> str:
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def make_message(sender_name: str, sender_email: str, to_email: str, subject: str,
                 plain_body: str, html_body: str = None, reply_to: str = None) -> EmailMessage:
    msg = EmailMessage()
    msg['From'] = formataddr((sender_name, sender_email))
    msg['To'] = to_email
    msg['Subject'] = subject
    if reply_to:
        msg['Reply-To'] = reply_to
    # Add List-Unsubscribe header (recommended)
    msg['List-Unsubscribe'] = f"<mailto:{sender_email}?subject=unsubscribe>"
    msg.set_content(plain_body)
    if html_body:
        msg.add_alternative(html_body, subtype='html')
    return msg

def send_smtp_message(smtp_server: str, smtp_port: int, user: str, password: str, msg: EmailMessage,
                      use_starttls=True, timeout=60):
    """
    Подключается к SMTP, отправляет msg и закрывает соединение.
    Функция не держит подключение между отправками (простота). Для большого объёма
    можно держать соединение открытым и реорганизовать код.
    """
    # Попробуем с TLS (STARTTLS)
    if use_starttls:
        with smtplib.SMTP(smtp_server, smtp_port, timeout=timeout) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(user, password)
            server.send_message(msg)
    else:
        with smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=timeout) as server:
            server.login(user, password)
            server.send_message(msg)

# --- MAIN ---
def main():
    parser = argparse.ArgumentParser(description="Simple SMTP mailer")
    parser.add_argument("--recipients", required=True, help="CSV файл с колонками email,name,...")
    parser.add_argument("--subject", required=True, help="Тема письма")
    parser.add_argument("--template", required=False, help="HTML шаблон (опционально)")
    parser.add_argument("--plain", required=False, help="Plain text файл (опционально)")
    parser.add_argument("--from-name", default="ТОО «АКНМ ТК»", help="Имя отправителя")
    parser.add_argument("--from-email", default=None, help="Email отправителя (по умолчанию ENV EMAIL_USER)")
    parser.add_argument("--smtp-server", default="smtp.mail.ru", help="SMTP сервер")
    parser.add_argument("--smtp-port", type=int, default=587, help="SMTP порт (587 для STARTTLS, 465 для SSL)")
    parser.add_argument("--rate", type=float, default=10.0, help="Письм в секунду (rate limit). 10 => задержка 0.1s")
    parser.add_argument("--use-ssl", action="store_true", help="Использовать SSL (порт 465)")
    parser.add_argument("--dry-run", action="store_true", help="Не отправлять, только логировать")
    args = parser.parse_args()

    # Получение учётных данных из переменных окружения (рекомендуется)
    user = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASS")
    if not user:
        logger.error("Переменная окружения EMAIL_USER не задана")
        return
    if not password:
        logger.error("Переменная окружения EMAIL_PASS не задана")
        return

    from_email = args.from_email or user

    # Загружаем получателей
    recipients = load_recipients(args.recipients)
    if not recipients:
        logger.error("Список получателей пуст")
        return
    logger.info("Загружено %d получателей", len(recipients))

    # Загружаем шаблоны
    html_template = None
    plain_template = None
    if args.template:
        html_template = load_template(args.template)
    if args.plain:
        plain_template = load_template(args.plain)
    if not html_template and not plain_template:
        # Простая заглушка
        plain_template = "Здравствуйте, {{name}}!\n\nЭто тестовое сообщение.\n\nС уважением,\nКоманда."

    # Rate limiting: интервал между отправками в секундах
    interval = 1.0 / args.rate if args.rate > 0 else 0

    # Отправляем по одному (для простоты устойчивости и логирования)
    sent = 0
    errors = 0
    for row in recipients:
        to_email = row.get('email').strip()
        # Примеры персонализации: используем шаблон Python Template или простую замену
        ctx = {k: (v or "") for k, v in row.items()}
        # Подготовить тело письма
        if html_template:
            html_body = Template(html_template).safe_substitute(**ctx)
        else:
            html_body = None
        if plain_template:
            plain_body = Template(plain_template).safe_substitute(**ctx)
        else:
            # if no plain provided, strip tags naively or make fallback
            plain_body = Template("Здравствуйте, ${name}!").safe_substitute(**ctx)

        msg = make_message(args.from_name, from_email, to_email, args.subject, plain_body, html_body, reply_to=from_email)

        # Dry-run?
        if args.dry_run:
            logger.info("[DRY] Would send to %s", to_email)
            sent += 1
        else:
            # Попытка с retry
            max_retries = 3
            backoff = 2
            for attempt in range(1, max_retries + 1):
                try:
                    send_smtp_message(args.smtp_server, args.smtp_port, user, password, msg, use_starttls=not args.use_ssl)
                    logger.info("Sent to %s", to_email)
                    sent += 1
                    break
                except Exception as e:
                    logger.exception("Error sending to %s on attempt %d: %s", to_email, attempt, e)
                    errors += 1
                    if attempt < max_retries:
                        sleep_time = backoff ** attempt
                        logger.info("Retrying in %s seconds...", sleep_time)
                        time.sleep(sleep_time)
                    else:
                        logger.error("Failed to send to %s after %d attempts", to_email, max_retries)
        # Rate limit pause
        if interval:
            time.sleep(interval)

    logger.info("Done. Sent: %d, Errors (approx): %d", sent, errors)

if __name__ == "__main__":
    main()
