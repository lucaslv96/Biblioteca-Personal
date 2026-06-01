# Biblioteca Personal API

API REST en Python para gestionar una biblioteca personal de libros.

El objetivo del proyecto es practicar una estructura backend profesional con FastAPI, SQLAlchemy, Pydantic, SQLite y pytest, siguiendo una arquitectura por capas inspirada en MVC pero adaptada a APIs REST modernas.

## Estado actual

La aplicacion ya tiene:

- Estructura modular por capas.
- Conexion a SQLite con SQLAlchemy.
- Modelo `User`.
- Modelo `Book`.
- Registro de usuarios.
- Login con JWT.
- CRUD de libros protegido por JWT.
- Busqueda de portadas con Open Library y seleccion manual desde el frontend.
- Campo ISBN en libros y busqueda de portada priorizando ISBN cuando esta disponible.
- Cada usuario solo puede gestionar sus propios libros.
- Frontend basico en React para login y gestion de libros.
- Hash de passwords con `bcrypt`.
- Validacion y serializacion con Pydantic.
- Tests automatizados con pytest.
- Documentacion interactiva generada por FastAPI en Swagger/OpenAPI.

Pendiente para siguientes pasos:

- Docker y docker-compose.
- Migraciones con Alembic.
- Recuperacion real de password por email.
- Subida de imagen local para portadas propias.

## Arquitectura usada

La arquitectura esta inspirada en MVC, pero adaptada a una API REST:

```text
HTTP request
  -> Controller / Router
  -> Schema / DTO
  -> Service
  -> Repository
  -> Model
  -> Database
```

### Controller

Los controllers son los routers de FastAPI.

Responsabilidades:

- Definir rutas HTTP.
- Recibir requests.
- Declarar dependencias.
- Devolver status codes correctos.
- Traducir errores de negocio a errores HTTP.

No deben contener logica de negocio ni queries SQL.

Ejemplo:

```text
app/api/endpoints/users.py
```

### Schema / DTO

Los schemas son modelos Pydantic.

Responsabilidades:

- Validar datos de entrada.
- Definir que campos acepta la API.
- Definir que campos devuelve la API.
- Evitar exponer datos sensibles.

Ejemplo importante: `UserRead` no devuelve `password` ni `hashed_password`.

```text
app/schemas/user.py
```

### Service

La capa service contiene la logica de negocio.

Responsabilidades:

- Aplicar reglas del caso de uso.
- Normalizar datos.
- Comprobar condiciones de negocio.
- Coordinar repositories.
- Lanzar errores propios del dominio.

Ejemplo actual:

- Convierte el email a minusculas.
- Comprueba si el usuario ya existe.
- Hashea la password.
- Crea el usuario usando el repository.

```text
app/services/user_service.py
```

### Repository

La capa repository encapsula el acceso a datos.

Responsabilidades:

- Ejecutar consultas SQLAlchemy.
- Crear registros.
- Leer registros.
- Hacer `commit`, `refresh` y `rollback` cuando corresponde.

Esto evita que los endpoints o services tengan SQL mezclado directamente.

```text
app/repositories/user_repository.py
```

### Model

Los models son clases SQLAlchemy que representan tablas de base de datos.

Responsabilidades:

- Definir columnas.
- Definir tipos.
- Definir indices.
- Definir restricciones como `unique=True`.
- Mas adelante, definir relaciones entre tablas.

```text
app/models/user.py
```

### DB

La capa `db` contiene la configuracion de SQLAlchemy.

Responsabilidades:

- Crear el engine.
- Crear sesiones de base de datos.
- Definir la clase base para modelos.
- Inicializar tablas.

```text
app/db/
```

### Core

La capa `core` contiene configuracion y utilidades transversales.

Responsabilidades:

- Leer variables de entorno.
- Centralizar configuracion.
- Funciones de seguridad reutilizables.

```text
app/core/
```

## Flujo de registro de usuario

Cuando se llama a:

