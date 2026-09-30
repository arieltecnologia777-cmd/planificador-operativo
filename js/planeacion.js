const DATASET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRUdWw76b-hysCr5vGj2sS6PsMR2a7IuV_7fOL1HO_gaq5Bq-Aa5dqjhGKogvgXR3uH_HHb8oEYqfY_/pub?output=csv";

const API_URL =
"https://planeacion-api.modulo-de-exclusiones.workers.dev/api/planeacion";

let datosGlobal = [];
let encabezadosGlobal = [];

function pintarTabla(datos){

    const encabezados = encabezadosGlobal;

    const idxID =
        encabezados.findIndex(
            h => h.trim() === "ID"
        );

    const idxDepto =
        encabezados.findIndex(
            h => h.trim() === "Departamento"
        );

    const idxMunicipio =
        encabezados.findIndex(
            h => h.trim() === "Municipio"
        );

    const idxOT =
        encabezados.findIndex(
            h => h.trim() === "OT"
        );

    const idxIM =
        encabezados.findIndex(
            h => h.trim() === "IM"
        );

    const idxAfectacion =
        encabezados.findIndex(
            h => h.trim() === "Tipo de afectación"
        );

    const idxDias =
        encabezados.findIndex(
            h => h.trim() === "Días OT"
        );

    const idxPrioridad =
        encabezados.findIndex(
            h => h.trim() === "Tipo de prioridad"
        );
console.log(
    datos.filter(
        fila =>
        (fila[idxDepto] || "").trim() === "ANTIOQUIA"
    )
);
    document.getElementById(
    "planeacionBody"
).innerHTML = datos.map(fila => {

        const d1 =
    (window.registrosD1 || {})[
        fila[idxOT]
    ] || {};

    return `

        <tr>

            <td>${fila[idxID]}</td>
            <td>${fila[idxDepto]}</td>
            <td>${fila[idxMunicipio]}</td>
            <td>${fila[idxOT]}</td>
            <td>${fila[idxIM]}</td>
            <td>${fila[idxAfectacion]}</td>
            <td>${fila[idxDias]}</td>
            <td>${fila[idxPrioridad]}</td>

            <td>
   <select
    class="edit-select estado-programacion">

    <option value=""></option>

    <option value="Programada"
        ${d1.estadoProgramacion === "Programada" ? "selected" : ""}>
        Programada
    </option>

    <option value="Pendiente"
        ${d1.estadoProgramacion === "Pendiente" ? "selected" : ""}>
        Pendiente
    </option>

    <option value="N/A"
        ${d1.estadoProgramacion === "N/A" ? "selected" : ""}>
        N/A
    </option>

    <option value="Postular FM"
        ${d1.estadoProgramacion === "Postular FM" ? "selected" : ""}>
        Postular FM
    </option>

    <option value="Postular abast."
        ${d1.estadoProgramacion === "Postular abast." ? "selected" : ""}>
        Postular abast.
    </option>

    <option value="Cancelada"
        ${d1.estadoProgramacion === "Cancelada" ? "selected" : ""}>
        Cancelada
    </option>

</select>
</td>

<td>
    <input
    class="edit-input fecha-input"
    type="text"
    value="${d1.fechaProgramacion || '⟵ Definir estado'}"
    disabled>

</td>

            <td>
                <input
    class="edit-input observacion"
    value="${d1.observacion || ""}"
    placeholder="Observación">
            </td>

            <td>
                <select class="edit-select estado-gestion">

    <option value=""></option>

    <option value="Gestionable"
        ${d1.estadoGestion === "Gestionable" ? "selected" : ""}>
        Gestionable
    </option>

    <option value="Operativa"
        ${d1.estadoGestion === "Operativa" ? "selected" : ""}>
        Operativa
    </option>

    <option value="FM/traslado/reubicación"
        ${d1.estadoGestion === "FM/traslado/reubicación" ? "selected" : ""}>
        FM/traslado/reubicación
    </option>

    <option value="Abastecimiento"
        ${d1.estadoGestion === "Abastecimiento" ? "selected" : ""}>
        Abastecimiento
    </option>

    <option value="Falla Tx"
        ${d1.estadoGestion === "Falla Tx" ? "selected" : ""}>
        Falla Tx
    </option>

</select>

            </td>

        </tr>

       `;
}).join("");

}


