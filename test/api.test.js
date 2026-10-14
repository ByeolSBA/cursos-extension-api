const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { app } = require('../src/server');
const Asignacion = require('../src/models/Asignacion');
const Curso = require('../src/models/Curso');
const Inscripcion = require('../src/models/Inscripcion');
const Participante = require('../src/models/Participante');
const Salon = require('../src/models/Salon');

let server;
let baseUrl;
const id = '507f1f77bcf86cd799439011';

function queryResult(result) {
  return {
    populate() {
      return this;
    },
    sort() {
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve(result).then(resolve, reject);
    }
  };
}

async function withStubs(stubs, callback) {
  const descriptors = stubs.map(([target, key, implementation]) => {
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    target[key] = implementation;
    return { target, key, descriptor };
  });

  try {
    await callback();
  } finally {
    for (const { target, key, descriptor } of descriptors.reverse()) {
      if (descriptor) {
        Object.defineProperty(target, key, descriptor);
      } else {
        delete target[key];
      }
    }
  }
}

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('GET / returns a JSON health response without connecting to MongoDB', async () => {
  const response = await fetch(baseUrl);

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await response.json(), { message: 'API de Cursos de Extensión funcionando' });
});

test('unknown routes return a JSON 404', async () => {
  const response = await fetch(`${baseUrl}/missing`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Ruta no encontrada' });
});

test('malformed JSON returns a JSON 400', async () => {
  const response = await fetch(`${baseUrl}/api/cursos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{"nombre":'
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'El cuerpo de la solicitud no contiene JSON válido' });
});

test('write endpoints reject a non-object JSON body', async () => {
  const response = await fetch(`${baseUrl}/api/cursos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '[]'
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'El cuerpo de la solicitud debe ser un objeto JSON' });
});

test('course creation reports missing required fields as a JSON 400', async () => {
  const response = await fetch(`${baseUrl}/api/cursos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}'
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Solicitud inválida' });
});

test('participant creation rejects an invalid email address', async () => {
  const response = await fetch(`${baseUrl}/api/participantes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Participante de prueba',
      email: 'no-es-un-correo',
      tipo_participante: 'Estudiante'
    })
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Solicitud inválida' });
});

test('resource lookups reject malformed MongoDB identifiers with a JSON 400', async () => {
  const paths = [
    '/api/cursos/no-es-un-id',
    '/api/cursos/no-es-un-id/inscritos',
    '/api/cursos/no-es-un-id/salones-disponibles',
    '/api/participantes/no-es-un-id',
    '/api/inscripciones/no-es-un-id',
    '/api/salones/no-es-un-id',
    '/api/asignaciones/no-es-un-id'
  ];

  for (const path of paths) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 400, path);
    assert.deepEqual(await response.json(), { error: 'Solicitud inválida' }, path);
  }
});

test('course routes list, retrieve, create, and update records', async () => {
  const curso = { _id: id, nombre: 'Curso de prueba' };
  await withStubs([
    [Curso, 'find', () => queryResult([curso])],
    [Curso, 'findById', async () => curso],
    [Curso, 'create', async () => curso],
    [Curso, 'findByIdAndUpdate', async () => curso]
  ], async () => {
    const listed = await fetch(`${baseUrl}/api/cursos`);
    assert.equal(listed.status, 200);
    assert.deepEqual(await listed.json(), [curso]);

    const retrieved = await fetch(`${baseUrl}/api/cursos/${id}`);
    assert.equal(retrieved.status, 200);
    assert.deepEqual(await retrieved.json(), curso);

    const created = await fetch(`${baseUrl}/api/cursos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nombre: 'Curso de prueba' })
    });
    assert.equal(created.status, 201);
    assert.deepEqual(await created.json(), curso);

    const updated = await fetch(`${baseUrl}/api/cursos/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nombre: 'Curso actualizado' })
    });
    assert.equal(updated.status, 200);
    assert.deepEqual(await updated.json(), curso);
  });
});

test('course deletion succeeds only when no related records exist', async () => {
  const curso = { _id: id, nombre: 'Curso de prueba' };
  let deleted = false;
  await withStubs([
    [Inscripcion, 'countDocuments', async () => 0],
    [Asignacion, 'countDocuments', async () => 0],
    [Curso, 'findByIdAndDelete', async () => { deleted = true; return curso; }]
  ], async () => {
    const response = await fetch(`${baseUrl}/api/cursos/${id}`, { method: 'DELETE' });

    assert.equal(response.status, 200);
    assert.equal(deleted, true);
    assert.equal((await response.json()).curso._id, id);
  });

  deleted = false;
  await withStubs([
    [Inscripcion, 'countDocuments', async () => 1],
    [Asignacion, 'countDocuments', async () => 0],
    [Curso, 'findByIdAndDelete', async () => { deleted = true; return curso; }]
  ], async () => {
    const response = await fetch(`${baseUrl}/api/cursos/${id}`, { method: 'DELETE' });

    assert.equal(response.status, 409);
    assert.equal(deleted, false);
  });
});

test('course-related routes count confirmed registrations and find suitable rooms', async () => {
  const curso = { _id: id, nombre: 'Curso de prueba' };
  const salones = [{ _id: id, capacidad: 20, disponible: true }];
  let salonFilter;
  await withStubs([
    [Curso, 'findById', async () => curso],
    [Inscripcion, 'countDocuments', async () => 3],
    [Salon, 'find', (filter) => { salonFilter = filter; return queryResult(salones); }]
  ], async () => {
    const count = await fetch(`${baseUrl}/api/cursos/${id}/inscritos`);
    assert.equal(count.status, 200);
    assert.deepEqual(await count.json(), { curso: curso.nombre, inscritos_confirmados: 3 });

    const available = await fetch(`${baseUrl}/api/cursos/${id}/salones-disponibles`);
    assert.equal(available.status, 200);
    assert.deepEqual(await available.json(), salones);
    assert.deepEqual(salonFilter, { disponible: true, capacidad: { $gte: 3 } });
  });
});

test('participant, registration, and assignment lists return JSON', async () => {
  const records = [
    [Participante, [{ _id: id, nombre: 'Participante de prueba' }]],
    [Inscripcion, [{ _id: id, curso_id: { nombre: 'Curso de prueba' } }]],
    [Asignacion, [{ _id: id, salon_id: { nombre: 'Salón de prueba' } }]]
  ];

  await withStubs(records.map(([model, result]) => [model, 'find', () => queryResult(result)]), async () => {
    for (const resource of ['participantes', 'inscripciones', 'asignaciones']) {
      const response = await fetch(`${baseUrl}/api/${resource}`);
      assert.equal(response.status, 200, resource);
      assert.equal(Array.isArray(await response.json()), true, resource);
    }
  });
});
