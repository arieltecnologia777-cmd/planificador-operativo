
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas

    function cerrarSesion(automatico = false) {
  // 🔐 Limpiar sesión
  localStorage.removeItem("tecnicoSesion");

  // Limpiar usuario en memoria
  window.tecnicoActual = null;

  if (automatico) {
    alert("Tu sesión expiró por seguridad. Inicia sesión nuevamente.");
  }

  // Mostrar pantalla de login
  document.getElementById("loginScreen").style.display = "flex";

  // Ocultar aplicación
  document.getElementById("sidebar").style.display = "none";
  document.querySelector(".main").style.display = "none";
}
    
function verificarSesion() {
  const raw = localStorage.getItem("tecnicoSesion");
  if (!raw) return false;

  try {
    const sesion = JSON.parse(raw);
    const ahora = Date.now();

    if (
      !sesion.loginTime ||
      (ahora - sesion.loginTime) > SESSION_DURATION_MS
    ) {
      cerrarSesion(true);
      return false;
    }

    // ✅ Restaurar técnico en memoria
    window.tecnicoActual = sesion.usuario;
    localStorage.setItem("tecnicoActual", sesion.usuario);
    return true;

  } catch (e) {
    cerrarSesion(true);
    return false;
  }
}
    
    /* ================================
   CONFIGURACIÓN — FLUJOS
================================ */

// ✅ Descarga controlada (APP TÉCNICA)
const FLOW_DESCARGAR_MCI =
  "https://defaulte4e1bc33e2834312bb3789010224b7.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bd9e2227be594ecdb47c0da4a898d474/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=j3SlbYcxilxwhnHJfL95lpTA-Y2RzAtiNrmug_D01eQ";
// ================================
// DESCARGA DE INFORME (DESDE MODAL)
// ================================
async function descargarInforme(mciId) {
  if (!mciId) {
    alert("No se encontró el mciId del informe.");
    return;
  }

  console.log("📥 Descargando informe:", mciId);

try {

  const estado = await fetch(`https://cloudflare-index.modulo-de-exclusiones.workers.dev/estado?mciId=${mciId}`)
    .then(r => r.json());
  console.log("ESTADO:", estado);

  const resp = await fetch(FLOW_DESCARGAR_MCI, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mciId })
  });

    if (resp.status === 403) {
      const data = await resp.json();
      alert(data.error || "Informe no aprobado.");
      return;
    }

    if (resp.status !== 200) {
      alert("Error al descargar el informe");
      return;
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = (estado.fileName || `${mciId}.xlsx`).replace(/^MCI_/, "");
    document.body.appendChild(a);
    a.click();

    a.remove();
    URL.revokeObjectURL(url);

    console.log("✅ Descarga iniciada correctamente:", mciId);

  } catch (err) {
    console.error("❌ Error al descargar:", err);
    alert("Error inesperado en la descarga.");
  }
}
// ===================================================
// EVENT DELEGATION · DESCARGA DESDE MODAL (con feedback)
// ===================================================
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btnDescargar");
  if (!btn) return;

  const mciId = btn.dataset.mciid;
  if (!mciId) {
    alert("No se pudo identificar el informe.");
    return;
  }

  // ✅ Guardar texto original
  const textoOriginal = btn.innerHTML;

  try {
    // ✅ Estado visual: descargando
    btn.innerHTML = "⏳ Descargando…";
    btn.disabled = true;
    btn.style.opacity = "0.8";
    btn.style.cursor = "not-allowed";

    console.log("📥 Iniciando descarga:", mciId);

    // ✅ Ejecutar descarga
    await descargarInforme(mciId);

    console.log("✅ Descarga finalizada:", mciId);

  } catch (err) {
    console.error("❌ Error en la descarga:", err);
    alert("Ocurrió un error al descargar el informe.");
  } finally {
    // ✅ Restaurar botón
    btn.innerHTML = textoOriginal;
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  }
});
const photoInputs = [
  "img-firma-tec",
  "img-gps-geo",
  "img-ap-int",
  "img-ap-ext1",
  "img-ap-ext2",
  "img-pc-int",
  "img-movil-ext",
  "img-senal-ext",
  "img-senal-int",
  "img-respaldo",
  "img-print-ups",
  "img-med1-0",
  "img-med1-1",
  "img-med2",
  "img-nav-indoor-0",
  "img-nav-indoor-1",
  "img-nav-indoor-2",
  "img-nav-outdoor-0",
  "img-nav-outdoor-1",
  "img-nav-outdoor-2",
  "img-speedtest",
  "img-portal",
  "img-block1",
  "img-block2",
  "img-antes-serial-1",
  "img-antes-serial-2",
  "img-antes-serial-3",
  "img-antes-serial-4",
  "img-antes-serial-5",
  "img-antes-serial-6",
  "img-antes-diag-1",
  "img-antes-diag-2",
  "img-antes-diag-3",
  "img-antes-diag-4",
  "img-antes-diag-5",
  "img-antes-diag-6",
  "img-antes-diag-7",
  "img-antes-diag-8",
  "img-antes-diag-9",
  "img-antes-diag-10",
  "img-antes-diag-11",
  "img-antes-diag-12",
  "img-despues-serial-1",
  "img-despues-serial-2",
  "img-despues-serial-3",
  "img-despues-serial-4",
  "img-despues-serial-5",
  "img-despues-serial-6",
  "img-despues-res-1",
  "img-despues-res-2",
  "img-despues-res-3",
  "img-despues-res-4",
  "img-despues-res-5",
  "img-despues-res-6",
  "img-despues-res-7",
  "img-despues-res-8",
  "img-despues-res-9",
  "img-despues-res-10",
  "img-despues-res-11",
  "img-despues-res-12"
];


/* === IndexedDB: Apertura de base local === */
let mciDB;
const mciRequest = indexedDB.open("MCI_DB", 1);

mciRequest.onupgradeneeded = (event) => {
    mciDB = event.target.result;

    // Guarda TODO el MCI (texto + JSON)
    if (!mciDB.objectStoreNames.contains("draft")) {
        mciDB.createObjectStore("draft", { keyPath: "id" });
    }

    // Guarda fotos (blobs)
    if (!mciDB.objectStoreNames.contains("photos")) {
        mciDB.createObjectStore("photos", { keyPath: "id" });
    }
};


mciRequest.onerror = () => {
    console.log("❌ Error IndexedDB");
};

/* === RESTAURAR TEXTO + FOTOS DESDE INDEXEDDB AL ABRIR === */
mciRequest.onsuccess = (event) => {
    mciDB = event.target.result;

    // Restaurar texto
    dbLoadDraft((draft) => {
        if (draft) {
            try {
                // Copiar datos restaurados a localStorage
                localStorage.setItem("MCI_DRAFT_v1", JSON.stringify(draft));

                // Restaurar usando tu propia función
                restoreDraft();

                console.log("🔄 Texto restaurado offline");
            } catch (e) {
                console.log("⚠️ Error restaurando texto:", e);
            }
        }
    });

    // Restaurar fotos (tu función ya existe)
    if (typeof conectarInputsDeFoto === "function") {
        conectarInputsDeFoto();
    }
};


/* === Funciones para guardar y cargar datos === */

// Guardar borrador general
function dbSaveDraft(data) {
    const tx = mciDB.transaction("draft", "readwrite");
    tx.objectStore("draft").put({ id: 1, data });
    console.log("💾 Borrador guardado en IndexedDB");
}

// Leer borrador
function dbLoadDraft(callback) {
    const tx = mciDB.transaction("draft", "readonly");
    const req = tx.objectStore("draft").get(1);

    req.onsuccess = () => {
        callback(req.result ? req.result.data : null);
    };
}

// Guardar foto por ID
function dbSavePhoto(key, blob) {
    const tx = mciDB.transaction("photos", "readwrite");
    tx.objectStore("photos").put({ id: key, blob });
}

