const API_BASE_URL = "https://planeacion-api.modulo-de-exclusiones.workers.dev/api";
const WORKER_DATA_URL = `${API_BASE_URL}/base-backlog`;
const API_URL = `${API_BASE_URL}/planeacion`;

let datosGlobal = [];
let encabezadosGlobal = [];
window.registrosD1 = {};

let datosFiltradosGlobal = [];
let nuevosSeleccionados = [];
let departamentosSeleccionados = [];
let afectacionesSeleccionadas = [];
let stoppersSeleccionados = [];
let rangosSeleccionados = [];
let diasOtSeleccionados = [];
let fechasProgSeleccionadas = [];
let backlogSeleccionados = [];
let estadoOTSeleccionados = [];
let estadosGestionSeleccionados = [];
let kpiFiltroActivo = null;
let grupoColumnasColapsado = false;

let ordenActualColumna = null;
let ordenDireccionAsc = true;

let otsModificadasRecientemente = new Set();

const styleGrupoExcel = document.createElement('style');
styleGrupoExcel.innerHTML = `
    .col-grupo-oculta {
        display: none !important;
    }
    .btn-excel-grupo {
        background: #2b6cb0;
        color: #ffffff;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        padding: 1px 6px;
        font-weight: bold;
        font-size: 0.75rem;
        margin-right: 6px;
        transition: background 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: middle;
        line-height: 1;
    }
    .btn-excel-grupo:hover {
        background: #2c5282;
    }
    .badge-nuevo {
        background-color: #48bb78;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: bold;
        display: inline-block;
        text-align: center;
    }
    .badge-existente {
        background-color: #e2e8f0;
        color: #4a5568;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        display: inline-block;
        text-align: center;
    }
    .filtro-sort-container {
        padding: 4px 6px 6px 6px;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 6px;
        background: #f8fafc;
        border-radius: 3px;
    }
    .filtro-sort-title {
        font-size: 0.7rem;
        font-weight: bold;
        color: #4a5568;
        margin-bottom: 3px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .filtro-sort-header {
        display: flex;
        justify-content: space-around;
        font-size: 0.75rem;
    }
    .filtro-sort-header span {
        color: #2b6cb0;
        cursor: pointer;
        font-weight: 600;
    }
    .filtro-sort-header span:hover {
        text-decoration: underline;
    }
    
    .planeacion-table tr th {
        position: sticky !important;
        top: 0px !important;
        background-color: #f1f5f9 !important;
        z-index: 20 !important;
        user-select: none;
    }

    .planeacion-table tr th:nth-child(1),
    .planeacion-table tr th:nth-child(2),
    .planeacion-table tr th:nth-child(3) {
        position: sticky !important;
        top: 0px !important;
        z-index: 50 !important;
        background-color: #f1f5f9 !important;
    }

    .table-resizer {
        position: absolute;
        top: 0;
        right: 0;
        width: 8px;
        cursor: col-resize;
        user-select: none;
        z-index: 55;
        height: 100%;
    }
    .table-resizer:hover, .table-resizer.resizing {
        background-color: #3182ce;
    }
`;
document.head.appendChild(styleGrupoExcel);

