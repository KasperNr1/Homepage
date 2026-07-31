(function () {
  "use strict";

  function initializeNavigation() {
    var nav = document.querySelector(".site-navigation");
    if (!nav || nav.getAttribute("data-navigation-ready") === "true") {
      return;
    }

    var brand = nav.querySelector(".nav-name");
    var toggle = nav.querySelector(".nav-toggle");
    var links = nav.querySelector(".nav-links");
    if (!brand || !toggle || !links) {
      return;
    }

    nav.setAttribute("data-navigation-ready", "true");
    var measurementFrame;

    function measureLinksWidth() {
      var measurement = document.createElement("div");
      var linksClone = links.cloneNode(true);

      measurement.className = "nav-measurement";
      measurement.setAttribute("aria-hidden", "true");
      linksClone.removeAttribute("id");
      linksClone.hidden = false;
      measurement.appendChild(linksClone);
      nav.appendChild(measurement);

      var width = linksClone.getBoundingClientRect().width;
      measurement.remove();
      return width;
    }

    function setMenuOpen(isOpen) {
      if (!nav.classList.contains("nav-is-collapsed")) {
        isOpen = false;
      }

      links.hidden = !isOpen && nav.classList.contains("nav-is-collapsed");
      nav.classList.toggle("nav-menu-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute("aria-label", isOpen ? "Navigation schließen" : "Navigation öffnen");
    }

    function updateLayout() {
      if (measurementFrame) {
        return;
      }

      measurementFrame = window.requestAnimationFrame(function () {
        measurementFrame = null;
        var navStyle = window.getComputedStyle(nav);
        var availableWidth = nav.clientWidth
          - parseFloat(navStyle.paddingLeft)
          - parseFloat(navStyle.paddingRight);
        var requiredWidth = brand.getBoundingClientRect().width
          + measureLinksWidth()
          + parseFloat(navStyle.columnGap || navStyle.gap || 0);
        var shouldCollapse = requiredWidth > availableWidth;
        var isCollapsed = nav.classList.contains("nav-is-collapsed");

        if (shouldCollapse !== isCollapsed) {
          nav.classList.toggle("nav-is-collapsed", shouldCollapse);
          setMenuOpen(false);
        }

        toggle.hidden = !shouldCollapse;
        if (!shouldCollapse) {
          links.hidden = false;
        }
      });
    }

    toggle.addEventListener("click", function () {
      setMenuOpen(links.hidden);
    });

    links.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target)) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("nav-menu-open")) {
        setMenuOpen(false);
        toggle.focus();
      }
    });

    if ("ResizeObserver" in window) {
      new ResizeObserver(updateLayout).observe(nav);
    } else {
      window.addEventListener("resize", updateLayout);
    }

    new MutationObserver(updateLayout).observe(links, {
      childList: true
    });

    if (document.fonts) {
      document.fonts.ready.then(updateLayout);
    }

    updateLayout();
  }

  if (document.querySelector(".site-navigation")) {
    initializeNavigation();
  } else {
    document.addEventListener("site-includes-ready", initializeNavigation, { once: true });
  }
})();