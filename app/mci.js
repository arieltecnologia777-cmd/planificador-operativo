const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// Técnico predeterminado ya que se eliminó el login
window.tecnicoActual = "Técnico General";
localStorage.setItem("tecnicoActual", "Técnico General");

const FLOW_DESCARGAR_MCI = "https://defaulte4e1bc33e2834312bb3789010224b7.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bd9e2227be594ecdb47c0da4a898d474/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=j3SlbYcxilxwhnHJfL95lpTA-Y2RzAtiNrmug_D01eQ";

async function descargarInforme(mciId) {
  if (!mciId) {
    alert("No se encontró el mciId del informe.");
    return;
  }
  try {
    const estado = await fetch(`https://cloudflare-index.modulo-de-exclusiones.workers.dev/estado?mciId=${mciId}`).then(r => r.json());
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
  } catch (err) {
    console.error("❌ Error al descargar:", err);
    alert("Error inesperado en la descarga.");
  }
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btnDescargar");
  if (!btn) return;
  const mciId = btn.dataset.mciid;
  if (!mciId) {
    alert("No se pudo identificar el informe.");
    return;
  }
  const textoOriginal = btn.innerHTML;
  try {
    btn.innerHTML = "⏳ Descargando…";
    btn.disabled = true;
    btn.style.opacity = "0.8";
    btn.style.cursor = "not-allowed";
    await descargarInforme(mciId);
  } catch (err) {
    alert("Ocurrió un error al descargar el informe.");
  } finally {
    btn.innerHTML = textoOriginal;
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  }
});

const photoInputs = [
  "img-firma-tec", "img-gps-geo", "img-ap-int", "img-ap-ext1", "img-ap-ext2", "img-pc-int", "img-movil-ext", "img-senal-ext", "img-senal-int", "img-respaldo", "img-print-ups", "img-med1-0", "img-med1-1", "img-med2", "img-nav-indoor-0", "img-nav-indoor-1", "img-nav-indoor-2", "img-nav-outdoor-0", "img-nav-outdoor-1", "img-nav-outdoor-2", "img-speedtest", "img-portal", "img-block1", "img-block2", "img-antes-serial-1", "img-antes-serial-2", "img-antes-serial-3", "img-antes-serial-4", "img-antes-serial-5", "img-antes-serial-6", "img-antes-diag-1", "img-antes-diag-2", "img-antes-diag-3", "img-antes-diag-4", "img-antes-diag-5", "img-antes-diag-6", "img-antes-diag-7", "img-antes-diag-8", "img-antes-diag-9", "img-antes-diag-10", "img-antes-diag-11", "img-antes-diag-12", "img-despues-serial-1", "img-despues-serial-2", "img-despues-serial-3", "img-despues-serial-4", "img-despues-serial-5", "img-despues-serial-6", "img-despues-res-1", "img-despues-res-2", "img-despues-res-3", "img-despues-res-4", "img-despues-res-5", "img-despues-res-6", "img-despues-res-7", "img-despues-res-8", "img-despues-res-9", "img-despues-res-10", "img-despues-res-11", "img-despues-res-12"
];

let mciDB;
const mciRequest = indexedDB.open("MCI_DB", 1);

mciRequest.onupgradeneeded = (event) => {
    mciDB = event.target.result;
    if (!mciDB.objectStoreNames.contains("draft")) mciDB.createObjectStore("draft", { keyPath: "id" });
    if (!mciDB.objectStoreNames.contains("photos")) mciDB.createObjectStore("photos", { keyPath: "id" });
};

mciRequest.onsuccess = (event) => {
    mciDB = event.target.result;
    dbLoadDraft((draft) => {
        if (draft) {
            try {
                localStorage.setItem("MCI_DRAFT_v1", JSON.stringify(draft));
                restoreDraft();
            } catch (e) {}
        }
    });
    if (typeof conectarInputsDeFoto === "function") {
        conectarInputsDeFoto();
    }
};