// Cargar foto por ID
function dbLoadPhoto(key, callback) {
    const tx = mciDB.transaction("photos", "readonly");
    const req = tx.objectStore("photos").get(key);

    req.onsuccess = () => {
        callback(req.result ? req.result.blob : null);
    };
}


    // ==========
    // Navegación
    // ==========
    const body = document.body;
    const hamburger = document.getElementById('hamburger');
    const collapseBtn = document.getElementById('collapseBtn');
    const navLinks = Array.from(document.querySelectorAll('.nav a'));
    const sections = Array.from(document.querySelectorAll('.section'));
    const openSidebar = ()=> body.classList.add('sidebar-open');
    const closeSidebar = ()=> body.classList.remove('sidebar-open');
    hamburger.addEventListener('click', ()=> body.classList.toggle('sidebar-open'));
    collapseBtn.addEventListener('click', closeSidebar);
    navLinks.forEach(a=>{
      a.addEventListener('click',(e)=>{
        e.preventDefault();
        navLinks.forEach(n=>n.classList.remove('active'));
        a.classList.add('active');
        const tgt=a.getAttribute('data-target');
        sections.forEach(s=>s.classList.toggle('active', s.id===tgt));
        if (matchMedia('(max-width: 860px)').matches) closeSidebar();
      });
    });
    const obs = new MutationObserver(()=>{
      document.documentElement.style.overflow = body.classList.contains('sidebar-open') ? 'hidden' : '';
    });
    obs.observe(body, { attributes:true, attributeFilter:['class'] });

    // ==============================
    // Tabla "Equipos instalados/retirados"
    // ==============================
    const tbody = document.getElementById('tbody-equipos');
    const addRowBtn = document.getElementById('addRowBtn');
    const sapMap = new Map([

["4059967","ACCES-POINT PL-E410X00A-RW INDOOR CBNW"],
["4059968","ACCES-POINT PL-E510X00A-RW OUTDOOR CBNW"],

["4061093","ANTENA 1.2M BANDA SATELITAL KA"],
["4061094","ANTENA 1.8M KA T181 CLASS-III-SPEC SKWR"],
["4061099","ANTENA 1.8M RXTX CLASS-II T182 KU SKWR"],
["1052446","ANTENA 3FT 5GHZ 32DBI 4.9-5.9GHZ CBNW"],
["4061854","ANTENA ANT2035 1.2M BD KA/KU SB-11 NWTC"],
["4060053","ANTENA C050900D021 EPMP 5GHZ 90/120 CBNW"],
["4060389","ANTENA C050910D301A 4X4MU-MIMO"],
["1052445","ANTENA HG4958DP-30D 2FT 4.9-5.8GHZ CNBW"],
["1052449","ANTENA N000900L030A EPMP EXT GPS CBNW"],

["4059961","BATERIA 020-48025LF LITIO 25AH48V TAFL"],
["1053943","BATERIA 12V 26AH VRLA"],
["4059952","BATERIA 48NPFC50 ION LITIO 48V 50AH NRDA"],
["4059964","BATERIA CF4850T1EC LITIO 48V-50A DPC"],
["4059980","BATERIA FB101 EXTERNA LITIO 48V100AH ZTE"],
["4060273","BATERIA LFP48V30AH LITIO LIFEPO4 UPSN"],
["4060281","BATERIA LIT50-48C 50AH 48VDC LITIO ULTC"],
["4060278","BATERIA PINO ILFP-2560 LITIO 100AH INTI"],
["4060388","BATERIA WL48-25FT LIFEPO4 48VDC WLNG"],
["4060271","BATERIA YDC9602S-RT LITIO LIFEPO4 KSTR"],

["1029783","CABLE COAXIAL RG-6 (x carrete de 1000m)"],
["1052444","CABLE N000900L040A AC 1.2M C13 CBNW"],

["1022453","CONECTORES PARA CABLE COAXIAL RG-6 (kit x 2 conectores)"],

["4060277","CONTROLADOR CARGA CECRO ICC-4024150 INTI"],
["4060280","CONTROLADOR CG BLUESOLAR MPPT150/35 VCTR"],
["4059956","CONTROLADOR REXTRA3415N-XDS2 SOLAR EPVR"],
["4060293","CONTROLADOR TRACER5420AN EPVR"],

["4048063","DEMARCADOR RAX711-L-4GC-AC_DC EDD RACM"],

["4060070","FUENTE 100-240 48V 1.4_1.5A PWR PLUG"],
["1052443","FUENTE MXCRPSDC600A0 DC600W 37V-60V CBNW CRPS"],
["1053481","FUENTE POE DC 15W 30V ENERGY LVL6 CBNW"],

["1052665","GABINETE 1GB-SUNCO LAMIN GALV CAL18"],
["1052372","GABINETE EIA-310D IP20 10UR 600X600X478"],
["1052374","GABINETE EIA-310D IP50 9UR 600X400X492"],
["1052668","GABINETE LAM COLD ROLLED1.20 SIS ANTVAND"],
["1052376","GABINETE LAMINA 3DIV VENT/SIST ANTIVAND"],

["4062821","IDU C050900A131A EPMP 2000 5GHZ ROW CBNW"],

["4060279","INVERSOR PHOENIX 250VA NEMA 5-15R VCTR"],
["4059965","INVERSOR PST-600-48 MODULO SOLAR SAMLX"],
["4059955","INVERSOR REIP2000-41-PLUS SOLAR EPVR"],
["4060276","INVERSOR TECA LITIO IIP-241000BFL INTI"],
["4060056","INVERSOR VOLTJE -48 VDC 120V AC 15W CBNW"],

["1052447","JUMPER EPMP-JUMPER 15\" RG58 CBNW"],

["1052666","KIT CABLE CONECT PROTECC MULTICONTACT"],
["1052378","KIT CABLE CONECT PROTECC SOLUCION SOLAR"],
["1052442","KIT MONTAJE MX-EXTXHALFA-0 19\" CBNW"],
["1052377","KIT PANEL SOLARX4 FOTOVOLTAICO 380W SRPH"],

["1052664","MASTIL 2MT-SUNCO TUBO 4\" PANEL SOLAR"],
["1052667","MASTIL 3MT NACIONAL"],

["4061856","MODEM MDM2510 IP SAT KA STARONE NWTC"],
["4061096","MODEM SATELITAL HT2010 BANDA KA HUGH"],
["4061097","MODEM SATELITAL HT2300 BANDA KU HUGH"],

["4059960","MODULO 060-81110M MONIT STACK SNMP UNPW"],
["4020624","MODULO 3HE00868CBAA01 SFP BX10-D ALCA OPTICO"],
["4059957","MODULO MONIT MODBUS TCP IP CONTROL SOLAR"],
["4059958","MODULO PSC3-5/1000PV-2 DPST1+2 1000W CPT"],
["4060282","MODULO VENUS GX MONITOR CONTROL VCTR"],

["4060055","ODU 050910C121A FORCE 300-CSM CBNW"],
["4061095","ODU BUC JUPITER-HB220 BANDA KA HUGH"],
["4060354","ODU C050900C161A 200AR5-25 ROW CBNW"],
["4060054","ODU C050900C905A FORCE 300-19R CBNW"],
["4060351","ODU C050910A101A EPMP 3000 5GHZ ROW CNBW"],
["4060052","ODU C050910A121A EPMP 3000L CBNW"],
["4061098","ODU NJT8306 BUC 6W OUTDOOR UNIT BAND KU"],

["4060274","PANEL SOLAR CHEETAH KIT HC 72M 405W JNKO"],
["4059954","PANEL SOLAR JKM405M-72H FOTOVOL400W JINK"],
["4060275","PANEL SOLAR Q.PEAK KIT DUO 425W QCEL"],
["4060270","PANEL SOLAR ZXM6-NH144 440WP ZNSH"],

["1020234","PATCHCORD SIMPLEX MONO LC/PC-SC/PC 10M"],

["4059962","PDU 160-170TVS SUP TRANSIENTE UC=175V GP"],
["4060283","PDU DPS FSP-D40 MINI BREAK MDW-C16 FEEO"],
["4059953","PDU PSC3-5/1000PV T2+3 IR CPT"],

["1055527","PEDESTAL SB-11 ANT KA/KU 1.0-1.2M NWTC"],

["1052373","POSTE 3MTS SOPORTE PANEL SOLAR 400W"],

["1052448","PROTECT C000000L065A SURGE GIGA 30V CBNW"],

["1052375","RACK METALICO 9U UPS BATERIAS 3RU"],

["4059966","ROUTER RB960PGS 800MHZ CPU128MB RAM MKTK"],

["1053085","SEÑALETICA EXTERNA 10K PEDESTAL 50X50CM"],
["1053086","SEÑALETICA INTERNA 10K PLACA 50X70CM"],

["3038193","SERV COSTOS IND PROGRAM SISTEMAS SOLAR"],

["4055782","SFP - GIGE BASE-T RJ45 R6/6 DDM -40/85C"],

["4060051","SWITCH MX-EX1010XXA-0 EMPRESARIAL CBNW"],
["4060057","SWITCH MXTX2020GXPA10 ETH POE CBNW"],

["4061855","TRANSCEIVER TRX012X BUC3WKA STARONE NWTC"],
["4022383","TRANSCEIVER USFP-GB/SS134-D-L RACM OPTICO DEMARCADOR"],
["4019957","TRANSFDOR AISLAMIENTO IO P/UPS PRESTIGE"],

["4059959","UPS 010-150120 ONLINE 360VA/360W UNPW"],
["4059979","UPS 9PX1500RT 1500VA/1350W 120VAC EATON"],
["4060387","UPS GTX5-1500 ON-LINE 2KVA 150W VRTV"],
["4060272","UPS RS2KL-LI 2KVA 150W DC=48VDC UPSN"],
["4059951","UPS YDC9602S-RT 2000VA/1800W K-STAR"],
["1064941","SEÑALETICA EXT 7K PED 50X50CM CERO MARC"],
["4065595","MODEM 616000 SKYEDGE II-C GEM I S2X GLAT"],
["1065252","SEÑALETICA INT 7K PLACA50X70CM CERO MARC"]

]);
    