const TECNICOS = [
    "ABNER ALBERTO ARIAS PEREZ", "ALVARO DE JESUS PEÑALOZA CASTILLEJO", "ALVARO ENRIQUE LAMBRAÑO MUÑOZ",
    "ALVARO JOSE MEDINA MENDOZA", "ALVARO ROJAS MISAS", "ANDERSON JOSE CANCINO ESPITIA",
    "ANDRES DAVID MONTES HERRERA", "ANDRES SANTIAGO JARAMILLO MESA", "ARMANDO JOSE DE LUQUE BARROS",
    "BREINER ANTONIO MAGDANIEL GARIZABAL", "CAMILO ANDRES SALAZAR BARBOSA", "CAMILO ANTONIO ORTEGA DIAZ",
    "CARLOS ADRIAN OROZCO PINZON", "CARLOS ANDRES ROLDAN CORREA", "CARLOS JULIO MOGOLLON LOBO",
    "CARLOS MARIO SANCHEZ BRITO", "CRISTIAN JOSE HERNANDEZ GARCIA", "DANIEL ANDRES ARRIETA YEPES",
    "DANILO JOSE ROMERO RINCON", "DEWIN LEONARDO TAPIA MONTALVO", "DIEGO ALEJANDRO PELAEZ GUTIERREZ",
    "DIEGO AMETH SALAZAR OVIEDO", "DIEGO ARMANDO CORREA CHITIVA", "DIEGO ARMANDO QUINTERO BADILLO",
    "EDER ALEXANDER GONZALEZ GONZALEZ", "EDUAR ARMANDO QUINCHIA GOMEZ", "EDUARDO ADOLFO PRETEL MORALES",
    "EIDER RAFAEL QUINTERO CUELLO", "ELGER LUIS HERNANDEZ RUIZ", "ELIAN DAVID RODRIGUEZ BUELVAS",
    "ELIAN MAURICIO MIER DURAN", "ELIAN QUINTERO ROZO", "EVER MANUEL MERCADO YANCE",
    "FABIAN FERNANDEZ CONTRERERAS", "HAILEN JULIO CHARRY DE AVILA", "HARDY WHITAKER HOWARD",
    "HAROLD ANTONIO RAMOS VELILLA", "HUMBERTO RAFAEL DEECHE OROZCO", "ILDE ALBEIRO SALAZAR OSSA",
    "ISAAC DAVID BARON CARDENAS", "ISAAC DAVID CAMELO ARRIETA", "JADER ARLEY ROJAS CESPEDES",
    "JEAN CARLOS GUERRA SAAH", "JHON ANTONY PARADA LOBO", "JHON CARLOS FRAGOZO MORALES",
    "JORGE GUTIERREZ BERNIER JOSE", "JORGE LUIS MURILLO AGUIRRE", "JOSE DAVID MENDOZA PINTO",
    "JOSE MIGUEL EPIAYU IPUANA", "JOSEPH DANIEL DURAN COBO", "JUAN ANDRES ANGEL GOMEZ",
    "JUAN CAMILO RODRIGUEZ LOPERA", "JUAN DAVID SUAREZ LOPERA", "JUAN DAVID TORO GIRALDO",
    "JUAN JOSE SUAREZ JARAMILLO", "JUAN MANUEL TORRES HERNANDEZ", "KEVIN RENE LONDOÑO QUINTERO",
    "LEONARDO ANDRES SOLANO POLO", "LUCIANO DAVID HERNANDEZ MORALES", "LUIS ANTONIO SANCHEZ ARIAS",
    "LUIS DAVID PEDROZO FERNANDEZ", "MAIRON CANTERO JIMENEZ", "MANUEL ALBERTO RODRIGUEZ BUELVAS",
    "MANUEL ENRIQUE BARROS PEREZ", "MANUEL ENRIQUE OVIEDO TRESPALACIOS", "MARCOS ANTONIO RIASCOS LUNA",
    "MIGUEL ANGEL AGREDO MONTOYA", "NALDO GABRIEL RINCÓN RINCÓN", "OSMAN DANIEL GRANADILLO ALVAREZ",
    "RAVER ARANIS GAMEZ RODRIGUEZ", "RICHARD RICARDO GAMEZ MOLINA", "ROBIN ROJAS JIMENEZ",
    "SAMMY ELIUD VARGAS SIERRA", "SAMUEL PUSHAINA PUSHAINA", "SAYDER FRANCISCO RODRIGUEZ BARLIZA",
    "SILVIO ALBERTO SIERRA MENESES", "YAIR ANDRES DIAZ POLO", "YESID ADOLFO VALLEJO CABRERA",
    "YESITH RANGEL PADILLA", "YORMAN DAVID DUQUE GUERRA"
];

function esCasoNuevo(otVal) {
    const reg = (window.registrosD1 || {})[otVal];
    if (!reg) return true;
    if (!reg.createdAt) return false;
    const fechaCreacionD1 = String(reg.createdAt).split('T')[0];
    const hoy = new Date().toLocaleDateString('en-CA');
    return fechaCreacionD1 === hoy;
}

function inicializarBotonAgruparColumnas() {
    const ths = document.querySelectorAll(".planeacion-table th");
    if (ths.length > 12) {
        const thEstadoProg = ths[12]; 
        let btn = thEstadoProg.querySelector(".btn-excel-grupo");
        if (!btn) {
            btn = document.createElement("button");
            btn.type = "button";
            btn.className = "btn-excel-grupo";
            btn.id = "btnToggleGrupoCols";
            thEstadoProg.insertBefore(btn, thEstadoProg.firstChild);
        }
        btn.textContent = grupoColumnasColapsado ? "+" : "-";
        btn.title = grupoColumnasColapsado ? "Expandir columnas agrupadas" : "Ocultar/Agrupar columnas";
    }
}

function inicializarRedimensionamientoColumnas() {
    const ths = document.querySelectorAll(".planeacion-table th");
    ths.forEach((th, index) => {
        if (th.querySelector('.table-resizer')) return; 
        const resizer = document.createElement('div');
        resizer.className = 'table-resizer';
        th.appendChild(resizer);

        let x = 0;
        let w = 0;

        resizer.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            x = e.clientX;
            w = th.offsetWidth;
            resizer.classList.add('resizing');

            function mouseMoveHandler(e) {
                const dx = e.clientX - x;
                const nuevoAncho = Math.max(50, w + dx);
                th.style.width = `${nuevoAncho}px`;
                th.style.minWidth = `${nuevoAncho}px`;
                th.style.maxWidth = `${nuevoAncho}px`;

                const filas = document.querySelectorAll(".planeacion-table tbody tr");
                filas.forEach(fila => {
                    const celda = fila.children[index];
                    if (celda) {
                        celda.style.width = `${nuevoAncho}px`;
                        celda.style.minWidth = `${nuevoAncho}px`;
                        celda.style.maxWidth = `${nuevoAncho}px`;
                    }
                });
            }

            function mouseUpHandler() {
                resizer.classList.remove('resizing');
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            }

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
    });
}

