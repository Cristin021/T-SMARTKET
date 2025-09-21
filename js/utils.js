// utils.js — helpers
export const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });

export function byId(id){ return document.getElementById(id); }

export function encodeWAText(producto){
  const numero = "573194880062";
  const precio = COP.format(producto.precioCOP);
  const mensaje = `Hola quiero comprar el producto ${producto.nombre} de precio ${precio} regálame el link de pago muchas gracias`;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  return url;
}

export function debounce(fn, wait=220){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); };
}

export function getParams(){ return new URLSearchParams(location.search); }
export function setParams(obj){
  const p = new URLSearchParams();
  for(const [k,v] of Object.entries(obj)){
    if(v!==undefined && v!==null && v!=="") p.set(k, v);
  }
  history.replaceState({}, "", `${location.pathname}?${p.toString()}`);
}

export const EMBEDDED_FALLBACK = [
  {
    id: 9991, nombre: "Arroz Premium 5 kg", categoria: "Canasta Familiar", subcategoria: "Abarrotes",
    descripcion: "Arroz de excelente calidad", precioCOP: 25000, precioAnteriorCOP: 30000,
    stock: 8, marca: "Doria", sku: "CF-ARROZ1", imagen: "/assets/img/canasta/arroz.png", destacado: true
  },
  {
    id: 9992, nombre: "Smartphone 6.5\" 128GB", categoria: "Tecnología", subcategoria: "Celulares",
    descripcion: "Desempeño balanceado y buena cámara", precioCOP: 950000, precioAnteriorCOP: null,
    stock: 0, marca: "Xiaomi", sku: "TEC-CELL1", imagen: "/assets/img/tecnologia/gama.png", destacado: true
  },
  {
    id: 9993, nombre: "SSD NVMe 1TB", categoria: "Tecnología", subcategoria: "Almacenamiento",
    descripcion: "Alto rendimiento para tu PC", precioCOP: 320000, precioAnteriorCOP: 380000,
    stock: 25, marca: "Kingston", sku: "TEC-SSD1", imagen: "/assets/img/tecnologia/ssd.png", destacado: false
  }
];
