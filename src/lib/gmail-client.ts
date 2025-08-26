import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify'

// Load Google APIs dynamically
const loadGoogleAPIs = (): Promise<void> => {
  return Promise.all([
    loadScript('https://apis.google.com/js/api.js'),
    loadScript('https://accounts.google.com/gsi/client')
  ]).then(() => {})
}

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

declare global {
  interface Window {
    gapi: any
    google: any
  }
}

import { EnhancedEmailService } from './enhanced-email-service'

export class GmailClient {
  private initPromise: Promise<void> | null = null
  private isInitialized = false
  private tokenClient: any = null
  private accessToken: string | null = null

  constructor() {
    this.initPromise = this.initializeGoogleAPIs()
  }

  private async initializeGoogleAPIs(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('Starting Google APIs initialization...')
      
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyB7Z-i1XSvaRRU7EESjkfx54gtnsMoMlm4'
      const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID || '127614043326-e6gqraj8ptgtf82usr6nq0dnu6hogab4.apps.googleusercontent.com'
      
      console.log('Environment check:', {
        hasApiKey: !!apiKey,
        hasClientId: !!clientId,
        apiKeyLength: apiKey?.length || 0,
        clientIdLength: clientId?.length || 0
      })

      if (!apiKey || !clientId) {
        const missingVars = []
        if (!apiKey) missingVars.push('VITE_GOOGLE_API_KEY')
        if (!clientId) missingVars.push('VITE_GMAIL_CLIENT_ID')
        throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
      }

      // Load Google APIs
      await loadGoogleAPIs()
      console.log('Google APIs scripts loaded')

      // Wait a bit for scripts to fully initialize
      await new Promise(resolve => setTimeout(resolve, 200))

      // Check if gapi is available
      if (typeof window.gapi === 'undefined') {
        throw new Error('Google API (gapi) failed to load')
      }

      if (typeof window.google === 'undefined') {
        throw new Error('Google Identity Services failed to load')
      }

      console.log('Google APIs available, initializing clients...')

      // Initialize gapi client
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey,
              discoveryDocs: [DISCOVERY_DOC],
            })
            console.log('GAPI client initialized')
            resolve()
          } catch (error) {
            console.error('Failed to initialize GAPI client:', error)
            reject(error)
          }
        })
      })

      // Check if Google Identity Services is available
      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services OAuth2 not available')
      }

      // Initialize Google Identity Services token client
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.error) {
            console.error('Token error:', response.error)
            return
          }
          this.accessToken = response.access_token
          this.setAccessToken(response.access_token)
          this.storeTokens(response)
          console.log('Access token received and set')
        },
      })

      if (!this.tokenClient) {
        throw new Error('Failed to create token client')
      }

      this.isInitialized = true
      console.log('Google APIs initialized successfully with GIS')
      
    } catch (error) {
      console.error('Google APIs initialization failed:', error)
      this.isInitialized = false
      this.tokenClient = null
      this.accessToken = null
      throw error
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return
    
    if (this.initPromise) {
      try {
        await this.initPromise
      } catch (error) {
        console.error('Previous initialization failed, retrying...', error)
        // Reset and retry
        this.initPromise = null
        this.isInitialized = false
        this.tokenClient = null
        this.accessToken = null
      }
    }
    
    if (!this.isInitialized) {
      this.initPromise = this.initializeGoogleAPIs()
      await this.initPromise
    }
  }

  // Sign in with Google using new GIS
  async signIn(): Promise<any> {
    await this.ensureInitialized()
    
    if (!this.tokenClient) {
      throw new Error('Google Identity Services not initialized properly')
    }

    return new Promise((resolve, reject) => {
      // Update callback for this specific sign-in
      this.tokenClient.callback = (response: any) => {
        if (response.error) {
          console.error('Sign-in error:', response.error)
          reject(new Error(response.error))
          return
        }
        
        console.log('Token response received:', { 
          hasAccessToken: !!response.access_token,
          tokenLength: response.access_token?.length || 0 
        })
        
        this.accessToken = response.access_token
        this.setAccessToken(response.access_token)
        this.storeTokens(response)
        
        console.log('User signed in successfully, access token set')
        resolve(response)
      }
      
      // Request access token
      console.log('Requesting access token...')
      this.tokenClient.requestAccessToken({ prompt: 'consent' })
    })
  }

  // Check if user has valid access token
  async isSignedIn(): Promise<boolean> {
    try {
      await this.ensureInitialized()
      
      // Check if we have a valid access token
      if (!this.accessToken) {
        // Try to load from stored tokens
        const hasStoredTokens = await this.loadStoredTokens()
        if (!hasStoredTokens) {
          console.log('No access token or stored tokens found')
          return false
        }
      }
      
      // If we have an access token, assume we're signed in
      // The API calls will handle token expiry automatically
      if (this.accessToken) {
        console.log('Access token found, user is signed in')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error checking sign-in status:', error)
      return false
    }
  }

  // Set access token for API calls
  private setAccessToken(token: string) {
    this.accessToken = token
    window.gapi.client.setToken({ access_token: token })
  }

  // Load stored tokens
  async loadStoredTokens(): Promise<boolean> {
    try {
      const { data: tokenData } = await supabase
        .from('oauth_tokens')
        .select('*')
        .eq('provider', 'gmail')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (tokenData && tokenData.access_token) {
        // Check if token is not expired
        if (tokenData.expires_at && new Date(tokenData.expires_at) > new Date()) {
          console.log('Loading stored access token:', {
            hasToken: !!tokenData.access_token,
            expiresAt: tokenData.expires_at
          })
          this.setAccessToken(tokenData.access_token)
          return true
        } else {
          console.log('Stored token is expired')
        }
      } else {
        console.log('No stored tokens found')
      }
    } catch (error) {
      console.log('Error loading stored tokens:', error)
    }
    return false
  }

  // Store tokens in database
  private async storeTokens(tokens: any) {
    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null

    await supabase
      .from('oauth_tokens')
      .insert({
        provider: 'gmail',
        access_token: tokens.access_token,
        expires_at: expiresAt
      })
  }

  // Process new email and create task
  async processNewEmail(messageId: string) {
    try {
      await this.ensureInitialized()
      
      if (!this.accessToken) {
        throw new Error('Not authenticated - please sign in first')
      }
      
      // Get email details from Gmail
      const response = await window.gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      })

      // Parse email data
      const emailData = this.parseGmailMessage(response.result)
      
      // Create task in Sales Tracker
      const task = await this.createTaskFromEmail(emailData)
      
      console.log('Task created successfully:', task)
      return task
      
    } catch (error) {
      console.error('Error processing email:', error)
      throw error
    }
  }

  // Parse Gmail message format (same as before)
  private parseGmailMessage(message: any) {
    const headers = message.payload.headers
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

    let body = ''
    if (message.payload.body.data) {
      body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
    } else if (message.payload.parts) {
      const textPart = message.payload.parts.find((part: any) => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      )
      if (textPart?.body.data) {
        body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'))
      }
    }

    const fromHeader = getHeader('From')
    const senderEmail = this.extractEmail(fromHeader)
    const senderName = this.extractName(fromHeader)
    const companyName = this.extractCompany(senderEmail, body)

    return {
      messageId: message.id,
      from: fromHeader,
      senderEmail,
      senderName,
      companyName,
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      body,
      to: getHeader('To')
    }
  }

  // Create task in Sales Tracker board (enhanced version)
  private async createTaskFromEmail(emailData: any) {
    console.log('Creating task from email with enhanced processing:', emailData.subject)
    
    // Use the enhanced email service for better contact matching and processing
    try {
      const task = await EnhancedEmailService.processEmailWithContactMatching(emailData)
      console.log('Successfully created enhanced task:', task.id)
      return task
    } catch (error) {
      console.error('Enhanced processing failed, falling back to basic processing:', error)
      
      // Fallback to basic processing if enhanced fails
      return this.createBasicTaskFromEmail(emailData)
    }
  }

  // Fallback method for basic task creation
  private async createBasicTaskFromEmail(emailData: any) {
    console.log('Creating basic task from email:', emailData.subject)
    
    const { data: salesBoard, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('title', 'Sales Tracker Board')
      .single()

    if (boardError || !salesBoard) {
      console.error('Board query error:', boardError)
      throw new Error('Sales Tracker Board not found')
    }

    console.log('Found Sales Tracker Board:', salesBoard.id)

    // Create or find "New Inquiry" group instead of "Sales Prospects"
    let { data: newInquiryGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('board_id', salesBoard.id)
      .eq('title', 'New Inquiry')
      .single()

    if (!newInquiryGroup) {
      console.log('New Inquiry group not found, creating it...')
      const { data: createdGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          title: 'New Inquiry',
          color: '#10B981', // Green color for new inquiries
          board_id: salesBoard.id,
          position: 0
        })
        .select()
        .single()

      if (groupError) {
        console.error('Group creation error:', groupError)
        throw groupError
      }
      newInquiryGroup = createdGroup
      console.log('Created New Inquiry group:', newInquiryGroup.id)
    } else {
      console.log('Found New Inquiry group:', newInquiryGroup.id)
    }

    // Extract sender name and company (enhanced extraction)
    const senderName = EnhancedEmailService.extractSenderName(emailData.from || emailData.senderEmail)
    const companyName = EnhancedEmailService.extractCompanyName(emailData.senderEmail, emailData.body)

    // Generate unique inquiry ID: INQ-[Number]-[Company]
    const timestamp = Date.now()
    const companyCode = companyName.substring(0, 8).toUpperCase().replace(/\s/g, '')
    const inquiryId = `INQ-${timestamp}-${companyCode}`

    const taskBody = `
**Original Email:**
From: ${senderName} <${emailData.senderEmail}>
Date: ${emailData.date}
Subject: ${emailData.subject}

**Sender Information:**
Name: ${senderName}
Email: ${emailData.senderEmail}
Company: ${companyName}

**Inquiry Details:**
Inquiry ID: ${inquiryId}
Received: ${new Date().toLocaleString()}

**Message:**
${emailData.body}
    `.trim()

    // Create the task with only essential fields to avoid database errors
    const taskData: any = {
      title: `New Inquiry - ${emailData.subject}`,
      description: taskBody,
      status: 'New',
      board_id: salesBoard.id,
      group_id: newInquiryGroup.id,
      position: 0
    };

    // Add email fields only if they exist in the database
    try {
      taskData.sender_email = emailData.senderEmail;
      taskData.sender_name = senderName;
      taskData.sender_company = companyName;
      taskData.gmail_message_id = emailData.messageId;
      taskData.email_received_at = new Date().toISOString();
    } catch (error) {
      console.log('Some email fields not available, continuing without them');
    }

    // Add custom fields for metadata
    taskData.custom_fields = {
      inquiry_id: inquiryId
    };

    console.log('Attempting to create task with data:', taskData);

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (taskError) {
      console.error('Error creating task:', taskError)
      throw taskError
    }

    // Log activity
    try {
      await supabase
        .from('activity_log')
        .insert({
          task_id: task.id,
          action: 'EMAIL_RECEIVED',
          details: {
            from: emailData.senderEmail,
            sender_name: senderName,
            subject: emailData.subject,
            company: companyName,
            gmail_message_id: emailData.messageId,
            inquiry_id: inquiryId // Log the inquiry ID in details
          }
        })
    } catch (error) {
      console.error('Error logging activity:', error)
      // Don't fail if logging fails
    }

    console.log('Basic task created successfully:', task.id)
    return task
  }

  // Helper methods (same as before)
  private extractEmail(fromString: string): string {
    const emailMatch = fromString.match(/<(.+?)>/) || fromString.match(/([^\s]+@[^\s]+)/)
    return emailMatch ? emailMatch[1].trim() : fromString.trim()
  }

  private extractName(fromString: string): string {
    const nameMatch = fromString.match(/^([^<]+)</)
    return nameMatch ? nameMatch[1].trim().replace(/"/g, '') : ''
  }

  private extractCompany(email: string, body: string): string {
    const domain = email.split('@')[1]
    
    if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain)) {
      return domain.split('.')[0].toUpperCase()
    }
    
    const companyPatterns = [
      /(?:Company|Corporation|Corp|Ltd|LLC|Inc)[:\s]*([^\n\r]+)/i,
      /([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:Company|Corp|Ltd|LLC|Inc)/i
    ]
    
    for (const pattern of companyPatterns) {
      const match = body.match(pattern)
      if (match) return match[1].trim()
    }
    
    return domain?.split('.')[0].toUpperCase() || 'Individual'
  }

  // Check if client is ready
  async isReady(): Promise<boolean> {
    try {
      console.log('Checking if Gmail client is ready...')
      await this.ensureInitialized()
      
      const isReady = this.isInitialized && !!this.tokenClient
      
      console.log('Gmail client ready status:', {
        gapiLoaded: typeof window.gapi !== 'undefined',
        googleLoaded: typeof window.google !== 'undefined',
        tokenClientExists: !!this.tokenClient,
        isInitialized: this.isInitialized,
        isReady
      })
      
      return isReady
    } catch (error) {
      console.error('Error checking if Gmail client is ready:', error)
      return false
    }
  }

  // Debug status
  async debugStatus() {
    console.log('=== Gmail Client Debug Status ===')
    
    try {
      const envVars = {
        VITE_GOOGLE_API_KEY: !!import.meta.env.VITE_GOOGLE_API_KEY,
        VITE_GMAIL_CLIENT_ID: !!import.meta.env.VITE_GMAIL_CLIENT_ID,
        apiKeyLength: import.meta.env.VITE_GOOGLE_API_KEY?.length || 0,
        clientIdLength: import.meta.env.VITE_GMAIL_CLIENT_ID?.length || 0
      }
      
      console.log('Environment variables:', envVars)
      console.log('Window.gapi available:', typeof window.gapi !== 'undefined')
      console.log('Window.google available:', typeof window.google !== 'undefined')
      console.log('Initialization status:', this.isInitialized)
      console.log('Token client available:', !!this.tokenClient)
      console.log('Has access token:', !!this.accessToken)
      
      const isReady = await this.isReady()
      console.log('Final ready status:', isReady)
      
      const isSignedIn = await this.isSignedIn()
      console.log('Sign-in status:', isSignedIn)
      
    } catch (error) {
      console.error('Debug status error:', error)
    }
    
    console.log('=== End Debug Status ===')
  }

  // Get current authentication status
  getAuthStatus() {
    return {
      isInitialized: this.isInitialized,
      hasTokenClient: !!this.tokenClient,
      hasAccessToken: !!this.accessToken,
      gapiLoaded: typeof window.gapi !== 'undefined',
      googleLoaded: typeof window.google !== 'undefined'
    }
  }

  // Force re-authentication (useful for debugging)
  async forceReAuth(): Promise<any> {
    console.log('Forcing re-authentication...')
    this.accessToken = null
    return this.signIn()
  }

  // Ensure user is authenticated before making API calls
  async ensureAuthenticated(): Promise<void> {
    await this.ensureInitialized()
    
    const isSignedIn = await this.isSignedIn()
    if (!isSignedIn) {
      console.log('User not signed in, attempting sign-in...')
      await this.signIn()
    }
    
    if (!this.accessToken) {
      throw new Error('Failed to obtain access token')
    }
    
    console.log('User authenticated with access token')
  }

  // Expose createTaskFromEmail for testing
  async createTaskFromEmailTest(emailData: any) {
    return this.createTaskFromEmail(emailData)
  }

  // Legacy methods for compatibility
  getAuthUrl(): string {
    return '#'
  }

  async authenticate(code: string) {
    return await this.signIn()
  }

  // Get recent emails from Gmail
  async getRecentEmails(maxResults: number = 10): Promise<any[]> {
    try {
      await this.ensureAuthenticated()

      console.log('Fetching recent emails...')
      
      // Get list of messages
      const listResponse = await window.gapi.client.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: 'in:inbox' // Only get inbox emails
      })

      if (!listResponse.result.messages || listResponse.result.messages.length === 0) {
        console.log('No messages found')
        return []
      }

      console.log(`Found ${listResponse.result.messages.length} messages`)

      // Get full details for each message
      const emailPromises = listResponse.result.messages.map(async (message: any) => {
        const fullResponse = await window.gapi.client.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        })
        return this.parseGmailMessage(fullResponse.result)
      })

      const emails = await Promise.all(emailPromises)
      console.log('Parsed emails:', emails)
      
      return emails
    } catch (error) {
      console.error('Error fetching recent emails:', error)
      throw error
    }
  }

  // Process the most recent email to create a task
  async processLatestEmail(): Promise<any> {
    try {
      const emails = await this.getRecentEmails(1)
      
      if (emails.length === 0) {
        throw new Error('No emails found')
      }

      const latestEmail = emails[0]
      console.log('Processing latest email:', latestEmail)
      
      // Create task from the latest email
      const task = await this.createTaskFromEmail(latestEmail)
      
      console.log('Task created successfully from latest email:', task)
      return task
    } catch (error) {
      console.error('Error processing latest email:', error)
      throw error
    }
  }

  // Get processed email IDs from database to prevent duplicates
  async getProcessedEmailIds(): Promise<string[]> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('gmail_message_id')
        .not('gmail_message_id', 'is', null)

      if (error) {
        console.error('Error fetching processed email IDs:', error)
        return []
      }

      return tasks.map(task => task.gmail_message_id).filter(Boolean)
    } catch (error) {
      console.error('Error getting processed email IDs:', error)
      return []
    }
  }
}