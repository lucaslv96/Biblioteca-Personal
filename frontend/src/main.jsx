import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Alert,
  Box,
  Button,
  Chip,
  CssBaseline,
  Dialog,
  DialogContent,
  Drawer,
  Fab,
  FormControlLabel,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Barcode,
  Bell,
  BookMarked,
  BookOpen,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Edit3,
  Eye,
  FileText,
  Folder,
  Heart,
  Home,
  ImagePlus,
  KeyRound,
  Library,
  LinkIcon,
  LogOut,
  Moon,
  MoreHorizontal,
  NotebookPen,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  Sun,
  Trash2,
  User,
  UserCircle,
  UserPlus,
  X,
} from "lucide-react";

import {
  createBook,
  createUser,
  deleteBook,
  listBooks,
  loginUser,
  searchBookCovers,
  updateBook,
} from "./api";
import { buildAppTheme } from "./theme";
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
  isbn: "",
  publication_year: "",
  description: "",
  cover_url: "",
  cover_source: "",
  external_id: "",
  is_read: false,
};

function App() {
  const storedSession = getStoredSession();
  const [view, setView] = useState(storedSession ? "home" : "login");
  const [currentUser, setCurrentUser] = useState(storedSession?.user ?? null);
  const [authToken, setAuthToken] = useState(storedSession?.token ?? null);
  const [loginPrefillEmail, setLoginPrefillEmail] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(getStoredTheme);

  const theme = useMemo(
    () => buildAppTheme(isDarkMode ? "dark" : "light"),
    [isDarkMode],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

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
    clearStoredSession();
    setAuthToken(null);
    setCurrentUser(null);
    setView("login");
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {view === "home" ? (
        <HomeView
          authToken={authToken}
          currentUser={currentUser}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((currentMode) => !currentMode)}
          onLogout={logout}
        />
      ) : (
        <Box
          component="main"
          sx={{
            minHeight: "100vh",
            px: { xs: 2, sm: 3, lg: 5 },
            py: { xs: 2, md: 4 },
          }}
        >
          <Box sx={{ width: "min(1180px, 100%)", mx: "auto" }}>
            <AuthTopBar
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode((currentMode) => !currentMode)}
            />
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
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
}

function AuthTopBar({ isDarkMode, onToggleTheme }) {
  return (
    <Stack
      component="header"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: { xs: 2.5, md: 3.5 } }}
    >
      <Typography variant="h1">Biblioteca Personal</Typography>
      <Tooltip title={isDarkMode ? "Modo claro" : "Modo noche"}>
        <IconButton type="button" aria-label="Cambiar tema" onClick={onToggleTheme}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function AuthLayout({ children }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.05fr) minmax(360px, 0.95fr)" },
        gap: 2,
        alignItems: "stretch",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          borderRadius: 6,
          bgcolor: (currentTheme) =>
            currentTheme.palette.mode === "dark"
              ? alpha(currentTheme.palette.secondary.main, 0.1)
              : alpha(currentTheme.palette.secondary.light, 0.38),
          boxShadow: "none",
        }}
      >
        <Stack spacing={2.25}>
          <SectionHeading
            kicker="Coleccion privada"
            title="Tu biblioteca, como un lugar al que volver."
            subtitle="Guarda lecturas, portadas y notas personales sin convertir tus libros en una hoja de datos."
          />
          <Stack spacing={1.25}>
            <FeatureLine icon={BookOpen} text="Estanteria visual" />
            <FeatureLine icon={Heart} text="Favoritos personales" />
            <FeatureLine icon={Sparkles} text="Notas de lectura" />
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 3.5 },
          borderRadius: 6,
          bgcolor: "background.paper",
          boxShadow: `0 22px 60px ${alpha(theme.palette.common.black, 0.1)}`,
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}

function FeatureLine({ icon: Icon, text }) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{
        px: 1.6,
        py: 1.25,
        borderRadius: 4,
        bgcolor: alpha(theme.palette.background.paper, 0.68),
      }}
    >
      <Icon size={17} color={theme.palette.secondary.main} />
      <Typography fontWeight={850}>{text}</Typography>
    </Stack>
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
    <Stack spacing={2.5}>
      <SectionHeading
        kicker="Acceso"
        title="Abre tu biblioteca"
        subtitle="Entra a tu coleccion personal de lectura."
      />

      <Stack component="form" spacing={1.75} onSubmit={submitLogin}>
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          placeholder="lucas@example.com"
          required
          fullWidth
          InputProps={{ startAdornment: <FieldAdornment icon={User} /> }}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={updateField}
          placeholder="Minimo 8 caracteres"
          inputProps={{ minLength: 8, maxLength: 72 }}
          required
          fullWidth
          InputProps={{ startAdornment: <FieldAdornment icon={KeyRound} /> }}
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={<KeyRound size={18} />}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems="stretch">
        <Button
          type="button"
          variant="outlined"
          fullWidth
          onClick={onOpenRegister}
          startIcon={<UserPlus size={17} />}
        >
          Crear cuenta
        </Button>
        <Button type="button" color="inherit" onClick={onOpenForgotPassword}>
          Olvide mi contrasena
        </Button>
      </Stack>
    </Stack>
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
    <Stack spacing={2.5}>
      <Button
        type="button"
        color="inherit"
        onClick={() => onBackToLogin()}
        startIcon={<ArrowLeft size={17} />}
        sx={{ alignSelf: "flex-start", px: 0 }}
      >
        Volver
      </Button>

      <SectionHeading
        kicker="Usuarios"
        title="Crear cuenta"
        subtitle="Empieza tu coleccion personal."
      />

      <Stack component="form" spacing={1.75} onSubmit={submitRegister}>
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          placeholder="lucas@example.com"
          required
          fullWidth
          InputProps={{ startAdornment: <FieldAdornment icon={User} /> }}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={updateField}
          placeholder="Minimo 8 caracteres"
          inputProps={{ minLength: 8, maxLength: 72 }}
          required
          fullWidth
          InputProps={{ startAdornment: <FieldAdornment icon={KeyRound} /> }}
        />
        <TextField
          label="Nombre"
          name="full_name"
          type="text"
          value={form.full_name}
          onChange={updateField}
          placeholder="Lucas"
          inputProps={{ maxLength: 100 }}
          fullWidth
          InputProps={{ startAdornment: <FieldAdornment icon={UserPlus} /> }}
        />

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={<UserPlus size={18} />}
        >
          {isSubmitting ? "Creando..." : "Crear cuenta"}
        </Button>

        {success && (
          <Button
            type="button"
            variant="outlined"
            onClick={() => onBackToLogin(createdEmail)}
            startIcon={<KeyRound size={17} />}
          >
            Iniciar sesion
          </Button>
        )}
      </Stack>
    </Stack>
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
    <Stack spacing={2.5}>
      <Button
        type="button"
        color="inherit"
        onClick={onBackToLogin}
        startIcon={<ArrowLeft size={17} />}
        sx={{ alignSelf: "flex-start", px: 0 }}
      >
        Volver
      </Button>

      <SectionHeading
        kicker="Acceso"
        title="Olvide mi contrasena"
        subtitle="Introduce tu email y te enviaremos instrucciones para recuperar el acceso."
      />

      <Stack component="form" spacing={1.75} onSubmit={submitForgotPassword}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="lucas@example.com"
          required
          fullWidth
          InputProps={{ startAdornment: <FieldAdornment icon={User} /> }}
        />

        {message && <Alert severity="warning">{message}</Alert>}

        <Button type="submit" variant="contained" size="large" startIcon={<KeyRound size={18} />}>
          Continuar
        </Button>
      </Stack>
    </Stack>
  );
}

