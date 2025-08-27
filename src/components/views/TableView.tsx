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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

  // Define board-specific table columns and display only requested fields
  const getColumnsForBoard = () => {
    const title = currentBoard?.title?.toLowerCase() || '';
    if (title.includes('sales')) {
      return [
        { id: 'title', name: 'Deals', type: 'text', width: 'min-w-[200px]' },
        { id: 'sales_id', name: 'Sales id', type: 'custom', width: 'min-w-[120px]' },
        { id: 'status', name: 'stage', type: 'status', width: 'min-w-[120px]' },
        { id: 'product', name: 'product', type: 'custom', width: 'min-w-[140px]' },
        { id: 'assignee_id', name: 'assign', type: 'person', width: 'min-w-[140px]' },
        { id: 'number_field', name: 'deal value', type: 'number', width: 'min-w-[120px]' },
        { id: 'customer', name: 'customer', type: 'custom', width: 'min-w-[140px]' },
        { id: 'customer_company', name: 'customer company', type: 'custom', width: 'min-w-[160px]' },
        { id: 'selected_vendor', name: 'selected vendor', type: 'custom', width: 'min-w-[160px]' },
        { id: 'vendor_company', name: 'vendor compnay', type: 'custom', width: 'min-w-[160px]' },
        { id: 'due_date', name: 'expected close date', type: 'date', width: 'min-w-[160px]' },
        { id: 'close_probability', name: 'close probability', type: 'custom', width: 'min-w-[140px]' },
        { id: 'forecast_value', name: 'forecast value', type: 'custom', width: 'min-w-[140px]' }
      ];
    }
    if (title.includes('leads')) {
      return [
        { id: 'title', name: 'Lead', type: 'text', width: 'min-w-[200px]' },
        { id: 'status', name: 'status', type: 'status', width: 'min-w-[120px]' },
        { id: 'create_contact', name: 'create a contact', type: 'button', width: 'min-w-[160px]' },
        { id: 'company', name: 'company', type: 'custom', width: 'min-w-[140px]' },
        { id: 'title_role', name: 'title', type: 'custom', width: 'min-w-[120px]' },
        { id: 'email', name: 'email', type: 'custom', width: 'min-w-[180px]' },
        { id: 'phone', name: 'phone', type: 'custom', width: 'min-w-[140px]' },
        { id: 'last_interaction', name: 'last interaction', type: 'custom', width: 'min-w-[160px]' },
        { id: 'active_sequences', name: 'active sequences', type: 'custom', width: 'min-w-[160px]' }
      ];
    }
    if (title.includes('activity')) {
      return [
        { id: 'title', name: 'activity', type: 'text', width: 'min-w-[180px]' },
        { id: 'activity_type', name: 'activity type', type: 'custom', width: 'min-w-[140px]' },
        { id: 'assignee_id', name: 'owner', type: 'person', width: 'min-w-[140px]' },
        { id: 'start_date', name: 'start time', type: 'date', width: 'min-w-[140px]' },
        { id: 'end_date', name: 'end time', type: 'date', width: 'min-w-[140px]' },
        { id: 'status', name: 'status', type: 'status', width: 'min-w-[120px]' },
        { id: 'related_items', name: 'related items', type: 'custom', width: 'min-w-[140px]' }
      ];
    }
    if (title.includes('purchase')) {
      return [
        { id: 'title', name: 'Purchase', type: 'text', width: 'min-w-[200px]' },
        { id: 'person', name: 'person', type: 'custom', width: 'min-w-[140px]' },
        { id: 'status', name: 'status', type: 'status', width: 'min-w-[120px]' },
        { id: 'deal_id', name: 'deal id', type: 'custom', width: 'min-w-[140px]' },
        { id: 'product', name: 'product', type: 'custom', width: 'min-w-[140px]' },
        { id: 'vendor', name: 'vendor', type: 'custom', width: 'min-w-[140px]' },
        { id: 'vendor_company', name: 'vendor company', type: 'custom', width: 'min-w-[160px]' },
        { id: 'customer', name: 'customer', type: 'custom', width: 'min-w-[140px]' },
        { id: 'sales_files', name: 'sales files', type: 'custom', width: 'min-w-[140px]' },
        { id: 'number_field', name: 'deal value', type: 'number', width: 'min-w-[120px]' },
        { id: 'sale_id', name: 'sale id', type: 'custom', width: 'min-w-[120px]' },
        { id: 'delivery_time', name: 'delivery time', type: 'custom', width: 'min-w-[140px]' },
        { id: 'purchase_invoice', name: 'purchase invoice', type: 'custom', width: 'min-w-[160px]' },
        { id: 'delivery_notes', name: 'delivery notes', type: 'custom', width: 'min-w-[160px]' }
      ];
    }
    if (title.includes('store')) {
      return [
        { id: 'title', name: 'item', type: 'text', width: 'min-w-[200px]' },
        { id: 'price', name: 'price', type: 'custom', width: 'min-w-[100px]' },
        { id: 'sku', name: 'sku', type: 'custom', width: 'min-w-[120px]' },
        { id: 'type', name: 'type', type: 'custom', width: 'min-w-[120px]' },
        { id: 'manufecturer', name: 'manufecturer', type: 'custom', width: 'min-w-[150px]' },
        { id: 'quantity', name: 'quantity', type: 'custom', width: 'min-w-[120px]' },
        { id: 'unit', name: 'unit', type: 'custom', width: 'min-w-[100px]' },
        { id: 'consumed', name: 'consumed', type: 'custom', width: 'min-w-[120px]' },
        { id: 'left_qty', name: 'left qty', type: 'custom', width: 'min-w-[120px]' },
        { id: 'min_qty', name: 'min qty', type: 'custom', width: 'min-w-[120px]' },
        { id: 'loc_in_inventory', name: 'loc. in inventory', type: 'custom', width: 'min-w-[160px]' },
        { id: 'links', name: 'links', type: 'custom', width: 'min-w-[160px]' },
        { id: 'remarks', name: 'remarks', type: 'custom', width: 'min-w-[160px]' },
        { id: 'part_number', name: 'part number', type: 'custom', width: 'min-w-[140px]' }
      ];
    }
    if (title.includes('ops')) {
      return [
        { id: 'title', name: 'Project', type: 'text', width: 'min-w-[220px]' },
        { id: 'assignee_id', name: 'owner', type: 'person', width: 'min-w-[140px]' },
        { id: 'client', name: 'client', type: 'custom', width: 'min-w-[140px]' },
        { id: 'timeline', name: 'timeline', type: 'timeline', width: 'min-w-[200px]' },
        { id: 'service_category', name: 'service category', type: 'custom', width: 'min-w-[160px]' },
        { id: 'status', name: 'status', type: 'status', width: 'min-w-[120px]' },
        { id: 'reviwew', name: 'reviwew', type: 'custom', width: 'min-w-[140px]' },
        { id: 'estmated_hours', name: 'estmated hours', type: 'custom', width: 'min-w-[150px]' },
        { id: 'current_billable_hours', name: 'current billable hours', type: 'custom', width: 'min-w-[180px]' },
        { id: 'hourly_rate', name: 'hourly rate', type: 'custom', width: 'min-w-[140px]' },
        { id: 'client_cost', name: 'client cost', type: 'custom', width: 'min-w-[140px]' },
        { id: 'notes', name: 'notes', type: 'custom', width: 'min-w-[200px]' },
        { id: 'date_added', name: 'date added', type: 'custom', width: 'min-w-[150px]' },
        { id: 'link_to_details', name: 'link to details', type: 'custom', width: 'min-w-[160px]' },
        { id: 'quality_check', name: 'quality check', type: 'custom', width: 'min-w-[160px]' }
      ];
    }
    if (title.includes('finance')) {
      return [
        { id: 'title', name: 'Purchase', type: 'text', width: 'min-w-[200px]' },
        { id: 'person', name: 'person', type: 'custom', width: 'min-w-[140px]' },
        { id: 'deal_id', name: 'deal id', type: 'custom', width: 'min-w-[140px]' },
        { id: 'product', name: 'product', type: 'custom', width: 'min-w-[140px]' },
        { id: 'contact', name: 'contact', type: 'custom', width: 'min-w-[140px]' },
        { id: 'company', name: 'company', type: 'custom', width: 'min-w-[160px]' },
        { id: 'sales_file', name: 'sales file', type: 'custom', width: 'min-w-[140px]' },
        { id: 'number_field', name: 'deal value', type: 'number', width: 'min-w-[120px]' },
        { id: 'sales_id', name: 'sales id', type: 'custom', width: 'min-w-[120px]' },
        { id: 'status', name: 'status', type: 'status', width: 'min-w-[120px]' },
        { id: 'payment_due_date', name: 'payment due date', type: 'custom', width: 'min-w-[160px]' },
        { id: 'purchase_invoices', name: 'purchase invoices', type: 'custom', width: 'min-w-[160px]' },
        { id: 'delivery_note', name: 'delivery note', type: 'custom', width: 'min-w-[140px]' },
        { id: 'type', name: 'type', type: 'custom', width: 'min-w-[120px]' },
        { id: 'dropdown', name: 'dropdown', type: 'custom', width: 'min-w-[140px]' }
      ];
    }
    if (title.includes('contacts')) {
      return [
        { id: 'title', name: 'contact', type: 'text', width: 'min-w-[200px]' },
        { id: 'email', name: 'email', type: 'custom', width: 'min-w-[200px]' },
        { id: 'accountss', name: 'accountss', type: 'custom', width: 'min-w-[160px]' },
        { id: 'deals', name: 'deals', type: 'custom', width: 'min-w-[200px]' },
        { id: 'deals_value', name: 'deals value', type: 'custom', width: 'min-w-[140px]' },
        { id: 'phone', name: 'phone', type: 'custom', width: 'min-w-[140px]' },
        { id: 'title_role', name: 'title', type: 'custom', width: 'min-w-[140px]' },
        { id: 'type', name: 'type', type: 'custom', width: 'min-w-[120px]' },
        { id: 'priority', name: 'priority', type: 'custom', width: 'min-w-[120px]' },
        { id: 'comments', name: 'comments', type: 'custom', width: 'min-w-[200px]' },
        { id: 'company', name: 'company', type: 'custom', width: 'min-w-[160px]' }
      ];
    }
    if (title.includes('hr')) {
      return [
        { id: 'title', name: 'request', type: 'text', width: 'min-w-[220px]' },
        { id: 'description', name: 'description', type: 'custom', width: 'min-w-[220px]' },
        { id: 'created_at_field', name: 'created at', type: 'custom', width: 'min-w-[160px]' },
        { id: 'priority', name: 'priority', type: 'custom', width: 'min-w-[120px]' },
        { id: 'assignee', name: 'assignee', type: 'custom', width: 'min-w-[140px]' },
        { id: 'due_date', name: 'due date', type: 'date', width: 'min-w-[140px]' },
        { id: 'status', name: 'status', type: 'custom', width: 'min-w-[120px]' },
        { id: 'type', name: 'type', type: 'custom', width: 'min-w-[120px]' },
        { id: 'department', name: 'department', type: 'custom', width: 'min-w-[140px]' }
      ];
    }
    // Default minimal columns if unknown board
    return [
    { id: 'title', name: 'Item', type: 'text', width: 'min-w-[200px]' },
      { id: 'status', name: 'Status', type: 'status', width: 'min-w-[140px]' }
    ];
  };

  const columns = [...getColumnsForBoard(), { id: 'details_btn', name: 'Details', type: 'details_button', width: 'min-w-[120px]' }];

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
                          {column.id === 'start_date' && (
                            <Input
                              type="datetime-local"
                              value={task.start_date ? task.start_date.substring(0, 16) : ''}
                              onChange={(e) => handleTaskUpdate(task.id, 'start_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                              className="h-8 text-sm border-0 bg-transparent hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-500"
                            />
                          )}
                          {column.id === 'end_date' && (
                            <Input
                              type="datetime-local"
                              value={task.end_date ? task.end_date.substring(0, 16) : ''}
                              onChange={(e) => handleTaskUpdate(task.id, 'end_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
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
                          {column.id === 'details_btn' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-7 px-3 text-xs">View</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Row Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-semibold">Title:</span> {task.title}</div>
                                  <div><span className="font-semibold">Status:</span> {task.status || '-'}</div>
                                  <div><span className="font-semibold">Priority:</span> {task.priority || '-'}</div>
                                  <div><span className="font-semibold">Assignee:</span> {task.assignee_id || '-'}</div>
                                  <div><span className="font-semibold">Due Date:</span> {task.due_date ? new Date(task.due_date).toLocaleString() : '-'}</div>
                                  <div><span className="font-semibold">Start:</span> {task.start_date ? new Date(task.start_date).toLocaleString() : '-'}</div>
                                  <div><span className="font-semibold">End:</span> {task.end_date ? new Date(task.end_date).toLocaleString() : '-'}</div>
                                  <div><span className="font-semibold">Deal Value/Number:</span> {task.number_field ?? '-'}</div>
                                  <div className="pt-2">
                                    <div className="font-semibold mb-1">Custom Fields</div>
                                    <div className="max-h-60 overflow-auto rounded border p-2 bg-muted/20">
                                      {Object.entries((task as any).custom_fields || {}).length === 0 ? (
                                        <div className="text-muted-foreground">No custom fields</div>
                                      ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                          {Object.entries((task as any).custom_fields).map(([k, v]) => (
                                            <div key={k} className="flex items-center justify-between gap-2">
                                              <span className="text-muted-foreground">{k}</span>
                                              <span className="font-medium break-all">{typeof v === 'number' ? v.toLocaleString() : String(v)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          {/* Generic custom fields and special buttons */}
                          {column.type === 'button' && (
                            <Button size="sm" className="h-7 px-3 text-xs" onClick={() => alert('Contact created (demo)')}>
                              Create Contact
                            </Button>
                          )}
                          {column.type === 'custom' && (
                            <span className="text-sm text-gray-700">
                              {(() => {
                                const cf = (task as any).custom_fields || {};
                                let value = cf[column.id];
                                // Fallbacks to guarantee non-empty cells for demo
                                if ((value === undefined || value === null || value === '') && column.id === 'sales_id') value = 'S-XXXX';
                                if ((value === undefined || value === null || value === '') && column.id === 'deal_id') value = 'D-XXXX';
                                if ((value === undefined || value === null || value === '') && column.id === 'product') value = 'Sample Product';
                                if ((value === undefined || value === null || value === '') && column.id === 'company') value = 'Sample Company';
                                if ((value === undefined || value === null || value === '') && column.id === 'customer_company') value = 'Sample Company';
                                if ((value === undefined || value === null || value === '') && column.id === 'selected_vendor') value = 'Sample Vendor';
                                if ((value === undefined || value === null || value === '') && column.id === 'vendor_company') value = 'Sample Vendor Co';
                                if ((value === undefined || value === null || value === '') && column.id === 'customer') value = 'Sample Contact';
                                if ((value === undefined || value === null || value === '') && column.id === 'close_probability') value = 50;
                                if ((value === undefined || value === null || value === '') && column.id === 'forecast_value') value = 10000;
                                if ((value === undefined || value === null || value === '') && column.id === 'person') value = task.assignee_id || 'user-1';
                                if ((value === undefined || value === null || value === '') && column.id === 'email') value = 'contact@example.com';
                                if ((value === undefined || value === null || value === '') && column.id === 'phone') value = '+1 555-0000';
                                if ((value === undefined || value === null || value === '') && column.id === 'title_role') value = 'Manager';
                                if ((value === undefined || value === null || value === '') && column.id === 'last_interaction') value = new Date().toISOString();
                                if ((value === undefined || value === null || value === '') && column.id === 'active_sequences') value = 'Nurture';
                                if ((value === undefined || value === null || value === '') && column.id === 'sales_files') value = 'proposal.pdf';
                                if ((value === undefined || value === null || value === '') && column.id === 'sale_id') value = cf['sales_id'] || 'S-XXXX';
                                if ((value === undefined || value === null || value === '') && column.id === 'delivery_time') value = '2 weeks';
                                if ((value === undefined || value === null || value === '') && column.id === 'purchase_invoice') value = 'INV-XXXX';
                                if ((value === undefined || value === null || value === '') && column.id === 'delivery_notes') value = 'Deliver to HQ';
                                if ((value === undefined || value === null || value === '') && column.id === 'price') value = 0;
                                if ((value === undefined || value === null || value === '') && column.id === 'sku') value = 'SKU-XXXX';
                                if ((value === undefined || value === null || value === '') && column.id === 'type') value = 'Item';
                                if ((value === undefined || value === null || value === '') && column.id === 'manufecturer') value = 'Manufacturer';
                                if ((value === undefined || value === null || value === '') && column.id === 'quantity') value = 0;
                                if ((value === undefined || value === null || value === '') && column.id === 'unit') value = 'pcs';
                                if ((value === undefined || value === null || value === '') && column.id === 'consumed') value = 0;
                                if ((value === undefined || value === null || value === '') && column.id === 'left_qty') value = 0;
                                if ((value === undefined || value === null || value === '') && column.id === 'min_qty') value = 0;
                                if ((value === undefined || value === null || value === '') && column.id === 'loc_in_inventory') value = 'Aisle-0';
                                if ((value === undefined || value === null || value === '') && column.id === 'links') value = 'https://example.com';
                                if ((value === undefined || value === null || value === '') && column.id === 'remarks') value = 'N/A';
                                if ((value === undefined || value === null || value === '') && column.id === 'part_number') value = 'PART-XXXX';
                                if ((value === undefined || value === null || value === '') && column.id === 'client') value = 'Client Co';
                                if ((value === undefined || value === null || value === '') && column.id === 'service_category') value = 'Service';
                                if ((value === undefined || value === null || value === '') && column.id === 'reviwew') value = 'Pending';
                                if ((value === undefined || value === null || value === '') && column.id === 'estmated_hours') value = 0;
                                if ((value === undefined || value === null || value === '') && column.id === 'current_billable_hours') value = 0;
                                if ((value === undefined || value === null || value === '') && column.id === 'hourly_rate') value = 0;
                                if ((value === undefined || value === null || value === '') && column.id === 'client_cost') value = 0;
                                if ((value === undefined || value === null || value === '') && column.id === 'notes') value = '—';
                                if ((value === undefined || value === null || value === '') && column.id === 'date_added') value = new Date().toISOString();
                                if ((value === undefined || value === null || value === '') && column.id === 'link_to_details') value = 'Details';
                                if ((value === undefined || value === null || value === '') && column.id === 'quality_check') value = 'Scheduled';
                                if ((value === undefined || value === null || value === '') && column.id === 'person') value = task.assignee_id || 'user-1';
                                if ((value === undefined || value === null || value === '') && column.id === 'contact') value = 'Contact';
                                if ((value === undefined || value === null || value === '') && column.id === 'sales_file') value = 'proposal.pdf';
                                if ((value === undefined || value === null || value === '') && column.id === 'sales_id') value = 'S-XXXX';
                                if ((value === undefined || value === null || value === '') && column.id === 'payment_due_date') value = new Date().toISOString();
                                if ((value === undefined || value === null || value === '') && column.id === 'purchase_invoices') value = 'INV-XXXX';
                                if ((value === undefined || value === null || value === '') && column.id === 'delivery_note') value = 'DN-XXXX';
                                if ((value === undefined || value === null || value === '') && column.id === 'type') value = 'Invoice';
                                if ((value === undefined || value === null || value === '') && column.id === 'dropdown') value = 'Net 30';
                                if ((value === undefined || value === null || value === '') && column.id === 'accountss') value = 'Account';
                                if ((value === undefined || value === null || value === '') && column.id === 'deals') value = 'Deal';
                                if ((value === undefined || value === null || value === '') && column.id === 'deals_value') value = 0;
                                if ((value === undefined || value === null || value === '') && column.id === 'comments') value = '—';
                                if ((value === undefined || value === null || value === '') && column.id === 'description') value = '—';
                                if ((value === undefined || value === null || value === '') && column.id === 'created_at_field') value = new Date().toISOString();
                                if (typeof value === 'number') return value.toLocaleString();
                                return String(value);
                              })()}
                            </span>
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