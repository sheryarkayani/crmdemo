import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Mail, Send, X, User, Building, Package } from 'lucide-react';
import { TaskData, EmailTemplate } from '@/types/board';
import { useToast } from '@/hooks/use-toast';

interface EmailSimulationModalProps {
  template: string;
  task: TaskData;
  onClose: () => void;
  onSend: () => void;
}

const EmailSimulationModal: React.FC<EmailSimulationModalProps> = ({
  template,
  task,
  onClose,
  onSend
}) => {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sending, setSending] = useState(false);

  // Template configurations
  const templateConfigs = {
    acknowledgment: {
      name: 'Client Acknowledgment',
      defaultRecipient: task.client_email || '',
      subjectTemplate: 'Inquiry Received - {inquiry_id} - {client_company}',
      bodyTemplate: `Dear {client_contact_name},

Thank you for your inquiry regarding {product_category}. We have received your request and assigned it ID: {inquiry_id}.

Product Details:
- Category: {product_category}
- Specifications: {product_specs}
- Quantity: {quantity}

Our sales team will review your requirements and respond within 24 hours with a detailed proposal.

Best regards,
Sales Team`
    },
    rfq_request: {
      name: 'RFQ Vendor Request',
      defaultRecipient: task.vendor_email || '',
      subjectTemplate: 'RFQ Request - {inquiry_id} - {product_category}',
      bodyTemplate: `Dear {vendor_contact},

We have a client inquiry for {product_category} and would like to request a quote.

Details:
- Client: {client_company}
- Product: {product_category}
- Specifications: {product_specs}
- Quantity: {quantity}
- Deadline: {quote_deadline}

Please provide your best quote including pricing, delivery time, and terms.

Best regards,
Procurement Team`
    },
    proposal_sent: {
      name: 'Client Proposal',
      defaultRecipient: task.client_email || '',
      subjectTemplate: 'Proposal for {product_category} - {inquiry_id}',
      bodyTemplate: `Dear {client_contact_name},

Please find attached our proposal for your {product_category} requirements.

Summary:
- Product: {product_category}
- Quantity: {quantity}
- Price: {final_client_price} AED
- Delivery: As discussed

The proposal is valid for 30 days. Please let us know if you need any clarifications.

Best regards,
Sales Team`
    }
  };

  const currentTemplate = templateConfigs[template as keyof typeof templateConfigs];

  useEffect(() => {
    if (currentTemplate) {
      setRecipientEmail(currentTemplate.defaultRecipient);
      setSubject(populateTemplate(currentTemplate.subjectTemplate));
      setBody(populateTemplate(currentTemplate.bodyTemplate));
    }
  }, [template, task]);

  const populateTemplate = (templateText: string): string => {
    return templateText
      .replace(/{inquiry_id}/g, task.inquiry_id || 'INQ-PENDING')
      .replace(/{client_company}/g, task.client_company || '[CLIENT COMPANY]')
      .replace(/{client_contact_name}/g, task.client_contact_name || '[CONTACT NAME]')
      .replace(/{product_category}/g, task.product_category || '[PRODUCT CATEGORY]')
      .replace(/{product_specs}/g, task.product_specs || '[PRODUCT SPECIFICATIONS]')
      .replace(/{quantity}/g, task.quantity?.toString() || '[QUANTITY]')
      .replace(/{quote_deadline}/g, task.quote_deadline ? new Date(task.quote_deadline).toLocaleDateString() : '[DEADLINE]')
      .replace(/{vendor_contact}/g, task.vendor_contact || '[VENDOR CONTACT]')
      .replace(/{final_client_price}/g, task.final_client_price?.toString() || '[PRICE]');
  };

  const handleSend = async () => {
    if (!recipientEmail) {
      toast({
        title: "Error",
        description: "Please enter a recipient email address",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Email Sent (Simulated)",
      description: `Email sent to ${recipientEmail}`,
      variant: "default",
    });
    
    setSending(false);
    onSend();
  };

  const getTemplateIcon = () => {
    switch (template) {
      case 'acknowledgment': return <User className="w-5 h-5" />;
      case 'rfq_request': return <Building className="w-5 h-5" />;
      case 'proposal_sent': return <Package className="w-5 h-5" />;
      default: return <Mail className="w-5 h-5" />;
    }
  };

  const getTemplateColor = () => {
    switch (template) {
      case 'acknowledgment': return 'bg-blue-500';
      case 'rfq_request': return 'bg-orange-500';
      case 'proposal_sent': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getTemplateColor()} text-white`}>
              {getTemplateIcon()}
            </div>
            <div>
              <CardTitle>Email Preview</CardTitle>
              <p className="text-sm text-gray-600">
                {currentTemplate?.name} - {task.inquiry_id || 'New Inquiry'}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Email Headers */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">From</label>
                <Input
                  value="sales@techgulf.ae"
                  disabled
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">To</label>
                <Input
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="mt-1"
                  placeholder="Enter recipient email"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          {/* Email Body */}
          <div>
            <label className="text-sm font-medium text-gray-700">Message</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 min-h-[300px] font-mono text-sm"
            />
          </div>
          
          {/* Task Information Panel */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Task Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Client:</span> {task.client_company || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Contact:</span> {task.client_contact_name || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Product:</span> {task.product_category || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Quantity:</span> {task.quantity || 'Not specified'}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || !recipientEmail}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email (Simulated)
                </>
              )}
            </Button>
          </div>
          
          {/* Simulation Notice */}
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              SIMULATION MODE
            </Badge>
            <p className="text-sm text-yellow-700 mt-1">
              This email will not actually be sent. This is for real-timenstration purposes only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSimulationModal; 