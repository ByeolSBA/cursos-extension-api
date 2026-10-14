# Cursos de Extensión API

API REST para gestionar cursos, participantes, inscripciones, salones y asignaciones con Express, MongoDB y Mongoose.

## Requisitos

- Node.js 20 o superior (la aplicación se verificó con Node.js 24 LTS).
- MongoDB local o una instancia de MongoDB Atlas accesible.

## Instalación y configuración

Desde PowerShell, en la carpeta del proyecto:

```powershell
npm ci
Copy-Item .env.example .env
```

Edita `.env` y configura una URI válida. Para MongoDB local:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cursos_extension
PORT=3000
```

Para Atlas, utiliza la URI de conexión de tu clúster en `MONGODB_URI`. No compartas ni subas `.env`; está excluido por `.gitignore`.

## Iniciar y probar

Inicia MongoDB y luego ejecuta:

```powershell
npm run dev
```

Si MongoDB Community se instaló desde el ZIP portátil en Windows, abre otra ventana de PowerShell y ejecuta `mongod.exe` con una carpeta de datos persistente. Por ejemplo, ajusta `$mongoHome` a la ubicación donde extrajiste MongoDB:

```powershell
$mongoHome = Join-Path $env:LOCALAPPDATA "Programs\mongodb-community-8.0.34\mongodb-win32-x86_64-windows-8.0.34"
$dataPath = Join-Path $env:LOCALAPPDATA "Programs\mongodb-community-8.0.34\data\cursos-extension"
New-Item -ItemType Directory -Force -Path $dataPath
& "$mongoHome\bin\mongod.exe" --bind_ip 127.0.0.1 --port 27017 --dbpath $dataPath
```

Deja esa ventana abierta mientras uses la API. Para detener el servidor, presiona `Ctrl+C` en ella. Si MongoDB se instaló como servicio de Windows, puedes usar el servicio en su lugar.

Para iniciar sin Nodemon:

```powershell
npm start
```

Las pruebas automatizadas se ejecutan con `npm test`. Cubren las respuestas HTTP, errores de JSON, validación de entradas e identificadores no válidos; no necesitan conectarse a MongoDB ni modifican datos.

Las pruebas de integración opcionales usan un MongoDB local y una base temporal propia:

```powershell
$env:MONGODB_TEST_URI = "mongodb://127.0.0.1:27017/cursos_extension_test"
npm run test:integration
Remove-Item Env:MONGODB_TEST_URI
```

Solo admiten `localhost` o `127.0.0.1`; cada ejecución usa una base identificada únicamente para esa prueba y la elimina al terminar. Nunca configures aquí producción, Atlas ni una base con datos reales.

Para crear o actualizar los datos ficticios de demostración:

```powershell
npm run seed
```

El seed hace inserciones o actualizaciones por claves reconocibles (nombre, correo y relaciones) y no elimina colecciones ni documentos ajenos a sus datos de ejemplo. Aun así, ejecútalo solo contra la base de datos en la que quieras cargar esos ejemplos.

## Endpoints disponibles

Todas las respuestas son JSON. Los identificadores `:id` deben ser ObjectId válidos.

| Recurso | Método | Endpoint | Resultado |
|---|---|---|---|
| Estado | GET | `/` | Mensaje de estado de la API |
| Cursos | GET | `/api/cursos` | Cursos ordenados por nombre |
| Cursos | GET | `/api/cursos/:id` | Detalle de un curso |
| Cursos | POST | `/api/cursos` | Crea un curso (201) |
| Cursos | PUT | `/api/cursos/:id` | Actualiza un curso |
| Cursos | DELETE | `/api/cursos/:id` | Elimina un curso; devuelve 409 si tiene inscripciones o asignaciones relacionadas |
| Inscritos | GET | `/api/cursos/:id/inscritos` | Cuenta inscripciones confirmadas |
| Salones disponibles | GET | `/api/cursos/:id/salones-disponibles` | Salones disponibles con capacidad para los inscritos confirmados |
| Participantes | GET | `/api/participantes` | Lista participantes por nombre |
| Participantes | GET | `/api/participantes/:id` | Detalle de un participante |
| Participantes | POST | `/api/participantes` | Crea un participante (201) |
| Inscripciones | GET | `/api/inscripciones` | Lista inscripciones con curso y participante |
| Inscripciones | GET | `/api/inscripciones/:id` | Detalle de una inscripción con sus relaciones |
| Inscripciones | POST | `/api/inscripciones` | Crea una inscripción después de comprobar sus referencias (201) |
| Salones | GET | `/api/salones` | Lista salones por capacidad |
| Salones | GET | `/api/salones/:id` | Detalle de un salón |
| Salones | POST | `/api/salones` | Crea un salón (201) |
| Asignaciones | GET | `/api/asignaciones` | Lista asignaciones con curso y salón |
| Asignaciones | GET | `/api/asignaciones/:id` | Detalle de una asignación con sus relaciones |
| Asignaciones | POST | `/api/asignaciones` | Crea una asignación después de comprobar sus referencias (201) |

Los errores de validación o identificadores inválidos devuelven 400; los recursos inexistentes, 404; los conflictos por relaciones existentes o claves duplicadas de MongoDB, 409; y los errores inesperados, 500.

## Ejemplos HTTP

Crear un curso:

```http
POST http://localhost:3000/api/cursos
Content-Type: application/json
```

```json
{
  "nombre": "Curso de ejemplo",
  "tipo": "Curso",
  "duracion_horas": 20,
  "cupo_maximo": 25,
  "modalidad": "Presencial",
  "responsable": "Responsable de ejemplo"
}
```

Consultar cursos desde PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/api/cursos
```

