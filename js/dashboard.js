const DATASET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSvQf6zIgwVnOQ72fcweEEMdRKylGsKFe30Mpea50qWIbr-m6ELzpxaUV2fnFRwH7TX1AMIabPbOqoJ/pub?output=csv";

// Matriz de sitios totales fijos según la tabla de distribución
const TOTALES_MAPA = {
    "TODOS": { "TODOS": 1460, "MINTIC 7K": 1443, "ODH 5G": 17 },
    "ANTIOQUIA": { "TODOS": 396, "MINTIC 7K": 379, "ODH 5G": 17 },
    "CESAR": { "TODOS": 554, "MINTIC 7K": 554, "ODH 5G": 0 },
    "LA GUAJIRA": { "TODOS": 489, "MINTIC 7K": 489, "ODH 5G": 0 },
    "SAI": { "TODOS": 21, "MINTIC 7K": 21, "ODH 5G": 0 }
};

let datosGlobal = [];
let encabezadosGlobal = [];
let departamentoFiltroActual = "TODOS";
let proyectoFiltroActual = "MINTIC 7K"; // Por defecto arranca en MinTic 7K

async function inicializarDashboard() {
    try {
        cargarNotaDelDia();

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

    // Buscar columnas dinámicamente
    const idxEstadoReal = encabezadosGlobal.findIndex(h => h.toUpperCase() === "ESTADO REAL" || h.toUpperCase() === "ESTADO_REAL");
    const idxTotalIds = encabezadosGlobal.findIndex(h => h.toUpperCase() === "TOTAL IDS AFECTADOS" || h.toUpperCase() === "TOTAL_IDS_AFECTADOS" || h.toUpperCase() === "IDS AFECTADOS");
    const idxDepartamento = encabezadosGlobal.findIndex(h => h.toUpperCase() === "DEPARTAMENTO");
    const idxProyecto = encabezadosGlobal.findIndex(h => h.toUpperCase() === "PROYECTO");

    const colEstado = idxEstadoReal !== -1 ? idxEstadoReal : 15;
    const colIds = idxTotalIds !== -1 ? idxTotalIds : 8;
    const colDepto = idxDepartamento !== -1 ? idxDepartamento : 2;
    const colProj = idxProyecto !== -1 ? idxProyecto : 3; // Ajusta según la posición de tu columna Proyecto

    // Filtrar datos por Departamento y Proyecto
    let datosFiltrados = datosGlobal.filter(fila => {
        const depto = String(fila[colDepto] || "").trim().toUpperCase();
        const proyecto = String(fila[colProj] || "").trim().toUpperCase();

        const matchDepto = (departamentoFiltroActual === "TODOS" || depto === departamentoFiltroActual);
        const matchProyecto = (proyectoFiltroActual === "TODOS" || proyecto.includes(proyectoFiltroActual));

        return matchDepto && matchProyecto;
    });

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

    // Obtener el total fijo correspondiente a la combinación actual de filtros
    const totalSitiosFijo = (TOTALES_MAPA[departamentoFiltroActual] && TOTALES_MAPA[departamentoFiltroActual][proyectoFiltroActual] !== undefined)
        ? TOTALES_MAPA[departamentoFiltroActual][proyectoFiltroActual]
        : 1460;

    // Actualizar el valor visual de "TOTAL CD" en el panel superior
    const elTotalCd = document.querySelector(".val-total-cd");
    if (elTotalCd) elTotalCd.textContent = totalSitiosFijo;

    // Cálculo del Online: Total fijo de la combinación menos los offline reales
    const totalOnline = Math.max(0, totalSitiosFijo - sumaOffline);

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
    const divisorPerf = totalSitiosFijo || 1;
    const pctOfflineVal = ((sumaOffline / divisorPerf) * 100).toFixed(2);
    const pctOnlineVal = ((totalOnline / divisorPerf) * 100).toFixed(2);

    const lblOffPerf = document.getElementById("lblOfflinePerf");
    const barOffPerf = document.getElementById("barPerfOffline");
    if (lblOffPerf) lblOffPerf.textContent = `Offline (${pctOfflineVal}%)`;
    if (barOffPerf) barOffPerf.style.width = `${pctOfflineVal}%`;

    const lblOnPerf = document.getElementById("lblOnlinePerf");
    const barOnPerf = document.getElementById("barPerfOnline");
    if (lblOnPerf) lblOnPerf.textContent = `Online (${pctOnlineVal}%)`;
    if (barOnPerf) barOnPerf.style.width = `${pctOnlineVal}%`;
}

// Manejo de eventos de clic en filtros (Departamentos, Mapa y Proyectos)
document.addEventListener("click", (e) => {
    // Filtro por Departamento o Mapa
    const btnDepto = e.target.closest(".btn-depto, .marcador-mapa");
    if (btnDepto) {
        const depto = btnDepto.getAttribute("data-depto");
        if (depto) {
            departamentoFiltroActual = depto;
            document.querySelectorAll(".btn-depto").forEach(b => {
                if (b.getAttribute("data-depto") === depto) b.classList.add("active");
                else b.classList.remove("active");
            });
            renderizarDatosDashboard();
        }
    }

    // Filtro por Proyecto (MinTic 7K / ODH 5G)
    const btnFiltroProyecto = e.target.closest(".botones-filtro button");
    if (btnFiltroProyecto) {
        document.querySelectorAll(".botones-filtro button").forEach(b => b.classList.remove("active"));
        btnFiltroProyecto.classList.add("active");
        
        const textoProyecto = btnFiltroProyecto.textContent.trim().toUpperCase();
        if (textoProyecto.includes("MINTIC")) {
            proyectoFiltroActual = "MINTIC 7K";
        } else if (textoProyecto.includes("ODH")) {
            proyectoFiltroActual = "ODH 5G";
        } else {
            proyectoFiltroActual = "TODOS";
        }
        renderizarDatosDashboard();
    }

    // Botón Borrar Filtros
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
