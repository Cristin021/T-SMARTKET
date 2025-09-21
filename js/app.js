// app.js — versión estable con búsqueda lateral y filtro de ofertas en refresh
import { byId, debounce, getParams, setParams, EMBEDDED_FALLBACK } from './utils.js';
import { buildFilters, applyFilters } from './filtros.js';
import { renderFilters, mountGrid, appendMore, closeDetail, renderOffers, renderEmpty } from './ui.js';

/* ======================================================
   Google Sheets helper: genera URLs CSV y XLSX export
   (no usa backticks anidados ni retorna nada fuera de
   funciones; 100% compatible en navegadores)
   ====================================================== */
function toGSheetUrls(url){
  var m = String(url).match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if(!m) return null;
  var id = m[1];
  var gidMatch = String(url).match(/(?:[?#&]gid=)(\d+)/);
  var gid = gidMatch ? gidMatch[1] : '';
  var base = 'https://docs.google.com/spreadsheets/d/' + id;
  var csv  = base + '/gviz/tq?tqx=out:csv' + (gid ? '&gid=' + gid : '');
  var xlsx = base + '/export?format=xlsx' + (gid ? '&gid=' + gid : '');
  return { csv: csv, xlsx: xlsx };
}

const STATE = {
  data: [],
  filtered: [],
  q: "", section: "", categoria: "", subcategoria: "", marca: "",
  precioMin: "", precioMax: "", disponibilidad: "", sortBy: "relevancia",
  onlyOffers: false,
  pageSize: 16, loaded: 0
};

function syncFromParams(){
  const p = getParams();
  STATE.q = p.get("q") || "";
  STATE.section = p.get("section") || "";
  STATE.categoria = p.get("categoria") || "";
  STATE.subcategoria = p.get("subcategoria") || "";
  STATE.marca = p.get("marca") || "";
  STATE.precioMin = p.get("min") || "";
  STATE.precioMax = p.get("max") || "";
  STATE.disponibilidad = p.get("disp") || "";
  STATE.sortBy = p.get("sort") || "relevancia";
  STATE.onlyOffers = p.get("ofertas") === "1";
}

function syncToParams(){
  setParams({
    q: STATE.q, section: STATE.section, categoria: STATE.categoria, subcategoria: STATE.subcategoria,
    marca: STATE.marca, min: STATE.precioMin, max: STATE.precioMax, disp: STATE.disponibilidad,
    ofertas: STATE.onlyOffers?"1":"", sort: STATE.sortBy
  });
}

function bindUI(){
  byId("year").textContent = new Date().getFullYear();
  const status = byId("status");
  const grid = byId("grid"); const offersWrap = byId("offers");
  const loadMore = byId("loadMore");

  // Inputs
  const q = byId("q");
  const qSide = byId("qSide"); const qSideBtn = byId("qSideBtn");
  const section = byId("sectionFilter");
  const quick = byId("quickFilter"); // puede no existir
  const categoria = byId("categoria"); const subcategoria = byId("subcategoria"); const marca = byId("marca");
  const precioMin = byId("precioMin"); const precioMax = byId("precioMax");
  const disponibilidad = byId("disponibilidad"); const sortBy = byId("sortBy");
  const clear = byId("clearFilters");
  const soloOferta = byId("soloOferta");
  // Topbar search icon
  const searchBtn = byId("searchBtn");
  if(searchBtn){ searchBtn.addEventListener("click", ()=>{ STATE.q = (q?.value||""); refresh(); }); }

  // Category chips (Inicio / Canasta / Tecnología / Promociones / En stock)
  document.querySelectorAll(".catbtn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const sec = btn.getAttribute("data-section");
      const quick = btn.getAttribute("data-quick");
      if(sec !== null){
        STATE.section = sec || "";
        const sectionSel = byId("sectionFilter");
        if(sectionSel) sectionSel.value = STATE.section;
      }
      if(quick){
        if(quick === "oferta"){ STATE.onlyOffers = true; const chk = byId("soloOferta"); if(chk) chk.checked = true; }
        if(quick === "instock"){ STATE.disponibilidad = "instock"; const disp = byId("disponibilidad"); if(disp) disp.value = "instock"; }
      }
      STATE.loaded = 0;
      refresh();
    });
  });


  // Restore initial from params
  if(q) q.value = STATE.q;
  if(qSide) qSide.value = STATE.q;
  if(section) section.value = STATE.section;
  if(categoria) categoria.value = STATE.categoria;
  if(subcategoria) subcategoria.value = STATE.subcategoria;
  if(marca) marca.value = STATE.marca;
  if(precioMin) precioMin.value = STATE.precioMin;
  if(precioMax) precioMax.value = STATE.precioMax;
  if(disponibilidad) disponibilidad.value = STATE.disponibilidad;
  if(sortBy) sortBy.value = STATE.sortBy;
  if(soloOferta) soloOferta.checked = !!STATE.onlyOffers;

  function refresh(){
    STATE.filtered = applyFilters(STATE.data, STATE);
    if(STATE.onlyOffers){
      STATE.filtered = STATE.filtered.filter(p=> !!p.precioAnteriorCOP);
    }
    STATE.loaded = 0;
    grid.innerHTML = "";
    if(STATE.filtered.length === 0){
      renderEmpty(grid, STATE.data.length);
    }else{
      mountGrid(grid, STATE.filtered, STATE);
    }
    status.classList.remove("sr-only");
    status.textContent = `Mostrando ${STATE.loaded} de ${STATE.filtered.length} resultados`;
    loadMore.style.display = (STATE.loaded < STATE.filtered.length) ? "inline-block" : "none";
    syncToParams();
  }

  const onSearch = debounce(()=>{ STATE.q = (q?.value||qSide?.value||""); if(qSide) qSide.value = STATE.q; if(q) q.value = STATE.q; refresh(); }, 200);
  if(q) q.addEventListener("input", onSearch);
  if(qSide) qSide.addEventListener("input", onSearch);
  if(qSideBtn) qSideBtn.addEventListener("click", ()=>{ STATE.q = qSide.value; if(q) q.value = STATE.q; refresh(); });

  if(section) section.addEventListener("change", ()=>{ STATE.section = section.value; refresh(); });
  if(quick) quick.addEventListener("change", ()=>{
    const v = quick.value;
    if(v==="oferta"){ STATE.onlyOffers = true; if(soloOferta) soloOferta.checked=true; }
    if(v==="instock"){ STATE.disponibilidad="instock"; }
    if(v && v.startsWith("marca:")){ STATE.marca = v.split(":")[1]; }
    refresh();
    quick.value="";
  });

  if(categoria) categoria.addEventListener("change", ()=>{ STATE.categoria = categoria.value; refresh(); });
  if(subcategoria) subcategoria.addEventListener("change", ()=>{ STATE.subcategoria = subcategoria.value; refresh(); });
  if(marca) marca.addEventListener("change", ()=>{ STATE.marca = marca.value; refresh(); });
  if(precioMin) precioMin.addEventListener("change", ()=>{ STATE.precioMin = precioMin.value; refresh(); });
  if(precioMax) precioMax.addEventListener("change", ()=>{ STATE.precioMax = precioMax.value; refresh(); });
  if(disponibilidad) disponibilidad.addEventListener("change", ()=>{ STATE.disponibilidad = disponibilidad.value; refresh(); });
  if(sortBy) sortBy.addEventListener("change", ()=>{ STATE.sortBy = sortBy.value; refresh(); });
  if(soloOferta) soloOferta.addEventListener("change", ()=>{ STATE.onlyOffers = soloOferta.checked; refresh(); });

  if(clear) clear.addEventListener("click", ()=>{
    STATE.q=""; if(q) q.value=""; if(qSide) qSide.value = "";
    STATE.section=""; if(section) section.value="";
    STATE.categoria=""; if(categoria) categoria.value="";
    STATE.subcategoria=""; if(subcategoria) subcategoria.value="";
    STATE.marca=""; if(marca) marca.value="";
    STATE.precioMin=""; if(precioMin) precioMin.value="";
    STATE.precioMax=""; if(precioMax) precioMax.value="";
    STATE.disponibilidad=""; if(disponibilidad) disponibilidad.value="";
    STATE.onlyOffers=false; if(soloOferta) soloOferta.checked=false;
    STATE.sortBy="relevancia"; if(sortBy) sortBy.value="relevancia";
    refresh();
  });

  if(loadMore) loadMore.addEventListener("click", ()=>{
    appendMore(grid, STATE.filtered, STATE);
    status.textContent = `Mostrando ${STATE.loaded} de ${STATE.filtered.length} resultados`;
    loadMore.style.display = (STATE.loaded < STATE.filtered.length) ? "inline-block" : "none";
  });

  // Modal
  document.getElementById("closeModal").addEventListener("click", ()=> closeDetail());
  document.getElementById("modal").addEventListener("click", (e)=>{ if(e.target.id==="modal") closeDetail(); });

  return { refresh };
}