```http
POST /api/users
```

El flujo es:

```text
1. FastAPI recibe la request.
2. users.py valida el body usando UserCreate.
3. users.py llama a UserService.
4. UserService aplica reglas de negocio.
5. UserService usa UserRepository para consultar/guardar.
6. UserRepository usa SQLAlchemy.
7. SQLAlchemy guarda el usuario en SQLite.
8. FastAPI devuelve UserRead como respuesta.
```

Representacion corta:

```text
app/api/endpoints/users.py
  -> app/schemas/user.py
  -> app/services/user_service.py
  -> app/repositories/user_repository.py
  -> app/models/user.py
  -> SQLite
```

## Estructura del proyecto

```text
app/
  api/
    deps.py
    endpoints/
      auth.py
      books.py
      health.py
      users.py
    router.py
  core/
    config.py
    security.py
  db/
    base.py
    init_db.py
    session.py
  models/
    book.py
    user.py
  repositories/
    book_repository.py
    user_repository.py
  schemas/
    auth.py
    book.py
    health.py
    user.py
  services/
    auth_service.py
    book_cover_service.py
    book_service.py
    health_service.py
    user_service.py
  main.py
tests/
  conftest.py
  test_auth.py
  test_books.py
  test_health.py
  test_users.py
frontend/
  index.html
  package.json
  vite.config.js
  src/
    api.js
    main.jsx
    styles.css
```

## Que hace cada archivo

### Raiz del proyecto

| Archivo | Responsabilidad |
| --- | --- |
| `README.md` | Documentacion del proyecto, arquitectura, ejecucion y roadmap. |
| `pyproject.toml` | Metadatos del proyecto, dependencias y configuracion de pytest. |
| `.env.example` | Ejemplo de variables de entorno necesarias para ejecutar la app. |
| `.gitignore` | Archivos que no deben subirse al repositorio, como `.venv`, caches y bases locales. |

### Aplicacion

| Archivo | Responsabilidad |
| --- | --- |
| `app/main.py` | Crea la instancia FastAPI, registra routers y ejecuta la inicializacion de la base de datos al arrancar. |
| `app/api/deps.py` | Dependencias compartidas de FastAPI, incluyendo usuario autenticado desde JWT. |
| `app/api/router.py` | Router principal de la API. Agrupa los routers de endpoints. |
| `app/api/endpoints/auth.py` | Endpoint de login. Valida credenciales y devuelve JWT. |
| `app/api/endpoints/books.py` | Endpoints CRUD de libros y busqueda de portadas, protegidos por autenticacion. |
| `app/api/endpoints/health.py` | Endpoint de health check para comprobar que la API responde. |
| `app/api/endpoints/users.py` | Endpoint de registro de usuarios. Actua como controller. |
| `app/core/config.py` | Configuracion central de la app usando `pydantic-settings`. |
| `app/core/security.py` | Funciones de seguridad: hashear/verificar passwords y crear tokens JWT. |
| `app/db/base.py` | Define `Base`, la clase base de SQLAlchemy para los modelos. |
| `app/db/session.py` | Crea el engine de SQLAlchemy, la fabrica de sesiones y la dependencia `get_db`. |
| `app/db/init_db.py` | Crea las tablas registradas en los modelos usando `Base.metadata.create_all`. |
| `app/models/book.py` | Modelo SQLAlchemy de la tabla `books`. |
| `app/models/user.py` | Modelo SQLAlchemy de la tabla `users`. |
| `app/models/__init__.py` | Importa modelos para que SQLAlchemy los registre en metadata. |
| `app/repositories/book_repository.py` | Encapsula consultas y operaciones de persistencia para libros. |
| `app/repositories/user_repository.py` | Encapsula consultas y operaciones de persistencia para usuarios. |
| `app/schemas/auth.py` | Schemas Pydantic para login y respuesta con token. |
| `app/schemas/book.py` | Schemas Pydantic para crear, editar, devolver libros y normalizar candidatos de portada. |
| `app/schemas/health.py` | Schema Pydantic para la respuesta del health check. |
| `app/schemas/user.py` | Schemas Pydantic para crear y devolver usuarios. |
| `app/services/auth_service.py` | Logica de negocio del login: autenticar usuario y generar token. |
| `app/services/book_cover_service.py` | Consulta Open Library y transforma sus resultados en candidatos de portada simples para la API. |
| `app/services/book_service.py` | Logica de negocio del CRUD de libros y filtrado por usuario. |
| `app/services/health_service.py` | Logica simple para devolver informacion de estado de la API. |
| `app/services/user_service.py` | Logica de negocio del registro de usuarios. |

