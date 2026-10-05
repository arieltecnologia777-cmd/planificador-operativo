const DATASET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRUdWw76b-hysCr5vGj2sS6PsMR2a7IuV_7fOL1HO_gaq5Bq-Aa5dqjhGKogvgXR3uH_HHb8oEYqfY_/pub?output=csv";

const API_URL =
"https://planeacion-api.modulo-de-exclusiones.workers.dev/api/planeacion";

let datosGlobal = [];
let encabezadosGlobal = [];
window.registrosD1 = {};

let datosFiltradosGlobal = [];
let departamentosSeleccionados = [];
let estadosSeleccionados = [];
let prioridadesSeleccionadas = [];
let afectacionesSeleccionadas = [];
let stoppersSeleccionados = [];
let rangosSeleccionados = [];
let backlogsSeleccionados = [];

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
            <td>
                <input class="edit-input fecha-input" type="${fechaTipo}" value="${fechaValor}" ${fechaDisabled}>
            </td>
            <td>
                <input class="edit-input observacion" value="${d1.observacion || ""}" placeholder="Observación">
            </td>
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

    const programados = Object.values(window.registrosD1 || {}).filter(registro =>
        registro.estadoProgramacion === "Programada"
    ).length;

    const kpiProg = document.getElementById("kpiProgramadosD1");
    if(kpiProg) kpiProg.textContent = programados;

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

    const elAlta = document.getElementById("kpiAltaPlaneacion");
    const elMedia = document.getElementById("kpiMediaPlaneacion");
    const elBaja = document.getElementById("kpiBajaPlaneacion");
    const elCumple = document.getElementById("kpiCumpleBacklog");
    const elNoCumple = document.getElementById("kpiNoCumpleBacklog");

    if(elAlta) elAlta.textContent = otsAlta.size;
    if(elMedia) elMedia.textContent = otsMedia.size;
    if(elBaja) elBaja.textContent = otsBaja.size;
    if(elCumple) elCumple.textContent = otsCumple.size;
    if(elNoCumple) elNoCumple.textContent = otsNoCumple.size;
}

document.addEventListener("DOMContentLoaded", cargarPlaneacion);

function renderizarFiltrosDinamicos(datos) {
    const encabezados = encabezadosGlobal;
    const idxDepto = encabezados.findIndex(h => h.trim() === "Departamento");
    const idxPrioridad = encabezados.findIndex(h => h.trim() === "Tipo de prioridad");
    const idxAfectacion = encabezados.findIndex(h => h.trim() === "Tipo de afectación");
    const idxStoppers = encabezados.findIndex(h => h.trim() === "Stoppers Dominion");
    const idxRango = encabezados.findIndex(h => h.trim() === "Rango de afectación");
    const idxBacklog = encabezados.findIndex(h => h.trim() === "Indicador backlog");

    const departamentos = [...new Set(datos.map(fila => fila[idxDepto]))].filter(Boolean).sort();
    const prioridades = [...new Set(datos.map(fila => fila[idxPrioridad]))].filter(Boolean).sort();
    const afectaciones = [...new Set(datos.map(fila => fila[idxAfectacion]))].filter(Boolean).sort();
    const stoppers = [...new Set(datos.map(fila => fila[idxStoppers]))].filter(Boolean).sort();
    const rangos = [...new Set(datos.map(fila => fila[idxRango]))].filter(Boolean).sort();
    const backlogs = [...new Set(datos.map(fila => fila[idxBacklog]))].filter(Boolean).sort();

    const dEl = document.getElementById("listaDepartamento");
    if(dEl) {
        dEl.innerHTML = `
            <input type="text" id="buscarDepartamento" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarDepartamento">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodosDeptos"> (Seleccionar todo)</label>
        ` + departamentos.map(dep => `
            <label class="multi-filtro-item"><input type="checkbox" value="${dep}" class="chkDepartamento" ${departamentosSeleccionados.includes(dep) ? "checked" : ""}> ${dep}</label>
        `).join("");
    }

    const pEl = document.getElementById("listaPrioridad");
    if(pEl) {
        pEl.innerHTML = `
            <input type="text" id="buscarPrioridad" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarPrioridad">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodasPrioridades"> (Seleccionar todo)</label>
        ` + prioridades.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkPrioridad" ${prioridadesSeleccionadas.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
    }

    const aEl = document.getElementById("listaAfectacion");
    if(aEl) {
        aEl.innerHTML = `
            <input type="text" id="buscarAfectacion" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarAfectacion">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodasAfectaciones"> (Seleccionar todo)</label>
        ` + afectaciones.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkAfectacion" ${afectacionesSeleccionadas.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
    }

    const sEl = document.getElementById("listaStoppers");
    if(sEl) {
        sEl.innerHTML = `
            <input type="text" id="buscarStoppers" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarStoppers">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodosStoppers"> (Seleccionar todo)</label>
        ` + stoppers.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkStoppers" ${stoppersSeleccionados.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
    }

    const rEl = document.getElementById("listaRango");
    if(rEl) {
        rEl.innerHTML = `
            <input type="text" id="buscarRango" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarRango">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodosRangos"> (Seleccionar todo)</label>
        ` + rangos.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkRango" ${rangosSeleccionados.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
    }

    const bEl = document.getElementById("listaBacklog");
    if(bEl) {
        bEl.innerHTML = `
            <input type="text" id="buscarBacklog" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarBacklog">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodosBacklog"> (Seleccionar todo)</label>
        ` + backlogs.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkBacklog" ${backlogsSeleccionados.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
    }
}

