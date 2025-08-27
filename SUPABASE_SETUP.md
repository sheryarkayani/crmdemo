# Supabase Setup Guide

## Why Database Updates Aren't Working

The CRM system is currently running in **demo mode** because Supabase is not configured. This means:
- ✅ All UI features work (editing, viewing, etc.)
- ❌ Changes are NOT saved to the database
- ❌ Data is lost when you refresh the page
- ❌ Multiple users can't share the same data

## How to Enable Database Updates

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `crm-automation` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon/Public Key** (starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Create Environment File

1. In your project root, create a file called `.env`
2. Add these lines:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace the values with your actual Supabase credentials**

### Step 4: Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database_migration.sql`
3. Paste and run the SQL commands
4. This will create all necessary tables and fields

### Step 5: Restart Your Development Server

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
# or
bun dev
```

## Verify Setup

After setup, you should see:
- ✅ No more "demo Mode" messages
- ✅ Database updates work immediately
- ✅ Changes persist after page refresh
- ✅ Console shows "Successfully updated task" messages

## Troubleshooting

### "Access Denied" Error
- Check if your user has the correct role in the database
- Verify the `users` table has your user with proper permissions

### "Failed to update task" Error
- Check browser console for detailed error messages
- Verify your Supabase credentials are correct
- Ensure the database migration was run successfully

### Environment Variables Not Loading
- Make sure `.env` file is in the project root (same level as `package.json`)
- Restart your development server after creating `.env`
- Check that variable names start with `VITE_`

## Security Notes

- The `.env` file should NEVER be committed to git
- The anon key is safe to use in the browser (it's designed for this)
- For production, consider using Row Level Security (RLS) policies

## Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Verify your Supabase project is active
3. Ensure the database migration completed successfully
4. Check that your `.env` file is properly formatted
