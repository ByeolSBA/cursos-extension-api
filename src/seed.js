require('dotenv').config();

const mongoose = require('mongoose');
const Curso = require('./models/Curso');
const Participante = require('./models/Participante');
const Inscripcion = require('./models/Inscripcion');
const Salon = require('./models/Salon');
const Asignacion = require('./models/Asignacion');

const cursosIniciales = [
  ['Curso de Ciberseguridad Básica', 'Curso', 40, 30, 'Presencial', 'Laura Méndez'],
  ['Diplomado en Desarrollo Web', 'Diplomado', 120, 25, 'Virtual', 'Carlos Ramírez'],
  ['Seminario de Inteligencia Artificial', 'Seminario', 12, 40, 'Presencial', 'Ana Torres'],
  ['Curso de Excel Avanzado', 'Curso', 24, 20, 'Presencial', 'Jorge Castillo'],
  ['Diplomado en Gestión Empresarial', 'Diplomado', 100, 30, 'Virtual', 'Marta Ríos'],
  ['Taller de Marketing Digital', 'Taller', 8, 35, 'Presencial', 'Diego Herrera'],
  ['Curso de Programación en Python', 'Curso', 32, 25, 'Virtual', 'Sofía Vega'],
  ['Seminario de Transformación Digital', 'Seminario', 10, 45, 'Virtual', 'Andrés Gil'],
  ['Curso de Gestión de Proyectos', 'Curso', 28, 30, 'Presencial', 'Paula León'],
  ['Diplomado en Seguridad Informática', 'Diplomado', 110, 20, 'Virtual', 'Ricardo Cruz']
];

const participantesIniciales = [
  ['María López', 'maria.lopez@example.com', 'Estudiante'],
  ['Juan Pérez', 'juan.perez@example.com', 'Estudiante'],
  ['Camila Ruiz', 'camila.ruiz@example.com', 'Externo'],
  ['Pedro Gómez', 'pedro.gomez@example.com', 'Administrativo'],
  ['Valentina Díaz', 'valentina.diaz@example.com', 'Estudiante'],
  ['Daniela Mora', 'daniela.mora@example.com', 'Externo'],
  ['Santiago Rojas', 'santiago.rojas@example.com', 'Estudiante'],
  ['Lucía Navarro', 'lucia.navarro@example.com', 'Administrativo'],
  ['Mateo Silva', 'mateo.silva@example.com', 'Estudiante'],
  ['Isabella Ortiz', 'isabella.ortiz@example.com', 'Externo']
];

const salonesIniciales = [
  ['Salón A-101', 'Edificio A, primer piso', 20, 'Aula', true],
  ['Salón A-102', 'Edificio A, primer piso', 30, 'Aula', true],
  ['Laboratorio B-201', 'Edificio B, segundo piso', 25, 'Laboratorio', true],
  ['Auditorio Central', 'Edificio principal', 100, 'Auditorio', true],
  ['Salón C-301', 'Edificio C, tercer piso', 40, 'Aula', true],
  ['Sala de Cómputo B-202', 'Edificio B, segundo piso', 35, 'Laboratorio', false],
  ['Salón D-101', 'Edificio D, primer piso', 15, 'Aula', true],
  ['Sala de Conferencias', 'Edificio principal, segundo piso', 50, 'Conferencias', true],
  ['Salón C-302', 'Edificio C, tercer piso', 25, 'Aula', true],
  ['Laboratorio de Redes', 'Edificio B, primer piso', 20, 'Laboratorio', true]
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('La variable de entorno MONGODB_URI es obligatoria');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([
    Asignacion.deleteMany({}),
    Inscripcion.deleteMany({}),
    Salon.deleteMany({}),
    Participante.deleteMany({}),
    Curso.deleteMany({})
  ]);

  const cursos = await Curso.insertMany(
    cursosIniciales.map(([nombre, tipo, duracion_horas, cupo_maximo, modalidad, responsable], index) => ({
      nombre,
      tipo,
      duracion_horas,
      cupo_maximo,
      modalidad,
      responsable,
      estado: index === 9 ? 'Inactivo' : 'Activo'
    }))
  );
  const participantes = await Participante.insertMany(
    participantesIniciales.map(([nombre, email, tipo_participante], index) => ({
      nombre,
      email,
      tipo_participante,
      estado: index === 9 ? 'Inactivo' : 'Activo'
    }))
  );
  const salones = await Salon.insertMany(
    salonesIniciales.map(([nombre, ubicacion, capacidad, tipo, disponible]) => ({
      nombre,
      ubicacion,
      capacidad,
      tipo,
      disponible
    }))
  );

  await Inscripcion.insertMany(
    participantes.map((participante, index) => ({
      participante_id: participante._id,
      curso_id: cursos[index],
      fecha_inscripcion: new Date(Date.UTC(2026, 0, index + 1)),
      estado: index < 7 ? 'Confirmada' : index === 7 ? 'Pendiente' : 'Cancelada'
    }))
  );
  await Asignacion.insertMany(
    cursos.map((curso, index) => ({
      curso_id: curso._id,
      salon_id: salones[index],
      fecha_inicio: new Date(Date.UTC(2026, 1, index + 1)),
      hora_inicio: `${String(9 + (index % 8)).padStart(2, '0')}:00`,
      duracion_horas: curso.duracion_horas,
      estado: index === 9 ? 'Pendiente' : 'Asignada'
    }))
  );

  console.log('Seed completado: 10 cursos, 10 participantes, 10 inscripciones, 10 salones y 10 asignaciones.');
}

seed()
  .catch((error) => {
    console.error('No se pudo cargar el seed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
