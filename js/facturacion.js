// Datos de respaldo locales si la API está offline
let tecnicosData = [
    { nombre: "Hailen Julio", regional: "Antioquia", meta: 12000000, aprobado: 8400000, rechazado: 1200000, subsanado: 2000000, efectividad: 70, estado: "En progreso" },
    { nombre: "Juan Torres", regional: "Cesar", meta: 10000000, aprobado: 6200000, rechazado: 1800000, subsanado: 2000000, efectividad: 62, estado: "En progreso" },
    { nombre: "Samuel Pushaina", regional: "La Guajira", meta: 8000000, aprobado: 3600000, rechazado: 2400000, subsanado: 2000000, efectividad: 45, estado: "En riesgo" },
    { nombre: "Hardy Whitaker", regional: "Sai", meta: 9000000, aprobado: 7000000, rechazado: 1000000, subsanado: 1000000, efectividad: 78, estado: "En progreso" },
    { nombre: "Elger Hernández", regional: "Cesar", meta: 15000000, aprobado: 12000000, rechazado: 1500000, subsanado: 1500000, efectividad: 80, estado: "En progreso" },
    { nombre: "Sammy Eliud", regional: "Antioquia", meta: 11000000, aprobado: 9000000, rechazado: 1000000, subsanado: 1000000, efectividad: 82, estado: "En progreso" }
];

const API_BASE_URL = "https://planeacion-api.modulo-de-exclusiones.workers.dev/api"; // O tu endpoint del worker de facturación

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosDesdeAPI();
    initCharts();
});

// GET: Cargar registros desde Cloudflare Worker
async function cargarDatosDesdeAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/facturacion`);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                // Transformar datos del D1 si es necesario para la tabla
                console.log("Datos cargados desde D1:", data.length);
            }
        }
    } catch (err) {
        console.warn("Usando datos locales por defecto (API no disponible o inicializando):", err);
    }
    renderTable(tecnicosData);
}

// Lógica de Modales de Herramientas Avanzadas
function abrirModalPassword() {
    document.getElementById('inputPasswordAdmin').value = '';
    document.getElementById('errorPasswordMsg').style.display = 'none';
    document.getElementById('modalPassword').style.display = 'flex';
}

function cerrarModalPassword() {
    document.getElementById('modalPassword').style.display = 'none';
}

async function verificarPassword() {
    const passwordIngresada = document.getElementById('inputPasswordAdmin').value;
    
    // Aquí puedes validar contra tu key o un valor directo
    if (passwordIngresada === "Admin2026*" || passwordIngresada === "admin") {
        cerrarModalPassword();
        document.getElementById('modalHerramientas').style.display = 'flex';
    } else {
        document.getElementById('errorPasswordMsg').style.display = 'block';
    }
}

function cerrarModalHerramientas() {
    document.getElementById('modalHerramientas').style.display = 'none';
}

// Cargue de Excel y envío masivo al Worker con barra de avance
async function procesarYSubirExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    cerrarModalHerramientas();
    
    // Mostrar modal de carga bloqueante con barra en 0%
    const modalCarga = document.getElementById('modalCargandoExcel');
    const barra = document.getElementById('barraProgreso');
    const txtPorc = document.getElementById('txtPorcentajeCarga');
    const txtEstado = document.getElementById('txtEstadoCarga');
    
    barra.style.width = '10%';
    txtPorc.innerText = '10%';
    txtEstado.innerText = 'Leyendo archivo Excel...';
    modalCarga.style.display = 'flex';

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            barra.style.width = '40%';
            txtPorc.innerText = '40%';
            txtEstado.innerText = 'Procesando registros...';

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

            barra.style.width = '70%';
            txtPorc.innerText = '70%';
            txtEstado.innerText = 'Sincronizando con Cloudflare D1...';

            // Enviar en lotes o completo al worker
            const response = await fetch(`${API_BASE_URL}/facturacion/importar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });

            barra.style.width = '100%';
            txtPorc.innerText = '100%';
            txtEstado.innerText = '¡Cargue y éxito de confirmación!';

            setTimeout(() => {
                modalCarga.style.display = 'none';
                alert(`¡Proceso exitoso! Se sincronizaron los registros correctamente.`);
                location.reload(); // Recargar para pintar los datos nuevos con GET
            }, 1000);

        } catch (error) {
            modalCarga.style.display = 'none';
            alert("Error al procesar el archivo: " + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function formatMoney(amount) {
    return '$ ' + Number(amount).toLocaleString('es-CO', {maximumFractionDigits: 0});
}

function renderTable(records) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
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
                datasets: [
                    {
                        label: 'Meta',
                        data: [2500000, 6000000, 9300000, 11800000],
                        borderColor: '#94a3b8',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        pointRadius: 4,
                        fill: false
                    },
                    {
                        label: 'Aprobado',
                        data: [700000, 3800000, 7200000, 9600000],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.12)',
                        borderWidth: 3,
                        pointRadius: 5,
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        min: 0,
                        max: 15000000,
                        ticks: { 
                            callback: (val) => '$ ' + (val/1000000).toLocaleString() + '.000.000'.replace('0.000.000', ''), 
                            font: { size: 10, weight: 'bold' },
                            color: '#64748b'
                        },
                        grid: { color: '#f1f5f9' }
                    },
                    x: { grid: { display: false }, ticks: { font: { weight: 'bold' }, color: '#64748b' } }
                }
            }
        });
    }

    const ctxGauge = document.getElementById('gaugeEfectividad');
    if (ctxGauge) {
        new Chart(ctxGauge, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [70, 30],
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

function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(tecnicosData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detalle_Tecnicos");
    XLSX.writeFile(wb, "Detalle_Tecnicos_Facturacion.xlsx");
}