function actualizarOpcionesFiltros(datos) {
    const filtroBusquedaEl = document.getElementById("filtroBusqueda");
    const texto = filtroBusquedaEl ? filtroBusquedaEl.value.toLowerCase() : "";

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

    const coincideBase = (fila) => {
        return !texto || 
            String(fila[idxID] || "").toLowerCase().includes(texto) ||
            String(fila[idxOT] || "").toLowerCase().includes(texto) ||
            String(fila[idxMunicipio] || "").toLowerCase().includes(texto);
    };

    // Filtros cruzados dependientes (excluyendo la dimensión del selector evaluado)
    const datosParaDepto = datosGlobal.filter(fila => coincideBase(fila) &&
        (prioridadesSeleccionadas.length === 0 || prioridadesSeleccionadas.includes(fila[idxPrioridad])) &&
        (afectacionesSeleccionadas.length === 0 || afectacionesSeleccionadas.includes(fila[idxAfectacion])) &&
        (stoppersSeleccionados.length === 0 || stoppersSeleccionados.includes(fila[idxStoppers])) &&
        (rangosSeleccionados.length === 0 || rangosSeleccionados.includes(fila[idxRango])) &&
        (backlogsSeleccionados.length === 0 || backlogsSeleccionados.includes(fila[idxBacklog]))
    );

    const datosParaPrioridad = datosGlobal.filter(fila => coincideBase(fila) &&
        (departamentosSeleccionados.length === 0 || departamentosSeleccionados.includes(fila[idxDepto])) &&
        (afectacionesSeleccionadas.length === 0 || afectacionesSeleccionadas.includes(fila[idxAfectacion])) &&
        (stoppersSeleccionados.length === 0 || stoppersSeleccionados.includes(fila[idxStoppers])) &&
        (rangosSeleccionados.length === 0 || rangosSeleccionados.includes(fila[idxRango])) &&
        (backlogsSeleccionados.length === 0 || backlogsSeleccionados.includes(fila[idxBacklog]))
    );

    const datosParaAfectacion = datosGlobal.filter(fila => coincideBase(fila) &&
        (departamentosSeleccionados.length === 0 || departamentosSeleccionados.includes(fila[idxDepto])) &&
        (prioridadesSeleccionadas.length === 0 || prioridadesSeleccionadas.includes(fila[idxPrioridad])) &&
        (stoppersSeleccionados.length === 0 || stoppersSeleccionados.includes(fila[idxStoppers])) &&
        (rangosSeleccionados.length === 0 || rangosSeleccionados.includes(fila[idxRango])) &&
        (backlogsSeleccionados.length === 0 || backlogsSeleccionados.includes(fila[idxBacklog]))
    );

    const datosParaStoppers = datosGlobal.filter(fila => coincideBase(fila) &&
        (departamentosSeleccionados.length === 0 || departamentosSeleccionados.includes(fila[idxDepto])) &&
        (prioridadesSeleccionadas.length === 0 || prioridadesSeleccionadas.includes(fila[idxPrioridad])) &&
        (afectacionesSeleccionadas.length === 0 || afectacionesSeleccionadas.includes(fila[idxAfectacion])) &&
        (rangosSeleccionados.length === 0 || rangosSeleccionados.includes(fila[idxRango])) &&
        (backlogsSeleccionados.length === 0 || backlogsSeleccionados.includes(fila[idxBacklog]))
    );

    const datosParaRango = datosGlobal.filter(fila => coincideBase(fila) &&
        (departamentosSeleccionados.length === 0 || departamentosSeleccionados.includes(fila[idxDepto])) &&
        (prioridadesSeleccionadas.length === 0 || prioridadesSeleccionadas.includes(fila[idxPrioridad])) &&
        (afectacionesSeleccionadas.length === 0 || afectacionesSeleccionadas.includes(fila[idxAfectacion])) &&
        (stoppersSeleccionados.length === 0 || stoppersSeleccionados.includes(fila[idxStoppers])) &&
        (backlogsSeleccionados.length === 0 || backlogsSeleccionados.includes(fila[idxBacklog]))
    );

    const datosParaBacklog = datosGlobal.filter(fila => coincideBase(fila) &&
        (departamentosSeleccionados.length === 0 || departamentosSeleccionados.includes(fila[idxDepto])) &&
        (prioridadesSeleccionadas.length === 0 || prioridadesSeleccionadas.includes(fila[idxPrioridad])) &&
        (afectacionesSeleccionadas.length === 0 || afectacionesSeleccionadas.includes(fila[idxAfectacion])) &&
        (stoppersSeleccionados.length === 0 || stoppersSeleccionados.includes(fila[idxStoppers])) &&
        (rangosSeleccionados.length === 0 || rangosSeleccionados.includes(fila[idxRango]))
    );

    // Filtrar elementos seleccionados previamente que ya no existen en las opciones dinámicas disponibles
    departamentosSeleccionados = departamentosSeleccionados.filter(dep => datosParaDepto.some(f => f[idxDepto] === dep));
    prioridadesSeleccionadas = prioridadesSeleccionadas.filter(val => datosParaPrioridad.some(f => f[idxPrioridad] === val));
    afectacionesSeleccionadas = afectacionesSeleccionadas.filter(val => datosParaAfectacion.some(f => f[idxAfectacion] === val));
    stoppersSeleccionados = stoppersSeleccionados.filter(val => datosParaStoppers.some(f => f[idxStoppers] === val));
    rangosSeleccionados = rangosSeleccionados.filter(val => datosParaRango.some(f => f[idxRango] === val));
    backlogsSeleccionados = backlogsSeleccionados.filter(val => datosParaBacklog.some(f => f[idxBacklog] === val));

    // Actualización de textos de las cabeceras de los filtros
    const txtDepto = document.getElementById("textoDepartamento");
    if (txtDepto) txtDepto.textContent = departamentosSeleccionados.length ? `Departamento (${departamentosSeleccionados.length})` : "Departamento";

    const txtPrio = document.getElementById("textoPrioridad");
    if (txtPrio) txtPrio.textContent = prioridadesSeleccionadas.length === 0 ? "Prioridad" : (prioridadesSeleccionadas.length === 1 ? prioridadesSeleccionadas[0] : `Prioridad (${prioridadesSeleccionadas.length})`);

    const txtAfec = document.getElementById("textoAfectacion");
    if (txtAfec) txtAfec.textContent = afectacionesSeleccionadas.length === 0 ? "Tipo de afectación" : `Afectación (${afectacionesSeleccionadas.length})`;

    const txtStop = document.getElementById("textoStoppers");
    if (txtStop) txtStop.textContent = stoppersSeleccionados.length === 0 ? "Stoppers" : `Stoppers (${stoppersSeleccionados.length})`;

    const txtRang = document.getElementById("textoRango");
    if (txtRang) txtRang.textContent = rangosSeleccionados.length === 0 ? "Rango de afectación" : `Rango (${rangosSeleccionados.length})`;

    const txtBack = document.getElementById("textoBacklog");
    if (txtBack) txtBack.textContent = backlogsSeleccionados.length === 0 ? "Indicador backlog" : `Backlog (${backlogsSeleccionados.length})`;

    // Re-renderizado de contenedores con las opciones válidas
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

    const prioDisp = [...new Set(datosParaPrioridad.map(f => f[idxPrioridad]))].filter(Boolean).sort();
    const pEl = document.getElementById("listaPrioridad");
    if(pEl) {
        pEl.innerHTML = `
            <input type="text" id="buscarPrioridad" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarPrioridad">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodasPrioridades"> (Seleccionar todo)</label>
        ` + prioDisp.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkPrioridad" ${prioridadesSeleccionadas.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
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

    const backDisp = [...new Set(datosParaBacklog.map(f => f[idxBacklog]))].filter(Boolean).sort();
    const bEl = document.getElementById("listaBacklog");
    if(bEl) {
        bEl.innerHTML = `
            <input type="text" id="buscarBacklog" class="buscar-multifiltro" placeholder="Buscar...">
            <div class="multi-filtro-reset" id="btnLimpiarBacklog">✖ Borrar filtro</div>
            <label class="multi-filtro-item"><input type="checkbox" id="chkTodosBacklog"> (Seleccionar todo)</label>
        ` + backDisp.map(v => `<label class="multi-filtro-item"><input type="checkbox" value="${v}" class="chkBacklog" ${backlogsSeleccionados.includes(v) ? "checked" : ""}> ${v}</label>`).join("");
    }
}

function aplicarFiltros(){
    actualizarOpcionesFiltros(datosGlobal);

    const filtroBusquedaEl = document.getElementById("filtroBusqueda");
    const texto = filtroBusquedaEl ? filtroBusquedaEl.value.toLowerCase() : "";

    const deptos = departamentosSeleccionados;
    const prioridadesFiltro = prioridadesSeleccionadas;
    const afectacionesFiltro = afectacionesSeleccionadas;
    const stoppersFiltro = stoppersSeleccionados;
    const rangosFiltro = rangosSeleccionados;
    const backlogsFiltro = backlogsSeleccionados;

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
        const cumpleTexto = !texto || 
            String(fila[idxID] || "").toLowerCase().includes(texto) ||
            String(fila[idxOT] || "").toLowerCase().includes(texto) ||
            String(fila[idxMunicipio] || "").toLowerCase().includes(texto);

        const cumpleDepto = deptos.length === 0 || deptos.includes(fila[idxDepto]);
        const cumplePrioridad = prioridadesFiltro.length === 0 || prioridadesFiltro.includes(fila[idxPrioridad]);
        const cumpleAfectacion = afectacionesFiltro.length === 0 || afectacionesFiltro.includes(fila[idxAfectacion]);
        const cumpleStoppers = stoppersFiltro.length === 0 || stoppersFiltro.includes(fila[idxStoppers]);
        const cumpleRango = rangosFiltro.length === 0 || rangosFiltro.includes(fila[idxRango]);
        const cumpleBacklog = backlogsFiltro.length === 0 || backlogsFiltro.includes(fila[idxBacklog]);

        return cumpleTexto && cumpleDepto && cumplePrioridad && cumpleAfectacion && cumpleStoppers && cumpleRango && cumpleBacklog;
    });

    datosFiltradosGlobal = resultado;
    pintarTabla(resultado);
    actualizarKPIs(resultado);
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
        const txt = document.getElementById("textoDepartamento");
        if (txt) txt.textContent = departamentosSeleccionados.length ? `Departamento (${departamentosSeleccionados.length})` : "Departamento";
        aplicarFiltros();
        return;
    }
    if (target.id === "chkTodosDeptos") {
        document.querySelectorAll(".chkDepartamento").forEach(chk => chk.checked = target.checked);
        departamentosSeleccionados = Array.from(document.querySelectorAll(".chkDepartamento:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }

    if (target.classList.contains("chkPrioridad")) {
        prioridadesSeleccionadas = Array.from(document.querySelectorAll(".chkPrioridad:checked")).map(i => i.value);
        const txt = document.getElementById("textoPrioridad");
        if (txt) {
            txt.textContent = prioridadesSeleccionadas.length === 0 ? "Prioridad" : (prioridadesSeleccionadas.length === 1 ? prioridadesSeleccionadas[0] : `Prioridad (${prioridadesSeleccionadas.length})`);
        }
        aplicarFiltros();
        return;
    }
    if (target.id === "chkTodasPrioridades") {
        document.querySelectorAll(".chkPrioridad").forEach(chk => chk.checked = target.checked);
        prioridadesSeleccionadas = Array.from(document.querySelectorAll(".chkPrioridad:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }

    if (target.classList.contains("chkAfectacion")) {
        afectacionesSeleccionadas = Array.from(document.querySelectorAll(".chkAfectacion:checked")).map(i => i.value);
        const txt = document.getElementById("textoAfectacion");
        if (txt) {
            txt.textContent = afectacionesSeleccionadas.length === 0 ? "Tipo de afectación" : `Afectación (${afectacionesSeleccionadas.length})`;
        }
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
        const txt = document.getElementById("textoStoppers");
        if (txt) {
            txt.textContent = stoppersSeleccionados.length === 0 ? "Stoppers" : `Stoppers (${stoppersSeleccionados.length})`;
        }
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
        const txt = document.getElementById("textoRango");
        if (txt) {
            txt.textContent = rangosSeleccionados.length === 0 ? "Rango de afectación" : `Rango (${rangosSeleccionados.length})`;
        }
        aplicarFiltros();
        return;
    }
    if (target.id === "chkTodosRangos") {
        document.querySelectorAll(".chkRango").forEach(chk => chk.checked = target.checked);
        rangosSeleccionados = Array.from(document.querySelectorAll(".chkRango:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }

    if (target.classList.contains("chkBacklog")) {
        backlogsSeleccionados = Array.from(document.querySelectorAll(".chkBacklog:checked")).map(i => i.value);
        const txt = document.getElementById("textoBacklog");
        if (txt) {
            txt.textContent = backlogsSeleccionados.length === 0 ? "Indicador backlog" : `Backlog (${backlogsSeleccionados.length})`;
        }
        aplicarFiltros();
        return;
    }
    if (target.id === "chkTodosBacklog") {
        document.querySelectorAll(".chkBacklog").forEach(chk => chk.checked = target.checked);
        backlogsSeleccionados = Array.from(document.querySelectorAll(".chkBacklog:checked")).map(i => i.value);
        aplicarFiltros();
        return;
    }

    if(target.classList.contains("estado-programacion")){
        const fila = target.closest("tr");
        const fecha = fila.querySelector(".fecha-input");
        const valor = target.value;

        if(valor === "Programada" || valor === "Cancelada"){
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

    if(target.id === "btnLimpiarDepartamento") {
        document.querySelectorAll(".chkDepartamento").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodosDeptos");
        if(chkAll) chkAll.checked = false;
        departamentosSeleccionados = [];
        const txt = document.getElementById("textoDepartamento");
        if(txt) txt.textContent = "Departamento";
        aplicarFiltros();
    }
    if(target.id === "btnLimpiarPrioridad") {
        document.querySelectorAll(".chkPrioridad").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodasPrioridades");
        if(chkAll) chkAll.checked = false;
        prioridadesSeleccionadas = [];
        const txt = document.getElementById("textoPrioridad");
        if(txt) txt.textContent = "Prioridad";
        aplicarFiltros();
    }
    if(target.id === "btnLimpiarAfectacion") {
        document.querySelectorAll(".chkAfectacion").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodasAfectaciones");
        if(chkAll) chkAll.checked = false;
        afectacionesSeleccionadas = [];
        const txt = document.getElementById("textoAfectacion");
        if(txt) txt.textContent = "Tipo de afectación";
        aplicarFiltros();
    }
    if(target.id === "btnLimpiarStoppers") {
        document.querySelectorAll(".chkStoppers").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodosStoppers");
        if(chkAll) chkAll.checked = false;
        stoppersSeleccionados = [];
        const txt = document.getElementById("textoStoppers");
        if(txt) txt.textContent = "Stoppers";
        aplicarFiltros();
    }
    if(target.id === "btnLimpiarRango") {
        document.querySelectorAll(".chkRango").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodosRangos");
        if(chkAll) chkAll.checked = false;
        rangosSeleccionados = [];
        const txt = document.getElementById("textoRango");
        if(txt) txt.textContent = "Rango de afectación";
        aplicarFiltros();
    }
    if(target.id === "btnLimpiarBacklog") {
        document.querySelectorAll(".chkBacklog").forEach(c => c.checked = false);
        const chkAll = document.getElementById("chkTodosBacklog");
        if(chkAll) chkAll.checked = false;
        backlogsSeleccionados = [];
        const txt = document.getElementById("textoBacklog");
        if(txt) txt.textContent = "Indicador backlog";
        aplicarFiltros();
    }

    const dropdowns = [
        { btn: "btnDepartamento", lista: "listaDepartamento" },
        { btn: "btnPrioridad", lista: "listaPrioridad" },
        { btn: "btnAfectacion", lista: "listaAfectacion" },
        { btn: "btnStoppers", lista: "listaStoppers" },
        { btn: "btnRango", lista: "listaRango" },
        { btn: "btnBacklog", lista: "listaBacklog" }
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
    if(!e.target.classList.contains("observacion") && !e.target.classList.contains("fecha-input")) return;
    const fila = e.target.closest("tr");
    if(!fila) return;
    await guardarOT(fila);
}, true);

async function guardarOT(fila){
    const ot = fila.children[4].textContent.trim();
    
    const inputFecha = fila.querySelector(".fecha-input");
    let fechaVal = inputFecha?.value || "";
    if(inputFecha && (fechaVal.includes("Definir") || fechaVal.includes("validación") || fechaVal.includes("aplica"))) {
        fechaVal = "";
    }

    const payload = {
        ot,
        estadoProgramacion: fila.querySelector(".estado-programacion")?.value || "",
        fechaProgramacion: fechaVal,
        observacion: fila.querySelector(".observacion")?.value || "",
