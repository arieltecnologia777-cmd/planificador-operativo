const DATASET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRUdWw76b-hysCr5vGj2sS6PsMR2a7IuV_7fOL1HO_gaq5Bq-Aa5dqjhGKogvgXR3uH_HHb8oEYqfY_/pub?output=csv";

const API_URL =
"https://planeacion-api.modulo-de-exclusiones.workers.dev/api/planeacion";

let datosGlobal = [];
let encabezadosGlobal = [];
window.registrosD1 = {};

let datosFiltradosGlobal = [];
let departamentosSeleccionados = [];
let afectacionesSeleccionadas = [];
let stoppersSeleccionados = [];
let rangosSeleccionados = [];
let fechasProgSeleccionadas = [];
let backlogsSeleccionados = [];
let estadosGestionSeleccionados = [];
let kpiFiltroActivo = null;
let grupoColumnasColapsado = false; // Estado para agrupar/ocultar columnas

// Estilos limpios y posicionamiento fijo junto al encabezado de Estado programación
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

function inicializarBotonAgruparColumnas() {
    const ths = document.querySelectorAll(".planeacion-table th");
    // El índice 11 corresponde a "Estado programación"
    if (ths.length > 11) {
        const thEstadoProg = ths[11]; 
        let btn = thEstadoProg.querySelector(".btn-excel-grupo");
        if (!btn) {
            btn = document.createElement("button");
            btn.type = "button";
            btn.className = "btn-excel-grupo";
            btn.id = "btnToggleGrupoCols";
            // Insertar el botón al inicio del contenido de la celda th para que quede justo antes del texto
            thEstadoProg.insertBefore(btn, thEstadoProg.firstChild);
        }
        btn.textContent = grupoColumnasColapsado ? "+" : "-";
        btn.title = grupoColumnasColapsado ? "Expandir columnas agrupadas" : "Ocultar/Agrupar columnas";
    }
}

