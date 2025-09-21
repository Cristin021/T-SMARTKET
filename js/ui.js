// ui.js — renderizado y modales
import { COP, byId, encodeWAText } from './utils.js';
import { Cart } from './cart.js';

export function renderFilters(meta){
  const sel = (id, opts)=>{
    const el = byId(id); el.innerHTML = "";
    opts.forEach(v=>{
      const o = document.createElement("option"); o.value = v; o.textContent = v||"Todos";
      el.appendChild(o);
    });
  };
  sel("categoria", meta.categorias);
  sel("subcategoria", meta.subcategorias);
  sel("marca", meta.marcas);
}

export function productCard(p){
  const card = document.createElement("article");
  card.className = "card";
  card.tabIndex = 0;
  card.setAttribute("role","article");
  const imgWrap = document.createElement("div");
  imgWrap.className = "img-wrap";
  const img = document.createElement("img");
  img.src = "." + p.imagen;
  img.alt = p.nombre;
  img.loading = "lazy";
  imgWrap.appendChild(img);
  if(p.stock===0){ const ov=document.createElement('div'); ov.className='soldout-overlay'; ov.textContent='AGOTADO'; imgWrap.appendChild(ov);}

  const body = document.createElement("div");
  body.className = "body";
  const title = document.createElement("div");
  title.className = "title"; title.textContent = p.nombre;
  const brand = document.createElement("div");
  brand.className = "brand"; brand.textContent = `${p.marca} • ${p.categoria} › ${p.subcategoria}`;

  const price = document.createElement("div");
  price.className = "price";
  const now = document.createElement("strong");
  now.textContent = COP.format(p.precioCOP);
  price.appendChild(now);
  if(p.precioAnteriorCOP){
    const old = document.createElement("span");
    old.className = "old"; old.textContent = COP.format(p.precioAnteriorCOP);
    price.appendChild(old);
  }

  
  const badges = document.createElement("div");
  badges.className = "badges";
  // Oferta
  if(p.precioAnteriorCOP){
    const b = document.createElement("span"); b.className="badge badge-sale"; b.textContent="Oferta"; badges.appendChild(b);
  }
  // Stock badge
  const stock = Number.isFinite(+p.stock)? +p.stock : 0;
  let bStock = document.createElement("span");
  if(stock<=0){ bStock.className="badge badge-red"; bStock.textContent="🔴 Agotado"; }
  else if(stock<=3){ bStock.className="badge badge-orange"; bStock.textContent="🟠 ¡Quedan pocas!"; }
  else if(stock<=10){ bStock.className="badge badge-yellow"; bStock.textContent="🟡 Bajo stock"; }
  else { bStock.className="badge badge-green"; bStock.textContent="🟢 Disponible"; }
  badges.appendChild(bStock);

  const actions = document.createElement("div");

  actions.className = "actions";
  const btn = document.createElement("button");
  btn.className = "btn"; btn.textContent = "Comprar por WhatsApp";
  if(p.stock===0){ btn.style.display="none"; }
  btn.addEventListener("click", e=>{
    e.stopPropagation();
    window.open(encodeWAText(p), "_blank");
  });
  const add = document.createElement("button");
  add.className = "btn outline"; add.textContent = "Añadir al carrito";
  add.disabled = p.stock===0;
  add.addEventListener("click", e=>{
    e.stopPropagation();
    Cart.add(p);
  });
  const more = document.createElement("button");
  more.className = "btn secondary"; more.textContent = "Detalle";
  more.addEventListener("click", (e)=>{
    e.stopPropagation();
    openDetail(p);
  });
  actions.append(btn, add, more);

  body.append(title, brand, price, badges, actions);
  card.append(imgWrap, body);

  card.addEventListener("click", ()=>openDetail(p));
  card.addEventListener("keypress", (ev)=>{ if(ev.key==="Enter") openDetail(p); });

  return card;
}