function aplicarEstadoGrupoColumnas() {
    const ths = document.querySelectorAll(".planeacion-table th");
    const filas = document.querySelectorAll(".planeacion-table tbody tr");
    const indicesGrupo = [7, 8, 9, 10, 11];

    indicesGrupo.forEach(idx => {
        if (ths[idx]) {
            if (grupoColumnasColapsado) ths[idx].classList.add("col-grupo-oculta");
            else ths[idx].classList.remove("col-grupo-oculta");
        }
    });

    filas.forEach(fila => {
        const celdas = fila.children;
        indicesGrupo.forEach(idx => {
            if (celdas[idx]) {
                if (grupoColumnasColapsado) celdas[idx].classList.add("col-grupo-oculta");
                else celdas[idx].classList.remove("col-grupo-oculta");
            }
        });
    });

    const btn = document.getElementById("btnToggleGrupoCols");
    if (btn) {
        btn.textContent = grupoColumnasColapsado ? "+" : "-";
        btn.title = grupoColumnasColapsado ? "Expandir columnas agrupadas" : "Ocultar/Agrupar columnas";
    }
}

window.ordenarDesdeFiltro = function(campo, asc) {
    ordenActualColumna = campo;
    ordenDireccionAsc = asc;
    document.querySelectorAll(".multi-filtro-lista").forEach(l => l.classList.remove("show"));
    aplicarFiltros();
};

function buscarIndiceColumnaFlexible(encabezados, terminos) {
    for (let term of terminos) {
        const idx = encabezados.findIndex(h => h.trim().toLowerCase().includes(term.toLowerCase()));
        if (idx !== -1) return idx;
    }
    return -1;
}

function pintarTabla(datos){
    const planeacionBody = document.getElementById("planeacionBody");
    if (!planeacionBody) return;

    planeacionBody.innerHTML = datos.map(fila => {
        const otVal = String(fila[4] || "").trim();
        const d1 = (window.registrosD1 || {})[otVal] || {};

        const nuevo = esCasoNuevo(otVal);
        const htmlBadgeNuevo = nuevo ? `<span class="badge-nuevo">Sí</span>` : `<span class="badge-existente">No</span>`;

        let fechaTipo = "text";
        let fechaDisabled = "disabled";
        let fechaValor = d1.fechaProgramacion || "⟵ Definir estado";

        if (d1.estadoProgramacion === "Programada" || d1.estadoProgramacion === "Cancelada" || d1.estadoProgramacion === "Operativa") {
            fechaTipo = "date";
            fechaDisabled = "";
            fechaValor = d1.fechaProgramacion || "";
        } else if (d1.estadoProgramacion === "Pendiente") {
            fechaValor = "En validación";
        } else if (d1.estadoProgramacion === "N/A" || d1.estadoProgramacion === "Postular FM" || d1.estadoProgramacion === "Postular abast.") {
            fechaValor = "No aplica";
        }

        const ocultarClase = grupoColumnasColapsado ? "col-grupo-oculta" : "";

        return `
        <tr>
            <td>${fila[0] !== undefined ? fila[0] : ""}</td>
            <td>${fila[1] !== undefined ? fila[1] : ""}</td>
            <td>${fila[2] !== undefined ? fila[2] : ""}</td>
            <td>${fila[3] !== undefined ? fila[3] : ""}</td>
            <td>${fila[4] !== undefined ? fila[4] : ""}</td>
            <td>${fila[5] !== undefined ? fila[5] : ""}</td>
            <td style="text-align: center; background-color: #f7fafc;">${htmlBadgeNuevo}</td>
            <td class="${ocultarClase}">${fila[7] !== undefined ? fila[7] : ""}</td>
            <td class="${ocultarClase}">${fila[8] !== undefined ? fila[8] : ""}</td>
            <td class="${ocultarClase}">${fila[9] !== undefined ? fila[9] : ""}</td>
            <td class="${ocultarClase}">${fila[10] !== undefined ? fila[10] : ""}</td>
            <td class="${ocultarClase}">${fila[11] !== undefined ? fila[11] : ""}</td>
            <td>
                <select class="edit-select estado-programacion">
                    <option value=""></option>
                    <option value="Programada" ${d1.estadoProgramacion === "Programada" ? "selected" : ""}>Programada</option>
                    <option value="Operativa" ${d1.estadoProgramacion === "Operativa" ? "selected" : ""}>Operativa</option>
                    <option value="Pendiente" ${d1.estadoProgramacion === "Pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="N/A" ${d1.estadoProgramacion === "N/A" ? "selected" : ""}>N/A</option>
                    <option value="Postular FM" ${d1.estadoProgramacion === "Postular FM" ? "selected" : ""}>Postular FM</option>
                    <option value="Postular abast." ${d1.estadoProgramacion === "Postular abast." ? "selected" : ""}>Postular abast.</option>
                    <option value="Cancelada" ${d1.estadoProgramacion === "Cancelada" ? "selected" : ""}>Cancelada</option>
                </select>
            </td>
            <td>
                <input class="edit-input fecha-input" type="${fechaTipo}" value="${fechaValor}" ${fechaDisabled}>
            </td>
            <td>
                <div class="observacion-container">
                    <div class="obs-edit-wrapper">
                        <input class="edit-input observacion" value="${(d1.observacion || fila[14] || "").replace(/[\r\n]+/g, " | ").replace(/\s+/g, " ").trim()}" placeholder="Observación" readonly>
                        <button type="button" class="btn-abrir-modal-obs" 
                            data-ot="${otVal}" data-id="${fila[0] || ""}" data-depto="${fila[1] || ""}" 
                            data-muni="${fila[2] || ""}" data-afec="${fila[5] || ""}" title="Ampliar y editar observaciones">✏️</button>
                    </div>
                </div>
            </td>
            <td>
                <select class="edit-select estado-gestion">
                    <option value=""></option>
                    <option value="Gestionable" ${d1.estadoGestion === "Gestionable" ? "selected" : ""}>Gestionable</option>
                    <option value="Operativa" ${d1.estadoGestion === "Operativa" ? "selected" : ""}>Operativa</option>
                    <option value="Pte. aprobación" ${d1.estadoGestion === "Pte. aprobación" ? "selected" : ""}>Pte. aprobación</option>
                    <option value="FM/traslado/reubicación" ${d1.estadoGestion === "FM/traslado/reubicación" ? "selected" : ""}>FM/traslado/reubicación</option>
                    <option value="Abastecimiento" ${d1.estadoGestion === "Abastecimiento" ? "selected" : ""}>Abastecimiento</option>
                    <option value="Falla Tx" ${d1.estadoGestion === "Falla Tx" ? "selected" : ""}>Falla Tx</option>
                    <option value="Receso escolar" ${d1.estadoGestion === "Receso escolar" ? "selected" : ""}>Receso escolar</option>
                </select>
            </td>
            <td>
                <select class="edit-select tecnico-asignado">
                    <option value=""></option>
                    ${TECNICOS.map(nombre => `<option value="${nombre}" ${d1.tecnicoAsignado === nombre ? "selected" : ""}>${nombre}</option>`).join("")}
                </select>
            </td>
            <td>
                <select class="edit-select acompanamiento">
                    <option value=""></option>
                    ${TECNICOS.map(nombre => `<option value="${nombre}" ${d1.acompanamiento === nombre ? "selected" : ""}>${nombre}</option>`).join("")}
                </select>
            </td>
            <td>${fila[18] !== undefined ? fila[18] : ""}</td>
            <td>${fila[19] !== undefined ? fila[19] : ""}</td>
            <td>${fila[20] !== undefined ? fila[20] : ""}</td>
            <td>${fila[21] !== undefined ? fila[21] : ""}</td>
            <td>${fila[22] !== undefined ? fila[22] : ""}</td>
            <td>${fila[23] !== undefined ? fila[23] : ""}</td>
        </tr>`;
    }).join("");

    inicializarBotonAgruparColumnas();
    aplicarEstadoGrupoColumnas();
    inicializarRedimensionamientoColumnas();
}

