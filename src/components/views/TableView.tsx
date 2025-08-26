import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, MoreHorizontal, User, Filter, Search, SortAsc, Settings, Edit2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useBoardContext } from '@/context/BoardContext';
import StatusCell from '@/components/table/StatusCell';
import PriorityCell from '@/components/table/PriorityCell';
import PersonCell from '@/components/table/PersonCell';
import TaskActionPanel from '@/components/task/TaskActionPanel';
import FileUploadCell from '@/components/file/FileUploadCell';
import EditableTitle from '@/components/ui/editable-title';
import { StatusOption, PriorityOption, TaskData } from '@/types/board';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

const TableView = () => {
  const { currentBoard, updateTask, addTask, createTask, updateGroup, addGroup, loading } = useBoardContext();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string>('');
  const [creatingTask, setCreatingTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // New state for editable column headers
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [columnNames, setColumnNames] = useState<Record<string, string>>({});

  // Expand all groups by default when board loads
  React.useEffect(() => {
    if (currentBoard?.groups && expandedGroups.length === 0) {
      setExpandedGroups(currentBoard.groups.map(g => g.id));
    }
  }, [currentBoard?.groups]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64 animate-fade-in">
          <div className="text-center">
            <div className="w-10 h-10 loading-spinner rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Loading your board...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">This won't take long</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64 animate-fade-in">
          <div className="text-center p-8 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/50">
            <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted-foreground/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-muted-foreground font-medium">No board selected</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Choose a board from the sidebar to get started</p>
          </div>
        </div>
      </div>
    );
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleTaskUpdate = async (taskId: string, field: string, value: any) => {
    try {
      console.log(`Updating task ${taskId}, field ${field} to value:`, value);
      await updateTask(taskId, { [field]: value });
      console.log(`Successfully updated task ${taskId}, field ${field}`);
    } catch (error) {
      console.error(`Failed to update task ${taskId} field ${field}:`, error);
      // You could add a toast notification here to inform the user of the error
    }
  };

  const handleAddTask = async (groupId: string) => {
    try {
      await addTask(groupId, 'New Task');
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleCreateGroup = async () => {
    setIsCreatingGroup(true);
    try {
      const groupNumber = (currentBoard.groups?.length || 0) + 1;
      await addGroup(`Group ${groupNumber}`, '#007BFF');
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleGroupEdit = (groupId: string, currentName: string) => {
    setEditingGroup(groupId);
    setEditingGroupName(currentName);
  };

  const handleGroupSave = async (groupId: string) => {
    if (editingGroupName.trim() && editingGroupName !== '') {
      try {
        await updateGroup(groupId, { title: editingGroupName.trim() });
        setEditingGroup(null);
        setEditingGroupName('');
      } catch (error) {
        console.error('Failed to update group:', error);
      }
    }
  };

  const handleGroupCancel = () => {
    setEditingGroup(null);
    setEditingGroupName('');
  };

  const handleCreateTask = (groupId: string) => {
    setCreatingTask(groupId);
    setNewTaskTitle('');
  };

  const handleTaskSave = async (groupId: string) => {
    if (newTaskTitle.trim()) {
      try {
        await createTask(groupId, { title: newTaskTitle.trim() });
        setCreatingTask(null);
        setNewTaskTitle('');
      } catch (error) {
        console.error('Failed to create task:', error);
      }
    }
  };

  const handleTaskCancel = () => {
    setCreatingTask(null);
    setNewTaskTitle('');
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAllTasks = () => {
    const allTaskIds = currentBoard.groups?.flatMap(group => group.tasks?.map(task => task.id) || []) || [];
    setSelectedTasks(prev => prev.length === allTaskIds.length ? [] : allTaskIds);
  };

  // Safe file parsing helper
  const parseTaskFiles = (files: any) => {
    if (!files) return [];
    if (typeof files === 'string') {
      try {
        return JSON.parse(files);
      } catch (error) {
        console.warn('Failed to parse task files:', error);
        return [];
      }
    }
    if (Array.isArray(files)) return files;
    return [];
  };

  // File upload handlers
  const handleFileUpload = async (taskId: string, files: File[]) => {
    try {
      // TODO: Implement actual file upload to Supabase Storage
      const fileObjects = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file) // Temporary URL for demo
      }));

      const currentTask = currentBoard.groups
        ?.flatMap(group => group.tasks || [])
        .find(task => task.id === taskId);
      
      if (currentTask?.files) {
        const existingFiles = parseTaskFiles(currentTask.files);
        const updatedFiles = [...existingFiles, ...fileObjects];
        await handleTaskUpdate(taskId, 'files', JSON.stringify(updatedFiles));
      } else {
        await handleTaskUpdate(taskId, 'files', JSON.stringify(fileObjects));
      }
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  const handleFileDelete = async (taskId: string, fileId: string) => {
    try {
      // TODO: Implement actual file deletion from Supabase Storage
      const currentTask = currentBoard.groups
        ?.flatMap(group => group.tasks || [])
        .find(task => task.id === taskId);
      
      if (currentTask?.files) {
        const existingFiles = parseTaskFiles(currentTask.files);
        const updatedFiles = existingFiles.filter((file: any) => file.id !== fileId);
        await handleTaskUpdate(taskId, 'files', JSON.stringify(updatedFiles));
      }
    } catch (error) {
      console.error('File deletion failed:', error);
    }
  };

  // Define table columns based on Monday CRM structure
  const columns = [
    { id: 'title', name: 'Item', type: 'text', width: 'min-w-[200px]' },
    { id: 'sender_name', name: 'Sender Name', type: 'text', width: 'min-w-[160px]' },
    { id: 'sender_email', name: 'Email', type: 'email', width: 'min-w-[180px]' },
    { id: 'sender_company', name: 'Company', type: 'text', width: 'min-w-[160px]' },
    { id: 'assignee_id', name: 'Person', type: 'person', width: 'min-w-[160px]' },
    { id: 'status', name: 'Status', type: 'status', width: 'min-w-[140px]' },
    { id: 'priority', name: 'Priority', type: 'priority', width: 'min-w-[120px]' },
    { id: 'due_date', name: 'Date', type: 'date', width: 'min-w-[140px]' },
    { id: 'timeline', name: 'Timeline', type: 'timeline', width: 'min-w-[180px]' },
    { id: 'budget', name: 'Budget', type: 'budget', width: 'min-w-[120px]' },
    { id: 'progress', name: 'Progress', type: 'progress', width: 'min-w-[140px]' },
    { id: 'text_field', name: 'Notes', type: 'text_field', width: 'min-w-[150px]' },
    { id: 'number_field', name: 'Number', type: 'number', width: 'min-w-[100px]' },
    { id: 'files', name: 'Files', type: 'files', width: 'min-w-[120px]' },
    { id: 'tags', name: 'Tags', type: 'tags', width: 'min-w-[140px]' }
  ];

  // Get column display name (custom or default)
  const getColumnDisplayName = (column: any) => {
    return columnNames[column.id] || column.name;
  };

  // Handle column name editing
  const handleColumnEdit = (columnId: string, currentName: string) => {
    setEditingColumnId(columnId);
    if (!columnNames[columnId]) {
      setColumnNames(prev => ({ ...prev, [columnId]: currentName }));
    }
  };

  const handleColumnSave = (columnId: string, newName: string) => {
    if (newName.trim()) {
      setColumnNames(prev => ({ ...prev, [columnId]: newName.trim() }));
    }
    setEditingColumnId(null);
  };

  const handleColumnCancel = (columnId: string) => {
    // Reset to original name if it was being edited
    const originalColumn = columns.find(col => col.id === columnId);
    if (originalColumn && !columnNames[columnId]) {
      setColumnNames(prev => ({ ...prev, [columnId]: originalColumn.name }));
    }
    setEditingColumnId(null);
  };

  const allTaskIds = currentBoard.groups?.flatMap(group => group.tasks?.map(task => task.id) || []) || [];
  const isAllSelected = selectedTasks.length === allTaskIds.length && allTaskIds.length > 0;
  const isIndeterminate = selectedTasks.length > 0 && selectedTasks.length < allTaskIds.length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Demo Mode Warning */}
      {!isSupabaseConfigured() && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Demo Mode Active</h3>
              <p className="text-sm text-yellow-700">
                Changes are saved locally but not persisted to the database. 
                <a href="#supabase-setup" className="underline ml-1">Configure Supabase</a> to enable full functionality.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compact Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 shadow-md"
            onClick={handleCreateGroup}
            disabled={isCreatingGroup}
          >
            {isCreatingGroup ? (
              <div className="w-4 h-4 loading-spinner mr-2"></div>
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isCreatingGroup ? 'Creating...' : 'New Group'}
          </Button>
          <Button variant="outline" size="sm" className="h-9 px-3">
            <User className="w-4 h-4 mr-2" />
            Person
          </Button>
          <Button variant="outline" size="sm" className="h-9 px-3">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-9 px-3">
            <SortAsc className="w-4 h-4 mr-2" />
            Sort
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-10 w-64 h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Selected tasks indicator */}
      {selectedTasks.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg animate-slide-up">
          <span className="text-sm text-blue-700 font-medium">
            {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}

      {/* Compact Table Card */}
      <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-12 p-3 text-left">
                  <Checkbox 
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAllTasks}
                    className="rounded" 
                    {...(isIndeterminate && { 'data-indeterminate': true })}
                  />
                </th>
                {columns.map((column) => (
                  <th key={column.id} className={cn(
                    "text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide relative group",
                    column.width
                  )}>
                    {editingColumnId === column.id ? (
                      <Input
                        value={columnNames[column.id] || column.name}
                        onChange={(e) => setColumnNames(prev => ({ ...prev, [column.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleColumnSave(column.id, e.currentTarget.value);
                          if (e.key === 'Escape') handleColumnCancel(column.id);
                        }}
                        onBlur={(e) => handleColumnSave(column.id, e.currentTarget.value)}
                        className="h-6 text-xs font-semibold border-0 bg-transparent p-0 focus:ring-1 focus:ring-blue-500 uppercase tracking-wide"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded transition-colors"
                        onClick={() => handleColumnEdit(column.id, getColumnDisplayName(column))}
                      >
                        <span>{getColumnDisplayName(column)}</span>
                        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                      </div>
                    )}
                  </th>
                ))}
                <th className="w-12 p-3"></th>
              </tr>
            </thead>
            {currentBoard.groups?.map((group, groupIndex) => (
              <tbody key={group.id} className="bg-white">
                  {/* Compact Group Header */}
                  <tr className="bg-gray-25 hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroup(group.id)}
                        className="h-6 w-6 p-0 hover:bg-gray-200 rounded"
                      >
                        {expandedGroups.includes(group.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: group.color || '#666' }}
                        ></div>
                        {editingGroup === group.id ? (
                          <Input
                            value={editingGroupName}
                            onChange={(e) => setEditingGroupName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleGroupSave(group.id);
                              if (e.key === 'Escape') handleGroupCancel();
                            }}
                            onBlur={() => handleGroupSave(group.id)}
                            className="h-7 text-sm font-semibold border-0 bg-transparent p-0 focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                            onClick={() => handleGroupEdit(group.id, group.title)}
                          >
                            {group.title}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {group.tasks?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td colSpan={columns.length - 1} className="p-3">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCreateTask(group.id)}
                          className="h-7 px-3 text-xs text-blue-600 hover:bg-blue-50"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Task
                        </Button>
                      </div>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-200 rounded"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>

                  {/* Tasks */}
                  {expandedGroups.includes(group.id) && group.tasks?.map((task) => (
                    <tr 
                      key={task.id} 
                      className="hover:bg-blue-25 border-b border-gray-100 transition-colors"
                    >
                      <td className="p-3">
                        <Checkbox 
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={() => toggleTaskSelection(task.id)}
                          className="rounded"
                        />
                      </td>
                      
                      {columns.map((column) => (
                        <td key={column.id} className="p-3">
                          {column.id === 'title' && (
                            <EditableTitle
                              title={task.title}
                              onSave={async (newTitle) => {
                                await handleTaskUpdate(task.id, 'title', newTitle);
                              }}
                              variant="default"
                              size="sm"
                              className="text-gray-900"
                            />
                          )}
                          {column.id === 'sender_name' && (
                            <span className="text-sm text-gray-700">{task.sender_name || '-'}</span>
                          )}
                          {column.id === 'sender_email' && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-blue-600 hover:underline cursor-pointer" 
                                    onClick={() => window.open(`mailto:${task.sender_email}`, '_blank')}>
                                {task.sender_email || '-'}
                              </span>
                            </div>
                          )}
                          {column.id === 'sender_company' && (
                            <span className="text-sm text-gray-700">{task.sender_company || '-'}</span>
                          )}
                          {column.id === 'status' && (
                            <StatusCell 
                              value={task.status}
                              options={currentBoard.status_options || []}
                              onChange={(value) => handleTaskUpdate(task.id, 'status', value)}
                            />
                          )}
                          {column.id === 'priority' && (
                            <PriorityCell 
                              value={task.priority}
                              options={currentBoard.priority_options || []}
                              onChange={(value) => handleTaskUpdate(task.id, 'priority', value)}
                            />
                          )}
                          {column.id === 'assignee_id' && (
                            <PersonCell 
                              value={task.assignee_id}
                              onChange={(value) => handleTaskUpdate(task.id, 'assignee_id', value)}
                            />
                          )}
                          {column.id === 'due_date' && (
                            <Input
                              type="date"
                              value={task.due_date ? task.due_date.split('T')[0] : ''}
                              onChange={(e) => handleTaskUpdate(task.id, 'due_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                              className="h-8 text-sm border-0 bg-transparent hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-500"
                            />
                          )}
                          {column.id === 'timeline' && (
                            <div className="flex gap-2">
                              <Input
                                type="date"
                                value={task.start_date ? task.start_date.split('T')[0] : ''}
                                onChange={(e) => handleTaskUpdate(task.id, 'start_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                                className="h-8 text-xs border-0 bg-transparent hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-500 w-24"
                                placeholder="Start"
                              />
                              <span className="text-gray-400 text-xs self-center">→</span>
                              <Input
                                type="date"
                                value={task.end_date ? task.end_date.split('T')[0] : ''}
                                onChange={(e) => handleTaskUpdate(task.id, 'end_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                                className="h-8 text-xs border-0 bg-transparent hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-500 w-24"
                                placeholder="End"
                              />
                            </div>
                          )}
                          {column.id === 'budget' && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">$</span>
                              <Input
                                type="number"
                                value={task.budget || ''}
                                onChange={(e) => handleTaskUpdate(task.id, 'budget', parseFloat(e.target.value) || 0)}
                                className="h-8 text-sm border-0 bg-transparent hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-500"
                                placeholder="0.00"
                              />
                            </div>
                          )}
                          {column.id === 'progress' && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${task.progress || 0}%` }}
                                />
                              </div>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={task.progress || 0}
                                onChange={(e) => handleTaskUpdate(task.id, 'progress', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="h-8 text-xs border-0 bg-transparent hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-500 w-12 text-center"
                              />
                              <span className="text-xs text-gray-500">%</span>
                            </div>
                          )}
                          {column.id === 'text_field' && (
                            <Input
                              type="text"
                              value={task.text_field || ''}
                              onChange={(e) => handleTaskUpdate(task.id, 'text_field', e.target.value)}
                              className="h-8 text-sm border-0 bg-transparent hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-500"
                              placeholder="Add notes..."
                            />
                          )}
                          {column.id === 'tags' && (
                            <div className="flex flex-wrap gap-1">
                              {(task.tags || '').split(',').filter(tag => tag.trim()).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                                  {tag.trim()}
                                </Badge>
                              ))}
                              <Input
                                type="text"
                                placeholder="Add tag..."
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault();
                                    const newTag = e.currentTarget.value.trim();
                                    if (newTag) {
                                      const currentTags = task.tags || '';
                                      const updatedTags = currentTags ? `${currentTags},${newTag}` : newTag;
                                      await handleTaskUpdate(task.id, 'tags', updatedTags);
                                      e.currentTarget.value = '';
                                    }
                                  }
                                }}
                                onBlur={async (e) => {
                                  const newTag = e.currentTarget.value.trim();
                                  if (newTag) {
                                    const currentTags = task.tags || '';
                                    const updatedTags = currentTags ? `${currentTags},${newTag}` : newTag;
                                    await handleTaskUpdate(task.id, 'tags', updatedTags);
                                    e.currentTarget.value = '';
                                  }
                                }}
                                className="h-6 text-xs border-0 bg-transparent hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-500 w-20"
                              />
                            </div>
                          )}
                          {column.id === 'files' && (
                            <FileUploadCell
                              files={parseTaskFiles(task.files)}
                              onFileUpload={(files) => handleFileUpload(task.id, files)}
                              onFileDelete={(fileId) => handleFileDelete(task.id, fileId)}
                            />
                          )}
                          {column.id === 'number_field' && (
                            <Input
                              type="number"
                              value={task.number_field || ''}
                              onChange={(e) => handleTaskUpdate(task.id, 'number_field', parseInt(e.target.value) || 0)}
                              className="h-8 text-sm border-0 bg-transparent hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-500"
                            />
                          )}
                        </td>
                      ))}
                      
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {/* Create Task Row */}
                  {creatingTask === group.id && (
                    <tr className="bg-blue-25 border-b border-gray-100">
                      <td className="p-3"></td>
                      <td className="p-3">
                        <Input
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleTaskSave(group.id);
                            if (e.key === 'Escape') handleTaskCancel();
                          }}
                          placeholder="Enter task title"
                          className="h-8 text-sm border border-blue-300 focus:border-blue-500"
                          autoFocus
                        />
                      </td>
                      <td colSpan={columns.length - 1} className="p-3">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleTaskSave(group.id)} className="h-7 px-3 text-xs">
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleTaskCancel} className="h-7 px-3 text-xs">
                            Cancel
                          </Button>
                        </div>
                      </td>
                      <td className="p-3"></td>
                    </tr>
                  )}
                </tbody>
            ))}
          </table>
        </div>
      </Card>

      {/* Task Action Panel */}
      {selectedTasks.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="border border-gray-200 shadow-lg rounded-lg p-4 bg-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    // Bulk update status
                    const newStatus = prompt('Enter new status for all selected tasks:');
                    if (newStatus) {
                      for (const taskId of selectedTasks) {
                        await handleTaskUpdate(taskId, 'status', newStatus);
                      }
                    }
                  }}
                  className="h-8 px-3 text-xs"
                >
                  Update Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    // Bulk update priority
                    const newPriority = prompt('Enter new priority for all selected tasks:');
                    if (newPriority) {
                      for (const taskId of selectedTasks) {
                        await handleTaskUpdate(taskId, 'priority', newPriority);
                      }
                    }
                  }}
                  className="h-8 px-3 text-xs"
                >
                  Update Priority
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTasks([])}
                  className="h-8 px-3 text-xs"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TableView;