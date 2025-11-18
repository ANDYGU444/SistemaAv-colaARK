// Funcionalidades específicas para la app móvil
class MobileApp {
    constructor() {
        this.isInstalled = false;
        this.isOnline = true;
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        this.detectInstallPrompt();
        this.setupOfflineDetection();
        this.setupMobileGestures();
        this.setupPerformanceOptimizations();
        this.setupBackButton();
    }

    // Detectar si se puede instalar la PWA
    detectInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallPrompt();
            console.log('App instalada correctamente');
        });
    }

    // Mostrar prompt de instalación
    showInstallPrompt() {
        // Crear banner de instalación
        const installBanner = document.createElement('div');
        installBanner.id = 'installBanner';
        installBanner.innerHTML = `
            <div style="position: fixed; bottom: 0; left: 0; right: 0; background: var(--primary); color: white; padding: 1rem; text-align: center; z-index: 1000;">
                <p style="margin: 0 0 0.5rem 0;">📱 Instalar App Avícola</p>
                <button onclick="mobileApp.installApp()" style="background: white; color: var(--primary); border: none; padding: 0.5rem 1rem; border-radius: 4px; margin-right: 0.5rem;">
                    Instalar
                </button>
                <button onclick="mobileApp.hideInstallPrompt()" style="background: transparent; color: white; border: 1px solid white; padding: 0.5rem 1rem; border-radius: 4px;">
                    Ahora no
                </button>
            </div>
        `;
        document.body.appendChild(installBanner);
    }

    hideInstallPrompt() {
        const banner = document.getElementById('installBanner');
        if (banner) {
            banner.remove();
        }
    }

    // Instalar la app
    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('Usuario aceptó instalar la app');
            }
            
            this.deferredPrompt = null;
            this.hideInstallPrompt();
        }
    }

    // Detectar estado de conexión
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineIndicator();
            console.log('Conectado a internet');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineIndicator();
            console.log('Sin conexión a internet');
        });
    }

    showOfflineIndicator() {
        let indicator = document.getElementById('offlineIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offlineIndicator';
            indicator.className = 'offline-indicator';
            indicator.textContent = '⚠️ Sin conexión - Modo offline';
            document.body.appendChild(indicator);
        }
        indicator.classList.add('show');
    }

    hideOfflineIndicator() {
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) {
            indicator.classList.remove('show');
        }
    }

    // Configurar gestos móviles
    setupMobileGestures() {
        let startY;
        const header = document.querySelector('header');

        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchmove', (e) => {
            if (!startY) return;

            const currentY = e.touches[0].clientY;
            const diff = startY - currentY;

            // Ocultar/mostrar header basado en scroll
            if (diff > 50) {
                // Scrolling hacia arriba - ocultar header
                header.style.transform = 'translateY(-100%)';
            } else if (diff < -50) {
                // Scrolling hacia abajo - mostrar header
                header.style.transform = 'translateY(0)';
            }
        });

        document.addEventListener('touchend', () => {
            startY = null;
        });
    }

    // Optimizaciones de rendimiento
    setupPerformanceOptimizations() {
        // Lazy loading para imágenes
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));

        // Preconectar a CDNs importantes
        const preconnectLinks = [
            'https://cdnjs.cloudflare.com/ajax/libs'
        ];

        preconnectLinks.forEach(link => {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = link;
            document.head.appendChild(preconnect);
        });
    }

    // Manejar botón back de Android
    setupBackButton() {
        let backButtonPressed = false;

        document.addEventListener('backbutton', (e) => {
            if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
                e.preventDefault();
                window.history.back();
            } else {
                // En página principal, mostrar confirmación para salir
                if (!backButtonPressed) {
                    backButtonPressed = true;
                    this.showToast('Presiona de nuevo para salir');
                    
                    setTimeout(() => {
                        backButtonPressed = false;
                    }, 2000);
                } else {
                    navigator.app.exitApp();
                }
            }
        }, false);
    }

    // Mostrar toast messages
    showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 10000;
            font-size: 14px;
            max-width: 80%;
            text-align: center;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    // Vibrar (si el dispositivo lo soporta)
    vibrate(pattern = 200) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // Compartir contenido
    async shareContent(title, text, url) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                    url: url
                });
            } catch (error) {
                console.log('Error compartiendo:', error);
            }
        } else {
            // Fallback para navegadores que no soportan Web Share API
            this.showToast('La función de compartir no está disponible');
        }
    }

    // Obtener información del dispositivo
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            maxTouchPoints: navigator.maxTouchPoints,
            memory: navigator.deviceMemory,
            cores: navigator.hardwareConcurrency,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };
    }
}

// Inicializar la app móvil
const mobileApp = new MobileApp();

// Funciones globales para acceso desde HTML
window.installApp = () => mobileApp.installApp();
window.shareApp = () => mobileApp.shareContent(
    'Sistema Avícola',
    'Mira esta app para gestionar granjas avícolas',
    window.location.href
);