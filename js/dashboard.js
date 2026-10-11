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
let proyectoFiltroActual = "MINTIC 7K";

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

    const idxEstadoReal = encabezadosGlobal.findIndex(h => h.toUpperCase() === "ESTADO REAL" || h.toUpperCase() === "ESTADO_REAL");
    const idxTotalIds = encabezadosGlobal.findIndex(h => h.toUpperCase() === "TOTAL IDS AFECTADOS" || h.toUpperCase() === "TOTAL_IDS_AFECTADOS" || h.toUpperCase() === "IDS AFECTADOS");
    const idxDepartamento = encabezadosGlobal.findIndex(h => h.toUpperCase() === "DEPARTAMENTO");
    const idxProyecto = encabezadosGlobal.findIndex(h => h.toUpperCase() === "PROYECTO");

    const colEstado = idxEstadoReal !== -1 ? idxEstadoReal : 19;
    const colIds = idxTotalIds !== -1 ? idxTotalIds : 8;
    const colDepto = idxDepartamento !== -1 ? idxDepartamento : 2;
    const colProj = idxProyecto !== -1 ? idxProyecto : 3;
    const colCarpetaU = 20; 
    const colStopper = 21;  

    let datosFiltrados = datosGlobal.filter(fila => {
        const depto = String(fila[colDepto] || "").trim().toUpperCase();
        const proyecto = String(fila[colProj] || "").trim().toUpperCase();

        const matchDepto = (departamentoFiltroActual === "TODOS" || depto === departamentoFiltroActual);
        const matchProyecto = (proyectoFiltroActual === "TODOS" || proyecto.includes(proyectoFiltroActual));

        return matchDepto && matchProyecto;
    });

    let sumaOffline = 0, sumaParcial = 0, sumaVelocidad = 0, sumaPqrs = 0, sumaOtrosP3 = 0;
    let fmOff = 0, fmPar = 0, fmVel = 0, fmPqr = 0, fmP3 = 0;
    let repOff = 0, repPar = 0, repVel = 0, repPqr = 0, repP3 = 0;
    let reqOff = 0, reqPar = 0, reqVel = 0, reqPqr = 0, reqP3 = 0;

    datosFiltrados.forEach(fila => {
        const estado = String(fila[colEstado] || "").trim().toUpperCase();
        const clasificacionU = String(fila[colCarpetaU] || "").trim().toUpperCase();
        const stopper = String(fila[colStopper] || "").trim().toUpperCase();
        const idsAfectados = parseInt(fila[colIds], 10) || 0;

        // 1. Totales netos (Universo completo)
        if (estado.includes("OFFLINE")) sumaOffline += idsAfectados;
        else if (estado.includes("PARCIAL")) sumaParcial += idsAfectados;
        else if (estado.includes("VELOCIDAD")) sumaVelocidad += idsAfectados;
        else if (estado.includes("PQR")) sumaPqrs += idsAfectados;
        else if (estado.includes("P3") || estado.includes("OTROS")) sumaOtrosP3 += idsAfectados;

        // 2. FM/Trasl./reubicaciones (Columna U)
        if (clasificacionU.includes("FM") || clasificacionU.includes("TRASLADO") || clasificacionU.includes("REUBICACION")) {
            if (estado.includes("OFFLINE")) fmOff += idsAfectados;
            else if (estado.includes("PARCIAL")) fmPar += idsAfectados;
            else if (estado.includes("VELOCIDAD")) fmVel += idsAfectados;
            else if (estado.includes("PQR")) fmPqr += idsAfectados;
            else if (estado.includes("P3") || estado.includes("OTROS")) fmP3 += idsAfectados;
        }

        // 3. Repuestos (Stopper)
        if (stopper.includes("REPUESTO")) {
            if (estado.includes("OFFLINE")) repOff += idsAfectados;
            else if (estado.includes("PARCIAL")) repPar += idsAfectados;
            else if (estado.includes("VELOCIDAD")) repVel += idsAfectados;
            else if (estado.includes("PQR")) repPqr += idsAfectados;
            else if (estado.includes("P3") || estado.includes("OTROS")) repP3 += idsAfectados;
        }

        // 4. Requiere atención S.O (Stopper)
        if (stopper.includes("REQUIERE") || stopper.includes("ATENCION S.O") || stopper.includes("ATENCIÓN S.O")) {
            if (estado.includes("OFFLINE")) reqOff += idsAfectados;
            else if (estado.includes("PARCIAL")) reqPar += idsAfectados;
            else if (estado.includes("VELOCIDAD")) reqVel += idsAfectados;
            else if (estado.includes("PQR")) reqPqr += idsAfectados;
            else if (estado.includes("P3") || estado.includes("OTROS")) reqP3 += idsAfectados;
        }
    });

    // 5. Neto sin stopper: Resta del total neto menos las demás carpetas con stopper
    const sinOff = Math.max(0, sumaOffline - (fmOff + repOff + reqOff));
    const sinPar = Math.max(0, sumaParcial - (fmPar + repPar + reqPar));
    const sinVel = Math.max(0, sumaVelocidad - (fmVel + repVel + reqVel));
    const sinPqr = Math.max(0, sumaPqrs - (fmPqr + repPqr + reqPqr));
    const sinP3  = Math.max(0, sumaOtrosP3 - (fmP3 + repP3 + reqP3));

    // Total de sitios fijo según la combinación de filtros
    const totalSitiosFijo = (TOTALES_MAPA[departamentoFiltroActual] && TOTALES_MAPA[departamentoFiltroActual][proyectoFiltroActual] !== undefined)
        ? TOTALES_MAPA[departamentoFiltroActual][proyectoFiltroActual]
        : 1460;

    const elTotalCd = document.querySelector(".val-total-cd");
    if (elTotalCd) elTotalCd.textContent = totalSitiosFijo;

    // Cálculo del Online
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

    // Pintar Tabla de Carpetas - Total neto
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

    // Pintar Fila FM/Trasl./reubicaciones
    const c_fm_off = document.getElementById("c_fm_off");
    const c_fm_par = document.getElementById("c_fm_par");
    const c_fm_vel = document.getElementById("c_fm_vel");
    const c_fm_pqr = document.getElementById("c_fm_pqr");
    const c_fm_p3 = document.getElementById("c_fm_p3");

    if (c_fm_off) c_fm_off.textContent = fmOff;
    if (c_fm_par) c_fm_par.textContent = fmPar;
    if (c_fm_vel) c_fm_vel.textContent = fmVel;
    if (c_fm_pqr) c_fm_pqr.textContent = fmPqr;
    if (c_fm_p3) c_fm_p3.textContent = fmP3;

    // Pintar Fila Repuestos
    const c_rep_off = document.getElementById("c_rep_off");
    const c_rep_par = document.getElementById("c_rep_par");
    const c_rep_vel = document.getElementById("c_rep_vel");
    const c_rep_pqr = document.getElementById("c_rep_pqr");
    const c_rep_p3 = document.getElementById("c_rep_p3");

    if (c_rep_off) c_rep_off.textContent = repOff;
    if (c_rep_par) c_rep_par.textContent = repPar;
    if (c_rep_vel) c_rep_vel.textContent = repVel;
    if (c_rep_pqr) c_rep_pqr.textContent = repPqr;
    if (c_rep_p3) c_rep_p3.textContent = repP3;

    // Pintar Fila Requiere atención S.O
    const c_req_off = document.getElementById("c_req_off");
    const c_req_par = document.getElementById("c_req_par");
    const c_req_vel = document.getElementById("c_req_vel");
    const c_req_pqr = document.getElementById("c_req_pqr");
    const c_req_p3 = document.getElementById("c_req_p3");

    if (c_req_off) c_req_off.textContent = reqOff;
    if (c_req_par) c_req_par.textContent = reqPar;
    if (c_req_vel) c_req_vel.textContent = reqVel;
    if (c_req_pqr) c_req_pqr.textContent = reqPqr;
    if (c_req_p3) c_req_p3.textContent = reqP3;

    // Pintar Fila Neto sin stopper
    const c_sin_off = document.getElementById("c_sin_off");
    const c_sin_par = document.getElementById("c_sin_par");
    const c_sin_vel = document.getElementById("c_sin_vel");
    const c_sin_pqr = document.getElementById("c_sin_pqr");
    const c_sin_p3 = document.getElementById("c_sin_p3");

    if (c_sin_off) c_sin_off.textContent = sinOff;
    if (c_sin_par) c_sin_par.textContent = sinPar;
    if (c_sin_vel) c_sin_vel.textContent = sinVel;
    if (c_sin_pqr) c_sin_pqr.textContent = sinPqr;
    if (c_sin_p3) c_sin_p3.textContent = sinP3;

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

// Manejo de eventos de clic en filtros
document.addEventListener("click", (e) => {
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