export function mountGrid(target, list, paging){
  target.innerHTML = "";
  const pageSize = paging.pageSize;
  const slice = list.slice(0, paging.loaded + pageSize);
  slice.forEach(p=> target.appendChild(productCard(p)));
  paging.loaded = slice.length;
}

export function appendMore(target, list, paging){
  const pageSize = paging.pageSize;
  const slice = list.slice(paging.loaded, paging.loaded + pageSize);
  slice.forEach(p=> target.appendChild(productCard(p)));
  paging.loaded += slice.length;
}

export function openDetail(p){
  const modal = byId("modal");
  const body = byId("modalBody");
  body.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "detail";

  const imgWrap = document.createElement("div");
  imgWrap.className = "img-wrap";
  const img = document.createElement("img");
  img.src = (p.imagen ? "." + p.imagen : "./assets/img/placeholder.png"); img.alt = p.nombre;
  imgWrap.appendChild(img);
  if(p.stock===0){ const ov=document.createElement('div'); ov.className='soldout-overlay'; ov.textContent='AGOTADO'; imgWrap.appendChild(ov);}

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `
    <h3>${p.nombre}</h3>
    <div><strong>Precio:</strong> ${COP.format(p.precioCOP)} ${p.precioAnteriorCOP ? `<span class="old">${COP.format(p.precioAnteriorCOP)}</span>` : ""}</div>
    <div><strong>Estado:</strong> ${p.stock>0? "Disponible ("+p.stock+")":"Agotado"}</div>
    <div><strong>Marca:</strong> ${p.marca}</div>
    <div><strong>SKU:</strong> ${p.sku}</div>
    <div><strong>Categoría:</strong> ${p.categoria}</div>
    <div><strong>Subcategoría:</strong> ${p.subcategoria}</div>
    <p>${p.descripcion}</p>
    <div class="actions">
      <button class="btn" ${p.stock===0?"disabled":""} id="buyNow">Comprar por WhatsApp</button>
    </div>
  `;
  wrap.append(imgWrap, meta);
  body.appendChild(wrap);

  byId("buyNow")?.addEventListener("click", ()=> window.open(encodeWAText(p), "_blank"));

  modal.setAttribute("aria-hidden","false");
  byId("closeModal").focus();
}

export function closeDetail(){
  const modal = byId("modal");
  modal.setAttribute("aria-hidden","true");
}


export function renderOffers(list){
  const wrap = byId("offers");
  if(!wrap) return;
  wrap.innerHTML = "";
  list.forEach(p=>{
    const card = document.createElement("div");
    card.className = "card";
    const left = document.createElement("div");
    left.className = "img-wrap";
    const img = document.createElement("img");
    img.src = (p.imagen ? "." + p.imagen : "./assets/img/placeholder.png"); img.alt = p.nombre; img.loading = "lazy";
    left.appendChild(img);
    const right = document.createElement("div");
    right.className = "meta";
    right.innerHTML = `<div class="title">${p.nombre}</div>
      <div>${p.marca} • ${p.categoria} › ${p.subcategoria}</div>
      <div><strong>${COP.format(p.precioCOP)}</strong> ${p.precioAnteriorCOP? `<span class="old">${COP.format(p.precioAnteriorCOP)}</span>` : ""}</div>
      <div class="actions"><button class="btn" data-action="wa">Comprar por WhatsApp</button> <button class="btn outline" data-action="add">Añadir al carrito</button></div>`;
    right.querySelector('[data-action="wa"]').addEventListener("click", ()=> window.open(encodeWAText(p), "_blank"));
    right.querySelector('[data-action="add"]').addEventListener("click", ()=> Cart.add(p));
    card.append(left, right);
    wrap.appendChild(card);
  });
}

export function renderEmpty(target, total){
  target.innerHTML = `<div class="status">No encontramos resultados con los filtros actuales. Intenta limpiar filtros o ajustar la búsqueda.</div>`;
}