function HomeView({
  authToken,
  currentUser,
  isDarkMode,
  onToggleTheme,
  onLogout,
}) {
  const [books, setBooks] = useState([]);
  const [bookForm, setBookForm] = useState(initialBookForm);
  const [editingBookId, setEditingBookId] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [coverCandidates, setCoverCandidates] = useState([]);
  const [coverMessage, setCoverMessage] = useState("");
  const [isSearchingCovers, setIsSearchingCovers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const favoriteIds = useStoredIdSet("bibliotecaFavoriteBookIds");
  const readingIds = useStoredIdSet("bibliotecaCurrentlyReadingIds");
  const theme = useTheme();
  const isDetailDrawer = useMediaQuery(theme.breakpoints.down("lg"));

  const visibleBooks = useMemo(
    () => filterBooksByQuery(books, searchTerm),
    [books, searchTerm],
  );
  const heroBook = useMemo(
    () => pickHeroBook(books, readingIds.ids),
    [books, readingIds.ids],
  );
  const activeBook = useMemo(
    () => books.find((book) => book.id === selectedBookId) ?? heroBook,
    [books, selectedBookId, heroBook],
  );
  const stats = useMemo(() => getLibraryStats(books), [books]);
  const sections = useMemo(
    () =>
      searchTerm.trim()
        ? [{ key: "search", title: "Resultados", books: visibleBooks }]
        : getLibrarySections(books, favoriteIds.ids, readingIds.ids),
    [books, favoriteIds.ids, readingIds.ids, searchTerm, visibleBooks],
  );

  function handleRequestError(requestError) {
    if (requestError.status === 401) {
      onLogout();
      return;
    }

    setError(requestError.message);
  }

  useEffect(() => {
    async function loadBooks() {
      if (!authToken) return;

      setIsLoading(true);
      setError("");

      try {
        const data = await listBooks(authToken);
        setBooks(data);
      } catch (requestError) {
        handleRequestError(requestError);
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
    setCoverCandidates([]);
    setCoverMessage("");
    setIsSearchingCovers(false);
  }

  function openCreateDialog() {
    resetBookForm();
    setIsFormOpen(true);
  }

  function closeFormDialog() {
    setIsFormOpen(false);
    resetBookForm();
  }

  function startEdit(book) {
    setBookForm({
      title: book.title,
      author: book.author ?? "",
      isbn: book.isbn ?? "",
      publication_year: book.publication_year ? String(book.publication_year) : "",
      description: book.description ?? "",
      cover_url: book.cover_url ?? "",
      cover_source: book.cover_source ?? "",
      external_id: book.external_id ?? "",
      is_read: book.is_read,
    });
    setEditingBookId(book.id);
    setContextMenu(null);
    setCoverCandidates([]);
    setCoverMessage("");
    setIsFormOpen(true);
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
      setSelectedBookId(savedBook.id);
      closeFormDialog();
    } catch (requestError) {
      handleRequestError(requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleRead(book) {
    setContextMenu(null);
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
      setSelectedBookId(updatedBook.id);
    } catch (requestError) {
      handleRequestError(requestError);
    }
  }

  async function removeBook(bookId) {
    setContextMenu(null);
    setError("");
    try {
      await deleteBook(authToken, bookId);
      setBooks((currentBooks) => currentBooks.filter((book) => book.id !== bookId));
      favoriteIds.remove(bookId);
      readingIds.remove(bookId);
      if (selectedBookId === bookId) setSelectedBookId(null);
      if (editingBookId === bookId) closeFormDialog();
    } catch (requestError) {
      handleRequestError(requestError);
    }
  }

  async function searchCovers() {
    const isbn = bookForm.isbn.trim();
    const title = bookForm.title.trim();
    if (!isbn && !title) {
      setCoverMessage("Escribe un ISBN o un titulo antes de buscar portadas.");
      return;
    }

    setError("");
    setCoverMessage("");
    setCoverCandidates([]);
    setIsSearchingCovers(true);

    try {
      const candidates = await searchBookCovers(authToken, {
        title: isbn ? "" : title,
        author: bookForm.author.trim(),
        isbn,
      });
      setCoverCandidates(candidates);
      if (candidates.length === 0) {
        setCoverMessage("No encontramos portadas para ese libro.");
      }
    } catch (requestError) {
      handleRequestError(requestError);
    } finally {
      setIsSearchingCovers(false);
    }
  }

  function selectCover(candidate) {
    setBookForm((currentForm) => {
      const publicationYear = candidate.publication_year || currentForm.publication_year;

      return {
        ...currentForm,
        title: candidate.title || currentForm.title,
        author: candidate.author || currentForm.author,
        isbn: candidate.isbn || currentForm.isbn,
        publication_year: publicationYear ? String(publicationYear) : "",
        cover_url: candidate.cover_url,
        cover_source: candidate.source,
        external_id: candidate.external_id,
      };
    });
    setCoverMessage("Portada seleccionada.");
  }

  function clearCover() {
    setBookForm((currentForm) => ({
      ...currentForm,
      cover_url: "",
      cover_source: "",
      external_id: "",
    }));
    setCoverMessage("");
  }

  function openContextMenu(event, book) {
    event.stopPropagation();
    setContextMenu({
      anchorEl: event.currentTarget,
      book,
    });
  }

  function closeContextMenu() {
    setContextMenu(null);
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "236px minmax(0, 1fr) 398px" },
      }}
    >
      <LibrarySidebar
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
      />

      <Box
        sx={{
          minWidth: 0,
          px: { xs: 2, sm: 3, xl: 4 },
          py: { xs: 2.5, lg: 5 },
          pb: 12,
        }}
      >
        <LibraryHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleTheme={onToggleTheme}
          isDarkMode={isDarkMode}
          onLogout={onLogout}
        />

        {error && (
          <Alert severity="error" icon={<AlertCircle size={19} />} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <ReadingHero
          book={heroBook}
          isLoading={isLoading}
          isReading={heroBook ? readingIds.has(heroBook.id) : false}
          onOpenBook={(book) => setSelectedBookId(book.id)}
        />

        <StatsStrip stats={stats} />

        <Stack spacing={4}>
          {isLoading ? (
            <EmptyShelf icon={Library} title="Preparando tu biblioteca..." />
          ) : books.length === 0 ? (
            <EmptyShelf icon={BookOpen} title="Tu coleccion esta esperando su primer libro." />
          ) : sections.every((section) => section.books.length === 0) ? (
            <EmptyShelf icon={Search} title="No hay libros que coincidan con la busqueda." />
          ) : (
            sections.map((section) => (
              <BookShelfRow
                key={section.key}
                title={section.title}
                books={section.books}
                emptyText={section.emptyText}
                favoriteIds={favoriteIds}
                readingIds={readingIds}
                onSelectBook={(book) => setSelectedBookId(book.id)}
                onOpenMenu={openContextMenu}
              />
            ))
          )}
        </Stack>
      </Box>

      <Box
        component="aside"
        sx={{
          display: { xs: "none", lg: "block" },
          px: 3,
          pt: 15,
          pb: 4,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <DetailPanel
          book={activeBook}
          favoriteIds={favoriteIds}
          readingIds={readingIds}
          onClose={() => setSelectedBookId(null)}
          onEdit={startEdit}
          onToggleRead={toggleRead}
          onRemove={removeBook}
        />
      </Box>

      <Drawer
        anchor="bottom"
        open={Boolean(selectedBookId) && isDetailDrawer}
        onClose={() => setSelectedBookId(null)}
        PaperProps={{
          sx: {
            maxHeight: {
              xs: "calc(100dvh - 176px)",
              sm: "calc(100dvh - 184px)",
              md: "calc(100dvh - 192px)",
            },
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            bgcolor: "background.paper",
            overflow: "hidden",
            mb: 0,
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <DetailPanel
            book={activeBook}
            favoriteIds={favoriteIds}
            readingIds={readingIds}
            onClose={() => setSelectedBookId(null)}
            onEdit={startEdit}
            onToggleRead={toggleRead}
            onRemove={removeBook}
            compact
          />
        </Box>
      </Drawer>

      <BookContextMenu
        contextMenu={contextMenu}
        favoriteIds={favoriteIds}
        readingIds={readingIds}
        onClose={closeContextMenu}
        onView={(book) => {
          setSelectedBookId(book.id);
          closeContextMenu();
        }}
        onEdit={startEdit}
        onToggleRead={toggleRead}
        onRemove={removeBook}
      />

      <BookFormDialog
        open={isFormOpen}
        bookForm={bookForm}
        editingBookId={editingBookId}
        coverCandidates={coverCandidates}
        coverMessage={coverMessage}
        isSaving={isSaving}
        isSearchingCovers={isSearchingCovers}
        onClose={closeFormDialog}
        onSubmit={submitBook}
        onChange={updateBookField}
        onSearchCovers={searchCovers}
        onSelectCover={selectCover}
        onClearCover={clearCover}
      />

      <Tooltip title="Anadir libro">
        <Fab
          color="primary"
          aria-label="Anadir libro"
          onClick={openCreateDialog}
          sx={{
            position: "fixed",
            right: { xs: 22, lg: 36 },
            bottom: { xs: 22, lg: 34 },
            zIndex: (theme) => theme.zIndex.speedDial,
          }}
        >
          <Plus size={28} />
        </Fab>
      </Tooltip>
    </Box>
  );
}

function LibrarySidebar({
  currentUser,
  isDarkMode,
  onToggleTheme,
  onLogout,
}) {
  const navItems = [
    { label: "Inicio", icon: Home, active: true },
    { label: "Todos los libros", icon: BookOpen },
    { label: "Actualmente leyendo", icon: BookMarked },
    { label: "Pendientes", icon: Bookmark },
    { label: "Leidos", icon: CheckCircle2 },
    { label: "Favoritos", icon: Heart },
    { label: "Colecciones", icon: Folder },
    { label: "Notas", icon: NotebookPen },
    { label: "Estadisticas", icon: BarChart3 },
  ];

  return (
    <Box
      component="aside"
      sx={{
        display: { xs: "none", lg: "flex" },
        position: "sticky",
        top: 0,
        height: "100vh",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 2,
        overflowY: "auto",
        px: 2,
        py: 2.25,
        color: "#f8eed6",
        bgcolor: "#062618",
        background:
          "radial-gradient(circle at 25% 10%, rgba(212,178,82,0.18), transparent 30%), linear-gradient(180deg, #052316 0%, #062618 48%, #04170f 100%)",
        boxShadow: "inset -1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <Stack spacing={2.6}>
        <Stack spacing={1.1} sx={{ px: 1.5 }}>
          <Library size={38} fill="currentColor" />
          <Typography
            sx={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "1.18rem",
              fontWeight: 800,
            }}
          >
            Mi Biblioteca
          </Typography>
        </Stack>

        <Stack spacing={0.6}>
          {navItems.slice(0, 6).map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </Stack>

        <Box sx={{ height: 1, bgcolor: "rgba(248,238,214,0.12)", mx: 1.5 }} />

        <Stack spacing={0.6}>
          {navItems.slice(6).map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </Stack>
      </Stack>

      <Stack spacing={1.2} sx={{ flexShrink: 0, pb: 0.75 }}>
        <Stack
          direction="row"
          spacing={1.1}
          alignItems="center"
          sx={{ minHeight: 42, px: 1.2 }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              bgcolor: "rgba(248,238,214,0.16)",
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            {(currentUser?.full_name || currentUser?.email || "L").slice(0, 1).toUpperCase()}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center" }}>
            <Typography className="line-clamp-1" sx={{ fontWeight: 850 }}>
              {currentUser?.full_name || "lucas"}
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label={isDarkMode ? "Modo claro" : "Modo noche"}
            sx={sidebarUserIconSx}
            onClick={onToggleTheme}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </IconButton>
          <IconButton size="small" sx={sidebarUserIconSx} onClick={onLogout}>
            <LogOut size={17} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}

const sidebarUserIconSx = {
  width: 32,
  height: 32,
  color: "#f8eed6",
  flexShrink: 0,
  transform: "translateY(2px)",
};

function SidebarItem({ label, icon: Icon, active = false }) {
  return (
    <Stack
      direction="row"
      spacing={1.2}
      alignItems="center"
      sx={{
        px: 1.6,
        py: 1.15,
        minHeight: 44,
        borderRadius: 2,
        color: active ? "#fff7df" : "rgba(248,238,214,0.86)",
        bgcolor: active ? "rgba(255,255,255,0.08)" : "transparent",
      }}
    >
      <Icon size={18} />
      <Typography sx={{ fontWeight: active ? 850 : 720, fontSize: "0.93rem" }}>
        {label}
      </Typography>
    </Stack>
  );
}

function LibraryHeader({
  searchTerm,
  onSearchChange,
  isDarkMode,
  onToggleTheme,
  onLogout,
}) {
  const theme = useTheme();

  return (
    <Stack spacing={1.5} sx={{ mb: 3.3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "max-content minmax(260px, 430px) minmax(184px, 1fr)",
          },
          alignItems: "center",
          columnGap: { md: 3, xl: 4 },
          rowGap: 1.35,
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: { xs: "2.25rem", md: "clamp(2.55rem, 3.25vw, 3.15rem)" },
            fontWeight: 800,
            lineHeight: 1,
            color: "text.primary",
            whiteSpace: "nowrap",
            gridColumn: { xs: "1", md: "1" },
            gridRow: "1",
          }}
        >
          Biblioteca Personal
        </Typography>

        <TextField
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar libro o autor..."
          aria-label="Buscar libro o autor"
          sx={{
            width: "100%",
            gridColumn: { xs: "1", md: "2" },
            gridRow: { xs: "2", md: "1" },
            alignSelf: "center",
            "& .MuiOutlinedInput-root": {
              bgcolor: alpha(theme.palette.background.paper, 0.62),
              boxShadow: "inset 0 0 0 1px rgba(34, 24, 12, 0.06)",
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
        />

        <Stack
          direction="row"
          spacing={0.9}
          justifyContent="flex-end"
          sx={{
            display: { xs: "none", md: "flex" },
            gridColumn: "3",
            gridRow: "1",
            alignSelf: "center",
            zIndex: (currentTheme) => currentTheme.zIndex.drawer + 2,
          }}
        >
          <TopIconButton icon={BookOpen} label="Biblioteca" />
          <TopIconButton icon={Bell} label="Avisos" />
          <Tooltip title={isDarkMode ? "Modo claro" : "Modo noche"}>
            <IconButton onClick={onToggleTheme} sx={roundIconSx(theme)}>
              {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Salir">
            <IconButton onClick={onLogout} sx={roundIconSx(theme)}>
              <UserCircle size={19} />
            </IconButton>
          </Tooltip>
        </Stack>
        <Typography
          sx={{
            color: "text.secondary",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            gridColumn: { xs: "1", md: "1 / -1" },
            gridRow: { xs: "3", md: "2" },
            minWidth: 0,
          }}
        >
          "La lectura de todos los buenos libros es como una conversación con las mejores mentes de los siglos pasados."
        </Typography>
      </Box>
    </Stack>
  );
}

function TopIconButton({ icon: Icon, label }) {
  const theme = useTheme();

  return (
    <Tooltip title={label}>
      <IconButton sx={roundIconSx(theme)}>
        <Icon size={19} />
      </IconButton>
    </Tooltip>
  );
}

function roundIconSx(theme) {
  return {
    width: 48,
    height: 48,
    bgcolor: alpha(theme.palette.secondary.light, 0.26),
    color: "text.primary",
    boxShadow: "0 10px 26px rgba(45, 34, 17, 0.08)",
  };
}

function ReadingHero({ book, isLoading, isReading, onOpenBook }) {
  const theme = useTheme();
  const progress = book ? getReadingProgress(book, isReading) : 0;
  const totalPages = book ? getEstimatedPages(book) : 0;
  const currentPage = Math.max(1, Math.round((progress / 100) * totalPages));

  return (
    <Box
      className="hero-enter"
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: { xs: 290, md: 318 },
        borderRadius: 3,
        mb: 2,
        px: { xs: 2, md: 4 },
        py: { xs: 2.4, md: 2.8 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "150px minmax(0, 1fr)" },
        gap: { xs: 2, md: 3 },
        alignItems: "center",
        bgcolor: "#0c0d0a",
        color: "#fff8e7",
        boxShadow: "0 22px 46px rgba(41, 29, 14, 0.18)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(6,8,6,0.95) 0%, rgba(6,8,6,0.78) 45%, rgba(6,8,6,0.36) 100%), radial-gradient(circle at 86% 42%, rgba(207,141,45,0.34), transparent 24%)",
        }}
      />
      {book?.cover_url && (
        <Box
          component="img"
          src={book.cover_url}
          alt=""
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.24,
            filter: "blur(10px) saturate(0.9)",
            transform: "scale(1.08)",
          }}
        />
      )}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(2,5,3,0.94) 0%, rgba(2,5,3,0.78) 52%, rgba(2,5,3,0.22) 100%)",
        }}
      />

      <BookCover book={book} size="hero" />

      <Stack spacing={1.65} sx={{ position: "relative", zIndex: 1 }}>
        <Chip
          label={isReading ? "Actualmente leyendo" : book?.is_read ? "Ultima lectura" : "Siguiente lectura"}
          sx={{
            alignSelf: "flex-start",
            color: "#eef8e9",
            bgcolor: alpha(theme.palette.primary.main, 0.62),
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}
        />

        <Box>
          <Typography
            component="h2"
            className="line-clamp-1"
            sx={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: { xs: "2rem", md: "2.55rem" },
              fontWeight: 850,
              lineHeight: 1,
            }}
          >
            {isLoading ? "Preparando tu lectura..." : book?.title || "Tu biblioteca esta lista"}
          </Typography>
          <Typography sx={{ mt: 0.9, color: alpha("#fff8e7", 0.88), fontSize: "1.08rem", fontWeight: 700 }}>
            {book?.author || "Anade tu primer libro para empezar"}
          </Typography>
        </Box>

        {book && (
          <Stack spacing={0.8} sx={{ maxWidth: 410 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography sx={{ color: alpha("#fff8e7", 0.86), fontWeight: 650 }}>
                Voy por la pagina {currentPage} de {totalPages}
              </Typography>
              <Typography sx={{ color: "#fff8e7", fontWeight: 850 }}>
                {progress}%
              </Typography>
            </Stack>
            <Box sx={{ height: 8, borderRadius: 999, bgcolor: alpha("#fff8e7", 0.22), overflow: "hidden" }}>
              <Box sx={{ width: `${progress}%`, height: "100%", borderRadius: 999, bgcolor: "#8fba86" }} />
            </Box>
          </Stack>
        )}

        {book && (
          <Button
            type="button"
            color="secondary"
            variant="contained"
            onClick={() => onOpenBook(book)}
            endIcon={<ChevronRight size={18} />}
            sx={{ alignSelf: "flex-start", px: 2.4, color: "#102016", bgcolor: "#fff5df" }}
          >
            Continuar leyendo
          </Button>
        )}
      </Stack>
    </Box>
  );
}

function StatsStrip({ stats }) {
  const theme = useTheme();
  const items = [
    { label: "libros en total", value: stats.total, icon: BookOpen },
    { label: "leidos", value: stats.read, icon: CheckCircle2 },
    { label: "pendientes", value: stats.pending, icon: Library },
    { label: "completado", value: `${stats.completion}%`, icon: Sparkles },
  ];

  return (
    <Box
      sx={{
        mb: 2.8,
        px: { xs: 1.8, md: 3 },
        py: 1.5,
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        gap: 1.2,
        borderRadius: 3,
        bgcolor: alpha(theme.palette.secondary.light, 0.24),
        boxShadow: "0 16px 34px rgba(64, 46, 19, 0.08)",
      }}
    >
      {items.map((item, index) => (
        <Stack
          key={item.label}
          direction="row"
          spacing={1.3}
          alignItems="center"
          sx={{
            justifyContent: "center",
            borderRight: {
              xs: "none",
              md: index < items.length - 1 ? `1px solid ${alpha("#2d2112", 0.12)}` : "none",
            },
          }}
        >
          <item.icon size={24} color={theme.palette.primary.main} />
          <Box>
            <Typography sx={{ fontSize: "1.45rem", fontWeight: 850, lineHeight: 1 }}>
              {item.value}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: "0.78rem", fontWeight: 700 }}>
              {item.label}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Box>
  );
}

function BookShelfRow({
  title,
  books,
  emptyText,
  favoriteIds,
  readingIds,
  onSelectBook,
  onOpenMenu,
}) {
  if (books.length === 0) {
    return (
      <Box>
        <ShelfRowTitle title={title} />
        <Typography color="text.secondary" sx={{ mt: 1, fontWeight: 700 }}>
          {emptyText}
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="section">
      <Stack
        direction="row"
        alignItems="center"
        sx={{ width: "100%", mb: 1.5 }}
      >
        <ShelfRowTitle title={title} />
        <Button
          endIcon={<ChevronRight size={16} />}
          color="inherit"
          size="small"
          sx={{ ml: "auto" }}
        >
          Ver todos
        </Button>
      </Stack>
      <Box className="shelf-row">
        {books.map((book) => (
          <ShelfBookCard
            key={`${title}-${book.id}-${book.is_read}`}
            book={book}
            isFavorite={favoriteIds.has(book.id)}
            isReading={readingIds.has(book.id)}
            onSelectBook={onSelectBook}
            onOpenMenu={onOpenMenu}
          />
        ))}
      </Box>
    </Box>
  );
}

function ShelfRowTitle({ title }) {
  return (
    <Typography
      component="h2"
      sx={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "1.28rem",
        fontWeight: 850,
        color: "text.primary",
      }}
    >
      {title}
    </Typography>
  );
}

function ShelfBookCard({
  book,
  isFavorite,
  isReading,
  onSelectBook,
  onOpenMenu,
}) {
  const theme = useTheme();

  return (
    <Box
      component="article"
      className="poster-card book-card-animate"
      sx={{
        flex: "0 0 clamp(108px, 8.6vw, 132px)",
        minWidth: 0,
        color: "text.primary",
      }}
    >
      <Box
        component="button"
        type="button"
        onClick={() => onSelectBook(book)}
        sx={{
          display: "block",
          position: "relative",
          width: "100%",
          aspectRatio: "2 / 3",
          p: 0,
          overflow: "hidden",
          border: 0,
          borderRadius: 1.4,
          bgcolor: alpha(theme.palette.secondary.light, 0.42),
          boxShadow: "0 14px 25px rgba(40, 29, 13, 0.22)",
          cursor: "pointer",
          transition: "transform 220ms ease, box-shadow 220ms ease",
          "&:hover": {
            transform: "translateY(-6px) scale(1.035)",
            boxShadow: "0 22px 42px rgba(40, 29, 13, 0.3)",
          },
          "&:hover img": {
            transform: "scale(1.055)",
          },
          "&:focus-visible": {
            outline: `3px solid ${alpha(theme.palette.secondary.main, 0.72)}`,
            outlineOffset: 6,
          },
        }}
      >
        {book.cover_url ? (
          <Box
            component="img"
            src={book.cover_url}
            alt={`Portada de ${book.title}`}
            loading="lazy"
            sx={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
              transition: "transform 260ms ease",
            }}
          />
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ height: "100%", color: "text.secondary" }}
          >
            <ImagePlus size={28} />
          </Stack>
        )}

        {(isFavorite || isReading) && (
          <Stack direction="row" spacing={0.4} sx={{ position: "absolute", left: 7, bottom: 7 }}>
            {isFavorite && <MiniBadge icon={Heart} />}
            {isReading && <MiniBadge icon={Clock3} />}
          </Stack>
        )}
      </Box>

      <IconButton
        type="button"
        aria-label={`Opciones de ${book.title}`}
        onClick={(event) => onOpenMenu(event, book)}
        size="small"
        sx={{
          mt: -4,
          mr: 0.5,
          float: "right",
          color: "#fff8e7",
          bgcolor: "rgba(0,0,0,0.42)",
          opacity: { xs: 1, md: 0 },
          ".poster-card:hover &": { opacity: 1 },
          transition: "opacity 160ms ease, background-color 160ms ease",
          "&:hover": { bgcolor: "rgba(0,0,0,0.62)" },
        }}
      >
        <MoreHorizontal size={16} />
      </IconButton>
    </Box>
  );
}

function MiniBadge({ icon: Icon }) {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        color: "#fff8e7",
        bgcolor: "rgba(5, 38, 24, 0.82)",
        boxShadow: "0 8px 18px rgba(0,0,0,0.26)",
      }}
    >
      <Icon size={13} fill="currentColor" />
    </Box>
  );
}

function DetailPanel({
  book,
  favoriteIds,
  readingIds,
  onClose,
  onEdit,
  onToggleRead,
  onRemove,
  compact = false,
}) {
  const theme = useTheme();
  const isFavorite = book ? favoriteIds.has(book.id) : false;
  const isReading = book ? readingIds.has(book.id) : false;

  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: compact ? "auto" : "calc(100vh - 70px)",
        p: { xs: 2.2, lg: 3.2 },
        borderRadius: 3,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
        boxShadow: "0 20px 45px rgba(65, 48, 23, 0.16)",
        backdropFilter: "blur(18px)",
      }}
    >
      {book ? (
        <Stack spacing={2.2}>
          <Stack direction="row" justifyContent="flex-end">
            <IconButton aria-label="Cerrar detalles" onClick={onClose}>
              <X size={20} />
            </IconButton>
          </Stack>

          <Box sx={{ width: "min(210px, 62vw)", mx: "auto" }}>
            <BookCover book={book} size="detail" />
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              component="h2"
              sx={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: { xs: "2rem", lg: "2.25rem" },
                fontWeight: 850,
                lineHeight: 1.05,
                color: "text.primary",
              }}
            >
              {book.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontSize: "1rem", fontWeight: 760 }}>
              {book.author || "Autor desconocido"}
            </Typography>
          </Box>

          <Stack direction="row" justifyContent="center">
            <Chip
              label={isReading ? "Actualmente leyendo" : book.is_read ? "Leido" : "Pendiente"}
              sx={{
                color: "#153318",
                bgcolor: isReading
                  ? alpha(theme.palette.primary.light, 0.82)
                  : book.is_read
                    ? alpha(theme.palette.primary.light, 0.65)
                    : alpha(theme.palette.secondary.light, 0.72),
              }}
            />
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{
              pt: 1.2,
              borderTop: `1px solid ${alpha("#4c3b1b", 0.12)}`,
              borderBottom: `1px solid ${alpha("#4c3b1b", 0.12)}`,
              pb: 1.2,
            }}
          >
            <DetailMini icon={CalendarDays} value={book.publication_year || "----"} label="Ano" />
            <DetailMini icon={Bookmark} value={getGenreLabel(book)} label="Genero" />
            <DetailMini icon={Star} value={getRating(book)} label="Mi valoracion" />
          </Stack>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography fontWeight={900}>Notas personales</Typography>
              <Button size="small" color="primary" onClick={() => onEdit(book)}>
                Editar
              </Button>
            </Stack>
            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {book.description || "Sin notas guardadas."}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row", lg: "row" }}
            spacing={1}
            sx={{ pt: 1.3, borderTop: `1px solid ${alpha("#4c3b1b", 0.12)}` }}
          >
            <Button
              type="button"
              variant="text"
              color="primary"
              onClick={() => onToggleRead(book)}
              startIcon={<CheckCircle2 size={17} />}
            >
              {book.is_read ? "Pendiente" : "Marcar como leido"}
            </Button>
            <Button type="button" variant="text" color="inherit" onClick={() => onEdit(book)} startIcon={<Edit3 size={17} />}>
              Editar
            </Button>
            <Button
              type="button"
              color="error"
              variant="text"
              onClick={() => onRemove(book.id)}
              startIcon={<Trash2 size={17} />}
            >
              Eliminar
            </Button>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              type="button"
              variant={isFavorite ? "contained" : "outlined"}
              color="secondary"
              onClick={() => favoriteIds.toggle(book.id)}
              startIcon={<Heart size={17} fill={isFavorite ? "currentColor" : "none"} />}
              fullWidth
            >
              Favorito
            </Button>
            <Button
              type="button"
              variant={isReading ? "contained" : "outlined"}
              color="primary"
              onClick={() => readingIds.toggle(book.id)}
              startIcon={<Clock3 size={17} />}
              fullWidth
            >
              Leyendo
            </Button>
          </Stack>
        </Stack>
      ) : (
        <EmptyShelf icon={Library} title="Selecciona un libro para ver su ficha." />
      )}
    </Paper>
  );
}

function DetailMini({ icon: Icon, value, label }) {
  return (
    <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 88, textAlign: "center" }}>
      <Stack direction="row" spacing={0.6} alignItems="center">
        <Icon size={16} />
        <Typography sx={{ fontWeight: 850, fontSize: "0.9rem" }}>{value}</Typography>
      </Stack>
      <Typography color="text.secondary" sx={{ fontSize: "0.73rem", fontWeight: 700 }}>
        {label}
      </Typography>
    </Stack>
  );
}

