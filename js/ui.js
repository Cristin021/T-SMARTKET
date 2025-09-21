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
  if((p.stock|0)===0){ const ov=document.createElement("div"); ov.className="soldout-overlay"; ov.textContent="AGOTADO"; imgWrap.appendChild(ov);}

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
  // badge por stock
  const s = Number.isFinite(+p.stock)?+p.stock:0;
  let b = document.createElement("span");
  if(s<=0){ b.className="badge badge-red"; b.textContent="🔴 Agotado"; }
  else if(s<=3){ b.className="badge badge-orange"; b.textContent="🟠 ¡Quedan pocas!"; }
  else if(s<=10){ b.className="badge badge-yellow"; b.textContent="🟡 Bajo stock"; }
  else { b.className="badge badge-green"; b.textContent="🟢 Disponible"; }
  badges.appendChild(b);
  // badge oferta, si aplica
  if(p.precioAnteriorCOP){ const o=document.createElement("span"); o.className="badge badge-sale"; o.textContent="Oferta"; badges.appendChild(o); }

  const actions = document.createElement("div");
  actions.className = "actions";
  const btn = document.createElement("button");
  btn.className = "btn"; btn.textContent = "Comprar por WhatsApp";
  if((p.stock|0)===0){ btn.style.display="none"; }
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
  const body  = byId("modalBody");

  const stock = Number.isFinite(+p.stock) ? +p.stock : 0;
  const precio = COP.format(Number(p.precioCOP)||0);
  const precioAnt = p.precioAnteriorCOP ? COP.format(Number(p.precioAnteriorCOP)||0) : "";

  const stockBadge = (stock<=0) ? '<span class="badge badge-red">🔴 Agotado</span>' :
                      (stock<=3) ? '<span class="badge badge-orange">🟠 ¡Quedan pocas!</span>' :
                      (stock<=10)? '<span class="badge badge-yellow">🟡 Bajo stock</span>' :
                                   '<span class="badge badge-green">🟢 Disponible</span>';
  const ofertaBadge = p.precioAnteriorCOP ? '<span class="badge badge-sale">Oferta</span>' : '';
  const metaLine = [p.marca, p.categoria, p.subcategoria].filter(Boolean).join(' • ');
  const img = p.imagen || './assets/img/placeholder.png';
  const title = p.nombre || '';
  const waLink = `https://wa.me/57XXXXXXXXXX?text=${encodeURIComponent('Hola, me interesa: ' + title)}`;

  body.innerHTML = `
    <div class="product-detail">
      <div class="pd-card pd-image">
        <div class="frame">
          <img src="${img}" alt="${title}">
          ${stock===0 ? '<div class="soldout-overlay">AGOTADO</div>' : ''}
        </div>
      </div>

      <div class="pd-card pd-info">
        <h3 class="pd-title">${title}</h3>
        <div class="pd-meta">${metaLine}</div>
        <div class="pd-badges">${stockBadge} ${ofertaBadge}</div>
        <div class="pd-price"><span>${precio}</span> ${precioAnt ? `<del>${precioAnt}</del>` : ''}</div>
        <div class="pd-actions">
          ${stock>0 ? `<a class="btn btn-wa" href="${waLink}" target="_blank" rel="noopener">Comprar por WhatsApp</a>` : ``}
          <button class="btn btn-cart" ${stock>0 ? '' : 'disabled'}>Añadir al carrito</button>
          <button class="btn btn-outline" id="btnCloseDetail">Cerrar</button>
        </div>
        ${p.descripcion ? `<div class="pd-desc">${p.descripcion}</div>` : ''}
      </div>
    </div>
  `;

  body.querySelector('#btnCloseDetail')?.addEventListener('click', ()=> closeDetail());
  modal.setAttribute('aria-hidden','false');
  byId('closeModal').focus();
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
    img.src = "." + p.imagen; img.alt = p.nombre; img.loading = "lazy";
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
