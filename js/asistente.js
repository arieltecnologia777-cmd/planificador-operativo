(function () {
    const URL_WORKER_GEMINI = "https://planeacion-api.modulo-de-exclusiones.workers.dev/api/gemini";

    // 1. Inyectar los estilos CSS del widget de chat
    const estilosChat = document.createElement('style');
    estilosChat.innerHTML = `
        .asistente-chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .asistente-btn-toggle {
            background: #2b6cb0;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 20px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background 0.2s;
        }
        .asistente-btn-toggle:hover {
            background: #2c5282;
        }
        .asistente-ventana {
            position: absolute;
            bottom: 60px;
            right: 0;
            width: 350px;
            height: 450px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            display: none;
            border: 1px solid #cbd5e0;
        }
        .asistente-ventana.activo {
            display: flex;
        }
        .asistente-header {
            background: #2b6cb0;
            color: white;
            padding: 12px 15px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .asistente-cerrar {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
        }
        .asistente-mensajes {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #f7fafc;
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-size: 0.9rem;
        }
        .asistente-msg {
            padding: 8px 12px;
            border-radius: 6px;
            max-width: 80%;
            line-height: 1.4;
            word-break: break-word;
        }
        .asistente-msg.usuario {
            background: #2b6cb0;
            color: white;
            align-self: flex-end;
        }
        .asistente-msg.ia {
            background: #e2e8f0;
            color: #2d3748;
            align-self: flex-start;
        }
        .asistente-input-box {
            display: flex;
            padding: 10px;
            background: white;
            border-top: 1px solid #e2e8f0;
        }
        .asistente-input-box input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #cbd5e0;
            border-radius: 4px;
            outline: none;
            font-size: 0.9rem;
        }
        .asistente-input-box button {
            background: #2b6cb0;
            color: white;
            border: none;
            padding: 8px 12px;
            margin-left: 6px;
            border-radius: 4px;
            cursor: pointer;
        }
        .asistente-input-box button:hover {
            background: #2c5282;
        }
    `;
    document.head.appendChild(estilosChat);

    // 2. Crear el HTML del widget de chat
    const contenedorWidget = document.createElement('div');
    contenedorWidget.className = 'asistente-chat-widget';
    contenedorWidget.innerHTML = `
        <button type="button" class="asistente-btn-toggle" id="btnToggleAsistente">
            🤖 Asistente Operativo
        </button>
        <div class="asistente-ventana" id="ventanaAsistente">
            <div class="asistente-header">
                <span>Asistente IA - Planeación</span>
                <button type="button" class="asistente-cerrar" id="btnCerrarAsistente">&times;</button>
            </div>
            <div class="asistente-mensajes" id="mensajesAsistente">
                <div class="asistente-msg ia">¡Hola! Ya estoy configurado con acciones web. ¿Qué deseas hacer hoy?</div>
            </div>
            <div class="asistente-input-box">
                <input type="text" id="inputPreguntaIA" placeholder="Escribe tu comando o consulta...">
                <button type="button" id="btnEnviarIA">Enviar</button>
            </div>
        </div>
    `;
    document.body.appendChild(contenedorWidget);

    // 3. Referencias del DOM
    const btnToggle = document.getElementById('btnToggleAsistente');
    const ventana = document.getElementById('ventanaAsistente');
    const btnCerrar = document.getElementById('btnCerrarAsistente');
    const btnEnviar = document.getElementById('btnEnviarIA');
    const inputPregunta = document.getElementById('inputPreguntaIA');
    const contenedorMensajes = document.getElementById('mensajesAsistente');

    btnToggle.addEventListener('click', () => {
        ventana.classList.toggle('activo');
        if (ventana.classList.contains('activo')) inputPregunta.focus();
    });

    btnCerrar.addEventListener('click', () => ventana.classList.remove('activo'));

    // --- MOTOR DE EJECUCIÓN DE ACCIONES (FUNCTION CALLING) ---
    function ejecutarAccionEnInterfaz(nombreAccion, parametros) {
        console.log("Ejecutando acción de IA:", nombreAccion, parametros);

        switch (nombreAccion) {
            case 'filtrarTecnico':
                // Aquí buscas tu input o selector de técnico en tu web y le asignas el valor
                const inputFiltroTecnico = document.querySelector('#filtroTecnico') || document.querySelector('input[name="tecnico"]');
                if (inputFiltroTecnico) {
                    inputFiltroTecnico.value = parametros.valor || '';
                    inputFiltroTecnico.dispatchEvent(new Event('input', { bubbles: true }));
                    inputFiltroTecnico.dispatchEvent(new Event('change', { bubbles: true }));
                    agregarMensaje(`✅ Filtrado aplicado por el técnico: ${parametros.valor}`, 'ia');
                } else {
                    agregarMensaje(`⚠️ No encontré el campo de filtro de técnico en la pantalla.`, 'ia');
                }
                break;

            case 'buscarOT':
                const inputBusqueda = document.querySelector('#buscadorOT') || document.querySelector('input[type="search"]');
                if (inputBusqueda) {
                    inputBusqueda.value = parametros.valor || '';
                    inputBusqueda.dispatchEvent(new Event('input', { bubbles: true }));
                    agregarMensaje(`✅ Buscando la OT: ${parametros.valor}`, 'ia');
                } else {
                    agregarMensaje(`⚠️ No encontré la barra de búsqueda en la pantalla.`, 'ia');
                }
                break;

            case 'limpiarFiltros':
                location.reload(); // Ejemplo básico para resetear vista
                break;

            default:
                agregarMensaje(`⚙️ Acción recibida: ${nombreAccion} (${JSON.stringify(parametros)})`, 'ia');
                break;
        }
    }

    async function enviarMensaje() {
        const texto = inputPregunta.value.trim();
        if (!texto) return;

        agregarMensaje(texto, 'usuario');
        inputPregunta.value = '';
        contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;

        const idCarga = agregarMensaje('Pensando y ejecutando...', 'ia');

        try {
            const respuesta = await fetch(URL_WORKER_GEMINI, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: texto })
            });

            const resultado = await respuesta.json();
            idCarga.remove();

            if (resultado.ok) {
                if (resultado.tipoRespuesta === 'accion') {
                    // ¡Aquí ocurre la magia de la Opción 2!
                    agregarMensaje(resultado.response, 'ia');
                    ejecutarAccionEnInterfaz(resultado.accion, resultado.parametros);
                } else {
                    agregarMensaje(resultado.response, 'ia');
                }
            } else {
                agregarMensaje('⚠️ Error: ' + (resultado.error || 'Desconocido'), 'ia');
            }
        } catch (error) {
            idCarga.remove();
            agregarMensaje('❌ Error de red al conectar con el servidor.', 'ia');
        }

        contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
    }

    function agregarMensaje(texto, tipo) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `asistente-msg ${tipo}`;
        msgDiv.textContent = texto;
        contenedorMensajes.appendChild(msgDiv);
        return msgDiv;
    }

    btnEnviar.addEventListener('click', enviarMensaje);
    inputPregunta.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') enviarMensaje();
    });

})();