async function cargarPlaneacion(){
    try {
        const respBacklog = await fetch(WORKER_DATA_URL);
        const dataBacklog = await respBacklog.json();

        let registrosD1 = {};
        try {
            const respD1 = await fetch(API_URL);
            registrosD1 = await respD1.json();
        } catch (error) {
            console.error("Error al cargar registros D1:", error);
        }
        window.registrosD1 = registrosD1;

        encabezadosGlobal = [
            "ID", "Departamento", "Municipio", "IM", "OT", "Tipo de afectación", 
            "Nuevo", "Total IDs afectados", "Días vigencia OT", "Rango de afectación", 
            "Tipo de prioridad", "Stoppers Dominion", "Estado Programación", 
            "Fecha Programación", "Observaciones", "Estado Gestión", "Técnico Asignado", 
            "Acompañamiento", "Indicador backlog", "Stopper P3", "Estado OT", 
            "Tipo facturación", "Fecha vencimiento FM", "Alerta vencimiento FM"
        ];

        let listaRegistros = [];
        if (Array.isArray(dataBacklog)) {
            listaRegistros = dataBacklog;
        } else if (dataBacklog && typeof dataBacklog === 'object') {
            listaRegistros = Object.values(dataBacklog);
        }

        datosGlobal = listaRegistros.map(reg => {
            if (Array.isArray(reg)) return reg;
            
            return [
                reg.id || reg.ID || "",
                reg.departamento || reg.Departamento || "",
                reg.municipio || reg.Municipio || "",
                reg.im || reg.IM || "",
                reg.ot || reg.OT || "",
                reg.afectacion || reg.tipo_afectacion || reg.Afectacion || "",
                "",
                reg.total_ids_afectados || reg.ids_afectados || reg.totalIdsAfectados || "",
                reg.dias_vigencia_ot || reg.dias_ot || reg.diasOt || "",
                reg.rango_afectacion || reg.rangoAfectacion || "",
                reg.tipo_prioridad || reg.prioridad || "",
                reg.stoppers_dominion || reg.stoppers || "",
                reg.estado_programacion || reg.estadoProgramacion || "",
                reg.fecha_programacion || reg.fechaProgramacion || "",
                reg.observaciones || reg.observacion || "",
                reg.estado_gestion || reg.estadoGestion || "",
                reg.tecnico_asignado || reg.tecnicoAsignado || "",
                reg.acompanamiento || "",
                reg.indicador_backlog || reg.backlog || "",
                reg.stopper_p3 || reg.stopperP3 || "",
                reg.estado_ot || reg.estadoOt || "",
                reg.tipo_facturacion || reg.tipoFacturacion || "",
                reg.fecha_vencimiento_fm || reg.fechaVencimientoFm || "",
                reg.alerta_vencimiento_fm || reg.alertaVencimientoFm || ""
            ];
        });

        const idxOT = 4;
        const idxID = 0;
        const idxIM = 3;
        const idxDepto = 1;
        const idxMuni = 2;
        
        const otsConfiguesSet = new Set(datosGlobal.map(f => String(f[idxOT]).trim()));

        Object.values(registrosD1).forEach(reg => {
            const otReg = String(reg.ot || "").trim();
            if (otReg && !otsConfiguesSet.has(otReg)) {
                if ((reg.estadoGestion && reg.estadoGestion !== "") || (reg.estadoProgramacion && reg.estadoProgramacion !== "")) {
                    let filaRescatada = new Array(encabezadosGlobal.length).fill("");
                    filaRescatada[idxOT] = otReg;
                    filaRescatada[idxID] = reg.idOriginal || reg.id || "--";
                    filaRescatada[idxIM] = reg.imOriginal || reg.im || "--";
                    filaRescatada[idxDepto] = reg.departamentoOriginal || reg.departamento || "--";
                    filaRescatada[idxMuni] = reg.municipioOriginal || reg.municipio || "--";
                    datosGlobal.push(filaRescatada);
                }
            }
        });
        
        renderizarFiltrosDinamicos(datosGlobal);
        datosFiltradosGlobal = datosGlobal;
        actualizarOpcionesFiltros(datosGlobal);
        pintarTabla(datosGlobal);
        actualizarKPIs(datosGlobal);

    } catch (error) {
        console.error("❌ Error al cargar planeación desde D1 (base-backlog):", error);
    }
}

