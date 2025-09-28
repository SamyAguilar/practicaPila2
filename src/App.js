import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingData, setEditingData] = useState({ 
    numero: '', 
    nombre: '', 
    tipo: 'Personal', 
    descripcion: '' 
  });
  const [newTask, setNewTask] = useState({ 
    numero: '', 
    nombre: '', 
    tipo: 'Personal', 
    descripcion: '' 
  });

  const tiposTarea = ['Personal', 'Trabajo', 'Estudio', 'Hogar', 'Salud', 'Otro'];

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const createTask = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!newTask.nombre.trim()) {
      alert('Ingresa un nombre para la tarea');
      return;
    }
    
    if (!newTask.descripcion.trim()) {
      alert('Ingresa una descripción para la tarea');
      return;
    }

    try {
      const taskData = {
        nombre: newTask.nombre.trim(),
        tipo: newTask.tipo,
        descripcion: newTask.descripcion.trim()
      };

      // Solo incluir número si se proporciona
      if (newTask.numero && newTask.numero !== '') {
        taskData.numero = Number(newTask.numero);
      }

      const response = await axios.post('/api/tasks', taskData);
      
      setTasks([...tasks, response.data]);
      setNewTask({ numero: '', nombre: '', tipo: 'Personal', descripcion: '' });
      alert('Tarea creada exitosamente');
    } catch (error) {
      console.error('Error al crear tarea:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear la tarea';
      alert(errorMessage);
    }
  };

  const startEditing = (task) => {
    setEditingTask(task._id);
    setEditingData({
      numero: task.numero,
      nombre: task.nombre,
      tipo: task.tipo,
      descripcion: task.descripcion
    });
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditingData({ numero: '', nombre: '', tipo: 'Personal', descripcion: '' });
  };

  const saveEdit = async (id) => {
    // Validaciones
    if (!editingData.nombre.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }
    
    if (!editingData.descripcion.trim()) {
      alert('La descripción no puede estar vacía');
      return;
    }

    try {
      const currentTask = tasks.find(task => task._id === id);
      
      const updateData = {
        numero: editingData.numero || 1,
        nombre: editingData.nombre.trim(),
        tipo: editingData.tipo,
        descripcion: editingData.descripcion.trim(),
        completed: currentTask.completed
      };

      const response = await axios.put(`/api/tasks/${id}`, updateData);
      
      setTasks(tasks.map(task => 
        task._id === id ? response.data : task
      ));
      
      cancelEditing();
      alert('Tarea actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar la tarea';
      alert(errorMessage);
    }
  };

  const toggleTask = async (id) => {
    try {
      const response = await axios.patch(`/api/tasks/${id}/toggle`);
      setTasks(tasks.map(task => 
        task._id === id ? response.data : task
      ));
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado de la tarea');
    }
  };

  const deleteTask = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!window.confirm(`¿Eliminar la tarea "${task.nombre}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
      alert('Tarea eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar la tarea');
    }
  };

  return (
    <div className="app">
      <h1>Sistema CRUD de Tareas Completo</h1>
      
      <form onSubmit={createTask} className="form">
        <input
          type="number"
          placeholder="Número (opcional)"
          value={newTask.numero}
          onChange={(e) => setNewTask({...newTask, numero: e.target.value})}
          min="1"
        />
        <input
          type="text"
          placeholder="Nombre de la tarea *"
          value={newTask.nombre}
          onChange={(e) => setNewTask({...newTask, nombre: e.target.value})}
          required
        />
        <select
          value={newTask.tipo}
          onChange={(e) => setNewTask({...newTask, tipo: e.target.value})}
        >
          {tiposTarea.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Descripción *"
          value={newTask.descripcion}
          onChange={(e) => setNewTask({...newTask, descripcion: e.target.value})}
          required
        />
        <button type="submit">Agregar Tarea</button>
      </form>

      {loading ? (
        <div className="loading">Cargando tareas...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-tasks">No hay tareas creadas</td>
              </tr>
            ) : (
              tasks.map(task => (
                <tr key={task._id} className={task.completed ? 'completed' : ''}>
                  <td>
                    {editingTask === task._id ? (
                      <input
                        type="number"
                        value={editingData.numero}
                        onChange={(e) => setEditingData({...editingData, numero: e.target.value})}
                        min="1"
                      />
                    ) : (
                      task.numero
                    )}
                  </td>
                  <td>
                    {editingTask === task._id ? (
                      <input
                        type="text"
                        value={editingData.nombre}
                        onChange={(e) => setEditingData({...editingData, nombre: e.target.value})}
                        required
                      />
                    ) : (
                      task.nombre
                    )}
                  </td>
                  <td>
                    {editingTask === task._id ? (
                      <select
                        value={editingData.tipo}
                        onChange={(e) => setEditingData({...editingData, tipo: e.target.value})}
                      >
                        {tiposTarea.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    ) : (
                      task.tipo
                    )}
                  </td>
                  <td>
                    {editingTask === task._id ? (
                      <input
                        type="text"
                        value={editingData.descripcion}
                        onChange={(e) => setEditingData({...editingData, descripcion: e.target.value})}
                        required
                      />
                    ) : (
                      task.descripcion
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={() => toggleTask(task._id)}
                      className={`status-btn ${task.completed ? 'completed' : 'pending'}`}
                    >
                      {task.completed ? 'Completada' : 'Pendiente'}
                    </button>
                  </td>
                  <td className="actions">
                    {editingTask === task._id ? (
                      <>
                        <button 
                          onClick={() => saveEdit(task._id)}
                          className="save-btn"
                        >
                          Guardar
                        </button>
                        <button 
                          onClick={cancelEditing}
                          className="cancel-btn"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEditing(task)}
                          className="edit-btn"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => deleteTask(task._id)}
                          className="delete-btn"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;