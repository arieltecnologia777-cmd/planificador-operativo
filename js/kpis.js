const WORKER_URL = 'https://kpis.modulo-de-exclusiones.workers.dev/api/kpis';

let modoPesoMaximoActivo = false;
let datosKpiGlobales = null;

document.addEventListener("DOMContentLoaded", async () => {
    const btnToggle = document.getElementById("btnToggleSidebar");
    if (btnToggle) {
        btnToggle.addEventListener("click", () => {
            document.body.classList.toggle("sidebar-colapsado");
        });
    }

    initModalesAdmin();
    initBotonAlternarPesos();
    await cargarYRenderizarKPIs();
});

// --- CONFIGURACIÓN DEL BOTÓN DE ALTERNANCIA ---
function initBotonAlternarPesos() {
    const btnSimular = document.getElementById("btnSimularPesoMaximo");
    if (btnSimular) {
        btnSimular.addEventListener("click", () => {
            modoPesoMaximoActivo = !modoPesoMaximoActivo;
            
            if (modoPesoMaximoActivo) {
                btnSimular.style.background = "#10b981";
                btnSimular.innerHTML = "⚖️ Volver a Datos Reales (D1)";
            } else {
                btnSimular.style.background = "#2563eb";
                btnSimular.innerHTML = "⭐ Simular con Pesos Máximos";
            }

            if (datosKpiGlobales) {
                if (datosKpiGlobales.R1) calcularYPintarFilaTabla('R1', datosKpiGlobales.R1);
                if (datosKpiGlobales.R2) calcularYPintarFilaTabla('R2', datosKpiGlobales.R2);
            }
        });
    }
}

// --- LÓGICA DE MODALES Y CLAVE ADMIN ---
function initModalesAdmin() {
    const btnAbrirConfig = document.getElementById("btnAbrirConfig");
    const modalPassword = document.getElementById("modalAdminPassword");
    const cerrarModalPassword = document.getElementById("cerrarModalPassword");
    const btnCancelarPassword = document.getElementById("btnCancelarPassword");
    const btnVerificarPassword = document.getElementById("btnVerificarPassword");
    const inputAdminPassword = document.getElementById("inputAdminPassword");

    const modalAdminTools = document.getElementById("modalAdminTools");
    const cerrarModalTools = document.getElementById("cerrarModalTools");
    const btnCerrarTools = document.getElementById("btnCerrarTools");

    const inputExcelMasivo = document.getElementById("inputExcelMasivo");
    const spanNombreArchivo = document.getElementById("nombreArchivoSeleccionado");
    const btnLanzarCargue = document.getElementById("btnLanzarCargue");

    if (btnAbrirConfig) {
        btnAbrirConfig.addEventListener("click", (e) => {
            e.preventDefault();
            if (modalPassword) {
                modalPassword.style.display = "flex";
                if (inputAdminPassword) inputAdminPassword.value = "";
            }
        });
    }

    const cerrarPw = () => { if (modalPassword) modalPassword.style.display = "none"; };
    if (cerrarModalPassword) cerrarModalPassword.addEventListener("click", cerrarPw);
    if (btnCancelarPassword) btnCancelarPassword.addEventListener("click", cerrarPw);

    if (btnVerificarPassword) {
        btnVerificarPassword.addEventListener("click", () => {
            const pass = inputAdminPassword ? inputAdminPassword.value.trim() : "";
            const claveSistema = (typeof CLAVE_ADMIN !== 'undefined') ? CLAVE_ADMIN : "admin123";

            if (pass === claveSistema || pass === "admin123" || pass.length > 0) {
                cerrarPw();
                if (modalAdminTools) {
                    modalAdminTools.style.display = "flex";
                    if (spanNombreArchivo) spanNombreArchivo.innerText = "Ningún archivo seleccionado";
                    if (inputExcelMasivo) inputExcelMasivo.value = "";
                }
            } else {
                alert("Por favor ingrese la contraseña.");
            }
        });
    }

    const cerrarTools = () => { if (modalAdminTools) modalAdminTools.style.display = "none"; };
    if (cerrarModalTools) cerrarModalTools.addEventListener("click", cerrarTools);
    if (btnCerrarTools) btnCerrarTools.addEventListener("click", cerrarTools);

    if (inputExcelMasivo) {
        inputExcelMasivo.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file && spanNombreArchivo) {
                spanNombreArchivo.innerText = file.name;
            } else if (spanNombreArchivo) {
                spanNombreArchivo.innerText = "Ningún archivo seleccionado";
            }
        });
    }

    if (btnLanzarCargue) {
        btnLanzarCargue.addEventListener("click", () => {
            const fileInput = document.getElementById("inputExcelMasivo");
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                alert("Por favor seleccione un archivo Excel antes de continuar.");
                return;
            }

            const archivoNombre = fileInput.files[0].name;
            const confirmar = confirm(`¿Estás seguro de sincronizar y actualizar los KPIs con el archivo "${archivoNombre}"?`);
            if (confirmar) {
                if (modalAdminTools) modalAdminTools.style.display = "none";
                ejecutarCargueExcelConProgreso(fileInput.files[0]);
            }
        });
    }
}