function actualizarKPIs(datos){
    const encabezados = encabezadosGlobal;
    const idxOT = buscarIndiceColumnaFlexible(encabezados, ["OT"]);
    const idxBacklog = buscarIndiceColumnaFlexible(encabezados, ["Indicador backlog", "Backlog"]);
    const idxIdsAfectados = buscarIndiceColumnaFlexible(encabezados, ["Total IDs afectados", "IDs afectados"]);

    const otsAlta = new Set();
    const otsMedia = new Set();
    const otsBaja = new Set();
    const otsCumple = new Set();
    const otsNoCumple = new Set();
    const otsProgramadas = new Set();
    
    const otsProcesadasIds = new Set();
    let sumaIdsAfectados = 0;

    datos.forEach(fila => {
        const ot = (fila[idxOT] || "").trim();
        const backlog = (fila[idxBacklog] || "").trim().toUpperCase();

        if (ot && !otsProcesadasIds.has(ot)) {
            otsProcesadasIds.add(ot);
            const valIds = parseInt(idxIdsAfectados !== -1 ? fila[idxIdsAfectados] : 0, 10);
            if (!isNaN(valIds)) sumaIdsAfectados += valIds;
        }

        const regD1 = (window.registrosD1 || {})[ot] || {};
        const idxPrioridad = buscarIndiceColumnaFlexible(encabezados, ["Tipo de prioridad", "Prioridad"]);
        const prioridad = (idxPrioridad !== -1 ? (fila[idxPrioridad] || "") : "").trim().toUpperCase();

        if (prioridad === "ALTA") otsAlta.add(ot);
        if (prioridad === "MEDIA") otsMedia.add(ot);
        if (prioridad === "BAJA") otsBaja.add(ot);
        if (backlog === "CUMPLE") otsCumple.add(ot);
        if (backlog === "NO CUMPLE") otsNoCumple.add(ot);

        if (regD1.estadoProgramacion === "Programada") otsProgramadas.add(ot);
    });

    const elAlta = document.getElementById("kpiAltaPlaneacion");
    const elMedia = document.getElementById("kpiMediaPlaneacion");
    const elBaja = document.getElementById("kpiBajaPlaneacion");
    const elCumple = document.getElementById("kpiCumpleBacklog");
    const elNoCumple = document.getElementById("kpiNoCumpleBacklog");
    const kpiProg = document.getElementById("kpiProgramadosD1");
    const elSumaIds = document.getElementById("totalIdsAfectados");

    if(elAlta) elAlta.textContent = otsAlta.size;
    if(elMedia) elMedia.textContent = otsMedia.size;
    if(elBaja) elBaja.textContent = otsBaja.size;
    if(elCumple) elCumple.textContent = otsCumple.size;
    if(elNoCumple) elNoCumple.textContent = otsNoCumple.size;
    if(kpiProg) kpiProg.textContent = otsProgramadas.size;
    if(elSumaIds) elSumaIds.textContent = sumaIdsAfectados.toLocaleString();
}

document.addEventListener("DOMContentLoaded", cargarPlaneacion);

function renderizarFiltrosDinamicos(datos) {
    actualizarOpcionesFiltros(datos);
}

