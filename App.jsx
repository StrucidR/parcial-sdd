import { useState, useEffect, useCallback } from "react";

// ── Safe Storage (localStorage con fallback en memoria) ──
const createStorage = () => {
  const mem = {};
  let hasLS = false;
  try { localStorage.setItem("_tf", "1"); localStorage.removeItem("_tf"); hasLS = true; } catch {}
  return {
    get: (k) => { try { const v = hasLS ? localStorage.getItem(k) : mem[k]; return v ? JSON.parse(v) : null; } catch { return null; } },
    set: (k, v) => { try { const s = JSON.stringify(v); hasLS ? localStorage.setItem(k, s) : (mem[k] = s); } catch {} },
    del: (k) => { try { hasLS ? localStorage.removeItem(k) : delete mem[k]; } catch {} },
  };
};
const store = createStorage();

// ── Helpers ──────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const hashPass = (s) => { try { return btoa(encodeURIComponent(s)); } catch { return s; } };
const isOverdue = (d) => d && new Date(d) < new Date(new Date().toDateString()) && !isToday(d);
const isToday = (d) => d && new Date(d).toDateString() === new Date().toDateString();
const fmtDate = (d) => { if (!d) return null; const [y, m, day] = d.split("-"); return `${day}/${m}/${y}`; };

const PRIORITY = {
  alta:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "Alta" },
  media: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "Media" },
  baja:  { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   label: "Baja" },
};

// ── Styles ───────────────────────────────────────────────
const C = {
  bg:       "#07070f",
  surface:  "#0d0d1e",
  card:     "#12122a",
  cardHov:  "#161630",
  border:   "#1e1e3f",
  borderHi: "#2e2e5f",
  accent:   "#4f7dff",
  purple:   "#7b5ff5",
  text:     "#e2e2f0",
  muted:    "#5a5a80",
  dim:      "#2a2a4a",
};

const inp = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "10px 14px", fontSize: 14, width: "100%", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" };
const btn = { background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontWeight: 600, fontFamily: "inherit", transition: "opacity 0.2s" };
const lbl = { fontSize: 11, color: C.muted, marginBottom: 6, display: "block", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" };
const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1.25rem" };

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Outfit', sans-serif; }
  input::placeholder, textarea::placeholder { color: ${C.dim}; }
  input:focus, textarea:focus, select:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px rgba(79,125,255,0.12); }
  select option { background: ${C.surface}; }
  textarea { resize: vertical; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.dim}; border-radius: 2px; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
  @media (max-width: 768px) {
    .main-grid { grid-template-columns: 1fr !important; }
    .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .form-grid { grid-template-columns: 1fr !important; }
    .ai-panel { position: static !important; }
  }