function makeRow() {
  const tr = document.createElement('tr');

  // ID único para separar grupos de radios por fila
  const rowId = 'r' + Math.random().toString(36).substring(2, 9);

  tr.innerHTML = `
    <td>
      <input list="sap-list" placeholder="Ej: 4059979 · UPS..." class="inp-sap">
    </td>

    <td style="text-align:center; white-space:nowrap;">
  <div style="display:flex; align-items:center; justify-content:flex-start; margin-left:60px; gap:20px;">
    
    <label style="display:flex; align-items:center; gap:6px; font-size:13px;">
  <input type="radio" name="tipo-${rowId}" value="INSTALADO" class="inp-tipo">
  Instalado
</label>

<label style="display:flex; align-items:center; gap:6px; font-size:13px;">
  <input type="radio" name="tipo-${rowId}" value="RETIRADO" class="inp-tipo">
  Retirado
</label>

  </div>
</td>

    <td style="text-align:center;">
  <div style="display:flex; justify-content:center; width:100%;">
    <input type="text" placeholder="Escribe el serial"
           class="inp-serial"
           required
           style="width:190px; margin-left:100px;">
  </div>
</td>


    <td>
      <button class="btn secondary btn-del"
        title="Eliminar fila"
        style="padding:4px 10px; font-size:12px; border-radius:6px;">
  Eliminar
</button>
    </td>
  `;

  // Autocompletar SAP
  const sapInput = tr.querySelector('.inp-sap');
  sapInput.addEventListener('change', () => {
    const v = sapInput.value.trim();
    if (v.includes('·')) return;
    const desc = sapMap.get(v);
    if (desc) sapInput.value = `${v} · ${desc}`;
  });

  // Eliminar fila
  tr.querySelector('.btn-del').addEventListener('click', () => tr.remove());

  return tr;
}

    addRowBtn.addEventListener('click', () => tbody.appendChild(makeRow()));
    tbody.appendChild(makeRow()); // fila inicial

    // ===============
    // Photo cells UX
    // ===============
    function mountPhotoCells(){
      document.querySelectorAll('.photo-cell').forEach(cell=>{
        const input = cell.querySelector('input[type="file"]');
        const placeholder = cell.querySelector('.placeholder');

        cell.ensureToolbar = () => {
          if (cell.querySelector('.photo-toolbar')) return;
          const tb = document.createElement('div');
          tb.className = 'photo-toolbar';
          tb.innerHTML = `
  <div class="chip" data-act="view" title="Ver">👁</div>
  <div class="chip" data-act="change" title="Cambiar">✏️</div>
  <div class="chip" data-act="remove" title="Quitar">🗑️</div>
`;
          cell.appendChild(tb);
          tb.addEventListener('click',(e)=>{
            const act = e.target.closest('.chip')?.dataset.act;
            if (!act) return;
            if (act==='change') input.click();
            if (act==='view'){
  const img = cell.querySelector('img');
  if (!img) return;

  const viewer = document.createElement('div');
  viewer.className = 'photo-viewer';

  viewer.innerHTML = `
  <button class="photo-viewer-close">×</button>
  <img src="${img.src}" alt="Imagen">
`;

  viewer.addEventListener('click',(e)=>{
    if(
      e.target === viewer ||
      e.target.classList.contains('photo-viewer-close')
    ){
      viewer.remove();
    }
  });

  document.body.appendChild(viewer);
}
           if (act==='remove'){
  const img = cell.querySelector('img'); if (img) img.remove();
  cell.classList.remove('has-image');
  placeholder.style.display='';
  input.value = '';

  // 🔥 ESTA LÍNEA ARREGLA TODO
  dbSavePhoto(input.id, null);
}
          });
        };

        cell.addEventListener('click',(e)=>{
          if (e.target.closest('.chip')) return;
          input.click();
        });

        input.addEventListener('change', () => {

  // Crear array interno donde se guardarán las fotos reales
  if (!cell._files) cell._files = [];

  // Si no hay archivos seleccionados, no hacer nada
  if (!input.files || input.files.length === 0) return;

  // Si el input permite múltiples imágenes
  if (input.hasAttribute("multiple")) {

    // Ocultar placeholder
    placeholder.style.display = 'none';
    cell.classList.add('has-image');

    // Buscar o crear galería de miniaturas
    let gallery = cell.querySelector('.multi-gallery');
    if (!gallery) {
      gallery = document.createElement('div');
      gallery.className = 'multi-gallery';
      gallery.style.display = 'flex';
      gallery.style.gap = '6px';
      gallery.style.flexWrap = 'wrap';
      gallery.style.justifyContent = 'center';
      cell.appendChild(gallery);
    }

    // Recorrer todas las fotos seleccionadas
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      const url = URL.createObjectURL(file);

      // ✅ AGREGAR el archivo real al array interno
      cell._files.push(file);

      // Crear miniatura visual
      const wrap = document.createElement('div');
      wrap.style.position = 'relative';
      wrap.style.width = '100px';
      wrap.style.height = '100px';

      const img = document.createElement('img');
      img.src = url;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '6px';

      // Botón de borrar
      const del = document.createElement('div');
      del.textContent = '×';
      del.style.position = 'absolute';
      del.style.top = '-6px';
      del.style.right = '-6px';
      del.style.width = '18px';
      del.style.height = '18px';
      del.style.borderRadius = '50%';
      del.style.background = 'rgba(0,0,0,0.7)';
      del.style.color = 'white';
      del.style.display = 'flex';
      del.style.alignItems = 'center';
      del.style.justifyContent = 'center';
      del.style.cursor = 'pointer';
      del.style.fontSize = '12px';

      // ✅ borrar del array interno también
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        wrap.remove();

        const index = cell._files.indexOf(file);
        if (index !== -1) cell._files.splice(index, 1);
        dbSavePhoto(input.id, null);

        
        if (gallery.children.length === 0) {
          cell.classList.remove('has-image');
          placeholder.style.display = '';
        }
      });

      wrap.appendChild(img);
      wrap.appendChild(del);
      gallery.appendChild(wrap);
    }

    cell.ensureToolbar();

    return;
  }

  // Caso de una sola foto
  const file = input.files[0];
  const url = URL.createObjectURL(file);
  cell._files = [file];

  let img = cell.querySelector('img');
  if (!img) { img = document.createElement('img'); cell.appendChild(img); }
  img.src = url;
  cell.classList.add('has-image');
  placeholder.style.display = 'none';
  cell.ensureToolbar();

});

      });
    }
    mountPhotoCells();

    // ===================
    // Exportar vía FLOW
    // ===================
    const statusEl = document.getElementById('status');
    const exportBtn = document.getElementById('exportBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn'); 
    const resetWorkBtn = document.getElementById("resetWorkBtn");

// === BORRAR TODAS LAS FOTOS DE INDEXEDDB ===
function clearAllPhotos() {
    if (!mciDB) return;

    const tx = mciDB.transaction("photos", "readwrite");
    const store = tx.objectStore("photos");

    const reqClear = store.clear();

    reqClear.onsuccess = () => {
        console.log("🗑️ Todas las fotos borradas de IndexedDB");
    };

    reqClear.onerror = (e) => {
        console.error("Error borrando fotos en IndexedDB:", e);
    };
}

