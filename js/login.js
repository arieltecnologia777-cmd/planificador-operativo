const API_URL = "https://facturacion.modulo-de-exclusiones.workers.dev/api/login";

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cedula = document.getElementById('cedula').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('errorMsg');
    errorDiv.style.display = 'none';

    try {
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cedula, password })
        });
        const data = await resp.json();

        if (data.ok) {
            localStorage.setItem('tecnicoLogueado', data.nombre_tecnico);
            window.location.href = 'portal-tecnicos.html';
        } else {
            errorDiv.textContent = data.error || "Credenciales inválidas";
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        errorDiv.textContent = "Error de conexión con el servidor";
        errorDiv.style.display = 'block';
    }
});