function aplicarEstadoGrupoColumnas() {
    const ths = document.querySelectorAll(".planeacion-table th");
    const filas = document.querySelectorAll(".planeacion-table tbody tr");

    // Índices de las columnas a agrupar/ocultar: 6 (IDs afectados), 7 (Días OT), 8 (Rango), 9 (Prioridad), 10 (Stoppers)
    const indicesGrupo = [6, 7, 8, 9, 10];

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
    const idxTipoFacturacion = encabezados.findIndex(h => h.trim() === "Tipo facturación");
    const idxFechaFM = encabezados.findIndex(h => h.trim() === "Fecha vencimiento FM");
    const idxAlertaFM = encabezados.findIndex(h => h.trim() === "Alerta vencimiento FM");

    const planeacionBody = document.getElementById("planeacionBody");
    if (!planeacionBody) return;

    planeacionBody.innerHTML = datos.map(fila => {
        const d1 = (window.registrosD1 || {})[fila[idxOT]] || {};

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
                            data-ot="${fila[idxOT] || ""}" 
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
            <td>${fila[idxTipoFacturacion] || ""}</td>
            <td>${fila[idxFechaFM] || ""}</td>
            <td>${fila[idxAlertaFM] || ""}</td>
        </tr>`;
    }).join("");

    inicializarBotonAgruparColumnas();
    aplicarEstadoGrupoColumnas();
}

async function cargarPlaneacion(){
    const resp = await fetch(DATASET_URL);
    const texto = await resp.text();

    const filas = texto.trim().split(/\r?\n/).map(fila => {
        const valores = [];
        let actual = "";
        let dentroComillas = false;

        for(let i=0; i<fila.length; i++){
            const caracter = fila[i];
            if(caracter === '"'){
                dentroComillas = !dentroComillas;
            } else if(caracter === "," && !dentroComillas){
                valores.push(actual);
                actual = "";
            } else {
                actual += caracter;
            }
        }
        valores.push(actual);
        return valores;
    });

    encabezadosGlobal = filas[0];
    datosGlobal = filas.slice(1);

    const datos = datosGlobal;

    let registrosD1 = {};
    try {
        const respD1 = await fetch(API_URL);
        registrosD1 = await respD1.json();
    } catch (error) {
        console.error(error);
    }

    window.registrosD1 = registrosD1;

    renderizarFiltrosDinamicos(datos);
    datosFiltradosGlobal = datos;
    actualizarOpcionesFiltros(datos);
    pintarTabla(datos);
    actualizarKPIs(datos);
}

function actualizarKPIs(datos){
    const encabezados = encabezadosGlobal;
    const idxOT = encabezados.findIndex(h => h.trim() === "OT");
    const idxPrioridad = encabezados.findIndex(h => h.trim() === "Tipo de prioridad");
    const idxBacklog = encabezados.findIndex(h => h.trim() === "Indicador backlog");
    const idxIdsAfectados = encabezados.findIndex(h => h.trim() === "IDs afectados");

    const otsAlta = new Set();
    const otsMedia = new Set();
    const otsBaja = new Set();
    const otsCumple = new Set();
    const otsNoCumple = new Set();
    const otsProgramadas = new Set();
    
    let sumaIdsAfectados = 0;

    datos.forEach(fila => {
        const ot = (fila[idxOT] || "").trim();
        const prioridad = (fila[idxPrioridad] || "").trim().toUpperCase();
        const backlog = (fila[idxBacklog] || "").trim().toUpperCase();

        const valIds = parseInt(fila[idxIdsAfectados], 10);
        if (!isNaN(valIds)) {
            sumaIdsAfectados += valIds;
        }

        if (prioridad === "ALTA") otsAlta.add(ot);
        if (prioridad === "MEDIA") otsMedia.add(ot);
        if (prioridad === "BAJA") otsBaja.add(ot);
        if (backlog === "CUMPLE") otsCumple.add(ot);
        if (backlog === "NO CUMPLE") otsNoCumple.add(ot);

        const regD1 = (window.registrosD1 || {})[ot];
        if (regD1 && (regD1.estadoProgramacion === "Programada" || regD1.estadoProgramacion === "Operativa")) {
            otsProgramadas.add(ot);
        }
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

function actualizarOpcionesFiltros(datos) {
    const filtroBusquedaEl = document.getElementById("filtroBusqueda");
    const texto = filtroBusquedaEl ? filtroBusquedaEl.value.toLowerCase() : "";

    const encabezados = encabezadosGlobal;
    const idxID = encabezados.findIndex(h => h.trim() === "ID");
    const idxOT = encabezados.findIndex(h => h.trim() === "OT");
    const idxMunicipio = encabezados.findIndex(h => h.trim() === "Municipio");
    const idxDepto = encabezados.findIndex(h => h.trim() === "Departamento");
    const idxAfectacion = encabezados.findIndex(h => h.trim() === "Tipo de afectación");
    const idxStoppers = encabezados.findIndex(h => h.trim() === "Stoppers Dominion");
    const idxRango = encabezados.findIndex(h => h.trim() === "Rango de afectación");
    const idxBacklog = encabezados.findIndex(h => h.trim() === "Indicador backlog");

    const coincideBase = (fila) => {
        const otVal = fila[idxOT];
        const regD1 = (window.registrosD1 || {})[otVal] || {};
        const estG = regD1.estadoGestion || "";
        const backlogVal = (fila[idxBacklog] || "").trim().toUpperCase();

        const cumpleTexto = !texto || 
            String(fila[idxID] || "").toLowerCase().includes(texto) ||
            String(fila[idxOT] || "").toLowerCase().includes(texto) ||
            String(fila[idxMunicipio] || "").toLowerCase().includes(texto);

        const cumpleEstGestion = estadosGestionSeleccionados.length === 0 || estadosGestionSeleccionados.includes(estG);

        let cumpleKpi = true;
        if (kpiFiltroActivo === "alta") cumpleKpi = ((fila[encabezados.findIndex(h => h.trim() === "Tipo de prioridad")] || "").trim().toUpperCase() === "ALTA");
        if (kpiFiltroActivo === "media") cumpleKpi = ((fila[encabezados.findIndex(h => h.trim() === "Tipo de prioridad")] || "").trim().toUpperCase() === "MEDIA");
        if (kpiFiltroActivo === "baja") cumpleKpi = ((fila[encabezados.findIndex(h => h.trim() === "Tipo de prioridad")] || "").trim().toUpperCase() === "BAJA");
        if (kpiFiltroActivo === "cumple") cumpleKpi = (backlogVal === "CUMPLE");
        if (kpiFiltroActivo === "nocumple") cumpleKpi = (backlogVal === "NO CUMPLE");
        if (kpiFiltroActivo === "programados") cumpleKpi = (regD1.estadoProgramacion === "Programada" || regD1.estadoProgramacion === "Operativa");

        return cumpleTexto && cumpleEstGestion && cumpleKpi;
    };

    const datosParaDepto = datosGlobal.filter(fila => {
        const otVal = fila[idxOT];
        const regD1 = (window.registrosD1 || {})[otVal] || {};
        const fechaProgVal = regD1.fechaProgramacion || "";
        return coincideBase(fila) &&
            (afectacionesSeleccionadas.length === 0 || afectacionesSeleccionadas.includes(fila[idxAfectacion])) &&
            (stoppersSeleccionados.length === 0 || stoppersSeleccionados.includes(fila[idxStoppers])) &&
            (rangosSeleccionados.length === 0 || rangosSeleccionados.includes(fila[idxRango])) &&
            (fechasProgSeleccionadas.length === 0 || fechasProgSeleccionadas.includes(fechaProgVal)) &&
            (backlogsSeleccionados.length === 0 || backlogsSeleccionados.includes(fila[idxBacklog]));
    });

    const datosParaAfectacion = datosGlobal.filter(fila => {
        const otVal = fila[idxOT];
        const regD1 = (window.registrosD1 || {})[otVal] || {};
        const fechaProgVal = regD1.fechaProgramacion || "";
        return coincideBase(fila) &&
            (departamentosSeleccionados.length === 0 || departamentosSeleccionados.includes(fila[idxDepto])) &&
            (stoppersSeleccionados.length === 0 || stoppersSeleccionados.includes(fila[idxStoppers])) &&
            (rangosSeleccionados.length === 0 || rangosSeleccionados.includes(fila[idxRango])) &&
            (fechasProgSeleccionadas.length === 0 || fechasProgSeleccionadas.includes(fechaProgVal)) &&
            (backlogsSeleccionados.length === 0 || backlogsSeleccionados.includes(fila[idxBacklog]));
    });

    const datosParaStoppers = datosGlobal.filter(fila => {
        const otVal = fila[idxOT];
        const regD1 = (window.registrosD1 || {})[otVal] || {};
        const fechaProgVal = regD1.fechaProgramacion || "";
        return coincideBase(fila) &&
            (departamentosSeleccionados.length === 0 || departamentosSeleccionados.includes(fila[idxDepto])) &&
            (afectacionesSeleccionadas.length === 0 || afectacionesSeleccionadas.includes(fila[idxAfectacion])) &&
            (rangosSeleccionados.length === 0 || rangosSeleccionados.includes(fila[idxRango])) &&
            (fechasProgSeleccionadas.length === 0 || fechasProgSeleccionadas.includes(fechaProgVal)) &&
            (backlogsSeleccionados.length === 0 || backlogsSeleccionados.includes(fila[idxBacklog]));
    });

    const datosParaRango = datosGlobal.filter(fila => {
        const otVal = fila[idxOT];
        const regD1 = (window.registrosD1 || {})[otVal] || {};
        const fechaProgVal = regD1.fechaProgramacion || "";
        return coincideBase(fila) &&
            (departamentosSeleccionados.length === 0 || departamentosSeleccionados.includes(fila[idxDepto])) &&
            (afectacionesSeleccionadas.length === 0 || afectacionesSeleccionadas.includes(fila[idxAfectacion])) &&
            (stoppersSeleccionados.length === 0 || stoppersSeleccionados.includes(fila[idxStoppers])) &&
            (fechasProgSeleccionadas.length === 0 || fechasProgSeleccionadas.includes(fechaProgVal)) &&
            (backlogsSeleccionados.length === 0 || backlogsSeleccionados.includes(fila[idxBacklog]));
    });

    const datosParaFechaProg = datosGlobal.filter(fila => {
        const depart = fila[idxDepto];
        const afec = fila[idxAfectacion];
        const stop = fila[idxStoppers];
        const rang = fila[idxRango];
        const back = fila[idxBacklog];
        return coincideBase(fila) &&
            (departamentosSeleccionados.length === 0 || departamentosSeleccionados.includes(depart)) &&
            (afectacionesSeleccionadas.length === 0 || afectacionesSeleccionadas.includes(afec)) &&
            (stoppersSeleccionados.length === 0 || stoppersSeleccionados.includes(stop)) &&
            (rangosSeleccionados.length === 0 || rangosSeleccionados.includes(rang)) &&
            (backlogsSeleccionados.length === 0 || backlogsSeleccionados.includes(back));
    });

    const datosParaBacklog = datosGlobal.filter(fila => {
        const otVal = fila[idxOT];
        const regD1 = (window.registrosD1 || {})[otVal] || {};
        const fechaProgVal = regD1.fechaProgramacion || "";
        return coincideBase(fila) &&
            (departamentosSeleccionados.length === 0 || departamentosSeleccionados.includes(fila[idxDepto])) &&
            (afectacionesSeleccionadas.length === 0 || afectacionesSeleccionadas.includes(fila[idxAfectacion])) &&
            (stoppersSeleccionados.length === 0 || stoppersSeleccionados.includes(fila[idxStoppers])) &&
            (rangosSeleccionados.length === 0 || rangosSeleccionados.includes(fila[idxRango])) &&
            (fechasProgSeleccionadas.length === 0 || fechasProgSeleccionadas.includes(fechaProgVal));
    });

    departamentosSeleccionados = departamentosSeleccionados.filter(dep => datosParaDepto.some(f => f[idxDepto] === dep));
    afectacionesSeleccionadas = afectacionesSeleccionadas.filter(val => datosParaAfectacion.some(f => f[idxAfectacion] === val));
    stoppersSeleccionados = stoppersSeleccionados.filter(val => datosParaStoppers.some(f => f[idxStoppers] === val));
    rangosSeleccionados = rangosSeleccionados.filter(val => datosParaRango.some(f => f[idxRango] === val));
    
    fechasProgSeleccionadas = fechasProgSeleccionadas.filter(val => {
        return datosParaFechaProg.some(f => {
            const reg = (window.registrosD1 || {})[f[idxOT]] || {};
            return (reg.fechaProgramacion || "") === val;
        });
    });

    backlogsSeleccionados = backlogsSeleccionados.filter(val => datosParaBacklog.some(f => f[idxBacklog] === val));

    const txtDepto = document.getElementById("textoDepartamento");
    if (txtDepto) txtDepto.textContent = departamentosSeleccionados.length ? `Departamento (${departamentosSeleccionados.length})` : "Departamento";

    const txtAfec = document.getElementById("textoAfectacion");
    if (txtAfec) txtAfec.textContent = afectacionesSeleccionadas.length === 0 ? "Tipo de afectación" : `Afectación (${afectacionesSeleccionadas.length})`;

    const txtStop = document.getElementById("textoStoppers");
    if (txtStop) txtStop.textContent = stoppersSeleccionados.length === 0 ? "Stoppers" : `Stoppers (${stoppersSeleccionados.length})`;

    const txtRang = document.getElementById("textoRango");
    if (txtRang) txtRang.textContent = rangosSeleccionados.length === 0 ? "Rango de afectación" : `Rango (${rangosSeleccionados.length})`;

    const txtFP = document.getElementById("textoFechaProg");
    if (txtFP) txtFP.textContent = fechasProgSeleccionadas.length === 0 ? "Fecha programación" : (fechasProgSeleccionadas.length === 1 ? fechasProgSeleccionadas[0] : `Fecha (${fechasProgSeleccionadas.length})`);

    const txtBack = document.getElementById("textoBacklog");
    if (txtBack) txtBack.textContent = backlogsSeleccionados.length === 0 ? "Indicador backlog" : `Backlog (${backlogsSeleccionados.length})`;

    const txtEstadoG = document.getElementById("textoEstadoGestion") || document.getElementById("textoEstado");
    if (txtEstadoG) txtEstadoG.textContent = estadosGestionSeleccionados.length === 0 ? "Estado gestión" : `Estado (${estadosGestionSeleccionados.length})`;

    const deptosDisp = [...new Set(datosParaDepto.map(f => f[idxDepto]))].filter(Boolean).sort();
    const dEl = document.getElementById("listaDepartamento");
    if(dEl) {
        dEl.innerHTML = `
            <input type="text" id="buscarDepartamento" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarDepartamento">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodosDeptos"> (Seleccionar todo)</label>
        ` + deptosDisp.map(dep => `
            <label class="multi-filtro-item"><input type="checkbox" value="${dep}" class="chkDepartamento" ${departamentosSeleccionados.includes(dep) ? "checked" : ""}> ${dep}</label>
        `).join("");
    }

    const afecDisp = [...new Set(datosParaAfectacion.map(f => f[idxAfectacion]))].filter(Boolean).sort();
    const aEl = document.getElementById("listaAfectacion");
    if(aEl) {
        aEl.innerHTML = `
            <input type="text" id="buscarAfectacion" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarAfectacion">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodasAfectaciones"> (Seleccionar todo)</label>
        ` + afecDisp.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkAfectacion" ${afectacionesSeleccionadas.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
    }

    const stopDisp = [...new Set(datosParaStoppers.map(f => f[idxStoppers]))].filter(Boolean).sort();
    const sEl = document.getElementById("listaStoppers");
    if(sEl) {
        sEl.innerHTML = `
            <input type="text" id="buscarStoppers" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarStoppers">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodosStoppers"> (Seleccionar todo)</label>
        ` + stopDisp.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkStoppers" ${stoppersSeleccionados.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
    }

    const rangDisp = [...new Set(datosParaRango.map(f => f[idxRango]))].filter(Boolean).sort();
    const rEl = document.getElementById("listaRango");
    if(rEl) {
        rEl.innerHTML = `
            <input type="text" id="buscarRango" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarRango">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodosRangos"> (Seleccionar todo)</label>
        ` + rangDisp.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkRango" ${rangosSeleccionados.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
    }

    const mesesNombres = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const arbolFechas = {};
    
    datosParaFechaProg.forEach(f => {
        const reg = (window.registrosD1 || {})[f[idxOT]] || {};
        const fechaVal = reg.fechaProgramacion;
        if (fechaVal && /^\d{4}-\d{2}-\d{2}$/.test(fechaVal)) {
            const [anio, mes, dia] = fechaVal.split("-");
            if (!arbolFechas[anio]) arbolFechas[anio] = {};
            if (!arbolFechas[anio][mes]) arbolFechas[anio][mes] = [];
            if (!arbolFechas[anio][mes].includes(fechaVal)) {
                arbolFechas[anio][mes].push(fechaVal);
            }
        }
    });

    const fpEl = document.getElementById("listaFechaProg");
    if(fpEl) {
        let htmlJerarquico = `
            <input type="text" id="buscarFechaProg" class="buscar-multifiltro" placeholder="Buscar fecha...">
            <div class="multi-filtro-reset" id="btnLimpiarFechaProg">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodasFechasProg"> (Seleccionar todo)</label>
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
                    const estaChequeado = fechasProgSeleccionadas.includes(fechaStr) ? "checked" : "";
                    htmlJerarquico += `
                                <label class="multi-filtro-item" style="padding-left: 30px; display: block;">
                                    <input type="checkbox" value="${fechaStr}" class="chkFechaProg" ${estaChequeado}> ${dia}
                                </label>`;
                });

                htmlJerarquico += `</div></div>`;
            });

            htmlJerarquico += `</div></div>`;
        });

        fpEl.innerHTML = htmlJerarquico;
    }

    const backDisp = [...new Set(datosParaBacklog.map(f => f[idxBacklog]))].filter(Boolean).sort();
    const bEl = document.getElementById("listaBacklog");
    if(bEl) {
        bEl.innerHTML = `
            <input type="text" id="buscarBacklog" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarBacklog">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodosBacklog"> (Seleccionar todo)</label>
        ` + backDisp.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkBacklog" ${backlogsSeleccionados.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
    }

    const estadosGestionList = ["Gestionable", "Operativa", "FM/traslado/reubicación", "Abastecimiento", "Falla Tx", "Receso escolar"];
    const egEl = document.getElementById("listaEstadoGestion") || document.getElementById("listaEstado");
    if(egEl) {
        egEl.innerHTML = `
            <input type="text" id="buscarEstadoGestion" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarEstadoGestion">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodosEstadosGestion"> (Seleccionar todo)</label>
        ` + estadosGestionList.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkEstadoGestion" ${estadosGestionSeleccionados.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
    }
}

