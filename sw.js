// Software Tycoon v2.1.0 - Enhanced Service Worker
// Developer: AL Software Studio | Last Updated: 30 August, 2025
// 🚀 Modern PWA with offline gaming, background sync, and push notifications

const CACHE_NAME = 'software-tycoon-v2.1.0';
const OFFLINE_URL = './offline.html';
const FALLBACK_IMAGE = 'https://i.postimg.cc/7ZCRTTL2/SOFTWARE.png';

// Cache configuration with versioning
const CACHE_CONFIG = {
    version: '2.1.0',
    staticCacheName: `${CACHE_NAME}-static`,
    dynamicCacheName: `${CACHE_NAME}-dynamic`,
    gameDataCacheName: `${CACHE_NAME}-gamedata`,
    imageCacheName: `${CACHE_NAME}-images`
};

// Assets to cache for offline functionality
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './offline.html',
    
    // External resources
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Mono:wght@400;500;700&display=swap',
    'https://i.postimg.cc/7ZCRTTL2/SOFTWARE.png',
    
    // Font files (will be cached dynamically)
    'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
    'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2',
    'https://fonts.gstatic.com/s/robotomono/v22/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW-AJi8SJQt.woff2'
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
    static: 'cache-first',           // HTML, CSS, JS, Images
    api: 'network-first',            // API calls, dynamic data
    fonts: 'cache-first',            // Font files
    images: 'cache-first',           // Game assets, logos
    gameData: 'cache-first'          // Save files, game state
};

// Network timeout settings
const NETWORK_TIMEOUT = 5000;

// ===============================
// SERVICE WORKER INSTALLATION
// ===============================

self.addEventListener('install', event => {
    console.log('🚀 Software Tycoon v2.1.0 Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            // Pre-cache static assets
            caches.open(CACHE_CONFIG.staticCacheName)
                .then(cache => {
                    console.log('📦 Pre-caching static assets...');
                    return cache.addAll(STATIC_ASSETS);
                })
                .catch(error => {
                    console.error('❌ Failed to cache static assets:', error);
                    // Don't fail installation if some assets can't be cached
                    return Promise.resolve();
                }),
            
            // Initialize other caches
            caches.open(CACHE_CONFIG.dynamicCacheName),
            caches.open(CACHE_CONFIG.gameDataCacheName),
            caches.open(CACHE_CONFIG.imageCacheName),
            
            // Skip waiting to activate immediately
            self.skipWaiting()
        ])
    );
});

// ===============================
// SERVICE WORKER ACTIVATION
// ===============================

self.addEventListener('activate', event => {
    console.log('⚡ Software Tycoon v2.1.0 Service Worker activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            cleanupOldCaches(),
            
            // Take control of all pages
            self.clients.claim(),
            
            // Initialize background sync
            registerBackgroundSync(),
            
            // Set up periodic sync if available
            registerPeriodicSync()
        ])
    );
});

// ===============================
// CACHE MANAGEMENT
// ===============================

async function cleanupOldCaches() {
    try {
        const cacheNames = await caches.keys();
        const currentCaches = Object.values(CACHE_CONFIG);
        
        const deletionPromises = cacheNames.map(cacheName => {
            if (!currentCaches.includes(cacheName) && cacheName.startsWith('software-tycoon-')) {
                console.log('🗑️ Deleting old cache:', cacheName);
                return caches.delete(cacheName);
            }
        }).filter(Boolean);
        
        await Promise.all(deletionPromises);
        console.log('✅ Cache cleanup completed');
    } catch (error) {
        console.error('❌ Cache cleanup failed:', error);
    }
}

// ===============================
// FETCH HANDLER WITH SMART CACHING
// ===============================

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests and non-HTTP(S) protocols
    if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
        return;
    }
    
    // Skip Chrome extension requests
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
        return;
    }
    
    event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Determine caching strategy based on request type
        if (isStaticAsset(url)) {
            return await cacheFirstStrategy(request, CACHE_CONFIG.staticCacheName);
        }
        
        if (isFontRequest(url)) {
            return await cacheFirstStrategy(request, CACHE_CONFIG.staticCacheName);
        }
        
        if (isImageRequest(request)) {
            return await cacheFirstStrategy(request, CACHE_CONFIG.imageCacheName);
        }
        
        if (isGameDataRequest(url)) {
            return await cacheFirstStrategy(request, CACHE_CONFIG.gameDataCacheName);
        }
        
        if (isNavigationRequest(request)) {
            return await networkFirstWithOfflineStrategy(request);
        }
        
        if (isAPIRequest(url)) {
            return await networkFirstStrategy(request, CACHE_CONFIG.dynamicCacheName);
        }
        
        // Default: Network first with dynamic caching
        return await networkFirstStrategy(request, CACHE_CONFIG.dynamicCacheName);
        
    } catch (error) {
        console.error('🚨 Request handling error:', error);
        return await getOfflineFallback(request);
    }
}

