// Theme toggle -- instant switch before HTMX round-trip
document.addEventListener("htmx:beforeRequest", function (e) {
  var form = e.detail.elt;
  if (!form.classList || !form.classList.contains("theme-toggle")) return;

  var input = form.querySelector('input[name="theme"]');
  if (!input) return;

  var theme = input.value;
  var root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("theme-dark");
  } else {
    root.classList.remove("theme-dark");
  }

  localStorage.setItem("holler-theme", theme);

  // Flip the hidden input so the next click sends the opposite theme
  input.value = theme === "dark" ? "light" : "dark";

  // Update the form action and hx-post for the next toggle
  var next = input.value;
  form.setAttribute("action", "/_theme?theme=" + next);
  form.setAttribute("hx-post", "/_theme?theme=" + next);

  // Update the aria-label
  var btn = form.querySelector(".theme-switch");
  if (btn) btn.setAttribute("aria-label", "Switch to " + next + " mode");
});
