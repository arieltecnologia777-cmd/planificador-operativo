const API_BASE_URL = "https://facturacion.modulo-de-exclusiones.workers.dev/api";
const FACTURACION_API_URL = `${API_BASE_URL}/facturacion`;
const VERIFICAR_KEY_URL = `${API_BASE_URL}/verificar-key`;
const IMPORTAR_API_URL = `${API_BASE_URL}/facturacion/importar`;

let tecnicosData = [];
let registrosCrudos = [];
let chartTendencia = null;
let chartGauge = null;
let listaNotificacionesCambios = [];

// --- Meta fija x técnico ---
const META_FIJA_TECNICO = 9500000;

// Metas fijas exactas por regional y la suma total global
const METAS_REGIONALES = {
    "R1": 381140000,
    "R2": 133000000
};
const META_GLOBAL_TOTAL = 514140000;

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosDesdeAPI();
});

// GET: Cargar registros desde Cloudflare D1
async function cargarDatosDesdeAPI() {
    try {
        console.log("Consultando API en:", FACTURACION_API_URL);
        const response = await fetch(FACTURACION_API_URL);
        if (response.ok) {
            registrosCrudos = await response.json();
            console.log("Registros crudos recibidos de D1:", registrosCrudos);
            
            if (Array.isArray(registrosCrudos) && registrosCrudos.length > 0) {
                poblarSelectsFiltros(registrosCrudos);
                aplicarFiltrosGlobales();
                verificarIncrementosAvance(registrosCrudos);
            } else {
                console.warn("La base de datos D1 devolvió un arreglo vacío.");
                renderTable([]);
                actualizarKPIsGenerales([], [], "TODOS");
            }
        }
    } catch (err) {
        console.warn("No se pudieron obtener datos de la API:", err);
        renderTable([]);
        actualizarKPIsGenerales([], [], "TODOS");
    }
}

// Poblar los selects del acordeón de filtros dinámicamente
function poblarSelectsFiltros(rows) {
    const regiones = new Set();
    const meses = new Set();
    const perfiles = new Set();
    const aprobaciones = new Set();

    rows.forEach(r => {
        const reg = r.region || r.REGION || r.departamento || r.DEPARTAMENTO || r['REGIONAL2'] || r[' REGIONAL2 '];
        const mes = r.mes || r.MES;
        const perfil = r.perfil_wfm || r.PERFIL_WFM || r['PERFIL WFM'];
        const aprob = r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'];

        if (reg) regiones.add(String(reg).trim());
        if (mes) meses.add(String(mes).trim());
        if (perfil) perfiles.add(String(perfil).trim());
        if (aprob) aprobaciones.add(String(aprob).trim());
    });

    llenarSelectHTML('filtroRegion', regiones);
    llenarSelectHTML('filtroMes', meses);
    llenarSelectHTML('filtroPerfilWfm', perfiles);
    llenarSelectHTML('filtroAprobacion', aprobaciones);
}

function llenarSelectHTML(elementId, setValues) {
    const select = document.getElementById(elementId);
    if (!select) return;
    let html = `<option value="TODOS">Todos</option>`;
    Array.from(setValues).sort().forEach(val => {
        html += `<option value="${val}">${val}</option>`;
    });
    select.innerHTML = html;
}

