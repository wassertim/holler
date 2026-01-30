// Theme toggle -- instant switch before HTMX round-trip
document.addEventListener("htmx:beforeRequest", function (e) {
  var form = e.detail.elt;
  if (!form.classList || !form.classList.contains("theme-toggle")) return;

  window.__themeToggling = true;

  var input = form.querySelector('input[name="theme"]');
  if (!input) return;

  var theme = input.value;
  var root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("theme-dark");
    form.classList.add("is-dark");
  } else {
    root.classList.remove("theme-dark");
    form.classList.remove("is-dark");
  }

  localStorage.setItem("holler-theme", theme);
});

// Re-focus toggle button after HTMX swaps the element
document.addEventListener("htmx:afterSettle", function () {
  if (!window.__themeToggling) return;
  window.__themeToggling = false;

  var btn = document.querySelector(".theme-switch");
  if (btn) btn.focus();
});
