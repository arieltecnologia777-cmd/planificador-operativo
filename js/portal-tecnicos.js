const API_BASE_URL = "https://facturacion.modulo-de-exclusiones.workers.dev/api";
const FACTURACION_API_URL = `${API_BASE_URL}/facturacion`;

let registrosCrudosTecnicos = [];
const META_BASE_MENSUAL_TECNICO = 9500000;

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosTecnicosDesdeAPI();

    const selectTecnico = document.getElementById('tec');
    if (selectTecnico) {
        selectTecnico.addEventListener('change', (e) => {
            procesarYRenderizarPortalTecnico(e.target.value);
        });
    }
});

async function cargarDatosTecnicosDesdeAPI() {
    try {
        const response = await fetch(FACTURACION_API_URL);
        if (response.ok) {
            registrosCrudosTecnicos = await response.json();
            if (Array.isArray(registrosCrudosTecnicos) && registrosCrudosTecnicos.length > 0) {
                poblarSelectTecnicosDinamico(registrosCrudosTecnicos);
            } else {
                renderizarPortalVacio();
            }
        }
    } catch (err) {
        console.error("Error al conectar con la API de facturación:", err);
        renderizarPortalVacio();
    }
}

function poblarSelectTecnicosDinamico(rows) {
    const tecnicosSet = new Set();
    rows.forEach(r => {
        const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfil = String(rawPerfil).replace(/["']/g, "").trim();
        if (perfil && perfil !== "SIN PROGRAMACION") {
            tecnicosSet.add(perfil);
        }
    });

    const select = document.getElementById('tec');
    if (!select) return;

    let html = '';
    Array.from(tecnicosSet).sort().forEach(tec => {
        html += `<option value="${tec}">${tec}</option>`;
    });
    select.innerHTML = html;

    // Seleccionamos por defecto el primero o mantenemos el valor actual
    if (select.options.length > 0) {
        select.selectedIndex = 0;
        procesarYRenderizarPortalTecnico(select.value);
    }
}

function procesarYRenderizarPortalTecnico(nombreTecnico) {
    const tecnicoBuscado = String(nombreTecnico || "").trim().toUpperCase();
    
    // Filtramos los registros correspondientes exclusivamente a este técnico
    const misRegistros = registrosCrudosTecnicos.filter(r => {
        const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfil = String(rawPerfil).replace(/["']/g, "").trim().toUpperCase();
        return perfil === tecnicoBuscado;
    });

    // Extraemos los meses únicos presentes en las órdenes de este técnico para calcular el periodo dinámico
    const mesesSet = new Set();
    misRegistros.forEach(r => {
        const mes = String(r.mes || r.MES || "").trim();
        if (mes) mesesSet.add(mes);
    });
    const cantidadMeses = Math.max(1, mesesSet.size);

    // Cálculos de KPIs
    let metaAsignadaTotal = META_BASE_MENSUAL_TECNICO * cantidadMeses;
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

    // 1. Actualizar Tarjetas de KPIs sin datos quemados
    document.getElementById('kpiMetaAsignada').innerText = formatMoney(metaAsignadaTotal);
    document.getElementById('kpiMontoAprobado').innerText = formatMoney(montoAprobadoTotal);
    document.getElementById('kpiMontoRechazado').innerText = formatMoney(montoRechazadoTotal);
    document.getElementById('kpiMontoSubsanado').innerText = formatMoney(montoSubsanadoTotal);

    let porcentajeCumplimiento = metaAsignadaTotal > 0 ? Math.round((montoAprobadoTotal / metaAsignadaTotal) * 100) : 0;
    document.getElementById('txtPorcentajeCumplimientoNota').innerText = `${porcentajeCumplimiento}% de cumplimiento de tu meta`;

    // 2. Actualizar la Barra de Estado General del Periodo
    actualizarBarraEstadoGeneralPeriodo(montoAprobadoTotal, metaAsignadaTotal, porcentajeCumplimiento, cantidadMeses);

    // 3. Renderizar la Tabla Detalle de Órdenes de Trabajo del Técnico
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
        legendMeta.textContent = `Meta mensual (${meses} ${meses === 1 ? 'mes' : 'meses'}): $${meta.toLocaleString('es-CO')}`;
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
// Añade este fragmento dentro de tu lógica al momento de cargar los datos de la API:

function poblarSelectoresYFiltros(rows) {
    const tecnicosSet = new Set();
    const mesesSet = new Set();

    rows.forEach(r => {
        const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfil = String(rawPerfil).replace(/["']/g, "").trim();
        if (perfil && perfil !== "SIN PROGRAMACION") tecnicosSet.add(perfil);

        // Capturamos el mes tal como viene de D1 (ej. "2026 10 OCTUBRE")
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
    }

    // 2. Poblar select de meses reales de D1
    const selectMes = document.getElementById('filtroMesTecnico');
    if (selectMes) {
        let htmlMes = `<option value="TODOS">📅 Todos los periodos (${mesesSet.size} meses)</option>`;
        // Ordenar alfabéticamente o cronológicamente según el formato "YYYY MM NOMBRE"
        Array.from(mesesSet).sort().forEach(mes => {
            htmlMes += `<option value="${mes}">${mes}</option>`;
        });
        selectMes.innerHTML = htmlMes;
    }

    // Eventos de cambio en los filtros
    if (selectTec) {
        selectTec.addEventListener('change', () => ejecutarFiltroYRenderizado());
    }
    if (selectMes) {
        selectMes.addEventListener('change', () => ejecutarFiltroYRenderizado());
    }

    // Render inicial con el primer técnico y todos los meses o por defecto
    if (selectTec && selectTec.options.length > 0) {
        selectTec.selectedIndex = 0;
        ejecutarFiltroYRenderizado();
    }
}

function ejecutarFiltroYRenderizado() {
    const selectTec = document.getElementById('tec');
    const selectMes = document.getElementById('filtroMesTecnico');
    
    const tecnicoSeleccionado = selectTec ? selectTec.value : "";
    const mesSeleccionado = selectMes ? selectMes.value : "TODOS";

    procesarYRenderizarPortalTecnicoFiltrado(tecnicoSeleccionado, mesSeleccionado);
}

function procesarYRenderizarPortalTecnicoFiltrado(nombreTecnico, mesFiltro) {
    const tecnicoBuscado = String(nombreTecnico || "").trim().toUpperCase();
    
    // Filtramos los registros del técnico y el mes seleccionado (si no es "TODOS")
    const misRegistros = registrosCrudosTecnicos.filter(r => {
        const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfil = String(rawPerfil).replace(/["']/g, "").trim().toUpperCase();
        const mesReg = String(r.mes || r.MES || "").trim();

        const matchTecnico = perfil === tecnicoBuscado;
        const matchMes = (mesFiltro === "TODOS" || mesReg === mesFiltro);

        return matchTecnico && matchMes;
    });

    // Si se seleccionó "TODOS", contamos cuántos meses únicos tiene activos ese técnico
    let mesesSet = new Set();
    misRegistros.forEach(r => {
        const m = String(r.mes || r.MES || "").trim();
        if (m) mesesSet.add(m);
    });
    
    // Cantidad de meses para multiplicar la base de la meta ($9.500.000 por mes)
    const cantidadMeses = mesFiltro === "TODOS" ? Math.max(1, mesesSet.size) : 1;
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

    // Actualizar KPIs en interfaz
    document.getElementById('kpiMetaAsignada').innerText = formatMoney(metaAsignadaTotal);
    document.getElementById('kpiMontoAprobado').innerText = formatMoney(montoAprobadoTotal);
    document.getElementById('kpiMontoRechazado').innerText = formatMoney(montoRechazadoTotal);
    document.getElementById('kpiMontoSubsanado').innerText = formatMoney(montoSubsanadoTotal);

    let porcentajeCumplimiento = metaAsignadaTotal > 0 ? Math.round((montoAprobadoTotal / metaAsignadaTotal) * 100) : 0;
    document.getElementById('txtPorcentajeCumplimientoNota').innerText = `${porcentajeCumplimiento}% de cumplimiento de tu meta`;

    // Actualizar barra de estado general
    actualizarBarraEstadoGeneralPeriodo(montoAprobadoTotal, metaAsignadaTotal, porcentajeCumplimiento, cantidadMeses);

    // Renderizar tabla
    renderizarTablaOrdenesTecnico(misRegistros);
}
