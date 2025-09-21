// filtros.js — lógica de filtrado, orden y paginación (versión estable)
export function buildFilters(data){
  const cats = new Set(), subs = new Set(), marcas = new Set();
  data.forEach(p=>{
    cats.add(p.categoria);
    subs.add(p.subcategoria);
    marcas.add(p.marca);
  });
  return {
    categorias: ["", ...Array.from(cats).sort()],
    subcategorias: ["", ...Array.from(subs).sort()],
    marcas: ["", ...Array.from(marcas).sort()]
  };
}

export function applyFilters(data, state){
  let out = [...data];
  const q = (state.q||"").trim().toLowerCase();

  if(q){
    out = out.filter(p=>[p.nombre, p.marca, p.categoria, p.subcategoria].some(s=>String(s).toLowerCase().includes(q)));
  }
  if(state.section){
    out = out.filter(p=>p.categoria === state.section);
  }
  if(state.categoria){
    out = out.filter(p=>p.categoria === state.categoria);
  }
  if(state.subcategoria){
    out = out.filter(p=>p.subcategoria === state.subcategoria);
  }
  if(state.marca){
    out = out.filter(p=>p.marca === state.marca);
  }
  if(state.disponibilidad==="instock"){
    out = out.filter(p=>p.stock>0);
  }else if(state.disponibilidad==="out"){
    out = out.filter(p=>p.stock===0);
  }
  const min = Number(state.precioMin||""); const max = Number(state.precioMax||"");
  if(!Number.isNaN(min) && state.precioMin!==""){
    out = out.filter(p=>p.precioCOP>=min);
  }
  if(!Number.isNaN(max) && state.precioMax!==""){
    out = out.filter(p=>p.precioCOP<=max);
  }

  if(state.sortBy==="precioAsc"){
    out.sort((a,b)=>a.precioCOP-b.precioCOP);
  }else if(state.sortBy==="precioDesc"){
    out.sort((a,b)=>b.precioCOP-a.precioCOP);
  }else if(state.sortBy==="masVendidos"){
    out.sort((a,b)=> (Number(b.destacado)-Number(a.destacado)) || (b.precioCOP-a.precioCOP));
  }else{
    out.sort((a,b)=> (Number(b.destacado)-Number(a.destacado)) || a.nombre.localeCompare(b.nombre, 'es'));
  }
  return out;
}