if (resetWorkBtn) {
  resetWorkBtn.addEventListener("click", () => {

    if (!confirm("¿Seguro que deseas reiniciar todo el trabajo? Esto borrará el borrador y limpiará todos los campos y fotos.")) {
      return;
    }

    // 1. Borrar borrador
    clearDraft();
clearAllPhotos();

    // 2. Limpiar inputs (menos archivos)
    document.querySelectorAll("input:not([type='file']), textarea, select").forEach(el => {
      if (el.id) el.value = "";
    });

    // 3. Limpiar tabla de equipos
    const tbodyEquipos = document.getElementById("tbody-equipos");
    if (tbodyEquipos) {
      tbodyEquipos.innerHTML = "";
      tbodyEquipos.appendChild(makeRow()); // dejar 1 fila nueva
    }

    // 4. BORRAR TODAS LAS FOTOS DEL FORMULARIO
    document.querySelectorAll('.photo-cell').forEach(cell => {
      const input = cell.querySelector('input[type="file"]');
      const img = cell.querySelector('img');
      const placeholder = cell.querySelector('.placeholder');

      // Remover imagen si existe
      if (img) img.remove();

      // Limpiar input file
      if (input) input.value = "";

      // Quitar clases visuales
      cell.classList.remove('has-image');

      // Restaurar placeholder
      if (placeholder) placeholder.style.display = '';
    });

    // Borrar también cualquier toolbar que haya quedado
    document.querySelectorAll('.photo-toolbar').forEach(tb => tb.remove());

    // 5. Mensaje visual
    setStatus("Trabajo reiniciado ✔", "ok");

    alert("Trabajo reiniciado. Todo quedó limpio y listo para iniciar un nuevo MCI.");
  });
}


// ===============================
//  MÓDULO GUARDAR BORRADOR MCI
// ===============================

const DRAFT_KEY = "MCI_DRAFT_v1";

// --- GUARDAR BORRADOR ---
function saveDraft() {

  // Objeto donde guardaremos todos los campos del formulario
  const data = {};

  // 1. Guardar TODOS los inputs que no son file (texto, selects, textarea)
  const campos = document.querySelectorAll("input:not([type='file']), textarea, select");
  campos.forEach(el => {
    if (el.id) {
      data[el.id] = el.value ?? "";
    }
  });

  // 2. Guardar tabla de equipos
  const eqRows = Array.from(document.querySelectorAll("#tbody-equipos tr"));
  const equipos = [];

  eqRows.forEach(row => {
    const sap = row.querySelector(".inp-sap")?.value ?? "";
    const tipo = row.querySelector(".inp-tipo:checked")?.value ?? "";
    const serial = row.querySelector(".inp-serial")?.value ?? "";

    if (sap.trim() !== "" || serial.trim() !== "") {
      equipos.push({ sap, tipo, serial });
    }
  });

  data.filasEquipos = equipos;

  // ✅ Guardar en LocalStorage (respaldo)
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));

  // ✅ Guardar también en IndexedDB
  dbSaveDraft(data);

  }

// --- RESTAURAR BORRADOR ---
function restoreDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);

    Object.keys(data).forEach(key => {
      if (key === "filasEquipos") return;
      const el = document.getElementById(key);
      if (el) el.value = data[key];
    });

    if (Array.isArray(data.filasEquipos)) {
      const tbody = document.getElementById("tbody-equipos");
      tbody.innerHTML = "";

      data.filasEquipos.forEach(item => {
        const tr = makeRow();
        tr.querySelector(".inp-sap").value = item.sap ?? "";
        tr.querySelector(".inp-serial").value = item.serial ?? "";

        const tipoInst = tr.querySelector("input[value='INSTALADO']");
        const tipoRet = tr.querySelector("input[value='RETIRADO']");

        if (item.tipo === "INSTALADO" && tipoInst) tipoInst.checked = true;
        if (item.tipo === "RETIRADO" && tipoRet) tipoRet.checked = true;

        tbody.appendChild(tr);
      });
    }

  } catch (e) {
    console.error("Error restaurando borrador:", e);
  }
}

// --- BORRAR BORRADOR ---
function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

// --- ACTIVAR BOTÓN ---
if (saveDraftBtn) {
  saveDraftBtn.disabled = false;
  saveDraftBtn.addEventListener("click", saveDraft);
}

// --- RESTAURAR AUTOMÁTICO AL INICIAR ---
restoreDraft();

// ===============================
// UTILIDADES DE IMÁGENES (RESTAURADAS)
// ===============================

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result || '');
    fr.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    fr.readAsDataURL(file);
  });
}

