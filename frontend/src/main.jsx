import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  KeyRound,
  Library,
  LogOut,
  RefreshCw,
  Server,
  UserPlus,
} from "lucide-react";

import { API_BASE_URL, createUser, getHealth, loginUser } from "./api";
import "./styles.css";

const initialLoginForm = {
  email: "",
  password: "",
};

const initialRegisterForm = {
  email: "",
  password: "",
  full_name: "",
};

function App() {
  const storedUser = getStoredUser();
  const [view, setView] = useState(storedUser ? "home" : "login");
  const [currentUser, setCurrentUser] = useState(storedUser);
  const [loginPrefillEmail, setLoginPrefillEmail] = useState("");
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState("");
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

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

  function openLogin(email = "") {
    setLoginPrefillEmail(email);
    setView("login");
  }

  function handleLoginSuccess(authData) {
    sessionStorage.setItem("authToken", authData.access_token);
    sessionStorage.setItem("authUser", JSON.stringify(authData.user));
    setCurrentUser(authData.user);
    setView("home");
  }

  function logout() {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    setCurrentUser(null);
    setView("login");
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

        {view === "home" ? (
          <HomeView
            apiStatus={apiStatus}
            currentUser={currentUser}
            health={health}
            healthError={healthError}
            isCheckingHealth={isCheckingHealth}
            onCheckHealth={checkHealth}
            onLogout={logout}
          />
        ) : (
          <AuthLayout
            apiStatus={apiStatus}
            health={health}
            healthError={healthError}
            isCheckingHealth={isCheckingHealth}
            onCheckHealth={checkHealth}
          >
            {view === "login" && (
              <LoginView
                initialEmail={loginPrefillEmail}
                onLoginSuccess={handleLoginSuccess}
                onOpenRegister={() => setView("register")}
                onOpenForgotPassword={() => setView("forgot-password")}
              />
            )}
            {view === "register" && (
              <RegisterView
                onBackToLogin={openLogin}
              />
            )}
            {view === "forgot-password" && (
              <ForgotPasswordView onBackToLogin={() => setView("login")} />
            )}
          </AuthLayout>
        )}
      </section>
    </main>
  );
}

function AuthLayout({
  apiStatus,
  children,
  health,
  healthError,
  isCheckingHealth,
  onCheckHealth,
}) {
  return (
    <div className="auth-grid">
      <section className="auth-panel">{children}</section>
      <ApiStatusPanel
        apiStatus={apiStatus}
        health={health}
        healthError={healthError}
        isCheckingHealth={isCheckingHealth}
        onCheckHealth={onCheckHealth}
      />
    </div>
  );
}

