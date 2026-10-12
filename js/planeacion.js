const DATASET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSvQf6zIgwVnOQ72fcweEEMdRKylGsKFe30Mpea50qWIbr-m6ELzpxaUV2fnFRwH7TX1AMIabPbOqoJ/pub?output=csv";

const API_URL =
"https://planeacion-api.modulo-de-exclusiones.workers.dev/api/planeacion";

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
    .planeacion-table th {
        position: relative;
        user-select: none;
    }
    .table-resizer {
        position: absolute;
        top: 0;
        right: 0;
        width: 8px;
        cursor: col-resize;
        user-select: none;
        z-index: 25;
        height: 100%;
    }
    .table-resizer:hover, .table-resizer.resizing {
        background-color: #3182ce;
    }
`;
document.head.appendChild(styleGrupoExcel);

const TECNICOS = [
    "ABNER ALBERTO ARIAS PEREZ",
    "ALVARO DE JESUS PEÑALOZA CASTILLEJO",
    "ALVARO ENRIQUE LAMBRAÑO MUÑOZ",
    "ALVARO JOSE MEDINA MENDOZA",
    "ALVARO ROJAS MISAS",
    "ANDERSON JOSE CANCINO ESPITIA",
    "ANDRES DAVID MONTES HERRERA",
    "ANDRES SANTIAGO JARAMILLO MESA",
    "ARMANDO JOSE DE LUQUE BARROS",
    "BREINER ANTONIO MAGDANIEL GARIZABAL",
    "CAMILO ANDRES SALAZAR BARBOSA",
    "CAMILO ANTONIO ORTEGA DIAZ",
    "CARLOS ADRIAN OROZCO PINZON",
    "CARLOS ANDRES ROLDAN CORREA",
    "CARLOS JULIO MOGOLLON LOBO",
    "CARLOS MARIO SANCHEZ BRITO",
    "CRISTIAN JOSE HERNANDEZ GARCIA",
    "DANIEL ANDRES ARRIETA YEPES",
    "DANILO JOSE ROMERO RINCON",
    "DEWIN LEONARDO TAPIA MONTALVO",
    "DIEGO ALEJANDRO PELAEZ GUTIERREZ",
    "DIEGO AMETH SALAZAR OVIEDO",
    "DIEGO ARMANDO CORREA CHITIVA",
    "DIEGO ARMANDO QUINTERO BADILLO",
    "EDER ALEXANDER GONZALEZ GONZALEZ",
    "EDUAR ARMANDO QUINCHIA GOMEZ",
    "EDUARDO ADOLFO PRETEL MORALES",
    "EIDER RAFAEL QUINTERO CUELLO",
    "ELGER LUIS HERNANDEZ RUIZ",
    "ELIAN DAVID RODRIGUEZ BUELVAS",
    "ELIAN MAURICIO MIER DURAN",
    "ELIAN QUINTERO ROZO",
    "EVER MANUEL MERCADO YANCE",
    "FABIAN FERNANDEZ CONTRERERAS",
    "HAILEN JULIO CHARRY DE AVILA",
    "HARDY WHITAKER HOWARD",
    "HAROLD ANTONIO RAMOS VELILLA",
    "HUMBERTO RAFAEL DEECHE OROZCO",
    "ILDE ALBEIRO SALAZAR OSSA",
    "ISAAC DAVID BARON CARDENAS",
    "ISAAC DAVID CAMELO ARRIETA",
    "JADER ARLEY ROJAS CESPEDES",
    "JEAN CARLOS GUERRA SAAH",
    "JHON ANTONY PARADA LOBO",
    "JHON CARLOS FRAGOZO MORALES",
    "JORGE GUTIERREZ BERNIER JOSE",
    "JORGE LUIS MURILLO AGUIRRE",
    "JOSE DAVID MENDOZA PINTO",
    "JOSE MIGUEL EPIAYU IPUANA",
    "JOSEPH DANIEL DURAN COBO",
    "JUAN ANDRES ANGEL GOMEZ",
    "JUAN CAMILO RODRIGUEZ LOPERA",
    "JUAN DAVID SUAREZ LOPERA",
    "JUAN DAVID TORO GIRALDO",
    "JUAN JOSE SUAREZ JARAMILLO",
    "JUAN MANUEL TORRES HERNANDEZ",
    "KEVIN RENE LONDOÑO QUINTERO",
    "LEONARDO ANDRES SOLANO POLO",
    "LUCIANO DAVID HERNANDEZ MORALES",
    "LUIS ANTONIO SANCHEZ ARIAS",
    "LUIS DAVID PEDROZO FERNANDEZ",
    "MAIRON CANTERO JIMENEZ",
    "MANUEL ALBERTO RODRIGUEZ BUELVAS",
    "MANUEL ENRIQUE BARROS PEREZ",
    "MANUEL ENRIQUE OVIEDO TRESPALACIOS",
    "MARCOS ANTONIO RIASCOS LUNA",
    "MIGUEL ANGEL AGREDO MONTOYA",
    "NALDO GABRIEL RINCÓN RINCÓN",
    "OSMAN DANIEL GRANADILLO ALVAREZ",
    "RAVER ARANIS GAMEZ RODRIGUEZ",
    "RICHARD RICARDO GAMEZ MOLINA",
    "ROBIN ROJAS JIMENEZ",
    "SAMMY ELIUD VARGAS SIERRA",
    "SAMUEL PUSHAINA PUSHAINA",
    "SAYDER FRANCISCO RODRIGUEZ BARLIZA",
    "SILVIO ALBERTO SIERRA MENESES",
    "YAIR ANDRES DIAZ POLO",
    "YESID ADOLFO VALLEJO CABRERA",
    "YESITH RANGEL PADILLA",
    "YORMAN DAVID DUQUE GUERRA"
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
            if (grupoColumnasColapsado) {
                ths[idx].classList.add("col-grupo-oculta");
            } else {
                ths[idx].classList.remove("col-grupo-oculta");
            }
        }
    });

    filas.forEach(fila => {
        const celdas = fila.children;
        indicesGrupo.forEach(idx => {
            if (celdas[idx]) {
                if (grupoColumnasColapsado) {
                    celdas[idx].classList.add("col-grupo-oculta");
                } else {
                    celdas[idx].classList.remove("col-grupo-oculta");
                }
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

function pintarTabla(datos){
    const encabezados = encabezadosGlobal;

    const idxID = encabezados.findIndex(h => h.trim() === "ID");
    const idxDepto = encabezados.findIndex(h => h.trim() === "Departamento");
    const idxMunicipio = encabezados.findIndex(h => h.trim() === "Municipio");
    const idxOT = encabezados.findIndex(h => h.trim() === "OT");
    const idxIM = encabezados.findIndex(h => h.trim() === "IM");
    const idxAfectacion = encabezados.findIndex(h => h.trim() === "Tipo de afectación");
    const idxIdsAfectados = encabezados.findIndex(h => h.trim() === "IDs afectados");
    const idxDias = encabezados.findIndex(h => h.trim() === "Días OT");
    const idxPrioridad = encabezados.findIndex(h => h.trim() === "Tipo de prioridad");
    const idxRangoAfectacion = encabezados.findIndex(h => h.trim() === "Rango de afectación");
    const idxStoppersDominion = encabezados.findIndex(h => h.trim() === "Stoppers Dominion");
    const idxBacklog = encabezados.findIndex(h => h.trim() === "Indicador backlog");
    const idxStopperP3 = encabezados.findIndex(h => h.trim() === "Stopper P3");
    const idxEstadoOT = encabezados.findIndex(h => h.trim() === "Estado OT" || h.trim() === "ESTADO OT" || h.trim().toUpperCase() === "ESTADO_OT");
    const idxTipoFacturacion = encabezados.findIndex(h => h.trim() === "Tipo facturación");
    const idxFechaFM = encabezados.findIndex(h => h.trim() === "Fecha vencimiento FM");
    const idxAlertaFM = encabezados.findIndex(h => h.trim() === "Alerta vencimiento FM");

    const planeacionBody = document.getElementById("planeacionBody");
    if (!planeacionBody) return;

    planeacionBody.innerHTML = datos.map(fila => {
        const otVal = String(fila[idxOT] || "").trim();
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
            <td>${fila[idxID] || ""}</td>
            <td>${fila[idxDepto] || ""}</td>
            <td>${fila[idxMunicipio] || ""}</td>
            <td>${fila[idxIM] || ""}</td>
            <td>${fila[idxOT] || ""}</td>
            <td>${fila[idxAfectacion] || ""}</td>
            <td style="text-align: center; background-color: #f7fafc;">${htmlBadgeNuevo}</td>
            <td class="${ocultarClase}">${fila[idxIdsAfectados] || ""}</td>
            <td class="${ocultarClase}">${fila[idxDias] || ""}</td>
            <td class="${ocultarClase}">${fila[idxRangoAfectacion] || ""}</td>
            <td class="${ocultarClase}">${fila[idxPrioridad] || ""}</td>
            <td class="${ocultarClase}">${fila[idxStoppersDominion] || ""}</td>
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
                        <input class="edit-input observacion" value="${(d1.observacion || "").replace(/[\r\n]+/g, " | ").replace(/\s+/g, " ").trim()}" placeholder="Observación" readonly>
                        
                        <button type="button" class="btn-abrir-modal-obs" 
                            data-ot="${otVal}" 
                            data-id="${fila[idxID] || ""}" 
                            data-depto="${fila[idxDepto] || ""}" 
                            data-muni="${fila[idxMunicipio] || ""}" 
                            data-afec="${fila[idxAfectacion] || ""}" 
                            title="Ampliar y editar observaciones">✏️</button>
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
            <td>${fila[idxBacklog] || ""}</td>
            <td>${fila[idxStopperP3] || ""}</td>
            <td>${idxEstadoOT !== -1 ? (fila[idxEstadoOT] || "") : ""}</td>
            <td>${fila[idxTipoFacturacion] || ""}</td>
            <td>${fila[idxFechaFM] || ""}</td>
            <td>${fila[idxAlertaFM] || ""}</td>
        </tr>`;
    }).join("");

    inicializarBotonAgruparColumnas();
    aplicarEstadoGrupoColumnas();
    inicializarRedimensionamientoColumnas();
}

async function cargarPlaneacion(){
    const resp = await fetch(DATASET_URL);
    const texto = await
