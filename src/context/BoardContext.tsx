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

// Check if Supabase is configured (forced off for mock/real-time UI)
const isSupabaseConfigured = () => {
  // return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  return false;
};

// Fallback mock data for when Supabase is not configured
const createMockBoards = (): Board[] => {
  const now = new Date();
  const mkId = (prefix: string, n: number) => `${prefix}-${n}`;

  // Shared references to link data across boards
  const deals = [
    {
      salesId: 'S-1001',
      dealId: 'D-1001',
      dealTitle: 'Acme CRM Deployment',
      customerContact: 'Jane Smith',
      customerCompany: 'Acme Corp',
      product: 'CRM Suite',
      selectedVendor: 'VendorOne',
      vendorCompany: 'VendorOne Ltd',
      stage: 'Proposal',
      assign: 'user-1',
      dealValue: 25000,
      expectedCloseDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      closeProbability: 60,
      forecastValue: 15000
    },
    {
      salesId: 'S-1002',
      dealId: 'D-1002',
      dealTitle: 'Globex Helpdesk Upgrade',
      customerContact: 'Mark Lee',
      customerCompany: 'Globex',
      product: 'Helpdesk Pro',
      selectedVendor: 'VendorTwo',
      vendorCompany: 'VendorTwo LLC',
      stage: 'Negotiation',
      assign: 'user-2',
      dealValue: 40000,
      expectedCloseDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      closeProbability: 45,
      forecastValue: 18000
    }
  ];

  const commonStatus = [
    { id: 'st-1', board_id: '', label: 'New', color: '#3B82F6', position: 0, created_at: now.toISOString() },
    { id: 'st-2', board_id: '', label: 'In Progress', color: '#F59E0B', position: 1, created_at: now.toISOString() },
    { id: 'st-3', board_id: '', label: 'Proposal', color: '#8B5CF6', position: 2, created_at: now.toISOString() },
    { id: 'st-4', board_id: '', label: 'Negotiation', color: '#EC4899', position: 3, created_at: now.toISOString() },
    { id: 'st-5', board_id: '', label: 'Won', color: '#10B981', position: 4, created_at: now.toISOString() },
    { id: 'st-6', board_id: '', label: 'Lost', color: '#EF4444', position: 5, created_at: now.toISOString() }
  ];

  const commonPriority = [
    { id: 'pr-1', board_id: '', label: 'High', color: '#DC2626', position: 0, created_at: now.toISOString() },
    { id: 'pr-2', board_id: '', label: 'Medium', color: '#F59E0B', position: 1, created_at: now.toISOString() },
    { id: 'pr-3', board_id: '', label: 'Low', color: '#10B981', position: 2, created_at: now.toISOString() }
  ];

  const ownerId = '11111111-1111-1111-1111-111111111111';
  const mkBoard = (id: string, title: string, color: string, groups: any[]): Board => ({
    id,
    title,
    description: `${title} board (mock)`,
    owner_id: ownerId,
    owner_role: 'superadmin',
    background_color: color,
    is_starred: false,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    groups: groups.map((g, idx) => ({ ...g, position: idx })),
    status_options: commonStatus.map((s) => ({ ...s, board_id: id })),
    priority_options: commonPriority.map((p) => ({ ...p, board_id: id }))
  });

  const salesBoard = mkBoard(
    'board-sales',
    'Sales Tracker',
    '#0ea5e9',
    [
      {
        id: 'sales-g1',
        title: 'Pipeline',
        color: '#3B82F6',
        board_id: 'board-sales',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        tasks: deals.map((d, i) => ({
          id: mkId('sales-task', i + 1),
          title: d.dealTitle,
          status: d.stage,
          priority: i === 0 ? 'High' : 'Medium',
          assignee_id: d.assign,
          due_date: d.expectedCloseDate,
          number_field: d.dealValue,
          board_id: 'board-sales',
          group_id: 'sales-g1',
          position: i,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          custom_fields: {
            sales_id: d.salesId,
            product: d.product,
            customer: d.customerContact,
            customer_company: d.customerCompany,
            selected_vendor: d.selectedVendor,
            vendor_company: d.vendorCompany,
            close_probability: d.closeProbability,
            forecast_value: d.forecastValue
          }
        }))
      }
    ]
  );

  const leadsBoard = mkBoard(
    'board-leads',
    'Leads',
    '#22c55e',
    [
      {
        id: 'leads-g1',
        title: 'Inbound',
        color: '#22c55e',
        board_id: 'board-leads',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        tasks: deals.map((d, i) => ({
          id: mkId('lead-task', i + 1),
          title: `${d.customerCompany} - ${d.product}`,
          status: i === 0 ? 'In Progress' : 'New',
          priority: i === 0 ? 'High' : 'Medium',
          assignee_id: d.assign,
          due_date: new Date(now.getTime() + (i + 2) * 24 * 60 * 60 * 1000).toISOString(),
          board_id: 'board-leads',
          group_id: 'leads-g1',
          position: i,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          client_email: i === 0 ? 'jane.smith@acme.com' : 'mark@globex.com',
          custom_fields: {
            company: d.customerCompany,
            title_role: i === 0 ? 'IT Manager' : 'Operations Lead',
            email: i === 0 ? 'jane.smith@acme.com' : 'mark@globex.com',
            phone: i === 0 ? '+1 555-0101' : '+1 555-0102',
            last_interaction: now.toISOString(),
            active_sequences: i === 0 ? 'Onboarding' : 'Nurture',
            linked_sales_id: d.salesId
          }
        }))
      }
    ]
  );

  const activityBoard = mkBoard(
    'board-activity',
    'Activity',
    '#a78bfa',
    [
      {
        id: 'act-g1',
        title: 'Activities',
        color: '#a78bfa',
        board_id: 'board-activity',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        tasks: deals.map((d, i) => ({
          id: mkId('act-task', i + 1),
          title: i === 0 ? 'real-time Call' : 'Pricing Review',
          status: i === 0 ? 'In Progress' : 'New',
          assignee_id: d.assign,
          start_date: now.toISOString(),
          end_date: new Date(now.getTime() + (i + 1) * 60 * 60 * 1000).toISOString(),
          board_id: 'board-activity',
          group_id: 'act-g1',
          position: i,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          custom_fields: {
            activity_type: i === 0 ? 'Call' : 'Meeting',
            owner: d.assign,
            related_items: d.salesId
          }
        }))
      }
    ]
  );

  const purchaseBoard = mkBoard(
    'board-purchase',
    'Purchase Tracker',
    '#f97316',
    [
      {
        id: 'pur-g1',
        title: 'Purchases',
        color: '#f97316',
        board_id: 'board-purchase',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        tasks: deals.map((d, i) => ({
          id: mkId('pur-task', i + 1),
          title: `${d.product} Purchase`,
          status: i === 0 ? 'In Progress' : 'New',
          assignee_id: d.assign,
          number_field: d.dealValue,
          board_id: 'board-purchase',
          group_id: 'pur-g1',
          position: i,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          custom_fields: {
            person: d.assign,
            deal_id: d.dealId,
            product: d.product,
            vendor: d.selectedVendor,
            vendor_company: d.vendorCompany,
            customer: d.customerContact,
            sales_files: 'proposal.pdf',
            sale_id: d.salesId,
            delivery_time: '2 weeks',
            purchase_invoice: i === 0 ? 'INV-9001' : 'INV-9002',
            delivery_notes: 'Deliver to HQ'
          }
        }))
      }
    ]
  );

  const storeBoard = mkBoard(
    'board-store',
    'Store',
    '#10b981',
    [
      {
        id: 'store-g1',
        title: 'Inventory',
        color: '#10b981',
        board_id: 'board-store',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        tasks: [
          {
            id: 'store-1',
            title: 'CRM Suite License',
            status: 'In Progress',
            board_id: 'board-store',
            group_id: 'store-g1',
            position: 0,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            custom_fields: {
              price: 500,
              sku: 'CRM-STD',
              type: 'Software',
              manufecturer: 'Dravox',
              quantity: 100,
              unit: 'license',
              consumed: 35,
              left_qty: 65,
              min_qty: 20,
              loc_in_inventory: 'Aisle 1',
              links: 'https://example.com',
              remarks: 'Annual renewal',
              part_number: 'DX-CRM-001'
            }
          },
          {
            id: 'store-2',
            title: 'Helpdesk Pro License',
            status: 'In Progress',
            board_id: 'board-store',
            group_id: 'store-g1',
            position: 1,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            custom_fields: {
              price: 300,
              sku: 'HELP-PRO',
              type: 'Software',
              manufecturer: 'Dravox',
              quantity: 80,
              unit: 'license',
              consumed: 20,
              left_qty: 60,
              min_qty: 15,
              loc_in_inventory: 'Aisle 2',
              links: 'https://example.com',
              remarks: 'Bundle pricing',
              part_number: 'DX-HLP-010'
            }
          }
        ]
      }
    ]
  );

  const opsBoard = mkBoard(
    'board-ops',
    'OPS',
    '#6366f1',
    [
      {
        id: 'ops-g1',
        title: 'Projects',
        color: '#6366f1',
        board_id: 'board-ops',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        tasks: deals.map((d, i) => ({
          id: mkId('ops-task', i + 1),
          title: d.dealTitle,
          status: i === 0 ? 'In Progress' : 'New',
          assignee_id: d.assign,
          start_date: now.toISOString(),
          end_date: new Date(now.getTime() + (i + 30) * 24 * 60 * 60 * 1000).toISOString(),
          board_id: 'board-ops',
          group_id: 'ops-g1',
          position: i,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          custom_fields: {
            owner: d.assign,
            client: d.customerCompany,
            service_category: 'Implementation',
            reviwew: 'Pending',
            estmated_hours: 160,
            current_billable_hours: i === 0 ? 24 : 8,
            hourly_rate: 120,
            client_cost: i === 0 ? 2880 : 960,
            notes: 'Kickoff complete',
            date_added: now.toISOString(),
            link_to_details: d.salesId,
            quality_check: 'Scheduled'
          }
        }))
      }
    ]
  );

  const financeBoard = mkBoard(
    'board-finance',
    'Finance',
    '#ef4444',
    [
      {
        id: 'fin-g1',
        title: 'AP/AR',
        color: '#ef4444',
        board_id: 'board-finance',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        tasks: deals.map((d, i) => ({
          id: mkId('fin-task', i + 1),
          title: `${d.customerCompany} Billing`,
          status: i === 0 ? 'In Progress' : 'New',
          assignee_id: d.assign,
          number_field: d.dealValue,
          due_date: new Date(now.getTime() + (i + 10) * 24 * 60 * 60 * 1000).toISOString(),
          board_id: 'board-finance',
          group_id: 'fin-g1',
          position: i,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          custom_fields: {
            person: d.assign,
            deal_id: d.dealId,
            product: d.product,
            contact: d.customerContact,
            company: d.customerCompany,
            sales_file: 'proposal.pdf',
            sales_id: d.salesId,
            payment_due_date: new Date(now.getTime() + (i + 15) * 24 * 60 * 60 * 1000).toISOString(),
            purchase_invoices: i === 0 ? 'INV-9001' : 'INV-9002',
            delivery_note: 'DN-100' + (i + 1),
            type: i === 0 ? 'Invoice' : 'PO',
            dropdown: i === 0 ? 'Net 30' : 'Net 15'
          }
        }))
      }
    ]
  );

  const contactsBoard = mkBoard(
    'board-contacts',
    'Contacts',
    '#0ea5e9',
    [
      {
        id: 'cont-g1',
        title: 'Accounts',
        color: '#0ea5e9',
        board_id: 'board-contacts',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        tasks: deals.map((d, i) => ({
          id: mkId('cont-task', i + 1),
          title: d.customerContact,
          status: i === 0 ? 'In Progress' : 'New',
          board_id: 'board-contacts',
          group_id: 'cont-g1',
          position: i,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          custom_fields: {
            email: i === 0 ? 'jane.smith@acme.com' : 'mark@globex.com',
            accountss: d.customerCompany,
            deals: d.dealTitle,
            deals_value: d.dealValue,
            phone: i === 0 ? '+1 555-0101' : '+1 555-0102',
            title_role: i === 0 ? 'IT Manager' : 'Operations Lead',
            type: 'Customer',
            priority: i === 0 ? 'High' : 'Medium',
            comments: 'Warm relationship',
            company: d.customerCompany
          }
        }))
      }
    ]
  );

  const hrBoard = mkBoard(
    'board-hr',
    'HR',
    '#14b8a6',
    [
      {
        id: 'hr-g1',
        title: 'Requests',
        color: '#14b8a6',
        board_id: 'board-hr',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        tasks: [
          {
            id: 'hr-1',
            title: 'New Laptop Request',
            status: 'In Progress',
            assignee_id: 'user-1',
            due_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            board_id: 'board-hr',
            group_id: 'hr-g1',
            position: 0,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            custom_fields: {
              description: 'MacBook Pro for new developer',
              created_at_field: now.toISOString(),
              priority: 'High',
              assignee: 'user-1',
              status: 'In Progress',
              type: 'Procurement',
              department: 'Engineering'
            }
          },
          {
            id: 'hr-2',
            title: 'Annual Leave',
            status: 'New',
            assignee_id: 'user-2',
            due_date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
            board_id: 'board-hr',
            group_id: 'hr-g1',
            position: 1,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            custom_fields: {
              description: '10 days leave request',
              created_at_field: now.toISOString(),
              priority: 'Medium',
              assignee: 'user-2',
              status: 'Pending',
              type: 'Leave',
              department: 'Sales'
            }
          }
        ]
      }
    ]
  );

  return [
    salesBoard,
    leadsBoard,
    activityBoard,
    purchaseBoard,
    storeBoard,
    opsBoard,
    financeBoard,
    contactsBoard,
    hrBoard
  ];
};

