// Datos de técnicos consolidados para la tabla y gráficos
const tecnicosData = [
    { nombre: "Carlos Pérez", regional: "Antioquia", meta: 12000000, facturado: 8400000, estimado: 3200000, efectividad: 70, estado: "En progreso" },
    { nombre: "Andrés Ramírez", regional: "Cesar", meta: 10000000, facturado: 6200000, estimado: 2800000, efectividad: 62, estado: "En progreso" },
    { nombre: "Laura Gómez", regional: "La Guajira", meta: 8000000, facturado: 3600000, estimado: 2200000, efectividad: 45, estado: "En riesgo" },
    { nombre: "Jorge Torres", regional: "Sai", meta: 9000000, facturado: 7000000, estimado: 2000000, efectividad: 78, estado: "En progreso" },
    { nombre: "Elger Hernández", regional: "Cesar", meta: 15000000, facturado: 12000000, estimado: 3500000, efectividad: 80, estado: "En progreso" },
    { nombre: "Robin Rojas", regional: "Antioquia", meta: 11000000, facturado: 9000000, estimado: 2500000, efectividad: 82, estado: "En progreso" }
];

const regionesData = [
    { nombre: "Antioquia", porcentaje: 85, monto: "$ 5.100.000", color: "#22c55e" },
    { nombre: "Cesar", porcentaje: 62, monto: "$ 3.200.000", color: "#f59e0b" },
    { nombre: "La Guajira", porcentaje: 45, monto: "$ 1.800.000", color: "#ef4444" },
    { nombre: "Sai", porcentaje: 78, monto: "$ 2.100.000", color: "#22c55e" }
];

function formatMoney(amount) {
    return '$ ' + Number(amount).toLocaleString('es-CO', {maximumFractionDigits: 0});
}

document.addEventListener("DOMContentLoaded", () => {
    renderTable(tecnicosData);
    renderEstadoRegional();
    initCharts();
});

function renderTable(records) {
    const tbody = document.getElementById('tableBody');
    let html = '';

    records.forEach(r => {
        const badgeClass = r.estado === "En progreso" ? "badge-progreso" : "badge-riesgo";
        const barColor = r.efectividad >= 70 ? "#22c55e" : (r.efectividad >= 50 ? "#f59e0b" : "#ef4444");

        html += `
            <tr>
                <td style="font-weight: 700; color: #1e293b;">${r.nombre}</td>
                <td>${r.regional}</td>
                <td>${formatMoney(r.meta)}</td>
                <td>${formatMoney(r.facturado)}</td>
                <td>${formatMoney(r.estimado)}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: bold; min-width: 32px;">${r.efectividad}%</span>
                        <div style="width: 80px; background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${r.efectividad}%; background: ${barColor}; height: 100%;"></div>
                        </div>
                    </div>
                </td>
                <td><span class="badge-status ${badgeClass}">${r.estado}</span></td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function renderEstadoRegional() {
    const container = document.getElementById('listaEstadoRegional');
    let html = '';

    regionesData.forEach(reg => {
        html += `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${reg.color}; display: inline-block;"></span>
                        ${reg.nombre}
                    </span>
                    <span style="color: #64748b;">${reg.monto} <strong style="color: #0f172a; margin-left: 6px;">${reg.porcentaje}%</strong></span>
                </div>
                <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="width: ${reg.porcentaje}%; background: ${reg.color}; height: 100%;"></div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function filterTable() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const regionalFiltro = document.getElementById('selectFiltroRegional').value;

    const filtered = tecnicosData.filter(r => {
        const matchNombre = r.nombre.toLowerCase().includes(query);
        const matchRegional = regionalFiltro === "TODAS" || r.regional === regionalFiltro;
        return matchNombre && matchRegional;
    });

    renderTable(filtered);
}

function initCharts() {
    // 1. Gráfico de Tendencia (Líneas)
    new Chart(document.getElementById('tendenciaChart'), {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr'],
            datasets: [
                {
                    label: 'Meta',
                    data: [3000000, 6000000, 9000000, 12000000],
                    borderColor: '#cbd5e0',
                    borderDash: [4, 4],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'Facturado',
                    data: [1200000, 4500000, 7000000, 8400000],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Estimado',
                    data: [500000, 1500000, 2800000, 3200000],
                    borderColor: '#9333ea',
                    borderWidth: 2,
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
                    ticks: { callback: (val) => '$ ' + (val/1000000) + 'M', font: { size: 10 } },
                    grid: { color: '#f1f5f9' }
                },
                x: { grid: { display: false } }
            }
        }
    });

    // 2. Gráfico Circular de Efectividad (Gauge Doughnut)
    new Chart(document.getElementById('gaugeEfectividad'), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [70, 30],
                backgroundColor: ['#0d9488', '#e2e8f0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: { tooltip: { enabled: false }, legend: { display: false } }
        }
    });
}

function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(tecnicosData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detalle_Tecnicos");
    XLSX.writeFile(wb, "Detalle_Tecnicos_Facturacion.xlsx");
}
