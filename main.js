// public/main.js
document.getElementById('goForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const url = document.getElementById('urlInput').value.trim();
  if (!url) return;
  // Build proxy URL
  const proxied = '/proxy?url=' + encodeURIComponent(url);
  // Load in iframe
  const viewer = document.getElementById('viewer');
  viewer.src = proxied;
});
