document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");

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
      // Otherwise, treat it as a DuckDuckGo search
      window.location.href = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    }
  });
});