`;

// ════════════════════════════════════════════════════════
// AUTH SCREEN
// ════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    setError("");
    const users = store.get("tf_users") || [];

    if (mode === "register") {
      if (!form.name.trim()) return setError("El nombre es obligatorio.");
      if (!form.email.trim() || !form.email.includes("@")) return setError("Ingresa un correo válido.");
      if (form.password.length < 6) return setError("La contraseña debe tener mínimo 6 caracteres.");
      if (users.find((u) => u.email === form.email)) return setError("Este correo ya está registrado.");
      const newUser = { id: uid(), name: form.name.trim(), email: form.email.trim(), password: hashPass(form.password) };
      store.set("tf_users", [...users, newUser]);
      store.set("tf_uid", newUser.id);
      onLogin(newUser);
    } else {
      const found = users.find((u) => u.email === form.email && u.password === hashPass(form.password));
      if (!found) return setError("Correo o contraseña incorrectos.");
      store.set("tf_uid", found.id);
      onLogin(found);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 20% 60%, rgba(79,125,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(123,95,245,0.07) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ ...card, width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>TaskFlow AI</span>
          </div>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Planificación inteligente con Inteligencia Artificial</p>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", background: C.surface, borderRadius: 10, padding: 4, marginBottom: "1.5rem" }}>
          {["login", "register"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "9px 0", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "inherit", transition: "all 0.2s",
              background: mode === m ? C.accent : "transparent",
              color: mode === m ? "#fff" : C.muted,
            }}>
              {m === "login" ? "Iniciar sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <div>
              <label style={lbl}>Nombre completo</label>
              <input style={inp} placeholder="Tu nombre" value={form.name} onChange={set("name")} />
            </div>
          )}
          <div>
            <label style={lbl}>Correo electrónico</label>
            <input style={inp} type="email" placeholder="tu@correo.com" value={form.email} onChange={set("email")} />
          </div>
          <div>
            <label style={lbl}>Contraseña {mode === "register" && <span style={{ color: C.dim }}>(mín. 6 caracteres)</span>}</label>
            <input style={inp} type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, color: "#f87171", fontSize: 13, lineHeight: 1.5 }}>
            ⚠ {error}
          </div>
        )}

        <button onClick={submit} style={{ ...btn, width: "100%", marginTop: 20, padding: "13px", fontSize: 15, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})` }}>
          {mode === "login" ? "Entrar al panel" : "Crear mi cuenta"}
        </button>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.muted }}>
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// TASK CARD
// ════════════════════════════════════════════════════════
function TaskCard({ task, onToggle, onDelete }) {
  const overdue = isOverdue(task.deadline);
  const todayTask = isToday(task.deadline);
  const p = PRIORITY[task.priority];

  return (
    <div style={{
      background: C.card, border: `1px solid ${overdue && !task.done ? "rgba(239,68,68,0.35)" : C.border}`,
      borderRadius: 10, padding: "1rem 1.1rem", display: "flex", alignItems: "flex-start", gap: 12,
      borderLeft: `3px solid ${task.done ? C.dim : overdue ? "#ef4444" : p.color}`,
      opacity: task.done ? 0.55 : 1, transition: "opacity 0.25s, border-color 0.25s",
    }}>
      {/* Checkbox */}
      <button onClick={() => onToggle(task.id)} style={{
        width: 22, height: 22, borderRadius: "50%", border: `2px solid ${task.done ? "#22c55e" : C.borderHi}`,
        background: task.done ? "#22c55e" : "transparent", cursor: "pointer", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, marginTop: 2,
      }}>
        {task.done && "✓"}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 500, fontSize: 15, textDecoration: task.done ? "line-through" : "none", color: task.done ? C.muted : C.text }}>
            {task.title}
          </span>
          {overdue && !task.done && (
            <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "2px 7px", borderRadius: 4, border: "1px solid rgba(239,68,68,0.3)", letterSpacing: "0.05em" }}>
              VENCIDA
            </span>
          )}
          {todayTask && !task.done && (
            <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(245,158,11,0.15)", color: "#fbbf24", padding: "2px 7px", borderRadius: 4, border: "1px solid rgba(245,158,11,0.3)", letterSpacing: "0.05em" }}>
              HOY
            </span>
          )}
        </div>
        {task.desc && <div style={{ fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{task.desc}</div>}
        <div style={{ display: "flex", gap: 14, marginTop: 7, flexWrap: "wrap" }}>
          {task.deadline && (
            <span style={{ fontSize: 12, color: overdue && !task.done ? "#f87171" : C.muted }}>
              📅 {fmtDate(task.deadline)}
            </span>
          )}
          {task.hours && <span style={{ fontSize: 12, color: C.muted }}>⏱ {task.hours}h estimadas</span>}
          <span style={{ fontSize: 12, color: p.color, fontWeight: 500 }}>● {p.label}</span>
        </div>
      </div>

      {/* Delete */}
      <button onClick={() => onDelete(task.id)} title="Eliminar" style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 16, padding: "2px", lineHeight: 1, flexShrink: 0, transition: "color 0.2s" }}
        onMouseEnter={(e) => (e.target.style.color = "#f87171")}
        onMouseLeave={(e) => (e.target.style.color = C.dim)}>✕</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// AI PLAN VIEW
