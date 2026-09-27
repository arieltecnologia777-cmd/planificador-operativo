const DATASET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRUdWw76b-hysCr5vGj2sS6PsMR2a7IuV_7fOL1HO_gaq5Bq-Aa5dqjhGKogvgXR3uH_HHb8oEYqfY_/pub?output=csv";

async function cargarDataset() {
  try {

    const resp = await fetch(DATASET_URL);
    const texto = await resp.text();

    console.log("Dataset cargado");

    const filas = texto
      .trim()
      .split("\n")
      .map(f => f.split(","));

    const encabezados = filas[0];
    const datos = filas.slice(1);

    console.log("Columnas:", encabezados);
    console.log("Registros:", datos.length);

    document.getElementById("kpiOTs").textContent =
      datos.length.toLocaleString("es-CO");

  } catch (error) {

    console.error(error);

    document.getElementById("kpiOTs").textContent =
      "ERR";
  }
}

document.addEventListener(
  "DOMContentLoaded",
  cargarDataset
);