### Tests

| Archivo | Responsabilidad |
| --- | --- |
| `tests/conftest.py` | Fixtures compartidas: app de test, SQLite temporal y override de `get_db`. |
| `tests/test_auth.py` | Tests del login correcto y rechazo de credenciales invalidas. |
| `tests/test_books.py` | Tests del CRUD de libros, portadas, autenticacion y aislamiento por usuario. |
| `tests/test_health.py` | Test del endpoint `GET /api/health`. |
| `tests/test_users.py` | Tests del registro de usuario y rechazo de emails duplicados. |

### Frontend

| Archivo | Responsabilidad |
| --- | --- |
| `frontend/package.json` | Dependencias y scripts del frontend React. |
| `frontend/package-lock.json` | Versiones exactas instaladas por npm para reproducir el entorno. |
| `frontend/vite.config.js` | Configuracion de Vite: root, servidor local, puerto y salida del build. |
| `frontend/index.html` | HTML base donde Vite monta la aplicacion React. |
| `frontend/src/api.js` | Cliente HTTP para llamar al backend FastAPI, incluyendo busqueda de portadas. |
| `frontend/src/main.jsx` | Componentes React principales: login, crear cuenta, recuperar password, CRUD de libros y seleccion de portada. |
| `frontend/src/styles.css` | Estilos visuales del frontend. |

## Base de datos

La aplicacion usa SQLite inicialmente:

```text
sqlite:///./biblioteca.db
```

Esta URL se configura en:

```text
app/core/config.py
```

Y puede sobrescribirse con una variable de entorno:

```text
DATABASE_URL="sqlite:///./biblioteca.db"
```

### Como se crea la base de datos

Cuando la aplicacion arranca, FastAPI ejecuta el `lifespan` definido en `app/main.py`.

Dentro de ese arranque se llama a:

```text
init_db()
```

Ese metodo ejecuta:

```text
Base.metadata.create_all(bind=engine)
```

Esto crea en SQLite las tablas definidas en los modelos SQLAlchemy.

Para esta fase inicial es una solucion practica. En un proyecto productivo, el siguiente paso profesional seria usar Alembic para gestionar migraciones versionadas.

### Tabla `users`

Modelo definido en:

```text
app/models/user.py
```

Campos actuales:

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Integer | Identificador principal del usuario. |
| `email` | String | Email unico del usuario. Tiene indice y restriccion `unique`. |
| `full_name` | String nullable | Nombre completo opcional. |
| `hashed_password` | String | Password hasheada con `bcrypt`. Nunca se devuelve en la API. |
| `is_active` | Boolean | Indica si el usuario esta activo. |
| `created_at` | DateTime | Fecha de creacion en UTC. |

### Tabla `books`

Modelo definido en:

```text
app/models/book.py
```

Campos actuales:

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | Integer | Identificador principal del libro. |
| `title` | String | Titulo del libro. |
| `author` | String nullable | Autor opcional. |
| `isbn` | String nullable | ISBN opcional usado para identificar ediciones y buscar portadas. |
| `description` | Text nullable | Notas o descripcion opcional. |
| `publication_year` | Integer nullable | Ano de publicacion opcional. |
| `cover_url` | String nullable | URL de la portada seleccionada o indicada manualmente. |
| `cover_source` | String nullable | Fuente de la portada, por ejemplo `open_library`. |
| `external_id` | String nullable | Identificador externo del resultado usado como referencia. |
| `is_read` | Boolean | Indica si el usuario ya ha leido el libro. |
| `owner_id` | Integer | Usuario propietario del libro. |
| `created_at` | DateTime | Fecha de creacion en UTC. |
| `updated_at` | DateTime | Fecha de ultima actualizacion en UTC. |

