// main-security.js — arranque de autenticación + app existente
import { mountAuthUI } from './auth.js';
mountAuthUI();
// Si tu app usa un init global, no interfiere. Este archivo solo añade el módulo de autenticación.
