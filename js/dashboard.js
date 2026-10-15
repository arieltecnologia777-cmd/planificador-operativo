const API_BASE_URL = "https://planeacion-api.modulo-de-exclusiones.workers.dev/api";
const WORKER_DATA_URL = `${API_BASE_URL}/base-backlog`;
const WORKER_INDICADOR_URL = `${API_BASE_URL}/indicador-backlog`;

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

// Coordenadas con SAI y Antioquia subidos un poquito más
const PINES_ESTATICOS = [
    { depto: "ANTIOQUIA", nombre: "Antioquia", top: "43%", left: "46%", color: "#06b6d4" },
    { depto: "CESAR", nombre: "Cesar", top: "25%", left: "62%", color: "#f59e0b" },
    { depto: "LA GUAJIRA", nombre: "La Guajira", top: "8%", left: "75%", color: "#a855f7" },
    { depto: "SAI", nombre: "SAI", top: "4%", left: "17%", color: "#10b981" }
];

let datosGlobal = [];
let encabezadosGlobal = [];
let departamentoFiltroActual = "TODOS";
let proyectoFiltroActual = "MINTIC 7K";

async function inicializarDashboard() {
    try {
        renderizarPinesEstaticos("TODOS");
        cargarNotaDelDia();

        // Petición directa al Worker de Cloudflare D1 (/base-backlog)
        const resp = await fetch(WORKER_DATA_URL);
        const jsonRegistros = await resp.json();

        // Convertimos el objeto JSON devuelto por D1 en un arreglo de objetos directos
        const valoresArray = Object.values(jsonRegistros);
        if (!valoresArray.length) return;

        // Guardamos directamente los objetos en datosGlobal para mantener las llaves por nombre
        datosGlobal = valoresArray;

        renderizarDatosDashboard();
        cargarYCalcularBacklogUnificado();
    } catch (error) {
        console.error("Error al cargar los datos del Worker en el dashboard:", error);
    }
}
function renderizarPinesEstaticos(deptoSeleccionado) {
    const contenedor = document.getElementById("mapaLeaflet");
    if (!contenedor) return;

    const pinesPrevios = contenedor.querySelectorAll(".pin-estatico-neon");
    pinesPrevios.forEach(p => p.remove());

    PINES_ESTATICOS.forEach(pin => {
        const activo = (deptoSeleccionado === "TODOS" || deptoSeleccionado === pin.depto);
        const opacidad = activo ? "1" : "0.35";
        const escala = activo ? "scale(1.15)" : "scale(0.9)";
        const boxShadow = activo ? `0 0 16px ${pin.color}` : `0 0 4px rgba(0,0,0,0.5)`;

        const divPin = document.createElement("div");
        divPin.className = "pin-estatico-neon";
        divPin.style.cssText = `
            position: absolute;
            top: ${pin.top};
            left: ${pin.left};
            transform: translate(-50%, -50%) ${escala};
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(15, 23, 42, 0.9);
            border: 1.5px solid ${pin.color};
            padding: 5px 12px;
            border-radius: 20px;
            box-shadow: ${boxShadow};
            opacity: ${opacidad};
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 10;
            white-space: nowrap;
        `;

        divPin.innerHTML = `
            <div style="width: 10px; height: 10px; background: ${pin.color}; border-radius: 50%; box-shadow: 0 0 8px ${pin.color};"></div>
            <span style="color: #ffffff; font-weight: 700; font-size: 0.75rem; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${pin.nombre}</span>
        `;

        divPin.addEventListener("click", () => {
            departamentoFiltroActual = pin.depto;
            document.querySelectorAll(".btn-depto").forEach(b => {
                if (b.getAttribute("data-depto") === pin.depto) b.classList.add("active");
                else b.classList.remove("active");
            });
            renderizarDatosDashboard();
        });

        contenedor.appendChild(divPin);
    });
}

