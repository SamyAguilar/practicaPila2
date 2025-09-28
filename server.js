// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a la base de datos MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado exitosamente.'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// --- RUTAS DE LA API PARA EL CRUD COMPLETO ---

// CREATE: Crear una nueva tarea
app.post('/api/tasks', async (req, res) => {
  try {
    const { numero, nombre, tipo, descripcion } = req.body;
    
    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    
    if (!descripcion || descripcion.trim() === '') {
      return res.status(400).json({ message: 'La descripción es requerida' });
    }

    const taskData = {
      nombre: nombre.trim(),
      tipo: tipo || 'Personal',
      descripcion: descripcion.trim()
    };

    // Solo agregar número si se proporciona
    if (numero && numero !== '') {
      taskData.numero = Number(numero);
    }

    const task = new Task(taskData);
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'El número de tarea ya existe' });
    }
    res.status(400).json({ message: err.message });
  }
});

// READ: Obtener todas las tareas
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ numero: 1 }); // Ordenar por número
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ: Obtener una tarea específica por ID
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE: Actualizar completamente una tarea
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { numero, nombre, tipo, descripcion, completed } = req.body;
    
    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    
    if (!descripcion || descripcion.trim() === '') {
      return res.status(400).json({ message: 'La descripción es requerida' });
    }

    const updateData = {
      numero: numero || 1,
      nombre: nombre.trim(),
      tipo: tipo || 'Personal',
      descripcion: descripcion.trim(),
      completed: completed !== undefined ? completed : false
    };
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    res.json(updatedTask);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'El número de tarea ya existe' });
    }
    res.status(400).json({ message: err.message });
  }
});

// UPDATE: Marcar una tarea como completada/incompleta
app.patch('/api/tasks/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
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
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada exitosamente', task: deletedTask });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE: Borrar todas las tareas completadas
app.delete('/api/tasks/completed/all', async (req, res) => {
  try {
    const result = await Task.deleteMany({ completed: true });
    res.json({ 
      message: `${result.deletedCount} tareas completadas eliminadas`,
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Servir la aplicación de React
app.use(express.static(path.join(__dirname, 'build')));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});