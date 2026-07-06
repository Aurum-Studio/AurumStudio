const CACHE_NAME = "aurum-studio-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/favicon.svg",
  "/src/main.jsx",
  "/src/App.jsx",
  "/src/index.css"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
