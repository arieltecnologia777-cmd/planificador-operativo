const DATASET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSvQf6zIgwVnOQ72fcweEEMdRKylGsKFe30Mpea50qWIbr-m6ELzpxaUV2fnFRwH7TX1AMIabPbOqoJ/pub?output=csv";

// Matriz de sitios totales fijos según la tabla de distribución
const TOTALES_MAPA = {
    "TODOS": { "TODOS": 1460, "MINTIC 7K": 1443, "ODH 5G": 17 },
    "ANTIOQUIA": { "TODOS": 396, "MINTIC 7K": 379, "ODH 5G": 17 },
    "CESAR": { "TODOS": 554, "MINTIC 7K": 554, "ODH 5G": 0 },
    "LA GUAJIRA": { "TODOS": 489, "MINTIC 7K": 489, "ODH 5G": 0 },
    "SAI": { "TODOS": 21, "MINTIC 7K": 21, "ODH 5G": 0 }
};

// Metas fijas actualizadas por Departamento
const METAS_DEPARTAMENTO = {
    "ANTIOQUIA": { offline: 9, parcial: 2, velocidad: 3, pqr: 0, p3: 9 },
    "CESAR": { offline: 13, parcial: 3, velocidad: 4, pqr: 1, p3: 14 },
    "LA GUAJIRA": { offline: 14, parcial: 2, velocidad: 3, pqr: 0, p3: 12 },
    "SAI": { offline: 1, parcial: 0, velocidad: 0, pqr: 0, p3: 0 },
    "TODOS": { offline: 37, parcial: 7, velocidad: 10, pqr: 1, p3: 35 }
};

// Coordenadas geográficas y zoom por departamento para el mapa real
const COORDENADAS_DEPTOS = {
    "TODOS": { lat: 8.5, lng: -74.0, zoom: 6 },      // Vista general norte de Colombia
    "ANTIOQUIA": { lat: 7.25, lng: -75.58, zoom: 7 }, // Antioquia
    "CESAR": { lat: 9.89, lng: -73.58, zoom: 8 },     // Cesar
    "LA GUAJIRA": { lat: 11.54, lng: -72.9, zoom: 8 },// Guajira
    "SAI": { lat: 12.58, lng: -81.71, zoom: 11 }      // San Andrés y Providencia
};

let datosGlobal = [];
let encabezadosGlobal = [];
let departamentoFiltroActual = "TODOS";
let proyectoFiltroActual = "MINTIC 7K";
let mapaLeaflet = null; // Instancia global del mapa