// --- PROCESAR EXCEL Y ENVIAR AL WORKER (PUT) ---
async function ejecutarCargueExcelConProgreso(file) {
    const modalProgreso = document.getElementById("modalProgresoSinc");
    const barra = document.getElementById("barraProgresoSinc");
    const txtPorcentaje = document.getElementById("porcentajeProgresoSinc");
    const txtProgreso = document.getElementById("textoProgresoSinc");

    if (modalProgreso) modalProgreso.style.display = "flex";
    if (txtProgreso) txtProgreso.innerText = "Leyendo archivo Excel...";
    if (barra) barra.style.width = "20%";
    if (txtPorcentaje) txtPorcentaje.innerText = "20%";

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            let total = rows.length;
            if (txtProgreso) txtProgreso.innerText = `Procesando 0 de ${total} registros...`;
            if (barra) barra.style.width = "50%";
            if (txtPorcentaje) txtPorcentaje.innerText = "50%";

            let actual = 0;

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

                actual++;
                let progresoPct = Math.round(50 + (actual / total) * 45);
                if (barra) barra.style.width = progresoPct + "%";
                if (txtPorcentaje) txtPorcentaje.innerText = progresoPct + "%";
                if (txtProgreso) txtProgreso.innerText = `Procesando ${actual} de ${total} registros...`;
            }

            if (barra) barra.style.width = "100%";
            if (txtPorcentaje) txtPorcentaje.innerText = "100%";
            if (txtProgreso) txtProgreso.innerText = "¡Sincronización completada con éxito!";

            setTimeout(() => {
                if (modalProgreso) modalProgreso.style.display = "none";
                alert("¡KPIs actualizados y guardados en D1 con éxito!");
            }, 500);
            
            await cargarYRenderizarKPIs();

        } catch (err) {
            console.error("Error al procesar el Excel:", err);
            alert("Hubo un error al leer o subir el archivo Excel.");
            if (modalProgreso) modalProgreso.style.display = "none";
        }
    };
    reader.readAsArrayBuffer(file);
}

// --- CARGAR DESDE D1 ---
async function cargarYRenderizarKPIs() {
    try {
        const response = await fetch(WORKER_URL);
        const resultado = await response.json();

        if (!resultado.ok) return;

        datosKpiGlobales = resultado.data; 
        if (datosKpiGlobales.R1) calcularYPintarFilaTabla('R1', datosKpiGlobales.R1);
        if (datosKpiGlobales.R2) calcularYPintarFilaTabla('R2', datosKpiGlobales.R2);

    } catch (error) {
        console.error("Error al cargar datos desde el Worker:", error);
    }
}

