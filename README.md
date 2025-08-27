# CRM Automation System

A comprehensive CRM system with automated email processing, lead management, and task tracking capabilities.

## ⚠️ **IMPORTANT: demo Mode Active**

**Current Status**: The system is running in **demo Mode** because Supabase is not configured.

### What This Means:
- ✅ **All UI Features Work**: Editing, viewing, drag & drop, etc.
- ❌ **No Database Persistence**: Changes are lost on page refresh
- ❌ **No Multi-User Support**: Data is not shared between users
- ❌ **No Real CRM Functionality**: This is just a frontend demo

### How to Enable Full Functionality:
1. **Follow the setup guide**: See `SUPABASE_SETUP.md` for detailed instructions
2. **Create a Supabase project**: Free tier available at [supabase.com](https://supabase.com)
3. **Configure environment variables**: Add your Supabase credentials to `.env`
4. **Run database migration**: Execute the SQL from `database_migration.sql`
5. **Restart the application**: Changes will then persist to the database

## ✨ **New Features (Latest Update)**

### 🔄 **Editable Lead Names - Available in ALL Views**
- **Inline Editing**: Sales reps can now click on any lead name in **ALL views** to edit it directly
- **Views Supported**: 
  - ✅ **Kanban View** - Click any task card title to edit
  - ✅ **Table View** - Click any task title in the table to edit  
  - ✅ **Dashboard View** - Click lead names in the Recent Leads section
  - ✅ **Gantt View** - Click task names in the left panel to edit
- **demo Updates**: Changes are saved immediately (locally in demo mode)
- **Keyboard Shortcuts**: 
  - `Enter` to save changes
  - `Escape` to cancel editing
- **Visual Feedback**: Hover effects and edit icons indicate editable fields
- **Consistent Experience**: Same editing behavior across all view types

### 📊 **Enhanced Product/Service Tracking**
- **Product Information**: Track specific products, SKUs, and service types
- **Stock Management**: Monitor availability, delivery estimates, and quantities
- **Pricing Details**: Unit prices, markup percentages, and client budgets
- **Technical Requirements**: Document specifications and requirements
- **Vendor Information**: Store vendor contacts and company details

### 🎯 **Lead Qualification System**
- **Qualification Score**: 0-100 scoring system for lead quality assessment
- **Urgency Levels**: Low, Medium, High, Critical priority classification
- **Lead Sources**: Track origin (Email, Website, Phone, Referral, Social Media)
- **Client Information**: Company details, contact names, and budget information

## 🚀 **How to Use**

### **Editing Lead Names in ANY View**
1. Navigate to any view (Kanban, Table, Dashboard, or Gantt)
2. Hover over any lead/task item name
3. Click the edit icon (✏️) or click directly on the name
4. Type your changes
5. Press `Enter` to save or `Escape` to cancel

**Note**: In demo mode, changes are only saved locally and will be lost on page refresh.

### **View-Specific Editing Locations**

#### **Kanban View**
- Click directly on any task card title
- Edit icon appears on hover

#### **Table View** 
- Click on any task title in the "Item" column
- Inline editing with save/cancel buttons

#### **Dashboard View**
- Click on lead names in the "Recent Leads" section
- Shows up to 10 most recent leads with editable titles

#### **Gantt View**
- Click on task names in the left task list panel
- Edit while maintaining timeline visualization

### **Viewing/Editing Lead Details**
1. Click on any lead item in the Kanban board
2. A comprehensive detail panel will open
3. Click "Edit Lead" to modify information
4. Fill in product/service details, client information, and vendor data
5. Click "Save Changes" to update (locally in demo mode)

## 🔧 **Technical Implementation**

### **Frontend Components**
- **EditableTitle**: Reusable component for inline editing across all views
- **Editable TaskCard**: Inline editing with validation and error handling
- **TaskActionPanel**: Comprehensive lead detail view and editing interface
- **Enhanced Views**: All views now support click-to-edit functionality

### **Database Integration**
- **Local State Updates**: Changes sync immediately with the UI
- **Activity Logging**: All modifications are tracked in the activity log
- **Data Validation**: Input validation and error handling for all fields
- **demo Mode**: Graceful fallback when database is not available

### **User Experience**
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Consistent theming across all components
- **Accessibility**: Keyboard navigation and screen reader support
- **Cross-View Consistency**: Same editing experience regardless of view type
- **demo Mode Indicators**: Clear warnings when database is not available

## 📋 **Workflow for Sales Reps**

1. **Email Inquiry Received** → Automatically creates lead in "New Leads" group
2. **Review Lead** → Click on lead to view full details (any view)
3. **Edit Lead Name** → Click and edit the title inline for quick updates (any view)
4. **Add Product Details** → Fill in requested products/services and specifications
5. **Check Stock** → Update availability and delivery estimates
6. **Qualify Lead** → Set qualification score and urgency level
7. **Move Through Pipeline** → Use drag & drop in Kanban or update status in any view

**Note**: In demo mode, all changes are temporary and will be lost on page refresh.

## 🔮 **Future Enhancements**

- **Stock Integration**: demo inventory checking
- **Automated Workflows**: Trigger actions based on lead qualification scores
- **Reporting Dashboard**: Analytics on lead conversion rates and product performance
- **Email Templates**: Automated follow-up emails based on lead status
- **Mobile App**: Native mobile application for field sales reps

## 🛠 **Installation & Setup**

### **Quick Start (demo Mode)**
1. **Install Dependencies**: `npm install` or `bun install`
2. **Start Development**: `npm run dev` or `bun dev`
3. **Use the System**: All features work but data is not persisted

### **Full Setup (Database Enabled)**
1. **Follow Supabase Setup**: See `SUPABASE_SETUP.md` for detailed instructions
2. **Database Migration**: Run the updated `database_migration.sql` script
3. **Environment Setup**: Configure your Supabase credentials in `.env`
4. **Restart Application**: Changes will then persist to the database

## 📞 **Support**

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Version**: 2.1.0  
**Last Updated**: December 2024  
**Status**: demo Mode Active ⚠️  
**Editable Titles**: Available in ALL Views ✅  
**Database Persistence**: Requires Supabase Setup ⚠️
