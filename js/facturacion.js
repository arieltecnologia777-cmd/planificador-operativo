// Datos de técnicos consolidados para la tabla y gráficos
const tecnicosData = [
    { nombre: "Hailen Julio", regional: "Antioquia", meta: 12000000, aprobado: 8400000, rechazado: 1200000, subsanado: 2000000, efectividad: 70, estado: "En progreso" },
    { nombre: "Juan Torres", regional: "Cesar", meta: 10000000, aprobado: 6200000, rechazado: 1800000, subsanado: 2000000, efectividad: 62, estado: "En progreso" },
    { nombre: "Samuel Pushaina", regional: "La Guajira", meta: 8000000, aprobado: 3600000, rechazado: 2400000, subsanado: 2000000, efectividad: 45, estado: "En riesgo" },
    { nombre: "Hardy Whitaker", regional: "Sai", meta: 9000000, aprobado: 7000000, rechazado: 1000000, subsanado: 1000000, efectividad: 78, estado: "En progreso" },
    { nombre: "Elger Hernández", regional: "Cesar", meta: 15000000, aprobado: 12000000, rechazado: 1500000, subsanado: 1500000, efectividad: 80, estado: "En progreso" },
    { nombre: "Sammy Eliud", regional: "Antioquia", meta: 11000000, aprobado: 9000000, rechazado: 1000000, subsanado: 1000000, efectividad: 82, estado: "En progreso" }
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
                        label: 'Aprobado',
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
                        label: 'Subsanado',
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
