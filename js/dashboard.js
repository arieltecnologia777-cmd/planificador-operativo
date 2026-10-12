document.addEventListener("click", async (e) => {
    const btnAbrirConfig = e.target.closest("#btnAbrirConfig");
    if (btnAbrirConfig) {
        const modalPass = document.getElementById("modalAdminPassword");
        const inputPass = document.getElementById("inputAdminPassword");
        if (inputPass) inputPass.value = "";
        if (modalPass) modalPass.style.display = "flex";
        if (inputPass) inputPass.focus();
    }

    if (e.target.closest("#cerrarModalPassword") || e.target.closest("#btnCancelarPassword")) {
        const modalPass = document.getElementById("modalAdminPassword");
        if (modalPass) modalPass.style.display = "none";
    }

    if (e.target.closest("#cerrarModalTools") || e.target.closest("#btnCerrarTools")) {
        const modalTools = document.getElementById("modalAdminTools");
        if (modalTools) modalTools.style.display = "none";
    }

    const btnVerificar = e.target.closest("#btnVerificarPassword");
    if (btnVerificar) {
        const inputPass = document.getElementById("inputAdminPassword");
        const password = inputPass ? inputPass.value.trim() : "";

        if (!password) {
            alert("Por favor, ingresa la contraseña.");
            return;
        }

        try {
            const resp = await fetch("https://planeacion-api.modulo-de-exclusiones.workers.dev/api/verificar-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: password })
            });
            const data = await resp.json();

            if (data.ok === true) {
                const modalPass = document.getElementById("modalAdminPassword");
                const modalTools = document.getElementById("modalAdminTools");
                if (modalPass) modalPass.style.display = "none";
                if (modalTools) modalTools.style.display = "flex";

                const txtNotasDia = document.getElementById("txtNotasDia");
                const txtModalNotaDia = document.getElementById("txtModalNotaDia");
                if (txtModalNotaDia && txtNotasDia) {
                    txtModalNotaDia.value = txtNotasDia.value;
                }
            } else {
                alert("Contraseña incorrecta.");
            }
        } catch (err) {
            console.error("Error al verificar contraseña:", err);
            alert("Error de red al verificar la contraseña con el servidor.");
        }
    }

    const btnGuardarNota = e.target.closest("#btnGuardarNotaServidor");
    if (btnGuardarNota) {
        const txtModalNotaDia = document.getElementById("txtModalNotaDia");
        const nuevaNota = txtModalNotaDia ? txtModalNotaDia.value.trim() : "";

        try {
            const resp = await fetch("https://planeacion-api.modulo-de-exclusiones.workers.dev/api/notas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nota: nuevaNota })
            });
            const data = await resp.json();

            if (data.ok === true) {
                alert("¡Nota guardada y sincronizada con éxito!");
                const modalTools = document.getElementById("modalAdminTools");
                if (modalTools) modalTools.style.display = "none";
                cargarNotaDelDia();
            } else {
                alert("Error al guardar la nota en el servidor.");
            }
        } catch (err) {
            console.error("Error al guardar la nota:", err);
            alert("Error de red al intentar guardar la nota.");
        }
    }
});
