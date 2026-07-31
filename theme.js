(function () {
  var storageKey = "theme-preference";
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function getStoredPreference() {
    var value = localStorage.getItem(storageKey);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
    return "system";
  }

  function applyTheme(preference) {
  var activeTheme = preference;
  
  if (preference === "system") {
    activeTheme = media.matches ? "dark" : "light";
  }

  root.setAttribute("data-theme", activeTheme);
  root.style.colorScheme = activeTheme;
}


  function updateMenuState(menu, preference) {
    var buttons = menu.querySelectorAll("button[data-theme-value]");
    buttons.forEach(function (btn) {
      var isActive = btn.getAttribute("data-theme-value") === preference;
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      if (isActive) {
        btn.classList.add("is-active");
      } else {
        btn.classList.remove("is-active");
      }
    });
  }

  function buildThemeSelector(initialPreference) {
    var navList = document.querySelector("nav ul");
    if (!navList) {
      return;
    }

    var item = document.createElement("li");
    item.className = "theme-switcher";

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "theme-toggle";
    toggle.setAttribute("aria-label", "Darstellung umschalten");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-haspopup", "true");
    toggle.innerHTML = '<span class="theme-glyph" aria-hidden="true"></span><span class="sr-only">Darstellung öffnen</span>';

    var menu = document.createElement("div");
    menu.className = "theme-menu";
    menu.hidden = true;

    var options = [
      { value: "system", label: "System" },
      { value: "light", label: "Hell" },
      { value: "dark", label: "Dunkel" }
    ];

    options.forEach(function (entry) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-option";
      btn.textContent = entry.label;
      btn.setAttribute("data-theme-value", entry.value);
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () {
        var choice = btn.getAttribute("data-theme-value");
        localStorage.setItem(storageKey, choice);
        applyTheme(choice);
        updateMenuState(menu, choice);
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      });
      menu.appendChild(btn);
    });

    updateMenuState(menu, initialPreference);

    toggle.addEventListener("click", function () {
      var isOpen = !menu.hidden;
      menu.hidden = isOpen;
      toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });

    document.addEventListener("click", function (event) {
      if (!item.contains(event.target)) {
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    item.appendChild(toggle);
    item.appendChild(menu);
    navList.appendChild(item);
  }

  var preference = getStoredPreference();
  applyTheme(preference);

  media.addEventListener("change", function () {
    if (getStoredPreference() === "system") {
      applyTheme("system");
    }
  });

  if (document.querySelector("html-include")) {
    document.addEventListener("site-includes-ready", function () {
      buildThemeSelector(preference);
    }, { once: true });
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      buildThemeSelector(preference);
    });
  } else {
    buildThemeSelector(preference);
  }
})();
