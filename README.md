# Cursos de Extensión API

API REST para gestionar cursos, participantes, inscripciones, salones y asignaciones.

## Tecnologías

Node.js, Express, MongoDB, Mongoose, dotenv, cors y nodemon.

## Configuración

Requisitos: Node.js y MongoDB en ejecución.

```bash
npm install
```

Configura `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cursos_extension
PORT=3000
```

## Uso

```bash
npm run seed
npm run dev
```

## Endpoints

- `/api/cursos`: listar, consultar, crear, actualizar y eliminar cursos.
- `/api/cursos/:id/inscritos`: contar inscritos confirmados.
- `/api/cursos/:id/salones-disponibles`: consultar salones disponibles con capacidad suficiente.
- `/api/participantes`: listar, consultar y crear participantes.
- `/api/inscripciones`: listar, consultar y crear inscripciones.
- `/api/salones`: listar, consultar y crear salones.
- `/api/asignaciones`: listar, consultar y crear asignaciones.

```bash
curl http://localhost:3000/
curl http://localhost:3000/api/cursos
```