function downscaleDataUrl(dataUrl) {
  return new Promise((resolve) => {
    try {

      const img = new Image();

      img.onload = () => {

        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        const MAX_SIZE = 1600;

        const scale = Math.min(
          1,
          MAX_SIZE / Math.max(width, height)
        );

        width = Math.round(width * scale);
        height = Math.round(height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;

        let result = canvas.toDataURL(
          "image/jpeg",
          quality
        );

        const MAX_BASE64_SIZE = 500000;

        while (
          result.length > MAX_BASE64_SIZE &&
          quality > 0.75
        ) {

          quality -= 0.02;

          result = canvas.toDataURL(
            "image/jpeg",
            quality
          );
        }

        resolve(result);

      };

      img.onerror = () => resolve(dataUrl);

      img.src = dataUrl;

    } catch {

      resolve(dataUrl);

    }
  });
}

      // ⚙️ URL del Flow (generar Excel)
const FLOW_URL = "https://defaulte4e1bc33e2834312bb3789010224b7.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/dc99f30c70a64d57b309dce1c13d1290/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=NMxJMh4pAr98EPpIwDJGzHb5_glsVkAv-A1TVjR9zsA";

// ⚙️ URL del Flow (descargar)
const FLOW_DESCARGAR_URL = "https://defaulte4e1bc33e2834312bb3789010224b7.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bd9e2227be594ecdb47c0da4a898d474/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=j3SlbYcxilxwhnHJfL95lpTA-Y2RzAtiNrmug_D01eQ";

// ⚙️ URL del Flow (subsanar)
const FLOW_SUBSANAR_URL = "https://defaulte4e1bc33e2834312bb3789010224b7.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/960b8aa1c42041f39ca6f35251743971/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=snFK5pRBTUxuOzLIhGdl2Py32qlyPAI_up7Ob_vTKAs";

// ✅ CONTROL DE A DÓNDE SE ENVÍA (CLAVE)
let currentFlowUrl = FLOW_URL;
      
// ✅ Endpoint Cloudflare KV
const KV_URL = "https://cloudflare-index.modulo-de-exclusiones.workers.dev/registrar";

const setWorking = (on, text) => {
  exportBtn.disabled = on;
  exportBtn.textContent = on ? (text || 'Generando…') : '📤 Generar informe';
};

const setStatus = (msg, kind = '') => {
  statusEl.textContent = msg || '';
  statusEl.className = 'status ' + (kind || '');
};

function toDDMMYYYY(dateInput) {
  if (!dateInput) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [yyyy, mm, dd] = dateInput.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }
  try {
    const d = new Date(dateInput + 'T12:00');
    if (Number.isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return '';
  }
}

// ✅ registrarEnKV — CON SOPORTE SUBSANADO
async function registrarEnKV({
  mciId,
  tecnico,
  fileName,
  fileIdentifierExcel,
  jsonFileId
}) {
  try {

    // 🔥 Detectar modo subsanar
    const modoSubsanar = localStorage.getItem("modoSubsanar") === "true";

    const estadoFinal = modoSubsanar
      ? "subsanado"
      : "pendiente";

    const payload = {
      mciId,
      tecnico,
      estado: estadoFinal, // ✅ estado dinámico
      fileName,
      fileIdentifierExcel,
      jsonFileId
    };

    const resp = await fetch(KV_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      console.error("❌ Error KV:", resp.status);
      return false;
    }

    // 🔥 ✅ LIMPIAR MODO SUBSANAR SOLO SI ERA SUBSANACIÓN
    if (modoSubsanar) {
      localStorage.removeItem("modoSubsanar");
      localStorage.removeItem("mciSubsanar");
    }

    return true;

  } catch (err) {
    console.error("❌ Error KV:", err);
    return false;
  }
}
    
    
    // ✅ Obtiene foto desde input file o desde IndexedDB si fue restaurada
async function getFoto(id) {
  const input = document.getElementById(id);

  // ✅ 1. Si hay archivo en el input (caso ideal)
  if (input && input.files && input.files[0]) {
    const raw = await fileToDataURL(input.files[0]);
    return await downscaleDataUrl(raw);
  }

  // ✅ 2. FALLBACK → buscar en IndexedDB (ESTO ES LA SOLUCIÓN)
  return new Promise(resolve => {
    cargarFotoOffline(id, async base64 => {
      if (!base64) return resolve(null);
      const scaled = await downscaleDataUrl(base64);
      resolve(scaled);
    });
  });
}


    // === SAP ANTES: descripción al vuelo (Excel obtiene la final por BUSCARV)
    function describeSap(code) {
      if (!code) return '';
      const clean = String(code).split('·')[0].trim();
      return sapMap.get(clean) || '';
    }

    function wireSapAntes() {
      for (let i = 1; i <= 6; i++) {
        const inp = document.getElementById(`inp-sap-antes-${i}`);
        const out = document.getElementById(`desc-sap-antes-${i}`);
        if (!inp || !out) continue;

        inp.addEventListener('change', () => {
          const v = inp.value.trim();
          const desc = describeSap(v);
          if (desc && !v.includes('·')) {
            inp.value = `${v} · ${desc}`;
          }
          out.textContent = desc ? `Desc: ${desc}` : '';
        });
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wireSapAntes);
    } else {
      wireSapAntes();
    }

// ===============================
// ✅ NUEVA FUNCIÓN GLOBAL
// ===============================
async function verificarEstadoPorTecnico() {
    try {
        const tecnico = localStorage.getItem("tecnicoActual");
        if (!tecnico) {
            window.__informeAprobado = false;
            return null;
        }

        const resp = await fetch(
            `https://cloudflare-index.modulo-de-exclusiones.workers.dev/consultar/${tecnico}`
        );

        const lista = await resp.json();

        const aprobado = lista.find(r => r.estado === "aprobado");

        if (aprobado) {
            window.__informeAprobado = true;
            return aprobado;
        } else {
            window.__informeAprobado = false;
            return null;
        }

    } catch (e) {
        console.error("❌ Error consultando KV:", e);
        window.__informeAprobado = false;
        return null;
    }
}

   
async function exportarMCI(){
// ✅ 1. Validar login primero
  if (!tecnicoActual) {
    alert("Debes iniciar sesión para poder exportar el MCI.");
    return;
  }
  // ✅ 2. Validar firma
  const firma = await getFoto("img-firma-tec");

  if (!firma) {
    alert("Debes subir la firma antes de continuar");
    return;
  }
    // 1) Mínimos requeridos
    const numeroCaso = document.getElementById('inp-numero-caso').value.trim();
    const fechaISO = document.getElementById('inp-fecha').value;
    const fecha = toDDMMYYYY(fechaISO);

    if (!numeroCaso){ setStatus('Ingresa el N° de caso.', 'err'); return; }
    if (!fecha){ setStatus('Selecciona una fecha válida.', 'err'); return; }

    const idBen = document.getElementById('inp-idben').value.trim();
    if (!idBen){ setStatus('Ingresa el ID beneficiario.', 'err'); return; }

    // === SAP ANTES ===
    const sapAntes1 = (document.getElementById('inp-sap-antes-1')?.value ?? '').trim();
    const sapAntes2 = (document.getElementById('inp-sap-antes-2')?.value ?? '').trim();
    const sapAntes3 = (document.getElementById('inp-sap-antes-3')?.value ?? '').trim();
    const sapAntes4 = (document.getElementById('inp-sap-antes-4')?.value ?? '').trim();
    const sapAntes5 = (document.getElementById('inp-sap-antes-5')?.value ?? '').trim();
    const sapAntes6 = (document.getElementById('inp-sap-antes-6')?.value ?? '').trim();

    // === ANTES SERIAL (6) ===
    const fotoAntesSerial1 = await getFoto('img-antes-serial-1');
    const fotoAntesSerial2 = await getFoto('img-antes-serial-2');
    const fotoAntesSerial3 = await getFoto('img-antes-serial-3');
    const fotoAntesSerial4 = await getFoto('img-antes-serial-4');
    const fotoAntesSerial5 = await getFoto('img-antes-serial-5');
    const fotoAntesSerial6 = await getFoto('img-antes-serial-6');

    // === ANTES DIAGNÓSTICO (12) ===
    const fotoAntesDiag1  = await getFoto('img-antes-diag-1');
    const fotoAntesDiag2  = await getFoto('img-antes-diag-2');
    const fotoAntesDiag3  = await getFoto('img-antes-diag-3');
    const fotoAntesDiag4  = await getFoto('img-antes-diag-4');
    const fotoAntesDiag5  = await getFoto('img-antes-diag-5');
    const fotoAntesDiag6  = await getFoto('img-antes-diag-6');
    const fotoAntesDiag7  = await getFoto('img-antes-diag-7');
    const fotoAntesDiag8  = await getFoto('img-antes-diag-8');
    const fotoAntesDiag9  = await getFoto('img-antes-diag-9');
    const fotoAntesDiag10 = await getFoto('img-antes-diag-10');
    const fotoAntesDiag11 = await getFoto('img-antes-diag-11');
    const fotoAntesDiag12 = await getFoto('img-antes-diag-12');

    // === DESPUÉS SERIAL (6) ===
    const fotoDespuesSerial1 = await getFoto('img-despues-serial-1');
    const fotoDespuesSerial2 = await getFoto('img-despues-serial-2');
    const fotoDespuesSerial3 = await getFoto('img-despues-serial-3');
    const fotoDespuesSerial4 = await getFoto('img-despues-serial-4');
    const fotoDespuesSerial5 = await getFoto('img-despues-serial-5');
    const fotoDespuesSerial6 = await getFoto('img-despues-serial-6');

    // === DESPUÉS RESULTADO (12) ===
    const fotoDespuesRes1  = await getFoto('img-despues-res-1');
    const fotoDespuesRes2  = await getFoto('img-despues-res-2');
    const fotoDespuesRes3  = await getFoto('img-despues-res-3');
    const fotoDespuesRes4  = await getFoto('img-despues-res-4');
    const fotoDespuesRes5  = await getFoto('img-despues-res-5');
    const fotoDespuesRes6  = await getFoto('img-despues-res-6');
    const fotoDespuesRes7  = await getFoto('img-despues-res-7');
    const fotoDespuesRes8  = await getFoto('img-despues-res-8');
    const fotoDespuesRes9  = await getFoto('img-despues-res-9');
    const fotoDespuesRes10 = await getFoto('img-despues-res-10');
    const fotoDespuesRes11 = await getFoto('img-despues-res-11');
    const fotoDespuesRes12 = await getFoto('img-despues-res-12');

    const fotosDespues = [
        fotoDespuesSerial1, fotoDespuesSerial2, fotoDespuesSerial3,
        fotoDespuesSerial4, fotoDespuesSerial5, fotoDespuesSerial6,
        fotoDespuesRes1, fotoDespuesRes2, fotoDespuesRes3,
        fotoDespuesRes4, fotoDespuesRes5, fotoDespuesRes6,
        fotoDespuesRes7, fotoDespuesRes8, fotoDespuesRes9,
        fotoDespuesRes10, fotoDespuesRes11, fotoDespuesRes12
    ];

    // === Observaciones ===
    const antesObs   = (document.getElementById('inp-antes-obs')  ?.value ?? '').trim();
    const despuesObs = (document.getElementById('inp-despues-obs')?.value ?? '').trim();

    // === Coordenadas ===
    const latitud  = (document.getElementById('inp-lat')?.value ?? '').trim();
    const longitud = (document.getElementById('inp-lon')?.value ?? '').trim();

    // === Declaración: acompañante ===
    const acompNombre = (document.getElementById('inp-acomp-nombre')?.value ?? '').trim();
    const acompCargo  = (document.getElementById('inp-acomp-cargo') ?.value ?? '').trim();
    const acompCedula = (document.getElementById('inp-acomp-cedula')?.value ?? '').trim();
    const acompTel1   = (document.getElementById('inp-acomp-tel1')  ?.value ?? '').trim();
    const acompTel2   = (document.getElementById('inp-acomp-tel2')  ?.value ?? '').trim();
    const acompCorreo = (document.getElementById('inp-acomp-correo')?.value ?? '').trim();

    // === Declaración: técnico ===
    const tecNombre = (document.getElementById('inp-tec-nombre')?.value ?? '').trim();
    const tecCargo  = (document.getElementById('inp-tec-cargo') ?.value ?? '').trim();
    const tecCedula = (document.getElementById('inp-tec-cedula')?.value ?? '').trim();
    const tecTel    = (document.getElementById('inp-tec-tel')   ?.value ?? '').trim();
    const tecCorreo = (document.getElementById('inp-tec-correo')?.value ?? '').trim();

    // === Firma tecnico ===
    let firmaActaDataUrl = firma;

    // === Datos ACTA ===
    const departamento = (document.getElementById('inp-departamento')?.value ?? '').trim();
    const municipio    = (document.getElementById('inp-municipio')?.value ?? '').trim();
    const centroPoblado= (document.getElementById('inp-centro-poblado')?.value ?? '').trim();
    const sede         = (document.getElementById('inp-sede')?.value ?? '').trim();
    const correo       = (document.getElementById('inp-correo')?.value ?? '').trim();
    const responsableNombre = (document.getElementById('inp-responsable')?.value ?? '').trim();
    const cedula       = (document.getElementById('inp-cedula')?.value ?? '').trim();
    const contacto     = (document.getElementById('inp-contacto')?.value ?? '').trim();

    const descripcion = (document.getElementById('inp-descripcion')?.value ?? '');

    // === Equipos tabla ===
    const filasEquipos = [];
    document.querySelectorAll('#tbody-equipos tr').forEach(tr => {
        const sapRaw = tr.querySelector('.inp-sap')?.value?.trim() ?? '';
        if (!sapRaw) return;

        const sap = sapRaw.includes('·') ? sapRaw.split('·')[0].trim() : sapRaw;

        const tipoInput = tr.querySelector('input.inp-tipo:checked');
        const tipo = tipoInput ? tipoInput.value : '';

        const serial = tr.querySelector('.inp-serial')?.value?.trim() ?? '';
        if (!tipo || !serial) return;

        filasEquipos.push({
            sap,
            descripcion: sapMap.get(sap) ?? '',
            tipo,
            serial
        });
    });

    // === PRUEBAS ===
    const imgsJson = {
        gps        : await getFoto('img-gps-geo'),
        apInt      : await getFoto('img-ap-int'),
        apExt1     : await getFoto('img-ap-ext1'),
        apExt2     : await getFoto('img-ap-ext2'),
        pcInt      : await getFoto('img-pc-int'),
        movilExt   : await getFoto('img-movil-ext'),
        senalExt   : await getFoto('img-senal-ext'),
        senalInt   : await getFoto('img-senal-int'),
        respaldo   : await getFoto('img-respaldo'),
        printUps   : await getFoto('img-print-ups'),
        med1       : await getFoto('img-med1'),med1: [
  (await getFoto('img-med1-0')) || "",
  (await getFoto('img-med1-1')) || ""
],

        med2       : await getFoto('img-med2'),

        navIndoor: [
  (await getFoto('img-nav-indoor-0')) || "",
  (await getFoto('img-nav-indoor-1')) || "",
  (await getFoto('img-nav-indoor-2')) || ""
],

        navOutdoor: [
  (await getFoto('img-nav-outdoor-0')) || "",
  (await getFoto('img-nav-outdoor-1')) || "",
  (await getFoto('img-nav-outdoor-2')) || ""
],

        speedtest  : (await getFoto('img-speedtest')) || "",
portal     : (await getFoto('img-portal')) || "",
block1     : (await getFoto('img-block1')) || "",
block2     : (await getFoto('img-block2')) || "",

        despues    : fotosDespues
    };

    const pruebasObs = (document.getElementById('inp-pruebas-obs')?.value ?? '');

    // === PAYLOAD FINAL ===
    const payloadJson = {
        numeroCaso, fecha, idBen, insertImages: false,

        departamento, municipio, centroPoblado, sede,
        correo, responsableNombre, cedula, contacto,

        descripcion,

        acompNombre, acompCargo, acompCedula, acompTel1, acompTel2, acompCorreo,
        tecNombre, tecCargo, tecCedula, tecTel, tecCorreo,

        firmaActaDataUrl,

        filasEquipos,

        imgs: imgsJson,

        pruebasObs,
        latitud, longitud,

        sapAntes1, sapAntes2, sapAntes3, sapAntes4, sapAntes5, sapAntes6,

        fotoAntesSerial1, fotoAntesSerial2, fotoAntesSerial3,
        fotoAntesSerial4, fotoAntesSerial5, fotoAntesSerial6,

        fotoAntesDiag1, fotoAntesDiag2, fotoAntesDiag3,
        fotoAntesDiag4, fotoAntesDiag5, fotoAntesDiag6,
        fotoAntesDiag7, fotoAntesDiag8, fotoAntesDiag9,
        fotoAntesDiag10, fotoAntesDiag11, fotoAntesDiag12,

        antesObs,
        despuesObs
    };

    try{
        setStatus('Enviando al Flow…');
        setWorking(true, 'Enviando…');

      console.log("MED1", imgsJson.med1);
console.log("NAVINDOOR", imgsJson.navIndoor);
console.log("NAVOUTDOOR", imgsJson.navOutdoor);
console.log("SPEEDTEST", imgsJson.speedtest);
console.log("PORTAL", imgsJson.portal);

        const resp = await fetch(currentFlowUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    mciId: numeroCaso,
    tecnico: tecnicoActual,
    payloadJson: payloadJson,
    imgsJson: imgsJson
  })
});

