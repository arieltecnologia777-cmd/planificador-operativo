const API_BASE_URL = "https://planeacion-api.modulo-de-exclusiones.workers.dev/api";
const FACTURACION_API_URL = `${API_BASE_URL}/facturacion`;
const VERIFICAR_KEY_URL = `${API_BASE_URL}/verificar-key`;
const IMPORTAR_API_URL = `${API_BASE_URL}/facturacion/importar`;

let tecnicosData = [];
let registrosCrudos = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosDesdeAPI();
});

// GET: Cargar registros desde Cloudflare D1
async function cargarDatosDesdeAPI() {
    try {
        const response = await fetch(FACTURACION_API_URL);
        if (response.ok) {
            registrosCrudos = await response.json();
            
            if (Array.isArray(registrosCrudos) && registrosCrudos.length > 0) {
                tecnicosData = procesarDatosParaVista(registrosCrudos);
                renderTable(tecnicosData);
                actualizarKPIsGenerales(registrosCrudos);
                renderizarEstadoRegional(registrosCrudos);
                initChartsDinamicos(registrosCrudos);
            } else {
                renderTable([]);
            }
        }
    } catch (err) {
        console.warn("No se pudieron obtener datos de la API:", err);
        renderTable([]);
    }
}

// Agrupar registros por técnico
function procesarDatosParaVista(rows) {
    const mapaTecnicos = {};

    rows.forEach(r => {
        const nombreTecnico = r.tecnico_programado || "Sin asignar";
        const regional = r.region || "General";
        
        if (!mapaTecnicos[nombreTecnico]) {
            mapaTecnicos[nombreTecnico] = {
                nombre: nombreTecnico,
                regional: regional,
                meta: 0,
                aprobado: 0,
                rechazado: 0,
                subsanado: 0,
                efectividad: 0,
                estado: "En progreso"
            };
        }

        mapaTecnicos[nombreTecnico].meta += Number(r.facturacion || 0);
        mapaTecnicos[nombreTecnico].aprobado += Number(r.total_aprobado || 0);
        mapaTecnicos[nombreTecnico].rechazado += Number(r.valor_visita || 0);
        mapaTecnicos[nombreTecnico].subsanado += Number(r.trasiego_esp || 0);
    });

    return Object.values(mapaTecnicos).map(t => {
        t.efectividad = t.meta > 0 ? Math.round((t.aprobado / t.meta) * 100) : 0;
        t.estado = t.efectividad >= 70 ? "En progreso" : "En riesgo";
        return t;
    });
}