async function cargarNotaDelDia() {
    try {
        const resp = await fetch(`${API_BASE_URL}/notas`);
        const data = await resp.json();
        const txtNotas = document.getElementById("txtNotasDia");
        if (txtNotas && data.ok) {
            txtNotas.textContent = data.nota || "Sin notas registradas para hoy.";
        }
    } catch (err) {
        console.error("Error al cargar la nota:", err);
        const txtNotas = document.getElementById("txtNotasDia");
        if (txtNotas) txtNotas.textContent = "Error al sincronizar la nota del día.";
    }
}

function aplicarColorCumplimiento(elementoId, porcentaje) {
    const el = document.getElementById(elementoId);
    if (!el) return;

    el.className = "";
    el.style.backgroundColor = "transparent";

    let colorFondoStart = "#f87171";
    let colorFondoEnd = "#dc2626";
    if (porcentaje >= 100) {
        colorFondoStart = "#34d399";
        colorFondoEnd = "#059669";
    } else if (porcentaje >= 70) {
        colorFondoStart = "#fbbf24";
        colorFondoEnd = "#d97706";
    }

    const anchoBarra = Math.min(porcentaje / 2, 100);

    el.innerHTML = `
        <div style="position: relative; display: block; width: 100%; height: 24px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; overflow: hidden; text-align: center;">
            <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${anchoBarra}%; background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, ${colorFondoStart} 50%, ${colorFondoEnd} 100%); transition: width 0.3s ease;"></div>
            <div style="position: absolute; top: 0; left: 50%; height: 100%; width: 2px; background-color: #0f172a; z-index: 2; box-shadow: 0 0 3px rgba(0,0,0,0.4);"></div>
            <span style="position: relative; z-index: 3; font-weight: 800; font-size: 0.75rem; line-height: 24px; color: #0f172a; text-shadow: 0 1px 1px rgba(255,255,255,0.7);">${porcentaje.toFixed(0)} %</span>
        </div>
    `;
}

