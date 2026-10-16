const API_BASE_URL = "https://planeacion-api.modulo-de-exclusiones.workers.dev/api";
const HISTORICO_DATA_URL = `${API_BASE_URL}/ots-completadas`;
const PLANEACION_URL = `${API_BASE_URL}/planeacion`;

let datosHistoricoGlobal = [];
let encabezadosHistorico = [
    "ID", "Departamento", "Municipio", "IM", "OT", "Afectación", 
    "Estado Gestión", "Técnico Asignado", "Observación", "Fecha Completada", "Acciones"
];

async function cargarHistorico() {
    try {
        const resp = await fetch(HISTORICO_DATA_URL);
        const data = await resp.json();

        let listaRegistros = [];
        if (Array.isArray(data)) {
            listaRegistros = data;
        } else if (data && typeof data === 'object') {
            listaRegistros = Object.values(data);
        }

        datosHistoricoGlobal = listaRegistros.map(reg => [
            reg.ID || reg.idOriginal || "",
            reg.Departamento || reg.departamento || "",
            reg.Municipio || reg.municipio || "",
            reg.IM || reg.im || "",
            reg.OT || reg.ot || "",
            reg.Afectacion || reg.afectacion || "",
            reg.EstadoGestion || reg.estadoGestion || "Operativa",
            reg.TecnicoAsignado || reg.tecnicoAsigned || "",
            reg.Observacion || reg.observacion || "",
            reg.CreatedAt || reg.createdAt || ""
        ]);

        pintarTablaHistorico(datosHistoricoGlobal);
    } catch (error) {
        console.error("❌ Error al cargar el histórico de OTs:", error);
    }
}

function pintarTablaHistorico(datos) {
    const tbody = document.getElementById("historicoBody");
    if (!tbody) return;

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 20px; color: #718096;">No hay OTs completadas en el histórico.</td></tr>`;
        return;
    }

    tbody.innerHTML = datos.map((fila, index) => {
        const otVal = fila[4];
        return `
        <tr>
            <td>${fila[0]}</td>
            <td>${fila[1]}</td>
            <td>${fila[2]}</td>
            <td>${fila[3]}</td>
            <td><b>${otVal}</b></td>
            <td>${fila[5]}</td>
            <td><span class="badge-existente" style="background-color: #c6f6d5; color: #22543d;">${fila[6]}</span></td>
            <td>${fila[7]}</td>
            <td>${fila[8]}</td>
            <td>${fila[9]}</td>
            <td style="text-align: center;">
                <button type="button" class="btn-reabrir-ot" data-ot="${otVal}" title="Regresar esta OT al flujo activo de planeación" style="background: #3182ce; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                    🔄 Reabrir / Regresar
                </button>
            </td>
        </tr>`;
    }).join("");
}

// Lógica para regresar la OT al flujo activo (Reabrir)
document.addEventListener("click", async (e) => {
    const btnReabrir = e.target.closest(".btn-reabrir-ot");
    if (!btnReabrir) return;

    const ot = btnReabrir.getAttribute("data-ot");
    if (!confirm(`¿Estás seguro de regresar la OT ${ot} al flujo activo de planeación? Se eliminará del histórico.`)) {
        return;
    }

    try {
        // 1. Insertamos de nuevo la OT en la tabla planeacion activa con estado por definir
        const payloadPlaneacion = {
            ot: ot,
            estadoProgramacion: "",
            fechaProgramacion: "",
            observacion: "Reabierta desde el histórico de completadas",
            estadoGestion: "",
            tecnicoAsigned: "",
            acompanamiento: ""
        };

        await fetch(PLANEACION_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadPlaneacion)
        });

        // 2. Eliminamos el registro de la tabla ots_completadas usando una petición DELETE en el backend (o la ruta correspondiente)
        // Como aún no tenemos una ruta DELETE directa para ots-completadas, la agregaremos en el Worker en un segundo.
        const respDelete = await fetch(`${HISTORICO_DATA_URL}?ot=${encodeURIComponent(ot)}`, {
            method: "DELETE"
        });
        const resJson = await respDelete.json();

        if (resJson.ok) {
            alert(`¡OT ${ot} reabierta con éxito y devuelta a planeación!`);
            cargarHistorico(); // Recargamos la tabla
        } else {
            alert("Hubo un problema al retirar la OT del histórico.");
        }

    } catch (err) {
        console.error("Error al reabrir la OT:", err);
        alert("Ocurrió un error de red al intentar reabrir la OT.");
    }
});

// Buscador en tiempo real dentro del histórico
document.addEventListener("input", (e) => {
    if (e.target.id === "filtroBusquedaHistorico") {
        const texto = e.target.value.toLowerCase();
        const filtrados = datosHistoricoGlobal.filter(fila => 
            fila.some(celda => String(celda).toLowerCase().includes(texto))
        );
        pintarTablaHistorico(filtrados);
    }
});
window.exportarHistoricoOTs = function() {
    try {
        // Obtenemos los datos actuales de la tabla de completadas
        const filasTabla = document.querySelectorAll("#historicoBody tr"); // Ajusta el selector según el id de tu tbody
        
        if (!filasTabla || filasTabla.length === 0) {
            alert("No hay registros en el histórico para exportar.");
            return;
        }

        const headers = [
            "ID", "Departamento", "Municipio", "IM", "OT", 
            "Afectación", "Estado Gestión", "Técnico Asignado", 
            "Observación", "Fecha Completada"
        ];

        const dataAOA = [headers];

        filasTabla.forEach(fila => {
            const celdas = fila.querySelectorAll("td");
            if (celdas.length >= 10) {
                dataAOA.push([
                    celdas[0].textContent.trim(),
                    celdas[1].textContent.trim(),
                    celdas[2].textContent.trim(),
                    celdas[3].textContent.trim(),
                    celdas[4].textContent.trim(),
                    celdas[5].textContent.trim(),
                    celdas[6].textContent.trim(),
                    celdas[7].textContent.trim(),
                    celdas[8].textContent.trim(),
                    celdas[9].textContent.trim()
                ]);
            }
        });

        // Creamos la hoja de Excel con SheetJS
        const ws = XLSX.utils.aoa_to_sheet(dataAOA);

        if (ws && ws['!ref']) {
            ws['!autofilter'] = { ref: ws['!ref'] };
            ws['!freeze'] = { xSplit: 0, ySplit: 1 };
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Historico_OTs_Completadas");

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        XLSX.writeFile(wb, `Historico_OTs_Completadas_${timestamp}.xlsx`);

    } catch (error) {
        console.error("❌ Error al exportar el histórico:", error);
        alert("Ocurrió un error al exportar el archivo de histórico.");
    }
};

document.addEventListener("DOMContentLoaded", cargarHistorico);
