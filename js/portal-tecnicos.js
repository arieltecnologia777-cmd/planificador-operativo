const API_BASE_URL = "https://facturacion.modulo-de-exclusiones.workers.dev/api";
const FACTURACION_API_URL = `${API_BASE_URL}/facturacion`;

let registrosCrudosTecnicos = [];
const META_BASE_MENSUAL_TECNICO = 9500000;

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosTecnicosDesdeAPI();
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        const drop = document.getElementById('dropdownPeriodoContent');
        if (drop && !drop.contains(e.target) && !e.target.closest('.sel')) {
            drop.style.display = 'none';
        }
    });
});

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

    // 1. Poblar select de técnicos
    const selectTec = document.getElementById('tec');
    if (selectTec) {
        let htmlTec = '';
        Array.from(tecnicosSet).sort().forEach(tec => {
            htmlTec += `<option value="${tec}">${tec}</option>`;
        });
        selectTec.innerHTML = htmlTec;
        selectTec.onchange = () => ejecutarFiltroYRenderizado();
    }

    // 2. Extraer SOLAMENTE los últimos 3 meses vigentes ordenados
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

    // Render inicial
    if (selectTec && selectTec.options.length > 0) {
        selectTec.selectedIndex = 0;
        ejecutarFiltroYRenderizado();
    }
}

function toggleDropdownPeriodo(e) {
    const drop = document.getElementById('dropdownPeriodoContent');
    if (drop) {
        drop.style.display = drop.style.display === 'block' ? 'none' : 'block';
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
        lbl.innerText = "Últimos 3 meses vigentes";
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

        const matchTecnico = perfil === tecnicoBuscado;
        const matchMes = mesesSeleccionados.includes(mesReg);

        return matchTecnico && matchMes;
    });

    const cantidadMeses = Math.max(1, mesesSeleccionados.length);
    const metaAsignadaTotal = META_BASE_MENSUAL_TECNICO * cantidadMeses;

    let montoAprobadoTotal = 0;
    let montoRechazadoTotal = 0;
    let montoSubsanadoTotal = 0;

    misRegistros.forEach(r => {
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();
        const estAceptar = aprobReg.includes("ACEPTADO");
        const estRechazar = aprobReg.includes("RECHAZADO");
        const montoBase = Number(r.estimado_a_facturar ?? r.facturacion ?? r.Facturacion ?? 0);
        
        if (estAceptar) {
            montoAprobadoTotal += Number(r.total_aprobado ?? r.REAL_FACTURADO ?? r['Total  Aprobado'] ?? 0);
        }
        if (estRechazar) {
            montoRechazadoTotal += montoBase;
        }
        montoSubsanadoTotal += Number(r.trasiego_esp ?? 0);
    });

    // 1. Actualizar KPIs en interfaz
    document.getElementById('kpiMetaAsignada').innerText = formatMoney(metaAsignadaTotal);
    document.getElementById('kpiMontoAprobado').innerText = formatMoney(montoAprobadoTotal);
    document.getElementById('kpiMontoRechazado').innerText = formatMoney(montoRechazadoTotal);
    document.getElementById('kpiMontoSubsanado').innerText = formatMoney(montoSubsanadoTotal);

    // Texto dinámico de la tarjeta de meta
    const textoNotaMeta = cantidadMeses === 1 ? "Meta asignada para este periodo" : `Meta asignada para los ${cantidadMeses} periodos seleccionados`;
    const notaMetaElem = document.querySelector('.card.kpi.blue .note.b');
    if (notaMetaElem) notaMetaElem.innerText = textoNotaMeta;

    let porcentajeCumplimiento = metaAsignadaTotal > 0 ? Math.round((montoAprobadoTotal / metaAsignadaTotal) * 100) : 0;
    document.getElementById('txtPorcentajeCumplimientoNota').innerText = `${porcentajeCumplimiento}% de cumplimiento de tu meta`;

    // 2. Actualizar barra de estado general
    actualizarBarraEstadoGeneralPeriodo(montoAprobadoTotal, metaAsignadaTotal, porcentajeCumplimiento, cantidadMeses);

    // 3. Renderizar tabla de órdenes
    renderizarTablaOrdenesTecnico(misRegistros);
}