function LoginView({ initialEmail, onLoginSuccess, onOpenForgotPassword, onOpenRegister }) {
  const [form, setForm] = useState(initialLoginForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setForm((currentForm) => ({ ...currentForm, email: initialEmail }));
    }
  }, [initialEmail]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function submitLogin(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const authData = await loginUser(form);
      onLoginSuccess(authData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="panel-heading">
        <p className="section-label">Acceso</p>
        <h2>Iniciar sesion</h2>
      </div>

      <form className="form" onSubmit={submitLogin}>
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

        {error && (
          <div className="message message--error">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          <KeyRound size={18} aria-hidden="true" />
          <span>{isSubmitting ? "Entrando..." : "Entrar"}</span>
        </button>
      </form>

      <div className="auth-actions">
        <button className="secondary-button" type="button" onClick={onOpenRegister}>
          <UserPlus size={17} aria-hidden="true" />
          <span>Crear cuenta</span>
        </button>
        <button className="ghost-button" type="button" onClick={onOpenForgotPassword}>
          Olvide mi contrasena
        </button>
      </div>
    </>
  );
}

function RegisterView({ onBackToLogin }) {
  const [form, setForm] = useState(initialRegisterForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdEmail, setCreatedEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function submitRegister(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const user = await createUser({
        email: form.email,
        password: form.password,
        full_name: form.full_name || null,
      });
      setSuccess(`Cuenta creada para ${user.email}.`);
      setCreatedEmail(user.email);
      setForm(initialRegisterForm);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button className="back-button" type="button" onClick={() => onBackToLogin()}>
        <ArrowLeft size={17} aria-hidden="true" />
        <span>Volver</span>
      </button>

      <div className="panel-heading">
        <p className="section-label">Usuarios</p>
        <h2>Crear cuenta</h2>
      </div>

      <form className="form" onSubmit={submitRegister}>
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

        {error && (
          <div className="message message--error">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="message message--success">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{success}</span>
          </div>
        )}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          <UserPlus size={18} aria-hidden="true" />
          <span>{isSubmitting ? "Creando..." : "Crear cuenta"}</span>
        </button>

        {success && (
          <button
            className="secondary-button"
            type="button"
            onClick={() => onBackToLogin(createdEmail)}
          >
            <KeyRound size={17} aria-hidden="true" />
            <span>Iniciar sesion</span>
          </button>
        )}
      </form>
    </>
  );
}

function ForgotPasswordView({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submitForgotPassword(event) {
    event.preventDefault();
    setMessage("Recuperacion pendiente de backend.");
  }

  return (
    <>
      <button className="back-button" type="button" onClick={onBackToLogin}>
        <ArrowLeft size={17} aria-hidden="true" />
        <span>Volver</span>
      </button>

      <div className="panel-heading">
        <p className="section-label">Acceso</p>
        <h2>Olvide mi contrasena</h2>
      </div>

      <form className="form" onSubmit={submitForgotPassword}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="lucas@example.com"
            required
          />
        </label>

        {message && (
          <div className="message message--warning">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}

        <button className="primary-button" type="submit">
          <KeyRound size={18} aria-hidden="true" />
          <span>Continuar</span>
        </button>
      </form>
    </>
  );
}

function HomeView({
  apiStatus,
  currentUser,
  health,
  healthError,
  isCheckingHealth,
  onCheckHealth,
  onLogout,
}) {
  return (
    <div className="home-grid">
      <section className="main-panel">
        <div className="home-header">
          <div>
            <p className="section-label">Principal</p>
            <h2>Mi biblioteca</h2>
          </div>
          <button className="secondary-button secondary-button--compact" type="button" onClick={onLogout}>
            <LogOut size={17} aria-hidden="true" />
            <span>Salir</span>
          </button>
        </div>

        <div className="welcome-band">
          <Library size={30} aria-hidden="true" />
          <div>
            <span className="muted">Sesion iniciada</span>
            <strong>{currentUser?.full_name || currentUser?.email}</strong>
          </div>
        </div>

        <div className="summary-grid">
          <article className="summary-card">
            <BookOpen size={22} aria-hidden="true" />
            <div>
              <span className="summary-value">0</span>
              <span className="muted">Libros registrados</span>
            </div>
          </article>
          <article className="summary-card">
            <CheckCircle2 size={22} aria-hidden="true" />
            <div>
              <span className="summary-value">JWT</span>
              <span className="muted">Autenticacion activa</span>
            </div>
          </article>
        </div>

        <div className="message message--warning">
          <AlertCircle size={18} aria-hidden="true" />
          <span>El CRUD de libros sera el siguiente modulo.</span>
        </div>
      </section>

      <ApiStatusPanel
        apiStatus={apiStatus}
        health={health}
        healthError={healthError}
        isCheckingHealth={isCheckingHealth}
        onCheckHealth={onCheckHealth}
      />
    </div>
  );
}

function ApiStatusPanel({
  health,
  healthError,
  isCheckingHealth,
  onCheckHealth,
}) {
  return (
    <section className="side-panel" aria-labelledby="api-status-title">
      <div className="panel-header">
        <div>
          <p className="section-label">Backend</p>
          <h2 id="api-status-title">Estado de la API</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={onCheckHealth}
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
  );
}

function getStoredUser() {
  const user = sessionStorage.getItem("authUser");
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    return null;
  }
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