if (!resp.ok) {
  throw new Error(`Error HTTP ${resp.status} al generar el informe`);
}

if (currentFlowUrl === FLOW_SUBSANAR_URL) await fetch(`https://cloudflare-index.modulo-de-exclusiones.workers.dev/subsanar/${numeroCaso}`, { method: "PUT" });      
      
setStatus("✅ Informe enviado para revisión del auditor", "ok");
alert("El informe fue enviado correctamente. El auditor lo revisará y aprobará.");
    }catch(err){

    console.error(err);

    if (
        err.message &&
        err.message.toLowerCase().includes("failed to fetch")
    ) {

        setStatus('Error de conexión', 'err');

        alert(
            "No fue posible enviar el informe debido a una falla de conexión.\n\n" +
            "Verifique que dispone de acceso estable a Internet y vuelva a intentarlo.\n\n" +
            "Si se encuentra en un sitio con conectividad satelital, espere unos minutos y realice un nuevo intento."
        );

    } else {

        setStatus('Error al generar: ' + err.message, 'err');

        alert(
            'No se pudo generar el informe: ' +
            err.message
        );

    }

}finally{
        setWorking(false);
        clearDraft();
    }

   
    //-----------------------------------------------------------

}  // ✅ ← CIERRA exportarMCI()

// === PASO 7: Propagar títulos de <label> a data-title en cada tarjeta de PRUEBAS ===
// Ubicación recomendada: justo ANTES de document.getElementById('exportBtn')...
(function syncPruebasTitles() {
  try {
    // Selecciona las tarjetas (p-item) dentro del contenedor de las 6 primeras
    const items = document.querySelectorAll('#sec-pruebas .pruebas-2col > .p-item');

    items.forEach(item => {
      // La tarjeta de coordenadas (.p-geo) ya tiene su propio encabezado
      if (item.classList.contains('p-geo')) return;

      // Toma el <label> directo de la tarjeta como fuente del título
      const lbl = item.querySelector(':scope > label');
      if (!lbl) return;

      const title = (lbl.textContent || '').trim();
      if (title) {
        item.setAttribute('data-title', title);
        // Si quieres, puedes ocultar el label aquí (opcional, el CSS del paso 8 lo hará bonito igual)
        // lbl.style.display = 'none';
      }
    });
  } catch (e) {
    console.warn('syncPruebasTitles: no se pudo propagar títulos', e);
  }
})();

// === PASO 9: Marcar y titular TODAS las tarjetas de PRUEBAS fuera de .pruebas-2col ===
// Detecta columnas .col-4 que tengan un .photo-grid (Señalética, Respaldo, Print, Medición, Navegación, Portal, Bloqueos…)
// Toma su <label> (si existe) como título y lo pasa a data-title del contenedor.
// Añade clase .p-card para aplicar el encabezado Excel por CSS.
(function markAllPruebasCards() {
  try {
    // 1) Dentro de #sec-pruebas, busca columnas "sueltas" (no las 6 primeras .p-item) que contengan .photo-grid
    const cols = document.querySelectorAll('#sec-pruebas .card .grid > .col-4');

    cols.forEach(col => {
      // Saltar si esta columna forma parte de las primeras 6 tarjetas (ya estilizadas) => esas están dentro de .pruebas-2col
      if (col.closest('.pruebas-2col')) return;

      // Debe haber un .photo-grid dentro de la columna
      const pg = col.querySelector(':scope > .photo-grid');
      if (!pg) return;

      // Título: el label suele estar en un wrapper .field inmediatamente antes del photo-grid
      // Estructura que tienes: <div class="field"><label>...</label></div><div class="photo-grid">...</div>
      const field = col.querySelector(':scope > .field');
      const label = field?.querySelector('label');

      // Titular y marcar como tarjeta
      const title = (label?.textContent || '').trim();
      if (title) {
        col.setAttribute('data-title', title);
        // Ocultamos el field (solo el de título) para no duplicar texto
        field.style.display = 'none';
      }

      // Marcar esta columna como "p-card" para que el CSS le dibuje encabezado Excel
      col.classList.add('p-card');
    });
  } catch (e) {
    console.warn('markAllPruebasCards: no se pudo marcar tarjetas adicionales de PRUEBAS', e);
  }
})();