## Endpoints disponibles

### Health check

```http
GET /api/health
```

Respuesta:

```json
{
  "status": "ok",
  "service": "Biblioteca Personal API",
  "version": "0.1.0"
}
```

### Registro de usuario

```http
POST /api/users
```

Body:

```json
{
  "email": "lucas@example.com",
  "password": "supersecret",
  "full_name": "Lucas"
}
```

Respuesta:

```json
{
  "id": 1,
  "email": "lucas@example.com",
  "full_name": "Lucas",
  "is_active": true,
  "created_at": "2026-05-29T10:00:00"
}
```

Si el email ya existe:

```json
{
  "detail": "A user with this email already exists."
}
```

Status code:

```text
409 Conflict
```

### Login

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "lucas@example.com",
  "password": "supersecret"
}
```

Respuesta:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "lucas@example.com",
    "full_name": "Lucas",
    "is_active": true,
    "created_at": "2026-05-29T10:00:00"
  }
}
```

Si las credenciales son incorrectas:

```json
{
  "detail": "Invalid email or password."
}
```

Status code:

```text
401 Unauthorized
```

### Listar libros

```http
GET /api/books
Authorization: Bearer <access_token>
```

Respuesta:

```json
[
  {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "9780132350884",
    "description": "Notas personales",
    "publication_year": 2008,
    "cover_url": "https://covers.openlibrary.org/b/id/123-L.jpg",
    "cover_source": "open_library",
    "external_id": "/works/OL123W",
    "is_read": true,
    "owner_id": 1,
    "created_at": "2026-05-30T10:00:00",
    "updated_at": "2026-05-30T10:00:00"
  }
]
```

### Crear libro

```http
POST /api/books
Authorization: Bearer <access_token>
```

