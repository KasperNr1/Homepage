(function () {
  "use strict";

  customElements.define("html-include", class extends HTMLElement {
    constructor() {
      super();
      this.loadPromise = null;
    }

    connectedCallback() {
      if (!this.loadPromise) {
        this.loadPromise = this.load();
      }
    }

    async load() {
      var source = this.getAttribute("src");

      try {
        if (!source) {
          throw new Error("Missing src attribute");
        }

        var response = await fetch(source);
        if (!response.ok) {
          throw new Error("Request failed with status " + response.status);
        }

        var template = document.createElement("template");
        template.innerHTML = await response.text();
        this.replaceWith(template.content);
        return true;
      } catch (error) {
        this.setAttribute("data-include-error", "");
        console.error("Could not load HTML include " + (source || "(missing src)"), error);
        return false;
      }
    }
  });

  var includes = Array.prototype.slice.call(document.querySelectorAll("html-include"));
  Promise.all(includes.map(function (include) {
    return include.loadPromise;
  })).then(function (results) {
    var failed = results.filter(function (loaded) {
      return !loaded;
    }).length;

    document.dispatchEvent(new CustomEvent("site-includes-ready", {
      detail: { failed: failed }
    }));
  });
})();