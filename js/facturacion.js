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

// Metas mensuales exactas por departamento (redondeadas sin decimales)
const METAS_DEPARTAMENTOS = {
    "MEDELLIN": 129711538,
    "ANTIOQUIA": 129711538,
    "VALLEDUPAR": 123500000,
    "CESAR": 123500000,
    "RIOHACHA": 199500000,
    "LA GUAJIRA": 199500000,
    "SAN ANDRES": 9500000,
    "SAI": 9500000
};

// Metas fijas exactas por regional y la suma total global mensual (redondeadas sin decimales)
const METAS_REGIONALES = {
    "R1": 332500000, // Cesar + La Guajira + SAI
    "R2": 129711538  // Medellin / Antioquia
};
const META_GLOBAL_TOTAL_MENSUAL = 462211538;

// Lista fija de los 4 departamentos requeridos
const LISTA_DEPARTAMENTOS_FIJOS = ["ANTIOQUIA", "CESAR", "LA GUAJIRA", "SAI"];

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
                actualizarKPIsGenerales([], [], [], [], "TODOS", 1);
            }
        }
    } catch (err) {
        console.warn("No se pudieron obtener datos de la API:", err);
        renderTable([]);
        actualizarKPIsGenerales([], [], [], [], "TODOS", 1);
    }
}

