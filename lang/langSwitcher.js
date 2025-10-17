document.addEventListener("DOMContentLoaded", () => {
  const translations = {
    ru: {
      title: "ТОО «АКНМ ТК» — Добыча и переработка инертных материалов",
      about: "О предприятии",
      products: "Продукция",
      geography: "География добычи",
      contacts: "Контакты",
      description:
        "Компания «АКНМ ТК» — ведущий производитель щебня, песка и строительных материалов в Казахстане.",
    },
    kk: {
      title: "«АКНМ ТК» ЖШС — Инертті материалдарды өндіру және өңдеу",
      about: "Кәсіпорын туралы",
      products: "Өнімдер",
      geography: "Өндіру географиясы",
      contacts: "Байланыс",
      description:
        "«АКНМ ТК» компаниясы — Қазақстандағы ұсақтас, құм және құрылыс материалдарының жетекші өндірушісі.",
    },
    en: {
      title: "AKNM TK LLP — Mining and processing of inert materials",
      about: "About",
      products: "Products",
      geography: "Geography of Extraction",
      contacts: "Contacts",
      description:
        "AKNM TK is a leading producer of crushed stone, sand, and construction materials in Kazakhstan.",
    },
  };

  // Привязываем тексты к элементам
  const textElements = {
    title: document.querySelector("title"),
    about: document.querySelector("#about h2"),
    products: document.querySelector("#products h2"),
    geography: document.querySelector("#geography h2"),
    contacts: document.querySelector("#contacts h2"),
    description: document.querySelector("#about p"),
  };

  const buttons = document.querySelectorAll(".lang-switcher button");

  function switchLanguage(lang) {
    const dict = translations[lang];
    if (!dict) return;

    Object.keys(textElements).forEach((key) => {
      if (textElements[key]) {
        textElements[key].textContent = dict[key];
      }
    });

    buttons.forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`[data-lang="${lang}"]`).classList.add("active");

    localStorage.setItem("siteLang", lang);
  }

  // === Загрузка выбранного языка при открытии ===
  const savedLang = localStorage.getItem("siteLang") || "ru";
  switchLanguage(savedLang);

  buttons.forEach((btn) =>
    btn.addEventListener("click", () => switchLanguage(btn.dataset.lang))
  );
});
