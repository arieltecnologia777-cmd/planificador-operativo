const DATASET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSvQf6zIgwVnOQ72fcweEEMdRKylGsKFe30Mpea50qWIbr-m6ELzpxaUV2fnFRwH7TX1AMIabPbOqoJ/pubhtml";
const TOTAL_SITIOS_FIJO = 1460;

let datosGlobal = [];
let departamentoFiltroActual = "TODOS";

async function inicializarDashboard() {
    try {
        const resp = await fetch(DATASET_URL);
        const htmlText = await resp.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const tablaHtml = doc.querySelector('table');

        if (!tablaHtml) {
            console.warn("No se encontró la tabla en el pubhtml.");
            return;
        }

        const rows = Array.from(tablaHtml.querySelectorAll('tr')).map(tr =>
            Array.from(tr.querySelectorAll('th, td')).map(td => td.textContent.trim())
        );

        if (rows.length < 2) return;

        // Cabecera de la tabla (fila 0) y datos (desde la fila 1 en adelante)
        const encabezados = rows[0];
        datosGlobal = rows.slice(1);

        renderizarDatosDashboard();
    } catch (error) {
        console.error("Error al cargar los datos del dataset en el dashboard:", error);
    }
}

function renderizarDatosDashboard() {
    if (!datosGlobal.length) return;

    // Índice Columna I (Total IDs afectados) -> índice 8
    // Índice Columna P (Estado real) -> índice 15
    // Índice Departamento (por si se filtra por departamento, ej: índice aproximado o buscando en encabezados)
    const idxTotalIds = 8;
    const idxEstadoReal = 15;

    let datosFiltrados = datosGlobal;
    if (departamentoFiltroActual !== "TODOS") {
        datosFiltrados = datosGlobal.filter(fila => {
            const depto = String(fila[2] || "").trim().toUpperCase(); // Ajustar índice de columna de depto si es necesario
            return depto === departamentoFiltroActual;
        });
    }

    let sumaOffline = 0;
    let sumaParcial = 0;
    let sumaVelocidad = 0;
    let sumaPqrs = 0;
    let sumaOtrosP3 = 0;

    datosFiltrados.forEach(fila => {
        const estado = (fila[idxEstadoReal] || "").toUpperCase();
        const idsAfectados = parseInt(fila[idxTotalIds], 10) || 0;

        if (estado.includes("OFFLINE")) {
            sumaOffline += idsAfectados;
        } else if (estado.includes("PARCIAL")) {
            sumaParcial += idsAfectados;
        } else if (estado.includes("VELOCIDAD")) {
            sumaVelocidad += idsAfectados;
        } else if (estado.includes("PQR")) {
            sumaPqrs += idsAfectados;
        } else if (estado.includes("P3") || estado.includes("OTROS")) {
            sumaOtrosP3 += idsAfectados;
        }
    });

    // Cálculo del Online: 1460 menos la suma de offline
    const totalOnline = Math.max(0, TOTAL_SITIOS_FIJO - sumaOffline);

    // Actualizar KPIs superiores
    const elOnline = document.getElementById("valOnline");
    const elOffline = document.getElementById("valOffline");
    const elParcial = document.getElementById("valParcial");
    const elVelocidad = document.getElementById("valVelocidad");
    const elPqrs = document.getElementById("valPqrs");
    const elOtrosP3 = document.getElementById("valOtrosP3");

    if (elOnline) elOnline.textContent = totalOnline;
    if (elOffline) elOffline.textContent = sumaOffline;
    if (elParcial) elParcial.textContent = sumaParcial;
    if (elVelocidad) elVelocidad.textContent = sumaVelocidad;
    if (elPqrs) elPqrs.textContent = sumaPqrs;
    if (elOtrosP3) elOtrosP3.textContent = sumaOtrosP3;

    // Actualizar Tabla de Carpetas si existen los elementos
    const netOff = document.getElementById("c_neto_off");
    const netPar = document.getElementById("c_neto_par");
    const netVel = document.getElementById("c_neto_vel");
    const netPqr = document.getElementById("c_neto_pqr");
    const netP3 = document.getElementById("c_neto_p3");

    if (netOff) netOff.textContent = sumaOffline;
    if (netPar) netPar.textContent = sumaParcial;
    if (netVel) netVel.textContent = sumaVelocidad;
    if (netPqr) netPqr.textContent = sumaPqrs;
    if (netP3) netP3.textContent = sumaOtrosP3;

    // Actualizar % Performance
    const totalSitios = TOTAL_SITIOS_FIJO || 1;
    const pctOfflineVal = ((sumaOffline / totalSitios) * 100).toFixed(2);
    const pctOnlineVal = ((totalOnline / totalSitios) * 100).toFixed(2);

    const lblOffPerf = document.getElementById("lblOfflinePerf");
    const barOffPerf = document.getElementById("barPerfOffline");
    if (lblOffPerf) lblOffPerf.textContent = `Offline (${pctOfflineVal}%)`;
    if (barOffPerf) barOffPerf.style.width = `${pctOfflineVal}%`;

    const lblOnPerf = document.getElementById("lblOnlinePerf");
    const barOnPerf = document.getElementById("barPerfOnline");
    if (lblOnPerf) lblOnPerf.textContent = `Online (${pctOnlineVal}%)`;
    if (barOnPerf) barOnPerf.style.width = `${pctOnlineVal}%`;

    // Indicadores Backlog
    const valR1 = document.getElementById("valBacklogR1");
    const barR1 = document.getElementById("barR1");
    if (valR1) valR1.textContent = "97,17 %";
    if (barR1) barR1.style.width = "97.17%";

    const valR2 = document.getElementById("valBacklogR2");
    const barR2 = document.getElementById("barR2");
    if (valR2) valR2.textContent = "87,53 %";
    if (barR2) barR2.style.width = "87.53%";
}

// Eventos de selección de departamento mediante botones o marcadores del mapa
document.addEventListener("click", (e) => {
    const btnDepto = e.target.closest(".btn-depto, .marcador-mapa");
    if (btnDepto) {
        const depto = btnDepto.getAttribute("data-depto");
        if (depto) {
            departamentoFiltroActual = depto;
            
            document.querySelectorAll(".btn-depto").forEach(b => {
                if (b.getAttribute("data-depto") === depto) {
                    b.classList.add("active");
                } else {
                    b.classList.remove("active");
                }
            });

            renderizarDatosDashboard();
        }
    }

    if (e.target.id === "btnBorrarFiltros") {
        departamentoFiltroActual = "TODOS";
        document.querySelectorAll(".btn-depto").forEach(b => {
            if (b.getAttribute("data-depto") === "TODOS") b.classList.add("active");
            else b.classList.remove("active");
        });
        renderizarDatosDashboard();
    }
});

document.addEventListener("DOMContentLoaded", inicializarDashboard);