function dbSaveDraft(data) {
    const tx = mciDB.transaction("draft", "readwrite");
    tx.objectStore("draft").put({ id: 1, data });
}

function dbLoadDraft(callback) {
    const tx = mciDB.transaction("draft", "readonly");
    const req = tx.objectStore("draft").get(1);
    req.onsuccess = () => { callback(req.result ? req.result.data : null); };
}

function dbSavePhoto(key, blob) {
    if (!mciDB) return;
    const tx = mciDB.transaction("photos", "readwrite");
    tx.objectStore("photos").put({ id: key, blob });
}

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

function guardarFotoOffline(id, file) {
  if (!mciDB) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    const tx = mciDB.transaction("photos", "readwrite");
    tx.objectStore("photos").put({ id: id, blob: base64 });
  };
  reader.readAsDataURL(file);
}

const body = document.body;
const hamburger = document.getElementById('hamburger');
const collapseBtn = document.getElementById('collapseBtn');
const navLinks = Array.from(document.querySelectorAll('.nav a'));
const sections = Array.from(document.querySelectorAll('.section'));
const openSidebar = ()=> body.classList.add('sidebar-open');
const closeSidebar = ()=> body.classList.remove('sidebar-open');
if(hamburger) hamburger.addEventListener('click', ()=> body.classList.toggle('sidebar-open'));
if(collapseBtn) collapseBtn.addEventListener('click', closeSidebar);

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
  const rowId = 'r' + Math.random().toString(36).substring(2, 9);
  tr.innerHTML = `
    <td><input list="sap-list" placeholder="Ej: 4059979 · UPS..." class="inp-sap"></td>
    <td style="text-align:center; white-space:nowrap;">
      <div style="display:flex; align-items:center; justify-content:flex-start; margin-left:60px; gap:20px;">
        <label style="display:flex; align-items:center; gap:6px; font-size:13px;"><input type="radio" name="tipo-${rowId}" value="INSTALADO" class="inp-tipo"> Instalado</label>
        <label style="display:flex; align-items:center; gap:6px; font-size:13px;"><input type="radio" name="tipo-${rowId}" value="RETIRADO" class="inp-tipo"> Retirado</label>
      </div>
    </td>
    <td style="text-align:center;">
      <div style="display:flex; justify-content:center; width:100%;">
        <input type="text" placeholder="Escribe el serial" class="inp-serial" required style="width:190px; margin-left:100px;">
      </div>
    </td>
    <td><button class="btn secondary btn-del" title="Eliminar fila" style="padding:4px 10px; font-size:12px; border-radius:6px;">Eliminar</button></td>
  `;
  const sapInput = tr.querySelector('.inp-sap');
  sapInput.addEventListener('change', () => {
    const v = sapInput.value.trim();
    if (v.includes('·')) return;
    const desc = sapMap.get(v);
    if (desc) sapInput.value = `${v} · ${desc}`;
  });
  tr.querySelector('.btn-del').addEventListener('click', () => tr.remove());
  return tr;
}

if(addRowBtn && tbody) {
  addRowBtn.addEventListener('click', () => tbody.appendChild(makeRow()));
  tbody.appendChild(makeRow());
}

function mountPhotoCells(){
  document.querySelectorAll('.photo-cell').forEach(cell=>{
    const input = cell.querySelector('input[type="file"]');
    if (!input) return;
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
          viewer.innerHTML = `<button class="photo-viewer-close">×</button><img src="${img.src}" alt="Imagen">`;
          viewer.addEventListener('click',(ev)=>{
            if(ev.target === viewer || ev.target.classList.contains('photo-viewer-close')){
              viewer.remove();
            }
          });
          document.body.appendChild(viewer);
        }
        if (act==='remove'){
          const img = cell.querySelector('img'); if (img) img.remove();
          cell.classList.remove('has-image');
          if(placeholder) placeholder.style.display='';
          input.value = '';
          dbSavePhoto(input.id, null);
        }
      });
    };

    cell.addEventListener('click',(e)=>{
      if (e.target.closest('.chip')) return;
      input.click();
    });

    input.addEventListener('change', () => {
      if (!cell._files) cell._files = [];
      if (!input.files || input.files.length === 0) return;
      
      const file = input.files[0];
      const url = URL.createObjectURL(file);
      cell._files = [file];

      let img = cell.querySelector('img');
      if (!img) { img = document.createElement('img'); cell.appendChild(img); }
      img.src = url;
      cell.classList.add('has-image');
      if(placeholder) placeholder.style.display = 'none';
      cell.ensureToolbar();
    });
  });
}
mountPhotoCells();

