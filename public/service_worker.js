//static files
const FILES_TO_CACHE = [
	"/",
	"/index.html",
	"/styles.css",
	"index.js",
	"/icons/icon-192x192.png",
	"/icons/icon-512x512.png",
	"/manifest.webmanifest",
	"/db.js",
];

//tables for cached data and server requested data
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

//adding all files post service worker registration and installation
self.addEventListener("install", function (event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("Your files were pre-cached successfully.");
			return cache.addAll(FILES_TO_CACHE);
		})
	);
	self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
	evt.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
						console.log("Removing old cache data", key);
						return caches.delete(key);
					}
				})
			);
		})
	);

	self.clients.claim();
});

// fetch call
self.addEventListener("fetch", function (evt) {
	//sucessful request to api
	if (evt.request.url.includes("/api/")) {
		evt.respondWith(
			caches
				.open(DATA_CACHE_NAME)
				.then((cache) => {
					console.log("cach is open");
					return fetch(evt.request)
						.then((response) => {
							console.log("response is good");
							//cache clone for successful responses
							if (response.status === 200) {
								console.log("adding to cache");
								cache.put(evt.request.url, response.clone());
							}

							return response;
						})
						.catch((err) => {
							//throws error
							return cache.match(evt.request);
						});
				})
				.catch((err) => console.log(err))
		);

		return;
	}

	evt.respondWith(
		caches.match(evt.request).then(function (response) {
			return response || fetch(evt.request);
		})
	);
});