function BookCover({ book, size }) {
  const theme = useTheme();
  const sxBySize = {
    hero: {
      width: { xs: 118, sm: 142 },
      mx: { xs: "auto", sm: 0 },
      borderRadius: 1.5,
      boxShadow: "0 18px 36px rgba(0,0,0,0.42)",
    },
    detail: {
      width: "100%",
      borderRadius: 1.6,
      boxShadow: "0 22px 46px rgba(62, 43, 17, 0.24)",
    },
  };

  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 1,
        aspectRatio: "2 / 3",
        overflow: "hidden",
        bgcolor: alpha(theme.palette.secondary.light, 0.42),
        ...sxBySize[size],
      }}
    >
      {book?.cover_url ? (
        <Box
          component="img"
          src={book.cover_url}
          alt={`Portada de ${book.title}`}
          sx={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
        />
      ) : (
        <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", color: "text.secondary" }}>
          <ImagePlus size={32} />
        </Stack>
      )}
    </Box>
  );
}

function BookContextMenu({
  contextMenu,
  favoriteIds,
  readingIds,
  onClose,
  onView,
  onEdit,
  onToggleRead,
  onRemove,
}) {
  const book = contextMenu?.book;
  const isFavorite = book ? favoriteIds.has(book.id) : false;
  const isReading = book ? readingIds.has(book.id) : false;

  return (
    <Menu
      anchorEl={contextMenu?.anchorEl ?? null}
      open={Boolean(contextMenu)}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      PaperProps={{ sx: { borderRadius: 3, minWidth: 230 } }}
    >
      {book && [
        <MenuItem key="view" onClick={() => onView(book)}>
          <ListItemIcon><Eye size={18} /></ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>,
        <MenuItem
          key="favorite"
          onClick={() => {
            favoriteIds.toggle(book.id);
            onClose();
          }}
        >
          <ListItemIcon><Heart size={18} fill={isFavorite ? "currentColor" : "none"} /></ListItemIcon>
          <ListItemText>{isFavorite ? "Quitar favorito" : "Favorito"}</ListItemText>
        </MenuItem>,
        <MenuItem
          key="reading"
          onClick={() => {
            readingIds.toggle(book.id);
            onClose();
          }}
        >
          <ListItemIcon><Clock3 size={18} /></ListItemIcon>
          <ListItemText>{isReading ? "Quitar de leyendo" : "Estoy leyendo"}</ListItemText>
        </MenuItem>,
        <MenuItem key="read" onClick={() => onToggleRead(book)}>
          <ListItemIcon><CheckCircle2 size={18} /></ListItemIcon>
          <ListItemText>{book.is_read ? "Marcar pendiente" : "Marcar leido"}</ListItemText>
        </MenuItem>,
        <MenuItem key="edit" onClick={() => onEdit(book)}>
          <ListItemIcon><Pencil size={18} /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>,
        <MenuItem key="delete" onClick={() => onRemove(book.id)}>
          <ListItemIcon><Trash2 size={18} /></ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>,
      ]}
    </Menu>
  );
}