function clearAllPhotos() {
    if (!mciDB) return;
    const tx = mciDB.transaction("photos", "readwrite");
    const store = tx.objectStore("photos");
    store.clear();
}

const resetWorkBtn = document.getElementById("resetWorkBtn");
if (resetWorkBtn) {
  resetWorkBtn.addEventListener("click", () => {
    if (!confirm("¿Seguro que deseas reiniciar todo el trabajo? Esto borrará el borrador y limpiará todos los campos y fotos.")) {
      return;
    }
    clearDraft();
    clearAllPhotos();

    document.querySelectorAll("input:not([type='file']), textarea, select").forEach(el => {
      if (el.id) el.value = "";
    });

    const tbodyEquipos = document.getElementById("tbody-equipos");
    if (tbodyEquipos) {
      tbodyEquipos.innerHTML = "";
      tbodyEquipos.appendChild(makeRow());
    }

    document.querySelectorAll('.photo-cell').forEach(cell => {
      const input = cell.querySelector('input[type="file"]');
      const img = cell.querySelector('img');
      const placeholder = cell.querySelector('.placeholder');
      if (img) img.remove();
      if (input) input.value = "";
      cell.classList.remove('has-image');
      if (placeholder) placeholder.style.display = '';
    });
    document.querySelectorAll('.photo-toolbar').forEach(tb => tb.remove());
    setStatus("Trabajo reiniciado ✔", "ok");
  });
}

const DRAFT_KEY = "MCI_DRAFT_v1";

