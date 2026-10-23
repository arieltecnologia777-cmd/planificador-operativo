const API_BASE_URL = "https://facturacion.modulo-de-exclusiones.workers.dev/api";
const FACTURACION_API_URL = `${API_BASE_URL}/facturacion`;

let registrosCrudosTecnicos = [];
const META_BASE_MENSUAL_TECNICO = 9500000;

// Variable global para almacenar los registros filtrados actuales y consultarlos fácilmente desde el modal
let registrosFiltradosActuales = [];

// 1. Validar seguridad al cargar la página: Si no hay sesión, redirigir al login
const tecnicoLogueado = localStorage.getItem('tecnicoLogueado');
if (!tecnicoLogueado) {
    window.location.href = 'login.html';
}

document.addEventListener("DOMContentLoaded", () => {
    const drop = document.getElementById('dropdownPeriodoContent');
    if (drop) drop.style.display = 'none';

    // Inyectar el reloj en el Hero para pantallas grandes si no existe
    asegurarRelojEnHero();

    cargarDatosTecnicosDesdeAPI();
    iniciarRelojTiempoReal();
    
    document.addEventListener('click', (e) => {
        if (drop && !drop.contains(e.target) && !e.target.closest('.sel')) {
            drop.style.display = 'none';
        }
    });
});

function asegurarRelojEnHero() {
    const heroCard = document.querySelector('.hero') || document.querySelector('.bg-blue, div[style*="background: linear-gradient"], div[style*="background: #1D5FE0"]') || document.querySelector('main > div:first-child');
    
    if (heroCard && !document.getElementById('liveDateTimeHero')) {
        heroCard.style.position = 'relative';
        const relojDiv = document.createElement('div');
        relojDiv.id = 'liveDateTimeHero';
        relojDiv.style.cssText = 'position: absolute; top: 20px; right: 24px; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 600; background: rgba(255,255,255,0.1); padding: 6px 14px; border-radius: 20px; backdrop-filter: blur(4px); display: none;';
        
        const styleMedia = document.createElement('style');
        styleMedia.innerHTML = `@media(min-width: 768px) { #liveDateTimeHero { display: block !important; } }`;
        document.head.appendChild(styleMedia);
        
        heroCard.appendChild(relojDiv);
    }
}

function iniciarRelojTiempoReal() {
    const relojElem = document.getElementById('liveDateTime') || document.getElementById('liveDateTimeHero');
    if (!relojElem) return;
    function actualizar() {
        const ahora = new Date();
        const opcionesFecha = { year: 'numeric', month: 'short', day: 'numeric' };
        const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const textoReloj = `📅 ${ahora.toLocaleDateString('es-CO', opcionesFecha)} &nbsp;|&nbsp; ⏰ ${ahora.toLocaleTimeString('es-CO', opcionesHora)}`;
        
        const elMovil = document.getElementById('liveDateTime');
        const elHero = document.getElementById('liveDateTimeHero');
        if (elMovil) elMovil.innerHTML = textoReloj;
        if (elHero) elHero.innerHTML = textoReloj;
    }
    actualizar();
    setInterval(actualizar, 1000);
}

async function cargarDatosTecnicosDesdeAPI() {
    try {
        const response = await fetch(FACTURACION_API_URL);
        if (response.ok) {
            registrosCrudosTecnicos = await response.json();
            if (Array.isArray(registrosCrudosTecnicos) && registrosCrudosTecnicos.length > 0) {
                poblarSelectoresYFiltros(registrosCrudosTecnicos);
            } else {
                renderizarPortalVacio();
            }
        } else {
            renderizarPortalVacio();
        }
    } catch (err) {
        console.error("Error al conectar con la API de facturación:", err);
        renderizarPortalVacio();
    }
}

function obtenerNombreCorto(nombreCompleto) {
    const partes = String(nombreCompleto || "").trim().split(/\s+/);
    if (partes.length === 0) return "Técnico";
    if (partes.length === 1) return partes[0];
    return `${partes[0]} ${partes[1]}`;
}