function obtenerDatosBaseParaFiltros() {
    const filtroBusquedaEl = document.getElementById("filtroBusqueda");
    const texto = filtroBusquedaEl ? filtroBusquedaEl.value.toLowerCase() : "";

    const encabezados = encabezadosGlobal;
    const idxID = buscarIndiceColumnaFlexible(encabezados, ["ID"]);
    const idxOT = buscarIndiceColumnaFlexible(encabezados, ["OT"]);
    const idxMunicipio = buscarIndiceColumnaFlexible(encabezados, ["Municipio"]);
    const idxPrioridad = buscarIndiceColumnaFlexible(encabezados, ["Tipo de prioridad", "Prioridad"]);
    const idxBacklog = buscarIndiceColumnaFlexible(encabezados, ["Indicador backlog", "Backlog"]);

    return datosGlobal.filter(fila => {
        const otVal = fila[idxOT];
        const regD1 = (window.registrosD1 || {})[otVal] || {};
        const prioridadVal = (idxPrioridad !== -1 ? (fila[idxPrioridad] || "") : "").trim().toUpperCase();
        const valorBacklogCol = (idxBacklog !== -1 ? (fila[idxBacklog] || "") : "").trim().toUpperCase();

        const cumpleTexto = !texto || 
            String(idxID !== -1 ? fila[idxID] : "").toLowerCase().includes(texto) ||
            String(idxOT !== -1 ? fila[idxOT] : "").toLowerCase().includes(texto) ||
            String(idxMunicipio !== -1 ? fila[idxMunicipio] : "").toLowerCase().includes(texto);

        let cumpleKpi = true;
        if (kpiFiltroActivo === "alta") cumpleKpi = (prioridadVal === "ALTA");
        if (kpiFiltroActivo === "media") cumpleKpi = (prioridadVal === "MEDIA");
        if (kpiFiltroActivo === "baja") cumpleKpi = (prioridadVal === "BAJA");
        if (kpiFiltroActivo === "cumple") cumpleKpi = (valorBacklogCol === "CUMPLE");
        if (kpiFiltroActivo === "nocumple") cumpleKpi = (valorBacklogCol === "NO CUMPLE");
        if (kpiFiltroActivo === "programados") cumpleKpi = (regD1.estadoProgramacion === "Programada");

        return cumpleTexto && cumpleKpi;
    });
}

function actualizarOpcionesFiltros(datos) {
    const encabezados = encabezadosGlobal;
    const idxOT = buscarIndiceColumnaFlexible(encabezados, ["OT"]);
    const idxDepto = buscarIndiceColumnaFlexible(encabezados, ["Departamento"]);
    const idxAfectacion = buscarIndiceColumnaFlexible(encabezados, ["Tipo de afectación", "Afectación"]);
    const idxStoppers = buscarIndiceColumnaFlexible(encabezados, ["Stoppers Dominion", "Stoppers"]);
    const idxRango = buscarIndiceColumnaFlexible(encabezados, ["Rango de afectación", "Rango de afect"]);
    const idxDiasOT = buscarIndiceColumnaFlexible(encabezados, ["Días vigencia OT", "Días OT", "Dias OT"]);
    const idxBacklog = buscarIndiceColumnaFlexible(encabezados, ["Indicador backlog", "Backlog"]);
    const idxEstadoOT = buscarIndiceColumnaFlexible(encabezados, ["Estado OT"]);

    const datosBaseKpi = obtenerDatosBaseParaFiltros();

    const filtrarParaLista = (excluirFiltro) => {
        return datosBaseKpi.filter(fila => {
            const otVal = idxOT !== -1 ? fila[idxOT] : "";
            const regD1 = (window.registrosD1 || {})[otVal] || {};
            const estG = regD1.estadoGestion || "";
            const fechaProgVal = regD1.fechaProgramacion || "";
            const valorBacklogCol = idxBacklog !== -1 ? (fila[idxBacklog] || "").trim().toUpperCase() : "";
            const incumplidor = valorBacklogCol === "NO CUMPLE" ? "Sí" : "No";
            const esN = esCasoNuevo(otVal) ? "Sí" : "No";
            const estadoOTVal = idxEstadoOT !== -1 ? (fila[idxEstadoOT] || "") : "";
            const diasVal = idxDiasOT !== -1 ? (fila[idxDiasOT] || "") : "";
            const rangoVal = idxRango !== -1 ? (fila[idxRango] || "") : "";
            const deptoVal = idxDepto !== -1 ? fila[idxDepto] : "";
            const afecVal = idxAfectacion !== -1 ? fila[idxAfectacion] : "";
            const stopVal = idxStoppers !== -1 ? fila[idxStoppers] : "";

            if (excluirFiltro !== 'nuevo' && nuevosSeleccionados.length > 0 && !nuevosSeleccionados.includes(esN)) return false;
            if (excluirFiltro !== 'depto' && departamentosSeleccionados.length > 0 && !departamentosSeleccionados.includes(deptoVal)) return false;
            if (excluirFiltro !== 'estado' && estadosGestionSeleccionados.length > 0 && !estadosGestionSeleccionados.includes(estG)) return false;
            if (excluirFiltro !== 'afectacion' && afectacionesSeleccionadas.length > 0 && !afectacionesSeleccionadas.includes(afecVal)) return false;
            if (excluirFiltro !== 'stoppers' && stoppersSeleccionados.length > 0 && !stoppersSeleccionados.includes(stopVal)) return false;
            if (excluirFiltro !== 'dias' && diasOtSeleccionados.length > 0 && !diasOtSeleccionados.includes(diasVal)) return false;
            if (excluirFiltro !== 'rango' && rangosSeleccionados.length > 0 && !rangosSeleccionados.includes(rangoVal)) return false;
            if (excluirFiltro !== 'backlog' && backlogSeleccionados.length > 0 && !backlogSeleccionados.includes(incumplidor)) return false;
            if (excluirFiltro !== 'estadoOT' && estadoOTSeleccionados.length > 0 && !estadoOTSeleccionados.includes(estadoOTVal)) return false;
            if (excluirFiltro !== 'fecha' && fechasProgSeleccionadas.length > 0 && !fechasProgSeleccionadas.includes(fechaProgVal)) return false;

            return true;
        });
    };

    const datosParaNuevo = filtrarParaLista('nuevo');
    const datosParaDepto = filtrarParaLista('depto');
    const datosParaEstado = filtrarParaLista('estado');
    const datosParaAfec = filtrarParaLista('afectacion');
    const datosParaStoppers = filtrarParaLista('stoppers');
    const datosParaDias = filtrarParaLista('dias');
    const datosParaRango = filtrarParaLista('rango');
    const datosParaBacklog = filtrarParaLista('backlog');
    const datosParaEstadoOT = filtrarParaLista('estadoOT');
    const datosParaFecha = filtrarParaLista('fecha');

    const nEl = document.getElementById("listaNuevo");
    if(nEl) {
        const nuevosDisp = [...new Set(datosParaNuevo.map(f => esCasoNuevo(f[idxOT]) ? "Sí" : "No"))].filter(Boolean).sort();
        nEl.innerHTML = `
            <div class="filtro-sort-container">
                <div class="filtro-sort-title">⇅ Ordenar</div>
                <div class="filtro-sort-header">
                    <span onclick="ordenarDesdeFiltro('Nuevo', true)">A-Z</span>
                    <span onclick="ordenarDesdeFiltro('Nuevo', false)">Z-A</span>
                </div>
            </div>
            <input type="text" id="buscarNuevo" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarNuevo">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodosNuevos"> (Seleccionar todo)</label>
        ` + nuevosDisp.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkNuevo" ${nuevosSeleccionados.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
    }
}