function aplicarFiltros(){
    actualizarOpcionesFiltros(datosGlobal);

    const filtroBusquedaEl = document.getElementById("filtroBusqueda");
    const texto = filtroBusquedaEl ? filtroBusquedaEl.value.toLowerCase() : "";

    const deptos = departamentosSeleccionados;
    const afectacionesFiltro = afectacionesSeleccionadas;
    const stoppersFiltro = stoppersSeleccionados;
    const rangosFiltro = rangosSeleccionados;
    const fechasFiltro = fechasProgSeleccionadas;
    const backlogsFiltro = backlogsSeleccionados;
    const estGestionFiltro = estadosGestionSeleccionados;

    const encabezados = encabezadosGlobal;
    const idxID = encabezados.findIndex(h => h.trim() === "ID");
    const idxOT = encabezados.findIndex(h => h.trim() === "OT");
    const idxMunicipio = encabezados.findIndex(h => h.trim() === "Municipio");
    const idxDepto = encabezados.findIndex(h => h.trim() === "Departamento");
    const idxPrioridad = encabezados.findIndex(h => h.trim() === "Tipo de prioridad");
    const idxAfectacion = encabezados.findIndex(h => h.trim() === "Tipo de afectación");
    const idxStoppers = encabezados.findIndex(h => h.trim() === "Stoppers Dominion");
    const idxRango = encabezados.findIndex(h => h.trim() === "Rango de afectación");
    const idxBacklog = encabezados.findIndex(h => h.trim() === "Indicador backlog");

    const resultado = datosGlobal.filter(fila => {
        const otVal = fila[idxOT];
        const regD1 = (window.registrosD1 || {})[otVal] || {};
        const estG = regD1.estadoGestion || "";
        const fechaProgVal = regD1.fechaProgramacion || "";
        const prioridadVal = (fila[idxPrioridad] || "").trim().toUpperCase();
        const backlogVal = (fila[idxBacklog] || "").trim().toUpperCase();

        const cumpleTexto = !texto || 
            String(fila[idxID] || "").toLowerCase().includes(texto) ||
            String(fila[idxOT] || "").toLowerCase().includes(texto) ||
            String(fila[idxMunicipio] || "").toLowerCase().includes(texto);

        const cumpleDepto = deptos.length === 0 || deptos.includes(fila[idxDepto]);
        const cumpleAfectacion = afectacionesFiltro.length === 0 || afectacionesFiltro.includes(fila[idxAfectacion]);
        const cumpleStoppers = stoppersFiltro.length === 0 || stoppersFiltro.includes(fila[idxStoppers]);
        const cumpleRango = rangosFiltro.length === 0 || rangosFiltro.includes(fila[idxRango]);
        const cumpleFechaProg = fechasFiltro.length === 0 || fechasFiltro.includes(fechaProgVal);
        const cumpleBacklog = backlogsFiltro.length === 0 || backlogsFiltro.includes(fila[idxBacklog]);
        const cumpleEstGestion = estGestionFiltro.length === 0 || estGestionFiltro.includes(estG);

        let cumpleKpi = true;
        if (kpiFiltroActivo === "alta") cumpleKpi = (prioridadVal === "ALTA");
        if (kpiFiltroActivo === "media") cumpleKpi = (prioridadVal === "MEDIA");
        if (kpiFiltroActivo === "baja") cumpleKpi = (prioridadVal === "BAJA");
        if (kpiFiltroActivo === "cumple") cumpleKpi = (backlogVal === "CUMPLE");
        if (kpiFiltroActivo === "nocumple") cumpleKpi = (backlogVal === "NO CUMPLE");
        if (kpiFiltroActivo === "programados") cumpleKpi = (regD1.estadoProgramacion === "Programada" || regD1.estadoProgramacion === "Operativa");

        return cumpleTexto && cumpleDepto && cumpleAfectacion && cumpleStoppers && cumpleRango && cumpleFechaProg && cumpleBacklog && cumpleEstGestion && cumpleKpi;
    });

    datosFiltradosGlobal = resultado;
    pintarTabla(resultado);
    actualizarKPIs(resultado);
}

