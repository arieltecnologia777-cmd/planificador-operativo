// ==========================================================
// CARGA Y CÁLCULO DINÁMICO DEL INDICADOR BACKLOG DESDE SU HOJA ESPECÍFICA
// ==========================================================
async function cargarYCalcularBacklog() {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSvQf6zIgwVnOQ72fcweEEMdRKylGsKFe30Mpea50qWIbr-m6ELzpxaUV2fnFRwH7TX1AMIabPbOqoJ/pub?gid=290150389&single=true&output=csv";

    try {
        const response = await fetch(csvUrl);
        const dataText = await response.text();
        
        // Convertir el texto CSV a un array de filas usando la librería XLSX que ya cargas en el HTML
        const workbook = XLSX.read(dataText, { type: 'string' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const datosBacklog = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!datosBacklog || datosBacklog.length === 0) {
            console.warn("⚠️ La hoja de IND Backlog está vacía.");
            return;
        }

        let r1Total = 0, r1Ceros = 0;
        let r2Total = 0, r2Ceros = 0;

        // Omitir la cabecera (fila 0) y recorrer el resto
        const filasDatos = datosBacklog.slice(1);

        filasDatos.forEach(fila => {
            // Columna I (índice 8) = Regional ("R1" o "R2")
            const regional = String(fila[8] || "").trim().toUpperCase();
            
            // Columna T (índice 19) = Cumple SLA / Backlog (valores 0 o 1)
            const valorBacklog = parseInt(fila[19], 10); 

            if (!isNaN(valorBacklog)) {
                if (regional === "R1") {
                    r1Total++;
                    if (valorBacklog === 0) r1Ceros++;
                } else if (regional === "R2") {
                    r2Total++;
                    if (valorBacklog === 0) r2Ceros++;
                }
            }
        });

        // 1. Porcentajes reales de Backlog (Ceros / Total * 100)
        const porcR1 = r1Total > 0 ? (r1Ceros / r1Total) * 100 : 0;
        const porcR2 = r2Total > 0 ? (r2Ceros / r2Total) * 100 : 0;

        // 2. Meta fija solicitada: 93%
        const meta = 93.00;

        // 3. Cálculo de acercamiento a la meta (Porcentaje Real / 93 * 100)
        const cumplimientoR1 = meta > 0 ? (porcR1 / meta) * 100 : 0;
        const cumplimientoR2 = meta > 0 ? (porcR2 / meta) * 100 : 0;

        // --- PINTAR EN LOS IDS DE TU HTML ---

        // Primera columna (Porcentaje real de Backlog)
        const elR1 = document.getElementById("valBacklogR1");
        const elR2 = document.getElementById("valBacklogR2");
        if (elR1) elR1.textContent = porcR1.toFixed(2).replace('.', ',') + " %";
        if (elR2) elR2.textContent = porcR2.toFixed(2).replace('.', ',') + " %";

        // Segunda columna (Badge de cumplimiento respecto a la meta de 93%)
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

        console.log("✅ Indicador de Backlog calculado y pintado exitosamente.");

    } catch (error) {
        console.error("❌ Error al cargar los datos de la hoja de Backlog:", error);
    }
}

// Ejecutar la función al cargar el dashboard (o la puedes llamar junto con tu función principal de carga)
document.addEventListener("DOMContentLoaded", () => {
    cargarYCalcularBacklog();
});
