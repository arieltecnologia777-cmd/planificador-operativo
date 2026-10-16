document.addEventListener("DOMContentLoaded", async () => {
    // Control del menú lateral (si aplica en tu diseño)
    document.addEventListener("click", (e) => {
        const btnToggle = e.target.closest("#btnToggleSidebar");
        if (btnToggle) {
            document.body.classList.toggle("sidebar-colapsado");
        }
    });

    // 1. Al cargar la página, consultamos los datos de D1 y pintamos la tabla
    await cargarYRenderizarKPIs();

    // 2. Si tienes un input de tipo file para cargar el Excel, configuramos el evento
    const inputExcel = document.getElementById("inputCargarExcel"); // Cambia el ID según tu HTML
    if (inputExcel) {
        inputExcel.addEventListener("change", manejarCargueExcel);
    }
});

// --- FUNCIÓN GET: CARGAR Y PINTAR DESDE D1 ---
async function cargarYRenderizarKPIs() {
    try {
        const response = await fetch('https://dominion-kpis.tu-usuario.workers.dev/api/kpis');
        const resultado = await response.json();

        if (!resultado.ok) {
            console.error("Error al obtener KPIs de la base de datos");
            return;
        }

        const data = resultado.data;
        if (data.R1) procesarYPintarZona('R1', data.R1);
        if (data.R2) procesarYPintarZona('R2', data.R2);

    } catch (error) {
        console.error("Error de red al cargar KPIs:", error);
    }
}

// --- MOTOR MATEMÁTICO EN EL CLIENTE (JS) ---
function procesarYPintarZona(zona, d) {
    // Metas fijas del negocio
    const metas = {
        backlog: 0.93,
        operatividad: 0.98,
        sla: 0.98,
        mpr: 0.98
    };

    // 1. Cálculos de cumplimiento (Ejecutado / Meta)
    const cumpBacklog = d.ejec_backlog / metas.backlog;
    const cumpOper = d.ejec_operatividad / metas.operatividad;
    const cumpSla = d.ejec_sla / metas.sla;
    const cumpMpr = d.ejec_mpr / metas.mpr;

    // 2. Pesos generados (Cumplimiento acotado a máximo 1.0 * Peso asignado)
    const pesoGenBacklog = Math.min(cumpBacklog, 1.0) * d.peso_backlog;
    const pesoGenOper = Math.min(cumpOper, 1.0) * d.peso_operatividad;
    const pesoGenSla = Math.min(cumpSla, 1.0) * d.peso_sla;
    const pesoGenMpr = Math.min(cumpMpr, 1.0) * d.peso_mpr;

    // 3. Cumplimiento general de la zona (Suma de pesos generados)
    const cumplimientoGeneral = pesoGenBacklog + pesoGenOper + pesoGenSla + pesoGenMpr;

    // Formateadores visuales
    const fmtPorcentaje = (val) => (val * 100).toFixed(2).replace('.', ',') + ' %';
    const fmtValor = (val) => Number(val).toFixed(4);

    console.log(`=== ZONA ${zona} ===`);
    console.log(`Backlog -> Ejec: ${fmtValor(d.ejec_backlog)} | Cump: ${fmtPorcentaje(cumpBacklog)} | P.Gen: ${fmtValor(pesoGenBacklog)}`);
    console.log(`Operatividad -> Ejec: ${fmtValor(d.ejec_operatividad)} | Cump: ${fmtPorcentaje(cumpOper)} | P.Gen: ${fmtValor(pesoGenOper)}`);
    console.log(`SLA -> Ejec: ${fmtValor(d.ejec_sla)} | Cump: ${fmtPorcentaje(cumpSla)} | P.Gen: ${fmtValor(pesoGenSla)}`);
    console.log(`MPR -> Ejec: ${fmtValor(d.ejec_mpr)} | Cump: ${fmtPorcentaje(cumpMpr)} | P.Gen: ${fmtValor(pesoGenMpr)}`);
    console.log(`CUMPLIMIENTO GENERAL: ${fmtPorcentaje(cumplimientoGeneral)}`);

    // TODO: Aquí inyectas estos valores calculados en los elementos HTML de tu tabla (ej. document.getElementById(`r1-backlog`).innerText = ...)
}

// --- FUNCIÓN PUT: LEER EXCEL CON SHEETJS Y ENVIAR AL WORKER ---
async function manejarCargueExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet);

            console.log("Datos leídos del Excel:", rows);

            // Recorremos las filas del Excel y enviamos un PUT por cada zona al Worker
            for (let row of rows) {
                // Adaptamos las propiedades según los nombres de las columnas de tu Excel
                const payload = {
                    zona: row["Zona"],
                    ejec_backlog: row["Backlog"],
                    ejec_operatividad: row["Operatividad"],
                    ejec_sla: row["SLA"],
                    ejec_mpr: row["MPR"],
                    peso_backlog: row["Peso backlog"],
                    peso_operatividad: row["Peso operatividad"],
                    peso_sla: row["Peso SLA"],
                    peso_mpr: row["Peso MPR"]
                };

                const response = await fetch('https://dominion-kpis.tu-usuario.workers.dev/api/kpis', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const resJson = await response.json();
                console.log(`Resultado subida zona ${payload.zona}:`, resJson);
            }

            alert("¡Excel procesado y guardado en D1 con éxito!");
            await cargarYRenderizarKPIs(); // Recargamos la tabla con los datos nuevos

        } catch (err) {
            console.error("Error procesando el archivo Excel:", err);
            alert("Hubo un error al procesar el archivo Excel.");
        }
    };
    reader.readAsArrayBuffer(file);
}