function resetearTodosLosFiltros() {
    departamentosSeleccionados = [];
    afectacionesSeleccionadas = [];
    stoppersSeleccionados = [];
    rangosSeleccionados = [];
    fechasProgSeleccionadas = [];
    backlogsSeleccionados = [];
    estadosGestionSeleccionados = [];
    kpiFiltroActivo = null;

    document.querySelectorAll(".kpi-card, .card").forEach(c => {
        c.classList.remove("kpi-seleccionado");
        c.style.borderColor = "";
        c.style.boxShadow = "";
    });

    const contenedorKpis = document.getElementById("kpis");
    if (contenedorKpis) contenedorKpis.classList.remove("kpi-container-activo");

    const filtroBusquedaEl = document.getElementById("filtroBusqueda");
    if(filtroBusquedaEl) filtroBusquedaEl.value = "";

    document.querySelectorAll(".multi-filtro-lista input[type='checkbox']").forEach(chk => {
        chk.checked = false;
    });

    aplicarFiltros();
}

document.addEventListener("input", (e) => {
    if(e.target.id === "filtroBusqueda") {
        aplicarFiltros();
    }
    if(e.target.classList && e.target.classList.contains("buscar-multifiltro")) {
        const textoBusq = e.target.value.toLowerCase();
        const contenedor = e.target.closest("div");
        if(contenedor) {
            contenedor.querySelectorAll(".multi-filtro-item").forEach(item => {
                const contenido = item.textContent.toLowerCase();
                item.style.display = contenido.includes(textoBusq) ? "" : "none";
            });
        }
    }
});

