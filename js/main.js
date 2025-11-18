// Sistema principal de integración para backup
class SistemaBackupUI {
    constructor() {
        this.exportador = exportadorAvicola;
        this.modal = null;
        this.archivoSeleccionado = null;
        this.inicializado = false;
    }

    // Inicializar el sistema
    inicializar() {
        if (this.inicializado) return;
        
        this.crearModal();
        this.agregarEstilos();
        this.inicializarEventos();
        this.inicializado = true;
        
        console.log('Sistema de Backup UI inicializado');
    }

    // Crear modal de backup
    crearModal() {
        const modalHTML = `
            <div id="modalBackupAvicola" class="modal-backup">
                <div class="modal-backup-content">
                    <div class="modal-backup-header">
                        <div class="modal-backup-title">
                            <i class="fas fa-database"></i>
                            Sistema de Backup - Avícola
                        </div>
                        <button class="modal-backup-close">&times;</button>
                    </div>
                    <div class="modal-backup-body">
                        <div id="backupAlerts"></div>
                        
                        <!-- Resumen de Datos -->
                        <div class="backup-card">
                            <h3><i class="fas fa-chart-bar"></i> Resumen de Datos Actuales</h3>
                            <div id="resumenDatos" class="resumen-backup">
                                <!-- Resumen se cargará aquí -->
                            </div>
                            <button onclick="sistemaBackupUI.verificarIntegridad()" class="btn-backup btn-backup-info">
                                <i class="fas fa-shield-alt"></i> Verificar Integridad
                            </button>
                        </div>

                        <!-- Exportación -->
                        <div class="backup-card">
                            <h3><i class="fas fa-file-export"></i> Exportar Datos</h3>
                            <p>Exporta todos los datos del sistema a un archivo JSON seguro para backup.</p>
                            
                            <div class="export-options">
                                <div class="option-group">
                                    <input type="checkbox" id="comprimirExportacion">
                                    <label for="comprimirExportacion">Comprimir archivo (reduce tamaño)</label>
                                </div>
                                <div class="option-group">
                                    <input type="checkbox" id="incluirMetadata" checked>
                                    <label for="incluirMetadata">Incluir metadata de seguridad</label>
                                </div>
                            </div>
                            
                            <button onclick="sistemaBackupUI.exportarDatos()" class="btn-backup btn-backup-primary">
                                <i class="fas fa-download"></i> Descargar Backup Completo
                            </button>
                        </div>

                        <!-- Importación -->
                        <div class="backup-card">
                            <h3><i class="fas fa-file-import"></i> Importar Datos</h3>
                            <p>Restaura los datos del sistema desde un archivo JSON de backup.</p>
                            
                            <div class="warning-banner">
                                <i class="fas fa-exclamation-triangle"></i>
                                <div>
                                    <strong>¡Advertencia!</strong> Esta acción sobrescribirá todos los datos actuales.
                                    Se creará un backup automático antes de la importación.
                                </div>
                            </div>

                            <div class="file-input-container">
                                <input type="file" id="archivoBackup" accept=".json" style="display: none;">
                                <button onclick="document.getElementById('archivoBackup').click()" class="btn-backup btn-backup-warning">
                                    <i class="fas fa-folder-open"></i> Seleccionar Archivo
                                </button>
                                <span id="nombreArchivo" class="file-name">No se ha seleccionado ningún archivo</span>
                            </div>
                            
                            <button onclick="sistemaBackupUI.importarDatos()" id="btnImportar" class="btn-backup btn-backup-success" disabled>
                                <i class="fas fa-file-import"></i> Importar Datos
                            </button>
                        </div>

                        <!-- Herramientas Adicionales -->
                        <div class="backup-card">
                            <h3><i class="fas fa-tools"></i> Herramientas</h3>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <button onclick="sistemaBackupUI.generarReporte()" class="btn-backup btn-backup-info">
                                    <i class="fas fa-file-alt"></i> Generar Reporte
                                </button>
                                <button onclick="sistemaBackupUI.limpiarDatos()" class="btn-backup btn-backup-danger">
                                    <i class="fas fa-broom"></i> Limpiar Datos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('modalBackupAvicola');
    }

    // Agregar estilos dinámicamente
    agregarEstilos() {
        if (document.getElementById('backup-styles')) return;

        const link = document.createElement('link');
        link.id = 'backup-styles';
        link.rel = 'stylesheet';
        link.href = 'styles/backup.css';
        document.head.appendChild(link);
    }

    // Inicializar eventos
    inicializarEventos() {
        // Cerrar modal
        this.modal.querySelector('.modal-backup-close').addEventListener('click', () => {
            this.cerrarModal();
        });

        // Cerrar modal al hacer clic fuera
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.cerrarModal();
            }
        });

        // Manejar selección de archivo
        document.getElementById('archivoBackup').addEventListener('change', (e) => {
            this.manejarSeleccionArchivo(e);
        });

        // Tecla Escape para cerrar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.cerrarModal();
            }
        });
    }

    // Mostrar modal
    mostrarModal() {
        this.actualizarResumen();
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Cerrar modal
    cerrarModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.limpiarAlertas();
    }

    // Actualizar resumen de datos
    actualizarResumen() {
        const resumen = this.exportador.generarReporte();
        const contenedor = document.getElementById('resumenDatos');
        
        contenedor.innerHTML = `
            <div class="resumen-item">
                <span class="resumen-number">${resumen.transacciones}</span>
                <span class="resumen-label">Transacciones</span>
            </div>
            <div class="resumen-item">
                <span class="resumen-number">${resumen.produccion}</span>
                <span class="resumen-label">Producción</span>
            </div>
            <div class="resumen-item">
                <span class="resumen-number">${resumen.inventarioHistorial}</span>
                <span class="resumen-label">Inventario</span>
            </div>
            <div class="resumen-item">
                <span class="resumen-number">${resumen.clientes}</span>
                <span class="resumen-label">Clientes</span>
            </div>
            <div class="resumen-item">
                <span class="resumen-number">${resumen.totalGeneral}</span>
                <span class="resumen-label">Total</span>
            </div>
        `;
    }

    // Manejar selección de archivo
    manejarSeleccionArchivo(event) {
        const file = event.target.files[0];
        const fileNameElement = document.getElementById('nombreArchivo');
        const btnImportar = document.getElementById('btnImportar');
        
        if (file) {
            this.archivoSeleccionado = file;
            fileNameElement.textContent = file.name;
            fileNameElement.classList.add('has-file');
            btnImportar.disabled = false;
            
            this.mostrarAlerta(`Archivo seleccionado: ${file.name} (${this.formatearTamaño(file.size)})`, 'info');
        } else {
            this.archivoSeleccionado = null;
            fileNameElement.textContent = 'No se ha seleccionado ningún archivo';
            fileNameElement.classList.remove('has-file');
            btnImportar.disabled = true;
        }
    }

    // Exportar datos
    async exportarDatos() {
        const btnExportar = event.target;
        const comprimir = document.getElementById('comprimirExportacion').checked;
        
        btnExportar.classList.add('processing');
        btnExportar.innerHTML = '<i class="fas fa-spinner"></i> Exportando...';
        
        try {
            const resultado = this.exportador.exportarDatos(comprimir);
            
            if (resultado.success) {
                this.mostrarAlerta(
                    `✅ Backup exportado exitosamente: ${resultado.filename}<br>
                    <small>${resultado.registros} registros · ${this.formatearTamaño(resultado.size)}</small>`,
                    'success'
                );
            } else {
                throw new Error(resultado.error);
            }
        } catch (error) {
            this.mostrarAlerta(`❌ Error al exportar: ${error.message}`, 'error');
        } finally {
            btnExportar.classList.remove('processing');
            btnExportar.innerHTML = '<i class="fas fa-download"></i> Descargar Backup Completo';
        }
    }

    // Importar datos
    async importarDatos() {
        if (!this.archivoSeleccionado) {
            this.mostrarAlerta('❌ Por favor seleccione un archivo primero', 'error');
            return;
        }

        const btnImportar = document.getElementById('btnImportar');
        
        btnImportar.classList.add('processing');
        btnImportar.innerHTML = '<i class="fas fa-spinner"></i> Importando...';
        
        try {
            const contenido = await this.exportador.cargarArchivo({ target: { files: [this.archivoSeleccionado] } });
            const resultado = await this.exportador.importarDatos(contenido);
            
            if (resultado.success) {
                this.mostrarAlerta(
                    `✅ ${resultado.message}<br>
                    <small>Transacciones: ${resultado.resumen.transacciones} | 
                    Producción: ${resultado.resumen.produccion} | 
                    Inventario: ${resultado.resumen.inventario}</small>`,
                    'success'
                );
                
                // Limpiar selección
                this.archivoSeleccionado = null;
                document.getElementById('archivoBackup').value = '';
                document.getElementById('nombreArchivo').textContent = 'No se ha seleccionado ningún archivo';
                document.getElementById('nombreArchivo').classList.remove('has-file');
                btnImportar.disabled = true;
                
                // Actualizar resumen
                this.actualizarResumen();
                
                // Recargar página después de 2 segundos
                setTimeout(() => {
                    this.mostrarAlerta('🔄 Recargando página para aplicar cambios...', 'info');
                    setTimeout(() => location.reload(), 1000);
                }, 2000);
                
            } else {
                throw new Error(resultado.error);
            }
        } catch (error) {
            this.mostrarAlerta(`❌ Error al importar: ${error.message}`, 'error');
        } finally {
            btnImportar.classList.remove('processing');
            btnImportar.innerHTML = '<i class="fas fa-file-import"></i> Importar Datos';
        }
    }

    // Verificar integridad
    async verificarIntegridad() {
        const btnVerificar = event.target;
        
        btnVerificar.classList.add('processing');
        btnVerificar.innerHTML = '<i class="fas fa-spinner"></i> Verificando...';
        
        try {
            const resultado = this.exportador.verificarIntegridad();
            
            if (resultado.integridad) {
                this.mostrarAlerta(
                    `✅ Integridad verificada correctamente<br>
                    <small>${resultado.totalRegistros} registros sin problemas</small>`,
                    'success'
                );
            } else {
                this.mostrarAlerta(
                    `⚠️ Se encontraron ${resultado.totalProblemas} problema(s)<br>
                    <small>${resultado.problemas.slice(0, 3).join(', ')}${resultado.problemas.length > 3 ? '...' : ''}</small>`,
                    'warning'
                );
            }
        } catch (error) {
            this.mostrarAlerta(`❌ Error verificando integridad: ${error.message}`, 'error');
        } finally {
            btnVerificar.classList.remove('processing');
            btnVerificar.innerHTML = '<i class="fas fa-shield-alt"></i> Verificar Integridad';
        }
    }

    // Generar reporte
    generarReporte() {
        const reporte = this.exportador.generarReporte();
        
        const contenidoReporte = `
            📊 REPORTE DEL SISTEMA AVÍCOLA

            📈 DATOS REGISTRADOS:
            • Transacciones: ${reporte.transacciones}
            • Producción: ${reporte.produccion}
            • Inventario: ${reporte.inventarioHistorial} registros
            • Clientes: ${reporte.clientes}

            ⚙️ CONFIGURACIÓN:
            • Cuentas: ${reporte.cuentas}
            • Tipos: ${reporte.tipos}
            • Compradores: ${reporte.compradores}

            📋 TOTAL GENERAL: ${reporte.totalGeneral} registros
            💾 TAMAÑO APROXIMADO: ${this.formatearTamaño(reporte.tamañoAproximado)}
            🕐 ÚLTIMA ACTUALIZACIÓN: ${reporte.ultimaActualizacion}

            Generated by Sistema Avícola ${new Date().toLocaleDateString('es-ES')}
        `;
        
        const blob = new Blob([contenidoReporte], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-avicola-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.mostrarAlerta('✅ Reporte generado y descargado', 'success');
    }

    // Limpiar datos (con confirmación)
    limpiarDatos() {
        if (!confirm('¿ESTÁ SEGURO?\n\nEsta acción eliminará TODOS los datos del sistema.\nEsta operación NO se puede deshacer.\n\n¿Continuar?')) {
            return;
        }
        
        if (!confirm('ÚLTIMA CONFIRMACIÓN:\n\n¿Realmente desea eliminar todos los datos?\nEsta acción es PERMANENTE.')) {
            return;
        }
        
        const resultado = this.exportador.limpiarDatos();
        
        if (resultado.success) {
            this.mostrarAlerta('✅ Todos los datos han sido eliminados', 'success');
            this.actualizarResumen();
            
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    }

    // Mostrar alerta
    mostrarAlerta(mensaje, tipo = 'info') {
        const alertasContainer = document.getElementById('backupAlerts');
        const alerta = document.createElement('div');
        alerta.className = `backup-alert ${tipo}`;
        alerta.innerHTML = `
            <i class="fas fa-${this.obtenerIconoAlerta(tipo)}"></i>
            <div>${mensaje}</div>
        `;
        
        alertasContainer.appendChild(alerta);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.style.opacity = '0';
                alerta.style.transform = 'translateX(100%)';
                setTimeout(() => alerta.remove(), 300);
            }
        }, 5000);
    }

    // Limpiar alertas
    limpiarAlertas() {
        document.getElementById('backupAlerts').innerHTML = '';
    }

    // Obtener icono según tipo de alerta
    obtenerIconoAlerta(tipo) {
        const iconos = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return iconos[tipo] || 'info-circle';
    }

    // Formatear tamaño de archivo
    formatearTamaño(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Crear instancia global
const sistemaBackupUI = new SistemaBackupUI();

// Función global para abrir el modal de backup
function abrirBackupAvicola() {
    sistemaBackupUI.inicializar();
    sistemaBackupUI.mostrarModal();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Agregar botón de backup en cada página si existe el header
    const header = document.querySelector('header .header-content');
    if (header) {
        const botonBackup = document.createElement('button');
        botonBackup.innerHTML = '<i class="fas fa-database"></i> Backup';
        botonBackup.style.cssText = `
            background: var(--info);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        botonBackup.onclick = abrirBackupAvicola;
        
        header.appendChild(botonBackup);
    }
    
    console.log('Sistema de Backup Avícola cargado correctamente');
});