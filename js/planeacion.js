const DATASET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRUdWw76b-hysCr5vGj2sS6PsMR2a7IuV_7fOL1HO_gaq5Bq-Aa5dqjhGKogvgXR3uH_HHb8oEYqfY_/pub?output=csv";

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
    ).innerHTML = datos.map(fila => `

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

        <option></option>
        <option>Programada</option>
        <option>Pendiente</option>
        <option>N/A</option>
        <option>Postular FM</option>
        <option>Postular abastecimiento</option>

    </select>
</td>

<td>
    <input
    class="edit-input fecha-input"
    type="text"
    value="Definir estado"
    disabled>

</td>

            <td>
                <input
                    class="edit-input"
                    placeholder="Observación">
            </td>

            <td>
                <select class="edit-select">
    <option></option>
    <option>Gestionable</option>
    <option>Operativa</option>
    <option>Cancelada</option>
    <option>FM/traslado/reubicación</option>
    <option>Abastecimiento</option>
    <option>Falla Tx</option>
</select>

            </td>

        </tr>

    `).join("");

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
