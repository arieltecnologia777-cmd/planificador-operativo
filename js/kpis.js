document.addEventListener("DOMContentLoaded", () => {
    // Control para colapsar/expandir el sidebar con el mismo comportamiento del proyecto
    document.addEventListener("click", (e) => {
        const btnToggle = e.target.closest("#btnToggleSidebar");
        if (btnToggle) {
            document.body.classList.toggle("sidebar-colapsado");
        }
    });

    console.log("Módulo de KPIs inicializado correctamente.");
});
