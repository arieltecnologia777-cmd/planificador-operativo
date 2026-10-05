const DATASET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRUdWw76b-hysCr5vGj2sS6PsMR2a7IuV_7fOL1HO_gaq5Bq-Aa5dqjhGKogvgXR3uH_HHb8oEYqfY_/pub?output=csv";

const API_URL =
"https://planeacion-api.modulo-de-exclusiones.workers.dev/api/planeacion";

let datosGlobal = [];
let encabezadosGlobal = [];
window.registrosD1 = {};

let datosFiltradosGlobal = [];
let departamentosSeleccionados = [];

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

        if (d1.estadoProgramacion === "Programada" || d1.estadoProgramacion === "Cancelada") {
            fechaTipo = "date";
            fechaDisabled = "";
            fechaValor = d1.fechaProgramacion || "";
        } else if (d1.estadoProgramacion === "Pendiente") {
            fechaValor = "En validación";
        } else if (d1.estadoProgramacion === "N/A" || d1.estadoProgramacion === "Postular FM" || d1.estadoProgramacion === "Postular abast.") {
            fechaValor = "No aplica";
        }

        return `
        <tr>
            <td>${fila[idxID] || ""}</td>
            <td>${fila[idxDepto] || ""}</td>
            <td>${fila[idxMunicipio] || ""}</td>
            <td>${fila[idxIM] || ""}</td>
            <td>${fila[idxOT] || ""}</td>
            <td>${fila[idxAfectacion] || ""}</td>
            <td>${fila[idxIdsAfectados] || ""}</td>
            <td>${fila[idxDias] || ""}</td>
            <td>${fila[idxRangoAfectacion] || ""}</td>
            <td>${fila[idxPrioridad] || ""}</td>
            <td>${fila[idxStoppersDominion] || ""}</td>
            <td>
               <select class="edit-select estado-programacion">
                    <option value=""></option>
                    <option value="Programada" ${d1.estadoProgramacion === "Programada" ? "selected" : ""}>Programada</option>
                    <option value="Pendiente" ${d1.estadoProgramacion === "Pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="N/A" ${d1.estadoProgramacion === "N/A" ? "selected" : ""}>N/A</option>
                    <option value="Postular FM" ${d1.estadoProgramacion === "Postular FM" ? "selected" : ""}>Postular FM</option>
                    <option value="Postular abast." ${d1.estadoProgramacion === "Postular abast." ? "selected" : ""}>Postular abast.</option>
                    <option value="Cancelada" ${d1.estadoProgramacion === "Cancelada" ? "selected" : ""}>Cancelada</option>
                </select>
            </td>
            <td><input class="edit-input fecha-input" type="${fechaTipo}" value="${fechaValor}" ${fechaDisabled}></td>
            <td><input class="edit-input observacion" value="${d1.observacion || ""}" placeholder="Observación"></td>
            <td>
                <select class="edit-select estado-gestion">
                    <option value=""></option>
                    <option value="Gestionable" ${d1.estadoGestion === "Gestionable" ? "selected" : ""}>Gestionable</option>
                    <option value="Operativa" ${d1.estadoGestion === "Operativa" ? "selected" : ""}>Operativa</option>
                    <option value="FM/traslado/reubicación" ${d1.estadoGestion === "FM/traslado/reubicación" ? "selected" : ""}>FM/traslado/reubicación</option>
                    <option value="Abastecimiento" ${d1.estadoGestion === "Abastecimiento" ? "selected" : ""}>Abastecimiento</option>
                    <option value="Falla Tx" ${d1.estadoGestion === "Falla Tx" ? "selected" : ""}>Falla Tx</option>
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
            if(caracter === '"') {
                dentroComillas = !dentroComillas;
            } else if(caracter === "," && !dentroComillas) {
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
    const encabezados = encabezadosGlobal;
    const datos = datosGlobal;

    let registrosD1 = {};
    try {
        const respD1 = await fetch(API_URL);
        registrosD1 = await respD1.json();
    } catch (error) {
        console.error(error);
    }
    window.registrosD1 = registrosD1;

    const programados = Object.values(window.registrosD1 || {}).filter(registro => registro.estadoProgramacion === "Programada").length;
    const kpiProgEl = document.getElementById("kpiProgramadosD1");
    if (kpiProgEl) kpiProgEl.textContent = programados;

    const idxDepto = encabezados.findIndex(h => h.trim() === "Departamento");
    const departamentos = [...new Set(datos.map(fila => fila[idxDepto]))].sort();

    const listaDeptoEl = document.getElementById("listaDepartamento");
    if (listaDeptoEl) {
        listaDeptoEl.innerHTML = `
            <input type="text" id="buscarDepartamento" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarDepartamento">✖ Borrar filtro</div>
            <label class="multi-filtro-item">
                <input type="checkbox" id="chkTodosDeptos"> (Seleccionar todo)
            </label>
        ` + departamentos.map(dep => `
            <label class="multi-filtro-item">
                <input type="checkbox" value="${dep}" class="chkDepartamento"> ${dep}
            </label>
        `).join("");
    }

    document.querySelectorAll(".chkDepartamento").forEach(chk => {
        chk.addEventListener("change", () => {
            departamentosSeleccionados = Array.from(document.querySelectorAll(".chkDepartamento:checked")).map(item => item.value);
            const textoDepartamento = document.getElementById("textoDepartamento");
            if (textoDepartamento) {
                textoDepartamento.textContent = departamentosSeleccionados.length ? `Departamento (${departamentosSeleccionados.length})` : "Departamento";
            }
            aplicarFiltros();
        });
    });

    const chkTodos = document.getElementById("chkTodosDeptos");
    const buscarDepto = document.getElementById("buscarDepartamento");
    if (buscarDepto) {
        buscarDepto.addEventListener("input", () => {
            const texto = buscarDepto.value.toLowerCase();
            document.querySelectorAll(".multi-filtro-item").forEach(item => {
                const contenido = item.textContent.toLowerCase();
                item.style.display = contenido.includes(texto) ? "" : "none";
            });
        });
    }

    if (chkTodos) {
        chkTodos.addEventListener("change", () => {
            document.querySelectorAll(".chkDepartamento").forEach(chk => { chk.checked = chkTodos.checked; });
            departamentosSeleccionados = Array.from(document.querySelectorAll(".chkDepartamento:checked")).map(item => item.value);
            aplicarFiltros();
        });
    }

    const btnLimpiarDepartamento = document.getElementById("btnLimpiarDepartamento");
    if (btnLimpiarDepartamento) {
        btnLimpiarDepartamento.addEventListener("click", () => {
            document.querySelectorAll(".chkDepartamento").forEach(chk => { chk.checked = false; });
            if (chkTodos) chkTodos.checked = false;
            departamentosSeleccionados = [];
            const texto = document.getElementById("textoDepartamento");
            if (texto) texto.textContent = "Departamento";
            aplicarFiltros();
        });
    }

    const idxPrioridad = encabezados.findIndex(h => h.trim() === "Tipo de prioridad");
    const idxAfectacion = encabezados.findIndex(h => h.trim() === "Tipo de afectación");
    const idxStoppersDominion = encabezados.findIndex(h => h.trim() === "Stoppers Dominion");
    const idxRangoAfectacion = encabezados.findIndex(h => h.trim() === "Rango de afectación");
    const idxBacklog = encabezados.findIndex(h => h.trim() === "Indicador backlog");

    const prioridades = Array.from(new Set(datos.map(fila => fila[idxPrioridad]))).filter(Boolean).sort();
    const elFiltroPrioridad = document.getElementById("filtroPrioridad");
    if (elFiltroPrioridad) {
        elFiltroPrioridad.innerHTML = `<option value="">Prioridad</option>` + prioridades.map(valor => `<option value="${valor}">${valor}</option>`).join("");
    }

    const afectaciones = Array.from(new Set(datos.map(fila => fila[idxAfectacion]))).filter(Boolean).sort();
    const elFiltroAfectacion = document.getElementById("filtroAfectacion");
    if (elFiltroAfectacion) {
        elFiltroAfectacion.innerHTML = `<option value="">Tipo de afectación</option>` + afectaciones.map(valor => `<option value="${valor}">${valor}</option>`).join("");
    }

    const stoppers = Array.from(new Set(datos.map(fila => fila[idxStoppersDominion]))).filter(Boolean).sort();
    const elFiltroStoppers = document.getElementById("filtroStoppers");
    if (elFiltroStoppers) {
        elFiltroStoppers.innerHTML = `<option value="">Stoppers</option>` + stoppers.map(valor => `<option value="${valor}">${valor}</option>`).join("");
    }

    const rangos = Array.from(new Set(datos.map(fila => fila[idxRangoAfectacion]))).filter(Boolean).sort();
    const elFiltroRango = document.getElementById("filtroRango");
    if (elFiltroRango) {
        elFiltroRango.innerHTML = `<option value="">Rango</option>` + rangos.map(valor => `<option value="${valor}">${valor}</option>`).join("");
    }

    const backlogs = Array.from(new Set(datos.map(fila => fila[idxBacklog]))).filter(Boolean).sort();
    const elFiltroBacklog = document.getElementById("filtroBacklog");
    if (elFiltroBacklog) {
        elFiltroBacklog.innerHTML = `<option value="">IND Backlog</option>` + backlogs.map(valor => `<option value="${valor}">${valor}</option>`).join("");
    }
    
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

    const otsAlta = new Set();
    const otsMedia = new Set();
    const otsBaja = new Set();
    const otsCumple = new Set();
    const otsNoCumple = new Set();

    datos.forEach(fila => {
        const ot = (fila[idxOT] || "").trim();
        const prioridad = (fila[idxPrioridad] || "").trim().toUpperCase();
        const backlog = (fila[idxBacklog] || "").trim().toUpperCase();

        if (prioridad === "ALTA") otsAlta.add(ot);
        if (prioridad === "MEDIA") otsMedia.add(ot);
        if (prioridad === "BAJA") otsBaja.add(ot);
        if (backlog === "CUMPLE") otsCumple.add(ot);
        if (backlog === "NO CUMPLE") otsNoCumple.add(ot);
    });

    const elAltaPlaneacion = document.getElementById("kpiAltaPlaneacion");
    if (elAltaPlaneacion) elAltaPlaneacion.textContent = otsAlta.size;

    const elMediaPlaneacion = document.getElementById("kpiMediaPlaneacion");
    if (elMediaPlaneacion) elMediaPlaneacion.textContent = otsMedia.size;

    const elBajaPlaneacion = document.getElementById("kpiBajaPlaneacion");
    if (elBajaPlaneacion) elBajaPlaneacion.textContent = otsBaja.size;

    const elCumpleBacklog = document.getElementById("kpiCumpleBacklog");
    if (elCumpleBacklog) elCumpleBacklog.textContent = otsCumple.size;

    const elNoCumpleBacklog = document.getElementById("kpiNoCumpleBacklog");
    if (elNoCumpleBacklog) elNoCumpleBacklog.textContent = otsNoCumple.size;
}

document.addEventListener("DOMContentLoaded", cargarPlaneacion);

function actualizarOpcionesFiltros(datos) {
    const encabezados = encabezadosGlobal;
    const idxDepto = encabezados.findIndex(h => h.trim() === "Departamento");
    const idxPrioridad = encabezados.findIndex(h => h.trim() === "Tipo de prioridad");
    const idxAfectacion = encabezados.findIndex(h => h.trim() === "Tipo de afectación");
    const idxStoppers = encabezados.findIndex(h => h.trim() === "Stoppers Dominion");
    const idxRango = encabezados.findIndex(h => h.trim() === "Rango de afectación");
    const idxBacklog = encabezados.findIndex(h => h.trim() === "Indicador backlog");

    const depto = document.getElementById("filtroDepartamento")?.value || "";
    const prioridad = document.getElementById("filtroPrioridad")?.value || "";
    const afectacion = document.getElementById("filtroAfectacion")?.value || "";
    const stoppers = document.getElementById("filtroStoppers")?.value || "";
    const rango = document.getElementById("filtroRango")?.value || "";
    const backlog = document.getElementById("filtroBacklog")?.value || "";

    const sinPrioridad = datosGlobal.filter(fila => (!depto || fila[idxDepto] === depto) && (!afectacion || fila[idxAfectacion] === afectacion) && (!stoppers || fila[idxStoppers] === stoppers) && (!rango || fila[idxRango] === rango) && (!backlog || fila[idxBacklog] === backlog));
    const sinAfectacion = datosGlobal.filter(fila => (!depto || fila[idxDepto] === depto) && (!prioridad || fila[idxPrioridad] === prioridad) && (!stoppers || fila[idxStoppers] === stoppers) && (!rango || fila[idxRango] === rango) && (!backlog || fila[idxBacklog] === backlog));
    const sinStoppers = datosGlobal.filter(fila => (!depto || fila[idxDepto] === depto) && (!prioridad || fila[idxPrioridad] === prioridad) && (!afectacion || fila[idxAfectacion] === afectacion) && (!rango || fila[idxRango] === rango) && (!backlog || fila[idxBacklog] === backlog));
    const sinRango = datosGlobal.filter(fila => (!depto || fila[idxDepto] === depto) && (!prioridad || fila[idxPrioridad] === prioridad) && (!afectacion || fila[idxAfectacion] === afectacion) && (!stoppers || fila[idxStoppers] === stoppers) && (!backlog || fila[idxBacklog] === backlog));
    const sinBacklog = datosGlobal.filter(fila => (!depto || fila[idxDepto] === depto) && (!prioridad || fila[idxPrioridad] === prioridad) && (!afectacion || fila[idxAfectacion] === afectacion) && (!stoppers || fila[idxStoppers] === stoppers) && (!rango || fila[idxRango] === rango));

    const prioridades = [...new Set(sinPrioridad.map(fila => fila[idxPrioridad]))].filter(Boolean).sort();
    const afectaciones = [...new Set(sinAfectacion.map(fila => fila[idxAfectacion]))].filter(Boolean).sort();
    const listaStoppers = [...new Set(sinStoppers.map(fila => fila[idxStoppers]))].filter(Boolean).sort();
    const rangos = [...new Set(sinRango.map(fila => fila[idxRango]))].filter(Boolean).sort();
    const backlogs = [...new Set(sinBacklog.map(fila => fila[idxBacklog]))].filter(Boolean).sort();

    const elFiltroPrioridad = document.getElementById("filtroPrioridad");
    if (elFiltroPrioridad) {
        elFiltroPrioridad.innerHTML = `<option value="">Prioridad</option>` + prioridades.map(valor => `<option value="${valor}" ${prioridad === valor ? "selected" : ""}>${valor}</option>`).join("");
    }

    const elFiltroAfectacion = document.getElementById("filtroAfectacion");
    if (elFiltroAfectacion) {
        elFiltroAfectacion.innerHTML = `<option value="">Tipo de afectación</option>` + afectaciones.map(valor => `<option value="${valor}" ${afectacion === valor ? "selected" : ""}>${valor}</option>`).join("");
    }

    const elFiltroStoppers = document.getElementById("filtroStoppers");
    if (elFiltroStoppers) {
        elFiltroStoppers.innerHTML = `<option value="">Stoppers</option>` + listaStoppers.map(valor => `<option value="${valor}" ${stoppers === valor ? "selected" : ""}>${valor}</option>`).join("");
    }

    const elFiltroRango = document.getElementById("filtroRango");
    if (elFiltroRango) {
        elFiltroRango.innerHTML = `<option value="">Rango</option>` + rangos.map(valor => `<option value="${valor}" ${rango === valor ? "selected" : ""}>${valor}</option>`).join("");
    }

    const elFiltroBacklog = document.getElementById("filtroBacklog");
    if (elFiltroBacklog) {
        elFiltroBacklog.innerHTML = `<option value="">IND Backlog</option>` + backlogs.map(valor => `<option value="${valor}" ${backlog === valor ? "selected" : ""}>${valor}</option>`).join("");
    }
}

function aplicarFiltros(){
    const filtroBusqEl = document.getElementById("filtroBusqueda");
    const texto = filtroBusqEl ? filtroBusqEl.value.toLowerCase() : "";

    const deptos = departamentosSeleccionados;
    const prioridadEl = document.getElementById("filtroPrioridad");
    const prioridad = prioridadEl ? prioridadEl.value : "";
    const afectacionEl = document.getElementById("filtroAfectacion");
    const afectacion = afectacionEl ? afectacionEl.value : "";
    const stoppersEl = document.getElementById("filtroStoppers");
    const stoppers = stoppersEl ? stoppersEl.value : "";
    const rangoEl = document.getElementById("filtroRango");
    const rango = rangoEl ? rangoEl.value : "";
    const backlogEl = document.getElementById("filtroBacklog");
    const backlog = backlogEl ? backlogEl.value : ""; 

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
        const cumpleTexto = String(fila[idxID] || "").toLowerCase().includes(texto) || String(fila[idxOT] || "").toLowerCase().includes(texto) || String(fila[idxMunicipio] || "").toLowerCase().includes(texto);
        const cumpleDepto = deptos.length === 0 || deptos.includes(fila[idxDepto]);
        const cumplePrioridad = !prioridad || fila[idxPrioridad] === prioridad;
        const cumpleAfectacion = !afectacion || fila[idxAfectacion] === afectacion;
        const cumpleStoppers = !stoppers || fila[idxStoppers] === stoppers;
        const cumpleRango = !rango || fila[idxRango] === rango;
        const cumpleBacklog = !backlog || fila[idxBacklog] === backlog;
        return (cumpleTexto && cumpleDepto && cumplePrioridad && cumpleAfectacion && cumpleStoppers && cumpleRango && cumpleBacklog);
    });

    datosFiltradosGlobal = resultado;
    actualizarOpcionesFiltros(resultado);
    pintarTabla(resultado);
    actualizarKPIs(resultado);
}

document.addEventListener("input",(e)=>{
    if(e.target.id === "filtroBusqueda"){
        aplicarFiltros();
    }
});

document.addEventListener("change",(e)=>{
    if(e.target.classList.contains("estado-programacion")){
        const fila = e.target.closest("tr");
        const fecha = fila.querySelector(".fecha-input");
        const valor = e.target.value;

        if(valor === "Programada"){
            fecha.type = "date";
            fecha.disabled = false;
            fecha.value = "";
        } else if(valor === "Pendiente"){
            fecha.type = "text";
            fecha.disabled = true;
            fecha.value = "En validación";
        } else if(valor === "N/A" || valor === "Postular FM" || valor === "Postular abast."){
            fecha.type = "text";
            fecha.disabled = true;
            fecha.value = "No aplica";
        } else if(valor === "Cancelada"){
            fecha.type = "date";
            fecha.disabled = false;
            fecha.value = "";
        } else if(valor === ""){
            fecha.type = "text";
            fecha.disabled = true;
            fecha.value = "⟵ Definir estado";
        }
        return;
    }

    if(["filtroDepartamento", "filtroPrioridad", "filtroAfectacion", "filtroStoppers", "filtroRango", "filtroBacklog"].includes(e.target.id)){
        aplicarFiltros();
    }
});

document.addEventListener("blur", async e => {
    if(!e.target.classList.contains("observacion")) return;
    const fila = e.target.closest("tr");
    if(!fila) return;
    await guardarOT(fila);
}, true);

async function guardarOT(fila){
    const ot = fila.children[4].textContent.trim();
    const payload = {
        ot,
        estadoProgramacion: fila.querySelector(".estado-programacion")?.value || "",
        fechaProgramacion: fila.querySelector(".fecha-input")?.value || "",
        observacion: fila.querySelector(".observacion")?.value || "",
        estadoGestion: fila.querySelector(".estado-gestion")?.value || "",
        tecnicoAsignado: fila.querySelector(".tecnico-asignado")?.value || "",
        acompanamiento: fila.querySelector(".acompanamiento")?.value || ""
    };

    const resp = await fetch(API_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
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
        pintarTabla(datosFiltradosGlobal);
    }
}

document.addEventListener("change", async e => {
    const fila = e.target.closest("tr");
    if(!fila) return;
    await guardarOT(fila);
});

const wrapper = document.querySelector('.planeacion-table-wrapper');
let scrollTimer;
if (wrapper) {
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
    if (!topScroll || !tableWrapper) return;
    let syncing = false;

    topScroll.addEventListener("scroll", () => {
        if (syncing) return;
        syncing = true;
        tableWrapper.scrollLeft = topScroll.scrollLeft;
        syncing = false;
    });

    tableWrapper.addEventListener("scroll", () => {
        if (syncing) return;
        syncing = true;
        topScroll.scrollLeft = tableWrapper.scrollLeft;
        syncing = false;
    });
});

function actualizarStickyTabla() {
    const header = document.querySelector('.planeacion-header');
    const filtros = document.querySelector('.planeacion-filtros-sticky');
    if (!header || !filtros) return;
    const alturaHeader = header.offsetHeight;
    const alturaFiltros = filtros.offsetHeight;
    document.documentElement.style.setProperty('--sticky-table-top', `${alturaHeader + alturaFiltros}px`);
}

window.addEventListener('load', actualizarStickyTabla);
window.addEventListener('resize', actualizarStickyTabla);

function detectarZoom() {
    const zoom = Math.round(window.devicePixelRatio * 100);
    document.body.classList.toggle('zoom-alto', zoom > 105);
}
window.addEventListener('resize', detectarZoom);
detectarZoom();

// ==========================================
// CONTROL DEL BOTÓN ZOOM (Restaurado con tu ID y Clase real)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const botonExpandir = document.getElementById("btnExpandirTabla");
    if (!botonExpandir) return;
    botonExpandir.addEventListener("click", () => {
        document.body.classList.toggle("modo-ampliado");
    });
});

// ==========================================
// BOTÓN DE DESPLEGAR DEPARTAMENTOS
// ==========================================
document.addEventListener("click", (e) => {
    const lista = document.getElementById("listaDepartamento");
    const boton = document.getElementById("btnDepartamento");
    if (!lista || !boton) return;
    
    if (e.target === boton || boton.contains(e.target)) {
        lista.classList.toggle("show");
        return;
    }
    if (!lista.contains(e.target)) {
        lista.classList.remove("show");
    }
});

// ==========================================
// FUNCIÓN DE EXPORTACIÓN (Restaurada y Mejorada)
// ==========================================
function exportarPlaneacion() {
    try {
        if (typeof datosGlobal === "undefined" || typeof encabezadosGlobal === "undefined" || !datosGlobal.length) {
            alert("No hay datos cargados para exportar todavía.");
            return;
        }

        const exportRegionEl = document.getElementById("exportRegion");
        const region = exportRegionEl ? exportRegionEl.value : "todos";
        let filas = [...datosGlobal];

        const buscarIndice = (nombre) => encabezadosGlobal.findIndex(h => String(h).trim() === nombre);
        const idxDepto = buscarIndice("Departamento");

        if (region === "R1" && idxDepto !== -1) {
            filas = filas.filter(fila => ["CESAR", "LA GUAJIRA", "SAI"].includes(String(fila[idxDepto] || "").trim().toUpperCase()));
        }

        if (region === "R2" && idxDepto !== -1) {
            filas = filas.filter(fila => String(fila[idxDepto] || "").trim().toUpperCase() === "ANTIOQUIA");
        }

        const headers = [
            "ID", "Departamento", "Municipio", "IM", "OT", "Afectacion", "Total_IDs", "Dias_OT", 
            "Rango_Afectacion", "Prioridad", "Stoppers_Dominion", "Estado_Programacion", 
            "Fecha_Programacion", "Observaciones", "Estado_Gestion", "Indicador_Backlog", 
            "Stopper_P3", "Tipo_Facturacion", "Fecha_Vencimiento_FM", "Alerta_Vencimiento_FM"
        ];

        // Función para limpiar texto y saltos de línea y no dañar Excel
        const limpiarTexto = (texto) => {
            if (!texto) return "";
            return String(texto).replace(/[\r\n]+/g, " ").trim();
        };

        const dataAOA = [];
        dataAOA.push([...headers]);

        filas.forEach(fila => {
            const getValor = (nombre) => {
                const index = buscarIndice(nombre);
                return index !== -1 ? (fila[index] ?? "") : "";
            };

            const otValor = getValor("OT");
            const regD1 = window.registrosD1 && window.registrosD1[otValor] ? window.registrosD1[otValor] : {};

            dataAOA.push([
                getValor("ID"), getValor("Departamento"), getValor("Municipio"), getValor("IM"), otValor,
                getValor("Tipo de afectación"), getValor("IDs afectados"), getValor("Días OT"),
                getValor("Rango de afectación"), getValor("Tipo de prioridad"), getValor("Stoppers Dominion"),
                limpiarTexto(regD1.estadoProgramacion), limpiarTexto(regD1.fechaProgramacion),
                limpiarTexto(regD1.observacion), limpiarTexto(regD1.estadoGestion),
                getValor("Indicador backlog"), getValor("Stopper P3"), getValor("Tipo facturación"),
                getValor("Fecha vencimiento FM"), getValor("Alerta vencimiento FM")
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(dataAOA);
        const ultimaColumna = XLSX.utils.encode_col(headers.length - 1);
        const ultimaFila = dataAOA.length;

        // Obliga al filtro a ponerse en la Fila 1 para todos los archivos (R1, R2 y Todos)
        ws["!ref"] = `A1:${ultimaColumna}${ultimaFila}`;
        ws["!autofilter"] = { ref: `A1:${ultimaColumna}${ultimaFila}` };
        delete ws["!tables"];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Planeacion");
        XLSX.writeFile(wb, `Planeacion_${region}_${new Date().toISOString().slice(0, 10)}.xlsx`);

        console.log("✅ Excel exportado correctamente con limpieza de texto y filtros fijos en Fila 1.");
    } catch (error) {
        console.error("❌ Error al exportar:", error);
        alert("Ocurrió un error al exportar el archivo. Revisa la consola (F12).");
    }
}

// ==========================================
// CONECTAR EL BOTÓN DE EXPORTAR
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const btnExportar = document.getElementById("btnExportarExcel");
    if (btnExportar) {
        btnExportar.addEventListener("click", (e) => {
            e.preventDefault();
            exportarPlaneacion();
        });
    }
});
