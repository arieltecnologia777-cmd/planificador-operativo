// Variable de control para evitar ejecuciones duplicadas
let procesandoCambioFecha = false;
let ejecutandoClickGlobal = false;

// Variables temporales para el modal de clave segura
let callbackClaveSegura = null;

function solicitarClaveSegura(mensaje, callback) {
    const modal = document.getElementById("modalClaveSegura");
    const input = document.getElementById("inputClaveSegura");
    const texto = document.getElementById("textoMensajeClave");
    
    if (texto) texto.textContent = mensaje;
    if (input) input.value = "";
    if (modal) modal.style.display = "grid";
    if (input) input.focus();
    
    callbackClaveSegura = callback;
}

// 1. Control directo y limpio para abrir y cerrar las vistas del menú de herramientas
document.addEventListener("click", function(e) {
    const target = e.target;
    const menu = document.getElementById("vistaMenuHerramientas");
    const formNota = document.getElementById("vistaFormNota");
    const formBacklog = document.getElementById("vistaFormBacklog");
    const formIndBacklog = document.getElementById("vistaFormIndBacklog");

    if (!menu || !formNota || !formBacklog || !formIndBacklog) return;

    if (target.closest("#btnIrANota")) {
        menu.style.display = "none";
        formNota.style.display = "block";
        formBacklog.style.display = "none";
        formIndBacklog.style.display = "none";
        return;
    }
    if (target.closest("#btnIrABacklog")) {
        menu.style.display = "none";
        formNota.style.display = "none";
        formBacklog.style.display = "block";
        formIndBacklog.style.display = "none";
        return;
    }
    if (target.closest("#btnIrAIndBacklog")) {
        menu.style.display = "none";
        formNota.style.display = "none";
        formBacklog.style.display = "none";
        formIndBacklog.style.display = "block";
        return;
    }
    if (target.closest("#btnVolverMenuDesdeNota") || target.closest("#btnVolverMenuDesdeNotaX") ||
        target.closest("#btnVolverMenuDesdeBacklog") || target.closest("#btnVolverMenuDesdeBacklogX") ||
        target.closest("#btnVolverMenuDesdeIndBacklog") || target.closest("#btnVolverMenuDesdeIndBacklogX") ||
        target.closest("#btnCerrarPie")) {
        menu.style.display = "block";
        formNota.style.display = "none";
        formBacklog.style.display = "none";
        formIndBacklog.style.display = "none";
        return;
    }
});

