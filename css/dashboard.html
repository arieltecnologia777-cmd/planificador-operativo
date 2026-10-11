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
        console.error("Error al cargar datos en el dashboard:", error);
    }
}

function renderizarDatosDashboard() {
    const idxDepto = encabezadosGlobal.findIndex(h => h.trim() === "Departamento");
    
    // Filtrar según el departamento seleccionado
    let datosFiltrados = datosGlobal;
    if (departamentoFiltroActual !== "TODOS") {
        datosFiltrados = datosGlobal.filter(fila => {
            const depto = String(fila[idxDepto] || "").trim().toUpperCase();
            return depto === departamentoFiltroActual;
        });
    }

    // Aquí puedes implementar el cálculo dinámico de tus contadores y asignarlos al DOM
    // Ejemplo de enlace con los elementos visuales:
    document.getElementById("valOnline").textContent = datosFiltrados.length > 0 ? "1343" : "0";
    document.getElementById("valOffline").textContent = datosFiltrados.length > 0 ? "79" : "0";
    document.getElementById("valParcial").textContent = datosFiltrados.length > 0 ? "6" : "0";
    
    // Puedes ampliar esta función con las fórmulas exactas que usas en tu script principal para las carpetas.
}

// Eventos de selección de departamento (botones y mapa)
document.addEventListener("click", (e) => {
    const btnDepto = e.target.closest(".btn-depto, .marcador-mapa");
    if (btnDepto) {
        const depto = btnDepto.getAttribute("data-depto");
        if (depto) {
            departamentoFiltroActual = depto;
            
            // Actualizar clases activas en los botones superiores
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
