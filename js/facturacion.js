// Datos de técnicos consolidados para la tabla y gráficos
const tecnicosData = [
    { nombre: "Hailen Julio", regional: "Antioquia", meta: 12000000, facturado: 8400000, estimado: 3200000, efectividad: 70, estado: "En progreso" },
    { nombre: "Juan Torres", regional: "Cesar", meta: 10000000, facturado: 6200000, estimado: 2800000, efectividad: 62, estado: "En progreso" },
    { nombre: "Samuel Pushaina", regional: "La Guajira", meta: 8000000, facturado: 3600000, estimado: 2200000, efectividad: 45, estado: "En riesgo" },
    { nombre: "Hardy Whitaker", regional: "Sai", meta: 9000000, facturado: 7000000, estimado: 2000000, efectividad: 78, estado: "En progreso" },
    { nombre: "Elger Hernández", regional: "Cesar", meta: 15000000, facturado: 12000000, estimado: 3500000, efectividad: 80, estado: "En progreso" },
    { nombre: "Sammy Eliud", regional: "Antioquia", meta: 11000000, facturado: 9000000, estimado: 2500000, efectividad: 82, estado: "En progreso" }
];

function formatMoney(amount) {
    return '$ ' + Number(amount).toLocaleString('es-CO', {maximumFractionDigits: 0});
}

document.addEventListener("DOMContentLoaded", () => {
    renderTable(tecnicosData);
    initCharts();
});

function renderTable(records) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
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
    // 1. Gráfico de Tendencia ("Tu avance de facturación")
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
                        pointBackgroundColor: '#94a3b8',
                        fill: false
                    },
                    {
                        label: 'Facturado',
                        data: [700000, 3800000, 7200000, 9600000],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.12)',
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: '#2563eb',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Estimado',
                        data: [300000, 1300000, 3900000, 4000000],
                        borderColor: '#9333ea',
                        backgroundColor: 'rgba(147, 51, 234, 0.05)',
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointBackgroundColor: '#9333ea',
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
                    x: { 
                        grid: { display: false },
                        ticks: { font: { weight: 'bold' }, color: '#64748b' }
                    }
                }
            }
        });
    }

    // 2. Gráfico Circular de Efectividad (Gauge Doughnut en el KPI)
    const ctxGauge = document.getElementById('gaugeEfectividad');
    if (ctxGauge) {
        new Chart(ctxGauge, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [70, 30],
                    backgroundColor: ['#00b087', '#e2e8f0'],
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
