// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Task = require('./models/Task'); // Importaremos el modelo de Tarea

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (código intermedio)
app.use(cors());
app.use(express.json());

// Conexión a la base de datos MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado exitosamente.'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// --- RUTAS DE LA API PARA EL CRUD ---

// CREATE: Crear una nueva tarea
app.post('/api/tasks', async (req, res) => {
  const task = new Task({ description: req.body.description });
  try {
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ: Obtener todas las tareas
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE: Marcar una tarea como completada/incompleta
app.patch('/api/tasks/:id', async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      task.completed = !task.completed;
      const updatedTask = await task.save();
      res.json(updatedTask);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

// DELETE: Borrar una tarea
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    res.status(404).json({ message: 'Tarea no encontrada' });
  }
});

// --- Servir la aplicación de React ---
app.use(express.static(path.join(__dirname, 'build')));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});