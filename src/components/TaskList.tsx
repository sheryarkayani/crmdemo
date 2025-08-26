import { useQuery } from '@tanstack/react-query'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail } from 'lucide-react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export function TaskList() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['email-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          groups(title, color)
        `)
        .not('sender_email', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    },
    refetchInterval: 10000 // Refresh every 10 seconds for automated processing
  })

  if (isLoading) {
    return <div>Loading tasks...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Email-Generated Tasks</h2>
      
      {tasks?.map((task) => (
        <Card key={task.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {task.title}
              </span>
              <Badge variant="outline">{task.status}</Badge>
            </CardTitle>
            <CardDescription>
              From: {task.sender_email} | Company: {task.sender_company}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">
              Received: {new Date(task.email_received_at).toLocaleString()}
            </div>
            <div className="text-sm">
              {task.description.substring(0, 200)}...
            </div>
          </CardContent>
        </Card>
      ))}
      
      {tasks?.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No email tasks yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 