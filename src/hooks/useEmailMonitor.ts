import { useEffect, useState } from 'react'
import { GmailClient } from '@/lib/gmail-client'
import { useToast } from '@/hooks/use-toast'

export function useEmailMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [gmailClient] = useState(() => new GmailClient())
  const [processedEmailIds] = useState(() => new Set<string>())
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Setup Gmail monitoring
  const startMonitoring = async () => {
    setIsLoading(true)
    try {
      // Debug the Gmail client status
      await gmailClient.debugStatus()
      
      // Wait for the Gmail client to be ready
      const isReady = await gmailClient.isReady()
      if (!isReady) {
        throw new Error('Gmail client is not ready. Please check your API credentials and browser console for details.')
      }

      // Check if user is already signed in
      const isSignedIn = await gmailClient.isSignedIn()
      
      if (!isSignedIn) {
        // Sign in with Google
        await gmailClient.signIn()
      }

      setIsMonitoring(true)
      toast({
        title: "Automated Email Processing Started",
        description: "System will automatically create tasks from new emails every 30 seconds"
      })

      // Start automated email processing
      await startAutomatedEmailProcessing()
      
    } catch (error) {
      console.error('Failed to start monitoring:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start email monitoring",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Stop monitoring
  const stopMonitoring = () => {
    setIsMonitoring(false)
    if (pollInterval) {
      clearInterval(pollInterval)
      setPollInterval(null)
    }
    toast({
      title: "Automated Email Processing Stopped",
      description: "No longer automatically processing emails"
    })
  }

  // Automated email processing with duplicate prevention
  const startAutomatedEmailProcessing = async () => {
    // Initial load of processed emails to avoid duplicates
    await loadExistingProcessedEmails()
    
    // Start polling for new emails
    const interval = setInterval(async () => {
      try {
        await checkAndProcessNewEmails()
      } catch (error) {
        console.error('Automated processing error:', error)
      }
    }, 30000) // Check every 30 seconds
    
    setPollInterval(interval)
  }

  // Load existing processed emails from database to avoid duplicates
  const loadExistingProcessedEmails = async () => {
    try {
      const existingTasks = await gmailClient.getProcessedEmailIds()
      existingTasks.forEach(id => processedEmailIds.add(id))
      console.log(`Loaded ${existingTasks.length} existing processed email IDs`)
    } catch (error) {
      console.error('Error loading existing processed emails:', error)
    }
  }

  // Check for new emails and automatically process them
  const checkAndProcessNewEmails = async () => {
    try {
      const isSignedIn = await gmailClient.isSignedIn()
      if (!isSignedIn) {
        console.warn('User not signed in, stopping automated processing')
        stopMonitoring()
        return
      }

      console.log('Checking for new emails to process automatically...')
      
      // Get recent emails (last 10)
      const recentEmails = await gmailClient.getRecentEmails(10)
      
      // Filter out already processed emails
      const newEmails = recentEmails.filter(email => 
        !processedEmailIds.has(email.messageId)
      )

      if (newEmails.length === 0) {
        console.log('No new emails to process')
        return
      }

      console.log(`Found ${newEmails.length} new emails to process automatically`)

      // Process each new email
      for (const email of newEmails) {
        try {
          console.log(`Auto-processing email: ${email.subject}`)
          
          const task = await gmailClient.createTaskFromEmailTest(email)
          
          // Mark as processed
          processedEmailIds.add(email.messageId)
          
          toast({
            title: "New Task Created Automatically!",
            description: `Created task: "${task.title}" from email: "${email.subject}"`,
          })
          
          console.log(`Successfully auto-created task from email: ${email.subject}`)
          
        } catch (error) {
          console.error(`Error auto-processing email ${email.subject}:`, error)
          
          // Still mark as processed to avoid retry loops
          processedEmailIds.add(email.messageId)
          
          toast({
            title: "Auto-Processing Error",
            description: `Failed to create task from email: "${email.subject}"`,
            variant: "destructive"
          })
        }
      }
      
    } catch (error) {
      console.error('Error in automated email checking:', error)
    }
  }

  // Handle OAuth callback (kept for compatibility, but not used with gapi-script)
  const handleAuthCallback = async (code: string) => {
    try {
      await gmailClient.authenticate(code)
      toast({
        title: "Gmail connected",
        description: "Successfully connected to Gmail"
      })
      setIsMonitoring(true)
    } catch (error) {
      console.error('Auth callback error:', error)
      toast({
        title: "Error",
        description: "Failed to connect Gmail",
        variant: "destructive"
      })
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [pollInterval])

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isSignedIn = await gmailClient.isSignedIn()
        if (isSignedIn) {
          setIsMonitoring(true)
          await startAutomatedEmailProcessing()
        }
      } catch (error) {
        console.log('Not connected on mount:', error)
      }
    }
    
    checkConnection()
  }, [])

  return {
    isMonitoring,
    isLoading,
    startMonitoring,
    stopMonitoring,
    handleAuthCallback
  }
}