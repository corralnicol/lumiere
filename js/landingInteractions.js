function createFeedbackController() {
  const banner = document.querySelector("[data-feedback-banner]");

  function show(message, type = "info") {
    if (!banner) {
      return;
    }

    banner.textContent = message;
    banner.dataset.state = type;
    banner.classList.add("is-visible");

    window.clearTimeout(show.timeoutId);
    show.timeoutId = window.setTimeout(() => {
      banner.classList.remove("is-visible");
      banner.dataset.state = "";
    }, 3200);
  }

  return { show };
}

function initializeSearch(feedback) {
  const form = document.querySelector("[data-search-form]");
  const input = document.querySelector("[data-search-input]");
  const status = document.querySelector("[data-search-status]");
  const searchables = [...document.querySelectorAll("[data-search-target]")];

  if (!form || !input || !status || searchables.length === 0) {
    return;
  }

  const clearMatches = () => {
    searchables.forEach((element) => element.classList.remove("is-search-match"));
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const rawQuery = input.value.trim();
    const query = rawQuery.toLowerCase();
    clearMatches();

    if (!query) {
      status.textContent = "Type a product, brand or category to see matching sections.";
      feedback.show("Search cleared. Try terms like blush, Clinique or lip.", "info");
      return;
    }

    const matches = searchables.filter((element) => {
      const searchableText = element.dataset.searchTarget || "";
      return searchableText.toLowerCase().includes(query);
    });

    if (matches.length === 0) {
      status.textContent = `No matches found for "${rawQuery}".`;
      feedback.show(`No matching items found for "${rawQuery}".`, "warning");
      return;
    }

    matches.forEach((element) => element.classList.add("is-search-match"));
    matches[0].scrollIntoView({ behavior: "smooth", block: "center" });
    status.textContent = `${matches.length} match${matches.length > 1 ? "es" : ""} found for "${rawQuery}".`;
    feedback.show(`Showing ${matches.length} search result${matches.length > 1 ? "s" : ""}.`, "success");
  });
}

function initializeFavorites(feedback) {
  const favoriteButtons = [...document.querySelectorAll("[data-favorite-button]")];

  favoriteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const isActive = button.classList.toggle("is-active");
      button.setAttribute("aria-pressed", isActive ? "true" : "false");

      const icon = button.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-regular", !isActive);
        icon.classList.toggle("fa-solid", isActive);
      }

      const itemName = button.dataset.itemName || "Item";
      feedback.show(
        isActive ? `${itemName} added to favorites.` : `${itemName} removed from favorites.`,
        isActive ? "success" : "info"
      );
    });
  });
}

function initializeNewsletter(feedback) {
  const form = document.querySelector("[data-newsletter-form]");
  const input = document.querySelector("[data-newsletter-input]");
  const message = document.querySelector("[data-newsletter-message]");

  if (!form || !input || !message) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!input.checkValidity()) {
      message.textContent = "Enter a valid email address to subscribe.";
      message.dataset.state = "error";
      feedback.show("Newsletter subscription needs a valid email.", "warning");
      return;
    }

    message.textContent = `Thanks, ${input.value.trim()} is now subscribed to Lumiere updates.`;
    message.dataset.state = "success";
    feedback.show("Newsletter subscription confirmed.", "success");
    form.reset();
  });
}

function initializeUtilityLinks(feedback) {
  const utilityLinks = [...document.querySelectorAll("[data-feedback-link]")];

  utilityLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const type = link.dataset.feedbackLink;

      if (type === "favorites") {
        feedback.show("Favorites are still in development and will be available soon.", "info");
      }

      if (type === "cart") {
        feedback.show("Opening the products page so you can continue shopping.", "info");
      }

      if (type === "account") {
        feedback.show("The account section is still in development and will be available soon.", "info");
      }
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const feedback = createFeedbackController();

  initializeSearch(feedback);
  initializeFavorites(feedback);
  initializeNewsletter(feedback);
  initializeUtilityLinks(feedback);
});
