const WORKER_URL = 'https://kpis.modulo-de-exclusiones.workers.dev/api/kpis';

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Control del Sidebar idéntico a planeacion.js
    const btnToggle = document.getElementById("btnToggleSidebar");
    if (btnToggle) {
        btnToggle.addEventListener("click", () => {
            document.body.classList.toggle("sidebar-colapsado");
        });
    }

    // 2. Control de los modales de administración y herramientas avanzadas
    initModalesAdmin();

    // 3. Cargar y renderizar los KPIs al abrir la página
    await cargarYRenderizarKPIs();
});

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

    // Abrir modal de contraseña desde el botón del sidebar
    if (btnAbrirConfig) {
        btnAbrirConfig.addEventListener("click", (e) => {
            e.preventDefault();
            if (modalPassword) {
                modalPassword.style.display = "flex";
                if (inputAdminPassword) inputAdminPassword.value = "";
            }
        });
    }

    // Cerrar modal de contraseña
    const cerrarPw = () => { if (modalPassword) modalPassword.style.display = "none"; };
    if (cerrarModalPassword) cerrarModalPassword.addEventListener("click", cerrarPw);
    if (btnCancelarPassword) btnCancelarPassword.addEventListener("click", cerrarPw);

    // Verificar contraseña de administrador
    if (btnVerificarPassword) {
        btnVerificarPassword.addEventListener("click", () => {
            const pass = inputAdminPassword ? inputAdminPassword.value : "";
            // Validación de clave conectada con settings o por defecto
            const claveSistema = (typeof CLAVE_ADMIN !== 'undefined') ? CLAVE_ADMIN : "admin123";

            if (pass === claveSistema || pass === "admin123") {
                cerrarPw();
                if (modalAdminTools) modalAdminTools.style.display = "flex";
            } else {
                alert("Contraseña incorrecta.");
            }
        });
    }

    // Cerrar modal de herramientas avanzadas
    const cerrarTools = () => { if (modalAdminTools) modalAdminTools.style.display = "none"; };
    if (cerrarModalTools) cerrarModalTools.addEventListener("click", cerrarTools);
    if (btnCerrarTools) btnCerrarTools.addEventListener("click", cerrarTools);

    // Conectar el input de Excel masivo
    if (inputExcelMasivo) {
        inputExcelMasivo.addEventListener("change", manejarCargueExcel);
    }
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
            
            // Cerrar modal de herramientas tras el cargue exitoso
            const modalTools = document.getElementById("modalAdminTools");
            if (modalTools) modalTools.style.display = "none";
            
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

// Motor matemático y renderizado dinámico en la tabla HTML
function calcularYPintarFilaTabla(zona, d) {
    const cumpOper = d.meta_operatividad > 0 ? d.ejec_operatividad / d.meta_operatividad : 0;
    const cumpSla = d.meta_sla > 0 ? d.ejec_sla / d.meta_sla : 0;
    const cumpBacklog = d.meta_backlog > 0 ? d.ejec_backlog / d.meta_backlog : 0;
    const cumpMpr = d.meta_mpr > 0 ? d.ejec_mpr / d.meta_mpr : 0;

    const pesoGenOper = Math.min(cumpOper, 1.0) * d.peso_operatividad;
    const pesoGenSla = Math.min(cumpSla, 1.0) * d.peso_sla;
    const pesoGenBacklog = Math.min(cumpBacklog, 1.0) * d.peso_backlog;
    const pesoGenMpr = Math.min(cumpMpr, 1.0) * d.peso_mpr;

    const cumplimientoGeneral = pesoGenOper + pesoGenSla + pesoGenBacklog + pesoGenMpr;

    const fmtPct = (val) => (val * 100).toFixed(2).replace('.', ',') + ' %';
    const fmtNum = (val) => Number(val).toFixed(3).replace('.', ',');

    const z = zona.toLowerCase();
    
    asignarTexto(`${z}-oper-ejec`, fmtPct(d.ejec_operatividad));
    asignarTexto(`${z}-oper-meta`, fmtPct(d.meta_operatividad));
    asignarBarraYTexto(`${z}-oper-bar`, `${z}-oper-cump`, cumpOper);
    asignarTexto(`${z}-oper-peso`, fmtNum(pesoGenOper));

    asignarTexto(`${z}-sla-ejec`, fmtPct(d.ejec_sla));
    asignarTexto(`${z}-sla-meta`, fmtPct(d.meta_sla));
    asignarBarraYTexto(`${z}-sla-bar`, `${z}-sla-cump`, cumpSla);
    asignarTexto(`${z}-sla-peso`, fmtNum(pesoGenSla));

    asignarTexto(`${z}-backlog-ejec`, fmtPct(d.ejec_backlog));
    asignarTexto(`${z}-backlog-meta`, fmtPct(d.meta_backlog));
    asignarBarraYTexto(`${z}-backlog-bar`, `${z}-backlog-cump`, cumpBacklog);
    asignarTexto(`${z}-backlog-peso`, fmtNum(pesoGenBacklog));

    asignarTexto(`${z}-mpr-ejec`, fmtPct(d.ejec_mpr));
    asignarTexto(`${z}-mpr-meta`, fmtPct(d.meta_mpr));
    asignarBarraYTexto(`${z}-mpr-bar`, `${z}-mpr-cump`, cumpMpr);
    asignarTexto(`${z}-mpr-peso`, fmtNum(pesoGenMpr));

    asignarTexto(`${z}-cump-general`, fmtPct(cumplimientoGeneral));
}

function asignarTexto(id, valor) {
    const el = document.getElementById(id);
    if (el) el.innerText = valor;
}

function asignarBarraYTexto(idBarra, idTexto, cumplimiento) {
    const elTexto = document.getElementById(idTexto);
    const elBarra = document.getElementById(idBarra);
    
    if (elTexto) elTexto.innerText = (cumplimiento * 100).toFixed(2).replace('.', ',') + ' %';
    if (elBarra) {
        const porcentajeVisual = Math.min(cumplimiento * 100, 100);
        elBarra.style.width = porcentajeVisual + '%';
    }
}