// Actualizar las 5 Tarjetas KPI con datos reales
function actualizarKPIsGenerales(rows) {
    let totalMeta = rows.reduce((acc, r) => acc + Number(r.facturacion || 0), 0);
    let totalAprobado = rows.reduce((acc, r) => acc + Number(r.total_aprobado || 0), 0);
    let totalRechazado = rows.reduce((acc, r) => acc + Number(r.valor_visita || 0), 0);
    let totalSubsanado = rows.reduce((acc, r) => acc + Number(r.trasiego_esp || 0), 0);
    
    let efectividadGlobal = totalMeta > 0 ? Math.round((totalAprobado / totalMeta) * 100) : 0;

    if(document.getElementById('kpiMeta')) document.getElementById('kpiMeta').innerText = formatMoneyCompact(totalMeta);
    if(document.getElementById('kpiAprobado')) document.getElementById('kpiAprobado').innerText = formatMoneyCompact(totalAprobado);
    if(document.getElementById('kpiRechazado')) document.getElementById('kpiRechazado').innerText = formatMoneyCompact(totalRechazado);
    if(document.getElementById('kpiSubsanado')) document.getElementById('kpiSubsanado').innerText = formatMoneyCompact(totalSubsanado);
    if(document.getElementById('kpiEfectividad')) document.getElementById('kpiEfectividad').innerText = efectividadGlobal + '%';

    let porcMeta = totalMeta > 0 ? 100 : 0;
    let porcAprobado = totalMeta > 0 ? Math.min(100, Math.round((totalAprobado / totalMeta) * 100)) : 0;
    let porcRechazado = totalMeta > 0 ? Math.min(100, Math.round((totalRechazado / totalMeta) * 100)) : 0;
    let porcSubsanado = totalMeta > 0 ? Math.min(100, Math.round((totalSubsanado / totalMeta) * 100)) : 0;

    if(document.getElementById('barMeta')) document.getElementById('barMeta').style.width = porcMeta + '%';
    if(document.getElementById('txtPorcMeta')) document.getElementById('txtPorcMeta').innerText = porcMeta + '%';

    if(document.getElementById('barAprobado')) document.getElementById('barAprobado').style.width = porcAprobado + '%';
    if(document.getElementById('txtPorcAprobado')) document.getElementById('txtPorcAprobado').innerText = porcAprobado + '%';

    if(document.getElementById('barRechazado')) document.getElementById('barRechazado').style.width = porcRechazado + '%';
    if(document.getElementById('txtPorcRechazado')) document.getElementById('txtPorcRechazado').innerText = porcRechazado + '%';

    if(document.getElementById('barSubsanado')) document.getElementById('barSubsanado').style.width = porcSubsanado + '%';
    if(document.getElementById('txtPorcSubsanado')) document.getElementById('txtPorcSubsanado').innerText = porcSubsanado + '%';

    const ctxGauge = document.getElementById('gaugeEfectividad');
    if (ctxGauge) {
        new Chart(ctxGauge, {
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

// Renderizar Estado Regional Dinámico
function renderizarEstadoRegional(rows) {
    const container = document.getElementById('estadoRegionalContainer');
    if (!container) return;

    const mapaRegiones = {};
    rows.forEach(r => {
        const reg = r.region || "General";
        if (!mapaRegiones[reg]) mapaRegiones[reg] = { aprobado: 0, meta: 0 };
        mapaRegiones[reg].aprobado += Number(r.total_aprobado || 0);
        mapaRegiones[reg].meta += Number(r.facturacion || 0);
    });

    let html = '';
    for (const [reg, val] of Object.entries(mapaRegiones)) {
        const ef = val.meta > 0 ? Math.round((val.aprobado / val.meta) * 100) : 0;
        const colorClass = ef >= 70 ? "reg-pill-green" : (ef >= 50 ? "reg-pill-yellow" : "reg-pill-red");
        const dotColor = ef >= 70 ? "#22c55e" : (ef >= 50 ? "#f59e0b" : "#ef4444");

        html += `
            <div class="reg-row">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="width: 9px; height: 9px; border-radius: 50%; background: ${dotColor}; display: inline-block;"></span>
                    <span style="font-weight: 700; color: #0f172a; font-size: 0.88rem;">${reg}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="reg-pill ${colorClass}">${ef}%</span>
                    <span style="font-weight: 700; color: #334155; font-size: 0.85rem; min-width: 70px; text-align: right;">${formatMoney(val.aprobado)}</span>
                </div>
            </div>
        `;
    }
    container.innerHTML = html || '<div style="color: #64748b; font-size: 0.85rem; text-align: center; padding: 10px;">Sin datos regionales</div>';
}

// Validación de contraseña conectada al Worker y FACT_KEY
async function verificarPassword() {
    const passwordIngresada = document.getElementById('inputPasswordAdmin').value;
    
    try {
        const response = await fetch(VERIFICAR_KEY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: passwordIngresada })
        });

        const resultado = await response.json();

        if (response.ok && resultado.success) {
            cerrarModalPassword();
            document.getElementById('modalHerramientas').style.display = 'flex';
        } else {
            document.getElementById('errorPasswordMsg').style.display = 'block';
        }
    } catch (err) {
        console.error("Error al validar clave:", err);
        document.getElementById('errorPasswordMsg').style.display = 'block';
    }
}

function abrirModalPassword() {
    document.getElementById('inputPasswordAdmin').value = '';
    document.getElementById('errorPasswordMsg').style.display = 'none';
    document.getElementById('modalPassword').style.display = 'flex';
}

function cerrarModalPassword() {
    document.getElementById('modalPassword').style.display = 'none';
}

function cerrarModalHerramientas() {
    document.getElementById('modalHerramientas').style.display = 'none';
}

// Cargue de Excel y sincronización masiva
async function procesarYSubirExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    cerrarModalHerramientas();
    
    const modalCarga = document.getElementById('modalCargandoExcel');
    const barra = document.getElementById('barraProgreso');
    const txtPorc = document.getElementById('txtPorcentajeCarga');
    const txtEstado = document.getElementById('txtEstadoCarga');
    
    barra.style.width = '15%';
    txtPorc.innerText = '15%';
    txtEstado.innerText = 'Leyendo archivo Excel...';
    modalCarga.style.display = 'flex';

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            barra.style.width = '50%';
            txtPorc.innerText = '50%';
            txtEstado.innerText = 'Procesando filas...';

            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                alert("El archivo Excel está vacío.");
                modalCarga.style.display = 'none';
                return;
            }

            barra.style.width = '75%';
            txtPorc.innerText = '75%';
            txtEstado.innerText = 'Guardando en Cloudflare D1...';

            const response = await fetch(IMPORTAR_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });

            if (!response.ok) throw new Error("Error en la inserción masiva");

            barra.style.width = '100%';
            txtPorc.innerText = '100%';
            txtEstado.innerText = '¡Cargue y éxito de confirmación!';

            setTimeout(() => {
                modalCarga.style.display = 'none';
                alert("¡Base de facturación cargada y sincronizada con éxito!");
                location.reload();
            }, 1000);

        } catch (error) {
            modalCarga.style.display = 'none';
            alert("Error al procesar el archivo: " + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function formatMoney(amount) {
    return '$ ' + Number(amount || 0).toLocaleString('es-CO', {maximumFractionDigits: 0});
}

function formatMoneyCompact(amount) {
    let val = Number(amount || 0);
    if (val >= 1000000) return '$ ' + (val / 1000000).toFixed(1) + 'M';
    return '$ ' + val.toLocaleString('es-CO');
}

function renderTable(records) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if(records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px; color: #64748b;">No hay registros disponibles. Sube una base desde Herramientas Avanzadas.</td></tr>`;
        return;
    }

    let html = '';
    records.forEach((r, index) => {
        const badgeClass = r.estado === "En progreso" ? "badge-progreso" : "badge-riesgo";
        const barColor = r.efectividad >= 70 ? "#22c55e" : (r.efectividad >= 50 ? "#f59e0b" : "#ef4444");

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
                            <div style="width: ${r.efectividad}%; background: ${barColor}; height: 100%;"></div>
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

function abrirDetalleTecnico(index) {
    const r = tecnicosData[index];
    if (!r) return;

    const modalBody = document.getElementById('modalBodyContent');
    if(!modalBody) return;
    const badgeClass = r.estado === "En progreso" ? "badge-progreso" : "badge-riesgo";

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
                    <div style="margin-top: 4px;"><span class="badge-status ${badgeClass}">${r.estado}</span></div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 4px;">
                <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Meta Asignada</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-top: 4px;">${formatMoney(r.meta)}</div>
                </div>
                <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Monto Aprobado</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: #16a34a; margin-top: 4px;">${formatMoney(r.aprobado)}</div>
                </div>
                <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Monto Rechazado</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: #dc2626; margin-top: 4px;">${formatMoney(r.rechazado)}</div>
                </div>
                <div style="background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Monto Subsanado</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: #d97706; margin-top: 4px;">${formatMoney(r.subsanado)}</div>
                </div>
            </div>

            <div style="background: #fff; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Efectividad Global del Técnico</div>
                    <div style="font-size: 0.85rem; color: #334155; margin-top: 2px;">Porcentaje de cumplimiento sobre la meta establecida.</div>
                </div>
                <div style="font-size: 1.4rem; font-weight: 900; color: #2563eb;">${r.efectividad}%</div>
            </div>
        </div>
    `;

    const modal = document.getElementById('modalDetalleTecnico');
    if (modal) modal.style.display = 'flex';
}

function cerrarModalDetalle() {
    const modal = document.getElementById('modalDetalleTecnico');
    if (modal) modal.style.display = 'none';
}

function filterTable() {
    const searchInput = document.getElementById('searchInput');
    const selectFiltroRegional = document.getElementById('selectFiltroRegional');
    
    const query = searchInput ? searchInput.value.toLowerCase() : "";
    const regionalFiltro = selectFiltroRegional ? selectFiltroRegional.value : "TODAS";

    const filtered = tecnicosData.filter(r => {
        const matchNombre = r.nombre.toLowerCase().includes(query);
        const matchRegional = regionalFiltro === "TODAS" || r.regional === regionalFiltro;
        return matchNombre && matchRegional;
    });

    renderTable(filtered);
}

function initChartsDinamicos(rows) {
    const ctxTendencia = document.getElementById('tendenciaChart');
    if (ctxTendencia) {
        let totalAprobado = rows.reduce((acc, r) => acc + Number(r.total_aprobado || 0), 0);
        new Chart(ctxTendencia, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr'],
                datasets: [{
                    label: 'Aprobado',
                    data: [0, 0, 0, totalAprobado],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 0, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(tecnicosData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detalle_Tecnicos");
    XLSX.writeFile(wb, "Detalle_Tecnicos_Facturacion.xlsx");
}