Body:

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "description": "Notas personales",
  "publication_year": 2008,
  "cover_url": "https://covers.openlibrary.org/b/id/123-L.jpg",
  "cover_source": "open_library",
  "external_id": "/works/OL123W",
  "is_read": true
}
```

### Buscar portadas

```http
GET /api/books/covers/search?title=Clean%20Code&author=Robert%20C.%20Martin&limit=8
Authorization: Bearer <access_token>
```

Tambien puede buscar por ISBN:

```http
GET /api/books/covers/search?isbn=9780132350884&limit=8
Authorization: Bearer <access_token>
```

Respuesta:

```json
[
  {
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "9780132350884",
    "publication_year": 2008,
    "cover_url": "https://covers.openlibrary.org/b/id/123-L.jpg",
    "thumbnail_url": "https://covers.openlibrary.org/b/id/123-M.jpg",
    "source": "open_library",
    "external_id": "/works/OL123W"
  }
]
```

Este endpoint no guarda nada por si solo. Devuelve candidatos para que el usuario elija una portada y despues esa URL se guarda con el libro. Si se envia `isbn`, se prioriza la busqueda por ISBN. Si no hay ISBN, se busca por titulo y autor opcional.

### Editar libro

```http
PATCH /api/books/{book_id}
Authorization: Bearer <access_token>
```

Body:

```json
{
  "is_read": false
}
```

### Eliminar libro

```http
DELETE /api/books/{book_id}
Authorization: Bearer <access_token>
```

Status code:

```text
204 No Content
```

## Frontend React

El frontend vive en:

```text
frontend/
```

Esta pensado como una interfaz sencilla de producto para probar el flujo de acceso y una vista principal del usuario.

Permite:

- Iniciar sesion con `POST /api/auth/login`.
- Entrar en una pantalla principal cuando las credenciales son correctas.
- Registrar usuarios con `POST /api/users`.
- Crear, listar, editar, marcar como leidos y borrar libros.
- Guardar ISBN de cada libro.
- Pegar una URL manual de portada.
- Buscar portadas por ISBN o por titulo/autor y elegir una opcion de Open Library.
- Acceder a una pantalla de recuperacion de password pendiente de backend.

Por defecto llama al backend en:

```text
http://127.0.0.1:8000
```

Si quieres cambiarlo, puedes crear un archivo `frontend/.env`:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Tests

Los tests no usan la base real `biblioteca.db`.

En `tests/conftest.py` se crea una base SQLite temporal con `tmp_path` y se reemplaza la dependencia real `get_db` por una dependencia de test:

```text
app.dependency_overrides[get_db] = _override_get_db
```

Esto permite probar endpoints reales sin tocar datos locales.

## Decisiones tecnicas

- **FastAPI**: framework moderno, rapido y con Swagger/OpenAPI automatico.
- **SQLAlchemy 2.0**: ORM robusto con tipado moderno usando `Mapped` y `mapped_column`.
- **SQLite**: base de datos simple para empezar sin depender de servicios externos.
- **Pydantic**: validacion clara de entrada y salida.
- **bcrypt**: las passwords se guardan hasheadas, nunca en texto plano.
- **JWT**: el login devuelve un access token que el frontend guarda en `sessionStorage`.
- **Ownership por usuario**: los libros siempre se consultan por `owner_id`, asi un usuario no puede acceder a libros de otro.
- **Repository pattern**: separa SQLAlchemy de la logica de negocio.
- **Service layer**: mantiene las reglas de negocio fuera de los endpoints.
- **Open Library**: se usa como fuente externa de portadas; la API propia normaliza sus resultados antes de enviarlos al frontend.
- **ISBN opcional**: cuando existe, se usa como identificador mas preciso para buscar portadas de una edicion concreta.
- **pytest**: permite validar el comportamiento de la API de forma automatizada.
- **App factory**: `create_app(init_database=False)` facilita crear una app especial para tests.

## Ejecucion local

Crear entorno virtual:

```bash
python -m venv .venv
```

Activarlo en Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instalar dependencias:

```bash
pip install -e ".[dev]"
```

Opcionalmente, crear configuracion local:

```bash
cp .env.example .env
```

Levantar la API:

```bash
uvicorn app.main:app --reload
```

Abrir Swagger:

```text
http://127.0.0.1:8000/docs
```

Ejecutar tests:

```bash
pytest
```

Instalar dependencias del frontend:

```bash
cd frontend
npm install
```

Levantar el frontend:

```bash
npm run dev
```

Abrir la app React:

```text
http://127.0.0.1:5173
```

Compilar el frontend:

```bash
npm run build
```

## Como explicar este proyecto en una entrevista

Este proyecto demuestra que la API no esta organizada solo por archivos, sino por responsabilidades.

La logica de negocio no vive en los endpoints. Los endpoints reciben HTTP y delegan en services. Los services aplican reglas de negocio y usan repositories. Los repositories son los unicos que conocen los detalles de SQLAlchemy. Los schemas controlan que entra y que sale de la API. Esto hace que el codigo sea mas facil de mantener, testear y ampliar.

## Roadmap

1. Endpoint inicial y estructura base.
2. Conexion SQLite con SQLAlchemy.
3. Modelo y registro de usuarios.
4. Login con JWT.
5. Frontend React basico con login y crear cuenta.
6. Modelo y CRUD de libros.
7. Restriccion: cada usuario gestiona solo sus libros.
8. Frontend conectado al CRUD real de libros.
9. Busqueda y seleccion de portadas desde Open Library.
10. Campo ISBN y busqueda de portadas priorizando ISBN.
11. Docker y docker-compose.
12. Migraciones con Alembic.
