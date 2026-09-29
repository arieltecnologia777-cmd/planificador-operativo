const DATASET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRUdWw76b-hysCr5vGj2sS6PsMR2a7IuV_7fOL1HO_gaq5Bq-Aa5dqjhGKogvgXR3uH_HHb8oEYqfY_/pub?output=csv";

let datosGlobal = [];
let encabezadosGlobal = [];

async function cargarPlaneacion(){

    const resp = await fetch(DATASET_URL);
    const texto = await resp.text();

    const filas = texto
        .trim()
        .split("\n")
        .map(f => f.split(","));

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

    const altaPrioridad =
    datos.filter(
        fila =>
            (fila[idxPrioridad] || "").trim() === "Alta"
    ).length;

document.getElementById(
    "kpiAltaPlaneacion"
).textContent = altaPrioridad;
    

    function pintarTabla(datos){

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
                <input
                    class="edit-input"
                    type="date">
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
                    <option>Abastecimiento</option>
                    <option>Escalar abastecimiento</option>
                    <option>FM / Traslado</option>
                    <option>Cancelada</option>
                </select>
            </td>

        </tr>

    `).join("");

}

pintarTabla(datos);

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
        e.target.id === "filtroDepartamento"
    ){
        aplicarFiltros();
    }

});