// === SAP A2: Copiar el data-title de cada .sap-card al interior de .sap-head (encabezado visible)
(function syncSapCardHeaders() {
  try {
    document.querySelectorAll('#sec-antes .sap-card, #sec-despues .sap-card').forEach(card => {
      const title = card.getAttribute('data-title') || '';
      const head  = card.querySelector('.sap-head');
      if (head && !head.textContent.trim()) {
        head.textContent = title;
      }
    });
  } catch (e) {
    console.warn('syncSapCardHeaders: no se pudieron sincronizar títulos', e);
  }
})();


// === ETIQUETA · ESPEJO (=) de ACTA y PRUEBAS =================================
// Orígenes (ACTA y PRUEBAS)
const srcIdBen = document.getElementById('inp-idben');   // ACTA · ID beneficiario
const srcSede  = document.getElementById('inp-sede');     // ACTA · Sede
const srcFecha = document.getElementById('inp-fecha');    // ACTA · Fecha (type="date", yyyy-mm-dd)
const srcLat   = document.getElementById('inp-lat');      // PRUEBAS · Latitud (barra)
const srcLon   = document.getElementById('inp-lon');      // PRUEBAS · Longitud (barra)

// Destinos (ETIQUETA)
const etqIdBen = document.getElementById('etq-idben');
const etqSede  = document.getElementById('etq-sede');
const etqFecha = document.getElementById('etq-fecha');    // también type="date"
const etqLat   = document.getElementById('etq-lat');
const etqLon   = document.getElementById('etq-lon');

// Sincroniza (como "= en Excel"): copia valores 1:1, sin formateos extra
function syncEtiqueta() {
  if (srcIdBen && etqIdBen) etqIdBen.value = srcIdBen.value ?? '';
  if (srcSede  && etqSede)  etqSede.value  = srcSede.value  ?? '';
  if (srcFecha && etqFecha) etqFecha.value = srcFecha.value ?? ''; // yyyy-mm-dd compatible
  if (srcLat   && etqLat)   etqLat.value   = srcLat.value   ?? '';
  if (srcLon   && etqLon)   etqLon.value   = srcLon.value   ?? '';
}

// Disparar al cargar DOM (por si el usuario ya llenó ACTA antes de visitar ETIQUETA)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncEtiqueta);
} else {
  syncEtiqueta();
}

// Escuchar cambios en vivo en los campos de origen
[srcIdBen, srcSede, srcFecha, srcLat, srcLon].forEach(el => {
  if (!el) return;
  el.addEventListener('input',  syncEtiqueta);
  el.addEventListener('change', syncEtiqueta);
});

// (Opcional) Si quieres que en ETIQUETA no puedan editarse manualmente, descomenta:
// [etqIdBen, etqSede, etqFecha, etqLat, etqLon].forEach(el => { if (el) el.readOnly = true; });


    document.getElementById("exportBtn").addEventListener("click", () => {
  currentFlowUrl = FLOW_URL;
  exportarMCI();
});

document.getElementById("subsanarBtn").addEventListener("click", () => {
  currentFlowUrl = FLOW_SUBSANAR_URL;
  exportarMCI();
});

document.addEventListener("change", async function(e) {
    if (e.target.matches('.photo-cell.indoor-mini input[type="file"]')) {
        const cell = e.target.closest('.photo-cell.indoor-mini');
        const file = e.target.files[0];

        const fixedFile = file;

        if (fixedFile) {
            cell.classList.add("has-image");

            const reader = new FileReader();

            reader.onload = function(ev) {
                let existing = cell.querySelector("img");

                if (existing) existing.remove();

                let img = document.createElement("img");
                img.src = ev.target.result;
                cell.appendChild(img);
            };

            reader.readAsDataURL(fixedFile);
        }
    }
});





/* === AUTOGUARDADO REAL DEL TEXTO CADA 3s === */
setInterval(() => {
    try {
        // Tu función original: guarda en localStorage
        saveDraft();

        // Leemos lo que ella guardó
        const stored = localStorage.getItem("MCI_DRAFT_v1");
        if (stored) {
            const data = JSON.parse(stored);

            // Guardamos en IndexedDB de verdad
            dbSaveDraft(data);
        }
    } catch (e) {
        console.log("⚠️ Error guardando texto offline:", e);
    }
}, 3000);

// === Paso 3: Guardar una foto en IndexedDB (CORREGIDO) ===
function guardarFotoOffline(id, file) {
  if (!mciDB) {
    console.warn("IndexedDB no lista aún");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;

    const tx = mciDB.transaction("photos", "readwrite");
    const store = tx.objectStore("photos");

    store.put({
      id: id,
      blob: base64
    });

    console.log("💾 Foto guardada offline:", id);
  };

  reader.readAsDataURL(file);
}
// === Paso 4: Cargar foto desde IndexedDB y mostrar preview (CORREGIDO) ===
function cargarFotoOffline(id, callback) {
  if (!mciDB) return;

  const tx = mciDB.transaction("photos", "readonly");
  const store = tx.objectStore("photos");
  const req = store.get(id);

  req.onsuccess = function () {
    if (req.result && req.result.blob) {
      callback(req.result.blob);
    } else {
      callback(null);
    }
  };
}
// === Paso 2 + Paso 4: Detectar, guardar y restaurar fotos ===

function conectarInputsDeFoto() {
  photoInputs.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    // --- 1) Restaurar si existe en IndexedDB ---
cargarFotoOffline(id, function(base64) {
  if (base64) {
    const cell = input.closest(".photo-cell");
    if (!cell) return;

    // Ocultar placeholder
    const placeholder = cell.querySelector(".placeholder");
    if (placeholder) placeholder.style.display = "none";

    // Activar estado visual correcto
    cell.classList.add("has-image");

    // Crear o usar <img> existente
    let img = cell.querySelector("img");
    if (!img) {
      img = document.createElement("img");
      cell.appendChild(img);
    }

    // Asignar imagen restaurada
    img.src = base64;

    // ✅ Volver a activar la toolbar
    if (typeof ensureToolbar === "function") {
      ensureToolbar.call(cell);
    } else {
      // fallback: buscar toolbar
      const tb = cell.querySelector('.photo-toolbar');
      if (!tb && cell.ensureToolbar) cell.ensureToolbar();
    }

    console.log("🔄 Foto restaurada:", id);
  }
});

    // --- 2) Guardar cuando el técnico sube la foto ---
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;

      console.log("✅ Foto seleccionada en:", id);

      // Guardar foto offline
      guardarFotoOffline(id, file);

      // Mostrar preview usando tu propio método actual
      const cell = input.closest(".photo-cell");
      if (cell) {
        const placeholder = cell.querySelector(".placeholder");
        if (placeholder) placeholder.style.display = "none";

        let img = cell.querySelector("img");
        if (!img) {
          img = document.createElement("img");
          cell.appendChild(img);
        }
        const reader = new FileReader();

reader.onload = function(e) {
  img.src = e.target.result;
};

reader.readAsDataURL(file);
      }
    });

  });
}




if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("✅ SW registrado"))
    .catch(err => console.log("❌ Error SW:", err));
}
</script>

<script type="module">
import { TECNICOS, PASSWORD_GLOBAL } from "./tecnicos.js";

// ================================
// LOGIN PARA TÉCNICOS (FINAL)
// ================================

// variable global usada por el resto de la app
window.tecnicoActual = localStorage.getItem("tecnicoActual") || null;

// evento del botón Ingresar
document.getElementById("loginBtn").onclick = () => {

  const cedula = loginUser.value.trim();
  const password = loginPass.value.trim();

  const nombreTecnico = TECNICOS[cedula];
  if (!nombreTecnico) {
    alert("Técnico no registrado, por favor contactar a un admin para tu registro y admición");
    return;
  }

  if (password !== PASSWORD_GLOBAL) {
    alert("Contraseña incorrecta");
    return;
  }

  localStorage.setItem("tecnicoActual", nombreTecnico);
  tecnicoActual = nombreTecnico;

  localStorage.setItem("tecnicoSesion", JSON.stringify({
    usuario: nombreTecnico,
    loginTime: Date.now()
  }));

  mostrarApp();
  mostrarMisInformes();
  cargarInformesEnTabla();

  setTimeout(async () => {
    const informe = await verificarEstadoPorTecnico();
    const btn = document.getElementById("downloadBtn");
    if (!btn) return;
  }, 1500);
};
  // ✅ Mostrar listado de informes cuando el técnico ya inició sesión
function mostrarMisInformes() {
  const seccion = document.getElementById("misInformes");
  if (seccion) {
    seccion.style.display = "block";
  }
}

  // ✅ Cargar y renderizar informes del técnico en la tabla
