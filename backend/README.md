# Backend — Ticketing API (Django + DRF)

API REST para el sistema de tickets de soporte, construida con Django 6 y Django REST Framework.

## Requisitos

- Python 3.12+

## Setup

```bash
cd backend

# Crear y activar el entorno virtual
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones
python manage.py migrate

# (Opcional) crear agentes y un ticket de ejemplo con datos de prueba
python manage.py seed_agents

# Levantar el servidor de desarrollo
python manage.py runserver
```

La API queda disponible en `http://127.0.0.1:8000/api/`.

## Usuarios de prueba

`python manage.py seed_agents` crea 3 agentes (contraseña `demo1234` para los tres) y un ticket de ejemplo con una conversación ya armada:

| Username | Email |
|---|---|
| fabrizio | fabrizio@gmail.com |
| luciano | luciano@gmail.com |
| kallic | kallic@gmail.com |

También podés crear un superusuario para entrar al admin (`/admin/`):

```bash
python manage.py createsuperuser
```

## Estructura

- `apps/accounts/` — autenticación de agentes (login/logout/me) y listado de agentes.
- `apps/tickets/` — dominio de tickets: modelo, `ViewSet` con las acciones de agente (`open`, `mine`, `mentions`, `assign`, `status`, `comments`, `history`) y el `ViewSet` público que usa el cliente para ver/responder su ticket por `public_id`.

## Notas

- La base de datos es SQLite (`db.sqlite3`, generado al correr `migrate`, ignorado en git).
- CORS está habilitado para `http://localhost:5173` (el frontend en desarrollo).
