// Datos fijos consolidados directamente del análisis del Excel (Técnico Programado vs Aprobación Regional)
const dataRecords = [
    {"TECNICO PROGRAMADO": "ELGER LUIS HERNANDEZ RUIZ", "ACEPTADO.": 80931688, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 4379751, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 85311439},
    {"TECNICO PROGRAMADO": "ROBIN ROJAS JIMENEZ", "ACEPTADO.": 60060844, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 1532913, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 61593757},
    {"TECNICO PROGRAMADO": "YESID ADOLFO VALLEJO CABRERA", "ACEPTADO.": 59425128, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 0, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 59425128},
    {"TECNICO PROGRAMADO": "HUMBERTO RAFAEL DEECHE OROZCO", "ACEPTADO.": 58550190, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 0, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 58550190},
    {"TECNICO PROGRAMADO": "CAMILO ANDRES SALAZAR BARBOSA", "ACEPTADO.": 56373775, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 1313925, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 57687700},
    {"TECNICO PROGRAMADO": "ALVARO ENRIQUE LAMBRAÑO MUÑOZ", "ACEPTADO.": 53435826, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 2846838, "SIN MINDY": 0, "TRASLADADO": 819004, "TOTAL": 57101668},
    {"TECNICO PROGRAMADO": "JUAN CAMILO RODRIGUEZ LOPERA", "ACEPTADO.": 47438411, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 1313925, "RECHAZADO.": 7465362, "SIN MINDY": 819004, "TRASLADADO": 0, "TOTAL": 57036702},
    {"TECNICO PROGRAMADO": "MIGUEL ANGEL AGREDO MONTOYA", "ACEPTADO.": 50842564, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 320029, "RECHAZADO.": 3877323, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 55039916},
    {"TECNICO PROGRAMADO": "SAMMY ELIUD VARGAS SIERRA", "ACEPTADO.": 48360324, "CORREGIDO": 0, "ENVIADO.": 2671946, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 3658335, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 54690605},
    {"TECNICO PROGRAMADO": "YAIR ANDRES DIAZ POLO", "ACEPTADO.": 38432747, "CORREGIDO": 0, "ENVIADO.": 2801703, "GRN/BTS/RVST": 0, "PDTE ENV.": 977890, "RECHAZADO.": 8919802, "SIN MINDY": 819004, "TRASLADADO": 877504, "TOTAL": 52828650},
    {"TECNICO PROGRAMADO": "JOSE JORGE MANUEL GUTIERREZ BERNIER", "ACEPTADO.": 49684762, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 1642407, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 51327169},
    {"TECNICO PROGRAMADO": "ELIAN QUINTERO ROZO", "ACEPTADO.": 49495959, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 702003, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 50197962},
    {"TECNICO PROGRAMADO": "BREINER ANTONIO MAGDANIEL GARIZABAL", "ACEPTADO.": 45712011, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 3548841, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 49260852},
    {"TECNICO PROGRAMADO": "OSMAN DANIEL GRANADILLO ALVAREZ", "ACEPTADO.": 47487611, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 1313925, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 48801536},
    {"TECNICO PROGRAMADO": "LUCIANO DAVID HERNANDEZ MORALES", "ACEPTADO.": 47400786, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 1313925, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 48714711},
    {"TECNICO PROGRAMADO": "JUAN MANUEL TORRES HERNANDEZ", "ACEPTADO.": 45373143, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 2834932, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 48208075},
    {"TECNICO PROGRAMADO": "ELIAN DAVID RODRIGUEZ BUELVAS", "ACEPTADO.": 46789316, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 0, "SIN MINDY": 0, "TRASLADADO": 819004, "TOTAL": 47608320},
    {"TECNICO PROGRAMADO": "MANUEL ALBERTO RODRIGUEZ BUELVAS", "ACEPTADO.": 41819368, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 4207357, "SIN MINDY": 819004, "TRASLADADO": 0, "TOTAL": 46845729},
    {"TECNICO PROGRAMADO": "JHON ANTONY PARADA LOBO", "ACEPTADO.": 45114646, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 0, "RECHAZADO.": 0, "SIN MINDY": 1313925, "TRASLADADO": 0, "TOTAL": 46428571},
    {"TECNICO PROGRAMADO": "CARLOS ADRIAN OROZCO PINZON", "ACEPTADO.": 42040708, "CORREGIDO": 0, "ENVIADO.": 0, "GRN/BTS/RVST": 0, "PDTE ENV.": 1532913, "RECHAZADO.": 1532913, "SIN MINDY": 0, "TRASLADADO": 0, "TOTAL": 45106534}
];