function renderizarDatosDashboard() {
    if (!datosGlobal || typeof datosGlobal !== "object") return;

    const filasArray = Array.isArray(datosGlobal) ? datosGlobal : Object.values(datosGlobal);
    if (!filasArray.length) return;

    renderizarPinesEstaticos(departamentoFiltroActual);

    const lblRegion = document.getElementById("lblRegionActiva");
    if (lblRegion) {
        lblRegion.textContent = departamentoFiltroActual;
    }

    let datosFiltrados = filasArray.filter(fila => {
        if (!fila) return false;
        const depto = String(fila["Departamento"] || fila["Depto"] || fila["DEPARTAMENTO"] || "").trim().toUpperCase();
        const proyecto = String(fila["Proyecto"] || fila["proyecto"] || fila["PROYECTO"] || "").trim().toUpperCase();

        const matchDepto = (departamentoFiltroActual === "TODOS" || depto === departamentoFiltroActual.toUpperCase());
        const matchProyecto = (proyectoFiltroActual === "TODOS" || proyecto.includes(proyectoFiltroActual.toUpperCase()));

        return matchDepto && matchProyecto;
    });

    let sumaOffline = 0, sumaParcial = 0, sumaVelocidad = 0, sumaPqrs = 0, sumaOtrosP3 = 0;
    let fmOff = 0, fmPar = 0, fmVel = 0, fmPqr = 0, fmP3 = 0;
    let repOff = 0, repPar = 0, repVel = 0, repPqr = 0, repP3 = 0;
    let reqOff = 0, reqPar = 0, reqVel = 0, reqPqr = 0, reqP3 = 0;

    let municipiosOfflineMap = {};

    let rangos = {
        r1: { off: 0, par: 0, vel: 0, pqr: 0, p3: 0 },
        r2: { off: 0, par: 0, vel: 0, pqr: 0, p3: 0 },
        r3: { off: 0, par: 0, vel: 0, pqr: 0, p3: 0 },
        r4: { off: 0, par: 0, vel: 0, pqr: 0, p3: 0 },
        r5: { off: 0, par: 0, vel: 0, pqr: 0, p3: 0 },
        r6: { off: 0, par: 0, vel: 0, pqr: 0, p3: 0 }
    };
datosFiltrados.forEach(fila => {
        // Extraemos el estado real de forma robusta
        const estado = String(
            fila["Estado real"] || 
            fila["estadoReal"] || 
            fila["Estado"] || 
            ""
        ).trim().toUpperCase();

        const municipio = String(fila["Municipio"] || fila["Ciudad"] || "SIN MUNICIPIO").trim();
        const clasificacionU = String(fila["Stopper P3 (FM/traslado/reubicaciones)"] || fila["Stoppers Dominion"] || "").trim().toUpperCase();
        
        // Stopper de repuestos específico para P3 y PQR
        const stopperRepuestosAC = String(fila["Stopper P3 (repuestos)"] || fila["Stopper Claro"] || "").trim().toUpperCase();
        
        // Columna U (Tipo de stopper) exclusiva para el análisis de repuestos en Offline, Parcial y Velocidad
        const tipoStopperColU = String(fila["Tipo de stopper"] || "").trim().toUpperCase();

        const rangoK = String(fila["Rango de afectación Claro"] || fila["Rango de afectación"] || "").trim().toUpperCase();
        
        // Extracción estricta y segura de la columna de IDs afectados
        const idsAfectados = parseInt(fila["Total IDs afectados"], 10) || 1;

        // Conteo general exacto basado en el Estado real
        if (estado.includes("OFFLINE") || estado.includes("APAGADO")) {
            sumaOffline += idsAfectados;
            if (!municipiosOfflineMap[municipio]) {
                municipiosOfflineMap[municipio] = 0;
            }
            municipiosOfflineMap[municipio] += idsAfectados;
        }
        else if (estado.includes("PARCIAL")) {
            sumaParcial += idsAfectados;
        }
        else if (estado.includes("VELOCIDAD") || estado.includes("LENTO")) {
            sumaVelocidad += idsAfectados;
        }
        else if (estado.includes("PQR") || estado.includes("QUEJA")) {
            sumaPqrs += idsAfectados;
        }
        else if (estado.includes("P3") || estado.includes("OTROS") || estado.includes("OTRO")) {
            sumaOtrosP3 += idsAfectados;
        }

        // Clasificación por carpetas (FM, etc.)
        if (clasificacionU.includes("FM") || clasificacionU.includes("TRASLADO") || clasificacionU.includes("REUBICACION") || clasificacionU.includes("FUERZA MAYOR")) {
            if (estado.includes("OFFLINE")) fmOff += idsAfectados;
            else if (estado.includes("PARCIAL")) fmPar += idsAfectados;
            else if (estado.includes("VELOCIDAD")) fmVel += idsAfectados;
            else if (estado.includes("PQR")) fmPqr += idsAfectados;
            else if (estado.includes("P3") || estado.includes("OTROS")) fmP3 += idsAfectados;
        }

        // Código de Rollback (versión anterior con validación amplia)
        const esRepuestosEstadoPrincipal = tipoStopperColU.includes("REPUESTO") || tipoStopperColU.includes("P3") || tipoStopperColU.includes("REP");
        
        if (esRepuestosEstadoPrincipal) {
            if (estado.includes("OFFLINE")) repOff += idsAfectados;
            else if (estado.includes("PARCIAL")) repPar += idsAfectados;
            else if (estado.includes("VELOCIDAD")) repVel += idsAfectados;
        }

        // - Para P3 y PQR: mantiene la lógica de repuestos original
        const esValidoRepuestoP3 = stopperRepuestosAC.includes("REPUESTO") || stopperRepuestosAC.includes("P3");
        if (esValidoRepuestoP3) {
            if (estado.includes("PQR")) repPqr += idsAfectados;
            else if (estado.includes("P3") || estado.includes("OTROS")) repP3 += idsAfectados;
        }

        // Rangos de afectación por días
        let targetRango = null;
        if (rangoK.includes("MENOR A 5") || rangoK.includes("< 5") || rangoK.includes("1. MENOR")) targetRango = rangos.r1;
        else if (rangoK.includes("5 A 15") || rangoK.includes("5-15") || rangoK.includes("2. DE 5")) targetRango = rangos.r2;
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
  
    let topMunicipiosArray = Object.entries(municipiosOfflineMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);

    const contenedorTopMun = document.getElementById("listaTopMunicipios");
    if (contenedorTopMun) {
        if (topMunicipiosArray.length === 0) {
            contenedorTopMun.innerHTML = `<div style="font-size: 0.75rem; color: #10b981; text-align: center; padding: 4px; font-weight: 600;">✨ ¡Sin municipios offline!</div>`;
        } else {
            contenedorTopMun.innerHTML = topMunicipiosArray.map(([mun, count], index) => `
                <div class="item-municipio-top" style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem;">
                    <span class="mun-nombre" title="${mun}" style="color: #334155; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">⚠️ ${index + 1}. ${mun}</span>
                    <span class="mun-badge" style="background: #fee2e2; color: #dc2626; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; border: 1px solid #fca5a5;">${count} off</span>
                </div>
            `).join('');
        }
    }

    const sinOff = Math.max(0, sumaOffline - fmOff);
    const sinPar = Math.max(0, sumaParcial - fmPar);
    const sinVel = Math.max(0, sumaVelocidad - fmVel);
    const sinPqr = Math.max(0, sumaPqrs - fmPqr - repPqr);
    const sinP3  = Math.max(0, sumaOtrosP3 - fmP3 - repP3);
    
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
    const barOff = document.getElementById("barPerfOffline");
    if (barOff) {
        barOff.style.width = `${pctOfflineVal}%`;
        barOff.style.height = "12px";
        barOff.style.background = "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, #f87171 50%, #dc2626 100%)";
        barOff.style.borderRadius = "6px";
        barOff.style.boxShadow = "0 2px 4px rgba(220,38,38,0.2)";
    }

    if (document.getElementById("lblOnlinePerf")) document.getElementById("lblOnlinePerf").textContent = `Online (${pctOnlineVal}%)`;
    const barOn = document.getElementById("barPerfOnline");
    if (barOn) {
        barOn.style.width = `${pctOnlineVal}%`;
        barOn.style.height = "12px";
        barOn.style.background = "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, #34d399 50%, #059669 100%)";
        barOn.style.borderRadius = "6px";
        barOn.style.boxShadow = "0 2px 4px rgba(5,150,105,0.2)";
    }
}
document.addEventListener("click", async (e) => {
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

    const btnAbrirConfig = e.target.closest("#btnAbrirConfig");
    if (btnAbrirConfig) {
        const modalPass = document.getElementById("modalAdminPassword");
        const inputPass = document.getElementById("inputAdminPassword");
        if (inputPass) inputPass.value = "";
        if (modalPass) modalPass.style.display = "flex";
        if (inputPass) inputPass.focus();
    }

    if (e.target.closest("#cerrarModalPassword") || e.target.closest("#btnCancelarPassword")) {
        const modalPass = document.getElementById("modalAdminPassword");
        if (modalPass) modalPass.style.display = "none";
    }

    if (e.target.closest("#cerrarModalTools") || e.target.closest("#btnCerrarTools")) {
        const modalTools = document.getElementById("modalAdminTools");
        if (modalTools) modalTools.style.display = "none";
    }

    const btnVerificar = e.target.closest("#btnVerificarPassword");
    if (btnVerificar) {
        const inputPass = document.getElementById("inputAdminPassword");
        const password = inputPass ? inputPass.value.trim() : "";

        if (!password) {
            alert("Por favor, ingresa la contraseña.");
            return;
        }

        try {
            const resp = await fetch(`${API_BASE_URL}/planeacion/verificar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: password })
            });
            const data = await resp.json();

            if (resp.ok && data.ok === true) {
                const modalPass = document.getElementById("modalAdminPassword");
                const modalTools = document.getElementById("modalAdminTools");
                if (modalPass) modalPass.style.display = "none";
                if (modalTools) modalTools.style.display = "flex";

                const txtNotasDia = document.getElementById("txtNotasDia");
                const txtModalNotaDia = document.getElementById("txtModalNotaDia");
                if (txtModalNotaDia && txtNotasDia) {
                    txtModalNotaDia.value = txtNotasDia.value;
                }
            } else {
                alert("Contraseña incorrecta.");
            }
        } catch (err) {
            console.error("Error al verificar contraseña:", err);
            alert("Error de red al verificar la contraseña con el servidor.");
        }
    }
    const btnGuardarNota = e.target.closest("#btnGuardarNotaServidor");
    if (btnGuardarNota) {
        const txtModalNotaDia = document.getElementById("txtModalNotaDia");
        const nuevaNota = txtModalNotaDia ? txtModalNotaDia.value.trim() : "";

        try {
            const resp = await fetch(`${API_BASE_URL}/notas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nota: nuevaNota })
            });
            const data = await resp.json();

            if (data.ok === true) {
                alert("¡Nota guardada y sincronizada con éxito!");
                const modalTools = document.getElementById("modalAdminTools");
                if (modalTools) modalTools.style.display = "none";
                cargarNotaDelDia();
            } else {
                alert("Error al guardar la nota en el servidor.");
            }
        } catch (err) {
            console.error("Error al guardar la nota:", err);
            alert("Error de red al intentar guardar la nota.");
        }
    }
});

