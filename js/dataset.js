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
        console.log("ENCABEZADOS:");
console.log(encabezados);
        const datos = filas.slice(1);
        console.log("PRIMER REGISTRO:");
console.log(datos[0]);

        const idxOT =
    encabezados.findIndex(
        h => h.trim() === "OT"
    );

       const idxID =
    encabezados.findIndex(
        h => h.trim() === "ID"
    );

        const idxDepto =
    encabezados.findIndex(
        h => h.trim() === "Departamento"
    );

        const idxPrioridad =
    encabezados.findIndex(
        h => h.trim() === "Tipo de prioridad"
    );

        const idxAfectacion =
    encabezados.findIndex(
        h => h.trim() === "Tipo de afectación"
    );
        const otsUnicas =
            new Set(
                datos.map(f => f[idxOT])
            );

        const idsUnicos =
            new Set(
                datos.map(f => f[idxID])
            );

        const otsAlta = new Set();

datos.forEach(fila => {

    const prioridad =
        (fila[idxPrioridad] || "")
        .trim()
        .toUpperCase();

    if (prioridad === "ALTA") {

        otsAlta.add(
            fila[idxOT]
        );

    }

});

const altoImpacto =
    otsAlta.size;

        document.getElementById("kpiOTs").textContent =
            otsUnicas.size.toLocaleString("es-CO");

        document.getElementById("kpiIds").textContent =
            idsUnicos.size.toLocaleString("es-CO");

        document.getElementById("kpiImpacto").textContent =
            altoImpacto.toLocaleString("es-CO");

        document.getElementById("ultimaActualizacion").textContent =
            new Date().toLocaleString("es-CO");

        const deptos = {
            ANTIOQUIA: 0,
            CESAR: 0,
            "LA GUAJIRA": 0,
            SAI: 0
        };

        datos.forEach(fila => {

            const depto =
                (fila[idxDepto] || "")
                    .trim()
                    .toUpperCase();

            if (deptos[depto] !== undefined) {
                deptos[depto]++;
            }

        });

        document.getElementById("depAntioquia").textContent =
            deptos.ANTIOQUIA;

        document.getElementById("depCesar").textContent =
            deptos.CESAR;

        document.getElementById("depGuajira").textContent =
            deptos["LA GUAJIRA"];

        document.getElementById("depSAI").textContent =
            deptos.SAI;

        const maxDepto = Math.max(
            deptos.ANTIOQUIA,
            deptos.CESAR,
            deptos["LA GUAJIRA"],
            deptos.SAI
        );

        document.getElementById("barAntioquia").style.width =
            ((deptos.ANTIOQUIA / maxDepto) * 100) + "%";

        document.getElementById("barCesar").style.width =
            ((deptos.CESAR / maxDepto) * 100) + "%";

        document.getElementById("barGuajira").style.width =
            ((deptos["LA GUAJIRA"] / maxDepto) * 100) + "%";

        document.getElementById("barSAI").style.width =
            ((deptos.SAI / maxDepto) * 100) + "%";

        const afectaciones = {
            "OFFLINE": 0,
            "PARCIAL": 0,
            "VELOCIDAD": 0,
            "PQR": 0,
            "P3": 0,
            "OPERATIVO": 0
        };

        datos.forEach(fila => {

    const afectacion =
        (fila[idxAfectacion] || "")
            .trim()
            .toUpperCase();

    if (
        afectacion === "AFECTACIÓN TOTAL" ||
        afectacion === "AFECTACION TOTAL" ||
        afectacion === "MASIVA"
    ) {

        afectaciones.OFFLINE++;

    } else if (
        afectacion === "PARCIAL"
    ) {

        afectaciones.PARCIAL++;

    } else if (
        afectacion === "VELOCIDAD"
    ) {

        afectaciones.VELOCIDAD++;

    } else if (
        afectacion === "PQR"
    ) {

        afectaciones.PQR++;

    } else if (
        afectacion === "P3"
    ) {

        afectaciones.P3++;

    }

});

        document.getElementById("afOffline").textContent =
            afectaciones.OFFLINE || 0;

        document.getElementById("afParcial").textContent =
            afectaciones.PARCIAL || 0;

        document.getElementById("afVelocidad").textContent =
            afectaciones.VELOCIDAD || 0;

        document.getElementById("afPQR").textContent =
            afectaciones.PQR || 0;

        document.getElementById("afP3").textContent =
            afectaciones.P3 || 0;

        document.getElementById("afOperativo").textContent =
    afectaciones.OPERATIVO || 0;

const maxAfectacion = Math.max(
    afectaciones.OFFLINE,
    afectaciones.PARCIAL,
    afectaciones.VELOCIDAD,
    afectaciones.PQR,
    afectaciones.P3,
    afectaciones.OPERATIVO,
    1
);

        console.log(afectaciones);
console.log("maxAfectacion", maxAfectacion);

        document.getElementById("barOffline").style.width =
            ((afectaciones.OFFLINE / maxAfectacion) * 100) + "%";

        document.getElementById("barParcial").style.width =
            ((afectaciones.PARCIAL / maxAfectacion) * 100) + "%";

        document.getElementById("barVelocidad").style.width =
            ((afectaciones.VELOCIDAD / maxAfectacion) * 100) + "%";

        document.getElementById("barPQR").style.width =
            ((afectaciones.PQR / maxAfectacion) * 100) + "%";

        document.getElementById("barP3").style.width =
            ((afectaciones.P3 / maxAfectacion) * 100) + "%";
        console.log(
  "P3",
  afectaciones.P3,
  maxAfectacion,
  ((afectaciones.P3 / maxAfectacion) * 100)
);

        document.getElementById("barOperativo").style.width =
            ((afectaciones.OPERATIVO / maxAfectacion) * 100) + "%";

        console.log("Dataset cargado correctamente");

    } catch (error) {

        console.error(error);

        document.getElementById("kpiOTs").textContent = "ERR";
        document.getElementById("kpiIds").textContent = "ERR";
        document.getElementById("kpiImpacto").textContent = "ERR";
    }

}

document.addEventListener(
    "DOMContentLoaded",
    cargarDataset
);
