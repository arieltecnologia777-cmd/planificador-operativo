const API_BASE_URL = "https://planeacion-api.modulo-de-exclusiones.workers.dev/api";
const HISTORICO_DATA_URL = `${API_BASE_URL}/ots-completadas`;
const PLANEACION_URL = `${API_BASE_URL}/planeacion`;

let datosHistoricoGlobal = [];
let datosHistoricoFiltrados = [];

// Variables de estado para los filtros del histórico
let deptoHistSeleccionados = [];
let afecHistSeleccionadas = [];
let fechaHistSeleccionadas = [];
let ordenHistoricoColumna = null;
let ordenHistoricoAsc = true;

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
            reg.TecnicoAsignado || reg.tecnicoAsigned || "N/A",
            reg.Observacion || reg.observacion || "",
            reg.CreatedAt || reg.createdAt || ""
        ]);

        datosHistoricoFiltrados = datosHistoricoGlobal;
        actualizarOpcionesFiltrosHistorico();
        pintarTablaHistorico(datosHistoricoFiltrados);
    } catch (error) {
        console.error("❌ Error al cargar el histórico de OTs:", error);
    }
}

function pintarTablaHistorico(datos) {
    const tbody = document.getElementById("historicoBody");
    if (!tbody) return;

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 20px; color: #718096;">No hay registros que coincidan con los filtros.</td></tr>`;
        return;
    }

    tbody.innerHTML = datos.map((fila) => {
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

// Función de ordenamiento desde los filtros del histórico
window.ordenarHistoricoDesdeFiltro = function(campo, asc) {
    ordenHistoricoColumna = campo;
    ordenHistoricoAsc = asc;
    document.querySelectorAll(".multi-filtro-lista").forEach(l => l.classList.remove("show"));
    aplicarFiltrosHistorico();
};

function obtenerDatosBaseFiltroHistorial() {
    const filtroBusquedaEl = document.getElementById("filtroBusquedaHistorico");
    const texto = filtroBusquedaEl ? filtroBusquedaEl.value.toLowerCase() : "";

    return datosHistoricoGlobal.filter(fila => {
        return !texto || fila.some(celda => String(celda).toLowerCase().includes(texto));
    });
}

function actualizarOpcionesFiltrosHistorico() {
    const txtDepto = document.getElementById("txtDeptoHist");
    if (txtDepto) txtDepto.textContent = deptoHistSeleccionados.length ? `Departamento (${deptoHistSeleccionados.length})` : "Departamento";

    const txtAfec = document.getElementById("txtAfecHist");
    if (txtAfec) txtAfec.textContent = afecHistSeleccionadas.length ? `Afectación (${afecHistSeleccionadas.length})` : "Tipo de afectación";

    const txtFecha = document.getElementById("txtFechaHist");
    if (txtFecha) txtFecha.textContent = fechaHistSeleccionadas.length === 0 ? "Fecha de cierre" : (fechaHistSeleccionadas.length === 1 ? fechaHistSeleccionadas[0] : `Fecha (${fechaHistSeleccionadas.length})`);

    const datosBase = obtenerDatosBaseFiltroHistorial();

    const filtrarCascada = (excluir) => {
        return datosBase.filter(fila => {
            const deptoVal = fila[1];
            const afecVal = fila[5];
            const fechaVal = String(fila[9]).split('T')[0];

            if (excluir !== 'depto' && deptoHistSeleccionados.length > 0 && !deptoHistSeleccionados.includes(deptoVal)) return false;
            if (excluir !== 'afec' && afecHistSeleccionadas.length > 0 && !afecHistSeleccionadas.includes(afecVal)) return false;
            if (excluir !== 'fecha' && fechaHistSeleccionadas.length > 0 && !fechaHistSeleccionadas.includes(fechaVal)) return false;

            return true;
        });
    };

    const datosDepto = filtrarCascada('depto');
    const datosAfec = filtrarCascada('afec');
    const datosFecha = filtrarCascada('fecha');

    // 1. Renderizar Departamento
    const elDepto = document.getElementById("listaDeptoHist");
    if (elDepto) {
        const deptosDisp = [...new Set(datosDepto.map(f => f[1]))].filter(Boolean).sort();
        elDepto.innerHTML = `
            <div class="filtro-sort-container">
                <div class="filtro-sort-title">⇅ Ordenar</div>
                <div class="filtro-sort-header">
                    <span onclick="ordenarHistoricoDesdeFiltro('Departamento', true)">A-Z</span>
                    <span onclick="ordenarHistoricoDesdeFiltro('Departamento', false)">Z-A</span>
                </div>
            </div>
            <input type="text" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="limpiarDeptoHist">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="todosDeptoHist"> (Seleccionar todo)</label>
        ` + deptosDisp.map(d => `<label class="multi-filtro-item"><input type="checkbox" value="${d}" class="chkDeptoHist" ${deptoHistSeleccionados.includes(d) ? "checked" : ""}> ${d}</label>`).join("");
    }

    // 2. Renderizar Tipo de Afectación
    const elAfec = document.getElementById("listaAfecHist");
    if (elAfec) {
        const afecDisp = [...new Set(datosAfec.map(f => f[5]))].filter(Boolean).sort();
        elAfec.innerHTML = `
            <div class="filtro-sort-container">
                <div class="filtro-sort-title">⇅ Ordenar</div>
                <div class="filtro-sort-header">
                    <span onclick="ordenarHistoricoDesdeFiltro('Afectacion', true)">A-Z</span>
                    <span onclick="ordenarHistoricoDesdeFiltro('Afectacion', false)">Z-A</span>
                </div>
            </div>
            <input type="text" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="limpiarAfecHist">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="todosAfecHist"> (Seleccionar todo)</label>
        ` + afecDisp.map(a => `<label class="multi-filtro-item"><input type="checkbox" value="${a}" class="chkAfecHist" ${afecHistSeleccionadas.includes(a) ? "checked" : ""}> ${a}</label>`).join("");
    }

    // 3. Renderizar Fecha de Cierre Jerárquica
    const elFecha = document.getElementById("listaFechaHist");
    if (elFecha) {
        const mesesNombres = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        const arbolFechas = {};

        datosFecha.forEach(f => {
            const fechaStr = String(f[9]).split('T')[0];
            if (fechaStr && /^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
                const [anio, mes, dia] = fechaStr.split("-");
                if (!arbolFechas[anio]) arbolFechas[anio] = {};
                if (!arbolFechas[anio][mes]) arbolFechas[anio][mes] = [];
                if (!arbolFechas[anio][mes].includes(fechaStr)) {
                    arbolFechas[anio][mes].push(fechaStr);
                }
            }
        });

        let htmlJerarquico = `
            <div class="filtro-sort-container">
                <div class="filtro-sort-title">⇅ Ordenar</div>
                <div class="filtro-sort-header">
                    <span onclick="ordenarHistoricoDesdeFiltro('FechaCompletada', true)">Antiguas</span>
                    <span onclick="ordenarHistoricoDesdeFiltro('FechaCompletada', false)">Recientes</span>
                </div>
            </div>
            <input type="text" class="buscar-multifiltro" placeholder="Buscar fecha...">
            <div class="multi-filtro-reset" id="limpiarFechaHist">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="todosFechaHist"> (Seleccionar todo)</label>
        `;

        const aniosOrdenados = Object.keys(arbolFechas).sort();
        aniosOrdenados.forEach(anio => {
            htmlJerarquico += `
                <div class="filtro-grupo-anio-container">
                    <div class="filtro-grupo-anio" style="padding: 4px 5px; font-weight: bold; cursor: pointer; user-select: none;">📂 ${anio} ▾</div>
                    <div class="filtro-contenido-anio" style="display: block;">`;
            
            const mesesOrdenados = Object.keys(arbolFechas[anio]).sort();
            mesesOrdenados.forEach(mesIdx => {
                const nombreMes = mesesNombres[parseInt(mesIdx, 10) - 1] || mesIdx;
                htmlJerarquico += `
                        <div class="filtro-grupo-mes-container">
                            <div class="filtro-grupo-mes" style="padding: 3px 5px 3px 15px; font-weight: 600; color: #555; cursor: pointer; user-select: none;">📁 ${nombreMes} ▾</div>
                            <div class="filtro-contenido-mes" style="display: block;">`;
                
                const diasOrdenados = arbolFechas[anio][mesIdx].sort();
                diasOrdenados.forEach(fechaStr => {
                    const [, , dia] = fechaStr.split("-");
                    const estaChequeado = fechaHistSeleccionadas.includes(fechaStr) ? "checked" : "";
                    htmlJerarquico += `
                                <label class="multi-filtro-item" style="padding-left: 30px; display: block;">
                                    <input type="checkbox" value="${fechaStr}" class="chkFechaHist" ${estaChequeado}> ${dia} (${fechaStr})
                                </label>`;
                });
                htmlJerarquico += `</div></div>`;
            });
            htmlJerarquico += `</div></div>`;
        });
        elFecha.innerHTML = htmlJerarquico;
    }
}

function aplicarFiltrosHistorico() {
    const filtroBusquedaEl = document.getElementById("filtroBusquedaHistorico");
    const texto = filtroBusquedaEl ? filtroBusquedaEl.value.toLowerCase() : "";

    let resultado = datosHistoricoGlobal.filter(fila => {
        const deptoVal = fila[1];
        const afecVal = fila[5];
        const fechaVal = String(fila[9]).split('T')[0];

        const cumpleTexto = !texto || fila.some(celda => String(celda).toLowerCase().includes(texto));
        const cumpleDepto = deptoHistSeleccionados.length === 0 || deptoHistSeleccionados.includes(deptoVal);
        const cumpleAfec = afecHistSeleccionadas.length === 0 || afecHistSeleccionadas.includes(afecVal);
        const cumpleFecha = fechaHistSeleccionadas.length === 0 || fechaHistSeleccionadas.includes(fechaVal);

        return cumpleTexto && cumpleDepto && cumpleAfec && cumpleFecha;
    });

    if (ordenHistoricoColumna !== null) {
        resultado.sort((a, b) => {
            let valA = "", valB = "";
            if (ordenHistoricoColumna === "Departamento") { valA = a[1]; valB = b[1]; }
            else if (ordenHistoricoColumna === "Afectacion") { valA = a[5]; valB = b[5]; }
            else if (ordenHistoricoColumna === "FechaCompletada") { valA = a[9]; valB = b[9]; }

            return ordenHistoricoAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
    }

    datosHistoricoFiltrados = resultado;
    pintarTablaHistorico(datosHistoricoFiltrados);
    actualizarOpcionesFiltrosHistorico();
}

// Event Listeners unificados para los desplegables y filtros del histórico
document.addEventListener("click", (e) => {
    const target = e.target;

    // Abrir/Cerrar dropdowns
    const dropdowns = [
        { btn: "btnDeptoHist", lista: "listaDeptoHist" },
        { btn: "btnAfecHist", lista: "listaAfecHist" },
        { btn: "btnFechaHist", lista: "listaFechaHist" }
    ];

    dropdowns.forEach(item => {
        const bEl = document.getElementById(item.btn);
        const lEl = document.getElementById(item.lista);
        if (bEl && lEl) {
            if (bEl.contains(target)) {
                lEl.classList.toggle("show");
            } else if (!lEl.contains(target)) {
                lEl.classList.remove("show");
            }
        }
    });

    // Acordeones de fecha (Años y Meses)
    const headerAnio = target.closest(".filtro-grupo-anio");
    if (headerAnio) {
        const contenido = headerAnio.nextElementSibling;
        if (contenido) {
            const oculto = contenido.style.display === "none";
            contenido.style.display = oculto ? "block" : "none";
            headerAnio.textContent = headerAnio.textContent.replace(/[▾▴]/, oculto ? "▾" : "▴");
        }
        return;
    }

    const headerMes = target.closest(".filtro-grupo-mes");
    if (headerMes) {
        const contenido = headerMes.nextElementSibling;
        if (contenido) {
            const oculto = contenido.style.display === "none";
            contenido.style.display = oculto ? "block" : "none";
            headerMes.textContent = headerMes.textContent.replace(/[▾▴]/, oculto ? "▾" : "▴");
        }
        return;
    }

    // Botón Limpiar Filtros
    if (target.id === "btnLimpiarFiltrosHist" || target.closest("#btnLimpiarFiltrosHist")) {
        deptoHistSeleccionados = [];
        afecHistSeleccionadas = [];
        fechaHistSeleccionadas = [];
        ordenHistoricoColumna = null;
        ordenHistoricoAsc = true;
        if (document.getElementById("filtroBusquedaHistorico")) {
            document.getElementById("filtroBusquedaHistorico").value = "";
        }
        aplicarFiltrosHistorico();
        return;
    }

    // Borrar filtro individual
    if (target.id === "limpiarDeptoHist") {
        deptoHistSeleccionados = [];
        aplicarFiltrosHistorico();
    }
    if (target.id === "limpiarAfecHist") {
        afecHistSeleccionadas = [];
        aplicarFiltrosHistorico();
    }
    if (target.id === "limpiarFechaHist") {
        fechaHistSeleccionadas = [];
        aplicarFiltrosHistorico();
    }
});

// Manejo de checkboxes y búsqueda interna en los menús desplegables
document.addEventListener("change", (e) => {
    const target = e.target;

    if (target.classList.contains("chkDeptoHist")) {
        deptoHistSeleccionados = Array.from(document.querySelectorAll(".chkDeptoHist:checked")).map(i => i.value);
        aplicarFiltrosHistorico();
    }
    if (target.id === "todosDeptoHist") {
        document.querySelectorAll(".chkDeptoHist").forEach(chk => chk.checked = target.checked);
        deptoHistSeleccionados = Array.from(document.querySelectorAll(".chkDeptoHist:checked")).map(i => i.value);
        aplicarFiltrosHistorico();
    }

    if (target.classList.contains("chkAfecHist")) {
        afecHistSeleccionadas = Array.from(document.querySelectorAll(".chkAfecHist:checked")).map(i => i.value);
        aplicarFiltrosHistorico();
    }
    if (target.id === "todosAfecHist") {
        document.querySelectorAll(".chkAfecHist").forEach(chk => chk.checked = target.checked);
        afecHistSeleccionadas = Array.from(document.querySelectorAll(".chkAfecHist:checked")).map(i => i.value);
        aplicarFiltrosHistorico();
    }

    if (target.classList.contains("chkFechaHist")) {
        fechaHistSeleccionadas = Array.from(document.querySelectorAll(".chkFechaHist:checked")).map(i => i.value);
        aplicarFiltrosHistorico();
    }
    if (target.id === "todosFechaHist") {
        document.querySelectorAll(".chkFechaHist").forEach(chk => chk.checked = target.checked);
        fechaHistSeleccionadas = Array.from(document.querySelectorAll(".chkFechaHist:checked")).map(i => i.value);
        aplicarFiltrosHistorico();
    }
});

document.addEventListener("input", (e) => {
    if (e.target.id === "filtroBusquedaHistorico") {
        aplicarFiltrosHistorico();
    }
    if (e.target.classList && e.target.classList.contains("buscar-multifiltro")) {
        const textoBusq = e.target.value.toLowerCase();
        const contenedor = e.target.closest("div");
        if (contenedor) {
            contenedor.querySelectorAll(".multi-filtro-item").forEach(item => {
                const contenido = item.textContent.toLowerCase();
                item.style.display = contenido.includes(textoBusq) ? "" : "none";
            });
        }
    }
});

// Función de exportación con fecha limpia (DD-MM-AAAA)
window.exportarHistoricoOTs = function() {
    try {
        if (!datosHistoricoFiltrados || datosHistoricoFiltrados.length === 0) {
            alert("No hay registros en el histórico para exportar.");
            return;
        }

        const headers = [
            "ID", "Departamento", "Municipio", "IM", "OT", 
            "Afectación", "Estado Gestión", "Técnico Asignado", 
            "Observación", "Fecha Completada"
        ];

        const dataAOA = [headers];

        datosHistoricoFiltrados.forEach(fila => {
            dataAOA.push([
                fila[0], fila[1], fila[2], fila[3], fila[4],
                fila[5], fila[6], fila[7], fila[8], fila[9]
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(dataAOA);

        if (ws && ws['!ref']) {
            ws['!autofilter'] = { ref: ws['!ref'] };
            ws['!freeze'] = { xSplit: 0, ySplit: 1 };
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Historico_OTs_Completadas");

        const ahora = new Date();
        const dia = String(ahora.getDate()).padStart(2, '0');
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const anio = ahora.getFullYear();
        const timestamp = `${dia}-${mes}-${anio}`;

        XLSX.writeFile(wb, `Historico_OTs_Completadas_${timestamp}.xlsx`);

    } catch (error) {
        console.error("❌ Error al exportar el histórico:", error);
        alert("Ocurrió un error al exportar el archivo de histórico.");
    }
};

document.addEventListener("DOMContentLoaded", cargarHistorico);
