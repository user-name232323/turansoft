document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submitBtn = form?.querySelector('button[type="submit"]');

  // === ВИЗУАЛЬНЫЙ ПРЕЛОАДЕР ===
  const setLoading = (loading) => {
    if (!submitBtn) return;
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
  

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#name').value.trim();
      const phone = form.querySelector('#phone').value.trim();
      const email = form.querySelector('#email').value.trim();
      const message = form.querySelector('#message').value.trim();

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

      setLoading(true);
      status.style.color = '#444';
      status.textContent = 'Подготавливаем письмо...';

      const domain = email.split('@')[1].toLowerCase();
      const toMail = 'aknm-tk@bk.ru';
      const subject = `Запрос с сайта — ${name}`;
      const body = `Имя: ${name}\nТелефон: ${phone}\nEmail: ${email}\n\nСообщение:\n${message}`;
      const encode = encodeURIComponent;

      const mailServices = {
        'gmail.com': `https://mail.google.com/mail/?view=cm&fs=1&to=${encode(toMail)}&su=${encode(subject)}&body=${encode(body)}`,
        'mail.ru': `https://e.mail.ru/compose/?to=${encode(toMail)}&subject=${encode(subject)}&body=${encode(body)}`,
        'yandex.ru': `https://mail.yandex.ru/?compose=1&to=${encode(toMail)}&subject=${encode(subject)}&body=${encode(body)}`,
        'yahoo.com': `https://compose.mail.yahoo.com/?to=${encode(toMail)}&subject=${encode(subject)}&body=${encode(body)}`,
        'outlook.com': `https://outlook.live.com/mail/deeplink/compose?to=${encode(toMail)}&subject=${encode(subject)}&body=${encode(body)}`,
        'hotmail.com': `https://outlook.live.com/mail/deeplink/compose?to=${encode(toMail)}&subject=${encode(subject)}&body=${encode(body)}`
      };

      if (mailServices[domain]) {
        window.open(mailServices[domain], '_blank');
      } else {
        window.location.href = `mailto:${toMail}?subject=${encode(subject)}&body=${encode(body)}`;
      }

      setTimeout(() => {
        setLoading(false);
        status.style.color = 'green';
        status.textContent = '✅ Сообщение подготовлено! Проверьте вашу почту.';
        form.reset();
      }, 2500);
    });

    form.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        form.dispatchEvent(new Event('submit'));
      }
    });
  }

  // === АВТОПРОКРУТКА ГАЛЕРЕИ ===
  const gallery = document.getElementById('autoGallery');
  if (gallery) {
    let scrollAmount = 0;
    function autoScroll() {
      if (!gallery.matches(':hover')) {
        scrollAmount += 1;
        gallery.scrollLeft = scrollAmount;
        if (scrollAmount >= gallery.scrollWidth - gallery.clientWidth) {
          scrollAmount = 0;
        }
      }
    }
    setInterval(autoScroll, 30);
  }
  
});

