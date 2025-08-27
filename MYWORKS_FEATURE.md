# MyWorks Feature - User Task Management

## Overview
The MyWorks feature provides users with a personalized view of their tasks, deadlines, and work progress. It's accessible via the sidebar navigation "My work" item and shows tasks where the user is either the assignee or the creator.

## Features

### 1. Dashboard Overview
- **Total Tasks**: Count of all user-related tasks
- **Completed**: Tasks marked as completed
- **In Progress**: Tasks currently being worked on
- **Overdue**: Tasks past their due date

### 2. Dual View Modes

#### Calendar View
- Card-based layout showing task details
- Visual status and priority indicators
- Progress bars for task completion
- Due date information with color coding
- Board and group context

#### Table View
- Structured table format for detailed analysis
- Sortable columns for task management
- Compact progress visualization
- Easy scanning of multiple tasks

### 3. Advanced Filtering
- **Status Filter**: Filter by task status (New, In Progress, Completed, Pending)
- **Priority Filter**: Filter by priority level (High, Medium, Low)
- **Search**: Text search across task titles, descriptions, and board names

### 4. Smart Due Date Handling
- **Overdue**: Red text for past due dates
- **Due Today**: Orange text for immediate attention
- **Due Tomorrow**: Yellow text for upcoming deadlines
- **Future**: Green text for tasks with time

## Technical Implementation

### Database Schema
- Uses existing `tasks` table with `assignee_id` and `created_by` fields
- Joins with `boards`, `groups`, and `users` tables for context
- Indexes on `created_by` and `assignee_id` for performance

### Frontend Components
- **MyWorks.tsx**: Main page component
- **CalendarView**: Card-based task display
- **TableView**: Tabular task display
- **Stats Cards**: Overview metrics
- **Filter Controls**: Search and filtering interface

### Backend Integration
- **Supabase**: demo database queries
- **demo Mode**: Fallback to mock data when database not configured
- **Error Handling**: Graceful fallbacks and user notifications

## Usage

### Accessing MyWorks
1. Click on "My work" in the sidebar navigation
2. Navigate to `/my-works` route
3. View your personalized task dashboard

### Switching Views
1. Use the tabs at the top of the content area
2. Choose between "Calendar View" and "Table View"
3. Both views show the same data in different formats

### Filtering Tasks
1. Use the search box to find specific tasks
2. Select status from the dropdown to filter by completion state
3. Choose priority level to focus on high-impact tasks
4. Combine filters for precise task discovery

### Refreshing Data
1. Click the "Refresh" button in the header
2. Data automatically updates when navigating to the page
3. demo updates when using Supabase

## demo Mode
When Supabase is not configured, the system provides mock data:
- Sample tasks with realistic deadlines
- demonstrates all UI features
- Shows expected behavior without database setup

## Future Enhancements
- **Calendar Integration**: Sync with external calendar systems
- **Task Creation**: Add new tasks directly from MyWorks
- **Bulk Actions**: Select multiple tasks for batch operations
- **Export**: Download task data in various formats
- **Notifications**: demo updates for task changes

## Troubleshooting

### No Tasks Showing
- Check if you're assigned to any tasks
- Verify database connection if using Supabase
- Check filter settings aren't too restrictive

### Performance Issues
- Ensure database indexes are created
- Check for large numbers of tasks
- Verify Supabase connection limits

### UI Issues
- Clear browser cache
- Check for JavaScript console errors
- Verify all UI components are properly imported

## Database Migration
Run the updated `database_migration.sql` to add the `created_by` field:
```sql
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
```

This ensures proper task ownership tracking for the MyWorks feature.
