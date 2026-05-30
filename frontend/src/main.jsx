import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  KeyRound,
  Library,
  LogOut,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import {
  createBook,
  createUser,
  deleteBook,
  listBooks,
  loginUser,
  updateBook,
} from "./api";
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

const initialBookForm = {
  title: "",
  author: "",
  publication_year: "",
  description: "",
  is_read: false,
};

function App() {
  const storedUser = getStoredUser();
  const [view, setView] = useState(storedUser ? "home" : "login");
  const [currentUser, setCurrentUser] = useState(storedUser);
  const [authToken, setAuthToken] = useState(getStoredToken());
  const [loginPrefillEmail, setLoginPrefillEmail] = useState("");

  function openLogin(email = "") {
    setLoginPrefillEmail(email);
    setView("login");
  }

  function handleLoginSuccess(authData) {
    sessionStorage.setItem("authToken", authData.access_token);
    sessionStorage.setItem("authUser", JSON.stringify(authData.user));
    setAuthToken(authData.access_token);
    setCurrentUser(authData.user);
    setView("home");
  }

  function logout() {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    setAuthToken(null);
    setCurrentUser(null);
    setView("login");
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div className="brand-lockup">
            <p className="eyebrow">Mi biblioteca</p>
            <h1>Biblioteca Personal</h1>
          </div>

          {currentUser && (
            <div className="user-chip">
              <Library size={14} aria-hidden="true" />
              <span>{currentUser.full_name || currentUser.email}</span>
            </div>
          )}
        </header>

        {view === "home" ? (
          <HomeView currentUser={currentUser} authToken={authToken} onLogout={logout} />
        ) : (
          <AuthLayout>
            {view === "login" && (
              <LoginView
                initialEmail={loginPrefillEmail}
                onLoginSuccess={handleLoginSuccess}
                onOpenRegister={() => setView("register")}
                onOpenForgotPassword={() => setView("forgot-password")}
              />
            )}
            {view === "register" && <RegisterView onBackToLogin={openLogin} />}
            {view === "forgot-password" && (
              <ForgotPasswordView onBackToLogin={() => setView("login")} />
            )}
          </AuthLayout>
        )}
      </section>
    </main>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <aside className="intro-panel">
        <p className="eyebrow">Lecturas organizadas</p>
        <h2>Todos tus libros en un solo lugar.</h2>
        <p className="intro-copy">
          Guarda tus lecturas, marca avances y encuentra rapidamente el proximo
          libro que quieres leer.
        </p>

        <ul className="feature-list">
          <li>
            <BookOpen size={16} aria-hidden="true" />
            <span>Biblioteca privada</span>
          </li>
          <li>
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>Leidos y pendientes</span>
          </li>
          <li>
            <Sparkles size={16} aria-hidden="true" />
            <span>Notas personales</span>
          </li>
        </ul>
      </aside>

      <section className="auth-card">{children}</section>
    </div>
  );
}

