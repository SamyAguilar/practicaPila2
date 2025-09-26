// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);

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
        description: newTask
      });
      setTasks([...tasks, response.data]);
      setNewTask('');
    } catch (error) {
      console.error('Error al crear tarea:', error);
      alert('Error al crear la tarea');
    }
  };

  // UPDATE: Marcar tarea como completada/incompleta
  const toggleTask = async (id) => {
    try {
      const response = await axios.patch(`/api/tasks/${id}`);
      setTasks(tasks.map(task => 
        task._id === id ? response.data : task
      ));
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lista de Tareas - CRUD</h1>
        
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
            Agregar Tarea
          </button>
        </form>

        {/* Lista de tareas */}
        <div className="tasks-container">
          {loading ? (
            <p>Cargando tareas...</p>
          ) : tasks.length === 0 ? (
            <p>No hay tareas. ¡Agrega tu primera tarea!</p>
          ) : (
            <ul className="tasks-list">
              {tasks.map(task => (
                <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <span 
                    className="task-description"
                    onClick={() => toggleTask(task._id)}
                  >
                    {task.description}
                  </span>
                  <div className="task-actions">
                    <button 
                      onClick={() => toggleTask(task._id)}
                      className={`toggle-button ${task.completed ? 'uncomplete' : 'complete'}`}
                    >
                      {task.completed ? 'Desmarcar' : 'Completar'}
                    </button>
                    <button 
                      onClick={() => deleteTask(task._id)}
                      className="delete-button"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Estadísticas */}
        <div className="stats">
          <p>Total: {tasks.length} tareas</p>
          <p>Completadas: {tasks.filter(task => task.completed).length}</p>
          <p>Pendientes: {tasks.filter(task => !task.completed).length}</p>
        </div>
      </header>
    </div>
  );
}

export default App;