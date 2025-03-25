// examples/next/task-management.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNextBridge, NextPubFlowProvider } from 'pubflow/next';
import { BridgeSchema } from 'pubflow';
import { z } from 'zod';

// Define Task schema
const taskSchema = new BridgeSchema({
  name: 'task',
  fields: {
    id: z.string().optional(),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['todo', 'in-progress', 'done']),
    dueDate: z.string().optional(),
    assignedTo: z.string().optional()
  },
  timestamps: true
});

// Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Task Form Component
function TaskForm({ onSubmit, initialData, formType }: {
  onSubmit: (data: Partial<Task>) => void;
  initialData?: Task;
  formType: 'create' | 'update';
}) {
  const [task, setTask] = useState<Partial<Task>>(initialData || {
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
    assignedTo: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(task);
    
    // Reset form if creating a new task
    if (formType === 'create') {
      setTask({
        title: '',
        description: '',
        status: 'todo',
        dueDate: '',
        assignedTo: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h2>{formType === 'create' ? 'Create New Task' : 'Update Task'}</h2>
      
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={task.title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={task.description || ''}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={task.status}
          onChange={handleChange}
          required
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="dueDate">Due Date</label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={task.dueDate || ''}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="assignedTo">Assigned To</label>
        <input
          type="text"
          id="assignedTo"
          name="assignedTo"
          value={task.assignedTo || ''}
          onChange={handleChange}
        />
      </div>
      
      <button type="submit" className="btn-submit">
        {formType === 'create' ? 'Create Task' : 'Update Task'}
      </button>
    </form>
  );
}

// Task List Component
function TaskList({ tasks, onEdit, onDelete }: {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="task-list">
      <h2>Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks found. Create a new task to get started.</p>
      ) : (
        <ul>
          {tasks.map(task => (
            <li key={task.id} className={`task-item status-${task.status}`}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-status">{task.status}</div>
              </div>
              
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              
              <div className="task-meta">
                {task.dueDate && (
                  <span className="task-due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
                {task.assignedTo && (
                  <span className="task-assigned">Assigned to: {task.assignedTo}</span>
                )}
              </div>
              
              <div className="task-actions">
                <button onClick={() => onEdit(task)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => onDelete(task.id)} className="btn-delete">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Task Management Component
function TaskManagement() {
  const router = useRouter();
  const {
    data: tasks,
    loading,
    error,
    query,
    create,
    update,
    remove
  } = useNextBridge<Task>('tasks', {
    schema: taskSchema,
    autoLoad: true,
    pageSize: 20,
    onError: (err) => console.error('Task operation failed:', err)
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Handle task creation
  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await create(taskData);
      // Refresh the task list
      query();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  // Handle task update
  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!selectedTask) return;
    
    try {
      await update(selectedTask.id, taskData);
      setSelectedTask(null);
      // Refresh the task list
      query();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await remove(id);
        // Refresh the task list
        query();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  // Handle edit button click
  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setSelectedTask(null);
  };

  if (loading && !tasks.length) return <div className="loading">Loading tasks...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="task-management">
      <h1>Task Management</h1>
      
      <div className="task-container">
        <div className="task-form-container">
          {selectedTask ? (
            <>
              <TaskForm 
                onSubmit={handleUpdateTask} 
                initialData={selectedTask} 
                formType="update" 
              />
              <button onClick={handleCancelEdit} className="btn-cancel">
                Cancel
              </button>
            </>
          ) : (
            <TaskForm onSubmit={handleCreateTask} formType="create" />
          )}
        </div>
        
        <div className="task-list-container">
          <TaskList 
            tasks={tasks} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteTask} 
          />
        </div>
      </div>
    </div>
  );
}

// Page component
export default function TaskPage() {
  return (
    <div className="container">
      <TaskManagement />
    </div>
  );
}