function BookFormDialog({
  open,
  bookForm,
  editingBookId,
  coverCandidates,
  coverMessage,
  isSaving,
  isSearchingCovers,
  onClose,
  onSubmit,
  onChange,
  onSearchCovers,
  onSelectCover,
  onClearCover,
}) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      TransitionProps={{ timeout: 220 }}
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          boxShadow: `0 28px 90px ${alpha(theme.palette.common.black, 0.3)}`,
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack spacing={2.4}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <SectionHeading
              kicker="Libro"
              title={editingBookId ? "Editar libro" : "Anadir libro"}
              subtitle="Solo aparece cuando quieres guardar una lectura nueva."
            />
            <IconButton aria-label="Cerrar formulario" onClick={onClose}>
              <X size={20} />
            </IconButton>
          </Stack>

          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "190px minmax(0, 1fr)" },
              gap: { xs: 2, md: 3 },
              alignItems: "start",
            }}
          >
            <Stack spacing={1.5}>
              <Box sx={{ width: "100%" }}>
                <BookCover book={bookForm.cover_url ? { title: bookForm.title, cover_url: bookForm.cover_url } : null} size="detail" />
              </Box>

              <Button
                type="button"
                variant="outlined"
                onClick={onSearchCovers}
                disabled={isSearchingCovers}
                startIcon={<Search size={17} />}
                fullWidth
              >
                {isSearchingCovers ? "Buscando..." : "Buscar portada"}
              </Button>
              {bookForm.cover_url && (
                <Button type="button" color="inherit" onClick={onClearCover} startIcon={<X size={17} />}>
                  Quitar portada
                </Button>
              )}
            </Stack>

            <Stack spacing={1.6}>
              <TextField
                label="Titulo"
                name="title"
                type="text"
                value={bookForm.title}
                onChange={onChange}
                placeholder="Clean Code"
                inputProps={{ maxLength: 200 }}
                required
                fullWidth
                InputProps={{ startAdornment: <FieldAdornment icon={BookOpen} /> }}
              />

              <TextField
                label="Autor"
                name="author"
                type="text"
                value={bookForm.author}
                onChange={onChange}
                placeholder="Robert C. Martin"
                inputProps={{ maxLength: 150 }}
                fullWidth
                InputProps={{ startAdornment: <FieldAdornment icon={User} /> }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4}>
                <TextField
                  label="ISBN"
                  name="isbn"
                  type="text"
                  value={bookForm.isbn}
                  onChange={onChange}
                  placeholder="9780140449136"
                  inputProps={{ maxLength: 20 }}
                  fullWidth
                  InputProps={{ startAdornment: <FieldAdornment icon={Barcode} /> }}
                />
                <TextField
                  label="Ano"
                  name="publication_year"
                  type="number"
                  value={bookForm.publication_year}
                  onChange={onChange}
                  placeholder="2008"
                  inputProps={{ min: 0, max: 3000 }}
                  fullWidth
                  InputProps={{ startAdornment: <FieldAdornment icon={CalendarDays} /> }}
                />
              </Stack>

              <TextField
                label="URL de portada"
                name="cover_url"
                type="url"
                value={bookForm.cover_url}
                onChange={onChange}
                placeholder="https://covers.openlibrary.org/..."
                inputProps={{ maxLength: 500 }}
                fullWidth
                InputProps={{ startAdornment: <FieldAdornment icon={LinkIcon} /> }}
              />

              {coverMessage && (
                <Alert severity={bookForm.cover_url ? "success" : "info"}>{coverMessage}</Alert>
              )}

              {coverCandidates.length > 0 && (
                <CoverCandidateList candidates={coverCandidates} onSelectCover={onSelectCover} />
              )}

              <TextField
                label="Notas"
                name="description"
                value={bookForm.description}
                onChange={onChange}
                placeholder="Notas personales sobre el libro"
                inputProps={{ maxLength: 1000 }}
                multiline
                minRows={3}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                      <FileText size={17} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Switch
                    name="is_read"
                    checked={bookForm.is_read}
                    onChange={onChange}
                    color="success"
                  />
                }
                label={bookForm.is_read ? "Leido" : "Pendiente"}
                sx={{
                  mx: 0,
                  px: 1,
                  py: 0.5,
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.secondary.light, theme.palette.mode === "dark" ? 0.08 : 0.26),
                  justifyContent: "space-between",
                  "& .MuiFormControlLabel-label": { fontWeight: 850 },
                }}
                labelPlacement="start"
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSaving}
                  startIcon={editingBookId ? <Save size={18} /> : <Plus size={18} />}
                  fullWidth
                >
                  {isSaving ? "Guardando..." : editingBookId ? "Guardar" : "Anadir"}
                </Button>
                <Button type="button" variant="outlined" color="inherit" onClick={onClose} fullWidth>
                  Cancelar
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function CoverCandidateList({ candidates, onSelectCover }) {
  const theme = useTheme();

  return (
    <Box
      aria-label="Portadas encontradas"
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(76px, 1fr))",
        gap: 1,
      }}
    >
      {candidates.map((candidate) => (
        <Box
          component="button"
          className="cover-candidate"
          key={`${candidate.source}-${candidate.external_id}-${candidate.cover_url}`}
          type="button"
          onClick={() => onSelectCover(candidate)}
          sx={{
            minWidth: 0,
            p: 0,
            border: 0,
            bgcolor: "transparent",
            color: "text.primary",
            textAlign: "left",
            cursor: "pointer",
            transition: "transform 160ms ease",
            "&:hover": { transform: "translateY(-3px)" },
            "& img": {
              boxShadow: `0 12px 26px ${alpha(theme.palette.common.black, 0.14)}`,
            },
          }}
        >
          <Box
            component="img"
            src={candidate.thumbnail_url}
            alt={`Portada de ${candidate.title}`}
            loading="lazy"
            sx={{
              width: "100%",
              aspectRatio: "2 / 3",
              objectFit: "cover",
              display: "block",
              borderRadius: 2.4,
              bgcolor: "background.default",
            }}
          />
          <Typography className="line-clamp-2" sx={{ mt: 0.7, fontSize: "0.72rem", fontWeight: 850 }}>
            {candidate.title}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function SectionHeading({ kicker, title, subtitle }) {
  return (
    <Box>
      {kicker && (
        <Typography
          component="p"
          color="text.secondary"
          sx={{ fontSize: "0.76rem", fontWeight: 850, textTransform: "uppercase" }}
        >
          {kicker}
        </Typography>
      )}
      <Typography variant="h2" component="h2" sx={{ mt: 0.45 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography color="text.secondary" sx={{ mt: 0.8, lineHeight: 1.55 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function FieldAdornment({ icon: Icon }) {
  return (
    <InputAdornment position="start">
      <Icon size={17} />
    </InputAdornment>
  );
}

function EmptyShelf({ icon: Icon, title }) {
  const theme = useTheme();

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{
        minHeight: 280,
        borderRadius: 4,
        bgcolor: alpha(theme.palette.background.paper, 0.44),
        color: "text.secondary",
        textAlign: "center",
      }}
    >
      <Icon size={30} />
      <Typography fontWeight={850}>{title}</Typography>
    </Stack>
  );
}

function useStoredIdSet(storageKey) {
  const [ids, setIds] = useState(() => readStoredIds(storageKey));

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(ids));
  }, [ids, storageKey]);

  return {
    ids,
    has(id) {
      return ids.includes(String(id));
    },
    toggle(id) {
      const idText = String(id);
      setIds((currentIds) =>
        currentIds.includes(idText)
          ? currentIds.filter((currentId) => currentId !== idText)
          : [idText, ...currentIds],
      );
    },
    remove(id) {
      const idText = String(id);
      setIds((currentIds) => currentIds.filter((currentId) => currentId !== idText));
    },
  };
}

function readStoredIds(storageKey) {
  try {
    const rawValue = localStorage.getItem(storageKey);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue.map(String) : [];
  } catch {
    return [];
  }
}

function getLibraryStats(books) {
  const total = books.length;
  const read = books.filter((book) => book.is_read).length;
  const pending = total - read;
  const completion = total ? Math.round((read / total) * 100) : 0;

  return { total, read, pending, completion };
}

function getLibrarySections(books, favoriteIds, readingIds) {
  const sortedBooks = sortBooksByFreshness(books);
  const pendingBooks = sortedBooks.filter((book) => !book.is_read);
  const readBooks = sortedBooks.filter((book) => book.is_read);
  const readingBooks = booksFromIds(books, readingIds);
  const favoriteBooks = booksFromIds(books, favoriteIds);

  return [
    {
      key: "recent",
      title: "Leidos recientemente",
      books: readBooks,
      emptyText: "Los libros terminados apareceran aqui.",
    },
    {
      key: "pending",
      title: "Pendientes",
      books: pendingBooks,
      emptyText: "No tienes libros pendientes.",
    },
    {
      key: "favorites",
      title: "Favoritos",
      books: favoriteBooks,
      emptyText: "Guarda favoritos desde el menu de cualquier portada.",
    },
    {
      key: "reading",
      title: "Actualmente leyendo",
      books: readingBooks.length ? readingBooks : pendingBooks.slice(0, 8),
      emptyText: "Marca un libro como lectura actual desde el menu de una portada.",
    },
  ];
}

function booksFromIds(books, ids) {
  const byId = new Map(books.map((book) => [String(book.id), book]));
  return ids.map((id) => byId.get(String(id))).filter(Boolean);
}

function pickHeroBook(books, readingIds) {
  if (books.length === 0) return null;
  const readingBook = booksFromIds(books, readingIds)[0];
  if (readingBook) return readingBook;
  const sortedBooks = sortBooksByFreshness(books);
  return sortedBooks.find((book) => !book.is_read) ?? sortedBooks[0];
}

function sortBooksByFreshness(books) {
  return [...books].sort((firstBook, secondBook) => {
    const firstTime = getBookTime(firstBook);
    const secondTime = getBookTime(secondBook);
    if (firstTime !== secondTime) return secondTime - firstTime;
    return Number(secondBook.id) - Number(firstBook.id);
  });
}

function getBookTime(book) {
  return new Date(book.updated_at || book.created_at || 0).getTime() || 0;
}

function filterBooksByQuery(books, searchTerm) {
  const query = normalizeSearch(searchTerm);
  if (!query) return books;

  return books.filter(
    (book) =>
      normalizeSearch(book.title).includes(query) ||
      normalizeSearch(book.author).includes(query),
  );
}

function getEstimatedPages(book) {
  const seed = Number(book?.publication_year || book?.id || 0);
  return 280 + (seed % 420);
}

function getReadingProgress(book, isReading) {
  if (!book) return 0;
  if (book.is_read) return 100;
  if (!isReading) return 28 + (Number(book.id || 0) % 24);
  return 24 + (Number(book.id || 0) % 46);
}

function getGenreLabel(book) {
  const text = normalizeSearch(`${book?.title || ""} ${book?.description || ""}`);
  if (text.includes("ciencia") || text.includes("dune") || text.includes("space")) return "Ciencia ficcion";
  if (text.includes("fantasia") || text.includes("hobbit") || text.includes("anillos")) return "Fantasia";
  if (text.includes("terror") || text.includes("dracula")) return "Terror";
  return "Coleccion";
}

function getRating(book) {
  const value = 4 + ((Number(book?.id || 0) % 8) / 10);
  return value.toFixed(1);
}

function normalizeSearch(value) {
  return String(value ?? "")
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toBookPayload(bookForm) {
  return {
    title: bookForm.title.trim(),
    author: bookForm.author.trim() || null,
    isbn: bookForm.isbn.trim() || null,
    publication_year: bookForm.publication_year
      ? Number(bookForm.publication_year)
      : null,
    description: bookForm.description.trim() || null,
    cover_url: bookForm.cover_url.trim() || null,
    cover_source: bookForm.cover_source || null,
    external_id: bookForm.external_id || null,
    is_read: bookForm.is_read,
  };
}

function getStoredSession() {
  const token = sessionStorage.getItem("authToken");
  const user = sessionStorage.getItem("authUser");
  if (!token || !user) {
    clearStoredSession();
    return null;
  }

  try {
    return {
      token,
      user: JSON.parse(user),
    };
  } catch {
    clearStoredSession();
    return null;
  }
}

function clearStoredSession() {
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("authUser");
}

function getStoredTheme() {
  return localStorage.getItem("theme") === "dark";
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
