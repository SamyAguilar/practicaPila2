import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingData, setEditingData] = useState({ numero: '', nombre: '', tipo: '' });
  const [newTask, setNewTask] = useState({ numero: '', nombre: '', tipo: 'Personal' });

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
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTask.nombre.trim()) {
      alert('Ingresa un nombre para la tarea');
      return;
    }

    try {
      const response = await axios.post('/api/tasks', {
        numero: newTask.numero || undefined,
        nombre: newTask.nombre.trim(),
        tipo: newTask.tipo
      });
      
      setTasks([...tasks, response.data]);
      setNewTask({ numero: '', nombre: '', tipo: 'Personal' });
    } catch (error) {
      console.error('Error al crear tarea:', error);
      alert('Error al crear la tarea');
    }
  };

  const startEditing = (task) => {
    setEditingTask(task._id);
    setEditingData({
      numero: task.numero,
      nombre: task.nombre,
      tipo: task.tipo
    });
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditingData({ numero: '', nombre: '', tipo: '' });
  };

  const saveEdit = async (id) => {
    if (!editingData.nombre.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }

    try {
      const response = await axios.put(`/api/tasks/${id}`, {
        numero: editingData.numero,
        nombre: editingData.nombre.trim(),
        tipo: editingData.tipo,
        completed: tasks.find(task => task._id === id).completed
      });
      
      setTasks(tasks.map(task => 
        task._id === id ? response.data : task
      ));
      
      cancelEditing();
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      alert('Error al actualizar la tarea');
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
    if (!window.confirm(`¿Eliminar la tarea ${task.nombre}?`)) {
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
    <div className="app">
      <h1>Sistema CRUD de Tareas</h1>
      
      <form onSubmit={createTask} className="form">
        <input
          type="number"
          placeholder="Número"
          value={newTask.numero}
          onChange={(e) => setNewTask({...newTask, numero: e.target.value})}
        />
        <input
          type="text"
          placeholder="Nombre de la tarea"
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
        <button type="submit">Agregar</button>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="5">No hay tareas</td>
              </tr>
            ) : (
              tasks.map(task => (
                <tr key={task._id} className={task.completed ? 'completed' : ''}>
                  <td>{task.numero}</td>
                  <td>
                    {editingTask === task._id ? (
                      <input
                        type="text"
                        value={editingData.nombre}
                        onChange={(e) => setEditingData({...editingData, nombre: e.target.value})}
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
                    <button onClick={() => toggleTask(task._id)}>
                      {task.completed ? 'Completada' : 'Pendiente'}
                    </button>
                  </td>
                  <td>
                    {editingTask === task._id ? (
                      <>
                        <button onClick={() => saveEdit(task._id)}>Guardar</button>
                        <button onClick={cancelEditing}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditing(task)}>Editar</button>
                        <button onClick={() => deleteTask(task._id)}>Eliminar</button>
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