function poblarSelectoresYFiltros(rows) {
    const mesesSet = new Set();

    rows.forEach(r => {
        const mesVal = String(r.mes || r.MES || "").trim();
        if (mesVal) mesesSet.add(mesVal);
    });

    const nombreCorto = obtenerNombreCorto(tecnicoLogueado);
    const perfilContainer = document.querySelector('.sel'); 
    if (perfilContainer) {
        perfilContainer.innerHTML = `
            <span class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg></span>
            <div style="flex:1; min-width: 0;">
                <label style="font-size: 10px; display: block;">Tu perfil técnico</label>
                <b style="font-size: 12px; color: #0f172a; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${tecnicoLogueado}">${nombreCorto}</b>
            </div>
        `;
    }

    const mesesOrdenados = Array.from(mesesSet).sort();
    const ultimosTresMeses = mesesOrdenados.slice(-3);

    const containerMeses = document.getElementById('listaCheckPeriodos');
    if (containerMeses) {
        let htmlCheck = '';
        ultimosTresMeses.forEach(mes => {
            htmlCheck += `
                <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #1e293b; cursor: pointer; padding: 3px 0;">
                    <input type="checkbox" name="filtroPeriodoCheckbox" value="${mes}" checked onchange="ejecutarFiltroYRenderizado()" style="cursor: pointer;">
                    ${mes}
                </label>
            `;
        });
        containerMeses.innerHTML = htmlCheck;
    }

    actualizarLabelBotonPeriodos();

    const drop = document.getElementById('dropdownPeriodoContent');
    if (drop) drop.style.display = 'none';

    ejecutarFiltroYRenderizado();
}

function toggleDropdownPeriodo(e) {
    if (e) e.stopPropagation();
    const drop = document.getElementById('dropdownPeriodoContent');
    if (drop) {
        drop.style.display = (drop.style.display === 'block') ? 'none' : 'block';
    }
}

function seleccionarTodoPeriodos(marcar) {
    const checkboxes = document.querySelectorAll('input[name="filtroPeriodoCheckbox"]');
    checkboxes.forEach(cb => {
        const lbl = cb.closest('label');
        if (!lbl || lbl.style.display !== 'none') {
            cb.checked = marcar;
        }
    });
    actualizarLabelBotonPeriodos();
    ejecutarFiltroYRenderizado();
}

