// pwa workbox
// var cachedAllowed = /.+\.(js|css|png|jpg|jpeg|php|ico|json|woff2)$/;
const cachedAllowedMedia = /&video|\/get_user/i;
const CACHE_NAME = 'v1';

self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') return;
    if (cachedAllowedMedia.test(event.request.url)) return;

    event.respondWith(
        caches.match(event.request.url).then(function (cachedResponse) {
            if (cachedResponse) return cachedResponse;

            if (navigator.onLine) {
                return caches.open(CACHE_NAME).then(function (cache) {
                    return fetch(event.request).then(function (response) {
                        return cache.put(event.request.url, response.clone()).then(function () {
                            return response;
                        });
                    })

                })
            }
        }),
    )
})