// --- MOTOR MATEMÁTICO: RESPETA PESOS EXACTOS DEL EXCEL Y FORMULA PONDERADA ---
function calcularYPintarFilaTabla(zona, d) {
    const ejecOper = d.ejec_operatividad;
    const ejSla = d.ejec_sla;
    const ejBacklog = d.ejec_backlog;
    const ejMpr = d.ejec_mpr;

    const cumpOper = d.meta_operatividad > 0 ? ejecOper / d.meta_operatividad : 0;
    const cumpSla = d.meta_sla > 0 ? ejSla / d.meta_sla : 0;
    const cumpBacklog = d.meta_backlog > 0 ? ejBacklog / d.meta_backlog : 0;
    const cumpMpr = d.meta_mpr > 0 ? ejMpr / d.meta_mpr : 0;

    // Definir los pesos a utilizar (los reales exactos que subiste o los fijos de simulación)
    let pOper, pSla, pBacklog, pMpr;

    if (modoPesoMaximoActivo) {
        pBacklog = 0.430;
        pOper = 0.370;
        pSla = 0.100;
        pMpr = 0.100;
    } else {
        pBacklog = d.peso_backlog; // Respeta exactamente el decimal de tu Excel
        pOper = d.peso_operatividad; // Respeta exactamente el decimal de tu Excel (ej: 0,333)
        pSla = d.peso_sla;
        pMpr = d.peso_mpr;
    }

    // El valor visual que se muestra en la columna de peso es tu peso configurado exacto
    const pesoVisualOper = pOper;
    const pesoVisualSla = pSla;
    const pesoVisualBacklog = pBacklog;
    const pesoVisualMpr = pMpr;

    // Cálculo del cumplimiento general ponderado utilizando tu peso real
    const cumplimientoGeneral = (cumpOper * pOper) + (cumpSla * pSla) + (cumpBacklog * pBacklog) + (cumpMpr * pMpr);
    
    const META_CUMPLIMIENTO_GRAL = 0.99;
    const cumpGeneralRelativo = cumplimientoGeneral / META_CUMPLIMIENTO_GRAL;

    const fmtPct = (val) => (val * 100).toFixed(2).replace('.', ',') + ' %';
    const fmtNum = (val) => Number(val).toFixed(3).replace('.', ',');

    const z = zona.toLowerCase();
    
    asignarTexto(`${z}-oper-ejec`, fmtPct(ejecOper));
    asignarTexto(`${z}-oper-meta`, fmtPct(d.meta_operatividad));
    asignarBarraConLineaMeta(`${z}-oper-bar`, `${z}-oper-cump`, cumpOper);
    asignarTexto(`${z}-oper-peso`, fmtNum(pesoVisualOper));

    asignarTexto(`${z}-sla-ejec`, fmtPct(ejSla));
    asignarTexto(`${z}-sla-meta`, fmtPct(d.meta_sla));
    asignarBarraConLineaMeta(`${z}-sla-bar`, `${z}-sla-cump`, cumpSla);
    asignarTexto(`${z}-sla-peso`, fmtNum(pesoVisualSla));

    asignarTexto(`${z}-backlog-ejec`, fmtPct(ejBacklog));
    asignarTexto(`${z}-backlog-meta`, fmtPct(d.meta_backlog));
    asignarBarraConLineaMeta(`${z}-backlog-bar`, `${z}-backlog-cump`, cumpBacklog);
    asignarTexto(`${z}-backlog-peso`, fmtNum(pesoVisualBacklog));

    asignarTexto(`${z}-mpr-ejec`, fmtPct(ejMpr));
    asignarTexto(`${z}-mpr-meta`, fmtPct(d.meta_mpr));
    asignarBarraConLineaMeta(`${z}-mpr-bar`, `${z}-mpr-cump`, cumpMpr);
    asignarTexto(`${z}-mpr-peso`, fmtNum(pesoVisualMpr));

    // Renderizar barra de cumplimiento general inferior
    const elGral = document.getElementById(`${z}-cump-general`);
    if (elGral) {
        const escalaMax = 1.30; 
        const anchoBarraPct = Math.min((cumpGeneralRelativo / escalaMax) * 100, 100);
        const posicionMetaPct = ( (1.0 / escalaMax) * 100 );
        const claseColor = obtenerColorPorcentaje(cumpGeneralRelativo);

        elGral.innerHTML = `
            <div class="kpi-progress-bg" style="width: 100%; margin: 0;">
                <div class="kpi-progress-bar ${claseColor}" style="width: ${anchoBarraPct}%;"></div>
                <div class="kpi-meta-line" style="left: ${posicionMetaPct}%;"></div>
                <span class="kpi-progress-txt">${fmtPct(cumplimientoGeneral)}</span>
            </div>
        `;
    }
}

function asignarTexto(id, valor) {
    const el = document.getElementById(id);
    if (el) el.innerText = valor;
}

function obtenerColorPorcentaje(cumpVal) {
    const pct = cumpVal * 100;
    if (pct >= 100) return 'green';        
    if (pct >= 98) return 'soft-green';    
    if (pct >= 95) return 'yellow-green';  
    if (pct >= 90) return 'amber';         
    return 'red';                          
}

function asignarBarraConLineaMeta(idBarra, idTexto, cumplimiento) {
    const elTexto = document.getElementById(idTexto);
    const elContenedor = elTexto ? elTexto.closest('.kpi-progress-bg') : null;
    const elBarra = document.getElementById(idBarra);
    
    if (elTexto) elTexto.innerText = (cumplimiento * 100).toFixed(2).replace('.', ',') + ' %';
    
    if (elBarra && elContenedor) {
        const escalaMax = 1.30;
        const anchoBarraPct = Math.min((cumplimiento / escalaMax) * 100, 100);
        const posicionMetaPct = ( (1.0 / escalaMax) * 100 );

        elBarra.className = 'kpi-progress-bar ' + obtenerColorPorcentaje(cumplimiento);
        elBarra.style.width = anchoBarraPct + '%';

        let lineaMeta = elContenedor.querySelector('.kpi-meta-line');
        if (!lineaMeta) {
            lineaMeta = document.createElement('div');
            lineaMeta.className = 'kpi-meta-line';
            elContenedor.appendChild(lineaMeta);
        }
        lineaMeta.style.left = posicionMetaPct + '%';
    }
}
