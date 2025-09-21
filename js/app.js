// app.js — versión estable con búsqueda lateral y filtro de ofertas en refresh
import { byId, debounce, getParams, setParams, EMBEDDED_FALLBACK } from './utils.js';
import { buildFilters, applyFilters } from './filtros.js';
import { renderFilters, mountGrid, appendMore, closeDetail, renderOffers, renderEmpty } from './ui.js';

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
  try{
    const res = await fetch("./data/productos.json");
    if(!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return data;
  }catch(err){
    const status = byId("status");
    status.classList.remove("sr-only");
    status.innerHTML = "No se pudo cargar el catálogo externo. Mostrando datos mínimos de respaldo.";
    return EMBEDDED_FALLBACK;
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
