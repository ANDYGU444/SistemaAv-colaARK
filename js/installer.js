// Instalador PWA CORREGIDO - 100% funcional
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.installButton = null;
        
        this.init();
    }

    init() {
        console.log('🔧 Inicializando PWA Installer...');
        
        // Crear botón de instalación
        this.createInstallButton();
        
        // Escuchar eventos de instalación
        this.setupEventListeners();
        
        // Verificar si ya está instalada
        this.checkIfInstalled();
    }

    createInstallButton() {
        // Crear botón flotante
        this.installButton = document.createElement('button');
        this.installButton.id = 'pwaInstallBtn';
        this.installButton.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Instalar App</span>
        `;
        this.installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4a7b5d, #3a6a4a);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            cursor: pointer;
            z-index: 10000;
            display: none;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            animation: pulse 2s infinite;
        `;

        // Agregar estilos de animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 4px 20px rgba(74, 123, 93, 0.4); }
                50% { transform: scale(1.05); box-shadow: 0 6px 25px rgba(74, 123, 93, 0.6); }
                100% { transform: scale(1); box-shadow: 0 4px 20px rgba(74, 123, 93, 0.4); }
            }
            
            #pwaInstallBtn:hover {
                transform: scale(1.05) !important;
                box-shadow: 0 6px 25px rgba(74, 123, 93, 0.6) !important;
            }
        `;
        document.head.appendChild(style);

        this.installButton.addEventListener('click', () => this.installApp());
        document.body.appendChild(this.installButton);
    }

    setupEventListeners() {
        // Evento cuando el navegador quiere mostrar el prompt de instalación
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('🎯 beforeinstallprompt event fired!');
            e.preventDefault();
            this.deferredPrompt = e;
            
            // Mostrar el botón de instalación después de 3 segundos
            setTimeout(() => {
                this.showInstallButton();
            }, 3000);
        });

        // Evento cuando la app es instalada
        window.addEventListener('appinstalled', (evt) => {
            console.log('🎉 ¡App instalada correctamente!');
            this.isInstalled = true;
            this.hideInstallButton();
            this.hideInstallBanner();
        });
    }

    showInstallButton() {
        if (this.installButton && !this.isInstalled && this.deferredPrompt) {
            this.installButton.style.display = 'flex';
            console.log('📱 Mostrando botón de instalación');
        }
    }

    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
        }
    }

    showInstallBanner() {
        let banner = document.getElementById('installBanner');
        if (!banner && !this.isInstalled && this.deferredPrompt) {
            banner = document.createElement('div');
            banner.id = 'installBanner';
            banner.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0; font-size: 16px;">📱 Instalar App Avícola</h4>
                        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Obtén la mejor experiencia: funciona offline y más rápido</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="bannerInstallBtn" style="background: white; color: #4a7b5d; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 600; cursor: pointer;">
                            Instalar
                        </button>
                        <button onclick="pwaInstaller.hideInstallBanner()" style="background: transparent; color: white; border: 1px solid white; padding: 10px 20px; border-radius: 20px; cursor: pointer;">
                            Ahora No
                        </button>
                    </div>
                </div>
            `;
            banner.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #4a7b5d, #3a6a4a);
                color: white;
                padding: 15px 20px;
                z-index: 9999;
                box-shadow: 0 -2px 20px rgba(0,0,0,0.3);
                animation: slideUp 0.5s ease-out;
            `;

            document.head.insertAdjacentHTML('beforeend', `
                <style>
                    @keyframes slideUp {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                    @keyframes slideDown {
                        from { transform: translateY(0); }
                        to { transform: translateY(100%); }
                    }
                </style>
            `);

            document.body.appendChild(banner);

            // Agregar evento al botón de instalación del banner
            document.getElementById('bannerInstallBtn').addEventListener('click', () => this.installApp());
        }
    }

    hideInstallBanner() {
        const banner = document.getElementById('installBanner');
        if (banner) {
            banner.style.animation = 'slideDown 0.5s ease-out';
            setTimeout(() => banner.remove(), 500);
        }
    }

    async installApp() {
        console.log('🔄 Intentando instalar la app...');
        
        if (!this.deferredPrompt) {
            console.log('❌ No hay prompt de instalación disponible');
            this.showManualInstructions();
            return;
        }

        try {
            // Mostrar el prompt de instalación
            this.deferredPrompt.prompt();
            console.log('📢 Prompt de instalación mostrado');

            // Esperar a que el usuario responda
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`✅ Usuario ${outcome} la instalación`);

            if (outcome === 'accepted') {
                console.log('🎉 Usuario aceptó la instalación');
                this.isInstalled = true;
                this.hideInstallButton();
                this.hideInstallBanner();
            } else {
                console.log('❌ Usuario rechazó la instalación');
            }

            // Limpiar la referencia
            this.deferredPrompt = null;

        } catch (error) {
            console.error('💥 Error durante la instalación:', error);
            this.showManualInstructions();
        }
    }

    showManualInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        let instructions = '';
        
        if (isIOS) {
            instructions = `
                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <h4 style="margin-top: 0; color: #4a7b5d;">📱 Para instalar en iPhone/iPad:</h4>
                    <ol style="margin-bottom: 0;">
                        <li>Toca el botón <strong>compartir</strong> 📤 (en la barra inferior)</li>
                        <li>Desplaza hacia abajo y selecciona <strong>"Agregar a pantalla de inicio"</strong></li>
                        <li>Toca <strong>"Agregar"</strong> en la esquina superior derecha</li>
                    </ol>
                </div>
            `;
        } else if (isAndroid) {
            instructions = `
                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <h4 style="margin-top: 0; color: #4a7b5d;">📱 Para instalar en Android:</h4>
                    <ol style="margin-bottom: 0;">
                        <li>Toca el menú <strong>(⋮)</strong> en Chrome (esquina superior derecha)</li>
                        <li>Selecciona <strong>"Agregar a la pantalla de inicio"</strong></li>
                        <li>Confirma tocando <strong>"Agregar"</strong></li>
                    </ol>
                </div>
            `;
        } else {
            instructions = `
                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <h4 style="margin-top: 0; color: #4a7b5d;">💻 Para instalar en Computadora:</h4>
                    <ol style="margin-bottom: 0;">
                        <li>Haz clic en el botón <strong>"Instalar"</strong> en la barra de direcciones</li>
                        <li>O ve a <strong>Configuración → Más herramientas → Crear acceso directo</strong></li>
                    </ol>
                </div>
            `;
        }
        
        this.showMessage('Cómo Instalar la App', instructions);
    }

    showSuccessMessage() {
        this.showMessage(
            '¡App Instalada! 🎉', 
            'La aplicación se ha instalado correctamente. Ahora puedes abrirla desde tu pantalla de inicio.'
        );
    }

    showMessage(title, content) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 25px; border-radius: 12px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #4a7b5d;">${title}</h3>
                    <button onclick="this.closest('.pwa-modal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
                </div>
                <div>${content}</div>
                <button onclick="this.closest('.pwa-modal').remove()" style="background: #4a7b5d; color: white; border: none; padding: 12px 24px; border-radius: 6px; margin-top: 20px; width: 100%; cursor: pointer; font-size: 16px;">
                    Entendido
                </button>
            </div>
        `;
        
        modal.className = 'pwa-modal';
        document.body.appendChild(modal);
    }

    checkIfInstalled() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('✅ La app ya está instalada');
            this.isInstalled = true;
            this.hideInstallButton();
            this.hideInstallBanner();
            return true;
        }
        return false;
    }
}

// Inicializar el instalador cuando la página cargue
let pwaInstaller;

document.addEventListener('DOMContentLoaded', function() {
    pwaInstaller = new PWAInstaller();
    console.log('🚀 PWA Installer inicializado');
    
    // Mostrar banner después de 5 segundos si hay prompt disponible
    setTimeout(() => {
        if (pwaInstaller.deferredPrompt && !pwaInstaller.isInstalled) {
            pwaInstaller.showInstallBanner();
        }
    }, 5000);
});

// Hacer disponible globalmente
window.pwaInstaller = pwaInstaller;