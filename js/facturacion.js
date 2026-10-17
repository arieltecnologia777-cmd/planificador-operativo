// Actualizar Tarjetas KPI generales de forma dinámica según los filtros seleccionados
function actualizarKPIsGenerales(rows) {
    // Detectar los técnicos únicos presentes en los registros filtrados actuales
    const tecnicosUnicos = new Set(rows.map(r => r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r.perfil_wfm || r.PERFIL_WFM || "SIN PROGRAMACION"));
    
    // La meta total filtrada es la cantidad de técnicos únicos en el filtro por la meta fija (9.500.000)
    let totalMeta = tecnicosUnicos.size * META_FIJA_TECNICO;

    // Sumatoria de aprobados, rechazados (valor_visita) y subsanados (trasiego_esp) según los registros filtrados
    let totalAprobado = rows.reduce((acc, r) => acc + Number(r.total_aprobado ?? r.REAL_FACTURADO ?? r['Total  Aprobado'] ?? 0), 0);
    let totalRechazado = rows.reduce((acc, r) => acc + Number(r.valor_visita ?? 0), 0);
    let totalSubsanado = rows.reduce((acc, r) => acc + Number(r.trasiego_esp ?? 0), 0);
    
    // Efectividad global basada estrictamente en aprobado / meta según los filtros
    let efectividadGlobal = totalMeta > 0 ? Math.round((totalAprobado / totalMeta) * 100) : 0;

    if(document.getElementById('kpiMeta')) document.getElementById('kpiMeta').innerText = formatMoney(totalMeta);
    if(document.getElementById('kpiAprobado')) document.getElementById('kpiAprobado').innerText = formatMoney(totalAprobado);
    if(document.getElementById('kpiRechazado')) document.getElementById('kpiRechazado').innerText = formatMoney(totalRechazado);
    if(document.getElementById('kpiSubsanado')) document.getElementById('kpiSubsanado').innerText = formatMoney(totalSubsanado);
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
