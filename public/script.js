// script.js

// Handle search form logic
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const background = document.querySelector(".background");

  // Mouse glow movement
  document.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    background.style.setProperty("--x", `${x}px`);
    background.style.setProperty("--y", `${y}px`);
  });

  // Form submit handling
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let query = input.value.trim();
    if (!query) return;

    // If it's a URL (contains a dot), prepend https:// if missing
    if (query.includes(".")) {
      if (!/^https?:\/\//i.test(query)) {
        query = "https://" + query;
      }
      window.location.href = `/proxy?url=${encodeURIComponent(query)}`;
    } else {
      // Otherwise, search with DuckDuckGo
      window.location.href = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;

    document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#search-form");
  const input = document.querySelector("#search-box");
  const quickLinks = document.querySelectorAll(".quicklink");

  // Search box: send query to DuckDuckGo through proxy
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    window.location.href = `/proxy?url=${encodeURIComponent(url)}`;
  });

  // Quick links: open proxied
  quickLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-url");
      window.location.href = `/proxy?url=${encodeURIComponent(target)}`;
    });
  });
});