function actualizarBarraEstadoGeneralPeriodo(aprobado, meta, porcentaje, meses) {
    const porcentajeVisual = Math.min(100, porcentaje);
    
    const fill = document.getElementById('progressFillBarra');
    const pin = document.getElementById('progressPinBarra');
    const badge = document.getElementById('stateBadgeEstado');
    const iconContainer = document.getElementById('stateIconEstado');
    const legendMeta = document.getElementById('legendMetaTexto');

    if (legendMeta) {
        legendMeta.textContent = `Meta total (${meses} ${meses === 1 ? 'periodo' : 'periodos'}): $${meta.toLocaleString('es-CO')}`;
    }

    if (fill) fill.style.width = `${porcentajeVisual}%`;
    if (pin) {
        pin.style.left = `${porcentajeVisual}%`;
        pin.title = `Progreso: ${porcentaje}% ($${aprobado.toLocaleString('es-CO')} de $${meta.toLocaleString('es-CO')})`;
    }

    if (porcentaje >= 100) {
        if (fill) fill.style.background = '#12A15F';
        if (pin) pin.style.borderColor = '#12A15F';
        if (iconContainer) iconContainer.style.background = '#12A15F';
        if (badge) {
            badge.style.background = 'var(--green-soft)';
            badge.style.color = 'var(--green)';
            badge.innerHTML = `🏆 ¡Meta cumplida! ${porcentaje}%`;
        }
    } else {
        if (fill) fill.style.background = 'linear-gradient(90deg, #E0334C 0%, #E08A00 100%)';
        if (pin) pin.style.borderColor = '#E08A00';
        if (iconContainer) iconContainer.style.background = '#E08A00';
        if (badge) {
            badge.style.background = 'var(--amber-soft)';
            badge.style.color = 'var(--amber)';
            badge.innerHTML = `💪 ¡Ánimo! Vas al ${porcentaje}%. ¡Sigue adelante para lograr la meta!`;
        }
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
        const idOt = r.id_id || r.ID_ID || r.id || r.ID || 'N/A';
        const departamento = r.departamento || r.DEPARTAMENTO || r.dep || 'GENERAL';
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "EN TRÁMITE").toUpperCase();
        const causa = r.causa_rechazo || r.CAUSA_RECHAZO || r['Causa Rechazo'] || '-';
        const estimado = Number(r.estimado_a_facturar ?? r.facturacion ?? r.Facturacion ?? 0);
        const aprobado = Number(r.total_aprobado ?? r.REAL_FACTURADO ?? r['Total  Aprobado'] ?? 0);

        let estadoClase = "st pe";
        let estadoTexto = aprobReg;
        if (aprobReg.includes("ACEPTADO")) {
            estadoClase = "st ok";
            estadoTexto = "Aprobado";
        } else if (aprobReg.includes("RECHAZADO")) {
            estadoClase = "st re";
            estadoTexto = "Rechazado";
        }

        html += `
            <tr>
                <td><span class="ot">${idOt}</span></td>
                <td><span class="cause">${departamento}</span></td>
                <td><span class="${estadoClase}">${estadoTexto}</span></td>
                <td style="color: #64748b; font-weight: 600;">${causa}</td>
                <td>${formatMoney(estimado)}</td>
                <td style="font-weight: 700; color: #0f172a;">${formatMoney(aprobado)}</td>
                <td style="text-align: center;">
                    <button type="button" style="background: none; border: none; cursor: pointer; color: #2563eb; font-weight: 700; font-size: 0.82rem;">Ver detalle</button>
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
    document.getElementById('txtPorcentajeCumplimientoNota').innerText = `0% de cumplimiento de tu meta`;
    const tbody = document.getElementById('rows');
    if (tbody) tbody.innerHTML = '';
    const emptyMsg = document.getElementById('empty');
    if (emptyMsg) emptyMsg.hidden = false;
}

function formatMoney(amount) {
    return '$ ' + Number(amount || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
