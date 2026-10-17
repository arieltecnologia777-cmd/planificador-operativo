let tecnicosData = [];
const API_BASE_URL = "https://planeacion-api.modulo-de-exclusiones.workers.dev/api";

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosDesdeAPI();
    initCharts();
});

// GET: Cargar todos los registros desde Cloudflare D1 a través del Worker
async function cargarDatosDesdeAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/facturacion`);
        if (response.ok) {
            const rawData = await response.json();
            
            // Agrupar o formatear los datos crudos del Excel para la vista de técnicos
            tecnicosData = procesarDatosParaVista(rawData);
            renderTable(tecnicosData);
            actualizarKPIsGenerales(rawData);
        }
    } catch (err) {
        console.warn("No se pudieron obtener datos de la API:", err);
        renderTable([]);
    }
}

// Procesar registros del Excel para consolidar por técnico
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
        mapaTecnicos[nombreTecnico].rechazado += Number(r.valor_visita || 0); // Ajuste según métrica
        mapaTecnicos[nombreTecnico].subsanado += Number(r.trasiego_esp || 0);
    });

    return Object.values(mapaTecnicos).map(t => {
        t.efectividad = t.meta > 0 ? Math.round((t.aprobado / t.meta) * 100) : 0;
        t.estado = t.efectividad >= 70 ? "En progreso" : "En riesgo";
        return t;
    });
}

function actualizarKPIsGenerales(rows) {
    let totalMeta = rows.reduce((acc, r) => acc + Number(r.facturacion || 0), 0);
    let totalAprobado = rows.reduce((acc, r) => acc + Number(r.total_aprobado || 0), 0);
    let totalRechazado = rows.reduce((acc, r) => acc + Number(r.valor_visita || 0), 0);
    let totalSubsanado = rows.reduce((acc, r) => acc + Number(r.trasiego_esp || 0), 0);
    
    let efectividadGlobal = totalMeta > 0 ? Math.round((totalAprobado / totalMeta) * 100) : 0;

    if(document.getElementById('kpiMeta')) document.getElementById('kpiMeta').innerText = formatMoney(totalMeta);
    if(document.getElementById('kpiAprobado')) document.getElementById('kpiAprobado').innerText = formatMoney(totalAprobado);
    if(document.getElementById('kpiRechazado')) document.getElementById('kpiRechazado').innerText = formatMoney(totalRechazado);
    if(document.getElementById('kpiSubsanado')) document.getElementById('kpiSubsanado').innerText = formatMoney(totalSubsanado);
    if(document.getElementById('kpiEfectividad')) document.getElementById('kpiEfectividad').innerText = efectividadGlobal + '%';
}

// Verificación de contraseña conectada al Worker y variable FACT_KEY
async function verificarPassword() {
    const passwordIngresada = document.getElementById('inputPasswordAdmin').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/verificar-key`, {
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

            const response = await fetch(`${API_BASE_URL}/facturacion/importar`, {
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

function initCharts() {
    const ctxTendencia = document.getElementById('tendenciaChart');
    if (ctxTendencia) {
        new Chart(ctxTendencia, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr'],
                datasets: [{
                    label: 'Aprobado',
                    data: [0, 0, 0, 0],
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

    const ctxGauge = document.getElementById('gaugeEfectividad');
    if (ctxGauge) {
        new Chart(ctxGauge, {
            type: 'doughnut',
            data: { datasets: [{ data: [0, 100], backgroundColor: ['#8b5cf6', '#e2e8f0'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { tooltip: { enabled: false }, legend: { display: false } } }
        });
    }
}

function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(tecnicosData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detalle_Tecnicos");
    XLSX.writeFile(wb, "Detalle_Tecnicos_Facturacion.xlsx");
}