document.addEventListener("DOMContentLoaded", inicializarDashboard);

async function cargarYCalcularBacklogUnificado() {
    const BACKLOG_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSvQf6zIgwVnOQ72fcweEEMdRKylGsKFe30Mpea50qWIbr-m6ELzpxaUV2fnFRwH7TX1AMIabPbOqoJ/pub?output=csv&gid=290150389";

    try {
        const response = await fetch(BACKLOG_CSV_URL);
        const dataText = await response.text();
        
        const workbook = XLSX.read(dataText, { type: 'string' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const filasBacklog = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!filasBacklog || filasBacklog.length < 2) return;

        let r1Total = 0, r1Unos = 0;
        let r2Total = 0, r2Unos = 0;

        const filasDatos = filasBacklog.slice(1);

        filasDatos.forEach(fila => {
            const regional = String(fila[8] || "").trim().toUpperCase(); 
            const valorBacklog = parseInt(fila[19], 10); 

            if (!isNaN(valorBacklog)) {
                if (regional === "R1") {
                    r1Total++;
                    if (valorBacklog === 1) r1Unos++; 
                } else if (regional === "R2") {
                    r2Total++;
                    if (valorBacklog === 1) r2Unos++; 
                }
            }
        });

        const porcR1 = r1Total > 0 ? (r1Unos / r1Total) * 100 : 0;
        const porcR2 = r2Total > 0 ? (r2Unos / r2Total) * 100 : 0;
        const meta = 93.00;

        const cumplimientoR1 = meta > 0 ? (porcR1 / meta) * 100 : 0;
        const cumplimientoR2 = meta > 0 ? (porcR2 / meta) * 100 : 0;

        const elR1 = document.getElementById("valBacklogR1");
        const elR2 = document.getElementById("valBacklogR2");
        if (elR1) elR1.textContent = porcR1.toFixed(2).replace('.', ',') + " %";
        if (elR2) elR2.textContent = porcR2.toFixed(2).replace('.', ',') + " %";

        const badgeR1 = document.getElementById("badgeR1");
        const badgeR2 = document.getElementById("badgeR2");

        if (badgeR1) {
            badgeR1.textContent = cumplimientoR1.toFixed(2).replace('.', ',') + "%";
            badgeR1.className = "badge-cumplimiento " + (cumplimientoR1 >= 100 ? "green" : "red");
        }

        if (badgeR2) {
            badgeR2.textContent = cumplimientoR2.toFixed(2).replace('.', ',') + "%";
            badgeR2.className = "badge-cumplimiento " + (cumplimientoR2 >= 100 ? "green" : "red");
        }

    } catch (error) {
        console.error("Error al calcular el Backlog desde la pestaña unificada:", error);
    }
}
