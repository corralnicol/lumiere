function initializeSellerNewsletter() {
  const form = document.querySelector("[data-newsletter-form]");
  const input = document.querySelector("[data-newsletter-input]");
  const message = document.querySelector("[data-newsletter-message]");

  // Si no encuentra el formulario no hago nada para evitar errores
  if (!form || !input || !message) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Valida que el email sea correcto antes de procesar
    if (!input.checkValidity()) {
      message.textContent = "Enter a valid email address to subscribe.";
      message.dataset.state = "error";
      return;
    }

    // Si el email es valido muestra el mensaje de confirmacion
    message.textContent = `Thanks, ${input.value.trim()} is now subscribed to Lumiere updates.`;
    message.dataset.state = "success";
    form.reset();
  });
}

// Inicializo el acordeon del FAQ
function initializeFaqAccordion() {
  const faqItems = document.querySelectorAll(".seller-faq__item");

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector(".seller-faq__question");

    if (!questionBtn) return;

    questionBtn.addEventListener("click", () => {
      const isExpanded = questionBtn.getAttribute("aria-expanded") === "true";

      // Cierro todos los demas acordeones
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          const otherBtn = otherItem.querySelector(".seller-faq__question");
          if (otherBtn) {
            otherBtn.setAttribute("aria-expanded", "false");
          }
        }
      });

      // Alterno el estado del acordeon clickeado
      questionBtn.setAttribute("aria-expanded", !isExpanded);
    });
  });
}

// Ejecuta todo cuando el DOM ya cargo completamente
window.addEventListener("DOMContentLoaded", () => {
  initializeSellerNewsletter();
  initializeFaqAccordion();
});