const statusCols = ["ACEPTADO.", "CORREGIDO", "ENVIADO.", "GRN/BTS/RVST", "PDTE ENV.", "RECHAZADO.", "SIN MINDY", "TRASLADADO"];
const totals = {"ACEPTADO.": 1875335481.0, "CORREGIDO": 1997605.0, "ENVIADO.": 11623493.0, "GRN/BTS/RVST": 1532913.0, "PDTE ENV.": 5677670.0, "RECHAZADO.": 110310550.0, "SIN MINDY": 20591523.0, "TRASLADADO": 6881944.0, "TOTAL": 2033951179.0};

function formatMoney(amount) {
    return '$ ' + Number(amount).toLocaleString('es-CO', {maximumFractionDigits: 0});
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('kpiTotal').textContent = formatMoney(totals['TOTAL'] || 0);
    document.getElementById('kpiAceptado').textContent = formatMoney(totals['ACEPTADO.'] || 0);
    document.getElementById('kpiRechazado').textContent = formatMoney(totals['RECHAZADO.'] || 0);
    document.getElementById('kpiTecnicos').textContent = dataRecords.length;

    renderTable(dataRecords);
    initCharts();
});

function renderTable(records) {
    const thead = document.getElementById('tableHead');
    const tbody = document.getElementById('tableBody');

    let headHtml = '<tr><th>Técnico Programado</th>';
    statusCols.forEach(col => {
        headHtml += `<th>${col}</th>`;
    });
    headHtml += '<th>TOTAL ESTIMADO</th></tr>';
    thead.innerHTML = headHtml;

    let bodyHtml = '';
    records.forEach(row => {
        bodyHtml += `<tr><td style="font-weight: 700; color: #1e293b;">${row['TECNICO PROGRAMADO']}</td>`;
        statusCols.forEach(col => {
            bodyHtml += `<td>${formatMoney(row[col])}</td>`;
        });
        bodyHtml += `<td style="font-weight: 800; color: #2563eb;">${formatMoney(row['TOTAL'])}</td></tr>`;
    });
    tbody.innerHTML = bodyHtml;
}

function filterTable() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = dataRecords.filter(r => r['TECNICO PROGRAMADO'].toLowerCase().includes(query));
    renderTable(filtered);
}

function initCharts() {
    const top10 = [...dataRecords].sort((a,b) => b['TOTAL'] - a['TOTAL']).slice(0, 10);
    new Chart(document.getElementById('topTechChart'), {
        type: 'bar',
        data: {
            labels: top10.map(r => r['TECNICO PROGRAMADO'].split(' ')[0] + ' ' + (r['TECNICO PROGRAMADO'].split('').slice(-1)[0] || '')),
            datasets: [{
                label: 'Estimado a Facturar (COP)',
                data: top10.map(r => r['TOTAL']),
                backgroundColor: '#3b82f6',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });

    const statusTotals = statusCols.map(col => totals[col]);
    new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',
        data: {
            labels: statusCols,
            datasets: [{
                data: statusTotals,
                backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 } } } }
        }
    });
}

function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(dataRecords);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Facturacion_Tecnicos");
    XLSX.writeFile(wb, "Facturacion_Tecnicos.xlsx");
}
