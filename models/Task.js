// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  numero: {
    type: Number,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  tipo: {
    type: String,
    required: true,
    enum: ['Personal', 'Trabajo', 'Estudio', 'Hogar', 'Salud', 'Otro'],
    default: 'Personal'
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt antes de guardar
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware para auto-incrementar el número si no se proporciona
taskSchema.pre('save', async function(next) {
  if (this.isNew && !this.numero) {
    try {
      const lastTask = await this.constructor.findOne({}, {}, { sort: { 'numero': -1 } });
      this.numero = lastTask ? lastTask.numero + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);