function aplicarFiltros(){
    const filtroBusquedaEl = document.getElementById("filtroBusqueda");
    const texto = filtroBusquedaEl ? filtroBusquedaEl.value.toLowerCase() : "";

    const nuevosFiltro = nuevosSeleccionados;
    const deptos = departamentosSeleccionados;
    const afectacionesFiltro = afectacionesSeleccionadas;
    const stoppersFiltro = stoppersSeleccionados;
    const rangosFiltro = rangosSeleccionados;
    const diasOtFiltro = diasOtSeleccionados;
    const backlogFiltro = backlogSeleccionados;
    const estadoOTFiltro = estadoOTSeleccionados;
    const fechasFiltro = fechasProgSeleccionadas;
    const estGestionFiltro = estadosGestionSeleccionados;

    const encabezados = encabezadosGlobal;
    const idxID = buscarIndiceColumnaFlexible(encabezados, ["ID"]);
    const idxOT = buscarIndiceColumnaFlexible(encabezados, ["OT"]);
    const idxMunicipio = buscarIndiceColumnaFlexible(encabezados, ["Municipio"]);
    const idxDepto = buscarIndiceColumnaFlexible(encabezados, ["Departamento"]);
    const idxPrioridad = buscarIndiceColumnaFlexible(encabezados, ["Tipo de prioridad", "Prioridad"]);
    const idxAfectacion = buscarIndiceColumnaFlexible(encabezados, ["Tipo de afectación", "Afectación"]);
    const idxStoppers = buscarIndiceColumnaFlexible(encabezados, ["Stoppers Dominion", "Stoppers"]);
    const idxRango = buscarIndiceColumnaFlexible(encabezados, ["Rango de afectación", "Rango de afect"]);
    const idxDiasOT = buscarIndiceColumnaFlexible(encabezados, ["Días vigencia OT", "Días OT", "Dias OT"]);
    const idxBacklog = buscarIndiceColumnaFlexible(encabezados, ["Indicador backlog", "Backlog"]);
    const idxEstadoOT = buscarIndiceColumnaFlexible(encabezados, ["Estado OT"]);

    let resultado = datosGlobal.filter(fila => {
        const otVal = idxOT !== -1 ? fila[idxOT] : "";
        const regD1 = (window.registrosD1 || {})[otVal] || {};
        const estG = regD1.estadoGestion || "";
        const fechaProgVal = regD1.fechaProgramacion || "";
        const prioridadVal = (idxPrioridad !== -1 ? (fila[idxPrioridad] || "") : "").trim().toUpperCase();
        const valorBacklogCol = (idxBacklog !== -1 ? (fila[idxBacklog] || "") : "").trim().toUpperCase();
        const incumplidor = valorBacklogCol === "NO CUMPLE" ? "Sí" : "No";
        const esN = esCasoNuevo(otVal) ? "Sí" : "No";
        const estadoOTVal = idxEstadoOT !== -1 ? (fila[idxEstadoOT] || "") : "";
        const diasVal = idxDiasOT !== -1 ? (fila[idxDiasOT] || "") : "";
        const rangoVal = idxRango !== -1 ? (fila[idxRango] || "") : "";
        const deptoVal = idxDepto !== -1 ? fila[idxDepto] : "";
        const afecVal = idxAfectacion !== -1 ? fila[idxAfectacion] : "";
        const stopVal = idxStoppers !== -1 ? fila[idxStoppers] : "";

        const cumpleTexto = !texto || 
            String(idxID !== -1 ? fila[idxID] : "").toLowerCase().includes(texto) ||
            String(idxOT !== -1 ? fila[idxOT] : "").toLowerCase().includes(texto) ||
            String(idxMunicipio !== -1 ? fila[idxMunicipio] : "").toLowerCase().includes(texto);

        const cumpleNuevo = nuevosFiltro.length === 0 || nuevosFiltro.includes(esN);
        const cumpleDepto = deptos.length === 0 || deptos.includes(deptoVal);
        const cumpleAfectacion = afectacionesFiltro.length === 0 || afectacionesFiltro.includes(afecVal);
        const cumpleStoppers = stoppersFiltro.length === 0 || stoppersFiltro.includes(stopVal);
        const cumpleRango = rangosFiltro.length === 0 || rangosFiltro.includes(rangoVal);
        const cumpleDiasOT = diasOtFiltro.length === 0 || diasOtFiltro.includes(diasVal);
        const cumpleBacklog = backlogFiltro.length === 0 || backlogFiltro.includes(incumplidor);
        const cumpleEstadoOT = estadoOTFiltro.length === 0 || estadoOTFiltro.includes(estadoOTVal);
        const cumpleFechaProg = fechasFiltro.length === 0 || fechasFiltro.includes(fechaProgVal);
        const cumpleEstGestion = estGestionFiltro.length === 0 || estGestionFiltro.includes(estG);

        let cumpleKpi = true;
        if (kpiFiltroActivo === "alta") cumpleKpi = (prioridadVal === "ALTA");
        if (kpiFiltroActivo === "media") cumpleKpi = (prioridadVal === "MEDIA");
        if (kpiFiltroActivo === "baja") cumpleKpi = (prioridadVal === "BAJA");
        if (kpiFiltroActivo === "cumple") cumpleKpi = (valorBacklogCol === "CUMPLE");
        if (kpiFiltroActivo === "nocumple") cumpleKpi = (valorBacklogCol === "NO CUMPLE");
        if (kpiFiltroActivo === "programados") cumpleKpi = (regD1.estadoProgramacion === "Programada");

        return cumpleTexto && cumpleNuevo && cumpleDepto && cumpleAfectacion && cumpleStoppers && cumpleRango && cumpleDiasOT && cumpleBacklog && cumpleEstadoOT && cumpleFechaProg && cumpleEstGestion && cumpleKpi;
    });

    datosFiltradosGlobal = resultado;
    pintarTabla(resultado);
    actualizarKPIs(resultado);
    actualizarOpcionesFiltros(datosGlobal);
}

