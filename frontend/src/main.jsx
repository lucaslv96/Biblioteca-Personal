import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Server,
  UserPlus,
} from "lucide-react";

import { API_BASE_URL, createUser, getHealth } from "./api";
import "./styles.css";

const initialForm = {
  email: "",
  password: "",
  full_name: "",
};

function App() {
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState("");
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiStatus = useMemo(() => {
    if (isCheckingHealth) return "checking";
    if (healthError) return "offline";
    if (health?.status === "ok") return "online";
    return "unknown";
  }, [health, healthError, isCheckingHealth]);

  async function checkHealth() {
    setIsCheckingHealth(true);
    setHealthError("");

    try {
      const data = await getHealth();
      setHealth(data);
    } catch (error) {
      setHealth(null);
      setHealthError(error.message);
    } finally {
      setIsCheckingHealth(false);
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function submitUser(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setResult(null);

    try {
      const payload = {
        email: form.email,
        password: form.password,
        full_name: form.full_name || null,
      };
      const data = await createUser(payload);
      setResult(data);
      setForm(initialForm);
      await checkHealth();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">FastAPI + React</p>
            <h1>Biblioteca Personal</h1>
          </div>
          <div className={`status-pill status-pill--${apiStatus}`}>
            <Activity size={16} aria-hidden="true" />
            <span>{statusLabel(apiStatus)}</span>
          </div>
        </header>

        <div className="grid">
          <section className="panel panel--status" aria-labelledby="api-status-title">
            <div className="panel-header">
              <div>
                <p className="section-label">Backend</p>
                <h2 id="api-status-title">Estado de la API</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={checkHealth}
                disabled={isCheckingHealth}
                aria-label="Comprobar estado de la API"
                title="Comprobar estado"
              >
                <RefreshCw size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="api-card">
              <Server size={22} aria-hidden="true" />
              <div>
                <span className="muted">Base URL</span>
                <strong>{API_BASE_URL}</strong>
              </div>
            </div>

            {health ? (
              <div className="message message--success">
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>
                  {health.service} v{health.version} responde correctamente.
                </span>
              </div>
            ) : (
              <div className="message message--warning">
                <AlertCircle size={18} aria-hidden="true" />
                <span>{healthError || "Esperando respuesta del backend."}</span>
              </div>
            )}
          </section>

          <section className="panel" aria-labelledby="register-title">
            <div className="panel-header">
              <div>
                <p className="section-label">Usuarios</p>
                <h2 id="register-title">Registrar usuario</h2>
              </div>
            </div>

            <form className="form" onSubmit={submitUser}>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="lucas@example.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateField}
                  placeholder="Minimo 8 caracteres"
                  minLength={8}
                  maxLength={72}
                  required
                />
              </label>

              <label>
                Nombre
                <input
                  name="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={updateField}
                  placeholder="Lucas"
                  maxLength={100}
                />
              </label>

              {formError && (
                <div className="message message--error">
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                <UserPlus size={18} aria-hidden="true" />
                <span>{isSubmitting ? "Registrando..." : "Crear usuario"}</span>
              </button>
            </form>
          </section>

          <section className="panel panel--response" aria-labelledby="response-title">
            <div className="panel-header">
              <div>
                <p className="section-label">Respuesta</p>
                <h2 id="response-title">Ultimo resultado</h2>
              </div>
            </div>

            <pre className="json-output">
              {result ? JSON.stringify(result, null, 2) : "Sin respuesta todavia."}
            </pre>
          </section>
        </div>
      </section>
    </main>
  );
}

function statusLabel(status) {
  const labels = {
    checking: "Comprobando",
    offline: "Sin conexion",
    online: "API online",
    unknown: "Sin comprobar",
  };

  return labels[status];
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
