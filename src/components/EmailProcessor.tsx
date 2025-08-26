import { useState, useEffect } from 'react'
import { GmailClient } from '@/lib/gmail-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Mail, RefreshCw, CheckCircle, Clock, User, Building2, Bug } from 'lucide-react'

interface EmailData {
  messageId: string
  from: string
  senderEmail: string
  senderName: string
  companyName: string
  subject: string
  date: string
  body: string
  to: string
}

export function EmailProcessor() {
  const [emails, setEmails] = useState<EmailData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [processedEmails, setProcessedEmails] = useState<Set<string>>(new Set())
  const [gmailClient] = useState(() => new GmailClient())
  const { toast } = useToast()

  // Debug Gmail status
  const debugGmailStatus = async () => {
    console.log('=== Manual Debug Check ===')
    await gmailClient.debugStatus()
    const authStatus = gmailClient.getAuthStatus()
    console.log('Auth Status Object:', authStatus)
    
    toast({
      title: "Debug Info",
      description: "Check browser console for detailed status information"
    })
  }

  // Force re-authentication
  const forceReAuth = async () => {
    setIsLoading(true)
    try {
      await gmailClient.forceReAuth()
      toast({
        title: "Re-Authentication Complete",
        description: "Successfully re-authenticated with Gmail"
      })
    } catch (error) {
      console.error('Re-auth failed:', error)
      toast({
        title: "Re-Auth Failed",
        description: error instanceof Error ? error.message : "Failed to re-authenticate",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch recent emails
  const fetchEmails = async () => {
    setIsLoading(true)
    try {
      // First ensure the client is ready
      const isReady = await gmailClient.isReady()
      if (!isReady) {
        toast({
          title: "Gmail Not Ready",
          description: "Gmail client is not properly initialized. Please refresh the page.",
          variant: "destructive"
        })
        return
      }

      // Check sign-in status
      const isSignedIn = await gmailClient.isSignedIn()
      console.log('Gmail sign-in status:', isSignedIn)
      
      if (!isSignedIn) {
        // Get detailed auth status for debugging
        const authStatus = gmailClient.getAuthStatus()
        console.log('Detailed auth status:', authStatus)
        
        toast({
          title: "Not Connected",
          description: "Please connect Gmail first using the button above",
          variant: "destructive"
        })
        return
      }

      console.log('Fetching recent emails...')
      const recentEmails = await gmailClient.getRecentEmails(5)
      setEmails(recentEmails)
      
      toast({
        title: "Emails Fetched",
        description: `Found ${recentEmails.length} recent emails`
      })
    } catch (error) {
      console.error('Error fetching emails:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch emails",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Process a specific email to create a task
  const processEmail = async (email: EmailData) => {
    setIsProcessing(email.messageId)
    try {
      const task = await gmailClient.createTaskFromEmailTest(email)
      
      setProcessedEmails(prev => new Set([...prev, email.messageId]))
      
      toast({
        title: "Task Created!",
        description: `Created task: "${task.title}"`,
      })
    } catch (error) {
      console.error('Error processing email:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Process the latest email automatically
  const processLatestEmail = async () => {
    setIsLoading(true)
    try {
      const isSignedIn = await gmailClient.isSignedIn()
      if (!isSignedIn) {
        toast({
          title: "Not Connected",
          description: "Please connect Gmail first",
          variant: "destructive"
        })
        return
      }

      const task = await gmailClient.processLatestEmail()
      
      toast({
        title: "Task Created!",
        description: `Created task from latest email: "${task.title}"`,
      })
      
      // Refresh the email list
      await fetchEmails()
    } catch (error) {
      console.error('Error processing latest email:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process latest email",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load emails on component mount - but don't auto-fetch to avoid errors
  useEffect(() => {
    // Don't auto-fetch on mount to avoid authentication errors
    // User can manually fetch when ready
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Manual Email Processing
        </CardTitle>
        <CardDescription>
          Manually process specific emails or test the email processing system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border border-blue-200">
          <p className="text-blue-700 font-medium">For testing and manual processing only</p>
          <p className="text-blue-600 mt-1">
            Automated processing is handled by the "Automated Email Processing" section above. 
            Use this section to manually process specific emails or test functionality.
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={fetchEmails} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Emails
          </Button>
          <Button 
            onClick={processLatestEmail} 
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Process Latest Email
          </Button>
          <Button 
            onClick={debugGmailStatus} 
            variant="outline"
            size="sm"
          >
            <Bug className="h-4 w-4 mr-2" />
            Debug Status
          </Button>
          <Button 
            onClick={forceReAuth} 
            variant="outline"
            size="sm"
          >
            <User className="h-4 w-4 mr-2" />
            Force Re-Auth
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          {emails.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {isLoading ? 'Loading emails...' : 'No emails found. Click "Refresh Emails" to fetch recent emails for manual processing.'}
            </div>
          ) : (
            emails.map((email) => (
              <Card key={email.messageId} className="border border-border/50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium line-clamp-1">
                          {email.subject || 'No Subject'}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{email.senderName || email.senderEmail}</span>
                          {email.companyName && (
                            <>
                              <Building2 className="h-3 w-3" />
                              <span>{email.companyName}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(email.date).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {processedEmails.has(email.messageId) ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Processed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => processEmail(email)}
                            disabled={isProcessing === email.messageId}
                          >
                            {isProcessing === email.messageId ? (
                              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            Create Task
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {email.body.substring(0, 150)}...
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 