document.addEventListener("change", (e) => {
    const target = e.target;
    if(target.classList.contains("estado-programacion")){
        const fila = target.closest("tr");
        const fecha = fila.querySelector(".fecha-input");
        const valor = target.value;

        if(valor === "Programada" || valor === "Cancelada" || valor === "Operativa"){
            fecha.type = "date";
            fecha.disabled = false;
        } else {
            fecha.type = "text";
            fecha.disabled = true;
            fecha.value = "En validación";
        }
    }
    const filaTabla = target.closest("tr");
    if(filaTabla && !target.closest(".multi-filtro-item")) {
        guardarOT(filaTabla);
    }
});

async function guardarOT(fila, observacionForzada = null){
    const ot = fila.children[4]?.textContent.trim() || "";
    const inputFecha = fila.querySelector(".fecha-input");
    let fechaVal = inputFecha?.value || "";
    const inputObs = fila.querySelector(".observacion");
    const obsFinal = observacionForzada !== null ? observacionForzada : (window.registrosD1[ot]?.observacion || inputObs?.value || "");

    const payload = {
        ot,
        estadoProgramacion: fila.querySelector(".estado-programacion")?.value || "",
        fechaProgramacion: fechaVal,
        observacion: obsFinal,
        estadoGestion: fila.querySelector(".estado-gestion")?.value || "",
        tecnicoAsignado: fila.querySelector(".tecnico-asignado")?.value || "",
        acompanamiento: fila.querySelector(".acompanamiento")?.value || "",
        idOriginal: fila.children[0]?.textContent.trim() || "",
        imOriginal: fila.children[3]?.textContent.trim() || "",
        departamentoOriginal: fila.children[1]?.textContent.trim() || "",
        municipioOriginal: fila.children[2]?.textContent.trim() || ""
    };

    try {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error("Error al guardar OT:", err);
    }
}