// Filtrar registros crudos según los filtros
function aplicarFiltrosGlobales() {
    const fRegion = document.getElementById('filtroRegion')?.value || "TODOS";
    const fMes = document.getElementById('filtroMes')?.value || "TODOS";
    const fPerfil = document.getElementById('filtroPerfilWfm')?.value || "TODOS";
    const fAprob = document.getElementById('filtroAprobacion')?.value || "TODOS";
    const searchVal = document.getElementById('searchInput')?.value.toLowerCase() || "";

    const registrosParaMeta = registrosCrudos.filter(r => {
        const reg = String(r.region || r.REGION || r.departamento || r.DEPARTAMENTO || r['REGIONAL2'] || r[' REGIONAL2 '] || "").trim();
        const matchReg = fRegion === "TODOS" || reg === fRegion;
        return matchReg;
    });

    const registrosParaGrafica = registrosCrudos.filter(r => {
        const reg = String(r.region || r.REGION || r.departamento || r.DEPARTAMENTO || r['REGIONAL2'] || r[' REGIONAL2 '] || "").trim();
        const perfil = String(r.perfil_wfm || r.PERFIL_WFM || r['PERFIL WFM'] || "").trim();
        const aprob = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").trim();
        const tecnico = perfil.toLowerCase();

        const matchReg = fRegion === "TODOS" || reg === fRegion;
        const matchPerfil = fPerfil === "TODOS" || perfil === fPerfil;
        const matchAprob = fAprob === "TODOS" || aprob === fAprob;
        const matchSearch = tecnico.includes(searchVal);

        return matchReg && matchPerfil && matchAprob && matchSearch;
    });

    const filtradosCompletos = registrosCrudos.filter(r => {
        const reg = String(r.region || r.REGION || r.departamento || r.DEPARTAMENTO || r['REGIONAL2'] || r[' REGIONAL2 '] || "").trim();
        const mes = String(r.mes || r.MES || "").trim();
        const perfil = String(r.perfil_wfm || r.PERFIL_WFM || r['PERFIL WFM'] || "").trim();
        const aprob = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").trim();
        const tecnico = perfil.toLowerCase();

        const matchReg = fRegion === "TODOS" || reg === fRegion;
        const matchMes = fMes === "TODOS" || mes === fMes;
        const matchPerfil = fPerfil === "TODOS" || perfil === fPerfil;
        const matchAprob = fAprob === "TODOS" || aprob === fAprob;
        const matchSearch = tecnico.includes(searchVal);

        return matchReg && matchMes && matchPerfil && matchAprob && matchSearch;
    });

    tecnicosData = procesarDatosParaVista(filtradosCompletos);
    renderTable(tecnicosData);
    actualizarKPIsGenerales(filtradosCompletos, registrosParaMeta, fRegion);
    renderizarEstadoRegional(filtradosCompletos);
    initChartsDinamicos(registrosParaGrafica, fRegion);
}

function resetFiltros() {
    if (document.getElementById('filtroRegion')) document.getElementById('filtroRegion').value = "TODOS";
    if (document.getElementById('filtroMes')) document.getElementById('filtroMes').value = "TODOS";
    if (document.getElementById('filtroPerfilWfm')) document.getElementById('filtroPerfilWfm').value = "TODOS";
    if (document.getElementById('filtroAprobacion')) document.getElementById('filtroAprobacion').value = "TODOS";
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = "";
    aplicarFiltrosGlobales();
}

// Agrupar registros por técnico
function procesarDatosParaVista(rows) {
    const mapaTecnicos = {};

    rows.forEach(r => {
        const nombreTecnico = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || r.perfil_wfm || r.PERFIL_WFM || "SIN PROGRAMACION";
        const regional = r.region || r.REGION || r.departamento || r.DEPARTAMENTO || r['REGIONAL2'] || r[' REGIONAL2 '] || "GENERAL";
        
        if (!mapaTecnicos[nombreTecnico]) {
            mapaTecnicos[nombreTecnico] = {
                nombre: nombreTecnico,
                regional: regional,
                meta: META_FIJA_TECNICO,
                aprobado: 0,
                rechazado: 0,
                subsanado: 0,
                efectividad: 0,
                estado: "No cumple"
            };
        }

        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();
        const estAceptar = aprobReg.includes("ACEPTADO");
        const estRechazar = aprobReg.includes("RECHAZADO");

        const montoBase = Number(r.estimado_a_facturar ?? r.facturacion ?? r.Facturacion ?? 0);
        const aprobadoVal = estAceptar ? Number(r.total_aprobado ?? r.REAL_FACTURADO ?? r['Total  Aprobado'] ?? 0) : 0;
        const rechazadoVal = estRechazar ? montoBase : 0;
        const subsanadoVal = Number(r.trasiego_esp ?? 0);

        mapaTecnicos[nombreTecnico].aprobado += aprobadoVal;
        mapaTecnicos[nombreTecnico].rechazado += rechazadoVal;
        mapaTecnicos[nombreTecnico].subsanado += subsanadoVal;
    });

    return Object.values(mapaTecnicos).map(t => {
        t.efectividad = t.meta > 0 ? Math.round((t.aprobado / t.meta) * 100) : 0;
        t.estado = t.efectividad >= 100 ? "Cumple" : "No cumple";
        return t;
    });
}