async function loadData(){
  const status = document.getElementById("status");
  try{
    if (!window.XLSX) throw new Error("XLSX no cargó");

    // 1) Origen: Google Sheets (CSV -> XLSX) o local
    const src = (window.CATALOG_XLSX_URL && window.CATALOG_XLSX_URL.trim()) || './data/productos.xlsx';
    let res, used = 'local';
    if (/docs\.google\.com\/spreadsheets/.test(src)) {
      const u = toGSheetUrls(src);
      try {
        res = await fetch(u.csv, { credentials: 'omit' });
        if (res && res.ok) {
          used = 'gsheets-csv';
        } else {
          res = await fetch(u.xlsx, { credentials: 'omit' });
          if (res && res.ok) used = 'gsheets-xlsx';
        }
      } catch (_) { /* sigue al local */ }
    }
    if (!res || !res.ok) {
      res = await fetch('./data/productos.xlsx');
      used = 'local';
    }
    if(!res.ok) throw new Error("HTTP " + res.status);

    // 2) Parseo según origen
    let wb;
    if (used === 'gsheets-csv') {
      const csv = await res.text();
      wb = XLSX.read(csv, { type: 'string' });
    } else {
      const buf = await res.arrayBuffer();
      wb  = XLSX.read(buf, { type: 'array' });
    }
    const ws  = wb.Sheets[wb.SheetNames[0]];

    // Detect header row (first 30 rows)
    const rowsRaw = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
    const HEADS = [
      "id","ID","sku","SKU","nombre","Nombre","PRODUCTO","Producto","producto",
      "categoria","Categoría","Categoria","subcategoria","Subcategoría","Subcategoria",
      "descripcion","Descripción","Descripcion",
      "precioCOP","Precio","Precio_COP","PrecioCOP","PrecioCOP_col",
      "precioAnteriorCOP","PrecioAnterior","Precio_Anterior",
      "stock","Stock","Existencias","Cantidad",
      "marca","Marca","imagen","Imagen","image",
      "destacado","Destacado","Oferta"
    ].map(s=>s.toLowerCase());
    let headerRow = 0, best = -1;
    for(let i=0;i<Math.min(30,rowsRaw.length);i++){
      const sc = (rowsRaw[i]||[]).reduce((a,c)=> a + (HEADS.includes(String(c).trim().toLowerCase())?1:0),0);
      if(sc>best){ best=sc; headerRow=i; }
    }

    const rows = XLSX.utils.sheet_to_json(ws, { defval: "", range: headerRow });

    function parseNumeric(v){
      if (v == null) return 0;
      if (typeof v === "number") return v;
      let s = String(v).trim().replace(/[^0-9,.\-]/g,"");
      const c = s.lastIndexOf(","), d = s.lastIndexOf(".");
      let sep = -1;
      if(c>-1 && d>-1) sep = Math.max(c,d);
      else if(c>-1) sep = c;
      else if(d>-1) sep = d;
      if(sep>-1){
        const intPart = s.slice(0, sep).replace(/[.,]/g,"");
        const decPart = s.slice(sep+1).replace(/[.,]/g,"");
        s = intPart + "." + decPart;
      } else {
        s = s.replace(/[.,]/g,"");
      }
      const n = Number(s);
      return Number.isFinite(n) ? n : 0;
    }
    function parseIntSafe(v){ const n = parseNumeric(v); return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0; }
    function parseBool(v){ const t = String(v ?? "").trim().toLowerCase(); return ["true","1","si","sí","y","yes","x"].includes(t); }

    const data = rows.map((r,i)=> ({
      id:                r.id || r.ID || r.Id || r.sku || r.SKU || (100000+i),
      nombre:            r.nombre || r.Nombre || r.PRODUCTO || r.Producto || r.producto || `Producto ${100000+i}`,
      categoria:         r.categoria || r["Categoría"] || r.Categoria || "",
      subcategoria:      r.subcategoria || r["Subcategoría"] || r.Subcategoria || "",
      descripcion:       r.descripcion || r["Descripción"] || r.Descripcion || "",
      precioCOP:         parseNumeric(r.precioCOP ?? r.Precio ?? r.Precio_COP ?? r.PrecioCOP ?? r.PrecioCOP_col),
      precioAnteriorCOP: parseNumeric(r.precioAnteriorCOP ?? r.PrecioAnterior ?? r.Precio_Anterior),
      stock:             parseIntSafe(r.stock ?? r.Stock ?? r.Existencias ?? r.Cantidad),
      marca:             r.marca || r.Marca || "",
      sku:               r.sku || r.SKU || "",
      imagen:            r.imagen || r.Imagen || r.image || "",
      destacado:         parseBool(r.destacado ?? r.Destacado ?? r.Oferta)
    }));

    if(status){ status.classList.remove("sr-only"); status.textContent = `Catálogo cargado: ${data.length} productos` + (typeof used!=='undefined'?` • fuente: ${used}`:''); }
    return data;
  }catch(e){
    console.warn("XLSX loader error", e);
    if(status){ status.classList.remove("sr-only"); status.textContent = "Error XLSX: " + (e && e.message); }
    // No JSON fallback, para respetar tu pedido
    return typeof EMBEDDED_FALLBACK !== "undefined" ? EMBEDDED_FALLBACK : [];
  }
}

