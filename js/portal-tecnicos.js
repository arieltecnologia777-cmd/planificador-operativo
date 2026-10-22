const API_BASE_URL = "https://facturacion.modulo-de-exclusiones.workers.dev/api";
const FACTURACION_API_URL = `${API_BASE_URL}/facturacion`;

let registrosCrudosTecnicos = [];
const META_BASE_MENSUAL_TECNICO = 9500000;

document.addEventListener("DOMContentLoaded", () => {
    const drop = document.getElementById('dropdownPeriodoContent');
    if (drop) drop.style.display = 'none';

    cargarDatosTecnicosDesdeAPI();
    iniciarRelojTiempoReal();
    
    document.addEventListener('click', (e) => {
        if (drop && !drop.contains(e.target) && !e.target.closest('.sel')) {
            drop.style.display = 'none';
        }
    });
});

function iniciarRelojTiempoReal() {
    const relojElem = document.getElementById('liveDateTime');
    if (!relojElem) return;
    function actualizar() {
        const ahora = new Date();
        const opcionesFecha = { year: 'numeric', month: 'short', day: 'numeric' };
        const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        relojElem.innerHTML = `📅 ${ahora.toLocaleDateString('es-CO', opcionesFecha)} &nbsp;|&nbsp; ⏰ ${ahora.toLocaleTimeString('es-CO', opcionesHora)}`;
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
        }
    } catch (err) {
        console.error("Error al conectar con la API de facturación:", err);
        renderizarPortalVacio();
    }
}

function poblarSelectoresYFiltros(rows) {
    const tecnicosSet = new Set();
    const mesesSet = new Set();

    rows.forEach(r => {
        const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfil = String(rawPerfil).replace(/["']/g, "").trim();
        if (perfil && perfil !== "SIN PROGRAMACION") tecnicosSet.add(perfil);

        const mesVal = String(r.mes || r.MES || "").trim();
        if (mesVal) mesesSet.add(mesVal);
    });

    const selectTec = document.getElementById('tec');
    if (selectTec) {
        let htmlTec = '';
        Array.from(tecnicosSet).sort().forEach(tec => {
            htmlTec += `<option value="${tec}">${tec}</option>`;
        });
        selectTec.innerHTML = htmlTec;
        selectTec.onchange = () => ejecutarFiltroYRenderizado();
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

    if (selectTec && selectTec.options.length > 0) {
        selectTec.selectedIndex = 0;
        ejecutarFiltroYRenderizado();
    }
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
    const selectTec = document.getElementById('tec');
    const tecnicoSeleccionado = selectTec ? selectTec.value : "";
    const mesesSeleccionados = obtenerMesesSeleccionados();

    procesarYRenderizarPortalTecnicoFiltrado(tecnicoSeleccionado, mesesSeleccionados);
}

function procesarYRenderizarPortalTecnicoFiltrado(nombreTecnico, mesesSeleccionados) {
    const tecnicoBuscado = String(nombreTecnico || "").trim().toUpperCase();
    
    const misRegistros = registrosCrudosTecnicos.filter(r => {
        const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfil = String(rawPerfil).replace(/["']/g, "").trim().toUpperCase();
        const mesReg = String(r.mes || r.MES || "").trim();
        return perfil === tecnicoBuscado && mesesSeleccionados.includes(mesReg);
    });

    const cantidadMeses = Math.max(1, mesesSeleccionados.length);
    const metaAsignadaTotal = META_BASE_MENSUAL_TECNICO * cantidadMeses;

    let montoAprobadoTotal = 0, montoRechazadoTotal = 0, montoSubsanadoTotal = 0;

    misRegistros.forEach(r => {
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();
        const estAceptar = aprobReg.includes("ACEPTADO");
        const estRechazar = aprobReg.includes("RECHAZADO");
        const montoBase = Number(r.estimado_a_facturar ?? r.facturacion ?? r.Facturacion ?? 0);
        
        if (estAceptar) montoAprobadoTotal += Number(r.total_aprobado ?? r.REAL_FACTURADO ?? r['Total  Aprobado'] ?? 0);
        if (estRechazar) montoRechazadoTotal += montoBase;
        montoSubsanadoTotal += Number(r.trasiego_esp ?? 0);
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
    const porcentajeVisual = Math.min(100, porcentaje);
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

function renderizarTablaOrdenesTecnico(rows) {
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
    rows.forEach(r => {
        html += `
            <tr>
                <td><span class="ot">${r.id_id || r.ID_ID || 'N/A'}</span></td>
                <td><span class="cause">${r.departamento || r.DEPARTAMENTO || 'GENERAL'}</span></td>
                <td><span class="st pe">En trámite</span></td>
                <td>-</td>
                <td>${formatMoney(r.estimado_a_facturar ?? 0)}</td>
                <td>${formatMoney(r.total_aprobado ?? 0)}</td>
                <td style="text-align: center;"><button type="button">Ver</button></td>
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
