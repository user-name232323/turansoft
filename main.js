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

  // === ОТПРАВКА ФОРМЫ ===
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

 // === УВЕЛИЧЕНИЕ ИЗОБРАЖЕНИЙ ПРОДУКЦИИ ===
const productCards = document.querySelectorAll('.product-card');
if (productCards.length) {
  const modal = document.createElement('div');
  modal.id = 'imgModal';
  modal.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.9);
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;
  modal.innerHTML = `<img style="max-width:90%; max-height:90%; border-radius:12px; box-shadow:0 0 30px rgba(0,0,0,0.6);">`;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector('img');

  productCards.forEach(card => {
    card.style.cursor = 'zoom-in';
    card.addEventListener('click', () => {
      const bg = card.style.backgroundImage;
      const url = bg.slice(5, -2); // вырезаем из 'url("pag1.jpg")'
      modalImg.src = url;
      modal.style.display = 'flex';
    });
  });

  modal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  // === ПРОСМОТР ВИДЕО В ПОЛНОЭКРАННОМ РЕЖИМЕ СО ЗВУКОМ ===
const videos = document.querySelectorAll('.my-video');
if (videos.length) {
  const videoModal = document.createElement('div');
  videoModal.id = 'videoModal';
  videoModal.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.85);
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;
  videoModal.innerHTML = `
    <video controls autoplay style="max-width:90%; max-height:90%; border-radius:10px; background:#000;">
      <source src="" type="video/mp4">
      Ваш браузер не поддерживает видео.
    </video>
  `;
  document.body.appendChild(videoModal);

  const modalVideo = videoModal.querySelector('video');
  const modalSource = modalVideo.querySelector('source');

  videos.forEach(v => {
    v.addEventListener('click', () => {
      modalSource.src = v.querySelector('source').src;
      modalVideo.load();
      videoModal.style.display = 'flex';
      modalVideo.play();
    });
  });

  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      modalVideo.pause();
      videoModal.style.display = 'none';
    }
  });
  // === ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА ===
const langButtons = document.querySelectorAll(".lang-switcher button");

function setLanguage(lang) {
  const elements = document.querySelectorAll("[data-i18n], [data-i18n-placeholder]");
  
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key && translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key]; // текст кнопок, заголовков и т.д.
    }

    const phKey = el.getAttribute("data-i18n-placeholder");
    if (phKey && translations[lang] && translations[lang][phKey]) {
      el.placeholder = translations[lang][phKey]; // placeholder полей формы
    }
  });

  localStorage.setItem("lang", lang);
}

// Загрузка выбранного языка из localStorage
const savedLang = localStorage.getItem("lang") || "ru";
setLanguage(savedLang);

langButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");
    setLanguage(lang);
  });
});
}
}
});