function saveDraft() {
  const data = {};
  const campos = document.querySelectorAll("input:not([type='file']), textarea, select");
  campos.forEach(el => {
    if (el.id) data[el.id] = el.value ?? "";
  });

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

  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  dbSaveDraft(data);
}

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
      if(tbody) {
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
    }
  } catch (e) {
    console.error("Error restaurando borrador:", e);
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

restoreDraft();

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
        const scale = Math.min(1, MAX_SIZE / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.85;
        let result = canvas.toDataURL("image/jpeg", quality);
        const MAX_BASE64_SIZE = 500000;
        while (result.length > MAX_BASE64_SIZE && quality > 0.75) {
          quality -= 0.02;
          result = canvas.toDataURL("image/jpeg", quality);
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

const FLOW_URL = "https://defaulte4e1bc33e2834312bb3789010224b7.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/dc99f30c70a64d57b309dce1c13d1290/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=NMxJMh4pAr98EPpIwDJGzHb5_glsVkAv-A1TVjR9zsA";
const FLOW_SUBSANAR_URL = "https://defaulte4e1bc33e2834312bb3789010224b7.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/960b8aa1c42041f39ca6f35251743971/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=snFK5pRBTUxuOzLIhGdl2Py32qlyPAI_up7Ob_vTKAs";
let currentFlowUrl = FLOW_URL;
const KV_URL = "https://cloudflare-index.modulo-de-exclusiones.workers.dev/registrar";

const statusEl = document.getElementById('status');
const exportBtn = document.getElementById('exportBtn');

const setWorking = (on, text) => {
  if(!exportBtn) return;
  exportBtn.disabled = on;
  exportBtn.textContent = on ? (text || 'Generando…') : '📤 Generar informe';
};

const setStatus = (msg, kind = '') => {
  if(!statusEl) return;
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

async function getFoto(id) {
  const input = document.getElementById(id);
  if (input && input.files && input.files[0]) {
    const raw = await fileToDataURL(input.files[0]);
    return await downscaleDataUrl(raw);
  }
  return new Promise(resolve => {
    cargarFotoOffline(id, async base64 => {
      if (!base64) return resolve(null);
      const scaled = await downscaleDataUrl(base64);
      resolve(scaled);
    });
  });
}

async function exportarMCI(){
  const firma = await getFoto("img-firma-tec");
  if (!firma) {
    alert("Debes subir la firma antes de continuar");
    return;
  }

  const numeroCaso = document.getElementById('inp-numero-caso').value.trim();
  const fechaISO = document.getElementById('inp-fecha').value;
  const fecha = toDDMMYYYY(fechaISO);

  if (!numeroCaso){ setStatus('Ingresa el N° de caso.', 'err'); return; }
  if (!fecha){ setStatus('Selecciona una fecha válida.', 'err'); return; }

  const idBen = document.getElementById('inp-idben').value.trim();
  if (!idBen){ setStatus('Ingresa el ID beneficiario.', 'err'); return; }

  const sapAntes1 = (document.getElementById('inp-sap-antes-1')?.value ?? '').trim();
  const sapAntes2 = (document.getElementById('inp-sap-antes-2')?.value ?? '').trim();
  const sapAntes3 = (document.getElementById('inp-sap-antes-3')?.value ?? '').trim();
  const sapAntes4 = (document.getElementById('inp-sap-antes-4')?.value ?? '').trim();
  const sapAntes5 = (document.getElementById('inp-sap-antes-5')?.value ?? '').trim();
  const sapAntes6 = (document.getElementById('inp-sap-antes-6')?.value ?? '').trim();

  const fotoAntesSerial1 = await getFoto('img-antes-serial-1');
  const fotoAntesSerial2 = await getFoto('img-antes-serial-2');
  const fotoAntesSerial3 = await getFoto('img-antes-serial-3');
  const fotoAntesSerial4 = await getFoto('img-antes-serial-4');
  const fotoAntesSerial5 = await getFoto('img-antes-serial-5');
  const fotoAntesSerial6 = await getFoto('img-antes-serial-6');

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

  const fotoDespuesSerial1 = await getFoto('img-despues-serial-1');
  const fotoDespuesSerial2 = await getFoto('img-despues-serial-2');
  const fotoDespuesSerial3 = await getFoto('img-despues-serial-3');
  const fotoDespuesSerial4 = await getFoto('img-despues-serial-4');
  const fotoDespuesSerial5 = await getFoto('img-despues-serial-5');
  const fotoDespuesSerial6 = await getFoto('img-despues-serial-6');

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

  const antesObs   = (document.getElementById('inp-antes-obs')  ?.value ?? '').trim();
  const despuesObs = (document.getElementById('inp-despues-obs')?.value ?? '').trim();
  const latitud  = (document.getElementById('inp-lat')?.value ?? '').trim();
  const longitud = (document.getElementById('inp-lon')?.value ?? '').trim();

  const acompNombre = (document.getElementById('inp-acomp-nombre')?.value ?? '').trim();
  const acompCargo  = (document.getElementById('inp-acomp-cargo') ?.value ?? '').trim();
  const acompCedula = (document.getElementById('inp-acomp-cedula')?.value ?? '').trim();
  const acompTel1   = (document.getElementById('inp-acomp-tel1')  ?.value ?? '').trim();
  const acompTel2   = (document.getElementById('inp-acomp-tel2')  ?.value ?? '').trim();
  const acompCorreo = (document.getElementById('inp-acomp-correo')?.value ?? '').trim();

  const tecNombre = (document.getElementById('inp-tec-nombre')?.value ?? '').trim();
  const tecCargo  = (document.getElementById('inp-tec-cargo') ?.value ?? '').trim();
  const tecCedula = (document.getElementById('inp-tec-cedula')?.value ?? '').trim();
  const tecTel    = (document.getElementById('inp-tec-tel')   ?.value ?? '').trim();
  const tecCorreo = (document.getElementById('inp-tec-correo')?.value ?? '').trim();

  const departamento = (document.getElementById('inp-departamento')?.value ?? '').trim();
  const municipio    = (document.getElementById('inp-municipio')?.value ?? '').trim();
  const centroPoblado= (document.getElementById('inp-centro-poblado')?.value ?? '').trim();
  const sede         = (document.getElementById('inp-sede')?.value ?? '').trim();
  const correo       = (document.getElementById('inp-correo')?.value ?? '').trim();
  const responsableNombre = (document.getElementById('inp-responsable')?.value ?? '').trim();
  const cedula       = (document.getElementById('inp-cedula')?.value ?? '').trim();
  const contacto     = (document.getElementById('inp-contacto')?.value ?? '').trim();
  const descripcion = (document.getElementById('inp-descripcion')?.value ?? '');

  const filasEquipos = [];
  document.querySelectorAll('#tbody-equipos tr').forEach(tr => {
      const sapRaw = tr.querySelector('.inp-sap')?.value?.trim() ?? '';
      if (!sapRaw) return;
      const sap = sapRaw.includes('·') ? sapRaw.split('·')[0].trim() : sapRaw;
      const tipoInput = tr.querySelector('input.inp-tipo:checked');
      const tipo = tipoInput ? tipoInput.value : '';
      const serial = tr.querySelector('.inp-serial')?.value?.trim() ?? '';
      if (!tipo || !serial) return;
      filasEquipos.push({ sap, descripcion: sapMap.get(sap) ?? '', tipo, serial });
  });

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
      med1       : [ (await getFoto('img-med1-0')) || "", (await getFoto('img-med1-1')) || "" ],
      med2       : await getFoto('img-med2'),
      navIndoor  : [ (await getFoto('img-nav-indoor-0')) || "", (await getFoto('img-nav-indoor-1')) || "", (await getFoto('img-nav-indoor-2')) || "" ],
      navOutdoor : [ (await getFoto('img-nav-outdoor-0')) || "", (await getFoto('img-nav-outdoor-1')) || "", (await getFoto('img-nav-outdoor-2')) || "" ],
      speedtest  : (await getFoto('img-speedtest')) || "",
      portal     : (await getFoto('img-portal')) || "",
      block1     : (await getFoto('img-block1')) || "",
      block2     : (await getFoto('img-block2')) || "",
      despues    : fotosDespues
  };

  const pruebasObs = (document.getElementById('inp-pruebas-obs')?.value ?? '');

  const payloadJson = {
      numeroCaso, fecha, idBen, insertImages: false,
      departamento, municipio, centroPoblado, sede,
      correo, responsableNombre, cedula, contacto,
      descripcion,
      acompNombre, acompCargo, acompCedula, acompTel1, acompTel2, acompCorreo,
      tecNombre, tecCargo, tecCedula, tecTel, tecCorreo,
      firmaActaDataUrl: firma,
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
      antesObs, despuesObs
  };

  try{
      setStatus('Enviando al Flow…');
      setWorking(true, 'Enviando…');

      const resp = await fetch(currentFlowUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mciId: numeroCaso,
          tecnico: window.tecnicoActual || "Técnico General",
          payloadJson: payloadJson,
          imgsJson: imgsJson
        })
      });

      if (!resp.ok) {
        throw new Error(`Error HTTP ${resp.status} al generar el informe`);
      }

      if (currentFlowUrl === FLOW_SUBSANAR_URL) {
        await fetch(`https://cloudflare-index.modulo-de-exclusiones.workers.dev/subsanar/${numeroCaso}`, { method: "PUT" });
      }
      
      setStatus("✅ Informe enviado exitosamente", "ok");
      alert("El informe fue enviado correctamente.");
  }catch(err){
      console.error(err);
      if (err.message && err.message.toLowerCase().includes("failed to fetch")) {
          setStatus('Error de conexión', 'err');
          alert("No fue posible enviar el informe debido a una falla de conexión.\n\nVerifique que dispone de acceso estable a Internet y vuelva a intentarlo.");
      } else {
          setStatus('Error al generar: ' + err.message, 'err');
          alert('No se pudo generar el informe: ' + err.message);
      }
  }finally{
      setWorking(false);
      clearDraft();
  }
}

