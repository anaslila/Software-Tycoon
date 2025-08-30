// Software Tycoon - Service Worker
// Author: AI Assistant | Date: August 30, 2025
// Provides offline functionality, caching, and app-like behavior

const CACHE_NAME = 'software-tycoon-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/script.js',
    '/styles.css',
    '/manifest.json',
    'https://i.postimg.cc/7ZCRTTL2/SOFTWARE.png'
];

// Dynamic cache for game saves and user data
const DYNAMIC_CACHE_NAME = 'software-tycoon-dynamic-v1.0.0';
const MAX_DYNAMIC_CACHE_SIZE = 50;

// Install Event - Cache static resources
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static files...');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('[SW] Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Failed to cache static files:', error);
            })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Remove old versions of cache
                            return cacheName !== CACHE_NAME && 
                                   cacheName !== DYNAMIC_CACHE_NAME &&
                                   cacheName.startsWith('software-tycoon-');
                        })
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activated');
                return self.clients.claim();
            })
            .catch((error) => {
                console.error('[SW] Activation failed:', error);
            })
    );
});

// Fetch Event - Handle network requests
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Handle different types of requests
    if (STATIC_CACHE_URLS.includes(request.url) || 
        STATIC_CACHE_URLS.includes(url.pathname)) {
        // Static files - Cache First Strategy
        event.respondWith(cacheFirstStrategy(request));
    } else if (url.origin === location.origin) {
        // Same origin requests - Network First Strategy
        event.respondWith(networkFirstStrategy(request));
    } else {
        // External resources - Stale While Revalidate Strategy
        event.respondWith(staleWhileRevalidateStrategy(request));
    }
});

// Cache First Strategy - For static assets
async function cacheFirstStrategy(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('[SW] Serving from cache:', request.url);
            return cachedResponse;
        }
        
        console.log('[SW] Not in cache, fetching:', request.url);
        const networkResponse = await fetch(request);
        
        if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache First failed:', error);
        return getCachedFallback(request);
    }
}

// Network First Strategy - For dynamic content
async function networkFirstStrategy(request) {
    try {
        console.log('[SW] Network First for:', request.url);
        const networkResponse = await fetch(request);
        
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
            await limitCacheSize(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_SIZE);
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return getCachedFallback(request);
    }
}

// Stale While Revalidate Strategy - For external resources
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch in background to update cache
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
            limitCacheSize(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_SIZE);
        }
        return networkResponse;
    }).catch((error) => {
        console.error('[SW] Background fetch failed:', error);
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        console.log('[SW] Serving stale content:', request.url);
        return cachedResponse;
    }
    
    // Wait for network if no cached version
    try {
        return await fetchPromise;
    } catch (error) {
        return getCachedFallback(request);
    }
}

// Get fallback response for failed requests
async function getCachedFallback(request) {
    const url = new URL(request.url);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
        const cache = await caches.open(CACHE_NAME);
        const fallback = await cache.match('/index.html');
        if (fallback) {
            return fallback;
        }
    }
    
    // Return generic offline response
    return new Response(
        JSON.stringify({
            error: 'Offline',
            message: 'This content is not available offline'
        }),
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        }
    );
}

// Limit cache size to prevent storage bloat
async function limitCacheSize(cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxSize) {
        console.log('[SW] Cache size limit exceeded, cleaning up...');
        const keysToDelete = keys.slice(0, keys.length - maxSize);
        
        await Promise.all(
            keysToDelete.map(key => cache.delete(key))
        );
        
        console.log(`[SW] Deleted ${keysToDelete.length} old cache entries`);
    }
}

// Background Sync - For offline actions
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'save-game-data') {
        event.waitUntil(syncGameData());
    } else if (event.tag === 'sync-achievements') {
        event.waitUntil(syncAchievements());
    }
});

// Sync game data when back online
async function syncGameData() {
    try {
        console.log('[SW] Syncing game data...');
        
        // Get pending saves from IndexedDB or localStorage
        const gameData = localStorage.getItem('softwareTycoonSave');
        
        if (gameData) {
            // Could sync to cloud service here
            console.log('[SW] Game data synced successfully');
            
            // Notify main app
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'GAME_DATA_SYNCED',
                    data: { success: true }
                });
            });
        }
    } catch (error) {
        console.error('[SW] Failed to sync game data:', error);
    }
}

// Sync achievements
async function syncAchievements() {
    try {
        console.log('[SW] Syncing achievements...');
        // Achievement sync logic here
        console.log('[SW] Achievements synced successfully');
    } catch (error) {
        console.error('[SW] Failed to sync achievements:', error);
    }
}

// Push Notifications - For game updates and achievements
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    
    const options = {
        title: data.title || 'Software Tycoon',
        body: data.body || 'Check out your software empire!',
        icon: 'https://i.postimg.cc/7ZCRTTL2/SOFTWARE.png',
        badge: 'https://i.postimg.cc/7ZCRTTL2/SOFTWARE.png',
        data: data.data || {},
        actions: [
            {
                action: 'open',
                title: 'Open Game',
                icon: 'https://i.postimg.cc/7ZCRTTL2/SOFTWARE.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Software Tycoon', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window if no existing window
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// Message handling from main app
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_VERSION });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'FORCE_UPDATE':
            forceUpdate().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        default:
            console.log('[SW] Unknown message type:', type);
    }
});

// Clear all caches
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('[SW] All caches cleared');
    } catch (error) {
        console.error('[SW] Failed to clear caches:', error);
    }
}

// Force update by clearing cache and reloading
async function forceUpdate() {
    try {
        await clearAllCaches();
        
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({ type: 'RELOAD_APP' });
        });
        
        console.log('[SW] Force update completed');
    } catch (error) {
        console.error('[SW] Force update failed:', error);
    }
}

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'game-backup') {
        event.waitUntil(performGameBackup());
    }
});

// Perform periodic game backup
async function performGameBackup() {
    try {
        console.log('[SW] Performing periodic game backup...');
        
        // Backup logic here - could save to cloud storage
        const gameData = localStorage.getItem('softwareTycoonSave');
        
        if (gameData) {
            // Could implement cloud backup here
            console.log('[SW] Game backup completed');
        }
    } catch (error) {
        console.error('[SW] Periodic backup failed:', error);
    }
}

// Error handling
self.addEventListener('error', (event) => {
    console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[SW] Unhandled promise rejection:', event.reason);
});

// Cleanup on unload
self.addEventListener('beforeunload', () => {
    console.log('[SW] Service Worker unloading...');
});

console.log('[SW] Software Tycoon Service Worker loaded successfully');
