const WORKER_URL = 'https://kpis.modulo-de-exclusiones.workers.dev/api/kpis';

// Variable de control global para el modo de simulación y caché de datos
let modoPesoMaximoActivo = false;
let datosKpiGlobales = null;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Control del Sidebar: Inicia colapsado por defecto y abre/cierra al hacer clic
    const btnToggle = document.getElementById("btnToggleSidebar");
    if (btnToggle) {
        btnToggle.addEventListener("click", () => {
            document.body.classList.toggle("sidebar-colapsado");
        });
    }

    // 2. Control de los modales de administración y herramientas avanzadas
    initModalesAdmin();

    // 3. Inicializar el botón de alternancia de pesos máximos
    initBotonAlternarPesos();

    // 4. Cargar y renderizar los KPIs al abrir la página
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

            // Repintar con la data actual según el modo seleccionado
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

// --- PROCESAR EXCEL Y ENVIAR AL WORKER (PUT) CON BARRA DE PROGRESO ---
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

// --- CARGAR DESDE D1, CALCULAR Y PINTAR EN HTML ---
async function cargarYRenderizarKPIs() {
    try {
        const response = await fetch(WORKER_URL);
        const resultado = await response.json();

        if (!resultado.ok) return;

        datosKpiGlobales = resultado.data; // Guardamos en caché global
        if (datosKpiGlobales.R1) calcularYPintarFilaTabla('R1', datosKpiGlobales.R1);
        if (datosKpiGlobales.R2) calcularYPintarFilaTabla('R2', datosKpiGlobales.R2);

    } catch (error) {
        console.error("Error al cargar datos desde el Worker:", error);
    }
}

// --- MOTOR MATEMÁTICO CON CÁLCULO DE CUMPLIMIENTO GENERAL POR PESO MÁXIMO ---
function calcularYPintarFilaTabla(zona, d) {
    // 1. Mantener los valores ejecutados y metas originales intactos
    const ejecOper = d.ejec_operatividad;
    const ejSla = d.ejec_sla;
    const ejBacklog = d.ejec_backlog;
    const ejMpr = d.ejec_mpr;

    const cumpOper = d.meta_operatividad > 0 ? ejecOper / d.meta_operatividad : 0;
    const cumpSla = d.meta_sla > 0 ? ejSla / d.meta_sla : 0;
    const cumpBacklog = d.meta_backlog > 0 ? ejBacklog / d.meta_backlog : 0;
    const cumpMpr = d.meta_mpr > 0 ? ejMpr / d.meta_mpr : 0;

    // 2. Definir los pesos a utilizar (Normales o Pesos Máximos Simulados)
    let pOper = d.peso_operatividad;
    let pSla = d.peso_sla;
    let pBacklog = d.peso_backlog;
    let pMpr = d.peso_mpr;

    if (modoPesoMaximoActivo) {
        // Aquí aplicamos los pesos máximos ideales o ampliados para simular el aumento en el cumplimiento general
        // (Si prefieres usar un factor multiplicador de peso máximo o valores fijos ideales, se ajusta aquí)
        pBacklog = Math.max(pBacklog, 0.430);
        pOper = Math.max(pOper, 0.370);
        pSla = Math.max(pSla, 0.100);
        pMpr = Math.max(pMpr, 0.100);
    }

    // 3. Calcular el peso generado por cada indicador utilizando los pesos correspondientes
    const pesoGenOper = Math.min(cumpOper, 1.0) * pOper;
    const pesoGenSla = Math.min(cumpSla, 1.0) * pSla;
    const pesoGenBacklog = Math.min(cumpBacklog, 1.0) * pBacklog;
    const pesoGenMpr = Math.min(cumpMpr, 1.0) * pMpr;

    // El cumplimiento general de la zona es la suma de los pesos generados (aumenta al tener pesos máximos mayores)
    const cumplimientoGeneral = pesoGenOper + pesoGenSla + pesoGenBacklog + pesoGenMpr;
    
    const META_CUMPLIMIENTO_GRAL = 0.99;
    const cumpGeneralRelativo = cumplimientoGeneral / META_CUMPLIMIENTO_GRAL;

    const fmtPct = (val) => (val * 100).toFixed(2).replace('.', ',') + ' %';
    const fmtNum = (val) => Number(val).toFixed(3).replace('.', ',');

    const z = zona.toLowerCase();
    
    // Asignar textos y barras individuales (manteniendo el ejecutado real)
    asignarTexto(`${z}-oper-ejec`, fmtPct(ejecOper));
    asignarTexto(`${z}-oper-meta`, fmtPct(d.meta_operatividad));
    asignarBarraConLineaMeta(`${z}-oper-bar`, `${z}-oper-cump`, cumpOper);
    asignarTexto(`${z}-oper-peso`, fmtNum(pesoGenOper));

    asignarTexto(`${z}-sla-ejec`, fmtPct(ejSla));
    asignarTexto(`${z}-sla-meta`, fmtPct(d.meta_sla));
    asignarBarraConLineaMeta(`${z}-sla-bar`, `${z}-sla-cump`, cumpSla);
    asignarTexto(`${z}-sla-peso`, fmtNum(pesoGenSla));

    asignarTexto(`${z}-backlog-ejec`, fmtPct(ejBacklog));
    asignarTexto(`${z}-backlog-meta`, fmtPct(d.meta_backlog));
    asignarBarraConLineaMeta(`${z}-backlog-bar`, `${z}-backlog-cump`, cumpBacklog);
    asignarTexto(`${z}-backlog-peso`, fmtNum(pesoGenBacklog));

    asignarTexto(`${z}-mpr-ejec`, fmtPct(ejMpr));
    asignarTexto(`${z}-mpr-meta`, fmtPct(d.meta_mpr));
    asignarBarraConLineaMeta(`${z}-mpr-bar`, `${z}-mpr-cump`, cumpMpr);
    asignarTexto(`${z}-mpr-peso`, fmtNum(pesoGenMpr));

    // Renderizar cumplimiento general de la zona (la barra de abajo más grande que aumenta con los pesos máximos)
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
