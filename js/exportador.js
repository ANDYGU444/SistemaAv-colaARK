// Sistema de Exportación/Importación Segura para Sistema Avícola
class ExportadorAvicola {
    constructor() {
        this.version = "2.0";
        this.sistema = "Sistema Avícola";
        this.encryptionKey = "avicola-seguro-2025";
    }

    // Generar hash de seguridad único
    generarHashSeguro() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const dataHash = btoa(timestamp + '-' + random + '-' + this.encryptionKey);
        return dataHash.substring(0, 32); // Limitar a 32 caracteres
    }

    // Sanitizar datos (remover información sensible si fuera necesario)
    sanitizarDatos(datos) {
        try {
            const datosLimpios = JSON.parse(JSON.stringify(datos));
            
            // Aquí puedes agregar lógica para sanitizar datos específicos
            // Por ejemplo, remover campos sensibles, encriptar información crítica, etc.
            
            return datosLimpios;
        } catch (error) {
            console.error('Error sanitizando datos:', error);
            return datos;
        }
    }

    // Obtener todos los datos del sistema
    obtenerTodosLosDatos() {
        try {
            const datosCompletos = {
                metadata: {
                    version: this.version,
                    sistema: this.sistema,
                    fechaExportacion: new Date().toISOString(),
                    secureHash: this.generarHashSeguro(),
                    totalRegistros: 0
                },
                transacciones: {
                    datos: JSON.parse(localStorage.getItem('transactions')) || [],
                    total: 0
                },
                produccion: {
                    datos: JSON.parse(localStorage.getItem('productionData')) || [],
                    total: 0
                },
                inventario: {
                    actual: JSON.parse(localStorage.getItem('inventoryData')) || [],
                    historial: JSON.parse(localStorage.getItem('inventoryHistory')) || [],
                    totalActual: 0,
                    totalHistorial: 0
                },
                opciones: JSON.parse(localStorage.getItem('transactionOptions')) || {
                    accounts: ['veterinaria', 'alimentacion', 'equipos', 'ventas', 'infraestructura', 'otros'],
                    types: ['ingreso', 'gasto'],
                    customers: ['Prima', 'Randall P', 'Luz H', 'Supermercado Local']
                },
                compradores: JSON.parse(localStorage.getItem('buyersData')) || []
            };

            // Calcular totales
            datosCompletos.transacciones.total = datosCompletos.transacciones.datos.length;
            datosCompletos.produccion.total = datosCompletos.produccion.datos.length;
            datosCompletos.inventario.totalActual = datosCompletos.inventario.actual.length;
            datosCompletos.inventario.totalHistorial = datosCompletos.inventario.historial.length;
            
            datosCompletos.metadata.totalRegistros = 
                datosCompletos.transacciones.total + 
                datosCompletos.produccion.total + 
                datosCompletos.inventario.totalHistorial;

            return this.sanitizarDatos(datosCompletos);
        } catch (error) {
            console.error('Error obteniendo datos:', error);
            throw new Error('No se pudieron cargar los datos del sistema');
        }
    }

    // Exportar datos a JSON
    exportarDatos(comprimir = false) {
        try {
            console.log('Iniciando exportación de datos...');
            
            const datosCompletos = this.obtenerTodosLosDatos();
            const contenidoJSON = JSON.stringify(datosCompletos, null, comprimir ? 0 : 2);
            
            // Crear blob y URL para descarga
            const blob = new Blob([contenidoJSON], { 
                type: 'application/json;charset=utf-8' 
            });
            
            const url = URL.createObjectURL(blob);
            const fecha = new Date().toISOString().split('T')[0];
            const filename = `backup-avicola-${fecha}.json`;
            
            // Descargar archivo
            this.descargarArchivo(url, filename);
            
            // Liberar memoria
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            console.log('Exportación completada exitosamente');
            return {
                success: true,
                filename: filename,
                size: blob.size,
                registros: datosCompletos.metadata.totalRegistros,
                timestamp: datosCompletos.metadata.fechaExportacion
            };
            
        } catch (error) {
            console.error('Error en exportación:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Método para descargar archivo
    descargarArchivo(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Validar archivo de importación
    validarArchivoImportado(datos) {
        // Verificar estructura básica
        if (!datos || typeof datos !== 'object') {
            throw new Error('Archivo corrupto o formato inválido');
        }
        
        if (!datos.metadata || !datos.metadata.sistema) {
            throw new Error('Archivo no contiene metadata válida');
        }
        
        if (datos.metadata.sistema !== this.sistema) {
            throw new Error('Archivo no compatible con el Sistema Avícola');
        }
        
        // Verificar estructura de datos esperada
        const estructurasRequeridas = ['transacciones', 'produccion', 'inventario', 'opciones'];
        for (const estructura of estructurasRequeridas) {
            if (!datos[estructura]) {
                throw new Error(`Archivo incompleto: falta sección ${estructura}`);
            }
        }
        
        return true;
    }

    // Importar datos desde JSON
    async importarDatos(contenidoJSON) {
        try {
            console.log('Iniciando importación de datos...');
            
            const datos = JSON.parse(contenidoJSON);
            
            // Validar archivo
            this.validarArchivoImportado(datos);
            
            // Crear backup de los datos actuales antes de importar
            const backupActual = this.obtenerTodosLosDatos();
            localStorage.setItem('backupPreImport', JSON.stringify(backupActual));
            
            // Importar datos en localStorage
            if (datos.transacciones && datos.transacciones.datos) {
                localStorage.setItem('transactions', JSON.stringify(datos.transacciones.datos));
            }
            
            if (datos.produccion && datos.produccion.datos) {
                localStorage.setItem('productionData', JSON.stringify(datos.produccion.datos));
            }
            
            if (datos.inventario) {
                if (datos.inventario.actual) {
                    localStorage.setItem('inventoryData', JSON.stringify(datos.inventario.actual));
                }
                if (datos.inventario.historial) {
                    localStorage.setItem('inventoryHistory', JSON.stringify(datos.inventario.historial));
                }
            }
            
            if (datos.opciones) {
                localStorage.setItem('transactionOptions', JSON.stringify(datos.opciones));
            }
            
            if (datos.compradores) {
                localStorage.setItem('buyersData', JSON.stringify(datos.compradores));
            }
            
            console.log('Importación completada exitosamente');
            return {
                success: true,
                message: 'Datos importados correctamente',
                resumen: {
                    transacciones: datos.transacciones?.datos?.length || 0,
                    produccion: datos.produccion?.datos?.length || 0,
                    inventario: datos.inventario?.historial?.length || 0,
                    opciones: Object.keys(datos.opciones || {}).length
                }
            };
            
        } catch (error) {
            console.error('Error en importación:', error);
            
            // Restaurar backup en caso de error
            try {
                const backup = JSON.parse(localStorage.getItem('backupPreImport'));
                if (backup) {
                    this.restaurarDesdeBackup(backup);
                }
            } catch (backupError) {
                console.error('Error restaurando backup:', backupError);
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Restaurar desde backup
    restaurarDesdeBackup(backup) {
        if (backup.transacciones && backup.transacciones.datos) {
            localStorage.setItem('transactions', JSON.stringify(backup.transacciones.datos));
        }
        if (backup.produccion && backup.produccion.datos) {
            localStorage.setItem('productionData', JSON.stringify(backup.produccion.datos));
        }
        if (backup.inventario) {
            if (backup.inventario.actual) {
                localStorage.setItem('inventoryData', JSON.stringify(backup.inventario.actual));
            }
            if (backup.inventario.historial) {
                localStorage.setItem('inventoryHistory', JSON.stringify(backup.inventario.historial));
            }
        }
        if (backup.opciones) {
            localStorage.setItem('transactionOptions', JSON.stringify(backup.opciones));
        }
    }

    // Cargar archivo para importación
    cargarArchivo(event) {
        return new Promise((resolve, reject) => {
            const file = event.target.files[0];
            
            if (!file) {
                reject(new Error('No se seleccionó ningún archivo'));
                return;
            }
            
            // Validar tipo de archivo
            if (!file.name.toLowerCase().endsWith('.json')) {
                reject(new Error('Solo se permiten archivos JSON'));
                return;
            }
            
            // Validar tamaño (máximo 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                reject(new Error('El archivo es demasiado grande. Máximo 10MB'));
                return;
            }
            
            if (file.size === 0) {
                reject(new Error('El archivo está vacío'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    // Validar que sea JSON válido
                    JSON.parse(e.target.result);
                    resolve(e.target.result);
                } catch (parseError) {
                    reject(new Error('El archivo no contiene JSON válido'));
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Error al leer el archivo'));
            };
            
            reader.onabort = function() {
                reject(new Error('Lectura del archivo cancelada'));
            };
            
            reader.readAsText(file, 'UTF-8');
        });
    }

    // Generar reporte de datos actuales
    generarReporte() {
        try {
            const datos = this.obtenerTodosLosDatos();
            
            return {
                transacciones: datos.transacciones.total,
                produccion: datos.produccion.total,
                inventarioActual: datos.inventario.totalActual,
                inventarioHistorial: datos.inventario.totalHistorial,
                cuentas: datos.opciones.accounts?.length || 0,
                tipos: datos.opciones.types?.length || 0,
                clientes: datos.opciones.customers?.length || 0,
                compradores: datos.compradores?.length || 0,
                totalGeneral: datos.metadata.totalRegistros,
                ultimaActualizacion: new Date().toLocaleString('es-ES'),
                tamañoAproximado: JSON.stringify(datos).length
            };
        } catch (error) {
            console.error('Error generando reporte:', error);
            return {
                transacciones: 0,
                produccion: 0,
                inventarioActual: 0,
                inventarioHistorial: 0,
                cuentas: 0,
                tipos: 0,
                clientes: 0,
                compradores: 0,
                totalGeneral: 0,
                ultimaActualizacion: 'N/A',
                tamañoAproximado: 0
            };
        }
    }

    // Limpiar datos del sistema (para testing/reset)
    limpiarDatos() {
        const claves = [
            'transactions',
            'productionData',
            'inventoryData',
            'inventoryHistory',
            'transactionOptions',
            'buyersData',
            'backupPreImport'
        ];
        
        claves.forEach(clave => {
            localStorage.removeItem(clave);
        });
        
        return { success: true, message: 'Datos limpiados correctamente' };
    }

    // Verificar integridad de datos
    verificarIntegridad() {
        try {
            const datos = this.obtenerTodosLosDatos();
            const problemas = [];
            
            // Verificar transacciones
            if (datos.transacciones.datos) {
                datos.transacciones.datos.forEach((trans, index) => {
                    if (!trans.id || !trans.date || !trans.amount) {
                        problemas.push(`Transacción ${index + 1} incompleta`);
                    }
                });
            }
            
            // Verificar producción
            if (datos.produccion.datos) {
                datos.produccion.datos.forEach((prod, index) => {
                    if (!prod.id || !prod.date) {
                        problemas.push(`Producción ${index + 1} incompleta`);
                    }
                });
            }
            
            return {
                integridad: problemas.length === 0,
                totalProblemas: problemas.length,
                problemas: problemas,
                totalRegistros: datos.metadata.totalRegistros
            };
        } catch (error) {
            return {
                integridad: false,
                totalProblemas: 1,
                problemas: ['Error verificando integridad: ' + error.message],
                totalRegistros: 0
            };
        }
    }
}

// Crear instancia global
const exportadorAvicola = new ExportadorAvicola();