async function cargarInformesEnTabla() {
  const tecnico = localStorage.getItem("tecnicoActual");
  if (!tecnico) return;

  const resp = await fetch(
    "https://cloudflare-index.modulo-de-exclusiones.workers.dev/consultar"
  );
  const informes = await resp.json();

  // 🔎 Solo informes del técnico actual
  const propios = informes.filter(i => i.tecnico === tecnico);

  const tbody = document.querySelector("#tablaInformesModal tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  // 📅 Más recientes primero
  propios.sort((a, b) =>
    new Date(b.fechaGenerado) - new Date(a.fechaGenerado)
  );

  for (const inf of propios) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td style="padding:8px;">
        ${new Date(inf.fechaGenerado).toLocaleDateString()}
      </td>
      <td style="padding:8px;">${inf.mciId}</td>
      <td style="padding:8px;">
        ${
  inf.estado === "aprobado"
    ? "✅ Aprobado"
    : inf.estado === "rechazado"
    ? "❌ Rechazado"
    : "⏳ En validación"
}
      </td>
      <td style="padding:8px;">
  ${
    inf.estado === "aprobado"
  ? `<button class="btn btnDescargar" data-mciid="${inf.mciId}">
       📥 Descargar
     </button>`
  : inf.estado === "rechazado"
  ? `<button class="btn btnSubsanar" data-mciid="${inf.mciId}">
     ✏️ Corregir
   </button>`
  : `<button class="btn btnValidacion" disabled>
       ⏳ En validación
     </button>`
  }

</td>
    `;

    tbody.appendChild(tr);
    
    // 🔥 ACTIVAR CORREGIR (CIERRA MODAL + MODO SUBSANAR)
tr.querySelector(".btnSubsanar")?.addEventListener("click", () => {

  const mciId = tr.querySelector(".btnSubsanar").dataset.mciid;

  // guardar modo subsanar
  localStorage.setItem("modoSubsanar", "true");
  localStorage.setItem("mciSubsanar", mciId);

  // cerrar modal
  document.getElementById("misInformesModal").style.display = "none";

  // mostrar botón subsanar del sidebar
  const subsanarBtn = document.getElementById("subsanarBtn");

subsanarBtn.disabled = false;
subsanarBtn.style.opacity = "1";
subsanarBtn.style.cursor = "pointer";

  // bloquear cargar informe
  const exportBtn = document.getElementById("exportBtn");
  exportBtn.disabled = true;
  exportBtn.style.opacity = "0.5";
  exportBtn.style.cursor = "not-allowed";

});
  }
}

  // ✅ Enlazar botones de descarga por fila
function enlazarBotonesDescargaFila() {
  document.querySelectorAll(".btnDescargar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const mciId = btn.dataset.mciid;
      if (!mciId) return;

      // ✅ Reutiliza la descarga existente
      descargarInforme(mciId);
    });
  });
}

function mostrarApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("sidebar").style.display = "flex";
  document.querySelector(".main").style.display = "flex";
}

function ocultarApp() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("sidebar").style.display = "none";
  document.querySelector(".main").style.display = "none";
}
  
  
 // ================================
// MODAL · MIS INFORMES (abrir/cerrar)
// ================================
document.addEventListener("DOMContentLoaded", () => {

  // 🔐 Verificar sesión al cargar la aplicación
const haySesion = verificarSesion();

if (haySesion) {
  mostrarApp();
} else {
  ocultarApp();
}
  const misInformesBtn = document.getElementById("misInformesBtn");
  const misInformesModal = document.getElementById("misInformesModal");
  const cerrarMisInformes = document.getElementById("cerrarMisInformes");

  // Abrir modal
  if (misInformesBtn && misInformesModal) {
    misInformesBtn.addEventListener("click", () => {
  misInformesModal.style.display = "flex";

  // ✅ Cargar informes SOLO cuando se abre el modal
  cargarInformesEnTabla();
});// ================================
// ✅ Botón 🔄 Actualizar informes
// ================================
const refreshBtn = document.getElementById("refreshMisInformes");

if (refreshBtn) {
  refreshBtn.addEventListener("click", async () => {
    refreshBtn.innerHTML = "⏳ Actualizando...";
    refreshBtn.disabled = true;

    try {
      await cargarInformesEnTabla();
    } finally {
      refreshBtn.innerHTML = "🔄 Actualizar";
      refreshBtn.disabled = false;
    }
  });
}

// 🚪 Cerrar sesión manual
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    if (confirm("¿Deseas cerrar la sesión?")) {
      cerrarSesion(false);
    }
  });
}
    
  }

  
  // Cerrar modal con botón
  if (cerrarMisInformes && misInformesModal) {
    cerrarMisInformes.addEventListener("click", () => {
      misInformesModal.style.display = "none";
    });
  }

  // Cerrar modal haciendo clic fuera del contenido
  if (misInformesModal) {
    misInformesModal.addEventListener("click", (e) => {
      if (e.target === misInformesModal) {
        misInformesModal.style.display = "none";
      }
    });
  }

});
  
</script>
<!-- =========================
 MODAL · MIS INFORMES
========================= -->
<div id="misInformesModal" style="
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 5000;
">

  <!-- Contenedor principal -->
  <div style="
    background: white;
    border-radius: 14px;
    width: min(920px, 92%);
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
  ">

    <!-- Header -->
    <div style="
      padding: 14px 18px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
    ">
      <h3 style="margin:0; color:#0b2e59;">
        Mis informes
      </h3>

<button id="refreshMisInformes" class="btn secondary" style="margin-right:8px;">
  🔄 Actualizar
</button>

      <button
        id="cerrarMisInformes"
        class="btn secondary"
        style="padding:6px 12px; font-size:13px;"
      >
        Volver
      </button>
    </div>

    <!-- Cuerpo del modal -->
    <div style="
      padding: 16px;
      overflow: auto;
      flex: 1;
    ">

      <!-- Aquí reutilizamos TU tabla -->
      <table id="tablaInformesModal" class="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>IM/OT</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <!-- Se llena dinámicamente -->
        </tbody>
      </table>

    </div>

  </div>
</div>

  <script>
document.querySelectorAll(".remove-btn").forEach(btn => {
  btn.addEventListener("click", async (e) => {
e.stopPropagation();
    const cell = e.target.closest(".photo-cell");
    if (!cell) return;

    const input = cell.querySelector("input[type='file']");
    if (!input) return;

    const id = input.id;

    // ✅ LIMPIAR INPUT + marcar como borrada
    input.value = "";
    input.dataset.deleted = "true";

    // ✅ BORRAR IMAGEN VISUAL
    const img = cell.querySelector("img");
    if (img) img.remove();

    // ✅ LIMPIAR ESTADO VISUAL
    cell.classList.remove("has-image");

    // ✅ BORRAR DE INDEXEDDB (CLAVE REAL)
    const tx = mciDB.transaction("photos", "readwrite");
    tx.objectStore("photos").delete(id);

  });
});

    document.querySelectorAll(".change-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const cell = e.target.closest(".photo-cell");
    if (!cell) return;

    const input = cell.querySelector("input[type='file']");
    if (!input) return;

    input.click();
  });
});

document.querySelectorAll(".view-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const cell = e.target.closest(".photo-cell");
    if (!cell) return;

    const img = cell.querySelector("img");
    if (!img) return;

    const viewer = document.createElement("div");
    viewer.className = "photo-viewer";

    viewer.innerHTML = `
  <button class="photo-viewer-close">×</button>
  <img src="${img.src}" alt="Imagen">
`;

    viewer.addEventListener("click", (ev) => {
      if (
        ev.target === viewer ||
        ev.target.classList.contains("photo-viewer-close")
      ) {
        viewer.remove();
      }
    });

    document.body.appendChild(viewer);
  });
});

    // 🔥 ESTADO INICIAL (DESHABILITADO)
const subsanarBtn = document.getElementById("subsanarBtn");

if (subsanarBtn) {
  subsanarBtn.disabled = true;
  subsanarBtn.style.opacity = "0.5";
  subsanarBtn.style.cursor = "not-allowed";
}
    
</script>

<script src="./version.js"></script>

<script>
const url = new URL(window.location);

// ✅ versión actual en la URL
const currentVersion = url.searchParams.get("v");

// ✅ solo recarga si la versión realmente cambió
if (currentVersion !== window.APP_VERSION) {
  url.searchParams.set("v", window.APP_VERSION);
  window.location.replace(url.toString());
}
</script>
<script>
document.getElementById("appVersion").textContent = "Versión " + window.APP_VERSION;