// 2. Control global de acciones y peticiones al servidor
document.addEventListener("click", async (e) => {
    // Evita doble ejecución si el evento se propaga rápidamente o hay scripts duplicados
    if (ejecutandoClickGlobal) return;
    ejecutandoClickGlobal = true;
    setTimeout(() => { ejecutandoClickGlobal = false; }, 100);

    const target = e.target;

    // A. Clic en el botón del sidebar "Herramientas Avanzadas" -> Abre modal de contraseña
    if (target.closest("#btnAbrirConfig")) {
        const modalPass = document.getElementById("modalAdminPassword");
        const inputPass = document.getElementById("inputAdminPassword");
        if (inputPass) inputPass.value = "";
        if (modalPass) modalPass.style.display = "grid";
        if (inputPass) inputPass.focus();
        return;
    }

    // B. Botones para cerrar el modal de contraseña inicial
    if (target.closest("#cerrarModalPassword, #btnCancelarPassword")) {
        document.getElementById("modalAdminPassword").style.display = "none";
        return;
    }

    // C. Verificar contraseña estrictamente contra Cloudflare Worker
    if (target.closest("#btnVerificarPassword")) {
        const inputPass = document.getElementById("inputAdminPassword");
        const pass = inputPass ? inputPass.value.trim() : "";

        if (!pass) {
            alert("Por favor ingresa la contraseña.");
            return;
        }

        try {
            const resp = await fetch(`https://planeacion-api.modulo-de-exclusiones.workers.dev/api/planeacion/verificar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: pass })
            });
            const resultado = await resp.json();

            if (resp.ok && resultado.ok) {
                document.getElementById("modalAdminPassword").style.display = "none";
                document.getElementById("modalAdminTools").style.display = "grid";
                if (inputPass) inputPass.value = "";
            } else {
                alert("Contraseña incorrecta.");
                if (inputPass) {
                    inputPass.value = "";
                    inputPass.focus();
                }
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Error de red al verificar la contraseña con el servidor.");
            if (inputPass) {
                inputPass.value = "";
                inputPass.focus();
            }
        }
        return;
    }

    // D. Cerrar el menú de herramientas
    if (target.closest("#cerrarModalTools, #btnCerrarTools, #btnCerrarModalGlobal")) {
        document.getElementById("modalAdminTools").style.display = "none";
        return;
    }

    // E. Desde el menú de herramientas, seleccionar "Forzar Fecha OT"
    if (target.closest("#btnAbrirForzarFecha")) {
        document.getElementById("modalAdminTools").style.display = "none";
        document.getElementById("modalAdminFecha").style.display = "grid";
        return;
    }

    // F. Volver del modal de fecha al menú de herramientas
    if (target.closest("#btnVolverTools, #cerrarModalAdmin")) {
        document.getElementById("modalAdminFecha").style.display = "none";
        document.getElementById("modalAdminTools").style.display = "grid";
        return;
    }

    // G. Guardar la nueva fecha forzada para la OT en el servidor
    if (target.closest("#btnAdminGuardarFecha")) {
        if (procesandoCambioFecha) return;

        const inputOt = document.getElementById("adminInputOt");
        const inputFecha = document.getElementById("adminInputFecha");

        const otVal = inputOt ? inputOt.value.trim() : "";
        const fechaVal = inputFecha ? inputFecha.value : "";

        if (!otVal || !fechaVal) {
            alert("Por favor ingresa tanto el número de la OT como la fecha correcta.");
            return;
        }

        const confirmar = window.confirm(`¿Estás seguro de cambiar la fecha de creación de la OT ${otVal} a ${fechaVal}?`);
        if (!confirmar) return;

        procesandoCambioFecha = true;
        const regActual = window.registrosD1[otVal] || {};

        const payload = {
            ot: otVal,
            estadoProgramacion: regActual.estadoProgramacion || "",
            fechaProgramacion: regActual.fechaProgramacion || "",
            observacion: regActual.observacion || "",
            estadoGestion: regActual.estadoGestion || "",
            tecnicoAsignado: regActual.tecnicoAsignado || "",
            acompanamiento: regActual.acompanamiento || "",
            customCreatedAt: fechaVal
        };

        try {
            const resp = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const resultado = await resp.json();

            if (resultado.ok) {
                window.registrosD1[otVal] = {
                    ...regActual,
                    ot: otVal,
                    createdAt: resultado.createdAt
                };
                
                alert(`¡Éxito! La OT ${otVal} ahora tiene fecha de creación ${resultado.createdAt}.`);
                inputOt.value = "";
                inputFecha.value = "";
                document.getElementById("modalAdminFecha").style.display = "none";
                
                if (typeof aplicarFiltros === "function") {
                    aplicarFiltros();
                }
            } else {
                alert("Error al actualizar la fecha en el servidor.");
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Ocurrió un error de red al intentar actualizar la OT.");
        } finally {
            procesandoCambioFecha = false;
        }
        return;
    }

    // H. Desde el menú de herramientas, abrir la sección de borrado (Eliminar Data)
    if (target.closest("#btnAbrirBorrarData")) {
        document.getElementById("modalAdminTools").style.display = "none";
        document.getElementById("modalAdminBorrar").style.display = "grid";
        return;
    }

    // I. Volver del modal de borrado al menú de herramientas
    if (target.closest("#btnVolverToolsBorrar, #cerrarModalBorrar")) {
        document.getElementById("modalAdminBorrar").style.display = "none";
        document.getElementById("modalAdminTools").style.display = "grid";
        return;
    }

    // J. Ejecutar Borrado Masivo utilizando el modal seguro
    if (target.closest("#btnAdminBorrarMasivo")) {
        solicitarClaveSegura("⚠️ DOBLE CANDADO: Ingresa la clave para vaciar toda la tabla:", async (claveSeguridad) => {
            if (!claveSeguridad) return;

            try {
                const resp = await fetch(API_URL, {
                    method: "DELETE",
                    headers: { 
                        "Content-Type": "application/json",
                        "x-admin-password": claveSeguridad 
                    }
                });
                const resultado = await resp.json();

                if (resultado.ok) {
                    window.registrosD1 = {};
                    alert("¡Se han borrado todos los registros exitosamente en el servidor!");
                    document.getElementById("modalAdminBorrar").style.display = "none";
                    if (typeof cargarPlaneacion === "function") {
                        cargarPlaneacion();
                    } else if (typeof aplicarFiltros === "function") {
                        aplicarFiltros();
                    }
                } else {
                    alert(resultado.error || "Clave incorrecta o error en el servidor.");
                }
            } catch (err) {
                console.error("Error:", err);
                alert("Ocurrió un error de red al intentar vaciar la tabla.");
            }
        });
        return;
    }

    // K. Ejecutar Borrado por OT Individual utilizando el modal seguro
    if (target.closest("#btnAdminBorrarOt")) {
        const inputOtBorrar = document.getElementById("adminInputOtBorrar");
        const otVal = inputOtBorrar ? inputOtBorrar.value.trim() : "";

        if (!otVal) {
            alert("Por favor ingresa el número de la OT que deseas eliminar.");
            return;
        }

        solicitarClaveSegura(`⚠️ Ingresa la clave para eliminar la OT ${otVal}:`, async (claveSeguridad) => {
            if (!claveSeguridad) return;

            try {
                const resp = await fetch(`${API_URL}?ot=${encodeURIComponent(otVal)}`, {
                    method: "DELETE",
                    headers: { 
                        "Content-Type": "application/json",
                        "x-admin-password": claveSeguridad
                    }
                });
                const resultado = await resp.json();

                if (resultado.ok) {
                    delete window.registrosD1[otVal];
                    if (typeof otsModificadasRecientemente !== "undefined") {
                        otsModificadasRecientemente.delete(otVal);
                    }

                    alert(`¡Éxito! La OT ${otVal} fue eliminada del servidor.`);
                    inputOtBorrar.value = "";
                    document.getElementById("modalAdminBorrar").style.display = "none";
                    
                    if (typeof cargarPlaneacion === "function") {
                        cargarPlaneacion();
                    } else if (typeof aplicarFiltros === "function") {
                        aplicarFiltros();
                    }
                } else {
                    alert(resultado.error || "Clave incorrecta o error al eliminar la OT.");
                }
            } catch (err) {
                console.error("Error:", err);
                alert("Ocurrió un error de red al intentar eliminar la OT.");
            }
        });
        return;
    }

    // L. Cargue masivo del Excel de Backlog hacia la tabla base_backlog
    const btnProcesar = target.closest("#btnProcesarBacklog");
    if (btnProcesar) {
        const fileInput = document.getElementById("inputExcelBacklog");
        const archivo = fileInput && fileInput.files[0] ? fileInput.files[0] : null;

        if (!archivo) {
            alert("Por favor selecciona un archivo Excel primero.");
            return;
        }

        const confirmar = window.confirm(`¿Estás seguro de procesar el archivo "${archivo.name}" para actualizar la base de backlog?`);
        if (!confirmar) return;

        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const primeraHojaName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[primeraHojaName];
                
                let todasLasFilas = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                todasLasFilas = todasLasFilas.filter(fila => {
                    const llave = String(fila["Llave"] || fila["ID"] || fila["ID MINTIC"] || "").trim();
                    return llave !== "";
                });

                if (todasLasFilas.length === 0) {
                    alert("El archivo Excel está vacío o no tiene un formato válido.");
                    return;
                }

                const modalBloqueo = document.createElement('div');
                modalBloqueo.id = "modalProgresoCargue";
                modalBloqueo.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;color:white;font-family:sans-serif;";
                modalBloqueo.innerHTML = `
                    <div style="background:white;color:#333;padding:35px;border-radius:14px;width:420px;text-align:center;box-shadow:0 15px 30px rgba(0,0,0,0.4);">
                        <h3 style="margin-bottom:10px;font-weight:bold;font-size:20px;color:#1e3a8a;">Sincronizando con servidor</h3>
                        <p id="textoProgreso" style="margin-bottom:15px;font-size:14px;color:#555;">Limpiando registros anteriores...</p>
                        <div style="width:100%;background:#e5e7eb;border-radius:999px;height:18px;overflow:hidden;margin-bottom:15px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);">
                            <div id="barraProgresoReal" style="width:0%;height:100%;background:#2563eb;transition:width 0.2s ease;"></div>
                        </div>
                        <p id="porcentajeTexto" style="font-weight:bold;color:#2563eb;font-size:18px;">0%</p>
                        <p style="margin-top:20px;font-size:12px;color:#dc2626;font-weight:600;line-height:1.4;">⚠️ Proceso crítico en curso.<br>No cierres ni recargues la página hasta finalizar.</p>
                    </div>
                `;
                document.body.appendChild(modalBloqueo);

                window.onbeforeunload = function() {
                    return "Hay una sincronización activa con la base de datos. Si sales ahora, se interrumpirá el proceso.";
                };

                try {
                    await fetch("https://planeacion-api.modulo-de-exclusiones.workers.dev/api/base-backlog", {
                        method: "DELETE",
                        headers: { "x-admin-password": "admin" }
                    });
                } catch (err) {
                    console.error("Aviso al vaciar tabla previa:", err);
                }

                let exitosos = 0;
                let errores = 0;
                const total = todasLasFilas.length;
                const tamanoLote = 10;

                for (let i = 0; i < total; i += tamanoLote) {
                    const lote = todasLasFilas.slice(i, i + tamanoLote);
                    
                    const promesas = lote.map(async (fila) => {
                        try {
                            const resp = await fetch("https://planeacion-api.modulo-de-exclusiones.workers.dev/api/base-backlog", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(fila)
                            });
                            const resultado = await resp.json();
                            if (resultado.ok) exitosos++;
                            else errores++;
                        } catch (err) {
                            errores++;
                        }
                    });

                    await Promise.all(promesas);

                    const procesados = Math.min(i + tamanoLote, total);
                    const porcentaje = Math.round((procesados / total) * 100);
                    
                    const barra = document.getElementById("barraProgresoReal");
                    const textoProg = document.getElementById("textoProgreso");
                    const textoPct = document.getElementById("porcentajeTexto");

                    if (barra) barra.style.width = porcentaje + "%";
                    if (textoProg) textoProg.innerText = `Procesando ${procesados} de ${total} registros...`;
                    if (textoPct) textoPct.innerText = porcentaje + "%";
                }

                window.onbeforeunload = null;
                if (modalBloqueo) document.body.removeChild(modalBloqueo);

                alert(`¡Sincronización finalizada con éxito!\n✅ Exitosos: ${exitosos}\n❌ Errores: ${errores}`);
                window.location.reload();

            } catch (err) {
                window.onbeforeunload = null;
                const modalActual = document.getElementById("modalProgresoCargue");
                if (modalActual) document.body.removeChild(modalActual);
                console.error("Error en cargue:", err);
                alert("Ocurrió un error crítico durante el cargue.");
                window.location.reload();
            }
        };

        reader.readAsArrayBuffer(archivo);
        return;
    }

    // M. Cargue masivo del Excel de Indicador Backlog hacia la tabla indicador_backlog
    const btnProcesarInd = target.closest("#btnProcesarIndBacklog");
    if (btnProcesarInd) {
        const fileInput = document.getElementById("inputExcelIndBacklog");
        const archivo = fileInput && fileInput.files[0] ? fileInput.files[0] : null;

        if (!archivo) {
            alert("Por favor selecciona un archivo Excel primero.");
            return;
        }

        const confirmar = window.confirm(`¿Estás seguro de procesar el archivo "${archivo.name}" para actualizar la tabla indicador_backlog?`);
        if (!confirmar) return;

        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const primeraHojaName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[primeraHojaName];
                
                let todasLasFilas = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                // Filtro dinámico compatible con tus encabezados ("Orden De Trabajo", "# OT", "OT")
                todasLasFilas = todasLasFilas.filter(fila => {
                    const llave = String(fila["Orden De Trabajo"] || fila["# OT"] || fila["OT"] || "").trim();
                    return llave !== "";
                });

                if (todasLasFilas.length === 0) {
                    alert("El archivo Excel está vacío o no tiene un formato válido.");
                    return;
                }

                const modalBloqueo = document.createElement('div');
                modalBloqueo.id = "modalProgresoCargueInd";
                modalBloqueo.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;color:white;font-family:sans-serif;";
                modalBloqueo.innerHTML = `
                    <div style="background:white;color:#333;padding:35px;border-radius:14px;width:420px;text-align:center;box-shadow:0 15px 30px rgba(0,0,0,0.4);">
                        <h3 style="margin-bottom:10px;font-weight:bold;font-size:20px;color:#475569;">Sincronizando Ind Backlog</h3>
                        <p id="textoProgresoInd" style="margin-bottom:15px;font-size:14px;color:#555;">Procesando registros...</p>
                        <div style="width:100%;background:#e5e7eb;border-radius:999px;height:18px;overflow:hidden;margin-bottom:15px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);">
                            <div id="barraProgresoRealInd" style="width:0%;height:100%;background:#475569;transition:width 0.2s ease;"></div>
                        </div>
                        <p id="porcentajeTextoInd" style="font-weight:bold;color:#475569;font-size:18px;">0%</p>
                        <p style="margin-top:20px;font-size:12px;color:#dc2626;font-weight:600;line-height:1.4;">⚠️ Proceso en curso.<br>No cierres ni recargues la página hasta finalizar.</p>
                    </div>
                `;
                document.body.appendChild(modalBloqueo);

                window.onbeforeunload = function() {
                    return "Hay una sincronización activa. Si sales ahora, se interrumpirá el proceso.";
                };

                let exitosos = 0;
                let errores = 0;
                const total = todasLasFilas.length;
                const tamanoLote = 10;

                for (let i = 0; i < total; i += tamanoLote) {
                    const lote = todasLasFilas.slice(i, i + tamanoLote);
                    
                    const promesas = lote.map(async (fila) => {
                        try {
                            const resp = await fetch("https://planeacion-api.modulo-de-exclusiones.workers.dev/api/indicador-backlog", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(fila)
                            });
                            const resultado = await resp.json();
                            if (resultado.ok) exitosos++;
                            else errores++;
                        } catch (err) {
                            errores++;
                        }
                    });

                    await Promise.all(promesas);

                    const procesados = Math.min(i + tamanoLote, total);
                    const porcentaje = Math.round((procesados / total) * 100);
                    
                    const barra = document.getElementById("barraProgresoRealInd");
                    const textoProg = document.getElementById("textoProgresoInd");
                    const textoPct = document.getElementById("porcentajeTextoInd");

                    if (barra) barra.style.width = porcentaje + "%";
                    if (textoProg) textoProg.innerText = `Procesando ${procesados} de ${total} registros...`;
                    if (textoPct) textoPct.innerText = porcentaje + "%";
                }

                window.onbeforeunload = null;
                if (modalBloqueo) document.body.removeChild(modalBloqueo);

                alert(`¡Cargue masivo de Indicador Backlog finalizado!\n✅ Exitosos: ${exitosos}\n❌ Errores: ${errores}`);
                window.location.reload();

            } catch (err) {
                window.onbeforeunload = null;
                const modalActual = document.getElementById("modalProgresoCargueInd");
                if (modalActual) document.body.removeChild(modalActual);
                console.error("Error en cargue:", err);
                alert("Ocurrió un error crítico durante el cargue de indicador.");
                window.location.reload();
            }
        };

        reader.readAsArrayBuffer(archivo);
        return;
    }

    // Botones para cerrar o confirmar el modal de clave segura
    if (target.closest("#cerrarModalClave, #btnCancelarClave")) {
        document.getElementById("modalClaveSegura").style.display = "none";
        callbackClaveSegura = null;
        return;
    }

    if (target.closest("#btnConfirmarClave")) {
        const input = document.getElementById("inputClaveSegura");
        const pass = input ? input.value.trim() : "";
        document.getElementById("modalClaveSegura").style.display = "none";
        
        if (typeof callbackClaveSegura === "function") {
            callbackClaveSegura(pass);
            callbackClaveSegura = null;
        }
        return;
    }
});

// Permitir presionar "Enter" en los campos de contraseña
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const modalPass = document.getElementById("modalAdminPassword");
        if (modalPass && modalPass.style.display === "grid") {
            const btnVerificar = document.getElementById("btnVerificarPassword");
            if (btnVerificar) btnVerificar.click();
        }

        const modalClave = document.getElementById("modalClaveSegura");
        if (modalClave && modalClave.style.display === "grid") {
            const btnConfirmar = document.getElementById("btnConfirmarClave");
            if (btnConfirmar) btnConfirmar.click();
        }
    }
});
