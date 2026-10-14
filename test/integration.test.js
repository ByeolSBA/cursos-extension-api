const assert = require('node:assert/strict');
const { test } = require('node:test');
const mongoose = require('mongoose');
const { app } = require('../src/server');
const Curso = require('../src/models/Curso');
const Participante = require('../src/models/Participante');
const Inscripcion = require('../src/models/Inscripcion');

function getTestDatabaseUri() {
  const uri = process.env.MONGODB_TEST_URI;
  if (!uri) {
    throw new Error('Define MONGODB_TEST_URI para ejecutar las pruebas de integración.');
  }

  const parsed = new URL(uri);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)) {
    throw new Error('Las pruebas de integración solo se permiten contra MongoDB local.');
  }

  parsed.pathname = `/cursos_extension_test_${process.pid}_${Date.now()}`;
  return parsed.toString();
}

test(
  'MongoDB integration: HTTP course CRUD persists and preserves related records',
  { timeout: 30000, skip: !process.env.MONGODB_TEST_URI },
  async () => {
    const uri = getTestDatabaseUri();
    await mongoose.connect(uri);
    const testDatabase = mongoose.connection.db;
    const server = app.listen(0, '127.0.0.1');

    try {
      await new Promise((resolve) => server.once('listening', resolve));
      const address = server.address();
      assert.ok(address && typeof address === 'object');
      const baseUrl = `http://127.0.0.1:${address.port}`;

      const createdResponse = await fetch(`${baseUrl}/api/cursos`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Curso de integración',
          tipo: 'Curso',
          duracion_horas: 12,
          cupo_maximo: 20,
          modalidad: 'Presencial',
          responsable: 'Prueba de integración'
        })
      });
      assert.equal(createdResponse.status, 201);
      const created = await createdResponse.json();
      const persisted = await Curso.findById(created._id).lean();
      assert.equal(persisted.nombre, 'Curso de integración');

      const updatedResponse = await fetch(`${baseUrl}/api/cursos/${created._id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cupo_maximo: 30 })
      });
      assert.equal(updatedResponse.status, 200);
      assert.equal((await Curso.findById(created._id).lean()).cupo_maximo, 30);

      const participante = await Participante.create({
        nombre: 'Participante de integración',
        email: 'integracion@example.com',
        tipo_participante: 'Estudiante'
      });
      const inscripcion = await Inscripcion.create({
        participante_id: participante._id,
        curso_id: created._id,
        estado: 'Confirmada'
      });

      const conflictResponse = await fetch(`${baseUrl}/api/cursos/${created._id}`, { method: 'DELETE' });
      assert.equal(conflictResponse.status, 409);
      assert.ok(await Curso.findById(created._id));

      await Inscripcion.findByIdAndDelete(inscripcion._id);
      await Participante.findByIdAndDelete(participante._id);
      const deletedResponse = await fetch(`${baseUrl}/api/cursos/${created._id}`, { method: 'DELETE' });
      assert.equal(deletedResponse.status, 200);
      assert.equal(await Curso.findById(created._id), null);
    } finally {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await testDatabase.dropDatabase();
      await mongoose.disconnect();
    }
  }
);
