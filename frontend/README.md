# Frontend — Ticketing UI (React + Vite)

Interfaz web del sistema de tickets: formulario público para crear tickets, seguimiento del cliente, y panel de agentes.

## Requisitos

- Node `^20.19.0` o `>=22.12.0` (lo pide Vite; con versiones más viejas el build falla)

## Setup

```bash
cd frontend

# Instalar dependencias
npm install

# Levantar el servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:5173/`.

> Necesita el backend corriendo en `http://127.0.0.1:8000` (ver `../backend/README.md`). Si el backend corre en otra URL, se puede sobreescribir con la variable de entorno `VITE_API_URL` (por ejemplo en un `.env.local`).

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Formulario público para crear un ticket (sin login) |
| `/t/:publicId` | Seguimiento público del ticket (estado + conversación con el cliente) |
| `/agent/login` | Login de agentes |
| `/agent` | Dashboard del agente (tickets abiertos, propios, donde lo mencionaron) |
| `/agent/tickets/:id` | Detalle de un ticket (asignar, cambiar estado, comentarios internos) |

## Otros comandos

```bash
npm run build     # build de producción
npm run preview   # sirve el build localmente
npm run lint      # oxlint
```