// Actualizar Tarjetas KPI generales
function actualizarKPIsGenerales(rowsCompletos, rowsMeta, fRegion) {
    let totalMeta = META_GLOBAL_TOTAL;
    if (fRegion && fRegion !== "TODOS" && METAS_REGIONALES[fRegion]) {
        totalMeta = METAS_REGIONALES[fRegion];
    }

    let totalEjecutado = rowsCompletos.reduce((acc, r) => acc + Number(r.estimado_a_facturar ?? r.facturacion ?? r.Facturacion ?? 0), 0);

    let totalAprobado = rowsCompletos.reduce((acc, r) => {
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();
        if (aprobReg.includes("ACEPTADO")) {
            return acc + Number(r.total_aprobado ?? r.REAL_FACTURADO ?? r['Total  Aprobado'] ?? 0);
        }
        return acc;
    }, 0);

    let totalRechazado = rowsCompletos.reduce((acc, r) => {
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();
        if (aprobReg.includes("RECHAZADO")) {
            return acc + Number(r.estimado_a_facturar ?? r.facturacion ?? r.Facturacion ?? 0);
        }
        return acc;
    }, 0);

    let totalEnTramite = rowsCompletos.reduce((acc, r) => {
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();
        if (!aprobReg.includes("ACEPTADO") && !aprobReg.includes("RECHAZADO")) {
            return acc + Number(r.estimado_a_facturar ?? r.facturacion ?? r.Facturacion ?? 0);
        }
        return acc;
    }, 0);
    
    let efectividadGlobal = totalMeta > 0 ? Math.round((totalAprobado / totalMeta) * 100) : 0;

    if(document.getElementById('kpiMeta')) document.getElementById('kpiMeta').innerText = formatMoney(totalMeta);
    if(document.getElementById('kpiEjecutado')) document.getElementById('kpiEjecutado').innerText = formatMoney(totalEjecutado);
    if(document.getElementById('kpiAprobado')) document.getElementById('kpiAprobado').innerText = formatMoney(totalAprobado);
    if(document.getElementById('kpiRechazado')) document.getElementById('kpiRechazado').innerText = formatMoney(totalRechazado);
    if(document.getElementById('kpiEnTramite')) document.getElementById('kpiEnTramite').innerText = formatMoney(totalEnTramite);
    if(document.getElementById('kpiEfectividad')) document.getElementById('kpiEfectividad').innerText = efectividadGlobal + '%';

    let porcMeta = totalMeta > 0 ? 100 : 0;
    let porcEjecutado = totalMeta > 0 ? Math.min(100, Math.round((totalEjecutado / totalMeta) * 100)) : 0;
    let porcAprobado = totalMeta > 0 ? Math.min(100, Math.round((totalAprobado / totalMeta) * 100)) : 0;
    let porcRechazado = totalMeta > 0 ? Math.min(100, Math.round((totalRechazado / totalMeta) * 100)) : 0;
    let porcEnTramite = totalMeta > 0 ? Math.min(100, Math.round((totalEnTramite / totalMeta) * 100)) : 0;

    if(document.getElementById('barMeta')) document.getElementById('barMeta').style.width = porcMeta + '%';
    if(document.getElementById('txtPorcMeta')) document.getElementById('txtPorcMeta').innerText = porcMeta + '%';

    if(document.getElementById('barEjecutado')) document.getElementById('barEjecutado').style.width = porcEjecutado + '%';
    if(document.getElementById('txtPorcEjecutado')) document.getElementById('txtPorcEjecutado').innerText = porcEjecutado + '%';

    if(document.getElementById('barAprobado')) document.getElementById('barAprobado').style.width = porcAprobado + '%';
    if(document.getElementById('txtPorcAprobado')) document.getElementById('txtPorcAprobado').innerText = porcAprobado + '%';

    if(document.getElementById('barRechazado')) document.getElementById('barRechazado').style.width = porcRechazado + '%';
    if(document.getElementById('txtPorcRechazado')) document.getElementById('txtPorcRechazado').innerText = porcRechazado + '%';

    if(document.getElementById('barEnTramite')) document.getElementById('barEnTramite').style.width = porcEnTramite + '%';
    if(document.getElementById('txtPorcEnTramite')) document.getElementById('txtPorcEnTramite').innerText = porcEnTramite + '%';

    const ctxGauge = document.getElementById('gaugeEfectividad');
    if (ctxGauge) {
        if (chartGauge) chartGauge.destroy();
        chartGauge = new Chart(ctxGauge, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [efectividadGlobal, Math.max(0, 100 - efectividadGlobal)],
                    backgroundColor: ['#8b5cf6', '#e2e8f0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: { tooltip: { enabled: false }, legend: { display: false } }
            }
        });
    }
}

