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

const departamentosOrdenados = [
    {
        nombre: "Antioquia",
        valor: deptos.ANTIOQUIA
    },
    {
        nombre: "La Guajira",
        valor: deptos["LA GUAJIRA"]
    },
    {
        nombre: "Cesar",
        valor: deptos.CESAR
    },
    {
        nombre: "SAI",
        valor: deptos.SAI
    }
]
.sort((a,b) => b.valor - a.valor);

const maxDepto = Math.max(
    ...departamentosOrdenados.map(d => d.valor),
    1
);

document.getElementById("departamentosContainer").innerHTML =
departamentosOrdenados.map(item => {

    const porcentaje =
        (item.valor / maxDepto) * 100;

    let color = "#e5e7eb";

    if (porcentaje >= 90) {
        color = "#ff4d6d";
    } else if (porcentaje >= 75) {
        color = "#ff6b5f";
    } else if (porcentaje >= 60) {
        color = "#ff8b4d";
    } else if (porcentaje >= 45) {
        color = "#ffb020";
    } else if (porcentaje >= 25) {
        color = "#ffd029";
    } else {
        color = "#ffe680";
    }

    return `
        <div class="bar-row">
            <span>${item.nombre}</span>
            <div class="bar-track">
                <div
                    class="bar-fill"
                    style="
                        width:${porcentaje}%;
                        background:${color};
                    ">
                </div>
            </div>
            <strong>${item.valor}</strong>
        </div>
    `;

}).join("");

const maxAfectacion = Math.max(
    afectaciones.OFFLINE,
    afectaciones.PARCIAL,
    afectaciones.VELOCIDAD,
    afectaciones.PQR,
    afectaciones.P3,
    afectaciones.OPERATIVO,
    1
);

const afectacionesOrdenadas = [
    {
        nombre: "Offline",
        valor: afectaciones.OFFLINE
    },
    {
        nombre: "Parcial",
        valor: afectaciones.PARCIAL
    },
    {
        nombre: "Velocidad",
        valor: afectaciones.VELOCIDAD
    },
    {
        nombre: "PQR",
        valor: afectaciones.PQR
    },
    {
        nombre: "P3",
        valor: afectaciones.P3
    },
    {
        nombre: "Operativo",
        valor: afectaciones.OPERATIVO
    }
]
.sort((a,b) => b.valor - a.valor);

document.getElementById("afectacionesContainer").innerHTML =
afectacionesOrdenadas.map(item => {

    const porcentaje =
        (item.valor / maxAfectacion) * 100;

    let color = "#e5e7eb";

    if (porcentaje >= 90) {
        color = "#ff4d6d";
    } else if (porcentaje >= 75) {
        color = "#ff6b5f";
    } else if (porcentaje >= 60) {
        color = "#ff8b4d";
    } else if (porcentaje >= 45) {
        color = "#ffb020";
    } else if (porcentaje >= 25) {
        color = "#ffd029";
    } else {
        color = "#ffe680";
    }

    return `
        <div class="bar-row">
            <span>${item.nombre}</span>
            <div class="bar-track">
                <div
                    class="bar-fill"
                    style="
                        width:${porcentaje}%;
                        background:${color};
                    ">
                </div>
            </div>
            <strong>${item.valor}</strong>
        </div>
    `;

}).join(""); 

        const idsCriticos = {};

datos.forEach(fila => {

    const id = (fila[idxID] || "").trim();

    if (!id) return;

    if (!idsCriticos[id]) {
        idsCriticos[id] = {
            id: id,
            departamento: fila[idxDepto] || "",
            municipio: fila[encabezados.findIndex(
                h => h.trim() === "Municipio"
            )] || "",
            afectacion: fila[idxAfectacion] || "",
            prioridad: fila[idxPrioridad] || "",
            cantidad: 0
        };
    }

    idsCriticos[id].cantidad++;

});

const topIds = Object.values(idsCriticos)
    .sort((a,b) => b.cantidad - a.cantidad)
    .slice(0,10);

document.getElementById("topIdsContainer").innerHTML =
topIds.map(item => `
    <div class="table-row">
        <span>${item.id}</span>
        <span>${item.departamento}</span>
        <span>${item.municipio}</span>
        <span>${item.afectacion}</span>
        <b class="priority ${
            item.prioridad === "Alta"
                ? "high"
                : "medium"
        }">
            ${item.prioridad}
        </b>
    </div>
`).join("");
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
