# Biblioteca Personal API

API REST en Python para gestionar una biblioteca personal de libros.

El objetivo del proyecto es practicar una estructura backend profesional con FastAPI, SQLAlchemy, Pydantic, SQLite y pytest, siguiendo una arquitectura por capas inspirada en MVC pero adaptada a APIs REST modernas.

## Estado actual

La aplicacion ya tiene:

- Estructura modular por capas.
- Conexion a SQLite con SQLAlchemy.
- Modelo `User`.
- Registro de usuarios.
- Frontend basico en React para probar la API.
- Hash de passwords con `bcrypt`.
- Validacion y serializacion con Pydantic.
- Tests automatizados con pytest.
- Documentacion interactiva generada por FastAPI en Swagger/OpenAPI.

Pendiente para siguientes pasos:

- Login con JWT.
- Modelo `Book`.
- CRUD de libros.
- Relacion usuario-libros.
- Proteccion de endpoints por usuario autenticado.
- Docker y docker-compose.

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
app/api/v1/endpoints/users.py
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
POST /api/v1/users
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
app/api/v1/endpoints/users.py
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
    v1/
      endpoints/
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
    user.py
  repositories/
    user_repository.py
  schemas/
    health.py
    user.py
  services/
    health_service.py
    user_service.py
  main.py
tests/
  conftest.py
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
| `app/api/v1/router.py` | Router principal de la version 1 de la API. Agrupa los routers de endpoints. |
| `app/api/v1/endpoints/health.py` | Endpoint de health check para comprobar que la API responde. |
| `app/api/v1/endpoints/users.py` | Endpoint de registro de usuarios. Actua como controller. |
| `app/core/config.py` | Configuracion central de la app usando `pydantic-settings`. |
| `app/core/security.py` | Funciones de seguridad: hashear y verificar passwords. |
| `app/db/base.py` | Define `Base`, la clase base de SQLAlchemy para los modelos. |
| `app/db/session.py` | Crea el engine de SQLAlchemy, la fabrica de sesiones y la dependencia `get_db`. |
| `app/db/init_db.py` | Crea las tablas registradas en los modelos usando `Base.metadata.create_all`. |
| `app/models/user.py` | Modelo SQLAlchemy de la tabla `users`. |
| `app/models/__init__.py` | Importa modelos para que SQLAlchemy los registre en metadata. |
| `app/repositories/user_repository.py` | Encapsula consultas y operaciones de persistencia para usuarios. |
| `app/schemas/health.py` | Schema Pydantic para la respuesta del health check. |
| `app/schemas/user.py` | Schemas Pydantic para crear y devolver usuarios. |
| `app/services/health_service.py` | Logica simple para devolver informacion de estado de la API. |
| `app/services/user_service.py` | Logica de negocio del registro de usuarios. |

### Tests

| Archivo | Responsabilidad |
| --- | --- |
| `tests/conftest.py` | Fixtures compartidas: app de test, SQLite temporal y override de `get_db`. |
| `tests/test_health.py` | Test del endpoint `GET /api/v1/health`. |
| `tests/test_users.py` | Tests del registro de usuario y rechazo de emails duplicados. |

### Frontend

| Archivo | Responsabilidad |
| --- | --- |
| `frontend/package.json` | Dependencias y scripts del frontend React. |
| `frontend/package-lock.json` | Versiones exactas instaladas por npm para reproducir el entorno. |
| `frontend/vite.config.js` | Configuracion de Vite: root, servidor local, puerto y salida del build. |
| `frontend/index.html` | HTML base donde Vite monta la aplicacion React. |
| `frontend/src/api.js` | Cliente HTTP para llamar al backend FastAPI. |
| `frontend/src/main.jsx` | Componentes React principales: estado de API, formulario de registro y respuesta JSON. |
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

## Endpoints disponibles

### Health check

```http
GET /api/v1/health
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
POST /api/v1/users
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

## Frontend React

El frontend vive en:

```text
frontend/
```

Esta pensado como una herramienta sencilla para probar la API desde el navegador mientras se desarrolla el backend.

Permite:

- Comprobar si el backend responde con `GET /api/v1/health`.
- Registrar usuarios con `POST /api/v1/users`.
- Ver la ultima respuesta JSON devuelta por la API.
- Ver errores de validacion o conflictos, por ejemplo emails duplicados.

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
- **Repository pattern**: separa SQLAlchemy de la logica de negocio.
- **Service layer**: mantiene las reglas de negocio fuera de los endpoints.
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
5. Modelo y CRUD de libros.
6. Restriccion: cada usuario gestiona solo sus libros.
7. Docker y docker-compose.
8. README final con ejemplos de uso y decisiones tecnicas.
