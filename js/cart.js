
// cart.js — Carrito de compras con LocalStorage + Checkout por WhatsApp
import { COP, byId } from './utils.js';

const STORE_KEY = 'ts_cart_v1';

function load(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }catch(e){ return []; } }
function save(items){ localStorage.setItem(STORE_KEY, JSON.stringify(items)); }
function findIndex(items, id){ return items.findIndex(i=> i.id === id); }

export const Cart = {
  get items(){ return load(); },
  add(producto, qty=1){
    const items = load();
    const idx = findIndex(items, producto.id);
    if(idx>=0){ items[idx].qty += qty; }
    else{
      items.push({ id: producto.id, nombre: producto.nombre, precioCOP: producto.precioCOP, qty, sku: producto.sku || null, imagen: producto.imagen || null, marca: producto.marca || null, categoria: producto.categoria || null, subcategoria: producto.subcategoria || null });
    }
    save(items);
    Cart._notify();
  },
  setQty(id, qty){
    const items = load();
    const idx = findIndex(items, id);
    if(idx>=0){
      items[idx].qty = Math.max(1, qty|0);
      save(items);
      Cart._notify();
    }
  },
  remove(id){
    const items = load().filter(i=> i.id !== id);
    save(items); Cart._notify();
  },
  clear(){ save([]); Cart._notify(); },
  count(){ return load().reduce((a,b)=>a+b.qty,0); },
  subtotal(){ return load().reduce((a,b)=> a + b.precioCOP*b.qty, 0); },
  toWhatsAppText(){
    const lines = [];
    lines.push("Hola quiero comprar los siguientes productos:");
    load().forEach(i=>{
      const precio = COP.format(i.precioCOP);
      const veces = (i.qty>1)? ` x${i.qty}` : "";
      lines.push(`${i.nombre}${veces} de precio ${precio}`);
    });
    lines.push("");
    lines.push(`Total ${COP.format(Cart.subtotal())}`);
    lines.push("regálame el link de pago muchas gracias");
    return lines.join("\n");
  },
  checkoutWhatsApp(){
    const numero = "573194880062";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(Cart.toWhatsAppText())}`;
    window.open(url, "_blank");
  },
  // UI badge updater
  _listeners: [],
  onChange(fn){ Cart._listeners.push(fn); },
  _notify(){ Cart._listeners.forEach(fn=>fn(Cart)); document.dispatchEvent(new CustomEvent("cart:change")); }
};

// Badge helper
export function mountCartBadge(el){
  const update = ()=>{ el.textContent = `Tu compra 🛒 (${Cart.count()})`; };
  update();
  Cart.onChange(update);
}