document.addEventListener("change", (e) => {
    const target = e.target;

    if (target.classList.contains("chkDepartamento")) {
        departamentosSeleccionados = Array.from(document.querySelectorAll(".chkDepartamento:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }
    if (target.id === "chkTodosDeptos") {
        document.querySelectorAll(".chkDepartamento").forEach(chk => chk.checked = target.checked);
        departamentosSeleccionados = Array.from(document.querySelectorAll(".chkDepartamento:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }

    if (target.classList.contains("chkAfectacion")) {
        afectacionesSeleccionadas = Array.from(document.querySelectorAll(".chkAfectacion:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }
    if (target.id === "chkTodasAfectaciones") {
        document.querySelectorAll(".chkAfectacion").forEach(chk => chk.checked = target.checked);
        afectacionesSeleccionadas = Array.from(document.querySelectorAll(".chkAfectacion:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }

    if (target.classList.contains("chkStoppers")) {
        stoppersSeleccionados = Array.from(document.querySelectorAll(".chkStoppers:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }
    if (target.id === "chkTodosStoppers") {
        document.querySelectorAll(".chkStoppers").forEach(chk => chk.checked = target.checked);
        stoppersSeleccionados = Array.from(document.querySelectorAll(".chkStoppers:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }

    if (target.classList.contains("chkRango")) {
        rangosSeleccionados = Array.from(document.querySelectorAll(".chkRango:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }
    if (target.id === "chkTodosRangos") {
        document.querySelectorAll(".chkRango").forEach(chk => chk.checked = target.checked);
        rangosSeleccionados = Array.from(document.querySelectorAll(".chkRango:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }

    if (target.classList.contains("chkFechaProg")) {
        fechasProgSeleccionadas = Array.from(document.querySelectorAll(".chkFechaProg:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }
    if (target.id === "chkTodasFechasProg") {
        document.querySelectorAll(".chkFechaProg").forEach(chk => chk.checked = target.checked);
        fechasProgSeleccionadas = Array.from(document.querySelectorAll(".chkFechaProg:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }

    if (target.classList.contains("chkBacklog")) {
        backlogsSeleccionados = Array.from(document.querySelectorAll(".chkBacklog:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }
    if (target.id === "chkTodosBacklog") {
        document.querySelectorAll(".chkBacklog").forEach(chk => chk.checked = target.checked);
        backlogsSeleccionados = Array.from(document.querySelectorAll(".chkBacklog:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }

    if (target.classList.contains("chkEstadoGestion")) {
        estadosGestionSeleccionados = Array.from(document.querySelectorAll(".chkEstadoGestion:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }
    if (target.id === "chkTodosEstadosGestion") {
        document.querySelectorAll(".chkEstadoGestion").forEach(chk => chk.checked = target.checked);
        estadosGestionSeleccionados = Array.from(document.querySelectorAll(".chkEstadoGestion:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }

    if(target.classList.contains("estado-programacion")){
        const fila = target.closest("tr");
        const fecha = fila.querySelector(".fecha-input");
        const valor = target.value;

        if(valor === "Programada" || valor === "Cancelada" || valor === "Operativa"){
            fecha.type = "date";
            fecha.disabled = false;
            if(!fecha.value || fecha.value.includes("Definir") || fecha.value.includes("validación") || fecha.value.includes("aplica")) {
                fecha.value = "";
            }
        } else if(valor === "Pendiente"){
            fecha.type = "text";
            fecha.disabled = true;
            fecha.value = "En validación";
        } else if(valor === "N/A" || valor === "Postular FM" || valor === "Postular abast."){
            fecha.type = "text";
            fecha.disabled = true;
            fecha.value = "No aplica";
        } else if(valor === ""){
            fecha.type = "text";
            fecha.disabled = true;
            fecha.value = "⟵ Definir estado";
        }
    }

    const filaTabla = target.closest("tr");
    if(filaTabla && !target.closest(".multi-filtro-item")) {
        guardarOT(filaTabla);
    }
});

document.addEventListener("click", (e) => {
    const target = e.target;

    // Manejar botón de agrupar/desagrupar columnas con alternancia limpia y segura
    const btnGrupo = target.closest("#btnToggleGrupoCols");
    if (btnGrupo) {
        grupoColumnasColapsado = !grupoColumnasColapsado;
        aplicarEstadoGrupoColumnas();
        return;
    }

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

    const kpiCard = target.closest(".kpi-card, .card");
    if (kpiCard && !target.closest("input, select, button")) {
        const valorEl = kpiCard.querySelector("[id^='kpi']");
        if (valorEl) {
            const idKpi = valorEl.id;
            let tipoFiltro = null;

            if (idKpi === "kpiAltaPlaneacion") tipoFiltro = "alta";
            else if (idKpi === "kpiMediaPlaneacion") tipoFiltro = "media";
            else if (idKpi === "kpiBajaPlaneacion") tipoFiltro = "baja";
            else if (idKpi === "kpiCumpleBacklog") tipoFiltro = "cumple";
            else if (idKpi === "kpiNoCumpleBacklog") tipoFiltro = "nocumple";
            else if (idKpi === "kpiProgramadosD1") tipoFiltro = "programados";

            if (tipoFiltro) {
                const contenedorKpis = kpiCard.closest("#kpis") || kpiCard.parentElement;

                if (kpiFiltroActivo === tipoFiltro) {
                    kpiFiltroActivo = null;
                    kpiCard.classList.remove("kpi-seleccionado");
                    if (contenedorKpis) contenedorKpis.classList.remove("kpi-container-activo");
                } else {
                    kpiFiltroActivo = tipoFiltro;
                    document.querySelectorAll(".kpi-card, .card").forEach(c => {
                        c.classList.remove("kpi-seleccionado");
                    });
                    kpiCard.classList.add("kpi-seleccionado");
                    if (contenedorKpis) contenedorKpis.classList.add("kpi-container-activo");
                }
                aplicarFiltros();
                return;
            }
        }
    }

    if (target.closest("#btnLimpiarHeader, .btn-limpiar-header")) {
        resetearTodosLosFiltros();
        return;
    }

    if(target.id === "btnLimpiarDepartamento") {
        document.querySelectorAll(".chkDepartamento").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodosDeptos");
        if(chkAll) chkAll.checked = false;
        departamentosSeleccionados = [];
        aplicarFiltros();
    }
    if(target.id === "btnLimpiarAfectacion") {
        document.querySelectorAll(".chkAfectacion").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodasAfectaciones");
        if(chkAll) chkAll.checked = false;
        afectacionesSeleccionadas = [];
        aplicarFiltros();
    }
    if(target.id === "btnLimpiarStoppers") {
        document.querySelectorAll(".chkStoppers").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodosStoppers");
        if(chkAll) chkAll.checked = false;
        stoppersSeleccionados = [];
        aplicarFiltros();
    }
    if(target.id === "btnLimpiarRango") {
        document.querySelectorAll(".chkRango").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodosRangos");
        if(chkAll) chkAll.checked = false;
        rangosSeleccionados = [];
        aplicarFiltros();
    }
    if(target.id === "btnLimpiarFechaProg") {
        document.querySelectorAll(".chkFechaProg").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodasFechasProg");
        if(chkAll) chkAll.checked = false;
        fechasProgSeleccionadas = [];
        aplicarFiltros();
    }
    if(target.id === "btnLimpiarBacklog") {
        document.querySelectorAll(".chkBacklog").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodosBacklog");
        if(chkAll) chkAll.checked = false;
        backlogsSeleccionados = [];
        aplicarFiltros();
    }
    if(target.id === "btnLimpiarEstadoGestion" || target.id === "btnLimpiarEstado") {
        document.querySelectorAll(".chkEstadoGestion").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodosEstadosGestion");
        if(chkAll) chkAll.checked = false;
        estadosGestionSeleccionados = [];
        aplicarFiltros();
    }

    const dropdowns = [
        { btn: "btnDepartamento", lista: "listaDepartamento" },
        { btn: "btnAfectacion", lista: "listaAfectacion" },
        { btn: "btnStoppers", lista: "listaStoppers" },
        { btn: "btnRango", lista: "listaRango" },
        { btn: "btnFechaProg", lista: "listaFechaProg" },
        { btn: "btnBacklog", lista: "listaBacklog" },
        { btn: "btnEstadoGestion", lista: "listaEstadoGestion" },
        { btn: "btnEstado", lista: "listaEstado" }
    ];

    dropdowns.forEach(item => {
        const botonEl = document.getElementById(item.btn);
        const listaEl = document.getElementById(item.lista);
        if(botonEl && listaEl) {
            if(botonEl.contains(target)) {
                listaEl.classList.toggle("show");
            } else if(!listaEl.contains(target)) {
                listaEl.classList.remove("show");
            }
        }
    });
});

document.addEventListener("blur", async e => {
    if(!e.target.classList.contains("fecha-input")) return;
    const fila = e.target.closest("tr");
    if(!fila) return;
    await guardarOT(fila);
}, true);

async function guardarOT(fila, observacionForzada = null){
    const ot = fila.children[4].textContent.trim();
    
    const inputFecha = fila.querySelector(".fecha-input");
    let fechaVal = inputFecha?.value || "";
    if(inputFecha && (fechaVal.includes("Definir") || fechaVal.includes("validación") || fechaVal.includes("aplica"))) {
        fechaVal = "";
    }

    const inputObs = fila.querySelector(".observacion");
    const obsFinal = observacionForzada !== null ? observacionForzada : (window.registrosD1[ot]?.observacion || inputObs?.value || "");

    const payload = {
        ot,
        estadoProgramacion: fila.querySelector(".estado-programacion")?.value || "",
        fechaProgramacion: fechaVal,
        observacion: obsFinal,
        estadoGestion: fila.querySelector(".estado-gestion")?.value || "",
        tecnicoAsignado: fila.querySelector(".tecnico-asignado")?.value || "",
        acompanamiento: fila.querySelector(".acompanamiento")?.value || ""
    };

    try {
        const resp = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const resultado = await resp.json();

        if (resultado.ok) {
            window.registrosD1 = window.registrosD1 || {};
            window.registrosD1[payload.ot] = {
                ot: payload.ot,
                estadoProgramacion: payload.estadoProgramacion,
                fechaProgramacion: payload.fechaProgramacion,
                observacion: payload.observacion,
                estadoGestion: payload.estadoGestion,
                tecnicoAsignado: payload.tecnicoAsignado,
                acompanamiento: payload.acompanamiento,
                updatedAt: new Date().toISOString()
            };
            aplicarFiltros();
        }
    } catch (err) {
        console.error("Error al guardar OT:", err);
    }
}

const wrapper = document.querySelector('.planeacion-table-wrapper');
let scrollTimer;
if(wrapper) {
    wrapper.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            const firstRow = wrapper.querySelector('tbody tr');
            if (!firstRow) return;
            const rowHeight = firstRow.offsetHeight;
            const target = Math.round(wrapper.scrollTop / rowHeight) * rowHeight;
            wrapper.scrollTo({ top: target, behavior: 'smooth' });
        }, 80);
    });
}

window.addEventListener("load", () => {
    const topScroll = document.querySelector(".planeacion-scroll-top");
    const tableWrapper = document.querySelector(".planeacion-table-wrapper");
    const topScrollInner = document.querySelector(".planeacion-scroll-top-inner");

    if (!topScroll || !tableWrapper || !topScrollInner) return;

    function ajustarAnchoBarra() {
        const maxScrollTabla = tableWrapper.scrollWidth - tableWrapper.clientWidth;
        if (maxScrollTabla > 0) {
            topScrollInner.style.width = (topScroll.clientWidth + maxScrollTabla) + "px";
        }
    }

    ajustarAnchoBarra();
    window.addEventListener("resize", ajustarAnchoBarra);
    setTimeout(ajustarAnchoBarra, 400);

    let syncing = false;

    topScroll.addEventListener("scroll", () => {
        if (syncing) return;
        syncing = true;
        const maxScrollTabla = tableWrapper.scrollWidth - tableWrapper.clientWidth;
        const maxScrollBarra = topScroll.scrollWidth - topScroll.clientWidth;
        
        if (maxScrollBarra > 0) {
            const porcentaje = topScroll.scrollLeft / maxScrollBarra;
            tableWrapper.scrollLeft = porcentaje * maxScrollTabla;
        }
        syncing = false;
    });

    tableWrapper.addEventListener("scroll", () => {
        if (syncing) return;
        syncing = true;
        const maxScrollTabla = tableWrapper.scrollWidth - tableWrapper.clientWidth;
        const maxScrollBarra = topScroll.scrollWidth - topScroll.clientWidth;
        
        if (maxScrollTabla > 0 && maxScrollBarra > 0) {
            const porcentaje = tableWrapper.scrollLeft / maxScrollTabla;
            topScroll.scrollLeft = porcentaje * maxScrollBarra;
        }
        syncing = false;
    });
});

function actualizarStickyTabla() {
    const header = document.querySelector('.planeacion-header');
    const filtros = document.querySelector('.planeacion-filtros-sticky');
    if (!header || !filtros) return;

    const alturaHeader = header.offsetHeight;
    const alturaFiltros = filtros.offsetHeight;

    document.documentElement.style.setProperty(
        '--sticky-table-top',
        `${alturaHeader + alturaFiltros}px`
    );
}

window.addEventListener('load', actualizarStickyTabla);
window.addEventListener('resize', actualizarStickyTabla);

function detectarZoom() {
    const zoom = Math.round(window.devicePixelRatio * 100);
    document.body.classList.toggle('zoom-alto', zoom > 105);
}
window.addEventListener('resize', detectarZoom);
detectarZoom();

document.addEventListener("click", (e) => {
    const botonZoom = e.target.closest("#btnExpandirTabla, #btnZoom");

    if (botonZoom) {
        e.preventDefault();
        document.body.classList.toggle("modo-ampliado");
        document.body.classList.toggle("modo-zoom");
        document.querySelector(".panel")?.classList.toggle("panel-zoom");
    }
});

window.exportarPlaneacion = function() {
    try {
        if (typeof datosGlobal === "undefined" || !datosGlobal.length) {
            alert("No hay datos cargados para exportar todavía.");
            return;
        }

        const exportRegionEl = document.getElementById("exportRegion");
        const region = exportRegionEl ? exportRegionEl.value : "TODOS";

        let filas = [...datosGlobal];

        const buscarIndice = (nombre) =>
            encabezadosGlobal.findIndex(h => String(h).trim() === nombre);

        const idxDepto = buscarIndice("Departamento");

        if (region === "R1" && idxDepto !== -1) {
            filas = filas.filter(fila =>
                ["CESAR", "LA GUAJIRA", "SAI"].includes(
                    String(fila[idxDepto] || "").trim().toUpperCase()
                )
            );
        }

        if (region === "R2" && idxDepto !== -1) {
            filas = filas.filter(fila =>
                String(fila[idxDepto] || "").trim().toUpperCase() === "ANTIOQUIA"
            );
        }

        const headers = [
            "ID", "Departamento", "Municipio", "IM", "OT", "Afectacion", "Total_IDs",
            "Dias_OT", "Rango_Afectacion", "Prioridad", "Stoppers_Dominion",
            "Estado_Programacion", "Fecha_Programacion", "Observaciones",
            "Estado_Gestion", "Indicador_Backlog", "Stopper_P3", "Tipo_Facturacion",
            "Fecha_Vencimiento_FM", "Alerta_Vencimiento_FM"
        ];

        let registrosProcesados = filas.map(fila => {
            const getValor = (nombre) => {
                const index = buscarIndice(nombre);
                return index !== -1 ? (fila[index] ?? "") : "";
            };

            const otValor = getValor("OT");
            const regD1 = window.registrosD1 && window.registrosD1[otValor] ? window.registrosD1[otValor] : {};

            let valorFechaExportar = "";
            let esFechaReal = false;
            const estadoProg = regD1.estadoProgramacion || "";
            const fechaStr = regD1.fechaProgramacion ? String(regD1.fechaProgramacion).trim() : "";
            const regexFecha = /^(\d{4})-(\d{2})-(\d{2})$/;

            if ((estadoProg === "Programada" || estadoProg === "Cancelada" || estadoProg === "Operativa") && regexFecha.test(fechaStr)) {
                const [, year, month, day] = fechaStr.match(regexFecha);
                valorFechaExportar = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0));
                esFechaReal = true;
            } else {
                if (estadoProg === "Pendiente") {
                    valorFechaExportar = "En validación";
                } else if (estadoProg === "N/A" || estadoProg === "Postular FM" || estadoProg === "Postular abast.") {
                    valorFechaExportar = "No aplica";
                } else {
                    valorFechaExportar = "⟵ Definir estado";
                }
            }

            return {
                filaOriginal: fila,
                esFechaReal: esFechaReal,
                valorFechaExportar: valorFechaExportar,
                regD1: regD1,
                otValor: otValor
            };
        });

        registrosProcesados.sort((a, b) => {
            if (a.esFechaReal && !b.esFechaReal) return -1;
            if (!a.esFechaReal && b.esFechaReal) return 1;
            return 0;
        });

        const dataAOA = [];
        dataAOA.push([...headers]);

        registrosProcesados.forEach(item => {
            const getValor = (nombre) => {
                const index = buscarIndice(nombre);
                return index !== -1 ? (item.filaOriginal[index] ?? "") : "";
            };

            const limpiarTexto = (t) => t ? String(t).replace(/[\r\n]+/g, " | ").replace(/\s+/g, " ").trim() : "";

            dataAOA.push([
                getValor("ID"), getValor("Departamento"), getValor("Municipio"),
                getValor("IM"), item.otValor, getValor("Tipo de afectación"),
                getValor("IDs afectados"), getValor("Días OT"), getValor("Rango de afectación"),
                getValor("Tipo de prioridad"), getValor("Stoppers Dominion"),
                limpiarTexto(item.regD1.estadoProgramacion), item.valorFechaExportar,
                limpiarTexto(item.regD1.observacion), limpiarTexto(item.regD1.estadoGestion),
                getValor("Indicador backlog"), getValor("Stopper P3"),
                getValor("Tipo facturación"), getValor("Fecha vencimiento FM"),
                getValor("Alerta vencimiento FM")
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(dataAOA);

        if (ws && ws['!ref']) {
            const rango = XLSX.utils.decode_range(ws['!ref']);
            const colFechaIdx = 12;

            for (let R = rango.s.r + 1; R <= rango.e.r; ++R) {
                const celdaRef = XLSX.utils.encode_cell({ r: R, c: colFechaIdx });
                const celda = ws[celdaRef];
                if (celda && celda.v instanceof Date) {
                    celda.t = 'd';
                    celda.z = 'dd/mm/yyyy';
                }
            }

            ws['!autofilter'] = { ref: ws['!ref'] };
            ws['!freeze'] = { xSplit: 0, ySplit: 1 };
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Planeacion");

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        XLSX.writeFile(wb, `Planeacion_${region}_${timestamp}.xlsx`);

    } catch (error) {
        console.error("❌ Error detallado al exportar:", error);
        alert("Ocurrió un error al exportar el archivo.");
    }
};

let filaActualModal = null;

document.addEventListener("click", (e) => {
    const btnEditar = e.target.closest(".btn-abrir-modal-obs");

    if (btnEditar) {
        const fila = btnEditar.closest("tr");
        filaActualModal = fila;
        
        const ot = btnEditar.getAttribute("data-ot");
        const id = btnEditar.getAttribute("data-id");
        const depto = btnEditar.getAttribute("data-depto");
        const muni = btnEditar.getAttribute("data-muni");
        const afec = btnEditar.getAttribute("data-afec");
        
        const inputObs = fila.querySelector(".observacion");
        const modal = document.getElementById("modalObservacion");
        const txtArea = document.getElementById("textareaModalObs");
        
        const spanOt = document.getElementById("modalValOt");
        const spanId = document.getElementById("modalValId");
        const spanDepto = document.getElementById("modalValDepto");
        const spanMuni = document.getElementById("modalValMuni");
        const spanAfec = document.getElementById("modalValAfec");

       if (modal && txtArea) {
            if (spanOt) spanOt.textContent = ot || "--";
            if (spanId) spanId.textContent = id || "--";
            if (spanDepto) spanDepto.textContent = depto || "--";
            if (spanMuni) spanMuni.textContent = muni || "--";
            if (spanAfec) spanAfec.textContent = afec || "--";

            const registroActual = window.registrosD1[ot] || {};
            let textoGuardado = registroActual.observacion || inputObs?.value || "";

            if (textoGuardado.includes(" • ")) {
                textoGuardado = textoGuardado.replace(/\s*•\s*/g, "\n");
            } else if (textoGuardado.includes(" | ")) {
                textoGuardado = textoGuardado.replace(/\s*\|\s*/g, "\n");
            }

            txtArea.value = textoGuardado;
            modal.style.display = "grid";
            txtArea.focus();
        }
    }

    if (e.target.id === "cerrarModalObs" || e.target.id === "btnCancelarObs") {
        const modal = document.getElementById("modalObservacion");
        if (modal) modal.style.display = "none";
    }

    if (e.target.id === "btnGuardarObs") {
        const txtArea = document.getElementById("textareaModalObs");
        if (filaActualModal && txtArea) {
            const ot = filaActualModal.children[4].textContent.trim();
            const textoConSaltos = txtArea.value;

            window.registrosD1[ot] = window.registrosD1[ot] || {};
            window.registrosD1[ot].observacion = textoConSaltos;

            const inputObs = filaActualModal.querySelector(".observacion");
            if (inputObs) {
                inputObs.value = textoConSaltos.replace(/(\r\n|\n|\r)/g, " | ");
            }

            if (typeof guardarOT === "function") {
                guardarOT(filaActualModal, textoConSaltos);
            }
        }
        const modal = document.getElementById("modalObservacion");
        if (modal) modal.style.display = "none";
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        const modal = document.getElementById("modalObservacion");
        if (modal && modal.style.display === "grid") {
            modal.style.display = "none";
        }
    }
});

let scrollInterval = null;

function iniciarScroll(direccion) {
    const tableWrapper = document.querySelector(".planeacion-table-wrapper");
    const topScroll = document.querySelector(".planeacion-scroll-top");
    
    if (!tableWrapper) return;

    const step = 20;
    tableWrapper.scrollLeft += direccion * step;
    if (topScroll) {
        topScroll.scrollLeft += direccion * step;
    }
}

document.addEventListener("mousedown", (e) => {
    const btnLeft = e.target.closest("#scrollLeftTopBtn");
    const btnRight = e.target.closest("#scrollRightTopBtn");

    if (btnLeft || btnRight) {
        const direccion = btnLeft ? -1 : 1;
        iniciarScroll(direccion);
        scrollInterval = setInterval(() => {
            iniciarScroll(direccion);
        }, 30);
    }
});

document.addEventListener("mouseup", () => {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
});

function ajustarAnchoScrollSuperior() {
    const tableWrapper = document.querySelector(".planeacion-table-wrapper");
    const topScroll = document.querySelector(".planeacion-scroll-top");
    const topScrollInner = document.querySelector(".planeacion-scroll-top-inner");

    if (tableWrapper && topScroll && topScrollInner) {
        const maxScrollTabla = tableWrapper.scrollWidth - tableWrapper.clientWidth;
        const anchoPerfecto = topScroll.clientWidth + maxScrollTabla;
        topScrollInner.style.width = anchoPerfecto + "px";
    }
}

window.addEventListener("load", ajustarAnchoScrollSuperior);
window.addEventListener("resize", ajustarAnchoScrollSuperior);
setTimeout(ajustarAnchoScrollSuperior, 300);

document.addEventListener("DOMContentLoaded", () => {
    const inputExcel = document.getElementById("inputExcelMasivo");
    const containerProgreso = document.getElementById("containerProgresoMasivo");
    const textoProgreso = document.getElementById("textoProgreso");
    const barraProgresoAnimada = document.getElementById("barraProgresoAnimada");
    const porcentajeProgreso = document.getElementById("porcentajeProgreso");

    if (inputExcel) {
        inputExcel.addEventListener("change", async (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;

            const confirmar = window.confirm(`Se procesará el archivo. ¿Deseas actualizar masivamente las observaciones y fechas con "${archivo.name}"?`);
            
            if (!confirmar) {
                inputExcel.value = "";
                return;
            }

            if (containerProgreso) containerProgreso.style.display = "block";
            if (textoProgreso) textoProgreso.textContent = `Procesando "${archivo.name}"...`;
            
            let porcentajeActual = 0;
            if (barraProgresoAnimada) barraProgresoAnimada.style.width = "0%";
            if (porcentajeProgreso) porcentajeProgreso.textContent = "0%";

            const intervaloProgreso = setInterval(() => {
                if (porcentajeActual < 90) {
                    porcentajeActual += Math.floor(Math.random() * 12) + 4;
                    if (porcentajeActual > 90) porcentajeActual = 90;
                    
                    if (barraProgresoAnimada) barraProgresoAnimada.style.width = porcentajeActual + "%";
                    if (porcentajeProgreso) porcentajeProgreso.textContent = porcentajeActual + "%";
                }
            }, 120);

            const lector = new FileReader();
            lector.onload = async function (evt) {
                try {
                    const datosBinarios = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(datosBinarios, { type: "array" });
                    
                    const nombreHoja = workbook.SheetNames[0];
                    const hoja = workbook.Sheets[nombreHoja];
                    const filasExcel = XLSX.utils.sheet_to_json(hoja, { header: 1 });
                    
                    if (filasExcel.length === 0) {
                        clearInterval(intervaloProgreso);
                        if (containerProgreso) containerProgreso.style.display = "none";
                        alert("El archivo Excel está vacío.");
                        inputExcel.value = "";
                        return;
                    }

                    const encabezadosExcel = filasExcel[0].map(h => String(h).trim());
                    const normalizar = (texto) => String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

                    const idxOT = encabezadosExcel.findIndex(h => normalizar(h) === "OT");
                    const idxObs = encabezadosExcel.findIndex(h => {
                        const n = normalizar(h);
                        return n === "OBSERVACION" || n === "OBSERVACIONES";
                    });

                    const idxFechaProg = encabezadosExcel.findIndex(h => {
                        const n = normalizar(h);
                        return n.includes("FECHA") && (n.includes("PROGRAMACION") || n.includes("PROG")) && !n.includes("FM");
                    });

                    const idxEstadoProg = encabezadosExcel.findIndex(h => {
                        const n = normalizar(h);
                        return n.includes("ESTADO") && n.includes("PROGRAMACION");
                    });

                    if (idxOT === -1) {
                        clearInterval(intervaloProgreso);
                        if (containerProgreso) containerProgreso.style.display = "none";
                        alert("El Excel debe contener obligatoriamente la columna 'OT'.");
                        inputExcel.value = "";
                        return;
                    }

                    const formatearFechaExcelAInput = (valorCrudo) => {
                        if (valorCrudo === undefined || valorCrudo === null || valorCrudo === "") return "";

                        if (valorCrudo instanceof Date) {
                            const y = valorCrudo.getFullYear();
                            const m = String(valorCrudo.getMonth() + 1).padStart(2, "0");
                            const d = String(valorCrudo.getDate()).padStart(2, "0");
                            return `${y}-${m}-${d}`;
                        }

                        if (typeof valorCrudo === "number") {
                            const fechaObj = XLSX.SSF.parse_date_code(valorCrudo);
                            if (fechaObj) {
                                const y = fechaObj.y;
                                const m = String(fechaObj.m).padStart(2, "0");
                                const d = String(fechaObj.d).padStart(2, "0");
                                return `${y}-${m}-${d}`;
                            }
                        }

                        const texto = String(valorCrudo).trim();
                        if (!texto || texto === "-" || texto === "undefined" || texto === "null" || texto === "NaN") return "";

                        if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;

                        const partes = texto.split(/[\/\-]/);
                        if (partes.length === 3) {
                            if (partes[2].length === 4) {
                                const d = partes[0].padStart(2, "0");
                                const m = partes[1].padStart(2, "0");
                                const y = partes[2];
                                return `${y}-${m}-${d}`;
                            }
                            if (partes[0].length === 4) {
                                const y = partes[0];
                                const m = partes[1].padStart(2, "0");
                                const d = partes[2].padStart(2, "0");
                                return `${y}-${m}-${d}`;
                            }
                        }

                        return "";
                    };

                    let actualizados = 0;

                    for (let i = 1; i < filasExcel.length; i++) {
                        const fila = filasExcel[i];
                        const otVal = String(fila[idxOT] || "").trim();

                        if (otVal) {
                            const regD1Actual = window.registrosD1[otVal] || {};
                            const obsVal = idxObs !== -1 && fila[idxObs] !== undefined ? String(fila[idxObs]).trim() : (regD1Actual.observacion || "");
                            
                            let fechaVal = "";
                            if (idxFechaProg !== -1 && fila[idxFechaProg] !== undefined && fila[idxFechaProg] !== null) {
                                fechaVal = formatearFechaExcelAInput(fila[idxFechaProg]);
                            }

                            const esFechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fechaVal);
                            if (!esFechaValida) {
                                fechaVal = "";
                            }

                            let estadoProgVal = regD1Actual.estadoProgramacion || "";

                            if (idxEstadoProg !== -1 && fila[idxEstadoProg]) {
                                estadoProgVal = String(fila[idxEstadoProg]).trim();
                            } else {
                                if (esFechaValida) {
                                    estadoProgVal = "Programada";
                                } else {
                                    if (estadoProgVal === "Programada") {
                                        estadoProgVal = "";
                                    }
                                }
                            }

                            const payload = {
                                ot: otVal,
                                estadoProgramacion: estadoProgVal,
                                fechaProgramacion: fechaVal,
                                observacion: obsVal,
                                estadoGestion: regD1Actual.estadoGestion || "",
                                tecnicoAsignado: regD1Actual.tecnicoAsignado || "",
                                acompanamiento: regD1Actual.acompanamiento || ""
                            };

                            try {
                                const resp = await fetch(API_URL, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload)
                                });
                                const resJson = await resp.json();
                                if (resJson.ok) {
                                    window.registrosD1[otVal] = { ...regD1Actual, ...payload };
                                    actualizados++;
                                }
                            } catch (err) {
                                console.error(`Error al actualizar OT ${otVal}:`, err);
                            }
                        }
                    }

                    clearInterval(intervaloProgreso);
                    if (barraProgresoAnimada) barraProgresoAnimada.style.width = "100%";
                    if (porcentajeProgreso) porcentajeProgreso.textContent = "100%";

                    setTimeout(() => {
                        if (containerProgreso) containerProgreso.style.display = "none";
                        inputExcel.value = "";
                        alert(`¡Carga masiva completada! Se actualizaron ${actualizados} registros.`);
                        aplicarFiltros();
                    }, 300);

                } catch (error) {
                    console.error("Error leyendo el Excel:", error);
                    clearInterval(intervaloProgreso);
                    if (containerProgreso) containerProgreso.style.display = "none";
                    alert("Ocurrió un error al procesar el archivo Excel.");
                    inputExcel.value = "";
                }
            };
            lector.readAsArrayBuffer(archivo);
        });
    }
});
