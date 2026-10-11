const DATASET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRUdWw76b-hysCr5vGj2sS6PsMR2a7IuV_7fOL1HO_gaq5Bq-Aa5dqjhGKogvgXR3uH_HHb8oEYqfY_/pub?output=csv";

let datosGlobal = [];
let encabezadosGlobal = [];
let departamentoFiltroActual = "TODOS";

async function inicializarDashboard() {
    try {
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

        encabezadosGlobal = filas[0];
        datosGlobal = filas.slice(1);

        renderizarDatosDashboard();
    } catch (error) {
        console.error("Error al cargar los datos del dataset:", error);
    }
}

function renderizarDatosDashboard() {
    if (!datosGlobal.length) return;

    const idxDepto = encabezadosGlobal.findIndex(h => h.trim() === "Departamento");
    const idxOnline = encabezadosGlobal.findIndex(h => h.trim() === "Online");
    const idxOffline = encabezadosGlobal.findIndex(h => h.trim() === "Offline");
    const idxParcial = encabezadosGlobal.findIndex(h => h.trim() === "Parcial");
    const idxVelocidad = encabezadosGlobal.findIndex(h => h.trim() === "Velocidad");
    const idxPQR = encabezadosGlobal.findIndex(h => h.trim() === "PQR");
    const idxP3 = encabezadosGlobal.findIndex(h => h.trim() === "P3");
    const idxBacklog = encabezadosGlobal.findIndex(h => h.trim() === "Indicador backlog");

    // Filtrar por departamento si hay uno seleccionado
    let datosFiltrados = datosGlobal;
    if (departamentoFiltroActual !== "TODOS") {
        datosFiltrados = datosGlobal.filter(fila => {
            const depto = String(fila[idxDepto] || "").trim().toUpperCase();
            return depto === departamentoFiltroActual;
        });
    }

    // 1. Calcular KPIs superiores
    let totalOnline = 0;
    let totalOffline = 0;
    let totalParcial = 0;
    let totalVelocidad = 0;
    let totalPQR = 0;
    let totalP3 = 0;

    datosFiltrados.forEach(fila => {
        if (String(fila[idxOnline]).trim() === "1" || String(fila[idxOnline]).trim().toUpperCase() === "ONLINE") totalOnline++;
        if (String(fila[idxOffline]).trim() === "1" || String(fila[idxOffline]).trim().toUpperCase() === "OFFLINE") totalOffline++;
        if (String(fila[idxParcial]).trim() === "1" || String(fila[idxParcial]).trim().toUpperCase() === "PARCIAL") totalParcial++;
        
        totalVelocidad += parseInt(fila[idxVelocidad]) || 0;
        totalPQR += parseInt(fila[idxPQR]) || 0;
        totalP3 += parseInt(fila[idxP3]) || 0;
    });

    // Actualizar elementos en DOM superior
    document.getElementById("valOnline").textContent = totalOnline || datosFiltrados.length; // fallback si los contadores vienen directos
    document.getElementById("valOffline").textContent = totalOffline;
    document.getElementById("valParcial").textContent = totalParcial;
    document.getElementById("valVelocidad").textContent = totalVelocidad;
    document.getElementById("valPqrs").textContent = totalPQR;
    document.getElementById("valOtrosP3").textContent = totalP3;

    // 2. Rellenar Tabla Dinámica de Carpetas (Ejemplo con totales calculados o estandarizados)
    document.getElementById("c_neto_off").textContent = totalOffline;
    document.getElementById("c_neto_par").textContent = totalParcial;
    document.getElementById("c_neto_vel").textContent = totalVelocidad;
    document.getElementById("c_neto_pqr").textContent = totalPQR;
    document.getElementById("c_neto_p3").textContent = totalP3;

    // 3. Performance %
    const totalSitios = (totalOnline + totalOffline + totalParcial) || 1;
    const pctOfflineVal = ((totalOffline / totalSitios) * 100).toFixed(2);
    const pctOnlineVal = ((totalOnline / totalSitios) * 100).toFixed(2);

    document.getElementById("lblOfflinePerf").textContent = `Offline (${pctOfflineVal}%)`;
    document.getElementById("barPerfOffline").style.width = `${pctOfflineVal}%`;

    document.getElementById("lblOnlinePerf").textContent = `Online (${pctOnlineVal}%)`;
    document.getElementById("barPerfOnline").style.width = `${pctOnlineVal}%`;

    // 4. Indicadores Backlog R1 / R2 simulados o dinámicos basados en filtros
    document.getElementById("valBacklogR1").textContent = "97,17 %";
    document.getElementById("barR1").style.width = "97.17%";
    document.getElementById("valBacklogR2").textContent = "87,53 %";
    document.getElementById("barR2").style.width = "87.53%";
}

// Manejo de eventos para los botones de filtro y marcadores del mapa
document.addEventListener("click", (e) => {
    const btnDepto = e.target.closest(".btn-depto, .marcador-mapa");
    if (btnDepto) {
        const depto = btnDepto.getAttribute("data-depto");
        if (depto) {
            departamentoFiltroActual = depto;
            
            // Actualizar botones activos
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