// Poblar dinámicamente los menús desplegables estilo Excel
function poblarSelectsFiltros(rows) {
    const regiones = new Set();
    const departamentos = new Set();
    const meses = new Set();
    const perfiles = new Set();
    const aprobaciones = new Set();

    rows.forEach(r => {
        const reg = r.region || r.REGION || r['REGIONAL2'] || r[' REGIONAL2 '];
        const depto = r.departamento || r.DEPARTAMENTO || r.dep;
        const mes = r.mes || r.MES;
        
        const rawTecnico = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "SIN PROGRAMACION";
        const perfil = String(rawTecnico).replace(/["']/g, "").trim();

        const aprob = r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'];

        if (reg) regiones.add(String(reg).trim().toUpperCase());
        if (depto) departamentos.add(String(depto).trim().toUpperCase());
        if (mes) meses.add(String(mes).trim());
        if (perfil) perfiles.add(perfil.toUpperCase());
        if (aprob) aprobaciones.add(String(aprob).trim());
    });

    llenarDropdownHTML('Region', regiones);
    llenarDropdownHTML('Departamento', departamentos);
    llenarDropdownHTML('Mes', meses);
    llenarDropdownHTML('PerfilWfm', perfiles);
    llenarDropdownHTML('Aprobacion', aprobaciones);
}

function llenarDropdownHTML(nombreFiltro, setValues) {
    const container = document.getElementById('listaCheck' + nombreFiltro);
    if (!container) return;
    
    let html = '';
    Array.from(setValues).sort().forEach(val => {
        html += `
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #1e293b; cursor: pointer; font-weight: 600; padding: 2px 4px;" onclick="event.stopPropagation()">
                <input type="checkbox" name="filtro${nombreFiltro}" value="${val}" checked onchange="aplicarFiltrosGlobales()" style="cursor: pointer;">
                ${val}
            </label>
        `;
    });
    container.innerHTML = html;
    actualizarLabelBotonFiltro(nombreFiltro);
}

function seleccionarTodoGeneral(nombreFiltro, marcar) {
    const checkboxes = document.querySelectorAll(`input[name="filtro${nombreFiltro}"]`);
    checkboxes.forEach(cb => {
        if (cb.parentElement.style.display !== 'none') {
            cb.checked = marcar;
        }
    });
    aplicarFiltrosGlobales();
}

function marcarTodosDropdown(nombreFiltro, marcar) {
    const chkTodo = document.getElementById('chkTodo' + nombreFiltro);
    if (chkTodo) chkTodo.checked = marcar;

    // Extraemos TODOS los valores únicos posibles desde los registros originales sin importar la cascada
    const setValores = new Set();
    registrosCrudos.forEach(r => {
        let val = "";
        if (nombreFiltro === 'Region') val = r.region || r.REGION || r['REGIONAL2'] || r[' REGIONAL2 '];
        else if (nombreFiltro === 'Departamento') val = r.departamento || r.DEPARTAMENTO || r.dep;
        else if (nombreFiltro === 'Mes') val = r.mes || r.MES;
        else if (nombreFiltro === 'PerfilWfm') val = String(r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "").replace(/["']/g, "").trim();
        else if (nombreFiltro === 'Aprobacion') val = r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'];

        if (val) setValores.add(String(val).trim().toUpperCase());
    });

    const container = document.getElementById('listaCheck' + nombreFiltro);
    if (container) {
        let html = '';
        Array.from(setValores).sort().forEach(val => {
            html += `
                <label style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #1e293b; cursor: pointer; font-weight: 600; padding: 2px 4px;" onclick="event.stopPropagation()">
                    <input type="checkbox" name="filtro${nombreFiltro}" value="${val}" ${marcar ? 'checked' : ''} onchange="aplicarFiltrosGlobales()" style="cursor: pointer;">
                    ${val}
                </label>
            `;
        });
        container.innerHTML = html;
    }

    actualizarLabelBotonFiltro(nombreFiltro);

    // Si borramos el filtro de esta cajita, también reseteamos el filtro superior cruzado para este campo específico 
    // y aplicamos para que la tabla muestre los datos correspondientes sin restricciones cruzadas agresivas
    const regionesSeleccionadas = nombreFiltro === 'Region' && !marcar ? [] : obtenerValoresSeleccionados('Region');
    const deptosSeleccionados = nombreFiltro === 'Departamento' && marcar ? Array.from(setValores) : obtenerValoresSeleccionados('Departamento');
    const mesesSeleccionados = obtenerValoresSeleccionados('Mes');
    const perfilesSeleccionados = obtenerValoresSeleccionados('PerfilWfm');
    const aprobSeleccionadas = obtenerValoresSeleccionados('Aprobacion');
    const searchVal = document.getElementById('searchInput')?.value.toLowerCase() || "";

    const regCheck = regionesSeleccionadas.length > 0 ? regionesSeleccionadas : Array.from(document.querySelectorAll('input[name="filtroRegion"]')).map(cb => cb.value);
    const depCheck = deptosSeleccionados.length > 0 ? deptosSeleccionados : Array.from(document.querySelectorAll('input[name="filtroDepartamento"]')).map(cb => cb.value);
    const mesCheck = mesesSeleccionados.length > 0 ? mesesSeleccionados : Array.from(document.querySelectorAll('input[name="filtroMes"]')).map(cb => cb.value);
    const perfCheck = perfilesSeleccionados.length > 0 ? perfilesSeleccionados : Array.from(document.querySelectorAll('input[name="filtroPerfilWfm"]')).map(cb => cb.value);
    const aprobCheck = aprobSeleccionadas.length > 0 ? aprobSeleccionadas : Array.from(document.querySelectorAll('input[name="filtroAprobacion"]')).map(cb => cb.value);

    const registrosParaMeta = registrosCrudos.filter(r => {
        const reg = String(r.region || r.REGION || r['REGIONAL2'] || r[' REGIONAL2 '] || "").trim().toUpperCase();
        const depto = String(r.departamento || r.DEPARTAMENTO || "").trim().toUpperCase();
        const mes = String(r.mes || r.MES || "").trim();
        return regCheck.includes(reg) && depCheck.includes(depto) && mesCheck.includes(mes);
    });

    const filtradosCompletos = registrosCrudos.filter(r => {
        const reg = String(r.region || r.REGION || r['REGIONAL2'] || r[' REGIONAL2 '] || "").trim().toUpperCase();
        const depto = String(r.departamento || r.DEPARTAMENTO || "").trim().toUpperCase();
        const mes = String(r.mes || r.MES || "").trim();
        const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfil = String(rawPerfil).replace(/["']/g, "").trim().toUpperCase();
        const aprob = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").trim();

        return regCheck.includes(reg) && 
               depCheck.includes(depto) && 
               mesCheck.includes(mes) && 
               perfCheck.includes(perfil) && 
               aprobCheck.includes(aprob) && 
               perfil.toLowerCase().includes(searchVal);
    });

    tecnicosData = procesarDatosParaVista(filtradosCompletos, mesCheck.length);
    renderTable(tecnicosData);
    
    const primerMesFiltro = mesCheck.length === 1 ? mesCheck[0] : "TODOS";
    actualizarKPIsGenerales(filtradosCompletos, registrosParaMeta, regCheck, depCheck, primerMesFiltro, mesCheck.length);
    renderizarEstadoRegional(filtradosCompletos);
}
function procesarDatosParaVista(rows, cantidadMeses = 1) {
    const mapaTecnicos = {};
    let mesesMultiplicador = cantidadMeses < 1 ? 1 : cantidadMeses;
    const metaDinamicaTecnico = META_FIJA_TECNICO * mesesMultiplicador;

    rows.forEach(r => {
        const rawTecnico = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "SIN PROGRAMACION";
        const nombreTecnico = String(rawTecnico).replace(/["']/g, "").trim();

        const regional = r.region || r.REGION || r.departamento || r.DEPARTAMENTO || r['REGIONAL2'] || r[' REGIONAL2 '] || "GENERAL";
        
        if (!mapaTecnicos[nombreTecnico]) {
            mapaTecnicos[nombreTecnico] = {
                nombre: nombreTecnico,
                regional: regional,
                meta: metaDinamicaTecnico,
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

    const tecnicosArray = Object.values(mapaTecnicos).map(t => {
        t.efectividad = t.meta > 0 ? Math.round((t.aprobado / t.meta) * 100) : 0;
        t.estado = t.efectividad >= 100 ? "Cumple" : "No cumple";
        return t;
    });

    return tecnicosArray.sort((a, b) => b.efectividad - a.efectividad);
}

function actualizarKPIsGenerales(rowsCompletos, rowsMeta, regionesSel, deptosSel, fMes, totalMesesSeleccionados) {
    let cantidadMeses = totalMesesSeleccionados || 1;
    if (cantidadMeses < 1) cantidadMeses = 1;

    let baseMetaMensual = META_GLOBAL_TOTAL_MENSUAL;
    
    if (deptosSel.length === 1 && METAS_DEPARTAMENTOS[deptosSel[0]]) {
        baseMetaMensual = METAS_DEPARTAMENTOS[deptosSel[0]];
    } else if (regionesSel.length === 1 && METAS_REGIONALES[regionesSel[0]]) {
        baseMetaMensual = METAS_REGIONALES[regionesSel[0]];
    }

    let totalMeta = baseMetaMensual * cantidadMeses;
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
    
    let porcentajeAprobacion = totalMeta > 0 ? Math.round((totalAprobado / totalMeta) * 100) : 0;
    let porcentajeVisual = Math.min(100, porcentajeAprobacion);

    if(document.getElementById('kpiMeta')) document.getElementById('kpiMeta').innerText = formatMoney(totalMeta);
    if(document.getElementById('kpiEjecutado')) document.getElementById('kpiEjecutado').innerText = formatMoney(totalEjecutado);
    if(document.getElementById('kpiAprobado')) document.getElementById('kpiAprobado').innerText = formatMoney(totalAprobado);
    if(document.getElementById('kpiRechazado')) document.getElementById('kpiRechazado').innerText = formatMoney(totalRechazado);
    if(document.getElementById('kpiEnTramite')) document.getElementById('kpiEnTramite').innerText = formatMoney(totalEnTramite);

    let subTextoFiltros = cantidadMeses === 1 && fMes !== "TODOS" ? `Mes: ${fMes}` : `Meses seleccionados: ${cantidadMeses}`;
    let contenedorMetaCard = document.getElementById('kpiMeta')?.closest('.fact-kpi-card, div');
    if (contenedorMetaCard) {
        let subLabelMeta = contenedorMetaCard.querySelector('.sub-mes-filtrado');
        if (!subLabelMeta) {
            subLabelMeta = document.createElement('div');
            subLabelMeta.className = 'sub-mes-filtrado';
            subLabelMeta.style = "font-size: 0.8rem; color: #475569; font-weight: 700; margin-top: 4px;";
            contenedorMetaCard.appendChild(subLabelMeta);
        }
        subLabelMeta.innerText = subTextoFiltros;
    }

    let porcEjecutado = totalMeta > 0 ? Math.min(100, Math.round((totalEjecutado / totalMeta) * 100)) : 0;
    let porcAprobado = totalMeta > 0 ? Math.min(100, Math.round((totalAprobado / totalMeta) * 100)) : 0;
    let porcRechazado = totalMeta > 0 ? Math.min(100, Math.round((totalRechazado / totalMeta) * 100)) : 0;
    let porcEnTramite = totalMeta > 0 ? Math.min(100, Math.round((totalEnTramite / totalMeta) * 100)) : 0;

    if(document.getElementById('barEjecutado')) document.getElementById('barEjecutado').style.width = porcEjecutado + '%';
    if(document.getElementById('txtPorcEjecutado')) document.getElementById('txtPorcEjecutado').innerText = porcEjecutado + '%';

    if(document.getElementById('barAprobado')) document.getElementById('barAprobado').style.width = porcAprobado + '%';
    if(document.getElementById('txtPorcAprobado')) document.getElementById('txtPorcAprobado').innerText = porcAprobado + '%';

    if(document.getElementById('barRechazado')) document.getElementById('barRechazado').style.width = porcRechazado + '%';
    if(document.getElementById('txtPorcRechazado')) document.getElementById('txtPorcRechazado').innerText = porcRechazado + '%';

    if(document.getElementById('barEnTramite')) document.getElementById('barEnTramite').style.width = porcEnTramite + '%';
    if(document.getElementById('txtPorcEnTramite')) document.getElementById('txtPorcEnTramite').innerText = porcEnTramite + '%';

    let colorAprobacion = '#dc2626';
    if (porcentajeAprobacion >= 100) {
        colorAprobacion = '#16a34a';
    } else if (porcentajeAprobacion >= 70) {
        colorAprobacion = '#059669';
    } else if (porcentajeAprobacion >= 40) {
        colorAprobacion = '#f59e0b';
    }

    const ctxGauge = document.getElementById('gaugeEfectividad');
    if (ctxGauge) {
        if (chartGauge) chartGauge.destroy();
        chartGauge = new Chart(ctxGauge, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [porcentajeVisual, Math.max(0, 100 - porcentajeVisual)],
                    backgroundColor: [colorAprobacion, '#e2e8f0'],
                    borderWidth: 0,
                    borderRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '74%',
                plugins: { 
                    tooltip: { enabled: false }, 
                    legend: { display: false } 
                },
                animation: false
            },
            plugins: [{
                id: 'textCenterGauge',
                beforeDraw(chart) {
                    const { width, height, ctx } = chart;
                    ctx.restore();
                    const fontSize = (height / 80).toFixed(2);
                    ctx.font = `900 ${fontSize}rem Inter, sans-serif`;
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#0f172a';
                    const text = porcentajeAprobacion + '%';
                    const textX = Math.round((width - ctx.measureText(text).width) / 2);
                    const textY = height / 2;
                    ctx.fillText(text, textX, textY);
                    ctx.save();
                }
            }]
        });
    }
}

function initChartsDinamicos(records, fRegion = "TODOS", fDepto = "TODOS") {
    const ctxTendencia = document.getElementById('tendenciaChart');
    if (!ctxTendencia) return;

    const mesesLabels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const acumuladoMeses = new Array(12).fill(0);

    let metaMensualGrafica = META_GLOBAL_TOTAL_MENSUAL;
    if (fDepto.length === 1 && METAS_DEPARTAMENTOS[fDepto[0]]) {
        metaMensualGrafica = METAS_DEPARTAMENTOS[fDepto[0]];
    } else if (fRegion.length === 1 && METAS_REGIONALES[fRegion[0]]) {
        metaMensualGrafica = METAS_REGIONALES[fRegion[0]];
    }

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

    const metaLineData = new Array(12).fill(metaMensualGrafica);

    if (chartTendencia) chartTendencia.destroy();
    
    chartTendencia = new Chart(ctxTendencia, {
        type: 'line',
        data: {
            labels: mesesLabels,
            datasets: [
                {
                    label: 'Aprobado',
                    data: acumuladoMeses,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#2563eb',
                    pointRadius: 5,
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
            layout: { padding: { top: 18, bottom: 25 } },
            plugins: { 
                legend: { display: true, position: 'top', align: 'end', labels: { boxWidth: 12, font: { weight: 'bold', size: 11 } } },
                tooltip: { enabled: false }
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
        },
        plugins: [{
            id: 'etiquetasModernaPildoraCeros',
            afterDatasetsDraw(chart) {
                const { ctx } = chart;
                ctx.save();
                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    if (!meta.hidden && datasetIndex === 0) {
                        meta.data.forEach((element, index) => {
                            const value = dataset.data[index];
                            const { x, y } = element.getProps(['x', 'y'], true);
                            
                            let text = '$ 0';
                            if (value > 0) {
                                text = value >= 1000000 ? '$' + (value / 1000000).toFixed(1) + 'M' : '$ ' + value;
                            }
                            
                            ctx.font = 'bold 11px Segoe UI, Tahoma, sans-serif';
                            ctx.textAlign = 'center';
                            const esPar = index % 2 === 0;
                            const yPos = esPar ? y - 22 : y + 28;
                            
                            const textWidth = ctx.measureText(text).width;
                            const pillWidth = textWidth + 16;
                            const pillHeight = 22;
                            const pillX = x - pillWidth / 2;
                            const pillY = yPos - pillHeight / 2;
                            const radius = 11;

                            ctx.beginPath();
                            ctx.roundRect(pillX, pillY, pillWidth, pillHeight, radius);
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                            ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
                            ctx.shadowBlur = 6;
                            ctx.fill();
                            ctx.strokeStyle = '#e2e8f0';
                            ctx.lineWidth = 1;
                            ctx.stroke();

                            ctx.shadowColor = 'transparent';
                            ctx.fillStyle = '#0f172a';
                            ctx.fillText(text, x, yPos + 4);
                        });
                    }
                });
                ctx.restore();
            }
        }]
    });
}

function renderizarEstadoRegional(rows) {
    const container = document.getElementById('estadoRegionalContainer');
    if (!container) return;

    const mapaRegiones = {};
    rows.forEach(r => {
        const reg = r.region || r.REGION || r['REGIONAL2'] || r[' REGIONAL2 '] || "GENERAL";
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

    const regionesArray = Object.entries(mapaRegiones).map(([reg, val]) => {
        const metaRegional = METAS_REGIONALES[reg] || META_GLOBAL_TOTAL_MENSUAL;
        const ef = metaRegional > 0 ? Math.round((val.aprobado / metaRegional) * 100) : 0;
        return { reg, val, ef };
    }).sort((a, b) => b.ef - a.ef);

    regionesArray.forEach(item => {
        const { reg, val, ef } = item;
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
    });

    html += `</div>`;
    container.innerHTML = html || '<div style="color: #64748b; font-size: 0.82rem; text-align: center; padding: 8px;">Sin datos regionales</div>';
}

function abrirSubmodalDesgloseMatriz(tituloSubmodal, subtitleInfo, itemsDesglose) {
    let subModal = document.getElementById('modalSubDesgloseMatriz');
    if (!subModal) {
        subModal = document.createElement('div');
        subModal.id = 'modalSubDesgloseMatriz';
        subModal.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.75);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:inherit;";
        document.body.appendChild(subModal);
    }

    let filasHtml = '';
    let sumaTotalSub = 0;

    itemsDesglose.forEach(item => {
        sumaTotalSub += item.monto;
        filasHtml += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; font-weight: 800; color: #1e3a8a; text-align: center;">${item.id}</td>
                <td style="padding: 10px; color: #334155; font-weight: 700; text-transform: uppercase;">${item.depto}</td>
                <td style="padding: 10px; color: #dc2626; font-weight: 700; text-transform: uppercase;">${item.causa}</td>
                <td style="padding: 10px; text-align: right; font-weight: 700; color: #0f172a;">${formatMoney(item.monto)}</td>
            </tr>
        `;
    });

    if (itemsDesglose.length === 0) {
        filasHtml = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: #64748b;">No hay registros para esta selección.</td></tr>`;
    }

    subModal.innerHTML = `
        <div style="background:white; color:#333; border-radius:14px; width:680px; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 20px 35px rgba(0,0,0,0.35); overflow:hidden;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; padding:20px 25px 15px 25px; border-bottom:2px solid #e2e8f0; background:white; position:sticky; top:0; z-index:10;">
                <div>
                    <h3 style="margin:0; color:#1e3a8a; font-size:1.1rem; font-weight:900;">📋 ${tituloSubmodal}</h3>
                    <div style="font-size:0.82rem; color:#64748b; font-weight:600; margin-top:2px;">${subtitleInfo}</div>
                </div>
                <button type="button" onclick="document.getElementById('modalSubDesgloseMatriz').style.display='none'" style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748b; font-weight:bold;">&times;</button>
            </div>
            
            <div style="padding:20px 25px; overflow-y:auto; flex:1;">
                <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
                    <thead>
                        <tr style="background:#f8fafc; color:#334155; text-align:left; border-bottom:2px solid #e2e8f0;">
                            <th style="padding:10px; text-align:center;">ID</th>
                            <th style="padding:10px;">Departamento</th>
                            <th style="padding:10px;">Causa / Estado</th>
                            <th style="padding:10px; text-align:right;">Monto Estimado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasHtml}
                    </tbody>
                </table>

                <div style="margin-top:16px; padding:12px; background:#f8fafc; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-weight:900; color:#0f172a;">
                    <span>Total General:</span>
                    <span style="color:#0f172a; font-size:1.05rem;">${formatMoney(sumaTotalSub)}</span>
                </div>
            </div>

            <div style="padding:15px 25px; border-top:1px solid #e2e8f0; background:#f8fafc; text-align:right;">
                <button type="button" onclick="document.getElementById('modalSubDesgloseMatriz').style.display='none'" style="background:#2563eb; color:white; border:none; padding:8px 20px; border-radius:6px; cursor:pointer; font-weight:700; font-size:0.88rem;">Cerrar</button>
            </div>

        </div>
    `;
    subModal.style.display = 'flex';
}

function abrirModalEnTramite() {
    const regionesSeleccionadas = obtenerValoresSeleccionados('Region');
    const deptosSeleccionados = obtenerValoresSeleccionados('Departamento');
    const mesesSeleccionados = obtenerValoresSeleccionados('Mes');
    const searchVal = document.getElementById('searchInput')?.value.toLowerCase() || "";

    const regCheck = regionesSeleccionadas.length > 0 ? regionesSeleccionadas : Array.from(document.querySelectorAll('input[name="filtroRegion"]')).map(cb => cb.value);
    const depCheck = deptosSeleccionados.length > 0 ? deptosSeleccionados : Array.from(document.querySelectorAll('input[name="filtroDepartamento"]')).map(cb => cb.value);
    const mesCheck = mesesSeleccionados.length > 0 ? mesesSeleccionados : Array.from(document.querySelectorAll('input[name="filtroMes"]')).map(cb => cb.value);

    const registrosEnTramite = registrosCrudos.filter(r => {
        const reg = String(r.region || r.REGION || r['REGIONAL2'] || r[' REGIONAL2 '] || "").trim().toUpperCase();
        const depto = String(r.departamento || r.DEPARTAMENTO || "").trim().toUpperCase();
        const mes = String(r.mes || r.MES || "").trim();
        const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfil = String(rawPerfil).replace(/["']/g, "").trim().toLowerCase();
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();

        const matchReg = regCheck.includes(reg);
        const matchDepto = depCheck.includes(depto);
        const matchMes = mesCheck.includes(mes);
        const matchSearch = perfil.includes(searchVal);
        const esPendienteNeto = !aprobReg.includes("ACEPTADO") && !aprobReg.includes("RECHAZADO");

        return matchReg && matchDepto && matchMes && matchSearch && esPendienteNeto;
    });

    const thead = document.getElementById('headTablaDinamicaTramite');
    const tbody = document.getElementById('tableBodyEnTramite');
    const tfoot = document.getElementById('footerTablaDinamicaTramite');
    if (!thead || !tbody || !tfoot) return;

    actualizarCabeceraModalTramite();

    if (registrosEnTramite.length === 0) {
        thead.innerHTML = `<tr><th style="text-align: center;">ESTADO</th></tr>`;
        tbody.innerHTML = `<tr><td style="text-align:center; padding: 25px; color: #64748b;">No hay registros en trámite para los filtros seleccionados.</td></tr>`;
        tfoot.innerHTML = `<tr><td style="text-align: center; padding: 10px;">TOTAL GENERAL</td></tr>`;
        document.getElementById('txtTotalEnTramiteModal').innerText = 'Total general: $ 0';
        const modal = document.getElementById('modalEnTramiteDetalle');
        if (modal) modal.style.display = 'flex';
        return;
    }

    const listaDepartamentos = LISTA_DEPARTAMENTOS_FIJOS;
    const matrizDatos = {};
    let sumaGranTotal = 0;
    const totalesPorDepartamento = {};
    listaDepartamentos.forEach(dep => totalesPorDepartamento[dep] = 0);

    registrosEnTramite.forEach(r => {
        const aprobRegionalVal = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "PENDIENTE").toUpperCase().trim();
        const depVal = String(r.departamento || r.DEPARTAMENTO || r.dep || "").toUpperCase().trim();
        const departamento = listaDepartamentos.includes(depVal) ? depVal : "OTRO";
        const monto = Number(r.estimado_a_facturar ?? r.facturacion ?? r.Facturacion ?? 0);

        sumaGranTotal += monto;
        if (departamento !== "OTRO") {
            totalesPorDepartamento[departamento] = (totalesPorDepartamento[departamento] || 0) + monto;
        }

        if (!matrizDatos[aprobRegionalVal]) {
            matrizDatos[aprobRegionalVal] = {};
            listaDepartamentos.forEach(dep => matrizDatos[aprobRegionalVal][dep] = 0);
            matrizDatos[aprobRegionalVal]["OTRO"] = 0;
        }
        if (departamento !== "OTRO") {
            matrizDatos[aprobRegionalVal][departamento] += monto;
        } else {
            matrizDatos[aprobRegionalVal]["OTRO"] += monto;
        }
    });

    const estadosFiltrados = {};
    for (const [aprobVal, montosDeps] of Object.entries(matrizDatos)) {
        let totalFila = 0;
        Object.values(montosDeps).forEach(val => totalFila += val);
        if (totalFila > 0) {
            estadosFiltrados[aprobVal] = montosDeps;
        }
    }

    const totalColumnas = 1 + listaDepartamentos.length + 1;
    const anchoPorcentual = (100 / totalColumnas).toFixed(2) + '%';

    let headHtml = `
        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 10px 14px; text-align: center; font-weight: 800; color: #1e293b; width: ${anchoPorcentual};">ESTADO</th>
    `;
    listaDepartamentos.forEach(dep => {
        headHtml += `<th style="padding: 10px 14px; text-align: center; font-weight: 800; color: #1e293b; width: ${anchoPorcentual};">${dep}</th>`;
    });
    headHtml += `<th style="padding: 10px 14px; text-align: center; font-weight: 900; color: #0f172a; width: ${anchoPorcentual}; background: #f1f5f9;">TOTAL GENERAL</th></tr>`;
    thead.innerHTML = headHtml;

    let bodyHtml = '';
    for (const [aprobVal, montosDeps] of Object.entries(estadosFiltrados)) {
        bodyHtml += `<tr><td style="padding: 9px 14px; text-align: center; font-weight: 700; color: #334155; width: ${anchoPorcentual};"><span style="background: #fef3c7; color: #d97706; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;">${aprobVal}</span></td>`;
        
        let totalFila = 0;
        listaDepartamentos.forEach(dep => {
            const valDep = montosDeps[dep] || 0;
            totalFila += valDep;

            if (valDep > 0) {
                const subsetRows = registrosEnTramite.filter(item => {
                    const itemAprob = String(item.aprobacion_regional || item.APROBACION_REGIONAL || item['APROBACION REGIONAL'] || "").toUpperCase().trim();
                    const itemDep = String(item.departamento || item.DEPARTAMENTO || "").toUpperCase().trim();
                    return itemAprob === aprobVal && itemDep === dep;
                });

                const itemsDesglose = subsetRows.map(i => ({
                    id: i.id_id || i.ID_ID || i.id || i.ID || 'N/A',
                    depto: i.departamento || i.DEPARTAMENTO || dep,
                    causa: i.causa_rechazo || i.CAUSA_RECHAZO || i['Causa Rechazo'] || 'EN TRÁMITE',
                    monto: Number(i.estimado_a_facturar ?? i.facturacion ?? i.Facturacion ?? 0)
                }));

                const jsonRowsStr = JSON.stringify(itemsDesglose).replace(/"/g, '&quot;');
                bodyHtml += `<td style="padding: 9px 14px; text-align: center; color: #0f172a; font-weight: 700; cursor: pointer; width: ${anchoPorcentual}; text-decoration: underline;" onclick="abrirSubmodalDesgloseMatriz('Desglose de Casos en Trámite', 'Estado: ${aprobVal} | Depto: ${dep}', ${jsonRowsStr})" title="Clic para ver IDs">${formatMoney(valDep)}</td>`;
            } else {
                bodyHtml += `<td style="padding: 9px 14px; text-align: center; color: #475569; font-weight: 600; width: ${anchoPorcentual};">-</td>`;
            }
        });

        const subsetRowFila = registrosEnTramite.filter(item => {
            const itemAprob = String(item.aprobacion_regional || item.APROBACION_REGIONAL || item['APROBACION REGIONAL'] || "").toUpperCase().trim();
            return itemAprob === aprobVal;
        });
        const itemsDesgloseFila = subsetRowFila.map(i => ({
            id: i.id_id || i.ID_ID || i.id || i.ID || 'N/A',
            depto: i.departamento || i.DEPARTAMENTO || 'GENERAL',
            causa: i.causa_rechazo || i.CAUSA_RECHAZO || i['Causa Rechazo'] || 'EN TRÁMITE',
            monto: Number(i.estimado_a_facturar ?? i.facturacion ?? i.Facturacion ?? 0)
        }));
        const jsonFilaStr = JSON.stringify(itemsDesgloseFila).replace(/"/g, '&quot;');

        bodyHtml += `<td style="padding: 9px 14px; text-align: center; font-weight: 800; color: #0f172a; background: #f8fafc; cursor: pointer; width: ${anchoPorcentual}; text-decoration: underline;" onclick="abrirSubmodalDesgloseMatriz('Desglose de Casos en Trámite', 'Estado: ${aprobVal} | Total General', ${jsonFilaStr})" title="Clic para ver IDs">${formatMoney(totalFila)}</td></tr>`;
    }
    tbody.innerHTML = bodyHtml;

    let footerFilaHtml = `
        <tr style="font-weight: 900;">
            <td style="padding: 10px 14px; text-align: center; color: #0f172a; text-transform: uppercase; width: ${anchoPorcentual}; background: #f1f5f9;">TOTAL GENERAL</td>
    `;
    listaDepartamentos.forEach(dep => {
        const valDepTotal = totalesPorDepartamento[dep] || 0;
        footerFilaHtml += `<td style="padding: 10px 14px; text-align: center; color: #0f172a; width: ${anchoPorcentual}; background: #f1f5f9;">${formatMoney(valDepTotal)}</td>`;
    });
    footerFilaHtml += `<td style="padding: 10px 14px; text-align: center; color: #2563eb; width: ${anchoPorcentual}; background: #e2e8f0;">${formatMoney(sumaGranTotal)}</td></tr>`;
    
    tfoot.innerHTML = footerFilaHtml;
    document.getElementById('txtTotalEnTramiteModal').innerText = 'Total general acumulado: ' + formatMoney(sumaGranTotal);

    const modal = document.getElementById('modalEnTramiteDetalle');
    if (modal) modal.style.display = 'flex';
}

function actualizarCabeceraModalTramite() {
    const modalContainer = document.querySelector('#modalEnTramiteDetalle .modal-container, #modalEnTramiteDetalle > div');
    if (!modalContainer) return;
    
    let headerDiv = modalContainer.querySelector('.modal-header-custom-toggle');
    if (!headerDiv) {
        headerDiv = document.createElement('div');
        headerDiv.className = 'modal-header-custom-toggle';
        headerDiv.style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 800; color: #1e3a8a; font-size: 0.9rem;";
        headerDiv.innerHTML = `<span>💡 Haz clic en cualquier monto de la matriz para ver el desglose detallado por ID.</span>`;
        const tablaElem = modalContainer.querySelector('table');
        if (tablaElem && tablaElem.parentNode) {
            tablaElem.parentNode.insertBefore(headerDiv, tablaElem);
        }
    }
}

function cerrarModalEnTramite() {
    const modal = document.getElementById('modalEnTramiteDetalle');
    if (modal) modal.style.display = 'none';
}

function abrirModalRechazados() {
    const regionesSeleccionadas = obtenerValoresSeleccionados('Region');
    const deptosSeleccionados = obtenerValoresSeleccionados('Departamento');
    const mesesSeleccionados = obtenerValoresSeleccionados('Mes');
    const searchVal = document.getElementById('searchInput')?.value.toLowerCase() || "";

    const regCheck = regionesSeleccionadas.length > 0 ? regionesSeleccionadas : Array.from(document.querySelectorAll('input[name="filtroRegion"]')).map(cb => cb.value);
    const depCheck = deptosSeleccionados.length > 0 ? deptosSeleccionados : Array.from(document.querySelectorAll('input[name="filtroDepartamento"]')).map(cb => cb.value);
    const mesCheck = mesesSeleccionados.length > 0 ? mesesSeleccionados : Array.from(document.querySelectorAll('input[name="filtroMes"]')).map(cb => cb.value);

    const registrosRechazados = registrosCrudos.filter(r => {
        const reg = String(r.region || r.REGION || r['REGIONAL2'] || r[' REGIONAL2 '] || "").trim().toUpperCase();
        const depto = String(r.departamento || r.DEPARTAMENTO || "").trim().toUpperCase();
        const mes = String(r.mes || r.MES || "").trim();
        const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfil = String(rawPerfil).replace(/["']/g, "").trim().toLowerCase();
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();

        const matchReg = regCheck.includes(reg);
        const matchDepto = depCheck.includes(depto);
        const matchMes = mesCheck.includes(mes);
        const matchSearch = perfil.includes(searchVal);
        const esRechazado = aprobReg.includes("RECHAZADO");

        return matchReg && matchDepto && matchMes && matchSearch && esRechazado;
    });

    const thead = document.getElementById('headTablaDinamicaRechazados');
    const tbody = document.getElementById('tableBodyRechazados');
    const tfoot = document.getElementById('footerTablaDinamicaRechazados');
    if (!thead || !tbody || !tfoot) return;

    actualizarCabeceraModalRechazados();

    if (registrosRechazados.length === 0) {
        thead.innerHTML = `<tr><th style="text-align: center;">CAUSA RECHAZO</th></tr>`;
        tbody.innerHTML = `<tr><td style="text-align:center; padding: 25px; color: #64748b;">No hay registros rechazados para los filtros seleccionados.</td></tr>`;
        tfoot.innerHTML = `<tr><td style="text-align: center; padding: 10px;">TOTAL GENERAL</td></tr>`;
        document.getElementById('txtTotalRechazadosModal').innerText = 'Total general: $ 0';
        const modal = document.getElementById('modalRechazadosDetalle');
        if (modal) modal.style.display = 'flex';
        return;
    }

    const listaDepartamentos = LISTA_DEPARTAMENTOS_FIJOS;
    const matrizDatos = {};
    let sumaGranTotal = 0;
    const totalesPorDepartamento = {};
    listaDepartamentos.forEach(dep => totalesPorDepartamento[dep] = 0);

    registrosRechazados.forEach(r => {
        const causaRechazoVal = String(r.causa_rechazo || r.CAUSA_RECHAZO || r['Causa Rechazo'] || "SIN CAUSA").toUpperCase().trim();
        const depVal = String(r.departamento || r.DEPARTAMENTO || r.dep || "").toUpperCase().trim();
        const departamento = listaDepartamentos.includes(depVal) ? depVal : "OTRO";
        const monto = Number(r.estimado_a_facturar ?? r.facturacion ?? r.Facturacion ?? 0);

        sumaGranTotal += monto;
        if (departamento !== "OTRO") {
            totalesPorDepartamento[departamento] = (totalesPorDepartamento[departamento] || 0) + monto;
        }

        if (!matrizDatos[causaRechazoVal]) {
            matrizDatos[causaRechazoVal] = {};
            listaDepartamentos.forEach(dep => matrizDatos[causaRechazoVal][dep] = 0);
            matrizDatos[causaRechazoVal]["OTRO"] = 0;
        }
        if (departamento !== "OTRO") {
            matrizDatos[causaRechazoVal][departamento] += monto;
        } else {
            matrizDatos[causaRechazoVal]["OTRO"] += monto;
        }
    });

    const causasFiltradas = {};
    for (const [causaVal, montosDeps] of Object.entries(matrizDatos)) {
        let totalFila = 0;
        Object.values(montosDeps).forEach(val => totalFila += val);
        if (totalFila > 0) {
            causasFiltradas[causaVal] = montosDeps;
        }
    }

    const totalColumnas = 1 + listaDepartamentos.length + 1;
    const anchoPorcentual = (100 / totalColumnas).toFixed(2) + '%';

    let headHtml = `
        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 10px 14px; text-align: center; font-weight: 800; color: #1e293b; width: ${anchoPorcentual};">CAUSA RECHAZO</th>
    `;
    listaDepartamentos.forEach(dep => {
        headHtml += `<th style="padding: 10px 14px; text-align: center; font-weight: 800; color: #1e293b; width: ${anchoPorcentual};">${dep}</th>`;
    });
    headHtml += `<th style="padding: 10px 14px; text-align: center; font-weight: 900; color: #0f172a; width: ${anchoPorcentual}; background: #f1f5f9;">TOTAL GENERAL</th></tr>`;
    thead.innerHTML = headHtml;

    let bodyHtml = '';
    for (const [causaVal, montosDeps] of Object.entries(causasFiltradas)) {
        bodyHtml += `<tr><td style="padding: 9px 14px; text-align: center; font-weight: 700; color: #334155; width: ${anchoPorcentual};"><span style="background: #ffeeec; color: #dc2626; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;">${causaVal}</span></td>`;
        
        let totalFila = 0;
        listaDepartamentos.forEach(dep => {
            const valDep = montosDeps[dep] || 0;
            totalFila += valDep;

            if (valDep > 0) {
                const subsetRows = registrosRechazados.filter(item => {
                    const itemCausa = String(item.causa_rechazo || item.CAUSA_RECHAZO || item['Causa Rechazo'] || "SIN CAUSA").toUpperCase().trim();
                    const itemDep = String(item.departamento || item.DEPARTAMENTO || "").toUpperCase().trim();
                    return itemCausa === causaVal && itemDep === dep;
                });

                const itemsDesglose = subsetRows.map(i => ({
                    id: i.id_id || i.ID_ID || i.id || i.ID || 'N/A',
                    depto: i.departamento || i.DEPARTAMENTO || dep,
                    causa: i.causa_rechazo || i.CAUSA_RECHAZO || i['Causa Rechazo'] || 'NO ESPECIFICADA',
                    monto: Number(i.estimado_a_facturar ?? i.facturacion ?? i.Facturacion ?? 0)
                }));

                const jsonRowsStr = JSON.stringify(itemsDesglose).replace(/"/g, '&quot;');
                bodyHtml += `<td style="padding: 9px 14px; text-align: center; color: #0f172a; font-weight: 700; cursor: pointer; width: ${anchoPorcentual}; text-decoration: underline;" onclick="abrirSubmodalDesgloseMatriz('Desglose de Rechazos por ID', 'Causa: ${causaVal} | Depto: ${dep}', ${jsonRowsStr})" title="Clic para ver IDs">${formatMoney(valDep)}</td>`;
            } else {
                bodyHtml += `<td style="padding: 9px 14px; text-align: center; color: #475569; font-weight: 600; width: ${anchoPorcentual};">-</td>`;
            }
        });

        const subsetRowFila = registrosRechazados.filter(item => {
            const itemCausa = String(item.causa_rechazo || item.CAUSA_RECHAZO || item['Causa Rechazo'] || "SIN CAUSA").toUpperCase().trim();
            return itemCausa === causaVal;
        });
        const itemsDesgloseFila = subsetRowFila.map(i => ({
            id: i.id_id || i.ID_ID || i.id || i.ID || 'N/A',
            depto: i.departamento || i.DEPARTAMENTO || 'GENERAL',
            causa: i.causa_rechazo || i.CAUSA_RECHAZO || i['Causa Rechazo'] || 'NO ESPECIFICADA',
            monto: Number(i.estimado_a_facturar ?? i.facturacion ?? i.Facturacion ?? 0)
        }));
        const jsonFilaStr = JSON.stringify(itemsDesgloseFila).replace(/"/g, '&quot;');

        bodyHtml += `<td style="padding: 9px 14px; text-align: center; font-weight: 800; color: #0f172a; background: #f8fafc; cursor: pointer; width: ${anchoPorcentual}; text-decoration: underline;" onclick="abrirSubmodalDesgloseMatriz('Desglose de Rechazos por ID', 'Causa: ${causaVal} | Total General', ${jsonFilaStr})" title="Clic para ver IDs">${formatMoney(totalFila)}</td></tr>`;
    }
    tbody.innerHTML = bodyHtml;

    let footerFilaHtml = `
        <tr style="font-weight: 900;">
            <td style="padding: 10px 14px; text-align: center; color: #0f172a; text-transform: uppercase; width: ${anchoPorcentual}; background: #f1f5f9;">TOTAL GENERAL</td>
    `;
    listaDepartamentos.forEach(dep => {
        const valDepTotal = totalesPorDepartamento[dep] || 0;
        footerFilaHtml += `<td style="padding: 10px 14px; text-align: center; color: #0f172a; width: ${anchoPorcentual}; background: #f1f5f9;">${formatMoney(valDepTotal)}</td>`;
    });
    footerFilaHtml += `<td style="padding: 10px 14px; text-align: center; color: #2563eb; width: ${anchoPorcentual}; background: #e2e8f0;">${formatMoney(sumaGranTotal)}</td></tr>`;
    
    tfoot.innerHTML = footerFilaHtml;
    document.getElementById('txtTotalRechazadosModal').innerText = 'Total general acumulado: ' + formatMoney(sumaGranTotal);

    const modal = document.getElementById('modalRechazadosDetalle');
    if (modal) modal.style.display = 'flex';
}

function actualizarCabeceraModalRechazados() {
    const modalContainer = document.querySelector('#modalRechazadosDetalle .modal-container, #modalRechazadosDetalle > div');
    if (!modalContainer) return;
    
    let headerDiv = modalContainer.querySelector('.modal-header-custom-toggle-rech');
    if (!headerDiv) {
        headerDiv = document.createElement('div');
        headerDiv.className = 'modal-header-custom-toggle-rech';
        headerDiv.style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 800; color: #1e3a8a; font-size: 0.9rem;";
        headerDiv.innerHTML = `<span>💡 Haz clic en cualquier monto de la matriz para ver el desglose detallado por ID.</span>`;
        const tablaElem = modalContainer.querySelector('table');
        if (tablaElem && tablaElem.parentNode) {
            tablaElem.parentNode.insertBefore(headerDiv, tablaElem);
        }
    }
}

function cerrarModalRechazados() {
    const modal = document.getElementById('modalRechazadosDetalle');
    if (modal) modal.style.display = 'none';
}

function verificarIncrementosAvance(nuevosRegistros) {}
function actualizarBadgeCampana() {}
function abrirModalNotificaciones() {}
function cerrarModalNotificaciones() {
    const modal = document.getElementById('modalNotificaciones');
    if (modal) modal.style.display = 'none';
}

function abrirModalPassword() {
    const inputPass = document.getElementById('inputPasswordAdmin');
    const errorMsg = document.getElementById('errorPasswordMsg');
    const modalPass = document.getElementById('modalPassword');

    if (inputPass) inputPass.value = '';
    if (errorMsg) errorMsg.style.display = 'none';
    if (modalPass) modalPass.style.display = 'flex';
    if (inputPass) inputPass.focus();
}

function cerrarModalPassword() {
    const modalPass = document.getElementById('modalPassword');
    if (modalPass) modalPass.style.display = 'none';
}

async function verificarPassword() {
    const inputPass = document.getElementById('inputPasswordAdmin');
    const passwordIngresada = inputPass ? inputPass.value.trim() : '';
    const errorMsg = document.getElementById('errorPasswordMsg');

    if (!passwordIngresada) {
        if (errorMsg) {
            errorMsg.innerText = "Por favor ingresa la contraseña.";
            errorMsg.style.display = 'block';
        }
        return;
    }

    try {
        const response = await fetch(VERIFICAR_KEY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: passwordIngresada })
        });
        const resultado = await response.json();

        if (response.ok && (resultado.success === true || resultado.ok === true)) {
            cerrarModalPassword();
            const modalHerramientas = document.getElementById('modalHerramientas');
            if (modalHerramientas) modalHerramientas.style.display = 'flex';
        } else {
            if (errorMsg) {
                errorMsg.innerText = "Contraseña incorrecta.";
                errorMsg.style.display = 'block';
            }
            if (inputPass) {
                inputPass.value = '';
                inputPass.focus();
            }
        }
    } catch (err) {
        console.error("Error al verificar clave:", err);
        if (errorMsg) {
            errorMsg.innerText = "Error de red al verificar con el servidor.";
            errorMsg.style.display = 'block';
        }
    }
}

function cerrarModalHerramientas() {
    const modalHerramientas = document.getElementById('modalHerramientas');
    if (modalHerramientas) modalHerramientas.style.display = 'none';
}

async function confirmarBorrarBaseD1() {
    const seguro = confirm("⚠️ ¿Estás completamente seguro de borrar todos los registros de la base de datos D1? Esta acción eliminará el contenido pero mantendrá la estructura de la tabla intacta.");
    if (!seguro) return;

    cerrarModalHerramientas();

    try {
        const response = await fetch(`${API_BASE_URL}/facturacion/vaciar`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Error en el servidor (${response.status}): ${errText}`);
        }

        const resultado = await response.json();
        alert("¡Base de datos vaciada con éxito! Todos los registros fueron eliminados.");
        location.reload();

    } catch (error) {
        console.error("Error al vaciar la base D1:", error);
        alert("No se pudo vaciar la base de datos: " + error.message);
    }
}

async function procesarYSubirExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    cerrarModalHerramientas();

    const modalCarga = document.getElementById('modalCargandoExcel');
    const barra = document.getElementById('barraProgreso');
    const txtPorc = document.getElementById('txtPorcentajeCarga');
    const txtEstado = document.getElementById('txtEstadoCarga');
    
    if (modalCarga) modalCarga.style.display = 'flex';
    if (barra) barra.style.width = '15%';
    if (txtPorc) txtPorc.innerText = '15%';
    if (txtEstado) txtEstado.innerText = 'Leyendo archivo Excel...';

    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            if (barra) barra.style.width = '40%';
            if (txtPorc) txtPorc.innerText = '40%';
            if (txtEstado) txtEstado.innerText = 'Procesando filas del Excel...';

            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (!jsonData || jsonData.length === 0) {
                alert("El archivo Excel está vacío o no tiene un formato válido.");
                if (modalCarga) modalCarga.style.display = 'none';
                event.target.value = '';
                return;
            }

            if (barra) barra.style.width = '70%';
            if (txtPorc) txtPorc.innerText = '70%';
            if (txtEstado) txtEstado.innerText = 'Sincronizando con Cloudflare D1...';

            const response = await fetch(IMPORTAR_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en el servidor (${response.status}): ${errorText}`);
            }

            if (barra) barra.style.width = '100%';
            if (txtPorc) txtPorc.innerText = '100%';
            if (txtEstado) txtEstado.innerText = '¡Cargue y sincronización exitosa!';

            setTimeout(() => {
                if (modalCarga) modalCarga.style.display = 'none';
                alert("¡Base de facturación cargada y sincronizada con éxito!");
                location.reload();
            }, 800);

        } catch (error) {
            console.error("Error al procesar o subir el archivo:", error);
            if (modalCarga) modalCarga.style.display = 'none';
            alert("Error al procesar el archivo: " + error.message);
        } finally {
            event.target.value = '';
        }
    };

    reader.onerror = function() {
        if (modalCarga) modalCarga.style.display = 'none';
        alert("No se pudo leer el archivo seleccionado desde el equipo.");
        event.target.value = '';
    };

    reader.readAsArrayBuffer(file);
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
        const badgeStyle = r.estado === "Cumple" 
            ? "background: #dcfce7 !important; color: #16a34a !important; border: 1px solid #bbf7d0 !important;" 
            : "background: #fee2e2 !important; color: #dc2626 !important; border: 1px solid #fecaca !important;";
            
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
                <td><span style="display: inline-block; padding: 4px 12px; border-radius: 6px; font-weight: 800; font-size: 0.78rem; text-align: center; ${badgeStyle}">${r.estado}</span></td>
                <td style="text-align: center;">
                    <button type="button" onclick="abrirDetalleTecnico(${index})" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 5px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.78rem;">👁️ Ver detalles</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function abrirDetalleTecnico(index) {
    const r = tecnicosData[index];
    if (!r) return;

    const modalBody = document.getElementById('modalBodyContent');
    if(!modalBody) return;
    
    const badgeStyleModal = r.estado === "Cumple" 
        ? "background: #dcfce7 !important; color: #16a34a !important; border: 1px solid #bbf7d0 !important;" 
        : "background: #fee2e2 !important; color: #dc2626 !important; border: 1px solid #fecaca !important;";

    const tieneRechazos = r.rechazado > 0;
    const estilosRechazadoBox = tieneRechazos 
        ? "background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #fecaca; cursor: pointer; transition: background 0.2s;" 
        : "background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;";
    
    const eventoClickRechazado = tieneRechazos ? `onclick="verDetalleRechazosIdTecnico('${r.nombre.replace(/'/g, "\\'")}')"` : "";
    const tooltipRechazado = tieneRechazos ? `<div style="font-size:0.68rem; color:#dc2626; font-weight:700; margin-top:2px;">👆 Clic para ver causas por ID</div>` : "";

    modalBody.innerHTML = `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                <div>
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Técnico Evaluado</div>
                    <div style="font-size: 1.15rem; font-weight: 900; color: #0f172a;">${r.nombre}</div>
                </div>
                <div>
                    <span style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Regional</span>
                    <div style="font-size: 1rem; font-weight: 700; color: #2563eb;">${r.regional}</div>
                </div>
                <div>
                    <span style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Estado Actual</span>
                    <div style="margin-top: 4px;"><span style="display: inline-block; padding: 4px 12px; border-radius: 6px; font-weight: 800; font-size: 0.78rem; ${badgeStyleModal}">${r.estado}</span></div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 4px;">
                <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Meta Asignada (Fija)</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-top: 4px;">${formatMoney(r.meta)}</div>
                </div>
                <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Monto Aprobado</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: #16a34a; margin-top: 4px;">${formatMoney(r.aprobado)}</div>
                </div>
                
                <div style="${estilosRechazadoBox}" ${eventoClickRechazado} title="${tieneRechazos ? 'Haz clic para ver el detalle por ID' : ''}">
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Monto Rechazado</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: #dc2626; margin-top: 4px;">${formatMoney(r.rechazado)}</div>
                    ${tooltipRechazado}
                </div>

                <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Monto Subsanado</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: #d97706; margin-top: 4px;">${formatMoney(r.subsanado)}</div>
                </div>
            </div>

            <div style="background: #fff; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Cumplimiento Global del Técnico</div>
                    <div style="font-size: 0.85rem; color: #334155; margin-top: 2px;">Porcentaje de cumplimiento sobre la meta fija.</div>
                </div>
                <div style="font-size: 1.4rem; font-weight: 900; color: #2563eb;">${r.efectividad}%</div>
            </div>
        </div>
    `;

    const modal = document.getElementById('modalDetalleTecnico');
    if (modal) modal.style.display = 'flex';
}

function verDetalleRechazosIdTecnico(nombreTecnico) {
    const mesesSeleccionados = obtenerValoresSeleccionados('Mes');
    const fMes = mesesSeleccionados.length === 1 ? mesesSeleccionados[0] : "TODOS";
    const tecnicoBuscado = String(nombreTecnico || "").trim().toUpperCase();

    const itemsRechazados = registrosCrudos.filter(r => {
        const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfilReg = String(rawPerfil).replace(/["']/g, "").trim().toUpperCase();
        
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").trim().toUpperCase();
        const mesReg = String(r.mes || r.MES || "").trim().toUpperCase();
        
        const matchTecnico = perfilReg === tecnicoBuscado;
        const esRechazado = aprobReg.includes("RECHAZADO");
        const matchMes = fMes === "TODOS" || mesesSeleccionados.includes(mesReg);

        return matchTecnico && esRechazado && matchMes;
    });

    if (itemsRechazados.length === 0) {
        alert(`No se encontraron registros de rechazo para "${nombreTecnico}".`);
        return;
    }

    let filasHtml = '';
    let sumaRechazosModal = 0;

    itemsRechazados.forEach(item => {
        const idReal = item.id_id || item.ID_ID || item.id || item.ID || 'N/A';
        const causa = item.causa_rechazo || item.CAUSA_RECHAZO || item['Causa Rechazo'] || item['CAUSA RECHAZO'] || 'NO ESPECIFICADA';
        const monto = Number(item.estimado_a_facturar ?? item.facturacion ?? item.Facturacion ?? 0);
        sumaRechazosModal += monto;

        filasHtml += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; font-weight: 800; color: #1e3a8a; text-align: center;">${idReal}</td>
                <td style="padding: 10px; color: #dc2626; font-weight: 700; text-transform: uppercase;">${causa}</td>
                <td style="padding: 10px; text-align: right; font-weight: 700; color: #0f172a;">${formatMoney(monto)}</td>
            </tr>
        `;
    });

    let subModal = document.getElementById('modalSubDetalleRechazos');
    if (!subModal) {
        subModal = document.createElement('div');
        subModal.id = 'modalSubDetalleRechazos';
        subModal.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:inherit;";
        document.body.appendChild(subModal);
    }

    subModal.innerHTML = `
        <div style="background:white; color:#333; border-radius:14px; width:620px; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 20px 35px rgba(0,0,0,0.35); overflow:hidden;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; padding:20px 25px 15px 25px; border-bottom:2px solid #e2e8f0; background:white; position:sticky; top:0; z-index:10;">
                <div>
                    <h3 style="margin:0; color:#1e3a8a; font-size:1.1rem; font-weight:900;">📋 Desglose de Rechazos por ID</h3>
                    <div style="font-size:0.82rem; color:#64748b; font-weight:600; margin-top:2px;">Técnico: ${nombreTecnico}</div>
                </div>
                <button type="button" onclick="document.getElementById('modalSubDetalleRechazos').style.display='none'" style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748b; font-weight:bold;">&times;</button>
            </div>
            
            <div style="padding:20px 25px; overflow-y:auto; flex:1;">
                <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
                    <thead>
                        <tr style="background:#f8fafc; color:#334155; text-align:left; border-bottom:2px solid #e2e8f0;">
                            <th style="padding:10px; text-align:center;">ID</th>
                            <th style="padding:10px;">Causa Rechazo</th>
                            <th style="padding:10px; text-align:right;">Monto Estimado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasHtml}
                    </tbody>
                </table>

                <div style="margin-top:16px; padding:12px; background:#f8fafc; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-weight:900; color:#0f172a;">
                    <span>Total Rechazado:</span>
                    <span style="color:#0f172a; font-size:1.05rem;">${formatMoney(sumaRechazosModal)}</span>
                </div>
            </div>

            <div style="padding:15px 25px; border-top:1px solid #e2e8f0; background:#f8fafc; text-align:right;">
                <button type="button" onclick="document.getElementById('modalSubDetalleRechazos').style.display='none'" style="background:#2563eb; color:white; border:none; padding:8px 20px; border-radius:6px; cursor:pointer; font-weight:700; font-size:0.88rem;">Cerrar</button>
            </div>

        </div>
    `;
    subModal.style.display = 'flex';
}

function cerrarModalDetalle() {
    const modal = document.getElementById('modalDetalleTecnico');
    if (modal) modal.style.display = 'none';
}

function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(tecnicosData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detalle_Tecnicos");
    XLSX.writeFile(wb, "Detalle_Tecnicos_Facturacion.xlsx");
}

function actualizarSelectsEnCascada() {
    const regionesSel = obtenerValoresSeleccionados('Region');
    const deptosSel = obtenerValoresSeleccionados('Departamento');
    const mesesSel = obtenerValoresSeleccionados('Mes');
    const perfilesSel = obtenerValoresSeleccionados('PerfilWfm');
    const aprobSel = obtenerValoresSeleccionados('Aprobacion');

    const filtrarExcluyendo = (campoExcluir) => {
        return registrosCrudos.filter(r => {
            const reg = String(r.region || r.REGION || r['REGIONAL2'] || r[' REGIONAL2 '] || "").trim().toUpperCase();
            const depto = String(r.departamento || r.DEPARTAMENTO || "").trim().toUpperCase();
            const mes = String(r.mes || r.MES || "").trim();
            const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
            const perfil = String(rawPerfil).replace(/["']/g, "").trim().toUpperCase();
            const aprob = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").trim();

            const matchReg = campoExcluir === 'Region' || regionesSel.length === 0 || regionesSel.includes(reg);
            const matchDepto = campoExcluir === 'Departamento' || deptosSel.length === 0 || deptosSel.includes(depto);
            const matchMes = campoExcluir === 'Mes' || mesesSel.length === 0 || mesesSel.includes(mes);
            const matchPerfil = campoExcluir === 'PerfilWfm' || perfilesSel.length === 0 || perfilesSel.includes(perfil);
            const matchAprob = campoExcluir === 'Aprobacion' || aprobSel.length === 0 || aprobSel.includes(aprob);

            return matchReg && matchDepto && matchMes && matchPerfil && matchAprob;
        });
    };

    const rowsReg = filtrarExcluyendo('Region');
    const setReg = new Set();
    rowsReg.forEach(r => {
        const val = r.region || r.REGION || r['REGIONAL2'] || r[' REGIONAL2 '];
        if (val) setReg.add(String(val).trim().toUpperCase());
    });
    llenarDropdownHTMLCascada('Region', setReg, regionesSel);

    const rowsDepto = filtrarExcluyendo('Departamento');
    const setDepto = new Set();
    rowsDepto.forEach(r => {
        const val = r.departamento || r.DEPARTAMENTO || r.dep;
        if (val) setDepto.add(String(val).trim().toUpperCase());
    });
    llenarDropdownHTMLCascada('Departamento', setDepto, deptosSel);

    const rowsMes = filtrarExcluyendo('Mes');
    const setMes = new Set();
    rowsMes.forEach(r => {
        const val = r.mes || r.MES;
        if (val) setMes.add(String(val).trim());
    });
    llenarDropdownHTMLCascada('Mes', setMes, mesesSel);

    const rowsPerfil = filtrarExcluyendo('PerfilWfm');
    const setPerfil = new Set();
    rowsPerfil.forEach(r => {
        const raw = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const val = String(raw).replace(/["']/g, "").trim();
        if (val) setPerfil.add(val.toUpperCase());
    });
    llenarDropdownHTMLCascada('PerfilWfm', setPerfil, perfilesSel);

    const rowsAprob = filtrarExcluyendo('Aprobacion');
    const setAprob = new Set();
    rowsAprob.forEach(r => {
        const val = r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'];
        if (val) setAprob.add(String(val).trim());
    });
    llenarDropdownHTMLCascada('Aprobacion', setAprob, aprobSel);
}

function llenarDropdownHTMLCascada(nombreFiltro, setValues, valoresAnteriores) {
    const container = document.getElementById('listaCheck' + nombreFiltro);
    if (!container) return;
    
    let html = '';
    const sortedValues = Array.from(setValues).sort();
    
    sortedValues.forEach(val => {
        const marcado = (valoresAnteriores.length === 0 || valoresAnteriores.includes(val)) ? 'checked' : '';
        html += `
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #1e293b; cursor: pointer; font-weight: 600; padding: 2px 4px;" onclick="event.stopPropagation()">
                <input type="checkbox" name="filtro${nombreFiltro}" value="${val}" ${marcado} onchange="aplicarFiltrosGlobales()" style="cursor: pointer;">
                ${val}
            </label>
        `;
    });
    container.innerHTML = html;
    actualizarLabelBotonFiltro(nombreFiltro);
}
function actualizarLabelBotonFiltro(nombreFiltro) {
    const checkboxes = document.querySelectorAll(`input[name="filtro${nombreFiltro}"]`);
    const total = checkboxes.length;
    const seleccionados = obtenerValoresSeleccionados(nombreFiltro);
    
    const chkTodo = document.getElementById('chkTodo' + nombreFiltro);
    if (chkTodo) {
        chkTodo.checked = (total > 0 && seleccionados.length === total);
    }

    const lbl = document.getElementById('lbl' + nombreFiltro);
    if (!lbl) return;

    if (seleccionados.length === total || seleccionados.length === 0) {
        lbl.innerText = "Todos";
    } else if (seleccionados.length === 1) {
        lbl.innerText = seleccionados[0];
    } else {
        lbl.innerText = seleccionados.length + " seleccionados";
    }
}
