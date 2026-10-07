// ==========================================
// IMPORTACIÓN MASIVA INTELIGENTE (FECHA -> PROGRAMADA)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const inputExcel = document.getElementById("inputExcelMasivo");
    if (inputExcel) {
        inputExcel.addEventListener("change", async (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;

            const lector = new FileReader();
            lector.onload = async function (evt) {
                try {
                    const datosBinarios = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(datosBinarios, { type: "array" });
                    
                    const nombreHoja = workbook.SheetNames[0];
                    const hoja = workbook.Sheets[nombreHoja];
                    const filasExcel = XLSX.utils.sheet_to_json(hoja, { header: 1 });
                    
                    if (filasExcel.length === 0) {
                        alert("El archivo Excel está vacío.");
                        return;
                    }

                    const encabezadosExcel = filasExcel[0].map(h => String(h).trim().toUpperCase());
                    const idxOT = encabezadosExcel.findIndex(h => h === "OT");
                    const idxObs = encabezadosExcel.findIndex(h => h === "OBSERVACIONES" || h === "OBSERVACION");
                    const idxFechaProg = encabezadosExcel.findIndex(h => h.includes("FECHA_PROGRAMACION") || h.includes("FECHA PROGRAMACION"));
                    const idxEstadoProg = encabezadosExcel.findIndex(h => h.includes("ESTADO_PROGRAMACION") || h.includes("ESTADO PROGRAMACION"));

                    if (idxOT === -1) {
                        alert("El Excel debe contener obligatoriamente la columna 'OT'.");
                        return;
                    }

                    if (!confirm(`Se procesará el archivo. ¿Deseas actualizar masivamente las observaciones y fechas?`)) {
                        return;
                    }

                    let actualizados = 0;

                    for (let i = 1; i < filasExcel.length; i++) {
                        const fila = filasExcel[i];
                        const otVal = String(fila[idxOT] || "").trim();

                        if (otVal) {
                            const regD1Actual = window.registrosD1[otVal] || {};
                            
                            const obsVal = idxObs !== -1 && fila[idxObs] !== undefined ? String(fila[idxObs]).trim() : (regD1Actual.observacion || "");
                            
                            let fechaVal = idxFechaProg !== -1 && fila[idxFechaProg] !== undefined ? String(fila[idxFechaProg]).trim() : (regD1Actual.fechaProgramacion || "");
                            
                            let estadoProgVal = regD1Actual.estadoProgramacion || "";

                            // Si el Excel trae un estado explícito, lo respetamos
                            if (idxEstadoProg !== -1 && fila[idxEstadoProg]) {
                                estadoProgVal = String(fila[idxEstadoProg]).trim();
                            } 
                            // Si NO trae estado explícito, pero SÍ detectamos una fecha en la columna, activamos a Programada automáticamente
                            else if (fechaVal && fechaVal !== "" && fechaVal !== "-") {
                                estadoProgVal = "Programada";
                            }

                            const payload = {
                                ot: otVal,
                                estadoProgramacion: estadoProgVal,
                                fechaProgramacion: fechaVal,
                                observacion: obsVal,
                                estadoGestion: regD1Actual.estadoGestion || "",
                                tecnicoAsignado: regD1Actual.tecnicoAsignado || "",
                                acompanamiento: regD1Actual.acompanamiento || ""
                            };

                            try {
                                const resp = await fetch(API_URL, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload)
                                });
                                const resJson = await resp.json();
                                if (resJson.ok) {
                                    window.registrosD1[otVal] = { ...regD1Actual, ...payload };
                                    actualizados++;
                                }
                            } catch (err) {
                                console.error(`Error al actualizar OT ${otVal}:`, err);
                            }
                        }
                    }

                    alert(`¡Carga masiva completada! Se actualizaron ${actualizados} registros.`);
                    aplicarFiltros();

                } catch (error) {
                    console.error("Error leyendo el Excel:", error);
                    alert("Ocurrió un error al procesar el archivo Excel.");
                }
            };
            lector.readAsArrayBuffer(archivo);
        });
    }
});
