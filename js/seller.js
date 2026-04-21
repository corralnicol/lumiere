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

// Ejecuta todo cuando el DOM ya cargo completamente
window.addEventListener("DOMContentLoaded", () => {
  initializeSellerNewsletter();
});
