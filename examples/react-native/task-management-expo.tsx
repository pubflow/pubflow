// examples/react-native/task-management-expo.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { createExpoPubFlow } from 'pubflow/react-native';
import { PubFlowProvider, useBridge } from 'pubflow/react-native';
import { BridgeSchema } from 'pubflow';
import { z } from 'zod';

// Create the PubFlow client with Expo integration
const pubflowClient = createExpoPubFlow({
  baseUrl: 'https://api.example.com',
  useSecureStorage: true,
  deviceInfo: true
});

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
function TaskForm({ onSubmit, initialData, formType, onCancel }: {
  onSubmit: (data: Partial<Task>) => void;
  initialData?: Task;
  formType: 'create' | 'update';
  onCancel: () => void;
}) {
  const [task, setTask] = useState<Partial<Task>>(initialData || {
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
    assignedTo: ''
  });

  const handleChange = (name: string, value: string) => {
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!task.title || task.title.length < 3) {
      Alert.alert('Validation Error', 'Title must be at least 3 characters');
      return;
    }
    
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
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{formType === 'create' ? 'Create New Task' : 'Update Task'}</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={task.title}
          onChangeText={(value) => handleChange('title', value)}
          placeholder="Enter task title"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={task.description || ''}
          onChangeText={(value) => handleChange('description', value)}
          placeholder="Enter task description"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          <TouchableOpacity 
            style={[styles.statusButton, task.status === 'todo' && styles.statusButtonActive]}
            onPress={() => handleChange('status', 'todo')}
          >
            <Text style={[styles.statusButtonText, task.status === 'todo' && styles.statusButtonTextActive]}>To Do</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statusButton, task.status === 'in-progress' && styles.statusButtonActive]}
            onPress={() => handleChange('status', 'in-progress')}
          >
            <Text style={[styles.statusButtonText, task.status === 'in-progress' && styles.statusButtonTextActive]}>In Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statusButton, task.status === 'done' && styles.statusButtonActive]}
            onPress={() => handleChange('status', 'done')}
          >
            <Text style={[styles.statusButtonText, task.status === 'done' && styles.statusButtonTextActive]}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Due Date</Text>
        <TextInput
          style={styles.input}
          value={task.dueDate || ''}
          onChangeText={(value) => handleChange('dueDate', value)}
          placeholder="YYYY-MM-DD"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Assigned To</Text>
        <TextInput
          style={styles.input}
          value={task.assignedTo || ''}
          onChangeText={(value) => handleChange('assignedTo', value)}
          placeholder="Enter assignee name"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{formType === 'create' ? 'Create Task' : 'Update Task'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Task Item Component
function TaskItem({ task, onEdit, onDelete }: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <View style={[styles.taskItem, styles[`status${task.status}`]]}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <View style={styles.taskStatusBadge}>
          <Text style={styles.taskStatusText}>
            {task.status === 'todo' ? 'To Do' : 
             task.status === 'in-progress' ? 'In Progress' : 'Done'}
          </Text>
        </View>
      </View>
      
      {task.description ? (
        <Text style={styles.taskDescription}>{task.description}</Text>
      ) : null}
      
      <View style={styles.taskMeta}>
        {task.dueDate ? (
          <Text style={styles.taskDueDate}>Due: {task.dueDate}</Text>
        ) : null}
        {task.assignedTo ? (
          <Text style={styles.taskAssigned}>Assigned to: {task.assignedTo}</Text>
        ) : null}
      </View>
      
      <View style={styles.taskActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(task)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => {
            Alert.alert(
              'Confirm Delete',
              'Are you sure you want to delete this task?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => onDelete(task.id), style: 'destructive' }
              ]
            );
          }}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Task Management Component
function TaskManagement() {
  const {
    data: tasks,
    loading,
    error,
    refreshing,
    query,
    refresh,
    create,
    update,
    remove
  } = useBridge<Task>('tasks', {
    schema: taskSchema,
    autoLoad: true,
    pageSize: 20,
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Handle task creation
  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await create(taskData);
      setShowForm(false);
      refresh();
    } catch (err: any) {
      Alert.alert('Error', `Failed to create task: ${err.message}`);
    }
  };

  // Handle task update
  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!selectedTask) return;
    
    try {
      await update(selectedTask.id, taskData);
      setSelectedTask(null);
      refresh();
    } catch (err: any) {
      Alert.alert('Error', `Failed to update task: ${err.message}`);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (id: string) => {
    try {
      await remove(id);
      refresh();
    } catch (err: any) {
      Alert.alert('Error', `Failed to delete task: ${err.message}`);
    }
  };

  // Handle edit button click
  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  // Handle cancel edit/create
  const handleCancelForm = () => {
    setSelectedTask(null);
    setShowForm(false);
  };

  if (loading && !tasks.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refresh()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Management</Text>
        {!showForm && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.addButtonText}>+ Add Task</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {showForm ? (
        <TaskForm 
          onSubmit={selectedTask ? handleUpdateTask : handleCreateTask} 
          initialData={selectedTask || undefined} 
          formType={selectedTask ? 'update' : 'create'}
          onCancel={handleCancelForm}
        />
      ) : (
        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <TaskItem 
              task={item} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteTask} 
            />
          )}
          keyExtractor={item => item.id}
          refreshing={refreshing}
          onRefresh={refresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks found. Create a new task to get started.</Text>
            </View>
          }
          contentContainerStyle={tasks.length === 0 ? styles.emptyList : null}
        />
      )}
    </SafeAreaView>
  );
}

// Main App Component
export default function App() {
  return (
    <PubFlowProvider client={pubflowClient}>
      <TaskManagement />
    </PubFlowProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  statusButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  statusButtonText: {
    color: '#757575',
  },
  statusButtonTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    flex: 2,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
  },
  taskItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  'statustodo': {
    borderLeftColor: '#FFC107', // Yellow for todo
  },
  'statusin-progress': {
    borderLeftColor: '#2196F3', // Blue for in-progress
  },
  'statusdone': {
    borderLeftColor: '#4CAF50', // Green for done
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  taskStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  taskStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#757575',
    marginRight: 12,
  },
  taskAssigned: {
    fontSize: 12,
    color: '#757575',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  }
});