const WORKER_URL = 'https://kpis.modulo-de-exclusiones.workers.dev/api/kpis';

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Control del Sidebar
    document.addEventListener("click", (e) => {
        const btnToggle = e.target.closest("#btnToggleSidebar");
        if (btnToggle) {
            document.body.classList.toggle("sidebar-colapsado");
        }

        // 2. Botón en el sidebar para cargar KPIs protegido con Clave Admin
        const btnCargar = e.target.closest("#btnCargarKPIsSidebar");
        if (btnCargar) {
            dispararCargueConClaveAdmin();
        }
    });

    // Cargar y pintar al abrir la página
    await cargarYRenderizarKPIs();
});

// --- CLAVE ADMIN (Estándar de tus otros proyectos) ---
function dispararCargueConClaveAdmin() {
    const claveIngresada = prompt("Ingrese la clave de administrador para actualizar los KPIs:");
    if (!claveIngresada) return;

    // Aquí validamos con la clave de settings (puedes ajustar el valor según tu config global o variable)
    const CLAVE_ADMIN_SISTEMA = "admin123"; // Reemplaza o conecta con tu módulo de settings si es dinámico

    if (claveIngresada !== CLAVE_ADMIN_SISTEMA) {
        alert("Clave de administrador incorrecta.");
        return;
    }

    // Si es correcta, disparamos el selector de archivos oculto
    let inputOculto = document.getElementById("inputExcelOculto");
    if (!inputOculto) {
        inputOculto = document.createElement("input");
        inputOculto.type = "file";
        inputOculto.id = "inputExcelOculto";
        inputOculto.accept = ".xlsx, .xls";
        inputOculto.style.display = "none";
        inputOculto.addEventListener("change", manejarCargueExcel);
        document.body.appendChild(inputOculto);
    }
    inputOculto.click();
}

// --- PROCESAR EXCEL Y ENVIAR AL WORKER (PUT) ---
async function manejarCargueExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            for (let row of rows) {
                const payload = {
                    zona: row["Zona"] || row["zona"],
                    ejec_operatividad: Number(row["Operatividad"] || 0),
                    meta_operatividad: Number(row["Meta Operatividad"] || 1),
                    peso_operatividad: Number(row["Peso operatividad"] || row["Peso operativo"] || 0),
                    
                    ejec_sla: Number(row["SLA"] || 0),
                    meta_sla: Number(row["Meta SLA"] || 1),
                    peso_sla: Number(row["Peso SLA"] || 0),
                    
                    ejec_backlog: Number(row["Backlog"] || 0),
                    meta_backlog: Number(row["Meta backlog"] || 1),
                    peso_backlog: Number(row["Peso backlog"] || 0),
                    
                    ejec_mpr: Number(row["MPR"] || 0),
                    meta_mpr: Number(row["Meta MPR"] || 1),
                    peso_mpr: Number(row["Peso MPR"] || 0)
                };

                await fetch(WORKER_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            alert("¡KPIs actualizados y guardados en D1 con éxito!");
            await cargarYRenderizarKPIs();

        } catch (err) {
            console.error("Error al procesar el Excel:", err);
            alert("Hubo un error al leer o subir el archivo Excel.");
        }
    };
    reader.readAsArrayBuffer(file);
}

// --- CARGAR DESDE D1, CALCULAR Y PINTAR EN HTML ---
async function cargarYRenderizarKPIs() {
    try {
        const response = await fetch(WORKER_URL);
        const resultado = await response.json();

        if (!resultado.ok) return;

        const data = resultado.data;
        if (data.R1) calcularYPintarFilaTabla('R1', data.R1);
        if (data.R2) calcularYPintarFilaTabla('R2', data.R2);

    } catch (error) {
        console.error("Error al cargar datos desde el Worker:", error);
    }
}

// Motor matemático idéntico a tu Excel y renderizado en la tabla HTML
function calcularYPintarFilaTabla(zona, d) {
    // 1. Cálculos de cumplimiento (Ejecutado / Meta)
    const cumpOper = d.meta_operatividad > 0 ? d.ejec_operatividad / d.meta_operatividad : 0;
    const cumpSla = d.meta_sla > 0 ? d.ejec_sla / d.meta_sla : 0;
    const cumpBacklog = d.meta_backlog > 0 ? d.ejec_backlog / d.meta_backlog : 0;
    const cumpMpr = d.meta_mpr > 0 ? d.ejec_mpr / d.meta_mpr : 0;

    // 2. Pesos ponderados generados (Cumplimiento acotado a 1.0 * Peso asignado)
    const pesoGenOper = Math.min(cumpOper, 1.0) * d.peso_operatividad;
    const pesoGenSla = Math.min(cumpSla, 1.0) * d.peso_sla;
    const pesoGenBacklog = Math.min(cumpBacklog, 1.0) * d.peso_backlog;
    const pesoGenMpr = Math.min(cumpMpr, 1.0) * d.peso_mpr;

    // 3. Cumplimiento general de la zona
    const cumplimientoGeneral = pesoGenOper + pesoGenSla + pesoGenBacklog + pesoGenMpr;

    // Formateadores visuales a porcentaje
    const fmtPct = (val) => (val * 100).toFixed(2).replace('.', ',') + ' %';
    const fmtNum = (val) => Number(val).toFixed(4).replace('.', ',');

    // --- INYECCIÓN EN EL HTML ---
    // Asegúrate de que tu tabla tenga IDs organizados por zona (ej: id="r1-operatividad", id="r1-cump-general", etc.)
    const z = zona.toLowerCase();
    
    asignarTexto(`${z}-operatividad`, fmtPct(d.ejec_operatividad));
    asignarTexto(`${z}-meta-operatividad`, fmtPct(d.meta_operatividad));
    asignarTexto(`${z}-cump-operatividad`, fmtPct(cumpOper));
    asignarTexto(`${z}-peso-operatividad`, fmtNum(d.peso_operatividad));

    asignarTexto(`${z}-sla`, fmtPct(d.ejec_sla));
    asignarTexto(`${z}-meta-sla`, fmtPct(d.meta_sla));
    asignarTexto(`${z}-cump-sla`, fmtPct(cumpSla));
    asignarTexto(`${z}-peso-sla`, fmtNum(d.peso_sla));

    asignarTexto(`${z}-backlog`, fmtPct(d.ejec_backlog));
    asignarTexto(`${z}-meta-backlog`, fmtPct(d.meta_backlog));
    asignarTexto(`${z}-cump-backlog`, fmtPct(cumpBacklog));
    asignarTexto(`${z}-peso-backlog`, fmtNum(d.peso_backlog));

    asignarTexto(`${z}-mpr`, fmtPct(d.ejec_mpr));
    asignarTexto(`${z}-meta-mpr`, fmtPct(d.meta_mpr));
    asignarTexto(`${z}-cump-mpr`, fmtPct(cumpMpr));
    asignarTexto(`${z}-peso-mpr`, fmtNum(d.peso_mpr));

    asignarTexto(`${z}-cump-general`, fmtPct(cumplimientoGeneral));
}

function asignarTexto(id, valor) {
    const el = document.getElementById(id);
    if (el) el.innerText = valor;
}
