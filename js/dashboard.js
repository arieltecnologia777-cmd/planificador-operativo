const DATASET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSvQf6zIgwVnOQ72fcweEEMdRKylGsKFe30Mpea50qWIbr-m6ELzpxaUV2fnFRwH7TX1AMIabPbOqoJ/pub?output=csv";
const TOTAL_SITIOS_FIJO = 1460;

let datosGlobal = [];
let encabezadosGlobal = [];
let departamentoFiltroActual = "TODOS";

async function inicializarDashboard() {
    try {
        // Cargar nota del día desde el Worker
        cargarNotaDelDia();

        // Cargar dataset en formato CSV
        const resp = await fetch(DATASET_URL);
        const texto = await resp.text();

        const filas = texto.trim().split(/\r?\n/).map(fila => {
            const valores = [];
            let actual = "";
            let dentroComillas = false;

            for(let i=0; i<fila.length; i++){
                const caracter = fila[i];
                if(caracter === '"'){
                    dentroComillas = !dentroComillas;
                } else if(caracter === "," && !dentroComillas){
                    valores.push(actual);
                    actual = "";
                } else {
                    actual += caracter;
                }
            }
            valores.push(actual);
            return valores;
        });

        if (filas.length < 2) return;

        encabezadosGlobal = filas[0].map(h => h.trim());
        datosGlobal = filas.slice(1);

        renderizarDatosDashboard();
    } catch (error) {
        console.error("Error al cargar los datos del dataset en el dashboard:", error);
    }
}

// Función para sincronizar la nota del día
async function cargarNotaDelDia() {
    try {
        const resp = await fetch("https://planeacion-api.modulo-de-exclusiones.workers.dev/api/notas");
        const data = await resp.json();
        const txtNotas = document.getElementById("txtNotasDia");
        if (txtNotas && data.ok) {
            txtNotas.value = data.nota || "Sin notas registradas para hoy.";
        }
    } catch (err) {
        console.error("Error al cargar la nota:", err);
        const txtNotas = document.getElementById("txtNotasDia");
        if (txtNotas) txtNotas.value = "Error al sincronizar la nota del día.";
    }
}

function renderizarDatosDashboard() {
    if (!datosGlobal.length) return;

    // Buscar índices dinámicamente por nombre de columna para evitar errores de posición
    const idxEstadoReal = encabezadosGlobal.findIndex(h => h.toUpperCase() === "ESTADO REAL" || h.toUpperCase() === "ESTADO_REAL");
    const idxTotalIds = encabezadosGlobal.findIndex(h => h.toUpperCase() === "TOTAL IDS AFECTADOS" || h.toUpperCase() === "TOTAL_IDS_AFECTADOS" || h.toUpperCase() === "IDS AFECTADOS");
    const idxDepartamento = encabezadosGlobal.findIndex(h => h.toUpperCase() === "DEPARTAMENTO");

    // Fallback a los índices por defecto si no los encuentra por nombre (I=8, P=15)
    const colEstado = idxEstadoReal !== -1 ? idxEstadoReal : 15;
    const colIds = idxTotalIds !== -1 ? idxTotalIds : 8;
    const colDepto = idxDepartamento !== -1 ? idxDepartamento : 2;

    let datosFiltrados = datosGlobal;
    if (departamentoFiltroActual !== "TODOS") {
        datosFiltrados = datosGlobal.filter(fila => {
            const depto = String(fila[colDepto] || "").trim().toUpperCase(); 
            return depto === departamentoFiltroActual;
        });
    }

    let sumaOffline = 0;
    let sumaParcial = 0;
    let sumaVelocidad = 0;
    let sumaPqrs = 0;
    let sumaOtrosP3 = 0;

    datosFiltrados.forEach(fila => {
        const estado = String(fila[colEstado] || "").trim().toUpperCase();
        const idsAfectados = parseInt(fila[colIds], 10) || 0;

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

    // Cálculo del Online: 1460 menos la suma real de offline obtenida del dataset
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

    // Actualizar Tabla de Carpetas
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
