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

const idxRangoAfectacion =
    encabezados.findIndex(
        h => h.trim() === "Rango de afectación"
    );

const idxStoppersDominion =
    encabezados.findIndex(
        h => h.trim() === "Stoppers Dominion"
    );

const idxBacklog =
    encabezados.findIndex(
        h => h.trim() === "Indicador backlog"
    );

const idxStopperP3 =
    encabezados.findIndex(
        h => h.trim() === "Stopper P3"
    );

const idxTipoFacturacion =
    encabezados.findIndex(
        h => h.trim() === "Tipo facturación"
    );

const idxFechaFM =
    encabezados.findIndex(
        h => h.trim() === "Fecha vencimiento FM"
    );

const idxAlertaFM =
    encabezados.findIndex(
        h => h.trim() === "Alerta vencimiento FM"
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

        const clave = fila[idxOT];

const d1 =
    (window.registrosD1 || {})[
        clave
    ] || {};

if (
    fila[idxOT] === "OT5362697"
) {
    console.log(
        "REGISTRO ENCONTRADO",
        clave,
        d1
    );
}

        let fechaTipo = "text";
let fechaDisabled = "disabled";
let fechaValor = d1.fechaProgramacion || "⟵ Definir estado";

if (
    d1.estadoProgramacion === "Programada" ||
    d1.estadoProgramacion === "Cancelada"
) {

    fechaTipo = "date";
    fechaDisabled = "";

    fechaValor =
        d1.fechaProgramacion || "";

}
else if (
    d1.estadoProgramacion === "Pendiente"
) {

    fechaValor = "En validación";

}
else if (
    d1.estadoProgramacion === "N/A" ||
    d1.estadoProgramacion === "Postular FM" ||
    d1.estadoProgramacion === "Postular abast."
) {

    fechaValor = "No aplica";

}
    return `

        <tr>

            <td>${fila[idxID]}</td>
<td>${fila[idxDepto]}</td>
<td>${fila[idxMunicipio]}</td>
<td>${fila[idxIM]}</td>
<td>${fila[idxOT]}</td>
<td>${fila[idxAfectacion]}</td>
<td>${fila[idxDias]}</td>
<td>${fila[idxRangoAfectacion]}</td>
<td>${fila[idxPrioridad]}</td>
<td>${fila[idxStoppersDominion]}</td>

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
    type="${fechaTipo}"
    value="${fechaValor}"
    ${fechaDisabled}>

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
<td>${fila[idxBacklog]}</td>
<td>${fila[idxStopperP3]}</td>
<td>${fila[idxTipoFacturacion]}</td>
<td>${fila[idxFechaFM]}</td>
<td>${fila[idxAlertaFM]}</td>
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

window.registrosD1 =
    await leerCacheD1();

    pintarTabla(datos);
    try {

    const respD1 =
        await fetch(API_URL);

    const registrosD1 =
        await respD1.json();

    window.registrosD1 =
    registrosD1;

await guardarCacheD1(
    registrosD1
);

} catch (error) {

    console.error(error);

    window.registrosD1 = {};

}

const programados = Object.values(
    registrosD1 || {}
).filter(registro =>
    registro.estadoProgramacion === "Programada"
).length;

document.getElementById(
    "kpiProgramadosD1"
).textContent = programados;

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

    const idxRangoAfectacion =
    encabezados.findIndex(
        h => h.trim() === "Rango de afectación"
    );

const idxStoppersDominion =
    encabezados.findIndex(
        h => h.trim() === "Stoppers Dominion"
    );

const idxBacklog =
    encabezados.findIndex(
        h => h.trim() === "Indicador backlog"
    );
    

const prioridades = Array.from(
    new Set(
        datos.map(fila => fila[idxPrioridad])
    )
)
.filter(Boolean)
.sort();

document.getElementById(
    "filtroPrioridad"
).innerHTML = `
    <option value="">Todas las prioridades</option>
` + prioridades.map(valor => `
    <option value="${valor}">${valor}</option>
`).join("");
    const afectaciones = Array.from(
    new Set(
        datos.map(fila => fila[idxAfectacion])
    )
)
.filter(Boolean)
.sort();

document.getElementById(
    "filtroAfectacion"
).innerHTML = `
    <option value="">Todas las afectaciones</option>
` + afectaciones.map(valor => `
    <option value="${valor}">${valor}</option>
`).join("");
    
   const stoppers = Array.from(
    new Set(
        datos.map(fila => fila[idxStoppersDominion])
    )
)
.filter(Boolean)
.sort();

document.getElementById(
    "filtroStoppers"
).innerHTML = `
    <option value="">Todos los stoppers</option>
` + stoppers.map(valor => `
    <option value="${valor}">${valor}</option>
`).join("");

 const rangos = Array.from(
    new Set(
        datos.map(fila => fila[idxRangoAfectacion])
    )
)
.filter(Boolean)
.sort();

document.getElementById(
    "filtroRango"
).innerHTML = `
    <option value="">Todos los rangos</option>
` + rangos.map(valor => `
    <option value="${valor}">${valor}</option>
`).join("");

    const backlogs = Array.from(
    new Set(
        datos.map(fila => fila[idxBacklog])
    )
)
.filter(Boolean)
.sort();

document.getElementById(
    "filtroBacklog"
).innerHTML = `
    <option value="">Todo backlog</option>
` + backlogs.map(valor => `
    <option value="${valor}">${valor}</option>
`).join("");
    
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

    
actualizarKPIs(datos);

pintarTabla(datos);

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
    
const prioridad =
    document.getElementById(
        "filtroPrioridad"
    ).value;
   const afectacion =
    document.getElementById(
        "filtroAfectacion"
    ).value;

const stoppers =
    document.getElementById(
        "filtroStoppers"
    ).value;

const rango =
    document.getElementById(
        "filtroRango"
    ).value;

const backlog =
    document.getElementById(
        "filtroBacklog"
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
const idxPrioridad =
    encabezados.findIndex(
        h => h.trim() === "Tipo de prioridad"
    );
  const idxAfectacion =
    encabezados.findIndex(
        h => h.trim() === "Tipo de afectación"
    );

const idxStoppers =
    encabezados.findIndex(
        h => h.trim() === "Stoppers Dominion"
    );

const idxRango =
    encabezados.findIndex(
        h => h.trim() === "Rango de afectación"
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
            
            const cumplePrioridad =

    !prioridad ||

    fila[idxPrioridad] === prioridad;

            const cumpleAfectacion =

    !afectacion ||

    fila[idxAfectacion] === afectacion;

const cumpleStoppers =

    !stoppers ||

    fila[idxStoppers] === stoppers;

const cumpleRango =

    !rango ||

    fila[idxRango] === rango;

const cumpleBacklog =

    !backlog ||

    fila[idxBacklog] === backlog;

           return (
    cumpleTexto &&
    cumpleDepto &&
    cumplePrioridad &&
    cumpleAfectacion &&
    cumpleStoppers &&
    cumpleRango &&
    cumpleBacklog
);
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
else if(valor === "N/A"){

    fecha.type = "text";
    fecha.disabled = true;
    fecha.value = "No aplica";

}
else if(
    valor === "Postular FM" ||
    valor === "Postular abast."
){

    fecha.type = "text";
    fecha.disabled = true;
    fecha.value = "No aplica";

}
else if(valor === "Cancelada"){

    fecha.type = "date";
    fecha.disabled = false;
    fecha.value = "";

}
else if(valor === ""){

    fecha.type = "text";
    fecha.disabled = true;
    fecha.value = "⟵ Definir estado";

}

        return;
    }

    if(
    e.target.id === "filtroDepartamento" ||
    e.target.id === "filtroPrioridad" ||
    e.target.id === "filtroAfectacion" ||
    e.target.id === "filtroStoppers" ||
    e.target.id === "filtroRango" ||
    e.target.id === "filtroBacklog"
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
        fila.children[4]
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
console.log("GUARDANDO", payload);

    console.log(
    "CLAVE KV:",
    payload.ot
);

const resp = await fetch(API_URL,{
    method:"POST",
    headers:{
        "Content-Type":"application/json"
    },
    body:JSON.stringify(payload)
});

console.log("STATUS", resp.status);

const resultado = await resp.json();

console.log("RESPUESTA", resultado);

if (resultado.ok) {

    window.registrosD1 =
        window.registrosD1 || {};

    window.registrosD1[payload.ot] = {
        ot: payload.ot,

        estadoProgramacion:
            payload.estadoProgramacion,

        fechaProgramacion:
            payload.fechaProgramacion,

        observacion:
            payload.observacion,

        estadoGestion:
            payload.estadoGestion,

        updatedAt:
            new Date().toISOString()
    };

    await guardarCacheD1(
        window.registrosD1
    );
pintarTabla(datosGlobal);
}

    setTimeout(async () => {

    try {

        const resp =
            await fetch(API_URL);

        window.registrosD1 =
            await resp.json();

    } catch {}

}, 1500);
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
const wrapper = document.querySelector('.planeacion-table-wrapper');

let scrollTimer;

wrapper.addEventListener('scroll', () => {

    clearTimeout(scrollTimer);

    scrollTimer = setTimeout(() => {

        const firstRow = wrapper.querySelector('tbody tr');
        if (!firstRow) return;

        const rowHeight = firstRow.offsetHeight;

        const target =
            Math.round(wrapper.scrollTop / rowHeight) * rowHeight;

        wrapper.scrollTo({
            top: target,
            behavior: 'smooth'
        });

    }, 80);

});

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

    const header =
        document.querySelector('.planeacion-header');

    const filtros =
        document.querySelector('.planeacion-filtros-sticky');

    if (!header || !filtros) return;

    const alturaHeader = header.offsetHeight;
    const alturaFiltros = filtros.offsetHeight;

    document.documentElement.style.setProperty(
        '--sticky-table-top',
        `${alturaHeader + alturaFiltros}px`
    );
}

window.addEventListener('load', actualizarStickyTabla);
window.addEventListener('resize', actualizarStickyTabla);

function detectarZoom() {
    const zoom = Math.round(window.devicePixelRatio * 100);

    document.body.classList.toggle(
        'zoom-alto',
        zoom > 105
    );
}

window.addEventListener('resize', detectarZoom);
detectarZoom();

function abrirDB() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(
                "planeacionDB",
                1
            );

        request.onupgradeneeded = (event) => {

            const db =
                event.target.result;

            if (
                !db.objectStoreNames.contains(
                    "registrosD1"
                )
            ) {

                db.createObjectStore(
                    "registrosD1"
                );

            }

        };

        request.onsuccess = () =>
            resolve(
                request.result
            );

        request.onerror = () =>
            reject(
                request.error
            );

    });

}

async function guardarCacheD1(
    datos
) {

    const db =
        await abrirDB();

    const tx =
        db.transaction(
            "registrosD1",
            "readwrite"
        );

    tx.objectStore(
        "registrosD1"
    ).put(
        datos,
        "cache"
    );

}

async function leerCacheD1() {

    const db =
        await abrirDB();

    return new Promise(
        resolve => {

            const tx =
                db.transaction(
                    "registrosD1",
                    "readonly"
                );

            const request =
                tx
                .objectStore(
                    "registrosD1"
                )
                .get("cache");

            request.onsuccess =
                () => resolve(
                    request.result || {}
                );

            request.onerror =
                () => resolve({});

        }
    );

}

