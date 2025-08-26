import React, { useState } from 'react';
import { 
  User, 
  Building, 
  Mail, 
  Package, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  FileText,
  Send,
  AlertCircle,
  Building2,
  Phone,
  TrendingUp,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TaskData, ActionButton } from '@/types/board';
import { useBoardContext } from '@/context/BoardContext';
import { useAuth } from '@/context/AuthContext';
import { useUserContext } from '@/context/UserContext';
import EmailSimulationModal from './EmailSimulationModal';
import ActionButtonPanel from './ActionButtonPanel';

interface InquiryTaskDetailProps {
  task: TaskData;
  onClose: () => void;
  onUpdate: (updates: Partial<TaskData>) => void;
}

const InquiryTaskDetail: React.FC<InquiryTaskDetailProps> = ({ task, onClose, onUpdate }) => {
  const { user } = useAuth();
  const { getUserById } = useUserContext();
  const { canEditCurrentBoard } = useBoardContext();
  const [activeTab, setActiveTab] = useState('basic');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<string | null>(null);
  
  const canEdit = canEditCurrentBoard();
  const assignedUser = task.assignee_id ? getUserById(task.assignee_id) : null;
  
  // Generate inquiry ID if not exists
  const generateInquiryId = () => {
    if (!task.inquiry_id && task.client_company) {
      const timestamp = Date.now();
      const companyCode = task.client_company.substring(0, 8).toUpperCase().replace(/\s/g, '');
      const newId = `INQ-${timestamp}-${companyCode}`;
      onUpdate({ inquiry_id: newId });
    }
  };

  // Get action buttons based on task status and user role
  const getActionButtons = (): ActionButton[] => {
    const buttons: ActionButton[] = [];
    
    if (task.status === 'New' && user?.role === 'sales') {
      buttons.push({
        label: 'Assign & Send Acknowledgment',
        action: 'assign_acknowledge',
        icon: 'user-check',
        color: 'blue'
      });
    }
    
    if (task.status === 'Assigned' && task.is_in_stock) {
      buttons.push({
        label: 'Generate Quote',
        action: 'generate_quote',
        icon: 'file-text',
        color: 'green'
      });
    }
    
    if (task.status === 'Assigned' && !task.is_in_stock) {
      buttons.push({
        label: 'Create RFQ',
        action: 'create_rfq',
        icon: 'send',
        color: 'orange'
      });
    }
    
    if (task.inquiry_type === 'rfq_subitem') {
      buttons.push({
        label: 'Submit Vendor Quote',
        action: 'submit_vendor_quote',
        icon: 'dollar-sign',
        color: 'purple'
      });
    }
    
    if (task.status === 'Proposal Sent') {
      buttons.push(
        {
          label: 'Mark as Won',
          action: 'mark_won',
          icon: 'check-circle',
          color: 'green'
        },
        {
          label: 'Move to Negotiation',
          action: 'move_negotiation',
          icon: 'message-circle',
          color: 'yellow'
        }
      );
    }
    
    return buttons;
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'assign_acknowledge':
        setEmailTemplate('acknowledgment');
        setEmailModalOpen(true);
        break;
      case 'generate_quote':
        onUpdate({ 
          status: 'Proposal Sent',
          quote_pdf_url: `https://example.com/quote-${task.id}.pdf` // Simulated
        });
        break;
      case 'create_rfq':
        // This will be handled by the automation in BoardContext
        onUpdate({ status: 'RFQ Needed' });
        break;
      case 'submit_vendor_quote':
        // Open vendor quote form
        break;
      case 'mark_won':
        onUpdate({ 
          status: 'Won',
          po_received: true 
        });
        break;
      case 'move_negotiation':
        onUpdate({ status: 'Negotiation' });
        break;
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Task Title</label>
          <Input
            value={task.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            disabled={!canEdit}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Inquiry ID</label>
          <div className="flex gap-2 mt-1">
            <Input
              value={task.inquiry_id || ''}
              disabled
              className="bg-gray-50"
            />
            {!task.inquiry_id && (
              <Button size="sm" onClick={generateInquiryId}>
                Generate
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={task.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          disabled={!canEdit}
          className="mt-1"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Status</label>
          <Input value={task.status || ''} disabled className="mt-1 bg-gray-50" />
        </div>
        <div>
          <label className="text-sm font-medium">Priority</label>
          <Input value={task.priority || ''} disabled className="mt-1 bg-gray-50" />
        </div>
        <div>
          <label className="text-sm font-medium">Due Date</label>
          <Input
            type="date"
            value={task.due_date ? task.due_date.split('T')[0] : ''}
            onChange={(e) => onUpdate({ due_date: e.target.value })}
            disabled={!canEdit}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderClientInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <Building className="w-4 h-4" />
            Client Company
          </label>
          <Input
            value={task.client_company || ''}
            onChange={(e) => onUpdate({ client_company: e.target.value })}
            disabled={!canEdit}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Contact Person
          </label>
          <Input
            value={task.client_contact_name || ''}
            onChange={(e) => onUpdate({ client_contact_name: e.target.value })}
            disabled={!canEdit}
            className="mt-1"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Client Email
        </label>
        <Input
          type="email"
          value={task.client_email || ''}
          onChange={(e) => onUpdate({ client_email: e.target.value })}
          disabled={!canEdit}
          className="mt-1"
        />
      </div>
    </div>
  );

  const renderProductInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Product Category
          </label>
          <Select
            value={task.product_category || ''}
            onValueChange={(value) => onUpdate({ product_category: value })}
            disabled={!canEdit}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tank Cleaning">Tank Cleaning</SelectItem>
              <SelectItem value="Chemical Trading">Chemical Trading</SelectItem>
              <SelectItem value="Equipment Supply">Equipment Supply</SelectItem>
              <SelectItem value="Marine Equipment">Marine Equipment</SelectItem>
              <SelectItem value="Industrial Chemicals">Industrial Chemicals</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Quantity</label>
          <Input
            type="number"
            value={task.quantity || ''}
            onChange={(e) => onUpdate({ quantity: parseInt(e.target.value) || 0 })}
            disabled={!canEdit}
            className="mt-1"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Product Specifications</label>
        <Textarea
          value={task.product_specs || ''}
          onChange={(e) => onUpdate({ product_specs: e.target.value })}
          disabled={!canEdit}
          className="mt-1"
          rows={3}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Switch
          checked={task.is_in_stock || false}
          onCheckedChange={(checked) => onUpdate({ is_in_stock: checked })}
          disabled={!canEdit}
        />
        <label className="text-sm font-medium">In Stock</label>
      </div>
    </div>
  );

  const renderPricingInfo = () => {
    // Hide pricing from non-sales users
    if (user?.role !== 'sales' && user?.role !== 'superadmin') {
      return (
        <div className="text-center p-8 text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Pricing information is restricted to sales team members.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Unit Price (AED)
            </label>
            <Input
              type="number"
              step="0.01"
              value={task.unit_price || ''}
              onChange={(e) => onUpdate({ unit_price: parseFloat(e.target.value) || 0 })}
              disabled={!canEdit}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Markup %
            </label>
            <Input
              type="number"
              step="0.01"
              value={task.markup_percentage || ''}
              onChange={(e) => onUpdate({ markup_percentage: parseFloat(e.target.value) || 0 })}
              disabled={!canEdit}
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Vendor Quote Price (AED)</label>
            <Input
              type="number"
              step="0.01"
              value={task.vendor_quote_price || ''}
              onChange={(e) => onUpdate({ vendor_quote_price: parseFloat(e.target.value) || 0 })}
              disabled={!canEdit}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Final Client Price (AED)</label>
            <Input
              type="number"
              step="0.01"
              value={task.final_client_price || ''}
              onChange={(e) => onUpdate({ final_client_price: parseFloat(e.target.value) || 0 })}
              disabled={!canEdit}
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            checked={task.needs_approval || false}
            onCheckedChange={(checked) => onUpdate({ needs_approval: checked })}
            disabled={!canEdit}
          />
          <label className="text-sm font-medium">Requires Approval</label>
        </div>
      </div>
    );
  };

  const renderVendorInfo = () => {
    if (task.inquiry_type !== 'rfq_subitem') {
      return (
        <div className="text-center p-8 text-gray-500">
          <Building2 className="w-8 h-8 mx-auto mb-2" />
          <p>Vendor information is only available for RFQ subitems.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Vendor Company
            </label>
            <Input
              value={task.vendor_company || ''}
              onChange={(e) => onUpdate({ vendor_company: e.target.value })}
              disabled={!canEdit}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Vendor Contact
            </label>
            <Input
              value={task.vendor_contact || ''}
              onChange={(e) => onUpdate({ vendor_contact: e.target.value })}
              disabled={!canEdit}
              className="mt-1"
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Vendor Email
          </label>
          <Input
            type="email"
            value={task.vendor_email || ''}
            onChange={(e) => onUpdate({ vendor_email: e.target.value })}
            disabled={!canEdit}
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Quote Deadline
          </label>
          <Input
            type="date"
            value={task.quote_deadline ? task.quote_deadline.split('T')[0] : ''}
            onChange={(e) => onUpdate({ quote_deadline: e.target.value })}
            disabled={!canEdit}
            className="mt-1"
          />
        </div>
      </div>
    );
  };

  const renderDocuments = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Quote PDF
          </label>
          {task.quote_pdf_url ? (
            <div className="mt-1 p-2 border rounded flex items-center justify-between">
              <span className="text-sm">Quote Document</span>
              <Button size="sm" variant="outline">View</Button>
            </div>
          ) : (
            <div className="mt-1 p-4 border-2 border-dashed border-gray-300 rounded text-center text-gray-500">
              No quote PDF uploaded
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Proposal PDF
          </label>
          {task.proposal_pdf_url ? (
            <div className="mt-1 p-2 border rounded flex items-center justify-between">
              <span className="text-sm">Proposal Document</span>
              <Button size="sm" variant="outline">View</Button>
            </div>
          ) : (
            <div className="mt-1 p-4 border-2 border-dashed border-gray-300 rounded text-center text-gray-500">
              No proposal PDF uploaded
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch
          checked={task.po_received || false}
          onCheckedChange={(checked) => onUpdate({ po_received: checked })}
          disabled={!canEdit}
        />
        <label className="text-sm font-medium flex items-center gap-2">
          <Archive className="w-4 h-4" />
          Purchase Order Received
        </label>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {task.inquiry_id && (
                <Badge variant="outline">{task.inquiry_id}</Badge>
              )}
              {task.title}
            </CardTitle>
            {assignedUser && (
              <p className="text-sm text-gray-600 mt-1">
                Assigned to: {assignedUser.fullname || assignedUser.username}
              </p>
            )}
          </div>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </CardHeader>
        
        <CardContent className="overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="product">Product</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="vendor">Vendor</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="mt-4">
              {renderBasicInfo()}
            </TabsContent>
            
            <TabsContent value="client" className="mt-4">
              {renderClientInfo()}
            </TabsContent>
            
            <TabsContent value="product" className="mt-4">
              {renderProductInfo()}
            </TabsContent>
            
            <TabsContent value="pricing" className="mt-4">
              {renderPricingInfo()}
            </TabsContent>
            
            <TabsContent value="vendor" className="mt-4">
              {renderVendorInfo()}
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4">
              {renderDocuments()}
            </TabsContent>
          </Tabs>
          
          {/* Action Buttons */}
          <ActionButtonPanel
            buttons={getActionButtons()}
            onActionClick={handleActionClick}
            className="mt-6"
          />
        </CardContent>
      </Card>
      
      {/* Email Simulation Modal */}
      {emailModalOpen && emailTemplate && (
        <EmailSimulationModal
          template={emailTemplate}
          task={task}
          onClose={() => setEmailModalOpen(false)}
          onSend={() => {
            setEmailModalOpen(false);
            // Log activity or update status as needed
          }}
        />
      )}
    </div>
  );
};

export default InquiryTaskDetail; 