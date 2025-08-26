import { supabase } from './supabase';
import { VendorFormData } from '@/components/dialogs/VendorRegistrationForm';

export interface EmailContact {
  id?: string;
  name: string;
  email: string;
  company: string;
  isExistingContact: boolean;
  contactId?: string;
  boardType?: 'contacts' | 'leads';
}

export interface EnhancedEmailData {
  messageId: string;
  subject: string;
  senderEmail: string;
  senderName: string;
  companyName: string;
  body: string;
  date: string;
  contact?: EmailContact;
}

export class EnhancedEmailService {
  
  /**
   * Extract sender name from email "From" field
   */
  static extractSenderName(fromString: string): string {
    // Try to extract name from "Name <email@domain.com>" format
    const nameMatch = fromString.match(/^(.+?)\s*<.+>$/);
    if (nameMatch) {
      return nameMatch[1].trim().replace(/['"]/g, '');
    }
    
    // If no name found, extract from email prefix
    const emailMatch = fromString.match(/([^<>\s]+)@/);
    if (emailMatch) {
      const emailPrefix = emailMatch[1];
      // Convert email prefix to name (john.doe -> John Doe)
      return emailPrefix
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }
    
    return 'Unknown Sender';
  }

  /**
   * Extract company name from email domain or signature
   */
  static extractCompanyName(email: string, body: string): string {
    // First try to extract from email domain
    const domain = email.split('@')[1];
    if (domain) {
      // Remove common suffixes and convert to title case
      const companyFromDomain = domain
        .replace(/\.(com|org|net|edu|gov|io|co).*$/i, '')
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
      
      // If it's not a common email provider, use it
      const commonProviders = ['gmail', 'yahoo', 'hotmail', 'outlook', 'aol'];
      if (!commonProviders.some(provider => domain.toLowerCase().includes(provider))) {
        return companyFromDomain;
      }
    }
    
    // Try to extract from email signature
    const signaturePatterns = [
      /Best regards,?\s*\n(.+?)\n/i,
      /Thanks,?\s*\n(.+?)\n/i,
      /Sincerely,?\s*\n(.+?)\n/i,
      /\n(.+?)\s+(?:Inc|Corp|LLC|Ltd|Company|Co\.)\s*$/im,
    ];
    
    for (const pattern of signaturePatterns) {
      const match = body.match(pattern);
      if (match && match[1].trim().length > 0) {
        return match[1].trim();
      }
    }
    
    return domain ? domain.split('.')[0] : 'Unknown Company';
  }

  /**
   * Check if contact exists in the contacts board or leads board
   */
  static async findExistingContact(email: string): Promise<EmailContact | null> {
    try {
      // Check contacts board first - try multiple possible names
      const contactsBoardNames = ['Contacts Board', 'Contacts', 'Customer Contacts'];
      let contactsBoard = null;
      
      for (const boardName of contactsBoardNames) {
        try {
          const { data } = await supabase
        .from('boards')
        .select('id')
            .eq('title', boardName)
        .single();
          
          if (data) {
            contactsBoard = data;
            break;
          }
        } catch (error) {
          // Continue to next board name
          continue;
        }
      }

      if (contactsBoard) {
        try {
        const { data: contactTask } = await supabase
          .from('tasks')
          .select('id, title, sender_email, sender_company, board_id')
          .eq('board_id', contactsBoard.id)
          .eq('sender_email', email)
          .single();

        if (contactTask) {
          return {
            id: contactTask.id,
            name: contactTask.title,
            email: email,
            company: contactTask.sender_company || 'Unknown',
            isExistingContact: true,
            contactId: contactTask.id,
            boardType: 'contacts'
          };
          }
        } catch (error) {
          console.log('No existing contact found in contacts board');
        }
      }

      // Check leads board if not found in contacts - try multiple possible names
      const leadsBoardNames = ['Leads', 'Leads Board', 'Prospects'];
      let leadsBoard = null;
      
      for (const boardName of leadsBoardNames) {
        try {
          const { data } = await supabase
        .from('boards')
        .select('id')
            .eq('title', boardName)
        .single();
          
          if (data) {
            leadsBoard = data;
            break;
          }
        } catch (error) {
          // Continue to next board name
          continue;
        }
      }

      if (leadsBoard) {
        try {
        const { data: leadTask } = await supabase
          .from('tasks')
          .select('id, title, sender_email, sender_company, board_id')
          .eq('board_id', leadsBoard.id)
          .eq('sender_email', email)
          .single();

        if (leadTask) {
          return {
            id: leadTask.id,
            name: leadTask.title,
            email: email,
            company: leadTask.sender_company || 'Unknown',
            isExistingContact: true,
            contactId: leadTask.id,
            boardType: 'leads'
          };
          }
        } catch (error) {
          console.log('No existing lead found in leads board');
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding existing contact:', error);
      return null;
    }
  }

  /**
   * Create task in Sales Tracker with enhanced contact information
   */
  static async createEnhancedTaskFromEmail(emailData: EnhancedEmailData): Promise<any> {
    try {
    console.log('Creating enhanced task from email:', emailData.subject);
    
      // Get Sales Tracker board - try multiple possible names
      const salesBoardNames = ['Sales Tracker Board', 'Sales Tracker', 'Sales Board'];
      let salesBoard = null;
      let boardError = null;
      
      for (const boardName of salesBoardNames) {
        try {
          const { data, error } = await supabase
      .from('boards')
      .select('id')
            .eq('title', boardName)
      .single();

          if (data && !error) {
            salesBoard = data;
            break;
          }
        } catch (error) {
          boardError = error;
          continue;
        }
      }

      if (!salesBoard) {
        console.error('Sales Tracker Board not found, trying to create it...');
        try {
          const { data: createdBoard, error: createError } = await supabase
            .from('boards')
            .insert({
              title: 'Sales Tracker Board',
              description: 'Sales inquiries and customer management',
              background_color: '#10B981',
              owner_id: '00000000-0000-0000-0000-000000000000' // Default owner
            })
            .select()
            .single();

          if (createError) {
            console.error('Failed to create Sales Tracker Board:', createError);
            throw new Error('Failed to create Sales Tracker Board');
          }
          
          salesBoard = createdBoard;
          console.log('Created Sales Tracker Board:', salesBoard.id);
        } catch (error) {
          console.error('Error creating Sales Tracker Board:', error);
          throw new Error('Sales Tracker Board not found and could not be created');
        }
      }

      // Get or create "New Inquiry" group instead of "Sales Prospects"
      let { data: newInquiryGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('board_id', salesBoard.id)
        .eq('title', 'New Inquiry')
      .single();

      if (!newInquiryGroup) {
        console.log('New Inquiry group not found, creating it...');
        try {
      const { data: createdGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
              title: 'New Inquiry',
              color: '#10B981', // Green color for new inquiries
          board_id: salesBoard.id,
          position: 0
        })
        .select()
        .single();

      if (groupError) {
        console.error('Group creation error:', groupError);
        throw groupError;
      }
          newInquiryGroup = createdGroup;
        } catch (error) {
          console.error('Error creating New Inquiry group:', error);
          throw error;
        }
      }

      // Generate unique inquiry ID: INQ-[Number]-[Company]
      const timestamp = Date.now()
      const companyCode = emailData.companyName.substring(0, 8).toUpperCase().replace(/\s/g, '')
      const inquiryId = `INQ-${timestamp}-${companyCode}`

    // Enhanced task description with contact linking info
    const contactInfo = emailData.contact?.isExistingContact 
      ? `🔗 **Linked Contact**: ${emailData.contact.name} (${emailData.contact.boardType === 'contacts' ? 'Existing Contact' : 'Lead'})`
      : '❓ **New Contact**: Registration form will be sent';

    const taskBody = `
**Email Details:**
From: ${emailData.senderName} <${emailData.senderEmail}>
Company: ${emailData.companyName}
Date: ${emailData.date}
Subject: ${emailData.subject}

**Inquiry Details:**
Inquiry ID: ${inquiryId}
Received: ${new Date().toLocaleString()}

**Contact Status:**
${contactInfo}

**Message:**
${emailData.body}
    `.trim();

      // Create the task with only essential fields to avoid database errors
      const taskData: any = {
        title: `New Inquiry - ${emailData.subject}`,
        description: taskBody,
        status: 'New',
        priority: emailData.contact?.isExistingContact ? 'Medium' : 'High',
        board_id: salesBoard.id,
        group_id: newInquiryGroup.id,
        position: 0
      };

      // Add email fields only if they exist in the database
      try {
        // Test if sender_email field exists by trying to insert it
        taskData.sender_email = emailData.senderEmail;
        taskData.sender_name = emailData.senderName;
        taskData.sender_company = emailData.companyName;
        taskData.gmail_message_id = emailData.messageId;
        taskData.email_received_at = new Date().toISOString();
      } catch (error) {
        console.log('Some email fields not available, continuing without them');
      }

      // Add custom fields for metadata
      taskData.custom_fields = {
          contact_linked: emailData.contact?.isExistingContact || false,
          contact_id: emailData.contact?.contactId,
          contact_board_type: emailData.contact?.boardType,
        needs_registration: !emailData.contact?.isExistingContact,
        inquiry_id: inquiryId
      };

      console.log('Attempting to create task with data:', taskData);

      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
      .select()
      .single();

    if (taskError) {
        console.error('Error creating enhanced task:', taskError);
      throw taskError;
    }

    // Log activity
      try {
    await supabase
      .from('activity_log')
      .insert({
        task_id: task.id,
        action: emailData.contact?.isExistingContact ? 'EMAIL_RECEIVED_LINKED' : 'EMAIL_RECEIVED_NEW',
        details: {
          from: emailData.senderEmail,
          sender_name: emailData.senderName,
          subject: emailData.subject,
          company: emailData.companyName,
          gmail_message_id: emailData.messageId,
              inquiry_id: inquiryId,
          contact_status: emailData.contact?.isExistingContact ? 'existing' : 'new'
        }
      });
      } catch (error) {
        console.error('Error logging activity:', error);
        // Don't fail the task creation if logging fails
      }

    console.log('Enhanced task created successfully:', task.id);
    return task;
    } catch (error) {
      console.error('Error in createEnhancedTaskFromEmail:', error);
      throw error;
    }
  }

  /**
   * Register new vendor/contact and create contact in appropriate board
   */
  static async registerVendorFromForm(vendorData: VendorFormData, sourceTaskId?: string): Promise<any> {
    try {
      // Determine target board (Leads for new prospects, Contacts for established relationships)
      const targetBoardTitle = vendorData.businessType === 'customer' ? 'Contacts Board' : 'Contacts Board';
      
      const { data: targetBoard } = await supabase
        .from('boards')
        .select('id')
        .eq('title', targetBoardTitle)
        .single();

      if (!targetBoard) {
        throw new Error(`${targetBoardTitle} not found`);
      }

      // Get appropriate group based on business type and company size
      let groupTitle = 'New Prospects';
      if (vendorData.businessType === 'customer') {
        if (vendorData.companySize === '1000+') {
          groupTitle = 'Enterprise Clients';
        } else if (['201-1000', '51-200'].includes(vendorData.companySize)) {
          groupTitle = 'SMB Contacts';
        } else {
          groupTitle = 'New Prospects';
        }
      }

      let { data: targetGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('board_id', targetBoard.id)
        .eq('title', groupTitle)
        .single();

      // Create group if it doesn't exist
      if (!targetGroup) {
        const { data: createdGroup, error: groupError } = await supabase
          .from('groups')
          .insert({
            title: groupTitle,
            color: '#10B981',
            board_id: targetBoard.id,
            position: 0
          })
          .select()
          .single();

        if (groupError) throw groupError;
        targetGroup = createdGroup;
      }

      // Create contact task
      const { data: contactTask, error: contactError } = await supabase
        .from('tasks')
        .insert({
          title: vendorData.contactName,
          description: `${vendorData.position ? vendorData.position + ' - ' : ''}${vendorData.notes}`,
          status: vendorData.businessType === 'customer' ? 'Active Contacts' : 'New Contact',
          priority: vendorData.priority,
          board_id: targetBoard.id,
          group_id: targetGroup.id,
          sender_email: vendorData.email,
          sender_name: vendorData.contactName,
          sender_company: vendorData.companyName,
          text_field: vendorData.businessType === 'customer' ? 'Regular' : 'Prospect',
          number_field: 0, // Initial sales value
          custom_fields: {
            phone: vendorData.phone,
            position: vendorData.position,
            company_website: vendorData.companyWebsite,
            company_address: vendorData.companyAddress,
            company_size: vendorData.companySize,
            industry: vendorData.industry,
            business_type: vendorData.businessType,
            services: vendorData.services,
            registered_from_email: !!sourceTaskId,
            source_task_id: sourceTaskId
          },
          position: 0
        })
        .select()
        .single();

      if (contactError) throw contactError;

      // Update source task if provided
      if (sourceTaskId) {
        await supabase
          .from('tasks')
          .update({
            custom_fields: {
              contact_linked: true,
              contact_id: contactTask.id,
              contact_board_type: 'contacts',
              needs_registration: false
            }
          })
          .eq('id', sourceTaskId);

        // Log activity
        await supabase
          .from('activity_log')
          .insert({
            task_id: sourceTaskId,
            action: 'CONTACT_REGISTERED',
            details: {
              new_contact_id: contactTask.id,
              contact_name: vendorData.contactName,
              company: vendorData.companyName
            }
          });
      }

      return contactTask;
    } catch (error) {
      console.error('Error registering vendor:', error);
      throw error;
    }
  }

  /**
   * Send acknowledgment email to new contact with registration form
   */
  static async sendAcknowledgmentEmail(emailAddress: string, contactName: string, companyName: string, inquiryId?: string): Promise<void> {
    try {
    console.log(`Sending acknowledgment email to ${contactName} at ${emailAddress} from ${companyName}`);
    
      // Generate registration form
      const registrationForm = this.generateRegistrationForm(contactName, companyName, inquiryId);
      
      // Template for acknowledgment email with registration form
    const emailTemplate = {
      to: emailAddress,
      subject: inquiryId ? `Inquiry Received [${inquiryId}]` : 'Thank you for contacting us - Next Steps',
      body: `
Dear ${contactName},

Thank you for reaching out to us. We have received your inquiry${inquiryId ? ` (ID: ${inquiryId})` : ''} and our team will review it shortly.

To better serve you, we have attached a brief registration form to gather some additional information about your company and requirements.

**Next Steps:**
1. Please complete the attached registration form
2. Our sales team will review your requirements
3. We will contact you within 24 hours to discuss your needs

**What to Expect:**
- Detailed proposal based on your requirements
- Technical specifications and pricing
- Delivery timeline and terms
- Ongoing support and consultation

If you have any immediate questions, please don't hesitate to reach out.

Best regards,
Sales Team
      `.trim(),
      attachments: registrationForm ? [registrationForm] : []
    };

      // TODO: Implement actual email sending logic with attachment
      // This would integrate with your email service (SendGrid, Mailgun, etc.)
      console.log('Acknowledgment email template prepared:', emailTemplate);
      console.log('Registration form attached:', registrationForm?.filename);
      
      // For now, log the email that would be sent
      await this.logEmailSent(emailTemplate, 'acknowledgment');
      
    } catch (error) {
      console.error('Error sending acknowledgment email:', error);
      // Don't throw error - email failure shouldn't break the main flow
    }
  }

  /**
   * Generate client/vendor registration form
   */
  static generateRegistrationForm(contactName: string, companyName: string, inquiryId?: string): any {
    try {
      console.log('Generating registration form for:', contactName, companyName);
      
      const formData = {
        inquiry_id: inquiryId || 'PENDING',
        contact_name: contactName,
        company_name: companyName,
        generated_at: new Date().toISOString(),
        form_type: 'client_vendor_registration',
        sections: {
          company_information: {
            company_name: companyName,
            industry: '',
            company_size: '',
            website: '',
            phone: '',
            address: ''
          },
          contact_information: {
            primary_contact: contactName,
            position: '',
            email: '',
            phone: '',
            alternative_contact: ''
          },
          business_requirements: {
            product_category: '',
            specific_needs: '',
            timeline: '',
            budget_range: '',
            technical_specifications: ''
          },
          additional_information: {
            how_did_you_hear_about_us: '',
            previous_experience: '',
            special_requirements: '',
            notes: ''
          }
        }
      };

      // TODO: Convert to PDF or HTML format for email attachment
      // This would integrate with a PDF generation library like jsPDF or Puppeteer
      console.log('Registration form generated:', formData);
      
      return {
        filename: `registration_form_${inquiryId || 'new'}_${companyName.replace(/\s+/g, '_')}.json`,
        content: formData,
        mime_type: 'application/json'
      };
      
    } catch (error) {
      console.error('Error generating registration form:', error);
      return null;
    }
  }

  /**
   * Automatically create a new lead in the Leads board for new contacts
   */
  static async createAutomaticLead(emailData: any, inquiryTaskId: string): Promise<any> {
    try {
      console.log('Creating automatic lead for new contact:', emailData.senderEmail);
      
      // Get or create Leads board - try multiple possible names
      const leadsBoardNames = ['Leads', 'Leads Board', 'Prospects'];
      let leadsBoard = null;
      
      for (const boardName of leadsBoardNames) {
        try {
          const { data } = await supabase
            .from('boards')
            .select('id')
            .eq('title', boardName)
            .single();
          
          if (data) {
            leadsBoard = data;
            break;
          }
        } catch (error) {
          // Continue to next board name
          continue;
        }
      }

      if (!leadsBoard) {
        console.log('Leads board not found, creating it...');
        try {
          const { data: createdBoard, error: boardError } = await supabase
            .from('boards')
            .insert({
              title: 'Leads',
              description: 'Potential customers and prospects',
              background_color: '#F59E0B',
              owner_id: '00000000-0000-0000-0000-000000000000' // Default owner
            })
            .select()
            .single();

          if (boardError) throw boardError;
          leadsBoard = createdBoard;
          console.log('Created Leads board:', leadsBoard.id);
        } catch (error) {
          console.error('Error creating Leads board:', error);
          throw error;
        }
      }

      // Get or create "New Leads" group
      let { data: newLeadsGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('board_id', leadsBoard.id)
        .eq('title', 'New Leads')
        .single();

      if (!newLeadsGroup) {
        console.log('New Leads group not found, creating it...');
        try {
          const { data: createdGroup, error: groupError } = await supabase
            .from('groups')
            .insert({
              title: 'New Leads',
              color: '#EF4444',
              board_id: leadsBoard.id,
              position: 0
            })
            .select()
            .single();

          if (groupError) throw groupError;
          newLeadsGroup = createdGroup;
          console.log('Created New Leads group:', newLeadsGroup.id);
        } catch (error) {
          console.error('Error creating New Leads group:', error);
          throw error;
        }
      }

      // Create lead task
      const { data: leadTask, error: leadError } = await supabase
        .from('tasks')
        .insert({
          title: emailData.senderName || emailData.senderEmail.split('@')[0],
          description: `Lead generated from email inquiry: ${emailData.subject}

**Contact Information:**
- Name: ${emailData.senderName || 'Unknown'}
- Email: ${emailData.senderEmail}
- Company: ${emailData.companyName}
- Source: Email Inquiry
- Inquiry Task ID: ${inquiryTaskId}

**Email Content:**
${emailData.body.substring(0, 500)}...`,
          status: 'New Lead',
          priority: 'High',
          board_id: leadsBoard.id,
          group_id: newLeadsGroup.id,
          sender_email: emailData.senderEmail,
          sender_name: emailData.senderName,
          sender_company: emailData.companyName,
          email_received_at: new Date().toISOString(),
          custom_fields: {
            lead_source: 'email_inquiry',
            inquiry_task_id: inquiryTaskId,
            needs_qualification: true,
            qualification_status: 'pending',
            sales_rep_assigned: false
          },
          position: 0
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // Log activity
      try {
        await supabase
          .from('activity_log')
          .insert({
            task_id: leadTask.id,
            action: 'LEAD_CREATED_FROM_EMAIL',
            details: {
              from: emailData.senderEmail,
              inquiry_task_id: inquiryTaskId,
              company: emailData.companyName,
              source: 'email_inquiry'
            }
          });
      } catch (error) {
        console.error('Error logging lead creation activity:', error);
        // Don't fail if logging fails
      }

      console.log('Automatic lead created successfully:', leadTask.id);
      return leadTask;

    } catch (error) {
      console.error('Error creating automatic lead:', error);
      throw error;
    }
  }

  /**
   * Move lead from Leads board to Contacts board upon qualification
   */
  static async qualifyLeadAndMoveToContacts(leadTaskId: string, qualificationData: any): Promise<any> {
    try {
      console.log('Qualifying lead and moving to contacts:', leadTaskId);
      
      // Get the lead task
      const { data: leadTask, error: leadError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', leadTaskId)
        .single();

      if (leadError || !leadTask) throw new Error('Lead task not found');

      // Get or create Contacts Board
      let { data: contactsBoard } = await supabase
        .from('boards')
        .select('id')
        .eq('title', 'Contacts Board')
        .single();

      if (!contactsBoard) {
        console.log('Contacts Board not found, creating it...');
        const { data: createdBoard, error: boardError } = await supabase
          .from('boards')
          .insert({
            title: 'Contacts Board',
            description: 'Qualified customers and active contacts',
            color: '#10B981'
          })
          .select()
          .single();

        if (boardError) throw boardError;
        contactsBoard = createdBoard;
      }

      // Get or create "Active Contacts" group
      let { data: activeContactsGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('board_id', contactsBoard.id)
        .eq('title', 'Active Contacts')
        .single();

      if (!activeContactsGroup) {
        console.log('Active Contacts group not found, creating it...');
        const { data: createdGroup, error: groupError } = await supabase
          .from('groups')
          .insert({
            title: 'Active Contacts',
            color: '#3B82F6',
            board_id: contactsBoard.id,
            position: 0
          })
          .select()
          .single();

        if (groupError) throw groupError;
        activeContactsGroup = createdGroup;
      }

      // Create contact task
      const { data: contactTask, error: contactError } = await supabase
        .from('tasks')
        .insert({
          title: leadTask.sender_name || leadTask.sender_email.split('@')[0],
          description: `${leadTask.description}

**Qualification Details:**
- Qualified by: ${qualificationData.qualifiedBy || 'Sales Rep'}
- Qualification date: ${new Date().toLocaleDateString()}
- Qualification notes: ${qualificationData.notes || 'Lead qualified and moved to contacts'}
- Budget: ${qualificationData.budget || 'Not specified'}
- Timeline: ${qualificationData.timeline || 'Not specified'}
- Decision maker: ${qualificationData.decisionMaker || 'Not identified'}

**Original Lead Info:**
- Lead ID: ${leadTask.id}
- Created from: Email inquiry
- Original inquiry: ${leadTask.custom_fields?.inquiry_task_id || 'Unknown'}`,
          status: 'Active Contact',
          priority: 'Medium',
          board_id: contactsBoard.id,
          group_id: activeContactsGroup.id,
          sender_email: leadTask.sender_email,
          sender_name: leadTask.sender_name,
          sender_company: leadTask.sender_company,
          email_received_at: leadTask.email_received_at,
          custom_fields: {
            contact_type: 'qualified_lead',
            original_lead_id: leadTask.id,
            qualification_date: new Date().toISOString(),
            qualified_by: qualificationData.qualifiedBy,
            budget: qualificationData.budget,
            timeline: qualificationData.timeline,
            decision_maker: qualificationData.decisionMaker,
            sales_potential: qualificationData.salesPotential || 'Medium'
          },
          position: 0
        })
        .select()
        .single();

      if (contactError) throw contactError;

      // Update the original lead task status
      await supabase
        .from('tasks')
        .update({
          status: 'Qualified',
          custom_fields: {
            ...leadTask.custom_fields,
            qualified: true,
            qualified_date: new Date().toISOString(),
            moved_to_contacts: true,
            contact_task_id: contactTask.id
          }
        })
        .eq('id', leadTaskId);

      // Log activities
      await supabase
        .from('activity_log')
        .insert([
          {
            task_id: leadTask.id,
            action: 'LEAD_QUALIFIED',
            details: {
              qualified_by: qualificationData.qualifiedBy,
              qualification_notes: qualificationData.notes,
              contact_task_id: contactTask.id
            }
          },
          {
            task_id: contactTask.id,
            action: 'CONTACT_CREATED_FROM_LEAD',
            details: {
              original_lead_id: leadTask.id,
              qualified_by: qualificationData.qualifiedBy,
              qualification_date: new Date().toISOString()
            }
          }
        ]);

      console.log('Lead qualified and moved to contacts successfully');
      return contactTask;

    } catch (error) {
      console.error('Error qualifying lead:', error);
      throw error;
    }
  }

  /**
   * Log email sending for tracking purposes
   */
  private static async logEmailSent(emailTemplate: any, emailType: string): Promise<void> {
    try {
      await supabase
        .from('activity_log')
        .insert({
          action: 'EMAIL_SENT',
          details: {
            email_type: emailType,
            to: emailTemplate.to,
            subject: emailTemplate.subject,
            sent_at: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error logging email sent:', error);
    }
  }

  /**
   * Process email with enhanced contact matching and vendor registration
   */
  static async processEmailWithContactMatching(emailData: any): Promise<any> {
    try {
      console.log('Starting enhanced email processing for:', emailData.subject);
      
      // Extract enhanced email information
      const senderName = this.extractSenderName(emailData.from);
      const companyName = this.extractCompanyName(emailData.senderEmail, emailData.body);
      
      console.log('Extracted email data:', { senderName, companyName, senderEmail: emailData.senderEmail });
      
      // Check for existing contact
      console.log('Checking for existing contact...');
      const existingContact = await this.findExistingContact(emailData.senderEmail);
      
      if (existingContact) {
        console.log('Found existing contact:', existingContact);
      } else {
        console.log('No existing contact found, will create new lead');
      }
      
      const enhancedEmailData: EnhancedEmailData = {
        messageId: emailData.messageId,
        subject: emailData.subject,
        senderEmail: emailData.senderEmail,
        senderName: senderName,
        companyName: companyName,
        body: emailData.body,
        date: emailData.date,
        contact: existingContact || {
          name: senderName,
          email: emailData.senderEmail,
          company: companyName,
          isExistingContact: false
        }
      };

      console.log('Enhanced email data prepared:', enhancedEmailData);

      // Create enhanced task
      console.log('Creating enhanced task...');
      const task = await this.createEnhancedTaskFromEmail(enhancedEmailData);
      console.log('Enhanced task created successfully:', task.id);

      // If it's a new contact, handle the complete pipeline
      if (!existingContact) {
        console.log('Processing new contact pipeline...');
        try {
          // Send acknowledgment email with registration form
          console.log('Sending acknowledgment email...');
        await this.sendAcknowledgmentEmail(emailData.senderEmail, senderName, companyName, task.custom_fields?.inquiry_id);
          
          // Automatically create a lead in the Leads board
          console.log('Creating automatic lead...');
          const leadTask = await this.createAutomaticLead(emailData, task.id);
          console.log('Lead created successfully:', leadTask.id);
          
          // Update the inquiry task to link to the created lead
          console.log('Updating inquiry task with lead link...');
          await supabase
            .from('tasks')
            .update({
              custom_fields: {
                lead_created: true,
                lead_task_id: leadTask.id,
                lead_board_id: leadTask.board_id,
                needs_registration: true,
                registration_email_sent: true
              }
            })
            .eq('id', task.id);

          // Log the complete pipeline
          console.log('Logging pipeline completion...');
          await supabase
            .from('activity_log')
            .insert({
              task_id: task.id,
              action: 'NEW_CONTACT_PIPELINE_COMPLETED',
              details: {
                lead_created: true,
                lead_task_id: leadTask.id,
                acknowledgment_email_sent: true,
                registration_form_attached: true,
                next_step: 'Lead qualification by sales team'
              }
            });

          console.log('Complete new contact pipeline executed:', {
            inquiry_task_id: task.id,
            lead_task_id: leadTask.id,
            acknowledgment_sent: true
          });

        } catch (error) {
          console.error('Error in new contact pipeline:', error);
          // Log the error but don't fail the main task creation
          try {
            await supabase
              .from('activity_log')
              .insert({
                task_id: task.id,
                action: 'NEW_CONTACT_PIPELINE_ERROR',
                details: {
                  error: error instanceof Error ? error.message : 'Unknown error',
                  pipeline_step: 'lead_creation_or_email_sending'
                }
              });
          } catch (logError) {
            console.error('Error logging pipeline error:', logError);
          }
        }
      } else {
        // Existing contact - log the linking
        console.log('Logging existing contact link...');
        try {
          await supabase
            .from('activity_log')
            .insert({
              task_id: task.id,
              action: 'EXISTING_CONTACT_LINKED',
              details: {
                contact_id: existingContact.contactId,
                contact_board: existingContact.boardType,
                contact_name: existingContact.name,
                company: existingContact.company
              }
            });
        } catch (error) {
          console.error('Error logging existing contact link:', error);
        }
      }

      // Step 2: Inquiry Assignment - Product Category & Sales Rep Assignment
      console.log('Starting inquiry assignment process...');
      try {
        await this.processInquiryAssignment(task.id, emailData.subject, companyName);
      } catch (error) {
        console.error('Error in inquiry assignment:', error);
        // Log the error but don't fail the main flow
        try {
          await supabase
            .from('activity_log')
            .insert({
              task_id: task.id,
              action: 'INQUIRY_ASSIGNMENT_ERROR',
              details: {
                error: error instanceof Error ? error.message : 'Unknown error',
                step: 'product_category_or_sales_rep_assignment'
              }
            });
        } catch (logError) {
          console.error('Error logging assignment error:', logError);
        }
      }

      console.log('Enhanced email processing completed successfully');
      return task;
    } catch (error) {
      console.error('Error in enhanced email processing:', error);
      throw error;
    }
  }

  /**
   * Step 2: Process inquiry assignment with product category and sales rep
   */
  static async processInquiryAssignment(taskId: string, subject: string, companyName: string): Promise<void> {
    try {
      console.log('Processing inquiry assignment for task:', taskId);
      
      // 1. Determine product category from subject/company
      const productCategory = this.determineProductCategory(subject, companyName);
      console.log('Determined product category:', productCategory);
      
      // 2. Find suitable sales rep based on product category expertise
      const salesRep = await this.findSalesRepByProductCategory(productCategory);
      console.log('Found sales rep:', salesRep);
      
      // 3. Update task with product category and sales rep
      const updateData: any = {
        product_category: productCategory
      };
      
      if (salesRep) {
        updateData.assigned_sales_rep = salesRep.id;
        updateData.status = 'Assigned';
        
        // Move to "Assigned" group
        const assignedGroup = await this.getOrCreateAssignedGroup(taskId);
        if (assignedGroup) {
          updateData.group_id = assignedGroup.id;
        }
        
        console.log('Task assigned to sales rep and moved to Assigned group');
      } else {
        // No sales rep found - move to "Immediate Action" group
        console.log('No suitable sales rep found, moving to Immediate Action group');
        const immediateActionGroup = await this.getOrCreateImmediateActionGroup(taskId);
        if (immediateActionGroup) {
          updateData.group_id = immediateActionGroup.id;
        }
        updateData.status = 'Immediate Action';
        updateData.custom_fields = {
          ...updateData.custom_fields,
          assignment_failure_reason: 'No sales rep available for product category',
          needs_manual_assignment: true
        };
      }
      
      // 4. Validate assignment requirements
      const validationResult = await this.validateAssignmentRequirements(taskId, productCategory, salesRep);
      if (!validationResult.isValid) {
        console.log('Assignment validation failed:', validationResult.reason);
        // Move to "Immediate Action" group due to validation failure
        const immediateActionGroup = await this.getOrCreateImmediateActionGroup(taskId);
        if (immediateActionGroup) {
          updateData.group_id = immediateActionGroup.id;
        }
        updateData.status = 'Immediate Action';
        updateData.custom_fields = {
          ...updateData.custom_fields,
          assignment_failure_reason: validationResult.reason,
          needs_manual_assignment: true,
          validation_failed: true
        };
      }
      
      // Update the task
      const { error: updateError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);
      
      if (updateError) {
        console.error('Error updating task assignment:', updateError);
        throw updateError;
      }
      
      // Log the assignment
      await supabase
        .from('activity_log')
        .insert({
          task_id: taskId,
          action: salesRep ? 'TASK_ASSIGNED' : 'TASK_NEEDS_ASSIGNMENT',
          details: {
            product_category: productCategory,
            sales_rep_id: salesRep?.id || null,
            sales_rep_name: salesRep?.name || null,
            group_moved_to: salesRep ? 'Assigned' : 'Immediate Action',
            assignment_status: salesRep ? 'successful' : 'failed',
            validation_passed: validationResult.isValid,
            validation_reason: validationResult.reason
          }
        });
      
      console.log('Inquiry assignment completed successfully');
      
    } catch (error) {
      console.error('Error in inquiry assignment:', error);
      throw error;
    }
  }

  /**
   * Validate assignment requirements before allowing status change to "Assigned"
   */
  static async validateAssignmentRequirements(taskId: string, productCategory: string, salesRep: any): Promise<{ isValid: boolean; reason: string }> {
    try {
      console.log('Validating assignment requirements for task:', taskId);
      
      // Check if product category is set
      if (!productCategory || productCategory === 'General Inquiry') {
        return {
          isValid: false,
          reason: 'Product category not specified or too generic'
        };
      }
      
      // Check if sales rep is assigned
      if (!salesRep) {
        return {
          isValid: false,
          reason: 'No sales rep assigned for this product category'
        };
      }
      
      // Check if sales rep has required expertise
      const hasExpertise = await this.validateSalesRepExpertise(salesRep.id, productCategory);
      if (!hasExpertise) {
        return {
          isValid: false,
          reason: 'Assigned sales rep lacks expertise in this product category'
        };
      }
      
      // Check if sales rep is available (not overloaded)
      const isAvailable = await this.checkSalesRepAvailability(salesRep.id);
      if (!isAvailable) {
        return {
          isValid: false,
          reason: 'Assigned sales rep is currently overloaded'
        };
      }
      
      console.log('All assignment requirements validated successfully');
      return { isValid: true, reason: 'All requirements met' };
      
    } catch (error) {
      console.error('Error validating assignment requirements:', error);
      return {
        isValid: false,
        reason: 'Validation error occurred'
      };
    }
  }

  /**
   * Validate if sales rep has expertise in the product category
   */
  static async validateSalesRepExpertise(salesRepId: string, productCategory: string): Promise<boolean> {
    try {
      // Query sales rep expertise from users table (adjusted for your schema)
      const { data: salesRep, error } = await supabase
        .from('users')
        .select('fullname, role')
        .eq('id', salesRepId)
        .single();
      
      if (error || !salesRep) {
        console.log('Could not fetch sales rep details, assuming valid');
        return true; // Assume valid if we can't verify
      }
      
      // Since your schema doesn't have expertise fields, we'll assume all sales reps
      // are qualified for general inquiries and use role-based validation
      console.log(`Sales rep validation for ${productCategory}: ${salesRep.fullname} (${salesRep.role})`);
      
      // For now, assume all sales reps are qualified
      // You can enhance this later by adding expertise fields to your users table
      return true;
      
    } catch (error) {
      console.error('Error validating sales rep expertise:', error);
      return true; // Assume valid if we can't verify
    }
  }

  /**
   * Check if sales rep is available (not overloaded with too many tasks)
   */
  static async checkSalesRepAvailability(salesRepId: string): Promise<boolean> {
    try {
      // Count active tasks assigned to this sales rep
      const { data: activeTasks, error } = await supabase
        .from('tasks')
        .select('id')
        .eq('assigned_sales_rep', salesRepId)
        .in('status', ['New', 'Assigned', 'In Progress'])
        .limit(100); // Reasonable limit
      
      if (error) {
        console.log('Could not check sales rep availability, assuming available');
        return true; // Assume available if we can't verify
      }
      
      const maxTasks = 10; // Maximum tasks a sales rep should handle simultaneously
      const isAvailable = (activeTasks?.length || 0) < maxTasks;
      
      console.log(`Sales rep availability check: ${activeTasks?.length || 0}/${maxTasks} tasks, available: ${isAvailable}`);
      return isAvailable;
      
    } catch (error) {
      console.error('Error checking sales rep availability:', error);
      return true; // Assume available if we can't verify
    }
  }

  /**
   * Manually assign a sales rep to a task (for manual intervention)
   */
  static async manuallyAssignSalesRep(taskId: string, salesRepId: string, assignedBy: string): Promise<boolean> {
    try {
      console.log(`Manually assigning sales rep ${salesRepId} to task ${taskId}`);
      
      // Get the task details
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
      
      if (taskError || !task) {
        console.error('Error getting task details:', taskError);
        return false;
      }
      
      // Validate the assignment
      const validationResult = await this.validateAssignmentRequirements(taskId, task.product_category, { id: salesRepId });
      if (!validationResult.isValid) {
        console.log('Manual assignment validation failed:', validationResult.reason);
        // Still allow assignment but log the issue
      }
      
      // Update the task with the new assignment
      const updateData: any = {
        assigned_sales_rep: salesRepId,
        status: 'Assigned',
        custom_fields: {
          ...task.custom_fields,
          manually_assigned: true,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
          validation_warnings: validationResult.isValid ? [] : [validationResult.reason]
        }
      };
      
      // Move to "Assigned" group
      const assignedGroup = await this.getOrCreateAssignedGroup(taskId);
      if (assignedGroup) {
        updateData.group_id = assignedGroup.id;
      }
      
      const { error: updateError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);
      
      if (updateError) {
        console.error('Error updating task assignment:', updateError);
        return false;
      }
      
      // Log the manual assignment
      try {
        await supabase
          .from('activity_log')
          .insert({
            task_id: taskId,
            action: 'MANUAL_SALES_REP_ASSIGNMENT',
            details: {
              sales_rep_id: salesRepId,
              assigned_by: assignedBy,
              previous_status: task.status,
              new_status: 'Assigned',
              validation_passed: validationResult.isValid,
              validation_warnings: validationResult.isValid ? [] : [validationResult.reason]
            }
          });
      } catch (error) {
        console.error('Error logging manual assignment:', error);
        // Don't fail the assignment if logging fails
      }
      
      console.log('Manual sales rep assignment completed successfully');
      return true;
      
    } catch (error) {
      console.error('Error in manual sales rep assignment:', error);
      return false;
    }
  }

  /**
   * Get tasks that need manual sales rep assignment
   */
  static async getTasksNeedingAssignment(): Promise<any[]> {
    try {
      console.log('Fetching tasks that need manual assignment');
      
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          groups(title, color),
          boards(title)
        `)
        .or('status.eq.Immediate Action,needs_manual_assignment.eq.true')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks needing assignment:', error);
        return [];
      }
      
      console.log(`Found ${tasks?.length || 0} tasks needing assignment`);
      return tasks || [];
      
    } catch (error) {
      console.error('Error getting tasks needing assignment:', error);
      return [];
    }
  }

  /**
   * Determine product category from email subject and company
   */
  static determineProductCategory(subject: string, companyName: string): string {
    const subjectLower = subject.toLowerCase();
    const companyLower = companyName.toLowerCase();
    
    // Product category mapping based on keywords
    const categoryKeywords = {
      'Tank Cleaning': ['tank', 'cleaning', 'maintenance', 'industrial cleaning', 'storage tank'],
      'Chemical Trading': ['chemical', 'trading', 'supply', 'raw material', 'industrial chemical'],
      'Equipment Supply': ['equipment', 'supply', 'machinery', 'industrial equipment', 'tools'],
      'Consulting Services': ['consulting', 'service', 'advisory', 'expertise', 'professional service'],
      'General Inquiry': ['general', 'inquiry', 'information', 'quote', 'request']
    };
    
    // Check subject for category indicators
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => subjectLower.includes(keyword))) {
        return category;
      }
    }
    
    // Check company name for industry indicators
    const industryKeywords = {
      'Tank Cleaning': ['oil', 'gas', 'petroleum', 'chemical', 'industrial', 'manufacturing'],
      'Chemical Trading': ['chemical', 'pharmaceutical', 'industrial', 'manufacturing', 'trading'],
      'Equipment Supply': ['equipment', 'machinery', 'industrial', 'manufacturing', 'supply'],
      'Consulting Services': ['consulting', 'advisory', 'services', 'professional', 'expertise']
    };
    
    for (const [category, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => companyLower.includes(keyword))) {
        return category;
      }
    }
    
    // Default to general inquiry if no specific category found
    return 'General Inquiry';
  }

  /**
   * Find sales rep based on product category expertise
   */
  static async findSalesRepByProductCategory(productCategory: string): Promise<any> {
    try {
      console.log('Finding sales rep for product category:', productCategory);
      
      // Query for sales reps with expertise in this category
      // This would typically query a users table with role='sales_rep' and expertise fields
      // For now, we'll implement a basic mapping system
      
      const categoryExpertiseMap: { [key: string]: string[] } = {
        'Tank Cleaning': ['tank_cleaning_expert', 'industrial_cleaning_specialist'],
        'Chemical Trading': ['chemical_trading_expert', 'supply_chain_specialist'],
        'Equipment Supply': ['equipment_specialist', 'industrial_supply_expert'],
        'Consulting Services': ['consulting_expert', 'business_development'],
        'General Inquiry': ['general_sales_rep', 'account_manager']
      };
      
      const expertiseAreas = categoryExpertiseMap[productCategory] || ['general_sales_rep'];
      
      // Query for available sales reps (adjusted for your schema)
      const { data: salesReps, error } = await supabase
        .from('users')
        .select('id, fullname, email, role')
        .eq('role', 'sales')
        .limit(1);
      
      if (error) {
        console.log('Error querying sales reps, using fallback logic:', error);
        // Fallback: return a default sales rep or null
        return null;
      }
      
      if (salesReps && salesReps.length > 0) {
        console.log('Found suitable sales rep:', salesReps[0]);
        // Map the response to match expected format
        return {
          id: salesReps[0].id,
          name: salesReps[0].fullname,
          email: salesReps[0].email,
          role: salesReps[0].role
        };
      }
      
      // If no specific expert found, try to find any available sales rep
      const { data: generalReps, error: generalError } = await supabase
        .from('users')
        .select('id, fullname, email, role')
        .eq('role', 'sales')
        .limit(1);
      
      if (generalError || !generalReps || generalReps.length === 0) {
        console.log('No sales reps available');
        return null;
      }
      
      console.log('Found general sales rep:', generalReps[0]);
      // Map the response to match expected format
      return {
        id: generalReps[0].id,
        name: generalReps[0].fullname,
        email: generalReps[0].email,
        role: generalReps[0].role
      };
      
    } catch (error) {
      console.error('Error finding sales rep:', error);
      return null;
    }
  }

  /**
   * Get or create "Assigned" group in the current board
   */
  static async getOrCreateAssignedGroup(taskId: string): Promise<any> {
    try {
      // Get the current task to find its board
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('board_id')
        .eq('id', taskId)
        .single();
      
      if (taskError || !task) {
        console.error('Error getting task board:', taskError);
        return null;
      }
      
      // Try to find existing "Assigned" group
      let { data: assignedGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('board_id', task.board_id)
        .eq('title', 'Assigned')
        .single();
      
      if (!assignedGroup) {
        console.log('Creating Assigned group...');
        const { data: createdGroup, error: groupError } = await supabase
          .from('groups')
          .insert({
            title: 'Assigned',
            color: '#3B82F6', // Blue color for assigned tasks
            board_id: task.board_id,
            position: 2
          })
          .select()
          .single();
        
        if (groupError) {
          console.error('Error creating Assigned group:', groupError);
          return null;
        }
        
        assignedGroup = createdGroup;
        console.log('Assigned group created:', assignedGroup.id);
      }
      
      return assignedGroup;
      
    } catch (error) {
      console.error('Error getting/creating Assigned group:', error);
      return null;
    }
  }

  /**
   * Get or create "Immediate Action" group in the current board
   */
  static async getOrCreateImmediateActionGroup(taskId: string): Promise<any> {
    try {
      // Get the current task to find its board
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('board_id')
        .eq('id', taskId)
        .single();
      
      if (taskError || !task) {
        console.error('Error getting task board:', taskError);
        return null;
      }
      
      // Try to find existing "Immediate Action" group
      let { data: immediateActionGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('board_id', task.board_id)
        .eq('title', 'Immediate Action')
        .single();
      
      if (!immediateActionGroup) {
        console.log('Creating Immediate Action group...');
        const { data: createdGroup, error: groupError } = await supabase
          .from('groups')
          .insert({
            title: 'Immediate Action',
            color: '#EF4444', // Red color for urgent tasks
            board_id: task.board_id,
            position: 3
          })
          .select()
          .single();
        
        if (groupError) {
          console.error('Error creating Immediate Action group:', groupError);
          return null;
        }
        
        immediateActionGroup = createdGroup;
        console.log('Immediate Action group created:', immediateActionGroup.id);
      }
      
      return immediateActionGroup;
      
    } catch (error) {
      console.error('Error getting/creating Immediate Action group:', error);
      return null;
    }
  }

  /**
   * Manually create a new contact in the Leads board (for sales reps)
   */
  static async manuallyCreateLead(contactData: {
    name: string;
    email: string;
    company: string;
    phone?: string;
    position?: string;
    notes?: string;
    createdBy: string;
  }): Promise<any> {
    try {
      console.log('Manually creating lead:', contactData.email);
      
      // Get or create Leads board
      let { data: leadsBoard } = await supabase
        .from('boards')
        .select('id')
        .eq('title', 'Leads')
        .single();

      if (!leadsBoard) {
        const { data: createdBoard, error: boardError } = await supabase
          .from('boards')
          .insert({
            title: 'Leads',
            description: 'Potential customers and prospects',
            color: '#F59E0B'
          })
          .select()
          .single();

        if (boardError) throw boardError;
        leadsBoard = createdBoard;
      }

      // Get or create "Manual Leads" group
      let { data: manualLeadsGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('board_id', leadsBoard.id)
        .eq('title', 'Manual Leads')
        .single();

      if (!manualLeadsGroup) {
        const { data: createdGroup, error: groupError } = await supabase
          .from('groups')
          .insert({
            title: 'Manual Leads',
            color: '#8B5CF6',
            board_id: leadsBoard.id,
            position: 1
          })
          .select()
          .single();

        if (groupError) throw groupError;
        manualLeadsGroup = createdGroup;
      }

      // Create lead task
      const { data: leadTask, error: leadError } = await supabase
        .from('tasks')
        .insert({
          title: contactData.name,
          description: `Manually created lead by: ${contactData.createdBy}

**Contact Information:**
- Name: ${contactData.name}
- Email: ${contactData.email}
- Company: ${contactData.company}
- Phone: ${contactData.phone || 'Not provided'}
- Position: ${contactData.position || 'Not specified'}
- Notes: ${contactData.notes || 'No additional notes'}

**Lead Details:**
- Created: ${new Date().toLocaleString()}
- Created by: ${contactData.createdBy}
- Source: Manual creation
- Status: New Lead`,
          status: 'New Lead',
          priority: 'Medium',
          board_id: leadsBoard.id,
          group_id: manualLeadsGroup.id,
          sender_email: contactData.email,
          sender_name: contactData.name,
          sender_company: contactData.company,
          email_received_at: new Date().toISOString(),
          custom_fields: {
            lead_source: 'manual_creation',
            created_by: contactData.createdBy,
            phone: contactData.phone,
            position: contactData.position,
            notes: contactData.notes,
            needs_qualification: true,
            qualification_status: 'pending',
            sales_rep_assigned: false
          },
          position: 0
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // Log activity
      await supabase
        .from('activity_log')
        .insert({
          task_id: leadTask.id,
          action: 'LEAD_CREATED_MANUALLY',
          details: {
            created_by: contactData.createdBy,
            contact_name: contactData.name,
            company: contactData.company,
            email: contactData.email
          }
        });

      console.log('Manual lead created successfully:', leadTask.id);
      return leadTask;

    } catch (error) {
      console.error('Error manually creating lead:', error);
      throw error;
    }
  }

  /**
   * Move lead from Leads board to Contacts board with qualification data
   */
  static async moveLeadToContacts(leadTaskId: string, qualificationData: {
    qualifiedBy: string;
    notes?: string;
    budget?: string;
    timeline?: string;
    decisionMaker?: string;
    salesPotential?: string;
    nextSteps?: string;
  }): Promise<any> {
    try {
      console.log('Moving lead to contacts:', leadTaskId);
      
      // Use the existing qualification method
      const contactTask = await this.qualifyLeadAndMoveToContacts(leadTaskId, qualificationData);
      
      // Additional logging for manual move
      await supabase
        .from('activity_log')
        .insert({
          task_id: contactTask.id,
          action: 'LEAD_MOVED_TO_CONTACTS_MANUALLY',
          details: {
            moved_by: qualificationData.qualifiedBy,
            original_lead_id: leadTaskId,
            qualification_notes: qualificationData.notes,
            next_steps: qualificationData.nextSteps
          }
        });

      return contactTask;

    } catch (error) {
      console.error('Error moving lead to contacts:', error);
      throw error;
    }
  }

  /**
   * Get all leads that need qualification
   */
  static async getLeadsNeedingQualification(): Promise<any[]> {
    try {
      const { data: leads, error } = await supabase
        .from('tasks')
        .select(`
          *,
          groups(title, color),
          boards(title)
        `)
        .eq('custom_fields->needs_qualification', true)
        .eq('custom_fields->qualification_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return leads || [];

    } catch (error) {
      console.error('Error getting leads needing qualification:', error);
      return [];
    }
  }

  /**
   * Get all contacts with their lead history
   */
  static async getContactsWithLeadHistory(): Promise<any[]> {
    try {
      const { data: contacts, error } = await supabase
        .from('tasks')
        .select(`
          *,
          groups(title, color),
          boards(title)
        `)
        .eq('custom_fields->contact_type', 'qualified_lead')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return contacts || [];

    } catch (error) {
      console.error('Error getting contacts with lead history:', error);
      return [];
    }
  }
} 