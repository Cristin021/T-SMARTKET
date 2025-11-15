// crypto.js — utilidades de cifrado AES‑GCM en el navegador usando Web Crypto
const enc = new TextEncoder();
const dec = new TextDecoder();
async function deriveKey(password, saltBytes){
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: saltBytes, iterations: 120000, hash: "SHA-256" },
    keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt","decrypt"]);
}
export async function cryptoEncrypt(password, plaintext){
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name:"AES-GCM", iv }, key, enc.encode(plaintext)));
  const blob = new Uint8Array(salt.length+iv.length+ct.length); blob.set(salt,0); blob.set(iv,16); blob.set(ct,28);
  return btoa(String.fromCharCode(...blob));
}
export async function cryptoDecrypt(password, b64){
  const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const salt = raw.slice(0,16), iv = raw.slice(16,28), data = raw.slice(28);
  const key = await deriveKey(password, salt);
  const plain = await crypto.subtle.decrypt({ name:"AES-GCM", iv }, key, data);
  return dec.decode(plain);
}
export async function sha256(text){
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
