# 🛡️ Plan Formal de Respuesta a Incidentes — T-SMARTKET

Este documento define el proceso oficial para **detectar, analizar, contener, erradicar y recuperar** ante incidentes de ciberseguridad que puedan afectar los activos, usuarios, datos y servicios de T-SMARTKET.

Un incidente es cualquier evento que comprometa o intente comprometer:
- La **confidencialidad**, **integridad** o **disponibilidad** de la información.
- La **operación** continua del marketplace.
- La **experiencia** o **seguridad** de los usuarios.

---

# 1. 🎯 Objetivos del Proceso
- Detectar amenazas **de forma temprana**.
- Minimizar daño, interrupciones y pérdida de datos.
- Establecer un proceso **rápido, ordenado y repetible**.
- Documentar cada incidente para análisis y mejora continua.
- Cumplir con buenas prácticas internacionales (NIST, ISO27035).

---

# 2. 📌 Roles y Responsabilidades

| Rol | Funciones principales |
|-----|------------------------|
| **Responsable de Seguridad** | Coordina el proceso, clasifica el incidente, decide contención y escalamiento. |
| **Equipo Técnico / Desarrollo** | Analiza causa raíz, aplica parches, corrige vulnerabilidades. |
| **Equipo de Infraestructura** | Aísla servicios, ajusta firewall/WAF, restaura servidores. |
| **Equipo de Comunicaciones** | Informa a usuarios/autoridades en incidentes de alto impacto. |
| **Dueño del Producto** | Autoriza acciones mayores y valida recuperación operativa. |

---

# 3. 🧭 Flujo Completo de Respuesta a Incidentes

## 3.1. **Preparación**
Antes de que ocurra un incidente:
- Implementación de **WAF/Firewall**, CDN y monitoreo.
- Respaldos verificables (backup) diarios.
- Autenticación fuerte en servicios internos (MFA).
- Registro centralizado de eventos (logs).
- Simulacros periódicos (phishing, malware, DDoS).
- Definición de canales de emergencia y escalamiento.

---

## 3.2. **Identificación / Detección**
El equipo debe identificar **señales de alerta** como:

### ✔ Malware / Secuestro (Ransomware)
- Archivos cifrados de forma repentina.
- Procesos desconocidos consumiendo CPU.
- Alertas del antivirus/EDR.

### ✔ Phishing
- Reporte de usuarios sobre correos fraudulentos.
- Intentos masivos de autenticación fallida.
- Dominios falsos suplantando T-SMARTKET.

### ✔ Denegación de Servicio (DDoS)
- Picos anormales de tráfico.
- Caída de servicios o aumento drástico de latencia.
- Alertas del proveedor de CDN/WAF.

### ✔ Cross Site Scripting (XSS)
- Comportamiento inesperado del sitio.
- Inyección de scripts en campos de entrada.
- Alertas del WAF por payloads maliciosos.

### ✔ Secuestro de Sesión / Ataques de Fuerza Bruta
- Múltiples intentos de login desde una misma IP.
- Tokens alterados o repetidos.
- Actividades no autorizadas en cuentas.

Cuando una señal es detectada:
1. Registrar fecha y hora.  
2. Abrir ticket con código **IR-YYYY-MM-DD-XX**.  
3. Clasificar severidad (Baja / Media / Alta / Crítica).  
4. Notificar al equipo de seguridad.

---

## 3.3. **Contención**
La contención evita que el incidente se expanda.

### 🟡 Contención a corto plazo (inmediata)
- Desconectar equipo o servidor comprometido.
- Bloquear IPs o direcciones asociadas al ataque.
- Activar el modo **"Under Attack"** del WAF/CDN.
- Revocar tokens activos o sesiones sospechosas.
- Deshabilitar cuentas comprometidas temporalmente.

### 🔵 Contención a largo plazo
- Aplicar parches de seguridad.
- Cambiar credenciales expuestas.
- Actualizar firewall/WAF con nuevas reglas.
- Aislar entornos vulnerables (staging, pruebas, contenedores).

---

## 3.4. **Erradicación**
Proceso para **limpiar completamente** la amenaza.

### Para Malware / Ransomware
- Eliminar archivos y procesos maliciosos.
- Verificar integridad de binarios.
- Realizar análisis de malware en entorno controlado.
- Revisar que no existan puertas traseras.

### Para Phishing
- Bloquear dominios maliciosos.
- Invalidar contraseñas y sesiones afectadas.
- Capacitar al usuario comprometido.

### Para XSS
- Limpiar campos vulnerables.
- Aplicar sanitización estricta de entrada.
- Asegurar escape de salida en todas las vistas.
- Revisar permisos indebidos en API.

### Para ataques de sesión
- Rotar claves JWT o cookies.
- Forzar logout global.
- Implementar rate-limit y captchas si aplica.

---

## 3.5. **Recuperación**
Volver el sistema a estado normal:

- Restaurar archivos y datos desde **backups validados**.
- Desplegar versiones corregidas del sistema.
- Verificar que el servicio opere de forma estable.
- Mantener monitoreo reforzado al menos 72 horas.
- Validar que no existan reinfecciones o actividad sospechosa.

---

## 3.6. **Lecciones Aprendidas**
Dentro de los 3–5 días posteriores:

- Documentar causa raíz (Root Cause Analysis).
- Registrar líneas de tiempo del incidente.
- Identificar qué se hizo bien y qué se debe mejorar.
- Actualizar políticas y configuraciones.
- Implementar acciones preventivas adicionales:
  - Mejoras de arquitectura.
  - Nuevos controles de seguridad.
  - Automatización de alertas.

---

# 4. 🧨 Runbooks por tipo de ataque

## 🦠 **Malware / Ransomware**
1. Aislar host.
2. Interrumpir propagación.
3. Evaluar alcance del cifrado.
4. Recuperar desde backups.
5. Reinstalar sistema limpio si es necesario.

## 🎣 **Phishing**
1. Bloquear dominio URL.
2. Restablecer contraseñas.
3. Verificar accesos temporales.
4. Analizar correo fuente.
5. Educar usuarios afectados.

## 🌪 **Ataques DDoS**
1. Activar protección en CDN/WAF.
2. Habilitar rate-limit.
3. Validar integridad de los servicios.
4. Monitorear tráfico por 24–48h.

## 🔥 **Cross-Site Scripting (XSS)**
1. Revisar parámetros vulnerables.
2. Parchear sanitización/escape de salida.
3. Limpiar contenido inyectado.
4. Activar CSP estricta (`script-src 'self'`).
5. Revisar logs de actividad maliciosa.

---

# 5. ✔ Checklist de Seguridad Posterior
- ¿Se informó a todas las áreas afectadas?
- ¿Se protegieron evidencias?
- ¿El incidente está completamente cerrado?
- ¿Se aplicaron los parches o correcciones?
- ¿Se actualizaron políticas y documentación?
- ¿Se revisaron logs posteriores al incidente?

---

# 6. 📑 Conclusión
Este plan establece un procedimiento claro, ordenado y profesional para responder eficazmente a cualquier incidente de seguridad que afecte a T-SMARTKET, garantizando la continuidad del servicio y la protección de los usuarios.

---

