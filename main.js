document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Добавим визуальный прелоадер
  const setLoading = (loading) => {
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';
      submitBtn.style.opacity = '0.6';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить';
      submitBtn.style.opacity = '1';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    // Валидация
    if (!name || !phone || !email || !message) {
      status.style.color = 'red';
      status.textContent = '❌ Пожалуйста, заполните все поля.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      status.style.color = 'red';
      status.textContent = '❌ Введите корректный Email.';
      return;
    }

    // Начинаем "отправку"
    setLoading(true);
    status.style.color = '#444';
    status.textContent = 'Подготавливаем письмо...';

    const domain = email.split('@')[1].toLowerCase();
    const toMail = 'info@aknm.example';
    const subject = `Запрос с сайта — ${name}`;
    const body = `Имя: ${name}\nТелефон: ${phone}\nEmail: ${email}\n\nСообщение:\n${message}`;

    const encode = encodeURIComponent;

    // Поддержка популярных почтовых сервисов
    const mailServices = {
      'gmail.com': `https://mail.google.com/mail/?view=cm&fs=1&to=${encode(toMail)}&su=${encode(subject)}&body=${encode(body)}`,
      'mail.ru': `https://e.mail.ru/compose/?to=${encode(toMail)}&subject=${encode(subject)}&body=${encode(body)}`,
      'yandex.ru': `https://mail.yandex.ru/?compose=1&to=${encode(toMail)}&subject=${encode(subject)}&body=${encode(body)}`,
      'yahoo.com': `https://compose.mail.yahoo.com/?to=${encode(toMail)}&subject=${encode(subject)}&body=${encode(body)}`,
      'outlook.com': `https://outlook.live.com/mail/deeplink/compose?to=${encode(toMail)}&subject=${encode(subject)}&body=${encode(body)}`,
      'hotmail.com': `https://outlook.live.com/mail/deeplink/compose?to=${encode(toMail)}&subject=${encode(subject)}&body=${encode(body)}`
    };

    // Открываем нужный сервис
    if (mailServices[domain]) {
      window.open(mailServices[domain], '_blank');
    } else {
      // fallback — просто mailto
      window.location.href = `mailto:${toMail}?subject=${encode(subject)}&body=${encode(body)}`;
    }

    // Имитация "отправки"
    setTimeout(() => {
      setLoading(false);
      status.style.color = 'green';
      status.textContent = '✅ Сообщение подготовлено! Проверьте вашу почту.';
      form.reset();
    }, 2500);
  });

  // Позволяем отправку при нажатии Enter
  form.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      form.dispatchEvent(new Event('submit'));
    }
  });
});