// ════════════════════════════════════════════════════════
function AIPlanView({ plan }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Resumen */}
      <div style={{ background: "rgba(79,125,255,0.08)", border: "1px solid rgba(79,125,255,0.2)", borderRadius: 8, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>📋 Resumen ejecutivo</div>
        <div style={{ fontSize: 13, color: "#b0b8f0", lineHeight: 1.65 }}>{plan.resumen}</div>
      </div>

      {/* Prioridades */}
      {plan.prioridades?.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>🎯 Orden de prioridades</div>
          {plan.prioridades.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: `rgba(79,125,255,0.15)`, color: C.accent, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.tarea}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{p.justificacion}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bloques horarios */}
      {plan.bloques?.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>🕐 Bloques horarios</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {plan.bloques.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "7px 10px", background: C.surface, borderRadius: 7, borderLeft: `2px solid ${C.purple}` }}>
                <span style={{ fontSize: 12, color: C.purple, fontWeight: 700, minWidth: 50, flexShrink: 0, fontFamily: "monospace" }}>{b.hora}</span>
                <span style={{ fontSize: 13, color: "#c4c8e8", lineHeight: 1.45 }}>{b.actividad}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertas */}
      {plan.alertas?.length > 0 && (
        <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, color: "#f87171", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>⚠ Alertas de deadline</div>
          {plan.alertas.map((a, i) => (
            <div key={i} style={{ fontSize: 13, color: "#fca5a5", marginBottom: 5, lineHeight: 1.45 }}>• {a}</div>
          ))}
        </div>
      )}

      {/* Tip */}
      {plan.tip && (
        <div style={{ background: "rgba(123,95,245,0.08)", border: "1px solid rgba(123,95,245,0.2)", borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>💡 Tip del día</div>
          <div style={{ fontSize: 13, color: "#c4b5fd", lineHeight: 1.6 }}>{plan.tip}</div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════
function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState(() => store.get(`tf_tasks_${user.id}`) || []);
  const [filter, setFilter] = useState("todas");
  const [showForm, setShowForm] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [formErr, setFormErr] = useState("");
  const [form, setForm] = useState({ title: "", desc: "", deadline: "", priority: "media", hours: "" });

  const persistTasks = (t) => { store.set(`tf_tasks_${user.id}`, t); setTasks(t); };
  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addTask = () => {
    setFormErr("");
    if (!form.title.trim()) return setFormErr("El título es obligatorio.");
    const task = { id: uid(), title: form.title.trim(), desc: form.desc.trim(), deadline: form.deadline, priority: form.priority, hours: form.hours, done: false, createdAt: new Date().toISOString() };
    persistTasks([...tasks, task]);
    setForm({ title: "", desc: "", deadline: "", priority: "media", hours: "" });
    setShowForm(false);
  };

  const toggleTask = (id) => persistTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id) => persistTasks(tasks.filter((t) => t.id !== id));

  const filtered = tasks.filter((t) => {
    if (filter === "pendientes") return !t.done;
    if (filter === "completadas") return t.done;
    return true;
  });

  const pending = tasks.filter((t) => !t.done);
  const done    = tasks.filter((t) => t.done);
  const overdue = tasks.filter((t) => !t.done && isOverdue(t.deadline));

  const generatePlan = async () => {
    if (pending.length === 0) return;
    setAiLoading(true);
    setAiError("");
    try {
      const taskList = pending.map((t) =>
        `- "${t.title}"${t.desc ? ` (${t.desc})` : ""}${t.deadline ? ` | Deadline: ${t.deadline}` : ""}${t.hours ? ` | Horas estimadas: ${t.hours}h` : ""} | Prioridad: ${t.priority}`
      ).join("\n");

      const prompt = `Eres un experto en productividad y gestión del tiempo. El usuario tiene las siguientes tareas pendientes:

${taskList}

Genera un plan de trabajo diario estructurado y responde ÚNICAMENTE con un JSON válido (sin backticks, sin texto adicional) con esta estructura exacta:
{
  "resumen": "resumen ejecutivo en 2-3 líneas sobre el día de trabajo",
  "prioridades": [{"tarea": "nombre exacto de la tarea", "justificacion": "razón concisa de por qué va primero"}],
  "bloques": [{"hora": "HH:MM", "actividad": "descripción concreta de la actividad y cuánto tiempo dura"}],
  "alertas": ["alerta sobre deadline próximo o vencido"],
  "tip": "un consejo de productividad personalizado para este conjunto de tareas"
}`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.map((b) => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setAiPlan(JSON.parse(clean));
    } catch (err) {
      setAiError("Error al generar el plan. Verifica tu conexión e inténtalo de nuevo.");
    } finally {
      setAiLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Outfit', sans-serif" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Header */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚡</div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.025em" }}>TaskFlow AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: C.muted, fontSize: 14 }}>
            Hola, <span style={{ color: C.text, fontWeight: 500 }}>{user.name}</span>
          </span>
          <button onClick={onLogout} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontFamily: "inherit", transition: "border-color 0.2s, color 0.2s" }}
            onMouseEnter={(e) => { e.target.style.borderColor = C.borderHi; e.target.style.color = C.text; }}
            onMouseLeave={(e) => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Date banner */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", textTransform: "capitalize" }}>{today}</h1>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 3 }}>Tienes {pending.length} tarea{pending.length !== 1 ? "s" : ""} pendiente{pending.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 370px", gap: "1.75rem", alignItems: "start" }}>

          {/* ─ LEFT: Tasks ─ */}
          <div>
            {/* Stats */}
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: "1.5rem" }}>
              {[
                { label: "Pendientes", val: pending.length, color: C.accent },
                { label: "Completadas", val: done.length,    color: "#22c55e" },
                { label: "Vencidas",   val: overdue.length,  color: "#ef4444" },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ ...card, padding: "1rem", textAlign: "center" }}>
                  <div style={{ fontSize: 30, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 5 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", gap: 6, background: C.surface, borderRadius: 10, padding: 4 }}>
                {["todas", "pendientes", "completadas"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit", transition: "all 0.2s",
                    background: filter === f ? C.accent : "transparent",
                    color: filter === f ? "#fff" : C.muted,
                  }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <button onClick={() => { setShowForm((v) => !v); setFormErr(""); }} style={{
                ...btn, padding: "8px 16px", fontSize: 13,
                background: showForm ? "transparent" : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                border: showForm ? `1px solid ${C.border}` : "none",
                color: showForm ? C.muted : "#fff",
              }}>
                {showForm ? "✕ Cancelar" : "+ Nueva tarea"}
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <div style={{ ...card, marginBottom: "1rem", border: `1px solid rgba(79,125,255,0.3)` }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: "1rem", color: C.accent }}>Agregar nueva tarea</div>
                <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={lbl}>Título *</label>
                    <input style={inp} placeholder="¿Qué necesitas hacer?" value={form.title} onChange={setF("title")} onKeyDown={(e) => e.key === "Enter" && addTask()} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={lbl}>Descripción</label>
                    <textarea style={{ ...inp, minHeight: 64 }} placeholder="Detalles opcionales..." value={form.desc} onChange={setF("desc")} />
                  </div>
                  <div>
                    <label style={lbl}>Fecha límite</label>
                    <input style={{ ...inp, colorScheme: "dark" }} type="date" value={form.deadline} onChange={setF("deadline")} />
                  </div>
                  <div>
                    <label style={lbl}>Horas estimadas</label>
                    <input style={inp} type="number" placeholder="ej. 2.5" min="0.5" step="0.5" value={form.hours} onChange={setF("hours")} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={lbl}>Prioridad</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {Object.entries(PRIORITY).map(([key, val]) => (
                        <button key={key} onClick={() => setForm((f) => ({ ...f, priority: key }))} style={{
                          flex: 1, padding: "9px 0", border: `1px solid ${form.priority === key ? val.color : C.border}`,
                          borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                          background: form.priority === key ? val.bg : "transparent",
                          color: form.priority === key ? val.color : C.muted, transition: "all 0.2s",
                        }}>
                          ● {val.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {formErr && <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7, color: "#f87171", fontSize: 13 }}>⚠ {formErr}</div>}
                <button onClick={addTask} style={{ ...btn, marginTop: 14, width: "100%", background: `linear-gradient(135deg, ${C.accent}, ${C.purple})` }}>
                  Agregar tarea
                </button>
              </div>
            )}

            {/* Task list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: C.dim }}>
                  <div style={{ fontSize: 42, marginBottom: 10 }}>📋</div>
                  <div style={{ fontSize: 15, marginBottom: 4 }}>No hay tareas aquí</div>
                  <div style={{ fontSize: 13, color: C.muted }}>
                    {filter === "todas" ? "Agrega tu primera tarea" : `Sin tareas ${filter}`}
                  </div>
                </div>
              ) : (
                filtered
                  .sort((a, b) => {
                    if (a.done !== b.done) return a.done ? 1 : -1;
                    const po = { alta: 0, media: 1, baja: 2 };
                    return (po[a.priority] || 1) - (po[b.priority] || 1);
                  })
                  .map((task) => (
                    <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  ))
              )}
            </div>
          </div>

          {/* ─ RIGHT: AI Plan ─ */}
          <div className="ai-panel" style={{ position: "sticky", top: "5rem" }}>
            <div style={card}>
              {/* AI Panel header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Plan IA del día</h2>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Powered by Claude AI</p>
                </div>
                <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${C.purple}, ${C.accent})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
              </div>

              {/* Generate button */}
              <button
                onClick={generatePlan}
                disabled={aiLoading || pending.length === 0}
                style={{
                  ...btn, width: "100%", marginBottom: "1rem", padding: "11px",
                  background: aiLoading ? C.surface : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                  border: aiLoading ? `1px solid ${C.border}` : "none",
                  color: aiLoading ? C.muted : "#fff",
                  opacity: pending.length === 0 ? 0.5 : 1,
                  cursor: pending.length === 0 ? "not-allowed" : "pointer",
                  fontSize: 14,
                }}
              >
                {aiLoading ? "⏳  Generando plan..." : aiPlan ? "🔄  Regenerar plan" : "✨  Generar plan de trabajo"}
              </button>

              {/* AI Loading bar */}
              {aiLoading && (
                <div style={{ background: C.surface, borderRadius: 4, height: 3, marginBottom: 12, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.accent}, ${C.purple})`, animation: "loading 1.5s ease-in-out infinite", width: "60%" }} />
                  <style>{`@keyframes loading { 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }`}</style>
                </div>
              )}

              {/* Error */}
              {aiError && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: "#f87171", fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
                  ⚠ {aiError}
                </div>
              )}

              {/* Empty state */}
              {!aiPlan && !aiLoading && pending.length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem 1rem", color: C.muted, fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                  Agrega tareas pendientes para que la IA genere tu plan de trabajo personalizado.
                </div>
              )}

              {!aiPlan && !aiLoading && pending.length > 0 && (
                <div style={{ textAlign: "center", padding: "1.5rem 1rem", color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
                  Tienes {pending.length} tarea{pending.length !== 1 ? "s" : ""} pendiente{pending.length !== 1 ? "s" : ""}.<br />
                  Genera un plan de trabajo inteligente con IA.
                </div>
              )}

              {/* Plan */}
              {aiPlan && <AIPlanView plan={aiPlan} />}
            </div>

            {/* Info note */}
            <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(79,125,255,0.05)", border: `1px solid rgba(79,125,255,0.12)`, borderRadius: 8, fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
              💾 Los datos persisten en <strong>localStorage</strong>. Para máxima persistencia entre sesiones, ejecuta la app localmente.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const uid = store.get("tf_uid");
    if (uid) {
      const users = store.get("tf_users") || [];
      const found = users.find((u) => u.id === uid);
      if (found) setUser(found);
    }
    setReady(true);
  }, []);

  const handleLogin  = (u) => setUser(u);
  const handleLogout = () => { store.del("tf_uid"); setUser(null); };

  if (!ready) return (
    <div style={{ minHeight: "100vh", background: "#07070f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#4f7dff", fontSize: 14 }}>
      Cargando TaskFlow AI...
    </div>
  );

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <AuthScreen onLogin={handleLogin} />;
}
