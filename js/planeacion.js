const DATASET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRUdWw76b-hysCr5vGj2sS6PsMR2a7IuV_7fOL1HO_gaq5Bq-Aa5dqjhGKogvgXR3uH_HHb8oEYqfY_/pub?output=csv";

async function cargarPlaneacion(){

    const resp = await fetch(DATASET_URL);
    const texto = await resp.text();

    const filas = texto
        .trim()
        .split("\n")
        .map(f => f.split(","));

    const encabezados = filas[0];
    const datos = filas.slice(1);

    const idxID =
        encabezados.findIndex(h => h.trim() === "ID");

    const idxDepto =
        encabezados.findIndex(h => h.trim() === "Departamento");

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

    document.getElementById(
        "planeacionBody"
    ).innerHTML = datos.slice(0,100).map(fila => `

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

document.addEventListener(
    "DOMContentLoaded",
    cargarPlaneacion
);
