// Procesar registros del Excel para consolidar por técnico con mapeo flexible de columnas
function procesarDatosParaVista(rows) {
    const mapaTecnicos = {};

    rows.forEach(r => {
        // Capturar el nombre del técnico de la columna correcta
        const nombreTecnico = r.tecnico_programado || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "SIN PROGRAMACION";
        
        // Capturar la regional o departamento de la columna correcta (según tu segunda imagen)
        const regional = r.region || r.REGION || r.Departamento || r.DEPARTAMENTO || r[' REGIONAL2 '] || "GENERAL";
        
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

        // Mapeo flexible adaptado a los nombres reales de tus columnas numéricas
        const metaVal = Number(r.facturacion || r.Facturacion || r.FACTURACION || 0);
        const aprobadoVal = Number(r.total_aprobado || r['Total  Aprobado'] || r['Total Aprobado'] || r.totalaprobado || 0);
        const rechazadoVal = Number(r.valor_visita || r['Valor visita'] || r.VALOR_VISITA || 0);
        const subsanadoVal = Number(r.trasiego_esp || r['TRASIEGO ESP.'] || r['TRASIEGO ESP'] || 0);

        mapaTecnicos[nombreTecnico].meta += metaVal;
        mapaTecnicos[nombreTecnico].aprobado += aprobadoVal;
        mapaTecnicos[nombreTecnico].rechazado += rechazadoVal;
        mapaTecnicos[nombreTecnico].subsanado += subsanadoVal;
    });

    return Object.values(mapaTecnicos).map(t => {
        t.efectividad = t.meta > 0 ? Math.round((t.aprobado / t.meta) * 100) : 0;
        t.estado = t.efectividad >= 70 ? "En progreso" : "En riesgo";
        return t;
    });
}

// Actualizar KPIs generales con los nombres exactos de columnas
function actualizarKPIsGenerales(rows) {
    let totalMeta = rows.reduce((acc, r) => acc + Number(r.facturacion || r.Facturacion || r.FACTURACION || 0), 0);
    let totalAprobado = rows.reduce((acc, r) => acc + Number(r.total_aprobado || r['Total  Aprobado'] || r['Total Aprobado'] || 0), 0);
    let totalRechazado = rows.reduce((acc, r) => acc + Number(r.valor_visita || r['Valor visita'] || 0), 0);
    let totalSubsanado = rows.reduce((acc, r) => acc + Number(r.trasiego_esp || r['TRASIEGO ESP.'] || 0), 0);
    
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

// Renderizar Estado Regional usando los departamentos reales (ANTIOQUIA, CESAR, LA GUAJIRA, SAI)
function renderizarEstadoRegional(rows) {
    const container = document.getElementById('estadoRegionalContainer');
    if (!container) return;

    const mapaRegiones = {};
    rows.forEach(r => {
        const reg = r.region || r.REGION || r.Departamento || r.DEPARTAMENTO || r[' REGIONAL2 '] || "GENERAL";
        if (!mapaRegiones[reg]) mapaRegiones[reg] = { aprobado: 0, meta: 0 };
        mapaRegiones[reg].aprobado += Number(r.total_aprobado || r['Total  Aprobado'] || r['Total Aprobado'] || 0);
        mapaRegiones[reg].meta += Number(r.facturacion || r.Facturacion || r.FACTURACION || 0);
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