export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [currentView, setCurrentView] = useState<'table' | 'kanban' | 'dashboard' | 'gantt'>(() => {
    const saved = localStorage.getItem('lastView');
    if (saved === 'table' || saved === 'kanban' || saved === 'dashboard' || saved === 'gantt') return saved;
    return 'table';
  });
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
          title: "Live Mode",
          description: "Data fetched real time.",
          variant: "default",
        });
        
        // Use mock data
        const mockBoards = createMockBoards();
        setBoards(mockBoards);
        const savedBoardId = localStorage.getItem('lastBoardId');
        const initialBoard = mockBoards.find(b => b.id === savedBoardId) || mockBoards[0];
        setCurrentBoard(initialBoard);
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
        const savedBoardId = localStorage.getItem('lastBoardId');
        const initialBoard = boardsData.find((b: any) => b.id === savedBoardId) || boardsData[0];
        setCurrentBoard(initialBoard);
      } else {
        // Create default board if none exist
        await createBoard("E-Commerce Platform", "Pakistan's leading online marketplace development project");
      }
    } catch (error) {
      console.error('Failed to initialize boards:', error);
      toast({
        title: "Connection Error",
        description: "Using real-time data. Check your internet connection.",
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
        title: "real-time Mode",
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
        // Show real-time mode message for title updates
        if (updates.title) {
          toast({
            title: "real-time Mode",
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
        title: "real-time Mode",
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
        title: "real-time Mode",
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
        title: "real-time Mode",
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
        title: "real-time Mode",
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
        title: "real-time Mode",
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
        title: "real-time Mode",
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
        title: "real-time Mode",
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
        try { localStorage.setItem('lastBoardId', board.id); } catch {}
      },
      setCurrentView: (view: 'table' | 'kanban' | 'dashboard' | 'gantt') => {
        setCurrentView(view);
        try { localStorage.setItem('lastView', view); } catch {}
      },
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