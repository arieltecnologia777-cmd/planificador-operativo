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

document.addEventListener("click", async (e) => {
    // Evita doble ejecución si el evento se propaga rápidamente o hay scripts duplicados
    if (ejecutandoClickGlobal) return;
    ejecutandoClickGlobal = true;
    setTimeout(() => { ejecutandoClickGlobal = false; }, 100);

    const target = e.target;

    // 1. Clic en el botón del sidebar "Herramientas Avanzadas" -> Abre modal de contraseña
    if (target.closest("#btnAbrirConfig")) {
        const modalPass = document.getElementById("modalAdminPassword");
        const inputPass = document.getElementById("inputAdminPassword");
        if (inputPass) inputPass.value = "";
        if (modalPass) modalPass.style.display = "grid";
        if (inputPass) inputPass.focus();
        return;
    }

    // 2. Botones para cerrar el modal de contraseña inicial
    if (target.closest("#cerrarModalPassword, #btnCancelarPassword")) {
        document.getElementById("modalAdminPassword").style.display = "none";
        return;
    }

    // 3. Verificar contraseña estrictamente contra Cloudflare Worker
    if (target.closest("#btnVerificarPassword")) {
        const inputPass = document.getElementById("inputAdminPassword");
        const pass = inputPass ? inputPass.value.trim() : "";

        if (!pass) {
            alert("Por favor ingresa la contraseña.");
            return;
        }

        try {
            const resp = await fetch(`${API_URL}/verificar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: pass })
            });
            const resultado = await resp.json();

            if (resultado.ok) {
                document.getElementById("modalAdminPassword").style.display = "none";
                document.getElementById("modalAdminTools").style.display = "grid";
                if (inputPass) inputPass.value = "";
            } else {
                alert("Contraseña incorrecta.");
                inputPass.value = "";
                inputPass.focus();
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Error de red al verificar la contraseña con el servidor.");
            inputPass.value = "";
            inputPass.focus();
        }
        return;
    }

    // 4. Cerrar el menú de herramientas
    if (target.closest("#cerrarModalTools, #btnCerrarTools")) {
        document.getElementById("modalAdminTools").style.display = "none";
        return;
    }

    // 5. Desde el menú de herramientas, seleccionar "Forzar Fecha OT"
    if (target.closest("#btnAbrirForzarFecha")) {
        document.getElementById("modalAdminTools").style.display = "none";
        document.getElementById("modalAdminFecha").style.display = "grid";
        return;
    }

    // 6. Volver del modal de fecha al menú de herramientas
    if (target.closest("#btnVolverTools, #cerrarModalAdmin")) {
        document.getElementById("modalAdminFecha").style.display = "none";
        document.getElementById("modalAdminTools").style.display = "grid";
        return;
    }

    // 7. Guardar la nueva fecha forzada para la OT en el servidor
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

    // 8. Desde el menú de herramientas, abrir la sección de borrado (Eliminar Data)
    if (target.closest("#btnAbrirBorrarData")) {
        document.getElementById("modalAdminTools").style.display = "none";
        document.getElementById("modalAdminBorrar").style.display = "grid";
        return;
    }

    // 9. Volver del modal de borrado al menú de herramientas
    if (target.closest("#btnVolverToolsBorrar, #cerrarModalBorrar")) {
        document.getElementById("modalAdminBorrar").style.display = "none";
        document.getElementById("modalAdminTools").style.display = "grid";
        return;
    }

    // 10. Ejecutar Borrado Masivo utilizando el modal seguro con puntos ocultos
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

    // 11. Ejecutar Borrado por OT Individual utilizando el modal seguro con puntos ocultos
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
                    
                    // Forzar recarga completa para que desaparezca de la tabla
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
