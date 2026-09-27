const DATASET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRUdWw76b-hysCr5vGj2sS6PsMR2a7IuV_7fOL1HO_gaq5Bq-Aa5dqjhGKogvgXR3uH_HHb8oEYqfY_/pub?output=csv";

async function cargarDataset() {

    try {

        const resp = await fetch(DATASET_URL);
        const texto = await resp.text();

        const filas = texto
            .trim()
            .split("\n")
            .map(fila => fila.split(","));

        const encabezados = filas[0];
        const datos = filas.slice(1);

        const idxOT = encabezados.indexOf("OT");
        const idxID = encabezados.indexOf("ID");

        const otsUnicas = new Set(
            datos.map(f => f[idxOT])
        );

        const idsUnicos = new Set(
            datos.map(f => f[idxID])
        );

        document.getElementById("kpiOTs").textContent =
            otsUnicas.size.toLocaleString("es-CO");

        document.getElementById("kpiIds").textContent =
            idsUnicos.size.toLocaleString("es-CO");

        document.getElementById("ultimaActualizacion").textContent =
            new Date().toLocaleString("es-CO");

        console.log("Dataset cargado");
        console.log("OTs únicas:", otsUnicas.size);
        console.log("IDs únicos:", idsUnicos.size);

    } catch (error) {

        console.error(error);

        document.getElementById("kpiOTs").textContent = "ERR";
        document.getElementById("kpiIds").textContent = "ERR";
    }

}

document.addEventListener(
    "DOMContentLoaded",
    cargarDataset
);