async function cargarPlaneacion(){

    const resp = await fetch(DATASET_URL);
    const texto = await resp.text();

   const filas = texto
    .trim()
    .split(/\r?\n/)
    .map(fila => {

        const valores = [];
        let actual = "";
        let dentroComillas = false;

        for(let i=0;i<fila.length;i++){

            const caracter = fila[i];

            if(caracter === '"'){

                dentroComillas = !dentroComillas;

            }else if(
                caracter === "," &&
                !dentroComillas
            ){

                valores.push(actual);
                actual = "";

            }else{

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

    try {

    const respD1 =
        await fetch(API_URL);

    const registrosD1 =
        await respD1.json();

    window.registrosD1 =
        registrosD1;

} catch (error) {

    console.error(error);

    window.registrosD1 = {};

}

window.registrosD1 =
    registrosD1;

    const idxID =
        encabezados.findIndex(h => h.trim() === "ID");

    const idxDepto =
        encabezados.findIndex(h => h.trim() === "Departamento");

    const departamentos = [
    ...new Set(
        datos.map(fila => fila[idxDepto])
    )
].sort();

document.getElementById(
    "filtroDepartamento"
).innerHTML = `
    <option value="">Todos los departamentos</option>
` + departamentos.map(dep => `
    <option value="${dep}">${dep}</option>
`).join("");

    const idxMunicipio =
        encabezados.findIndex(h => h.trim() === "Municipio");

    const idxOT =
        encabezados.findIndex(h => h.trim() === "OT");

    const idxIM =
        encabezados.findIndex(h => h.trim() === "IM");

    const idxAfectacion =
        encabezados.findIndex(
            h => h.trim() === "Tipo de afectación"
        );

    const idxDias =
        encabezados.findIndex(
            h => h.trim() === "Días OT"
        );

    const idxPrioridad =
        encabezados.findIndex(
            h => h.trim() === "Tipo de prioridad"
        );

    const idxBacklog =
    encabezados.findIndex(
        h => h.trim() === "Indicador backlog"
    );
    const otsAlta = new Set();

datos.forEach(fila => {

    const prioridad =
        (fila[idxPrioridad] || "")
        .trim()
        .toUpperCase();

    if(prioridad === "ALTA"){

        otsAlta.add(
            fila[idxOT]
        );

    }

});

const altaPrioridad =
    otsAlta.size;
    
    const otsMedia = new Set();

datos.forEach(fila => {

    const prioridad =
        (fila[idxPrioridad] || "")
        .trim()
        .toUpperCase();

    if(prioridad === "MEDIA"){

        otsMedia.add(
            fila[idxOT]
        );

    }

});

const mediaPrioridad =
    otsMedia.size;

const otsBaja = new Set();

datos.forEach(fila => {

    const prioridad =
        (fila[idxPrioridad] || "")
        .trim()
        .toUpperCase();

    if(prioridad === "BAJA"){

        otsBaja.add(
            fila[idxOT]
        );

    }

});

const bajaPrioridad =
    otsBaja.size;

const otsCumple = new Set();

datos.forEach(fila => {

    const backlog =
        (fila[idxBacklog] || "")
        .trim()
        .toUpperCase();

    if(backlog === "CUMPLE"){

        otsCumple.add(
            fila[idxOT]
        );

    }

});

const cumpleBacklog =
    otsCumple.size;

const otsNoCumple = new Set();

datos.forEach(fila => {

    const backlog =
        (fila[idxBacklog] || "")
        .trim()
        .toUpperCase();

    if(backlog === "NO CUMPLE"){

        otsNoCumple.add(
            fila[idxOT]
        );

    }

});

const noCumpleBacklog =
    otsNoCumple.size;
    
document.getElementById(
    "kpiAltaPlaneacion"
).textContent = altaPrioridad;

    document.getElementById(
    "kpiMediaPlaneacion"
).textContent = mediaPrioridad;

document.getElementById(
    "kpiBajaPlaneacion"
).textContent = bajaPrioridad;

document.getElementById(
    "kpiCumpleBacklog"
).textContent = cumpleBacklog;

document.getElementById(
    "kpiNoCumpleBacklog"
).textContent = noCumpleBacklog;

    
pintarTabla(datos);
actualizarKPIs(datos);

}



function actualizarKPIs(datos){

    const encabezados = encabezadosGlobal;

    const idxOT =
        encabezados.findIndex(
            h => h.trim() === "OT"
        );

    const idxPrioridad =
        encabezados.findIndex(
            h => h.trim() === "Tipo de prioridad"
        );

    const idxBacklog =
        encabezados.findIndex(
            h => h.trim() === "Indicador backlog"
        );

    const otsAlta = new Set();
    const otsMedia = new Set();
    const otsBaja = new Set();

    const otsCumple = new Set();
    const otsNoCumple = new Set();

    datos.forEach(fila => {

        const ot =
            (fila[idxOT] || "")
            .trim();

        const prioridad =
            (fila[idxPrioridad] || "")
            .trim()
            .toUpperCase();

        const backlog =
            (fila[idxBacklog] || "")
            .trim()
            .toUpperCase();

        if (prioridad === "ALTA") {
            otsAlta.add(ot);
        }

        if (prioridad === "MEDIA") {
            otsMedia.add(ot);
        }

        if (prioridad === "BAJA") {
            otsBaja.add(ot);
        }

        if (backlog === "CUMPLE") {
            otsCumple.add(ot);
        }

        if (backlog === "NO CUMPLE") {
            otsNoCumple.add(ot);
        }

    });

    document.getElementById(
        "kpiAltaPlaneacion"
    ).textContent = otsAlta.size;

    document.getElementById(
        "kpiMediaPlaneacion"
    ).textContent = otsMedia.size;

    document.getElementById(
        "kpiBajaPlaneacion"
    ).textContent = otsBaja.size;

    document.getElementById(
        "kpiCumpleBacklog"
    ).textContent = otsCumple.size;

    document.getElementById(
        "kpiNoCumpleBacklog"
    ).textContent = otsNoCumple.size;

}

document.addEventListener(
    "DOMContentLoaded",
    cargarPlaneacion
);
function aplicarFiltros(){

    const texto =
        document.getElementById(
            "filtroBusqueda"
        ).value.toLowerCase();

    const depto =
        document.getElementById(
            "filtroDepartamento"
        ).value;

    const encabezados =
        encabezadosGlobal;

    const idxID =
        encabezados.findIndex(
            h => h.trim() === "ID"
        );

    const idxOT =
        encabezados.findIndex(
            h => h.trim() === "OT"
        );

    const idxMunicipio =
        encabezados.findIndex(
            h => h.trim() === "Municipio"
        );

    const idxDepto =
        encabezados.findIndex(
            h => h.trim() === "Departamento"
        );

    const resultado =
        datosGlobal.filter(fila => {

            const cumpleTexto =

                String(fila[idxID] || "")
                .toLowerCase()
                .includes(texto)

                ||

                String(fila[idxOT] || "")
                .toLowerCase()
                .includes(texto)

                ||

                String(fila[idxMunicipio] || "")
                .toLowerCase()
                .includes(texto);

            const cumpleDepto =

                !depto ||

                fila[idxDepto] === depto;

            return cumpleTexto && cumpleDepto;
        });

    pintarTabla(resultado);
    actualizarKPIs(resultado);

}

document.addEventListener("input",(e)=>{

    if(
        e.target.id === "filtroBusqueda"
    ){
        aplicarFiltros();
    }

});

document.addEventListener("change",(e)=>{

    if(
        e.target.classList.contains(
            "estado-programacion"
        )
    ){

        const fila =
            e.target.closest("tr");

        const fecha =
            fila.querySelector(
                ".fecha-input"
            );

        const valor =
            e.target.value;

        if(valor === "Programada"){

            fecha.type = "date";
            fecha.disabled = false;
            fecha.value = "";

        }
        else if(valor === "Pendiente"){

            fecha.type = "text";
            fecha.disabled = true;
            fecha.value = "En validación";

        }
        else{

            fecha.type = "text";
            fecha.disabled = true;
            fecha.value = "No aplica";

        }

        return;
    }

    if(
        e.target.id === "filtroDepartamento"
    ){
        aplicarFiltros();
    }

});

document.addEventListener(
    "blur",
    async e => {

        if(
            !e.target.classList.contains(
                "observacion"
            )
        ) return;

        const fila =
            e.target.closest("tr");

        if(!fila) return;

        await guardarOT(fila);

    },
    true
);
async function guardarOT(fila){

    const ot =
        fila.children[3]
            .textContent
            .trim();

    const payload = {

        ot,

        estadoProgramacion:
            fila.querySelector(
                ".estado-programacion"
            )?.value || "",

        fechaProgramacion:
            fila.querySelector(
                ".fecha-input"
            )?.value || "",

        observacion:
            fila.querySelector(
                ".observacion"
            )?.value || "",

        estadoGestion:
            fila.querySelectorAll(
                ".edit-select"
            )[1]?.value || ""

    };

    await fetch(API_URL,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(payload)
    });

}
document.addEventListener(
    "change",
    async e => {

        const fila =
            e.target.closest("tr");

        if(!fila) return;

        await guardarOT(fila);

    }
);
