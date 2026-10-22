document.addEventListener("DOMContentLoaded", () => {
    // Inicialización segura para evitar errores de elementos nulos
    cargarDatosTecnicos();

    const selectTecnico = document.getElementById('tec');
    if (selectTecnico) {
        selectTecnico.addEventListener('change', (e) => {
            filtrarDatosPorTecnico(e.target.value);
        });
    }
});

function cargarDatosTecnicos() {
    try {
        // Simulación o carga de datos iniciales del universo de facturación D1
        poblarSelectTecnicos();
        
        // Ejemplo de prueba: Monto aprobado acumulado y cantidad de meses del periodo filtrado (ej. 3 meses = $28.500.000 de meta)
        const montoAprobadoActual = 12500000; 
        const cantidadMesesFiltro = 3; 

        actualizarBarraProgresoDinamica(montoAprobadoActual, cantidadMesesFiltro);
        
    } catch (error) {
        console.error("Error al conectar con la API o cargar los datos:", error);
    }
}

function poblarSelectTecnicos() {
    const select = document.getElementById('tec');
    if (!select) return; // Validación estricta para prevenir errores si el elemento no existe en el DOM
    
    // Poblado de ejemplo seguro
    console.log("Select de técnicos inicializado correctamente.");
}

function filtrarDatosPorTecnico(nombreTecnico) {
    console.log("Filtrando datos para:", nombreTecnico);
    // Aquí puedes conectar tus consultas a Cloudflare D1
}

/**
 * Lógica de la Barra de Estado General del Periodo
 * - Meta base: 9.500.000 por cada mes filtrado.
 * - Pin deslizable con tooltip del porcentaje alcanzado vs meta.
 * - Colores intermedios y condicional de éxito/aliento.
 */
function actualizarBarraProgresoDinamica(montoAprobadoTotal, cantidadMeses) {
    const metaBaseMes = 9500000;
    const metaTotalPeriodo = metaBaseMes * cantidadMeses;
    
    // Cálculo del porcentaje de cumplimiento
    const porcentaje = metaTotalPeriodo > 0 ? (montoAprobadoTotal / metaTotalPeriodo) * 100 : 0;
    const porcentajeVisual = Math.min(porcentaje, 100); // Tope visual del ancho de la barra al 100%
    
    const pin = document.getElementById('progressPin');
    const fill = document.getElementById('progressFill');
    const badge = document.getElementById('stateBadge');
    const iconContainer = document.getElementById('stateIcon');
    const legendMeta = document.getElementById('legendMeta');
    
    // Actualizar texto de la meta en la leyenda inferior
    if (legendMeta) {
        legendMeta.textContent = `Meta: $${metaTotalPeriodo.toLocaleString()} (${cantidadMeses} ${cantidadMeses === 1 ? 'mes' : 'meses'})`;
    }
    
    // Asignar anchos y posición de la ruedita (pin) con el tooltip dinámico
    if (fill) fill.style.width = `${porcentajeVisual}%`;
    if (pin) {
        pin.style.left = `${porcentajeVisual}%`;
        pin.title = `Progreso: ${porcentaje.toFixed(1)}% ($${montoAprobadoTotal.toLocaleString()} de $${metaTotalPeriodo.toLocaleString()})`;
    }
    
    // Control de colores y mensajes condicionales según el cumplimiento de la meta
    if (porcentaje >= 100) {
        if (fill) fill.style.background = '#12A15F';
        if (pin) pin.style.borderColor = '#12A15F';
        if (iconContainer) iconContainer.style.background = '#12A15F';
        if (badge) {
            badge.style.background = 'var(--green-soft)';
            badge.style.color = 'var(--green)';
            badge.innerHTML = `🏆 ¡Meta cumplida! ${porcentaje.toFixed(0)}%`;
        }
    } else {
        // Colores intermedios de aliento (degradado rojo a ámbar/naranja según avance)
        if (fill) fill.style.background = 'linear-gradient(90deg, #E0334C 0%, #E08A00 100%)';
        if (pin) pin.style.borderColor = '#E08A00';
        if (iconContainer) iconContainer.style.background = '#E08A00';
        if (badge) {
            badge.style.background = 'var(--amber-soft)';
            badge.style.color = 'var(--amber)';
            badge.innerHTML = `💪 ¡Ánimo! Vas al ${porcentaje.toFixed(0)}%. ¡Sigue adelante para lograr la meta!`;
        }
    }
}
