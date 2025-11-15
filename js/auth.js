// auth.js — autenticación básica en front-end con cifrado local (demo/POC)
import { cryptoEncrypt, cryptoDecrypt, sha256 } from './crypto.js';

const STORE_USER = "ts_auth_users_v1";
const STORE_SESSION = "ts_auth_session_v1";

function q(sel){ return document.querySelector(sel); }
function byId(id){ return document.getElementById(id); }
function loadUsers(){ try{ return JSON.parse(localStorage.getItem(STORE_USER)) || []; }catch(e){ return []; } }
function saveUsers(list){ localStorage.setItem(STORE_USER, JSON.stringify(list)); }
function setSession(sess){ sessionStorage.setItem(STORE_SESSION, JSON.stringify(sess)); document.dispatchEvent(new CustomEvent("auth:change", {detail: sess})); }
export function getSession(){ try{ return JSON.parse(sessionStorage.getItem(STORE_SESSION)); }catch(e){ return null; } }
export function logout(){ sessionStorage.removeItem(STORE_SESSION); document.dispatchEvent(new CustomEvent("auth:change",{detail:null})); }

async function register({nombre, correo, cedula, password}){
  const users = loadUsers();
  const exists = users.find(u=> u.correo.toLowerCase()===correo.toLowerCase());
  if(exists) throw new Error("El correo ya está registrado");
  const passHash = await sha256(password);
  const perfilCifrado = await cryptoEncrypt(password, JSON.stringify({nombre, correo, cedula, created: Date.now()}));
  users.push({ correo, passHash, perfilCifrado });
  saveUsers(users);
  return true;
}
async function login({correo, password}){
  const users = loadUsers();
  const u = users.find(x=> x.correo.toLowerCase()===correo.toLowerCase());
  if(!u) throw new Error("Usuario no encontrado");
  const passHash = await sha256(password);
  if(passHash !== u.passHash) throw new Error("Contraseña incorrecta");
  const perfil = JSON.parse(await cryptoDecrypt(password, u.perfilCifrado));
  setSession({ correo: u.correo, nombre: perfil.nombre, cedula: perfil.cedula, loginAt: Date.now() });
  return perfil;
}

export function mountAuthUI(){
  const header = document.querySelector(".topbar .topbar-inner") || document.querySelector("header") || document.body;
  const wrap = document.createElement("div");
  wrap.style.marginLeft = "auto"; wrap.style.display="flex"; wrap.style.gap="10px";
  const who = document.createElement("span"); who.id="whoami"; who.style.fontWeight="600";
  const bLogin = document.createElement("button"); bLogin.className="btn secondary"; bLogin.textContent="Iniciar sesión";
  const bLogout = document.createElement("button"); bLogout.className="btn secondary"; bLogout.textContent="Cerrar sesión"; bLogout.style.display="none";
  wrap.append(who,bLogin,bLogout); header.appendChild(wrap);

  const modal = document.createElement("div");
  modal.id = "authModal"; modal.className="modal"; modal.setAttribute("aria-hidden","true");
  modal.innerHTML = `
    <div class="modal-content" role="document" tabindex="-1">
      <button id="closeAuth" class="modal-close" aria-label="Cerrar">×</button>
      <h3>Autenticación</h3>
      <div class="tabs"><button class="btn" id="tabLogin">Ingresar</button> <button class="btn outline" id="tabReg">Crear cuenta</button></div>
      <div id="panelLogin">
        <label>Correo</label><input id="lCorreo" type="email" placeholder="correo@dominio.com"/>
        <label>Contraseña</label><input id="lPass" type="password" placeholder="••••••••"/>
        <button class="btn" id="doLogin">Entrar</button>
      </div>
      <div id="panelReg" style="display:none">
        <label>Nombre</label><input id="rNombre" type="text"/>
        <label>Cédula</label><input id="rCedula" type="text"/>
        <label>Correo</label><input id="rCorreo" type="email"/>
        <label>Contraseña</label><input id="rPass" type="password"/>
        <button class="btn" id="doReg">Registrar</button>
      </div>
      <small>🔒 Datos sensibles se guardan <b>cifrados AES‑GCM</b> en tu navegador.</small>
    </div>`;
  document.body.appendChild(modal);

  const open=()=>{ modal.style.display="block"; modal.setAttribute("aria-hidden","false"); };
  const close=()=>{ modal.style.display="none"; modal.setAttribute("aria-hidden","true"); };
  modal.addEventListener("click", e=>{ if(e.target===modal) close(); });
  byId("tabLogin").onclick=()=>{ byId("panelLogin").style.display="block"; byId("panelReg").style.display="none"; };
  byId("tabReg").onclick=()=>{ byId("panelLogin").style.display="none"; byId("panelReg").style.display="block"; };

  bLogin.onclick=open; byId("closeAuth").onclick=close;

  byId("doLogin").onclick = async ()=>{
    try{ const perfil = await login({correo: byId("lCorreo").value.trim(), password: byId("lPass").value});
      who.textContent = "Hola, " + perfil.nombre; bLogin.style.display="none"; bLogout.style.display="inline-block"; close();
    }catch(e){ alert(e.message||e); }
  };
  byId("doReg").onclick = async ()=>{
    try{ await register({ nombre: byId("rNombre").value.trim(), cedula: byId("rCedula").value.trim(), correo: byId("rCorreo").value.trim(), password: byId("rPass").value });
      alert("Cuenta creada. Ahora ingresa con tu correo y contraseña."); byId("tabLogin").click();
    }catch(e){ alert(e.message||e); }
  };
  bLogout.onclick = ()=>{ sessionStorage.removeItem("ts_auth_session_v1"); who.textContent=""; bLogin.style.display="inline-block"; bLogout.style.display="none"; };

  // Restaurar sesión si existe
  try{ const sess = JSON.parse(sessionStorage.getItem("ts_auth_session_v1")); if(sess){ who.textContent = "Hola, " + (sess.nombre||sess.correo); bLogin.style.display="none"; bLogout.style.display="inline-block"; } }catch(e){}
}