## Postman o Thunder Client

Importa [`docs/postman_collection.json`](./docs/postman_collection.json) como colección Postman v2.1. La colección usa `baseUrl` (por defecto `http://localhost:3000`) y variables que se rellenan con los identificadores recibidos. Ejecuta primero «Listar cursos» para que las consultas de inscritos y salones utilicen un curso de ejemplo; el CRUD posterior usa un curso temporal independiente.

1. Configura `.env`, inicia MongoDB y ejecuta `npm run seed` si quieres probar las listas y consultas relacionadas con los datos de ejemplo.
2. Inicia la API con `npm run dev`.
3. Importa el archivo JSON en Postman o en Thunder Client mediante su opción de importar colecciones Postman.
4. Ejecuta las solicitudes en orden. La colección crea, actualiza y al final elimina un curso de demostración sin relaciones; las búsquedas de inscritos y salones usan el curso de ejemplo seleccionado al listar cursos.

La colección fue comprobada como JSON válido; no se afirma que haya sido ejecutada desde Postman o Thunder Client.

Para comprobar una escritura directamente en MongoDB desde otra terminal, usa el `_id` recibido por Postman:

```powershell
mongosh "mongodb://127.0.0.1:27017/cursos_extension" --eval 'db.cursos.findOne({ _id: ObjectId("PEGA_AQUI_EL_ID") })'
```

Después de eliminar el curso, repite la consulta con su identificador: debe devolver `null`. Los nombres de colecciones que Mongoose genera automáticamente pueden comprobarse con `mongosh` usando `db.getCollectionNames()`.

## Solución de problemas

- **No inicia la API:** comprueba que `.env` contiene `MONGODB_URI` y que MongoDB está disponible.
- **`ECONNREFUSED`:** inicia el servicio local de MongoDB o revisa la URI, red y lista de acceso de Atlas.
- **`Ruta no encontrada`:** verifica el prefijo `/api` y el método HTTP de la tabla.
- **`Solicitud inválida`:** envía un objeto JSON válido, completa los campos requeridos y usa un ObjectId válido.
- **Datos de ejemplo:** `npm run seed` solo crea o actualiza los registros identificables del seed; no borra la base de datos.
