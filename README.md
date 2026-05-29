# Biblioteca Personal API

API REST profesional en Python para gestionar una biblioteca personal de libros. El proyecto usa FastAPI y sigue una arquitectura por capas inspirada en MVC, adaptada a APIs modernas.

## Objetivo

Construir paso a paso un proyecto portfolio backend mantenible, fácil de probar y presentable en GitHub.

## Arquitectura

La API se organiza por responsabilidades:

- **Controller**: routers de FastAPI. Reciben la peticion HTTP, validan entrada con schemas y delegan en servicios.
- **Service**: logica de negocio. Decide que debe pasar en cada caso de uso.
- **Repository**: acceso a datos. Encapsula consultas SQLAlchemy para no mezclar persistencia con reglas de negocio.
- **Model**: modelos SQLAlchemy que representan tablas de base de datos.
- **Schema/DTO**: modelos Pydantic para validar requests y serializar responses.
- **Core**: configuracion general de la aplicacion.
- **DB**: configuracion de SQLAlchemy, engine, sesiones y base declarativa.

## Estructura inicial

```text
app/
  api/
    v1/
      endpoints/
        health.py
      router.py
  core/
    config.py
  db/
    base.py
    session.py
  models/
  repositories/
  schemas/
    health.py
  services/
    health_service.py
  main.py
tests/
  test_health.py
```

## Endpoint disponible

```http
GET /api/v1/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "Biblioteca Personal API",
  "version": "0.1.0"
}
```

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

Abrir documentacion Swagger:

```text
http://127.0.0.1:8000/docs
```

Ejecutar tests:

```bash
pytest
```

## Roadmap

1. Endpoint inicial y estructura base.
2. Conexion SQLite con SQLAlchemy.
3. Modelo y CRUD de usuarios.
4. Login con JWT.
5. Modelo y CRUD de libros.
6. Restriccion: cada usuario gestiona solo sus libros.
7. Docker y docker-compose.
8. README final con ejemplos de uso y decisiones tecnicas.