document.getElementById("exportBtn").addEventListener("click", () => {
  currentFlowUrl = FLOW_URL;
  exportarMCI();
});

const subsanarBtn = document.getElementById("subsanarBtn");
if (subsanarBtn) {
  subsanarBtn.addEventListener("click", () => {
    currentFlowUrl = FLOW_SUBSANAR_URL;
    exportarMCI();
  });
}

document.addEventListener("change", async function(e) {
    if (e.target.matches('.photo-cell.indoor-mini input[type="file"]')) {
        const cell = e.target.closest('.photo-cell.indoor-mini');
        const file = e.target.files[0];
        if (file) {
            cell.classList.add("has-image");
            const reader = new FileReader();
            reader.onload = function(ev) {
                let existing = cell.querySelector("img");
                if (existing) existing.remove();
                let img = document.createElement("img");
                img.src = ev.target.result;
                cell.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    }
});

setInterval(() => {
    try {
        saveDraft();
        const stored = localStorage.getItem("MCI_DRAFT_v1");
        if (stored) {
            const data = JSON.parse(stored);
            dbSaveDraft(data);
        }
    } catch (e) {}
}, 3000);

function conectarInputsDeFoto() {
  photoInputs.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    cargarFotoOffline(id, function(base64) {
      if (base64) {
        const cell = input.closest(".photo-cell");
        if (!cell) return;
        const placeholder = cell.querySelector(".placeholder");
        if (placeholder) placeholder.style.display = "none";
        cell.classList.add("has-image");
        let img = cell.querySelector("img");
        if (!img) {
          img = document.createElement("img");
          cell.appendChild(img);
        }
        img.src = base64;
        const tb = cell.querySelector('.photo-toolbar');
        if (!tb && cell.ensureToolbar) cell.ensureToolbar();
      }
    });

    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      guardarFotoOffline(id, file);
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

document.querySelectorAll(".remove-btn").forEach(btn => {
  btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const cell = e.target.closest(".photo-cell");
    if (!cell) return;
    const input = cell.querySelector("input[type='file']");
    if (!input) return;
    const id = input.id;
    input.value = "";
    input.dataset.deleted = "true";
    const img = cell.querySelector("img");
    if (img) img.remove();
    cell.classList.remove("has-image");
    if(mciDB) {
      const tx = mciDB.transaction("photos", "readwrite");
      tx.objectStore("photos").delete(id);
    }
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
    viewer.innerHTML = `<button class="photo-viewer-close">×</button><img src="${img.src}" alt="Imagen">`;
    viewer.addEventListener("click", (ev) => {
      if (ev.target === viewer || ev.target.classList.contains("photo-viewer-close")) {
        viewer.remove();
      }
    });
    document.body.appendChild(viewer);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const misInformesBtn = document.getElementById("misInformesBtn");
  const misInformesModal = document.getElementById("misInformesModal");
  const cerrarMisInformes = document.getElementById("cerrarMisInformes");

  if (misInformesBtn && misInformesModal) {
    misInformesBtn.addEventListener("click", () => {
      misInformesModal.style.display = "flex";
    });
  }

  if (cerrarMisInformes && misInformesModal) {
    cerrarMisInformes.addEventListener("click", () => {
      misInformesModal.style.display = "none";
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const mainEl = document.querySelector(".main");
  if (mainEl) {
    mainEl.style.display = "flex";
  }
});