function LoginView({
  initialEmail,
  onLoginSuccess,
  onOpenForgotPassword,
  onOpenRegister,
}) {
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
        <p className="panel-copy">
          Accede a tus libros guardados y manten tu biblioteca al dia.
        </p>
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
        <p className="panel-copy">Alta rapida para nuevos lectores.</p>
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
    setMessage(
      "Si el email existe, recibiras instrucciones para recuperar el acceso.",
    );
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
        <p className="panel-copy">
          Introduce tu email y te enviaremos instrucciones para recuperar el
          acceso.
        </p>
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

function HomeView({ currentUser, authToken, onLogout }) {
  const [books, setBooks] = useState([]);
  const [bookForm, setBookForm] = useState(initialBookForm);
  const [editingBookId, setEditingBookId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadBooks() {
      if (!authToken) return;

      setIsLoading(true);
      setError("");

      try {
        const data = await listBooks(authToken);
        setBooks(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadBooks();
  }, [authToken]);

  function updateBookField(event) {
    const { checked, name, type, value } = event.target;
    setBookForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetBookForm() {
    setBookForm(initialBookForm);
    setEditingBookId(null);
  }

  function startEdit(book) {
    setBookForm({
      title: book.title,
      author: book.author ?? "",
      publication_year: book.publication_year ? String(book.publication_year) : "",
      description: book.description ?? "",
      is_read: book.is_read,
    });
    setEditingBookId(book.id);
  }

  async function submitBook(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const payload = toBookPayload(bookForm);
      const savedBook = editingBookId
        ? await updateBook(authToken, editingBookId, payload)
        : await createBook(authToken, payload);

      setBooks((currentBooks) => {
        if (!editingBookId) return [savedBook, ...currentBooks];
        return currentBooks.map((book) => (book.id === savedBook.id ? savedBook : book));
      });
      resetBookForm();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleRead(book) {
    setError("");
    try {
      const updatedBook = await updateBook(authToken, book.id, {
        is_read: !book.is_read,
      });
      setBooks((currentBooks) =>
        currentBooks.map((currentBook) =>
          currentBook.id === updatedBook.id ? updatedBook : currentBook,
        ),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function removeBook(bookId) {
    setError("");
    try {
      await deleteBook(authToken, bookId);
      setBooks((currentBooks) => currentBooks.filter((book) => book.id !== bookId));
      if (editingBookId === bookId) resetBookForm();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="home-panel">
      <div className="home-header">
        <div>
          <p className="section-label">Principal</p>
          <h2>Mi biblioteca</h2>
        </div>
        <button
          className="secondary-button secondary-button--compact"
          type="button"
          onClick={onLogout}
        >
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

      <div className="library-grid">
        <form className="book-form" onSubmit={submitBook}>
          <div className="panel-heading">
            <p className="section-label">Libro</p>
            <h2>{editingBookId ? "Editar libro" : "Nuevo libro"}</h2>
          </div>

          <label>
            Titulo
            <input
              name="title"
              type="text"
              value={bookForm.title}
              onChange={updateBookField}
              placeholder="Clean Code"
              maxLength={200}
              required
            />
          </label>

          <label>
            Autor
            <input
              name="author"
              type="text"
              value={bookForm.author}
              onChange={updateBookField}
              placeholder="Robert C. Martin"
              maxLength={150}
            />
          </label>

          <label>
            Ano
            <input
              name="publication_year"
              type="number"
              value={bookForm.publication_year}
              onChange={updateBookField}
              placeholder="2008"
              min="0"
              max="3000"
            />
          </label>

          <label>
            Notas
            <textarea
              name="description"
              value={bookForm.description}
              onChange={updateBookField}
              placeholder="Notas personales sobre el libro"
              maxLength={1000}
            />
          </label>

          <label className="checkbox-row">
            <input
              name="is_read"
              type="checkbox"
              checked={bookForm.is_read}
              onChange={updateBookField}
            />
            <span>Leido</span>
          </label>

          {error && (
            <div className="message message--error">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="book-form-actions">
            <button className="primary-button" type="submit" disabled={isSaving}>
              {editingBookId ? <Save size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
              <span>{isSaving ? "Guardando..." : editingBookId ? "Guardar" : "Anadir"}</span>
            </button>
            {editingBookId && (
              <button className="secondary-button" type="button" onClick={resetBookForm}>
                <X size={17} aria-hidden="true" />
                <span>Cancelar</span>
              </button>
            )}
          </div>
        </form>

        <section className="book-list-section" aria-labelledby="book-list-title">
          <div className="book-list-header">
            <div>
              <p className="section-label">Catalogo</p>
              <h2 id="book-list-title">{books.length} libros</h2>
            </div>
          </div>

          {isLoading ? (
            <div className="empty-state">Cargando biblioteca...</div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={24} aria-hidden="true" />
              <span>Aun no hay libros.</span>
            </div>
          ) : (
            <div className="book-list">
              {books.map((book) => (
                <article className="book-item" key={book.id}>
                  <div>
                    <div className="book-title-row">
                      <h3>{book.title}</h3>
                      <span className={`read-badge ${book.is_read ? "read-badge--done" : ""}`}>
                        {book.is_read ? "Leido" : "Pendiente"}
                      </span>
                    </div>
                    <p className="book-meta">
                      {[book.author, book.publication_year].filter(Boolean).join(" - ") || "Sin autor"}
                    </p>
                    {book.description && <p className="book-description">{book.description}</p>}
                  </div>

                  <div className="book-actions">
                    <button type="button" title="Cambiar estado" onClick={() => toggleRead(book)}>
                      <CheckCircle2 size={17} aria-hidden="true" />
                    </button>
                    <button type="button" title="Editar" onClick={() => startEdit(book)}>
                      <Pencil size={17} aria-hidden="true" />
                    </button>
                    <button type="button" title="Eliminar" onClick={() => removeBook(book.id)}>
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function toBookPayload(bookForm) {
  return {
    title: bookForm.title.trim(),
    author: bookForm.author.trim() || null,
    publication_year: bookForm.publication_year
      ? Number(bookForm.publication_year)
      : null,
    description: bookForm.description.trim() || null,
    is_read: bookForm.is_read,
  };
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

function getStoredToken() {
  return sessionStorage.getItem("authToken");
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
