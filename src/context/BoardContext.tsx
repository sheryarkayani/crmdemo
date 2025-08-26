import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Board, TaskData, GroupData, StatusOption, PriorityOption } from '@/types/board';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useActivity } from '@/context/ActivityContext';

interface BoardContextType {
  boards: Board[];
  currentBoard: Board | null;
  currentView: 'table' | 'kanban' | 'dashboard' | 'gantt';
  loading: boolean;
  setCurrentBoard: (board: Board) => void;
  setCurrentView: (view: 'table' | 'kanban' | 'dashboard' | 'gantt') => void;
  createBoard: (title: string, description?: string) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<TaskData>) => Promise<void>;
  addTask: (groupId: string, title: string) => Promise<void>;
  createTask: (groupId: string, task: Partial<TaskData>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addGroup: (title: string, color?: string) => Promise<void>;
  updateGroup: (groupId: string, updates: { title?: string; color?: string }) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  refreshCurrentBoard: () => Promise<void>;
  canEditCurrentBoard: () => boolean;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

// Fallback mock data for when Supabase is not configured
const createMockBoard = (): Board => ({
  id: 'mock-board-1',
  title: 'E-Commerce Platform',
  description: "Pakistan's leading online marketplace development project",
  owner_id: '11111111-1111-1111-1111-111111111111', // Superadmin user ID
  owner_role: 'superadmin', // Set to superadmin so the demo superadmin can edit
  background_color: '#00A86B',
  is_starred: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  groups: [
    {
      id: 'group-1',
      title: 'Frontend Development',
      color: '#007BFF',
      board_id: 'mock-board-1',
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks: [
        {
          id: 'task-1',
          title: 'Design Product Catalog Page',
          description: 'Create responsive product catalog for Pakistani brands',
          status: 'In Progress',
          priority: 'High',
          assignee_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          budget: 2500,
          progress: 65,
          text_field: 'Working on mobile responsiveness and Urdu fonts',
          tags: 'design,mobile,responsive,urdu',
          board_id: 'mock-board-1',
          group_id: 'group-1',
          position: 0,
          number_field: 1,
          files: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'task-2',
          title: 'Implement Urdu Language Support',
          description: 'Add RTL support and Urdu translations',
          status: 'Planning',
          priority: 'Medium',
          assignee_id: 'b2c3d4e5-f6g7-8901-2345-678901bcdefg',
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          budget: 1800,
          progress: 15,
          text_field: 'Research RTL frameworks and Urdu font libraries',
          tags: 'development,i18n,rtl,urdu',
          board_id: 'mock-board-1',
          group_id: 'group-1',
          position: 1,
          number_field: 2,
          files: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'group-2',
      title: 'Backend Development',
      color: '#28A745',
      board_id: 'mock-board-1',
      position: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks: [
        {
          id: 'task-3',
          title: 'Setup Payment Gateway Integration',
          description: 'Integrate JazzCash, EasyPaisa, and bank transfers',
          status: 'In Progress',
          priority: 'Critical',
          assignee_id: '7744c17c-d74a-4d65-93d5-34d6bb8ffcad',
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          start_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          budget: 3500,
          progress: 45,
          text_field: 'Setting up JazzCash API integration first',
          tags: 'backend,payment,integration,api',
          board_id: 'mock-board-1',
          group_id: 'group-2',
          position: 0,
          number_field: 3,
          files: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'group-3',
      title: 'UI/UX Design',
      color: '#6F42C1',
      board_id: 'mock-board-1',
      position: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks: [
        {
          id: 'task-4',
          title: 'Design Mobile App Interface',
          description: 'Create mobile-first design for Pakistani users',
          status: 'Completed',
          priority: 'High',
          assignee_id: 'd4e5f6g7-h8i9-0123-4567-890123defghi',
          due_date: null,
          start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          budget: 2000,
          progress: 100,
          text_field: 'Mobile design completed and approved by client',
          tags: 'design,mobile,ui,ux,completed',
          board_id: 'mock-board-1',
          group_id: 'group-3',
          position: 0,
          number_field: 4,
          files: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  ],
  status_options: [
    { id: 'status-1', board_id: 'mock-board-1', label: 'Planning', color: '#FFA500', position: 0, created_at: new Date().toISOString() },
    { id: 'status-2', board_id: 'mock-board-1', label: 'In Progress', color: '#007BFF', position: 1, created_at: new Date().toISOString() },
    { id: 'status-3', board_id: 'mock-board-1', label: 'Review', color: '#FFC107', position: 2, created_at: new Date().toISOString() },
    { id: 'status-4', board_id: 'mock-board-1', label: 'Testing', color: '#6F42C1', position: 3, created_at: new Date().toISOString() },
    { id: 'status-5', board_id: 'mock-board-1', label: 'Completed', color: '#28A745', position: 4, created_at: new Date().toISOString() },
    { id: 'status-6', board_id: 'mock-board-1', label: 'On Hold', color: '#DC3545', position: 5, created_at: new Date().toISOString() }
  ],
  priority_options: [
    { id: 'priority-1', board_id: 'mock-board-1', label: 'Critical', color: '#DC3545', position: 0, created_at: new Date().toISOString() },
    { id: 'priority-2', board_id: 'mock-board-1', label: 'High', color: '#FD7E14', position: 1, created_at: new Date().toISOString() },
    { id: 'priority-3', board_id: 'mock-board-1', label: 'Medium', color: '#FFC107', position: 2, created_at: new Date().toISOString() },
    { id: 'priority-4', board_id: 'mock-board-1', label: 'Low', color: '#28A745', position: 3, created_at: new Date().toISOString() },
    { id: 'priority-5', board_id: 'mock-board-1', label: 'Nice to Have', color: '#6C757D', position: 4, created_at: new Date().toISOString() }
  ]
});

export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [currentView, setCurrentView] = useState<'table' | 'kanban' | 'dashboard' | 'gantt'>('table');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { logActivity } = useActivity();

  // Initialize with mock data or attempt Supabase connection
  const initializeBoards = async () => {
    try {
      setLoading(true);
      
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, using mock data');
        toast({
          title: "Demo Mode",
          description: "Using demo data. Configure Supabase to persist changes.",
          variant: "default",
        });
        
        // Use mock data
        const mockBoard = createMockBoard();
        setBoards([mockBoard]);
        setCurrentBoard(mockBoard);
        return;
      }

      // Try to use Supabase if configured
      const { supabase } = await import('@/lib/supabase');
      const { data: boardsData, error } = await supabase
        .from('boards')
        .select(`
          *,
          groups (
            *,
            tasks (*)
          ),
          status_options (*),
          priority_options (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (boardsData && boardsData.length > 0) {
        // Sort groups and tasks by position
        boardsData.forEach((board: any) => {
          if (board.groups) {
            board.groups.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
            board.groups.forEach((group: any) => {
              if (group.tasks) {
                group.tasks.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
              }
            });
          }
        });

        setBoards(boardsData);
        setCurrentBoard(boardsData[0]);
      } else {
        // Create default board if none exist
        await createBoard("E-Commerce Platform", "Pakistan's leading online marketplace development project");
      }
    } catch (error) {
      console.error('Failed to initialize boards:', error);
      toast({
        title: "Connection Error",
        description: "Using demo data. Check your internet connection.",
        variant: "destructive",
      });
      
      // Fallback to mock data
      const mockBoard = createMockBoard();
      setBoards([mockBoard]);
      setCurrentBoard(mockBoard);
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentBoard = async () => {
    if (currentBoard && isSupabaseConfigured()) {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: boardData, error } = await supabase
          .from('boards')
          .select(`
            *,
            groups (
              *,
              tasks (*)
            ),
            status_options (*),
            priority_options (*)
          `)
          .eq('id', currentBoard.id)
          .single();

        if (error) throw error;

        // Sort groups and tasks by position
        if (boardData.groups) {
          boardData.groups.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
          boardData.groups.forEach((group: any) => {
            if (group.tasks) {
              group.tasks.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
            }
          });
        }

        setCurrentBoard(boardData);
      } catch (error) {
        console.error('Failed to refresh board:', error);
      }
    }
  };

  const createBoard = async (title: string, description?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create boards",
        variant: "destructive",
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      toast({
        title: "Demo Mode",
        description: "Board creation requires Supabase configuration",
        variant: "default",
      });
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Create the board
      const { data: boardData, error: boardError } = await supabase
        .from('boards')
        .insert({
          title,
          description: description || 'A new project board',
          background_color: '#0079bf',
          is_starred: false,
          icon: '📋', // Default icon for new boards
          owner_id: user.id, // Use current user's ID
          owner_role: user.role, // Use current user's role
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (boardError) {
        console.error('Error creating board:', boardError);
        throw boardError;
      }

      // Create default status options (stages from the screenshot)
      const statusOptions = [
        { label: 'New', color: '#3B82F6', position: 0 },
        { label: 'Immediate Action', color: '#F97316', position: 1 },
        { label: 'Assigned', color: '#3B82F6', position: 2 },
        { label: 'Approval', color: '#8B5CF6', position: 3 },
        { label: 'RFQ', color: '#EAB308', position: 4 },
        { label: 'Proposal', color: '#EAB308', position: 5 },
        { label: 'Negotiation', color: '#EC4899', position: 6 },
        { label: 'Won', color: '#10B981', position: 7 },
        { label: 'Invoice Paid', color: '#059669', position: 8 },
        { label: 'Lost', color: '#EF4444', position: 9 },
        { label: 'Default Label', color: '#6B7280', position: 10 }
      ];

      const { error: statusError } = await supabase
        .from('status_options')
        .insert(
          statusOptions.map(status => ({
            board_id: boardData.id,
            label: status.label,
            color: status.color,
            position: status.position,
            created_at: new Date().toISOString()
          }))
        );

      if (statusError) {
        console.error('Error creating status options:', statusError);
      }

      // Create default priority options
      const priorityOptions = [
        { label: 'Critical', color: '#DC3545', position: 0 },
        { label: 'High', color: '#FD7E14', position: 1 },
        { label: 'Medium', color: '#FFC107', position: 2 },
        { label: 'Low', color: '#28A745', position: 3 },
        { label: 'Nice to Have', color: '#6C757D', position: 4 }
      ];

      const { error: priorityError } = await supabase
        .from('priority_options')
        .insert(
          priorityOptions.map(priority => ({
            board_id: boardData.id,
            label: priority.label,
            color: priority.color,
            position: priority.position,
            created_at: new Date().toISOString()
          }))
        );

      if (priorityError) {
        console.error('Error creating priority options:', priorityError);
      }

      // Create default groups
      const defaultGroups = [
        { title: 'To Do', color: '#6B7280', position: 0 },
        { title: 'In Progress', color: '#3B82F6', position: 1 },
        { title: 'Review', color: '#F59E0B', position: 2 },
        { title: 'Done', color: '#10B981', position: 3 }
      ];

      const { error: groupError } = await supabase
        .from('groups')
        .insert(
          defaultGroups.map(group => ({
            board_id: boardData.id,
            title: group.title,
            color: group.color,
            position: group.position,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        );

      if (groupError) {
        console.error('Error creating groups:', groupError);
      }

      toast({
        title: "Success",
        description: "Board created successfully",
      });

      // Refresh boards list and set the new board as current
      await initializeBoards();
      
    } catch (error) {
      console.error('Error creating board:', error);
      toast({
        title: "Error",
        description: "Failed to create board",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<TaskData>) => {
    // Check edit permissions
    if (!canEditCurrentBoard()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this board",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!currentBoard) return;

      // Get the task being updated for activity logging
      const task = currentBoard.groups
        ?.flatMap(group => group.tasks || [])
        .find(t => t.id === taskId);

      // Update local state immediately for better UX
      const updatedBoard = { ...currentBoard };
      updatedBoard.groups = updatedBoard.groups?.map(group => ({
        ...group,
        tasks: group.tasks?.map(task => 
          task.id === taskId 
            ? { ...task, ...updates, updated_at: new Date().toISOString() }
            : task
        )
      }));
      setCurrentBoard(updatedBoard);

      // Log activity based on what was updated
      if (task) {
        if (updates.status && updates.status !== task.status) {
          logActivity({
            type: 'status_changed',
            task_id: taskId,
            task_title: task.title,
            board_id: currentBoard.id,
            board_title: currentBoard.title,
            details: { 
              old_status: task.status, 
              new_status: updates.status 
            }
          });
        } else if (updates.priority && updates.priority !== task.priority) {
          logActivity({
            type: 'priority_changed',
            task_id: taskId,
            task_title: task.title,
            board_id: currentBoard.id,
            board_title: currentBoard.title,
            details: { 
              old_priority: task.priority, 
              new_priority: updates.priority 
            }
          });
        } else if (updates.assignee_id !== undefined && updates.assignee_id !== task.assignee_id) {
          logActivity({
            type: 'user_assigned',
            task_id: taskId,
            task_title: task.title,
            board_id: currentBoard.id,
            board_title: currentBoard.title,
            details: { 
              old_assignee: task.assignee_id, 
              new_assignee: updates.assignee_id 
            }
          });
        } else {
          logActivity({
            type: 'task_updated',
            task_id: taskId,
            task_title: task.title,
            board_id: currentBoard.id,
            board_title: currentBoard.title,
            details: updates
          });
        }
      }

      if (isSupabaseConfigured()) {
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase
          .from('tasks')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        if (error) {
          console.error('Failed to update task:', error);
          // Revert local changes if Supabase update fails
          await refreshCurrentBoard();
          throw error; // Re-throw to be caught by the caller
        }
      } else {
        // Show demo mode message for title updates
        if (updates.title) {
          toast({
            title: "Demo Mode",
            description: "Title updated locally. Enable Supabase for database persistence.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error; // Re-throw to be caught by the caller
    }
  };

  const addTask = async (groupId: string, title: string) => {
    // Check edit permissions
    if (!canEditCurrentBoard()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this board",
        variant: "destructive",
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      toast({
        title: "Demo Mode",
        description: "Task creation requires Supabase configuration",
        variant: "default",
      });
      return;
    }

    try {
      // Log activity
      if (currentBoard) {
        const group = currentBoard.groups?.find(g => g.id === groupId);
        logActivity({
          type: 'task_created',
          task_title: title,
          group_id: groupId,
          group_title: group?.title,
          board_id: currentBoard.id,
          board_title: currentBoard.title,
          details: { title }
        });
      }

      toast({
        title: "Success",
        description: "Task added successfully",
      });
      await refreshCurrentBoard();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    // Check edit permissions
    if (!canEditCurrentBoard()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this board",
        variant: "destructive",
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      toast({
        title: "Demo Mode",
        description: "Task deletion requires Supabase configuration",
        variant: "default",
      });
      return;
    }

    try {
      // Get task info for activity logging before deletion
      if (currentBoard) {
        const task = currentBoard.groups
          ?.flatMap(group => group.tasks || [])
          .find(t => t.id === taskId);
        
        if (task) {
          logActivity({
            type: 'task_deleted',
            task_id: taskId,
            task_title: task.title,
            board_id: currentBoard.id,
            board_title: currentBoard.title,
            details: { title: task.title }
          });
        }
      }

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      await refreshCurrentBoard();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addGroup = async (title: string, color: string = '#007BFF') => {
    // Check edit permissions
    if (!canEditCurrentBoard()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this board",
        variant: "destructive",
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      toast({
        title: "Demo Mode",
        description: "Group creation requires Supabase configuration",
        variant: "default",
      });
      return;
    }

    try {
      if (!currentBoard) return;

      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from('groups')
        .insert({
          board_id: currentBoard.id,
          title,
          color,
          position: (currentBoard.groups?.length || 0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating group:', error);
        throw error;
      }

      // Log activity
      logActivity({
        type: 'group_created',
        group_title: title,
        board_id: currentBoard.id,
        board_title: currentBoard.title,
        details: { title, color }
      });

      toast({
        title: "Success",
        description: "Group added successfully",
      });
      await refreshCurrentBoard();
    } catch (error) {
      console.error('Error adding group:', error);
      toast({
        title: "Error",
        description: "Failed to add group",
        variant: "destructive",
      });
    }
  };

  const createTask = async (groupId: string, task: Partial<TaskData>) => {
    // Check edit permissions
    if (!canEditCurrentBoard()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this board",
        variant: "destructive",
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      toast({
        title: "Demo Mode",
        description: "Task creation requires Supabase configuration",
        variant: "default",
      });
      return;
    }

    try {
      if (!currentBoard) return;

      const { supabase } = await import('@/lib/supabase');
      
      const targetGroup = currentBoard.groups?.find(g => g.id === groupId);
      const taskCount = targetGroup?.tasks?.length || 0;

      const { error } = await supabase
        .from('tasks')
        .insert({
          title: task.title || 'New Task',
          description: task.description || '',
          status: task.status || (currentBoard.status_options?.[0]?.label || 'To Do'),
          priority: task.priority || (currentBoard.priority_options?.[0]?.label || 'Medium'),
          due_date: task.due_date || null,
          board_id: currentBoard.id,
          group_id: groupId,
          position: taskCount,
          assignee_id: task.assignee_id || user?.id, // Use current user's ID
          number_field: task.number_field || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }

      // Log activity
      logActivity({
        type: 'task_created',
        task_title: task.title || 'New Task',
        group_id: groupId,
        group_title: targetGroup?.title,
        board_id: currentBoard.id,
        board_title: currentBoard.title,
        details: { title: task.title || 'New Task' }
      });

      toast({
        title: "Success",
        description: "Task created successfully",
      });
      await refreshCurrentBoard();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const updateGroup = async (groupId: string, updates: { title?: string; color?: string }) => {
    // Check edit permissions
    if (!canEditCurrentBoard()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this board",
        variant: "destructive",
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      toast({
        title: "Demo Mode",
        description: "Group editing requires Supabase configuration",
        variant: "default",
      });
      return;
    }

    try {
      // Get group info for activity logging
      const group = currentBoard?.groups?.find(g => g.id === groupId);
      
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from('groups')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId);

      if (error) {
        console.error('Error updating group:', error);
        throw error;
      }

      // Log activity
      if (currentBoard && group) {
        logActivity({
          type: 'group_updated',
          group_id: groupId,
          group_title: updates.title || group.title,
          board_id: currentBoard.id,
          board_title: currentBoard.title,
          details: { old_title: group.title, ...updates }
        });
      }

      toast({
        title: "Success",
        description: "Group updated successfully",
      });
      await refreshCurrentBoard();
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      });
    }
  };

  const deleteGroup = async (groupId: string) => {
    // Check edit permissions
    if (!canEditCurrentBoard()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this board",
        variant: "destructive",
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      toast({
        title: "Demo Mode",
        description: "Group deletion requires Supabase configuration",
        variant: "default",
      });
      return;
    }

    try {
      // Get group info for activity logging before deletion
      const group = currentBoard?.groups?.find(g => g.id === groupId);
      
      const { supabase } = await import('@/lib/supabase');
      
      // First delete all tasks in this group
      await supabase
        .from('tasks')
        .delete()
        .eq('group_id', groupId);

      // Then delete the group
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) {
        console.error('Error deleting group:', error);
        throw error;
      }

      // Log activity
      if (currentBoard && group) {
        logActivity({
          type: 'group_deleted',
          group_id: groupId,
          group_title: group.title,
          board_id: currentBoard.id,
          board_title: currentBoard.title,
          details: { title: group.title }
        });
      }

      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
      await refreshCurrentBoard();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    }
  };

  const deleteBoard = async (boardId: string) => {
    if (!isSupabaseConfigured()) {
      toast({
        title: "Demo Mode",
        description: "Board deletion requires Supabase configuration",
        variant: "default",
      });
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Delete all status options for the board
      await supabase
        .from('status_options')
        .delete()
        .eq('board_id', boardId);

      // Delete all priority options for the board
      await supabase
        .from('priority_options')
        .delete()
        .eq('board_id', boardId);

      // Delete all groups for the board
      await supabase
        .from('groups')
        .delete()
        .eq('board_id', boardId);

      // Delete the board itself
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', boardId);

      if (error) {
        console.error('Error deleting board:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Board deleted successfully",
      });
      await initializeBoards(); // Refresh boards list after deletion
    } catch (error) {
      console.error('Error deleting board:', error);
      toast({
        title: "Error",
        description: "Failed to delete board",
        variant: "destructive",
      });
    }
  };

  const canEditCurrentBoard = () => {
    if (!user || !currentBoard) return false;
    
    // Superadmin can edit any board
    if (user.role === 'superadmin') return true;
    
    // Board owner can edit their board
    if (currentBoard.owner_id === user.id) return true;
    
    // Users can edit boards that belong to their department/role
    if (currentBoard.owner_role === user.role) return true;
    
    return false;
  };

  // Initial load
  useEffect(() => {
    initializeBoards();
  }, []);

  return (
    <BoardContext.Provider value={{
      boards,
      currentBoard,
      currentView,
      loading,
      setCurrentBoard: (board: Board) => {
        setCurrentBoard(board);
      },
      setCurrentView,
      createBoard,
      updateTask,
      addTask,
      createTask,
      deleteTask,
      addGroup,
      updateGroup,
      deleteGroup,
      refreshCurrentBoard,
      deleteBoard,
      canEditCurrentBoard
    }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoardContext() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
}