// Gráfica de tendencia anual estándar original
function initChartsDinamicos(records, fRegion = "TODOS") {
    const ctxTendencia = document.getElementById('tendenciaChart');
    if (!ctxTendencia) return;

    const mesesLabels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const acumuladoMeses = new Array(12).fill(0);

    let metaRegionalTotal = META_GLOBAL_TOTAL;
    if (fRegion && fRegion !== "TODOS" && METAS_REGIONALES[fRegion]) {
        metaRegionalTotal = METAS_REGIONALES[fRegion];
    }
    
    const metaLineData = new Array(12).fill(metaRegionalTotal);

    records.forEach(r => {
        const mesStr = String(r.mes || r.MES || "").trim();
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();
        
        if (aprobReg.includes("ACEPTADO")) {
            const montoAprobado = Number(r.total_aprobado ?? r.REAL_FACTURADO ?? r['Total  Aprobado'] ?? 0);
            
            const match = mesStr.match(/\d{4}\s+(\d{2})/);
            if (match && match[1]) {
                const mesIndex = parseInt(match[1], 10) - 1;
                if (mesIndex >= 0 && mesIndex < 12) {
                    acumuladoMeses[mesIndex] += montoAprobado;
                }
            } else {
                const upperMes = mesStr.toUpperCase();
                const keywords = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
                for (let i = 0; i < keywords.length; i++) {
                    if (upperMes.includes(keywords[i])) {
                        acumuladoMeses[i] += montoAprobado;
                        break;
                    }
                }
            }
        }
    });

    if (chartTendencia) chartTendencia.destroy();
    
    chartTendencia = new Chart(ctxTendencia, {
        type: 'line',
        data: {
            labels: mesesLabels,
            datasets: [
                {
                    label: 'Ejecución',
                    data: acumuladoMeses,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#2563eb',
                    pointRadius: 4,
                    order: 1
                },
                {
                    label: 'Meta',
                    data: metaLineData,
                    borderColor: '#94a3b8',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    order: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: { 
                legend: { 
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: { boxWidth: 12, font: { weight: 'bold', size: 11 } }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#ffffff',
                    titleColor: '#0f172a',
                    bodyColor: '#334155',
                    borderColor: '#cbd5e0',
                    borderWidth: 1,
                    padding: 12,
                    boxWidth: 10,
                    boxHeight: 10,
                    usePointStyle: true,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            label += '$ ' + Number(context.raw || 0).toLocaleString('es-CO');
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: { 
                    min: 0, 
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) return '$ ' + (value / 1000000).toFixed(0) + 'M';
                            return '$ ' + value;
                        }
                    }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

// Renderizar Estado Regional compacto y ordenado
function renderizarEstadoRegional(rows) {
    const container = document.getElementById('estadoRegionalContainer');
    if (!container) return;

    const mapaRegiones = {};
    rows.forEach(r => {
        const reg = r.region || r.REGION || r.departamento || r.DEPARTAMENTO || r['REGIONAL2'] || r[' REGIONAL2 '] || "GENERAL";
        if (!mapaRegiones[reg]) mapaRegiones[reg] = { aprobado: 0 };
        
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();
        if (aprobReg.includes("ACEPTADO")) {
            mapaRegiones[reg].aprobado += Number(r.total_aprobado ?? r.REAL_FACTURADO ?? 0);
        }
    });

    let html = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: grid; grid-template-columns: 75px 65px 1fr; align-items: center; padding: 2px 4px; font-size: 0.68rem; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; margin-bottom: 2px;">
                <div>Regional</div>
                <div style="text-align: center;">Efectiv.</div>
                <div style="text-align: right;">Total</div>
            </div>
    `;

    for (const [reg, val] of Object.entries(mapaRegiones)) {
        const metaRegional = METAS_REGIONALES[reg] || META_GLOBAL_TOTAL;
        const ef = metaRegional > 0 ? Math.round((val.aprobado / metaRegional) * 100) : 0;
        
        const colorClass = ef >= 100 ? "reg-pill-green" : (ef >= 70 ? "reg-pill-yellow" : "reg-pill-red");
        const dotColor = ef >= 100 ? "#22c55e" : (ef >= 70 ? "#f59e0b" : "#ef4444");

        html += `
            <div style="display: grid; grid-template-columns: 75px 65px 1fr; align-items: center; padding: 5px 4px; border-bottom: 1px solid #f1f5f9;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="width: 7px; height: 7px; border-radius: 50%; background: ${dotColor}; display: inline-block;"></span>
                    <span style="font-weight: 700; color: #0f172a; font-size: 0.82rem;">${reg}</span>
                </div>
                <div style="text-align: center;">
                    <span class="reg-pill ${colorClass}" style="display: inline-block; padding: 1px 5px; border-radius: 5px; font-size: 0.72rem; font-weight: bold;">${ef}%</span>
                </div>
                <div style="text-align: right; font-weight: 700; color: #334155; font-size: 0.8rem;">
                    ${formatMoney(val.aprobado)}
                </div>
            </div>
        `;
    }
    html += `</div>`;
    container.innerHTML = html || '<div style="color: #64748b; font-size: 0.82rem; text-align: center; padding: 8px;">Sin datos regionales</div>';
}

function formatMoney(amount) {
    return '$ ' + Number(amount || 0).toLocaleString('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function renderTable(records) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if(records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px; color: #64748b;">No hay registros disponibles para los filtros seleccionados.</td></tr>`;
        return;
    }

    let html = '';
    records.forEach((r, index) => {
        const badgeClass = r.estado === "Cumple" ? "badge-progreso" : "badge-riesgo";
        const barColor = r.efectividad >= 100 ? "#22c55e" : (r.efectividad >= 70 ? "#f59e0b" : "#ef4444");

        html += `
            <tr>
                <td style="font-weight: 700; color: #1e293b;">${r.nombre}</td>
                <td>${formatMoney(r.meta)}</td>
                <td>${formatMoney(r.aprobado)}</td>
                <td>${formatMoney(r.rechazado)}</td>
                <td>${formatMoney(r.subsanado)}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: bold; min-width: 32px;">${r.efectividad}%</span>
                        <div style="width: 80px; background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${Math.min(100, r.efectividad)}%; background: ${barColor}; height: 100%;"></div>
                        </div>
                    </div>
                </td>
                <td><span class="badge-status ${badgeClass}">${r.estado}</span></td>
                <td style="text-align: center;">
                    <button type="button" onclick="abrirDetalleTecnico(${index})" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 5px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.78rem;">👁️ Ver detalles</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}
