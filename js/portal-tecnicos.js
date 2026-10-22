const API_BASE_URL = "https://facturacion.modulo-de-exclusiones.workers.dev/api";
const FACTURACION_API_URL = `${API_BASE_URL}/facturacion`;

let registrosCrudos = [];
let tecnicoActual = "";
const META_FIJA_TECNICO = 9500000;

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosTecnicos();
});

async function cargarDatosTecnicos() {
    try {
        const response = await fetch(FACTURACION_API_URL);
        if (response.ok) {
            registrosCrudos = await response.json();
            if (Array.isArray(registrosCrudos) && registrosCrudos.length > 0) {
                poblarSelectTecnicos(registrosCrudos);
            } else {
                document.getElementById('selectTecnico').innerHTML = '<option value="">No hay registros en la base de datos</option>';
            }
        }
    } catch (err) {
        console.error("Error al conectar con la API:", err);
    }
}

function poblarSelectTecnicos(rows) {
    const setTecnicos = new Set();

    rows.forEach(r => {
        const rawTecnico = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfil = String(rawTecnico).replace(/["']/g, "").trim();
        if (perfil && perfil !== "SIN PROGRAMACION") {
            setTecnicos.add(perfil.toUpperCase());
        }
    });

    const select = document.getElementById('selectTecnico');
    let html = '<option value="">-- Elige tu nombre de técnico --</option>';
    
    Array.from(setTecnicos).sort().forEach(tec => {
        html += `<option value="${tec}">${tec}</option>`;
    });

    select.innerHTML = html;

    if (setTecnicos.size > 0) {
        select.value = Array.from(setTecnicos).sort()[0];
        cambiarTecnicoSeleccionado();
    }
}

function cambiarTecnicoSeleccionado() {
    const select = document.getElementById('selectTecnico');
    tecnicoActual = select.value;
    if (!tecnicoActual) return;

    filtrarYRenderizarPerfilTecnico();
}

function filtrarYRenderizarPerfilTecnico(filtroEstadoExtra = null) {
    if (!tecnicoActual) return;

    const registrosTecnico = registrosCrudos.filter(r => {
        const rawPerfil = r.tecnico_programado || r.TECNICO_PROGRAMADO || r['TECNICO PROGRAMADO'] || r['Técnico Programado'] || "";
        const perfil = String(rawPerfil).replace(/["']/g, "").trim().toUpperCase();
        return perfil === tecnicoActual;
    });

    let totalAprobado = 0;
    let totalRechazado = 0;
    let totalSubsanado = 0;

    registrosTecnico.forEach(r => {
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();
        const estAceptar = aprobReg.includes("ACEPTADO");
        const estRechazar = aprobReg.includes("RECHAZADO");
        const montoBase = Number(r.estimado_a_facturar ?? r.facturacion ?? r.Facturacion ?? 0);
        const aprobadoVal = estAceptar ? Number(r.total_aprobado ?? r.REAL_FACTURADO ?? r['Total  Aprobado'] ?? 0) : 0;
        const rechazadoVal = estRechazar ? montoBase : 0;
        const subsanadoVal = Number(r.trasiego_esp ?? 0);

        totalAprobado += aprobadoVal;
        totalRechazado += rechazadoVal;
        totalSubsanado += subsanadoVal;
    });

    const porcentaje = META_FIJA_TECNICO > 0 ? Math.round((totalAprobado / META_FIJA_TECNICO) * 100) : 0;

    document.getElementById('techMeta').innerText = formatMoney(META_FIJA_TECNICO);
    document.getElementById('techAprobado').innerText = formatMoney(totalAprobado);
    document.getElementById('techRechazado').innerText = formatMoney(totalRechazado);
    document.getElementById('techSubsanado').innerText = formatMoney(totalSubsanado);
    document.getElementById('techPorcentajeCumplimiento').innerText = `${porcentaje}%`;

    const barraAprobado = document.getElementById('techBarAprobado');
    if (barraAprobado) barraAprobado.style.width = Math.min(100, porcentaje) + '%';

    const barraProgreso = document.getElementById('techBarraProgreso');
    const badgeEstado = document.getElementById('techBadgeEstado');
    if (barraProgreso) barraProgreso.style.width = Math.min(100, porcentaje) + '%';

    if (porcentaje >= 100) {
        if (barraProgreso) barraProgreso.style.backgroundColor = '#16a34a';
        if (badgeEstado) {
            badgeEstado.innerText = '¡Meta Cumplida! 🏆';
            badgeEstado.style.background = '#dcfce7';
            badgeEstado.style.color = '#16a34a';
        }
    } else {
        if (barraProgreso) barraProgreso.style.backgroundColor = '#2563eb';
        if (badgeEstado) {
            badgeEstado.innerText = 'En Progreso ⚡';
            badgeEstado.style.background = '#eff6ff';
            badgeEstado.style.color = '#2563eb';
        }
    }

    let registrosTabla = registrosTecnico;
    if (filtroEstadoExtra) {
        registrosTabla = registrosTecnico.filter(r => {
            const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "").toUpperCase();
            return aprobReg.includes(filtroEstadoExtra);
        });
    }

    renderTableTecnico(registrosTabla);
}

function filtrarTablaEstado(estado) {
    filtrarYRenderizarPerfilTecnico(estado);
}

function resetFiltroTabla() {
    filtrarYRenderizarPerfilTecnico(null);
}

function renderTableTecnico(rows) {
    const tbody = document.getElementById('techTableBody');
    if (!tbody) return;

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 25px;">No hay registros para mostrar.</td></tr>`;
        return;
    }

    let html = '';
    rows.forEach(r => {
        const idOT = r.id_id || r.ID_ID || r.id || r.ID || 'N/A';
        const depto = r.departamento || r.DEPARTAMENTO || r.dep || 'N/A';
        const aprobReg = String(r.aprobacion_regional || r.APROBACION_REGIONAL || r['APROBACION REGIONAL'] || "PENDIENTE");
        const causa = r.causa_rechazo || r.CAUSA_RECHAZO || r['Causa Rechazo'] || '-';
        const estimado = Number(r.estimado_a_facturar ?? r.facturacion ?? r.Facturacion ?? 0);
        const aprobado = Number(r.total_aprobado ?? r.REAL_FACTURADO ?? r['Total  Aprobado'] ?? 0);

        let badgeColor = "background: #fef3c7; color: #d97706;";
        const upperAprob = aprobReg.toUpperCase();
        if (upperAprob.includes("ACEPTADO")) badgeColor = "background: #dcfce7; color: #16a34a;";
        else if (upperAprob.includes("RECHAZADO")) badgeColor = "background: #fee2e2; color: #dc2626;";

        html += `
            <tr>
                <td style="font-weight: 800; color: #1e3a8a;">${idOT}</td>
                <td style="text-transform: uppercase;">${depto}</td>
                <td><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 0.72rem; ${badgeColor}">${aprobReg}</span></td>
                <td style="color: #dc2626; font-weight: 700;">${causa}</td>
                <td style="text-align: right; font-weight: 700;">${formatMoney(estimado)}</td>
                <td style="text-align: right; font-weight: 800; color: #16a34a;">${formatMoney(aprobado)}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function formatMoney(amount) {
    return '$ ' + Number(amount || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    sidebar.classList.toggle('activo');
}
