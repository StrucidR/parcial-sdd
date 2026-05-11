# REQUIREMENTS.spec — TaskFlow AI
# Spec Driven Development — Parcial
# IA utilizada: Claude (Anthropic) — claude-sonnet-4-20250514

## DESCRIPCIÓN DEL SISTEMA
Aplicación web de gestión de tareas con planificación inteligente mediante IA.
El usuario puede registrarse, autenticarse, administrar sus tareas y solicitar
a la IA un plan de trabajo priorizado y con bloques horarios concretos.

## REQUERIMIENTOS FUNCIONALES

RF-01: El sistema debe permitir registro de usuario con nombre, correo y contraseña.
RF-02: El sistema debe validar que el correo no esté previamente registrado.
RF-03: La contraseña debe tener mínimo 6 caracteres y almacenarse cifrada (base64).
RF-04: El sistema debe permitir inicio de sesión con correo y contraseña.
RF-05: El sistema debe mantener la sesión activa mediante localStorage.
RF-06: El usuario debe poder cerrar sesión.
RF-07: El usuario puede crear tareas con: título (obligatorio), descripción,
        fecha límite (deadline), nivel de prioridad (alta/media/baja)
        y horas estimadas.
RF-08: El usuario puede marcar tareas como completadas (toggle).
RF-09: El usuario puede eliminar tareas.
RF-10: El sistema debe filtrar tareas por estado: todas, pendientes, completadas.
RF-11: El sistema debe mostrar tareas vencidas con indicador visual.
RF-12: El sistema debe conectarse a la API de Claude para generar un plan diario.
RF-13: El plan de la IA debe incluir: resumen ejecutivo, orden de prioridades
        justificado, bloques horarios concretos, alertas de deadlines y tip del día.
RF-14: El usuario puede regenerar el plan en cualquier momento.

## REQUERIMIENTOS NO FUNCIONALES

RNF-01: La interfaz debe ser responsiva y funcionar en móvil y escritorio.
RNF-02: Los datos del usuario y tareas deben persistir entre sesiones (localStorage).
RNF-03: El tiempo de respuesta de la IA no debe superar los 15 segundos.
RNF-04: El sistema debe mostrar estado de carga mientras la IA procesa.
RNF-05: La UI debe brindar retroalimentación visual de errores de autenticación.
RNF-06: El diseño debe ser oscuro, moderno y profesional.

## MODELO DE DATOS

Usuario: { id, name, email, password(hashed) }
Tarea:   { id, title, desc, deadline, priority, hours, done, createdAt }

## TECNOLOGÍAS

- Frontend: React (JSX)
- Persistencia: localStorage
- IA: Anthropic API — claude-sonnet-4-20250514
- Estilos: CSS-in-JS (inline styles + style tag)