// ===============================
// CACHING STRATEGIES
// ===============================

async function cacheFirstStrategy(request, cacheName) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Update cache in background for future requests
            updateCacheInBackground(request, cacheName);
            return cachedResponse;
        }
        
        // Fallback to network
        return await fetchAndCache(request, cacheName);
    } catch (error) {
        console.error('Cache-first strategy failed:', error);
        throw error;
    }
}

async function networkFirstStrategy(request, cacheName, timeout = NETWORK_TIMEOUT) {
    try {
        // Try network first with timeout
        const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Network timeout')), timeout)
            )
        ]);
        
        if (networkResponse.ok) {
            // Cache successful response
            await cacheResponse(request, networkResponse.clone(), cacheName);
        }
        
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('📱 Serving from cache (network failed):', request.url);
            return cachedResponse;
        }
        throw error;
    }
}

async function networkFirstWithOfflineStrategy(request) {
    try {
        const networkResponse = await networkFirstStrategy(request, CACHE_CONFIG.dynamicCacheName);
        return networkResponse;
    } catch (error) {
        // Return offline page for navigation requests
        console.log('📴 Serving offline page for:', request.url);
        const offlineResponse = await caches.match(OFFLINE_URL);
        if (offlineResponse) {
            return offlineResponse;
        }
        
        // Final fallback
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Software Tycoon - Offline</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { 
                        font-family: 'Roboto', sans-serif; 
                        background: #0a0a0a; 
                        color: white; 
                        text-align: center; 
                        padding: 2rem;
                        margin: 0;
                    }
                    h1 { color: #e94560; }
                    .offline-icon { font-size: 4rem; margin: 2rem 0; }
                </style>
            </head>
            <body>
                <div class="offline-icon">📱</div>
                <h1>Software Tycoon - Offline Mode</h1>
                <p>You're currently offline, but your game data is safe!</p>
                <p>Reconnect to the internet to sync your progress.</p>
                <button onclick="window.location.reload()">Try Again</button>
            </body>
            </html>
        `, {
            status: 200,
            statusText: 'OK',
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// ===============================
// CACHE UTILITIES
// ===============================

async function fetchAndCache(request, cacheName) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            await cacheResponse(request, response.clone(), cacheName);
        }
        
        return response;
    } catch (error) {
        console.error('Fetch and cache failed:', error);
        throw error;
    }
}

async function cacheResponse(request, response, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        await cache.put(request, response);
    } catch (error) {
        console.error('Failed to cache response:', error);
        // Don't throw - caching failure shouldn't break the request
    }
}

async function updateCacheInBackground(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            await cacheResponse(request, response, cacheName);
        }
    } catch (error) {
        // Silent fail for background updates
        console.warn('Background cache update failed:', error);
    }
}

async function getOfflineFallback(request) {
    if (isImageRequest(request)) {
        const fallbackImage = await caches.match(FALLBACK_IMAGE);
        if (fallbackImage) {
            return fallbackImage;
        }
        
        // Return a minimal SVG placeholder
        return new Response(`
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                <rect width="200" height="200" fill="#0a0a0a"/>
                <text x="100" y="100" text-anchor="middle" fill="#e94560" font-family="Arial" font-size="24">🚀</text>
                <text x="100" y="130" text-anchor="middle" fill="#00d4ff" font-family="Arial" font-size="12">Offline</text>
            </svg>
        `, { headers: { 'Content-Type': 'image/svg+xml' } });
    }
    
    if (isNavigationRequest(request)) {
        return await caches.match(OFFLINE_URL) || 
               await caches.match('./index.html');
    }
    
    return new Response('Offline - Software Tycoon', { 
        status: 503, 
        statusText: 'Service Unavailable' 
    });
}

// ===============================
// REQUEST TYPE DETECTION
// ===============================

function isStaticAsset(url) {
    const staticExtensions = ['.html', '.css', '.js', '.json', '.ico', '.webmanifest'];
    return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
           url.pathname === '/' ||
           url.pathname === './';
}

function isFontRequest(url) {
    return url.hostname.includes('fonts.g') ||
           url.pathname.includes('.woff') ||
           url.pathname.includes('.woff2') ||
           url.pathname.includes('.ttf') ||
           url.pathname.includes('roboto');
}

function isImageRequest(request) {
    return request.destination === 'image' ||
           request.url.includes('.png') ||
           request.url.includes('.jpg') ||
           request.url.includes('.jpeg') ||
           request.url.includes('.gif') ||
           request.url.includes('.svg') ||
           request.url.includes('.webp');
}

function isGameDataRequest(url) {
    return url.pathname.includes('gamedata') ||
           url.pathname.includes('save') ||
           url.pathname.includes('settings') ||
           url.searchParams.has('game') ||
           url.searchParams.has('save');
}

function isNavigationRequest(request) {
    return request.mode === 'navigate';
}

function isAPIRequest(url) {
    return url.pathname.includes('/api/') ||
           url.pathname.includes('.json') ||
           (url.hostname !== self.location.hostname && 
            !url.hostname.includes('fonts.') && 
            !url.hostname.includes('postimg.cc'));
}

// ===============================
// BACKGROUND SYNC
// ===============================

async function registerBackgroundSync() {
    try {
        if ('sync' in self.registration) {
            await self.registration.sync.register('background-sync');
            console.log('✅ Background sync registered');
        }
    } catch (error) {
        console.warn('⚠️ Background sync registration failed:', error);
    }
}

self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(syncGameData());
    }
    
    if (event.tag === 'game-save-sync') {
        event.waitUntil(syncGameSaves());
    }
});

async function syncGameData() {
    try {
        console.log('🎮 Syncing game data in background...');
        
        // Get pending game data from IndexedDB or localStorage
        const pendingData = await getPendingGameData();
        
        if (pendingData && pendingData.length > 0) {
            // Process each pending item
            for (const data of pendingData) {
                await processPendingGameData(data);
            }
            
            // Clear processed data
            await clearPendingGameData();
            
            console.log('✅ Game data sync completed');
        }
    } catch (error) {
        console.error('❌ Background game sync failed:', error);
    }
}

async function syncGameSaves() {
    try {
        console.log('💾 Syncing game saves...');
        // Implement game save synchronization logic
        // This could sync with cloud storage or backup servers
    } catch (error) {
        console.error('❌ Game save sync failed:', error);
    }
}

// ===============================
// PERIODIC BACKGROUND SYNC
// ===============================

async function registerPeriodicSync() {
    try {
        if ('periodicSync' in self.registration) {
            await self.registration.periodicSync.register('game-stats-sync', {
                minInterval: 24 * 60 * 60 * 1000, // 24 hours
            });
            console.log('✅ Periodic sync registered');
        }
    } catch (error) {
        console.warn('⚠️ Periodic sync registration failed:', error);
    }
}

self.addEventListener('periodicsync', event => {
    console.log('⏰ Periodic sync triggered:', event.tag);
    
    if (event.tag === 'game-stats-sync') {
        event.waitUntil(syncGameStats());
    }
});

async function syncGameStats() {
    try {
        console.log('📊 Syncing game statistics...');
        // Implement periodic game stats synchronization
        // This could update leaderboards, achievements, etc.
    } catch (error) {
        console.error('❌ Periodic stats sync failed:', error);
    }
}

// ===============================
// PUSH NOTIFICATIONS
// ===============================

self.addEventListener('push', event => {
    console.log('📱 Push notification received');
    
    const options = {
        body: 'Your software company needs attention!',
        icon: FALLBACK_IMAGE,
        badge: FALLBACK_IMAGE,
        vibrate: [200, 100, 200],
        tag: 'software-tycoon',
        requireInteraction: false,
        silent: false,
        actions: [
            {
                action: 'open-game',
                title: 'Open Game',
                icon: FALLBACK_IMAGE
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        data: {
            url: './',
            timestamp: Date.now(),
            gameVersion: CACHE_CONFIG.version
        }
    };
    
    let title = 'Software Tycoon';
    let body = options.body;
    
    // Parse push payload if available
    if (event.data) {
        try {
            const payload = event.data.json();
            title = payload.title || title;
            body = payload.body || body;
            
            // Gaming-specific notification types
            if (payload.type === 'project-complete') {
                body = `🎉 Project "${payload.project}" completed! Earned $${payload.revenue}`;
                options.requireInteraction = true;
            } else if (payload.type === 'achievement') {
                body = `🏆 Achievement unlocked: ${payload.achievement}`;
                options.requireInteraction = true;
            } else if (payload.type === 'market-event') {
                body = `📈 Market update: ${payload.message}`;
            } else if (payload.type === 'milestone') {
                body = `🎯 Milestone reached: ${payload.milestone}`;
                options.requireInteraction = true;
            }
        } catch (error) {
            console.error('Failed to parse push payload:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(title, {
            ...options,
            body: body
        })
    );
});

self.addEventListener('notificationclick', event => {
    console.log('🎯 Notification clicked:', event.action);
    
    event.notification.close();
    
    const action = event.action;
    const notificationData = event.notification.data || {};
    
    if (action === 'open-game' || !action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                // Check if game is already open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window if game not open
                if (clients.openWindow) {
                    return clients.openWindow(notificationData.url || './');
                }
            })
        );
    }
    // 'dismiss' action doesn't need handling - notification is already closed
});

// ===============================
// MESSAGE HANDLING
// ===============================

self.addEventListener('message', event => {
    const { type, data } = event.data || {};
    
    console.log('📨 Message received:', type);
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            if (event.ports && event.ports[0]) {
                event.ports[0].postMessage({ 
                    version: CACHE_CONFIG.version,
                    caches: Object.keys(CACHE_CONFIG)
                });
            }
            break;
            
        case 'CACHE_GAME_DATA':
            event.waitUntil(cacheGameData(data));
            break;
            
        case 'SYNC_REQUEST':
            event.waitUntil(
                self.registration.sync?.register(data.tag || 'background-sync')
            );
            break;
            
        case 'CLEAR_CACHE':
            event.waitUntil(clearSpecificCache(data.cacheName));
            break;
            
        case 'GET_CACHE_SIZE':
            event.waitUntil(getCacheSize().then(size => {
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ cacheSize: size });
                }
            }));
            break;
            
        default:
            console.log('📨 Unknown message type:', type);
    }
});

// ===============================
// GAME-SPECIFIC HELPER FUNCTIONS
// ===============================

async function cacheGameData(data) {
    try {
        const cache = await caches.open(CACHE_CONFIG.gameDataCacheName);
        const response = new Response(JSON.stringify(data), {
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'max-age=86400' // 24 hours
            }
        });
        await cache.put('/cached-game-data', response);
        console.log('✅ Game data cached successfully');
    } catch (error) {
        console.error('❌ Failed to cache game data:', error);
    }
}

async function getPendingGameData() {
    // This would typically interact with IndexedDB
    // For now, return empty array
    return [];
}

async function processPendingGameData(data) {
    // Process individual pending game data items
    console.log('Processing pending game data:', data);
}

async function clearPendingGameData() {
    // Clear processed pending data
    console.log('Clearing pending game data');
}

async function clearSpecificCache(cacheName) {
    try {
        if (cacheName && await caches.has(cacheName)) {
            await caches.delete(cacheName);
            console.log('✅ Cache cleared:', cacheName);
        }
    } catch (error) {
        console.error('❌ Failed to clear cache:', error);
    }
}

async function getCacheSize() {
    try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const cacheName of cacheNames) {
            if (cacheName.startsWith('software-tycoon-')) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                
                for (const request of keys) {
                    const response = await cache.match(request);
                    if (response) {
                        const blob = await response.blob();
                        totalSize += blob.size;
                    }
                }
            }
        }
        
        return totalSize;
    } catch (error) {
        console.error('❌ Failed to calculate cache size:', error);
        return 0;
    }
}

// ===============================
// ERROR HANDLING
// ===============================

self.addEventListener('error', event => {
    console.error('🚨 Service Worker error:', event.error);
    
    // Report error to analytics service if available
    if (self.ga) {
        self.ga('send', 'exception', {
            exDescription: event.error.message,
            exFatal: false
        });
    }
});

self.addEventListener('unhandledrejection', event => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
    
    // Prevent the default browser behavior
    event.preventDefault();
});

// ===============================
// INSTALLATION & UPDATE HANDLING
// ===============================

self.addEventListener('install', event => {
    // Show install progress to user if possible
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'SW_INSTALL_PROGRESS',
                progress: 0
            });
        });
    });
});

// Notify clients about updates
self.addEventListener('activate', event => {
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'SW_ACTIVATED',
                version: CACHE_CONFIG.version
            });
        });
    });
});

// ===============================
// SERVICE WORKER READY
// ===============================

console.log('✅ Software Tycoon v2.1.0 Service Worker loaded successfully!');
console.log('🎮 Features: Offline Gaming, Background Sync, Push Notifications, Smart Caching');
console.log('🚀 Cache Strategy: Static (cache-first), Dynamic (network-first), Game Data (cache-first)');
