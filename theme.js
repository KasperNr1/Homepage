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
    if (preference === "light" || preference === "dark") {
      root.setAttribute("data-theme", preference);
      root.style.colorScheme = preference;
      return;
    }

    root.removeAttribute("data-theme");
    root.style.colorScheme = media.matches ? "dark" : "light";
  }

  function buildThemeSelector(initialPreference) {
    var navList = document.querySelector("nav ul");
    if (!navList) {
      return;
    }

    var item = document.createElement("li");
    item.className = "theme-switcher";

    var label = document.createElement("label");
    label.setAttribute("for", "theme-select");
    label.className = "sr-only";
    label.textContent = "Darstellung";

    var select = document.createElement("select");
    select.id = "theme-select";
    select.className = "theme-select";
    select.setAttribute("aria-label", "Darstellung waehlen");

    var options = [
      { value: "system", label: "System" },
      { value: "light", label: "Hell" },
      { value: "dark", label: "Dunkel" }
    ];

    options.forEach(function (entry) {
      var opt = document.createElement("option");
      opt.value = entry.value;
      opt.textContent = entry.label;
      select.appendChild(opt);
    });

    select.value = initialPreference;
    select.addEventListener("change", function () {
      var choice = select.value;
      localStorage.setItem(storageKey, choice);
      applyTheme(choice);
    });

    item.appendChild(label);
    item.appendChild(select);
    navList.appendChild(item);
  }

  var preference = getStoredPreference();
  applyTheme(preference);

  media.addEventListener("change", function () {
    if (getStoredPreference() === "system") {
      applyTheme("system");
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      buildThemeSelector(preference);
    });
  } else {
    buildThemeSelector(preference);
  }
})();