export async function initApp(){
  syncFromParams();
  const data = await loadData();
  data.sort((a,b)=> Number(b.destacado)-Number(a.destacado));
  STATE.data = data;

  const meta = buildFilters(data);
  renderFilters(meta);

  const { refresh } = bindUI();

  const offers = STATE.data.filter(p => !!p.precioAnteriorCOP).slice(0, 8);
  if(typeof renderOffers === "function") renderOffers(offers);

  refresh();
}

// === Toggle Super Ofertas ===
document.addEventListener("DOMContentLoaded", ()=>{
  const toggleBtn = document.getElementById("toggleOffers");
  const offersRow = document.getElementById("offers");
  if(toggleBtn && offersRow){
    toggleBtn.addEventListener("click", ()=>{
      if(offersRow.style.display === "none"){
        offersRow.style.display = "";
        toggleBtn.textContent = "Ocultar Ofertas";
      } else {
        offersRow.style.display = "none";
        toggleBtn.textContent = "Mostrar Ofertas";
      }
    });
  }
});


// === Toggle Ofertas (persistente) ===
(function(){
  const btn = byId('toggleOffers');
  const grid = byId('offers');
  if(!btn || !grid) return;
  // Estado guardado
  const KEY = 'ts_offers_hidden';
  const hidden = localStorage.getItem(KEY) === '1';
  if(hidden){ grid.style.display = 'none'; btn.textContent = 'Mostrar Ofertas'; }
  btn.addEventListener('click', ()=>{
    const isHidden = grid.style.display === 'none';
    grid.style.display = isHidden ? '' : 'none';
    btn.textContent = isHidden ? 'Ocultar Ofertas' : 'Mostrar Ofertas';
    localStorage.setItem(KEY, isHidden ? '0' : '1');
  });
})();


// === Toggle Ofertas por delegación (fallback robusto) ===
document.addEventListener('click', (ev)=>{
  const t = ev.target;
  if(!(t instanceof Element)) return;
  if(t.id === 'toggleOffers'){
    const grid = document.getElementById('offers');
    if(!grid) return;
    const isHidden = grid.style.display === 'none';
    grid.style.display = isHidden ? '' : 'none';
    t.textContent = isHidden ? 'Ocultar Ofertas' : 'Mostrar Ofertas';
    try{ localStorage.setItem('ts_offers_hidden', isHidden ? '0' : '1'); }catch(e){}
  }
});