async function inicializarDashboard() {
    try {
        inicializarMapaLeaflet();
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

// Inicializar el mapa interactivo real
function inicializarMapaLeaflet() {
    const contenedor = document.getElementById("mapaLeaflet");
    if (!contenedor || mapaLeaflet) return;

    // Crear mapa centrado por defecto en Colombia
    mapaLeaflet = L.map("mapaLeaflet", {
        zoomControl: true,
        attributionControl: false
    }).setView([8.5, -74.0], 6);

    // Añadir capa base limpia estilo minimalista de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(mapaLeaflet);
}

// Mover y hacer zoom en el mapa según el departamento seleccionado
function actualizarMapaInteractivo(depto) {
    if (!mapaLeaflet) return;

    const configCoord = COORDENADAS_DEPTOS[depto] || COORDENADAS_DEPTOS["TODOS"];
    mapaLeaflet.setView([configCoord.lat, configCoord.lng], configCoord.zoom);

    // Forzar redibujado para evitar problemas de renderizado al cambiar pestañas/filtros
    setTimeout(() => {
        mapaLeaflet.invalidateSize();
    }, 200);
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

function aplicarColorCumplimiento(elementoId, porcentaje) {
    const el = document.getElementById(elementoId);
    if (!el) return;

    el.className = "";
    el.style.backgroundColor = "transparent";

    let colorFondo = "#dc3545"; // Rojo (<70%)
    if (porcentaje >= 100) {
        colorFondo = "#28a745"; // Verde (>=100%)
    } else if (porcentaje >= 70) {
        colorFondo = "#ffc107"; // Amarillo (70% - 99%)
    }

    const anchoBarra = Math.min(porcentaje / 2, 100);

    el.innerHTML = `
        <div style="position: relative; display: block; width: 100%; height: 26px; background: #fff; border: 1px solid #cbd5e0; border-radius: 2px; overflow: hidden; text-align: center;">
            <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${anchoBarra}%; background-color: ${colorFondo}; opacity: 0.85; transition: width 0.3s ease;"></div>
            <div style="position: absolute; top: 0; left: 50%; height: 100%; width: 2px; background-color: #000; z-index: 2;"></div>
            <span style="position: relative; z-index: 3; font-weight: bold; font-size: 0.8rem; line-height: 26px; color: #000;">${porcentaje.toFixed(0)} %</span>
        </div>
    `;
}

function renderizarDatosDashboard() {
    if (!datosGlobal.length) return;

    // Actualizar el enfoque del mapa interactivo real
    actualizarMapaInteractivo(departamentoFiltroActual);

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
    const colStopperRepuestos = 28; 
    const colStopperFM = 29;        
    const colRangoK = 10;           

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

    let rangos = {
        r1: { off: 0, par: 0, vel: 0, pqr: 0, p3: 0 },
        r2: { off: 0, par: 0, vel: 0, pqr: 0, p3: 0 },
        r3: { off: 0, par: 0, vel: 0, pqr: 0, p3: 0 },
        r4: { off: 0, par: 0, vel: 0, pqr: 0, p3: 0 },
        r5: { off: 0, par: 0, vel: 0, pqr: 0, p3: 0 },
        r6: { off: 0, par: 0, vel: 0, pqr: 0, p3: 0 }
    };

    datosFiltrados.forEach(fila => {
        const estado = String(fila[colEstado] || "").trim().toUpperCase();
        const clasificacionU = String(fila[colCarpetaU] || "").trim().toUpperCase();
        const stopper = String(fila[colStopper] || "").trim().toUpperCase();
        const stopperRep = String(fila[colStopperRepuestos] || "").trim().toUpperCase();
        const stopperFM = String(fila[colStopperFM] || "").trim().toUpperCase();
        const rangoK = String(fila[colRangoK] || "").trim().toUpperCase();
        const idsAfectados = parseInt(fila[colIds], 10) || 0;

        if (estado.includes("OFFLINE")) sumaOffline += idsAfectados;
        else if (estado.includes("PARCIAL")) sumaParcial += idsAfectados;
        else if (estado.includes("VELOCIDAD")) sumaVelocidad += idsAfectados;
        else if (estado.includes("PQR")) sumaPqrs += idsAfectados;
        else if (estado.includes("P3") || estado.includes("OTROS")) sumaOtrosP3 += idsAfectados;

        if (clasificacionU.includes("FM") || clasificacionU.includes("TRASLADO") || clasificacionU.includes("REUBICACION")) {
            if (estado.includes("OFFLINE")) fmOff += idsAfectados;
            else if (estado.includes("PARCIAL")) fmPar += idsAfectados;
            else if (estado.includes("VELOCIDAD")) fmVel += idsAfectados;
            else if (estado.includes("PQR")) fmPqr += idsAfectados;
            else if (estado.includes("P3") || estado.includes("OTROS")) fmP3 += idsAfectados;
        }

        const esFM_P3 = stopperFM.includes("SI") || stopperFM.includes("FM") || stopperFM.includes("TRASLADO");
        const esRepuestoP3 = stopperRep.includes("REPUESTO") || stopperRep.includes("REPUESTOS");

        if (esRepuestoP3 && !esFM_P3) {
            if (estado.includes("OFFLINE")) repOff += idsAfectados;
            else if (estado.includes("PARCIAL")) repPar += idsAfectados;
            else if (estado.includes("VELOCIDAD")) repVel += idsAfectados;
            else if (estado.includes("PQR")) repPqr += idsAfectados;
            else if (estado.includes("P3") || estado.includes("OTROS")) repP3 += idsAfectados;
        }

        if (stopper.includes("REQUIERE") || stopper.includes("ATENCION S.O") || stopper.includes("ATENCIÓN S.O")) {
            if (estado.includes("OFFLINE")) reqOff += idsAfectados;
            else if (estado.includes("PARCIAL")) reqPar += idsAfectados;
            else if (estado.includes("VELOCIDAD")) reqVel += idsAfectados;
            else if (estado.includes("PQR")) reqPqr += idsAfectados;
            else if (estado.includes("P3") || estado.includes("OTROS")) reqP3 += idsAfectados;
        }

        let targetRango = null;
        if (rangoK.includes("MENOR A 5") || rangoK.includes("< 5")) targetRango = rangos.r1;
        else if (rangoK.includes("5 A 15") || rangoK.includes("5-15")) targetRango = rangos.r2;
        else if (rangoK.includes("15 A 30") || rangoK.includes("15-30")) targetRango = rangos.r3;
        else if (rangoK.includes("30 A 45") || rangoK.includes("30-45")) targetRango = rangos.r4;
        else if (rangoK.includes("45 A 60") || rangoK.includes("45-60")) targetRango = rangos.r5;
        else if (rangoK.includes("MAYOR A 60") || rangoK.includes("> 60")) targetRango = rangos.r6;

        if (targetRango) {
            if (estado.includes("OFFLINE")) targetRango.off += idsAfectados;
            else if (estado.includes("PARCIAL")) targetRango.par += idsAfectados;
            else if (estado.includes("VELOCIDAD")) targetRango.vel += idsAfectados;
            else if (estado.includes("PQR")) targetRango.pqr += idsAfectados;
            else if (estado.includes("P3") || estado.includes("OTROS")) targetRango.p3 += idsAfectados;
        }
    });

    const sinOff = Math.max(0, sumaOffline - (fmOff + repOff + reqOff));
    const sinPar = Math.max(0, sumaParcial - (fmPar + repPar + reqPar));
    const sinVel = Math.max(0, sumaVelocidad - (fmVel + repVel + reqVel));
    const sinPqr = Math.max(0, sumaPqrs - (fmPqr + repPqr + reqPqr));
    const sinP3  = Math.max(0, sumaOtrosP3 - (fmP3 + repP3 + reqP3));

    const deptoKey = departamentoFiltroActual.toUpperCase();
    const metasActivas = METAS_DEPARTAMENTO[deptoKey] || METAS_DEPARTAMENTO["TODOS"];

    const metaOff = metasActivas.offline;
    const metaPar = metasActivas.parcial;
    const metaVel = metasActivas.velocidad;
    const metaPqr = metasActivas.pqr;
    const metaP3  = metasActivas.p3;

    if (document.getElementById("c_meta_off")) document.getElementById("c_meta_off").textContent = metaOff;
    if (document.getElementById("c_meta_par")) document.getElementById("c_meta_par").textContent = metaPar;
    if (document.getElementById("c_meta_vel")) document.getElementById("c_meta_vel").textContent = metaVel;
    if (document.getElementById("c_meta_pqr")) document.getElementById("c_meta_pqr").textContent = metaPqr;
    if (document.getElementById("c_meta_p3"))  document.getElementById("c_meta_p3").textContent  = metaP3;

    const pctOffVal = sinOff > 0 ? (metaOff / sinOff) * 100 : 100;
    const pctParVal = sinPar > 0 ? (metaPar / sinPar) * 100 : 100;
    const pctVelVal = sinVel > 0 ? (metaVel / sinVel) * 100 : 100;
    const pctPqrVal = sinPqr > 0 ? (metaPqr / sinPqr) * 100 : 100;
    const pctP3Val  = sinP3 > 0  ? (metaP3 / sinP3) * 100  : 100;

    aplicarColorCumplimiento("pct_off", pctOffVal);
    aplicarColorCumplimiento("pct_par", pctParVal);
    aplicarColorCumplimiento("pct_vel", pctVelVal);
    aplicarColorCumplimiento("pct_pqr", pctPqrVal);
    aplicarColorCumplimiento("pct_p3",  pctP3Val);

    const totalSitiosFijo = (TOTALES_MAPA[departamentoFiltroActual] && TOTALES_MAPA[departamentoFiltroActual][proyectoFiltroActual] !== undefined)
        ? TOTALES_MAPA[departamentoFiltroActual][proyectoFiltroActual]
        : 1460;

    const elTotalCd = document.querySelector(".val-total-cd");
    if (elTotalCd) elTotalCd.textContent = totalSitiosFijo;

    const totalOnline = Math.max(0, totalSitiosFijo - sumaOffline);

    if (document.getElementById("valOnline")) document.getElementById("valOnline").textContent = totalOnline;
    if (document.getElementById("valOffline")) document.getElementById("valOffline").textContent = sumaOffline;
    if (document.getElementById("valParcial")) document.getElementById("valParcial").textContent = sumaParcial;
    if (document.getElementById("valVelocidad")) document.getElementById("valVelocidad").textContent = sumaVelocidad;
    if (document.getElementById("valPqrs")) document.getElementById("valPqrs").textContent = sumaPqrs;
    if (document.getElementById("valOtrosP3")) document.getElementById("valOtrosP3").textContent = sumaOtrosP3;

    if (document.getElementById("c_neto_off")) document.getElementById("c_neto_off").textContent = sumaOffline;
    if (document.getElementById("c_neto_par")) document.getElementById("c_neto_par").textContent = sumaParcial;
    if (document.getElementById("c_neto_vel")) document.getElementById("c_neto_vel").textContent = sumaVelocidad;
    if (document.getElementById("c_neto_pqr")) document.getElementById("c_neto_pqr").textContent = sumaPqrs;
    if (document.getElementById("c_neto_p3"))  document.getElementById("c_neto_p3").textContent  = sumaOtrosP3;

    if (document.getElementById("c_fm_off")) document.getElementById("c_fm_off").textContent = fmOff;
    if (document.getElementById("c_fm_par")) document.getElementById("c_fm_par").textContent = fmPar;
    if (document.getElementById("c_fm_vel")) document.getElementById("c_fm_vel").textContent = fmVel;
    if (document.getElementById("c_fm_pqr")) document.getElementById("c_fm_pqr").textContent = fmPqr;
    if (document.getElementById("c_fm_p3"))  document.getElementById("c_fm_p3").textContent  = fmP3;

    if (document.getElementById("c_rep_off")) document.getElementById("c_rep_off").textContent = repOff;
    if (document.getElementById("c_rep_par")) document.getElementById("c_rep_par").textContent = repPar;
    if (document.getElementById("c_rep_vel")) document.getElementById("c_rep_vel").textContent = repVel;
    if (document.getElementById("c_rep_pqr")) document.getElementById("c_rep_pqr").textContent = repPqr;
    if (document.getElementById("c_rep_p3"))  document.getElementById("c_rep_p3").textContent  = repP3;

    if (document.getElementById("c_req_off")) document.getElementById("c_req_off").textContent = reqOff;
    if (document.getElementById("c_req_par")) document.getElementById("c_req_par").textContent = reqPar;
    if (document.getElementById("c_req_vel")) document.getElementById("c_req_vel").textContent = reqVel;
    if (document.getElementById("c_req_pqr")) document.getElementById("c_req_pqr").textContent = reqPqr;
    if (document.getElementById("c_req_p3"))  document.getElementById("c_req_p3").textContent  = reqP3;

    if (document.getElementById("c_sin_off")) document.getElementById("c_sin_off").textContent = sinOff;
    if (document.getElementById("c_sin_par")) document.getElementById("c_sin_par").textContent = sinPar;
    if (document.getElementById("c_sin_vel")) document.getElementById("c_sin_vel").textContent = sinVel;
    if (document.getElementById("c_sin_pqr")) document.getElementById("c_sin_pqr").textContent = sinPqr;
    if (document.getElementById("c_sin_p3"))  document.getElementById("c_sin_p3").textContent  = sinP3;

    const pintarFilaRangos = (prefijo, obj) => {
        const elOff = document.getElementById(`${prefijo}_off`);
        const elPar = document.getElementById(`${prefijo}_par`);
        const elVel = document.getElementById(`${prefijo}_vel`);
        const elPqr = document.getElementById(`${prefijo}_pqr`);
        const elP3  = document.getElementById(`${prefijo}_p3`);

        if (elOff) elOff.textContent = obj.off;
        if (elPar) elPar.textContent = obj.par;
        if (elVel) elVel.textContent = obj.vel;
        if (elPqr) elPqr.textContent = obj.pqr;
        if (elP3)  elP3.textContent  = obj.p3;
    };

    pintarFilaRangos("r1", rangos.r1);
    pintarFilaRangos("r2", rangos.r2);
    pintarFilaRangos("r3", rangos.r3);
    pintarFilaRangos("r4", rangos.r4);
    pintarFilaRangos("r5", rangos.r5);
    pintarFilaRangos("r6", rangos.r6);

    const divisorPerf = totalSitiosFijo || 1;
    const pctOfflineVal = ((sumaOffline / divisorPerf) * 100).toFixed(2);
    const pctOnlineVal = ((totalOnline / divisorPerf) * 100).toFixed(2);

    if (document.getElementById("lblOfflinePerf")) document.getElementById("lblOfflinePerf").textContent = `Offline (${pctOfflineVal}%)`;
    if (document.getElementById("barPerfOffline")) document.getElementById("barPerfOffline").style.width = `${pctOfflineVal}%`;

    if (document.getElementById("lblOnlinePerf")) document.getElementById("lblOnlinePerf").textContent = `Online (${pctOnlineVal}%)`;
    if (document.getElementById("barPerfOnline")) document.getElementById("barPerfOnline").style.width = `${pctOnlineVal}%`;
}

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