function borrarFiltroPeriodos() {
    const checkboxes = document.querySelectorAll('input[name="filtroPeriodoCheckbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    actualizarLabelBotonPeriodos();
    ejecutarFiltroYRenderizado();
}

function filtrarListaPeriodos(texto) {
    const query = texto.toLowerCase().trim();
    const labels = document.querySelectorAll('#listaCheckPeriodos label');
    labels.forEach(lbl => {
        const txt = lbl.innerText.toLowerCase();
        lbl.style.display = txt.includes(query) ? 'flex' : 'none';
    });
}

function obtenerMesesSeleccionados() {
    const checkboxes = document.querySelectorAll('input[name="filtroPeriodoCheckbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function actualizarLabelBotonPeriodos() {
    const seleccionados = obtenerMesesSeleccionados();
    const total = document.querySelectorAll('input[name="filtroPeriodoCheckbox"]').length;
    const lbl = document.getElementById('lblPeriodoSeleccionado');
    if (!lbl) return;

    if (seleccionados.length === 0) {
        lbl.innerText = "Ningún periodo";
    } else if (seleccionados.length === total) {
        lbl.innerText = "Últimos 3 meses";
    } else if (seleccionados.length === 1) {
        lbl.innerText = seleccionados[0];
    } else {
        lbl.innerText = `${seleccionados.length} seleccionados`;
    }
}

function ejecutarFiltroYRenderizado() {
    actualizarLabelBotonPeriodos();
    const tecnicoSeleccionado = localStorage.getItem('tecnicoLogueado') || "";
    const mesesSeleccionados = obtenerMesesSeleccionados();

    procesarYRenderizarPortalTecnicoFiltrado(tecnicoSeleccionado, mesesSeleccionados);
}
function procesarYRenderizarPortalTecnicoFiltrado(nombreTecnico, mesesSeleccionados) {
    const tecnicoBuscado = String(nombreTecnico || "").trim().toUpperCase();
    const palabrasClave = tecnicoBuscado.split(/\s+/).filter(p => p.length > 2);
    
    const misRegistros = registrosCrudosTecnicos.filter(r => {
        const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfil = String(rawPerfil).replace(/["']/g, "").trim().toUpperCase();
        const mesReg = String(r.mes || r.MES || "").trim();

        if (!mesesSeleccionados.includes(mesReg)) return false;

        // Validamos el estado regional para excluir completamente 'GRN/BTS/RVST'
        const aprobRegRaw = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || r['aprobación regional'] || "").trim().toUpperCase();
        if (aprobRegRaw.includes("GRN") || aprobRegRaw.includes("BTS") || aprobRegRaw.includes("RVST")) {
            return false; // Descartamos este registro por completo
        }

        if (perfil === tecnicoBuscado) return true;
        if (palabrasClave.length > 0 && palabrasClave.every(palabra => perfil.includes(palabra))) return true;

        return false;
    });

    const cantidadMeses = Math.max(1, mesesSeleccionados.length);
    const metaAsignadaTotal = META_BASE_MENSUAL_TECNICO * cantidadMeses;

    let montoAprobadoTotal = 0, montoRechazadoTotal = 0, montoSubsanadoTotal = 0;

    misRegistros.forEach(r => {
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();
        const estAceptar = aprobReg.includes("ACEPTADO") || aprobReg.includes("APROBADO");
        const estRechazar = aprobReg.includes("RECHAZADO");
        const montoBase = Number(r.estimado_a_facturar ?? r.facturacion ?? r.Facturacion ?? 0);
        
        if (estAceptar) montoAprobadoTotal += Number(r.total_aprobado ?? r.REAL_FACTURADO ?? r['Total  Aprobado'] ?? 0);
        if (estRechazar) montoRechazadoTotal += montoBase;
        montoSubsanadoTotal += Number(r.trasiego_esp ?? r['TRASIEGO ESP.'] ?? 0);
    });

    document.getElementById('kpiMetaAsignada').innerText = formatMoney(metaAsignadaTotal);
    document.getElementById('kpiMontoAprobado').innerText = formatMoney(montoAprobadoTotal);
    document.getElementById('kpiMontoRechazado').innerText = formatMoney(montoRechazadoTotal);
    document.getElementById('kpiMontoSubsanado').innerText = formatMoney(montoSubsanadoTotal);

    let porcentajeCumplimiento = metaAsignadaTotal > 0 ? Math.round((montoAprobadoTotal / metaAsignadaTotal) * 100) : 0;
    document.getElementById('txtPorcentajeCumplimientoNota').innerText = `${porcentajeCumplimiento}% de cumplimiento de tu meta`;

    actualizarBarraEstadoGeneralPeriodo(montoAprobadoTotal, metaAsignadaTotal, porcentajeCumplimiento, cantidadMeses);
    renderizarTablaOrdenesTecnico(misRegistros);
}
function actualizarBarraEstadoGeneralPeriodo(aprobado, meta, porcentaje, meses) {
    const porcentajeVisual = (porcentaje / 200) * 100;
    
    const fill = document.getElementById('progressFillBarra');
    const pin = document.getElementById('progressPinBarra');
    const badge = document.getElementById('stateBadgeEstado');
    const legendMeta = document.getElementById('legendMetaTexto');

    if (legendMeta) legendMeta.textContent = `Meta total (${meses} ${meses === 1 ? 'periodo' : 'periodos'}): $${meta.toLocaleString('es-CO')}`;
    
    if (fill) fill.style.width = `${porcentajeVisual}%`;
    if (pin) pin.style.left = `${porcentajeVisual}%`;

    if (porcentaje >= 100) {
        if (fill) fill.style.background = '#12A15F';
        if (badge) { badge.style.background = 'var(--green-soft)'; badge.style.color = 'var(--green)'; badge.innerHTML = `🏆 ¡Meta cumplida! ${porcentaje}%`; }
    } else {
        if (fill) fill.style.background = 'linear-gradient(90deg, #E0334C 0%, #E08A00 100%)';
        if (badge) { badge.style.background = 'var(--amber-soft)'; badge.style.color = 'var(--amber)'; badge.innerHTML = `💪 ¡Ánimo! Vas al ${porcentaje}%.`; }
    }
}

// Única función unificada para renderizar la tabla con colores blindados en línea
function renderizarTablaOrdenesTecnico(rows) {
    registrosFiltradosActuales = rows || [];
    const tbody = document.getElementById('rows');
    const emptyMsg = document.getElementById('empty');
    if (!tbody) return;

    if (!rows || rows.length === 0) {
        tbody.innerHTML = '';
        if (emptyMsg) emptyMsg.hidden = false;
        return;
    }

    if (emptyMsg) emptyMsg.hidden = true;
    let html = '';

    rows.forEach((r, index) => {
        const idVal = r.id_id || r.ID_ID || r.id || r.ID || 'N/A';
        
        const aprobRegRaw = r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || r['aprobación regional'] || "";
        const estadoTexto = String(aprobRegRaw).trim() !== "" ? String(aprobRegRaw).trim().toUpperCase() : "PENDIENTE";
        
        let estiloBadge = 'padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block;';
        
        if (estadoTexto.includes("ACEPTADO") || estadoTexto.includes("APROBADO")) {
            estiloBadge += ' background-color: #D1FAE5 !important; color: #065F46 !important;'; // Verde
        } else if (estadoTexto.includes("RECHAZADO")) {
            estiloBadge += ' background-color: #FEE2E2 !important; color: #991B1B !important;'; // Rojo
        } else {
            estiloBadge += ' background-color: #FEF3C7 !important; color: #D97706 !important;'; // Ámbar
        }

        // En la tabla dejamos la causa de rechazo tal cual viene de la base de datos (***, etc.)
        const causaRechazo = r.causa_rechazo || r.CAUSA_RECHAZO || r['Causa Rechazo'] || '***';
        const montoFinal = Number(r.total_aprobado ?? r.REAL_FACTURADO ?? r['Total  Aprobado'] ?? r.estimado_a_facturar ?? r.facturacion ?? 0);

        html += `
            <tr>
                <td><span class="ot" style="font-weight: 700; color: #1D5FE0;">${idVal}</span></td>
                <td><span style="${estiloBadge}">${estadoTexto}</span></td>
                <td><span class="cause" style="color: #475569; font-size: 12px;">${causaRechazo}</span></td>
                <td><strong style="color: #0f172a;">${formatMoney(montoFinal)}</strong></td>
                <td style="text-align: center;">
                    <button type="button" onclick="abrirModalDetalle(${index})" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; border: 1px solid #bfdbfe; background: #eff6ff; cursor: pointer; font-weight: 700; font-size: 12px; color: #2563eb;">
                        👁️ Ver detalles
                    </button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function renderizarPortalVacio() {
    document.getElementById('kpiMetaAsignada').innerText = formatMoney(0);
    document.getElementById('kpiMontoAprobado').innerText = formatMoney(0);
    document.getElementById('kpiMontoRechazado').innerText = formatMoney(0);
    document.getElementById('kpiMontoSubsanado').innerText = formatMoney(0);
    const tbody = document.getElementById('rows');
    if (tbody) tbody.innerHTML = '';
}

function formatMoney(amount) {
    return '$ ' + Number(amount || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function abrirModalDetalle(index) {
    const registro = registrosFiltradosActuales[index];
    if (!registro) return;

    const idVal = registro.id_id || registro.ID_ID || registro.id || registro.ID || 'N/A';
    const mesVal = registro.mes || registro.MES || 'N/A';
    
    // Obtenemos el estado regional real
    const aprobRegRaw = registro.aprobacion_regional || registro.APROBACION_REGIONAL || registro['APROBACION REGIONAL'] || 'En trámite';
    const estadoTexto = String(aprobRegRaw).trim().toUpperCase();

    // Extraemos la causa y la observación tal cual vienen de la base de datos
    let causaVal = registro.causa_rechazo || registro.CAUSA_RECHAZO || registro['Causa Rechazo'] || '***';
    let obsVal = registro.detalle_mindy2 || registro.DETALLE_MINDY2 || registro['DETALLE MINDY2'] || registro['detalle mindy2'] || 'Sin observaciones registradas.';

    // SI EL ESTADO ES ACEPTADO O APROBADO: Forzamos el '***' en causa y el comentario estándar en observaciones
    if (estadoTexto.includes("ACEPTADO") || estadoTexto.includes("APROBADO")) {
        causaVal = "N/A";
        obsVal = "Orden aprobada.";
    }

    document.getElementById('modalIdVal').innerText = idVal;
    document.getElementById('modalMesVal').innerText = mesVal;
    document.getElementById('modalEstadoVal').innerText = aprobRegRaw;
    document.getElementById('modalCausaVal').innerText = causaVal;
    document.getElementById('modalObsVal').innerText = obsVal;

    const modal = document.getElementById('modalDetalleOrden');
    if (modal) modal.style.display = 'flex';
}

function cerrarModalDetalle() {
    const modal = document.getElementById('modalDetalleOrden');
    if (modal) modal.style.display = 'none';
}

function cerrarSesion() {
    localStorage.removeItem('tecnicoLogueado');
    localStorage.clear();
    window.location.href = 'login.html';
}

// Exponer funciones globalmente al objeto window
window.toggleDropdownPeriodo = toggleDropdownPeriodo;
window.seleccionarTodoPeriodos = seleccionarTodoPeriodos;
window.borrarFiltroPeriodos = borrarFiltroPeriodos;
window.filtrarListaPeriodos = filtrarListaPeriodos;
window.ejecutarFiltroYRenderizado = ejecutarFiltroYRenderizado;
window.abrirModalDetalle = abrirModalDetalle;
window.cerrarModalDetalle = cerrarModalDetalle;
window.cerrarSesion = cerrarSesion;
