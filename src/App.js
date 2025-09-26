// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Obtener todas las tareas cuando el componente se monta
  useEffect(() => {
    fetchTasks();
  }, []);

  // READ: Obtener todas las tareas
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      alert('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  // CREATE: Crear nueva tarea
  const createTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) {
      alert('Por favor ingresa una descripción para la tarea');
      return;
    }

    try {
      const response = await axios.post('/api/tasks', {
        description: newTask.trim()
      });
      setTasks([response.data, ...tasks]); // Agregar al inicio de la lista
      setNewTask('');
    } catch (error) {
      console.error('Error al crear tarea:', error);
      alert('Error al crear la tarea');
    }
  };

  // UPDATE: Marcar tarea como completada/incompleta
  const toggleTask = async (id) => {
    try {
      const response = await axios.patch(`/api/tasks/${id}/toggle`);
      setTasks(tasks.map(task => 
        task._id === id ? response.data : task
      ));
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      alert('Error al actualizar la tarea');
    }
  };

  // UPDATE: Iniciar edición de una tarea
  const startEditing = (task) => {
    setEditingTask(task._id);
    setEditingText(task.description);
  };

  // UPDATE: Cancelar edición
  const cancelEditing = () => {
    setEditingTask(null);
    setEditingText('');
  };

  // UPDATE: Guardar cambios de edición
  const saveEdit = async (id) => {
    if (!editingText.trim()) {
      alert('La descripción no puede estar vacía');
      return;
    }

    try {
      const response = await axios.put(`/api/tasks/${id}`, {
        description: editingText.trim(),
        completed: tasks.find(task => task._id === id).completed
      });
      
      setTasks(tasks.map(task => 
        task._id === id ? response.data : task
      ));
      
      setEditingTask(null);
      setEditingText('');
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      alert('Error al actualizar la tarea');
    }
  };

  // DELETE: Eliminar tarea
  const deleteTask = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar la tarea');
    }
  };

  // DELETE: Eliminar todas las tareas completadas
  const deleteCompletedTasks = async () => {
    const completedCount = tasks.filter(task => task.completed).length;
    
    if (completedCount === 0) {
      alert('No hay tareas completadas para eliminar');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que quieres eliminar las ${completedCount} tareas completadas?`)) {
      return;
    }

    try {
      await axios.delete('/api/tasks/completed/all');
      setTasks(tasks.filter(task => !task.completed));
    } catch (error) {
      console.error('Error al eliminar tareas completadas:', error);
      alert('Error al eliminar las tareas completadas');
    }
  };

  // Manejar la tecla Enter en el campo de edición
  const handleEditKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="App">
      <header className="App-header">
        <h1>📝 Sistema CRUD de Tareas</h1>
        <p className="crud-subtitle">Crear • Leer • Actualizar • Eliminar</p>
        
        {/* Formulario para crear nueva tarea */}
        <form onSubmit={createTask} className="task-form">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Escribe una nueva tarea..."
            className="task-input"
          />
          <button type="submit" className="add-button">
            ➕ Agregar Tarea
          </button>
        </form>

        {/* Acciones masivas */}
        {completedTasks.length > 0 && (
          <div className="bulk-actions">
            <button 
              onClick={deleteCompletedTasks}
              className="bulk-delete-button"
            >
              🗑️ Eliminar {completedTasks.length} tarea(s) completada(s)
            </button>
          </div>
        )}

        {/* Lista de tareas */}
        <div className="tasks-container">
          {loading ? (
            <p>Cargando tareas...</p>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <p>📋 No hay tareas. ¡Agrega tu primera tarea!</p>
            </div>
          ) : (
            <ul className="tasks-list">
              {tasks.map(task => (
                <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  {editingTask === task._id ? (
                    // Modo de edición
                    <div className="edit-mode">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => handleEditKeyPress(e, task._id)}
                        className="edit-input"
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button 
                          onClick={() => saveEdit(task._id)}
                          className="save-button"
                          title="Guardar (Enter)"
                        >
                          ✅
                        </button>
                        <button 
                          onClick={cancelEditing}
                          className="cancel-button"
                          title="Cancelar (Escape)"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo de visualización
                    <>
                      <span 
                        className="task-description"
                        onClick={() => toggleTask(task._id)}
                        title="Click para marcar como completada"
                      >
                        {task.description}
                      </span>
                      <div className="task-actions">
                        <button 
                          onClick={() => startEditing(task)}
                          className="edit-button"
                          title="Editar descripción"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => toggleTask(task._id)}
                          className={`toggle-button ${task.completed ? 'uncomplete' : 'complete'}`}
                          title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                        >
                          {task.completed ? '↶ Desmarcar' : '✓ Completar'}
                        </button>
                        <button 
                          onClick={() => deleteTask(task._id)}
                          className="delete-button"
                          title="Eliminar tarea"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Estadísticas detalladas */}
        <div className="stats">
          <div className="stat-item">
            <span className="stat-number">{tasks.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{pendingTasks.length}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{completedTasks.length}</span>
            <span className="stat-label">Completadas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
            </span>
            <span className="stat-label">Progreso</span>
          </div>
        </div>

        {/* Información sobre las operaciones CRUD */}
        <div className="crud-info">
          <h3>📋 Operaciones CRUD Disponibles:</h3>
          <ul>
            <li><strong>Crear:</strong> Agrega nuevas tareas usando el formulario superior</li>
            <li><strong>Leer:</strong> Visualiza todas las tareas en la lista</li>
            <li><strong>Actualizar:</strong> Edita la descripción (✏️) o cambia el estado (✓)</li>
            <li><strong>Eliminar:</strong> Borra tareas individuales (🗑️) o en lote</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;