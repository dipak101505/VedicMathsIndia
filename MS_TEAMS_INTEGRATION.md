# Microsoft Teams Integration Implementation Guide

## Overview
This document outlines the complete implementation plan for adding Microsoft Teams embedding functionality to the Vedic Maths India LMS admin interface. The integration will allow admins to create and embed MS Teams meetings alongside the existing Jitsi Meet functionality.

## Current Architecture Analysis

### Existing Meeting System
- **Platform**: Currently uses Jitsi Meet (free, unlimited meetings)
- **Generation**: Firebase Functions (`generateMeetLink`) creates Jitsi room URLs
- **Frontend**: `MeetingsPage.jsx` handles meeting controls and embedding
- **Features**: Recording, transcription, screen sharing, chat, live captions

### Integration Points
1. **Firebase Functions** (`functions/index.js`)
2. **MeetingsPage Component** (`src/pages/MeetingsPage.jsx`)
3. **Admin Controls** (Meeting form and platform selection)
4. **Database Schema** (Firestore streams collection)

## Implementation Plan

### Phase 1: Backend Infrastructure

#### 1.1 Microsoft Graph API Setup
```javascript
// Required dependencies
npm install @azure/msal-node
npm install @microsoft/microsoft-graph-client
npm install axios
```

#### 1.2 Environment Configuration
Add to `.env` or Firebase Functions environment:
```bash
# Microsoft Teams Integration
MICROSOFT_APP_ID=your_app_id
MICROSOFT_APP_SECRET=your_app_secret
MICROSOFT_TENANT_ID=your_tenant_id
MICROSOFT_REDIRECT_URI=your_redirect_uri
```

#### 1.3 Firebase Functions Enhancement
Create new function `generateTeamsLink` in `functions/index.js`:

```javascript
const { Client } = require('@microsoft/microsoft-graph-client');
const { AuthenticationProvider } = require('@microsoft/microsoft-graph-client');

// Custom authentication provider for Graph API
class CustomAuthProvider {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  async getAccessToken() {
    return this.accessToken;
  }
}

exports.generateTeamsLink = onCall(async (request) => {
  try {
    // Verify user authentication
    if (!request.auth) {
      throw new Error("User must be authenticated");
    }

    const { batch = "Batch1", subject = "VedicMaths", topic = "LiveSession" } = request.data || {};
    
    // Get Microsoft Graph access token
    const accessToken = await getMicrosoftAccessToken();
    const authProvider = new CustomAuthProvider(accessToken);
    const graphClient = Client.initWithMiddleware({ authProvider });

    // Create Teams meeting
    const meeting = {
      subject: `${subject} - ${topic}`,
      body: {
        contentType: 'HTML',
        content: `Live class for ${batch}: ${subject} - ${topic}`
      },
      start: {
        dateTime: new Date().toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
        timeZone: 'UTC'
      },
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness'
    };

    const response = await graphClient.api('/me/events').post(meeting);
    
    return {
      success: true,
      meetLink: response.onlineMeeting.joinUrl,
      meetingId: response.id,
      platform: "Microsoft Teams",
      recordingEnabled: true,
      transcriptionEnabled: true,
      transcriptionLanguage: "en-US",
      cost: "SUBSCRIPTION_REQUIRED",
      features: [
        "recording",
        "live_transcription", 
        "screen_sharing",
        "chat",
        "live_captions",
        "breakout_rooms",
        "whiteboard",
        "polling",
        "attendance_tracking",
        "meeting_notes"
      ],
      joinUrl: response.onlineMeeting.joinUrl,
      webUrl: response.webLink,
      conferenceId: response.onlineMeeting.conferenceId,
      organizerEmail: response.organizer.emailAddress.address
    };

  } catch (error) {
    console.error("Error generating Teams link:", error);
    throw new Error(`Failed to generate Teams link: ${error.message}`);
  }
});

// Helper function to get Microsoft Graph access token
async function getMicrosoftAccessToken() {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_APP_ID;
  const clientSecret = process.env.MICROSOFT_APP_SECRET;
  
  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', 'https://graph.microsoft.com/.default');
  params.append('grant_type', 'client_credentials');

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params
  });

  const data = await response.json();
  return data.access_token;
}
```

### Phase 2: Frontend Implementation

#### 2.1 Platform Selection Component
Create `src/components/MeetingPlatformSelector.jsx`:

```javascript
import React from 'react';

const MeetingPlatformSelector = ({ selectedPlatform, onPlatformChange, disabled }) => {
  const platforms = [
    {
      id: 'jitsi',
      name: 'Jitsi Meet',
      description: 'Free unlimited meetings',
      features: ['No time limits', 'No participant limits', 'Free recording'],
      cost: 'FREE',
      icon: '🎥'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Professional video conferencing',
      features: ['Advanced recording', 'Meeting notes', 'Attendance tracking'],
      cost: 'SUBSCRIPTION',
      icon: '🟦'
    }
  ];

  return (
    <div style={{ marginBottom: "24px" }}>
      <label style={{
        display: "block",
        marginBottom: "12px",
        color: "#4a5568",
        fontSize: "14px",
        fontWeight: "500",
      }}>
        Meeting Platform *
      </label>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {platforms.map((platform) => (
          <div
            key={platform.id}
            onClick={() => !disabled && onPlatformChange(platform.id)}
            style={{
              padding: "16px",
              border: selectedPlatform === platform.id ? "2px solid #ffa600" : "2px solid #e0e0e0",
              borderRadius: "8px",
              cursor: disabled ? "not-allowed" : "pointer",
              backgroundColor: selectedPlatform === platform.id ? "#fff7e6" : "#f8f9fa",
              transition: "all 0.2s ease",
              opacity: disabled ? 0.6 : 1
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "20px", marginRight: "8px" }}>{platform.icon}</span>
              <div>
                <div style={{ fontWeight: "600", color: "#2d3748" }}>{platform.name}</div>
                <div style={{ fontSize: "12px", color: "#718096" }}>{platform.description}</div>
              </div>
            </div>
            
            <div style={{ fontSize: "11px", color: "#4a5568", marginBottom: "6px" }}>
              Cost: <span style={{ fontWeight: "600", color: platform.cost === 'FREE' ? '#48bb78' : '#ed8936' }}>
                {platform.cost}
              </span>
            </div>
            
            <ul style={{ fontSize: "10px", color: "#718096", margin: "0", paddingLeft: "16px" }}>
              {platform.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingPlatformSelector;
```

#### 2.2 Teams Meeting Component
Create `src/components/TeamsMeeting.jsx`:

```javascript
import React, { useEffect, useRef } from 'react';

const TeamsMeeting = ({ meetingUrl, meetingId, organizerEmail }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    // Teams web app embedding
    if (meetingUrl && iframeRef.current) {
      const embedUrl = `${meetingUrl}&embed=true`;
      iframeRef.current.src = embedUrl;
    }
  }, [meetingUrl]);

  return (
    <div style={{ width: "100%", height: "600px", border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
      {meetingUrl ? (
        <iframe
          ref={iframeRef}
          title="Microsoft Teams Meeting"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="camera; microphone; display-capture"
          style={{ border: "none" }}
        />
      ) : (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "#f8f9fa",
          color: "#718096"
        }}>
          Teams meeting will appear here when started
        </div>
      )}
    </div>
  );
};

export default TeamsMeeting;
```

#### 2.3 Update MeetingsPage.jsx
Enhance the existing `MeetingsPage.jsx` with Teams support:

```javascript
// Add imports
import MeetingPlatformSelector from '../components/MeetingPlatformSelector';
import TeamsMeeting from '../components/TeamsMeeting';

// Add state for platform selection
const [selectedPlatform, setSelectedPlatform] = useState('jitsi');

// Update generateMeetLink function
const generateMeetLink = async (platform, batch = "Batch1", subject = "VedicMaths", topic = "LiveSession") => {
  try {
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('User authenticated:', user.email);
    
    let functionName = 'generateMeetLink'; // Default to Jitsi
    if (platform === 'teams') {
      functionName = 'generateTeamsLink';
    }
    
    const generateFunction = httpsCallable(functions, functionName);
    const result = await generateFunction({ batch, subject, topic });
    return result.data;
  } catch (error) {
    console.error(`Error generating ${platform} link:`, error);
    toast.error(`Failed to generate ${platform} link. Please try again.`);
    throw error;
  }
};

// Update handleStreamToggle function
const handleStreamToggle = async () => {
  if (!currentStreamId) {
    try {
      const meetingData = await generateMeetLink(
        selectedPlatform,
        formData.batch || "Batch1",
        formData.subject || "VedicMaths", 
        formData.topic || "LiveSession"
      );
      
      const streamData = {
        ...formData,
        platform: selectedPlatform,
        meetLink: meetingData.meetLink || meetingData.joinUrl,
        meetingId: meetingData.meetingId,
        roomName: meetingData.roomName || meetingData.meetingId,
        recordingEnabled: meetingData.recordingEnabled,
        transcriptionEnabled: meetingData.transcriptionEnabled,
        platformData: meetingData, // Store full platform response
        centres: formData.centres,
        batch: formData.batch,
        subject: formData.subject,
        topic: formData.topic,
        startTime: new Date(),
        status: "active",
      };

      const streamDoc = await addDoc(collection(db, "streams"), streamData);
      setCurrentStreamId(streamDoc.id);
      setCurrentStreamData(streamData);
      
      toast.success(`Stream started with ${selectedPlatform === 'teams' ? 'Microsoft Teams' : 'Jitsi Meet'}!`);
    } catch (error) {
      console.error("Error starting stream:", error);
      toast.error('Failed to start stream. Please try again.');
    }
  } else {
    // Stop streaming logic remains the same
    try {
      await deleteDoc(doc(db, "streams", currentStreamId));
      await Chat.clearMessages();
      setCurrentStreamId(null);
      setCurrentStreamData(null);
      setShowUpload(true);
      toast.success('Stream stopped successfully!');
    } catch (error) {
      console.error("Error stopping stream:", error);
      toast.error('Failed to stop stream.');
    }
  }
};
```

### Phase 3: Security and Authentication

#### 3.1 Microsoft App Registration
1. **Azure Portal Setup**:
   - Go to Azure Portal > App Registrations
   - Create new registration: "VedicMaths-Teams-Integration"
   - Set redirect URI: `https://your-domain.com/auth/callback`
   - Note Application (client) ID and Directory (tenant) ID

2. **API Permissions**:
   - Microsoft Graph permissions needed:
     - `Calendars.ReadWrite` (to create meetings)
     - `OnlineMeetings.ReadWrite` (to manage Teams meetings)
     - `User.Read` (basic user info)

3. **Client Secret**:
   - Generate client secret in "Certificates & secrets"
   - Store securely in Firebase Functions environment

#### 3.2 Environment Variables Setup
```bash
# Firebase Functions configuration
firebase functions:config:set microsoft.app_id="your_app_id"
firebase functions:config:set microsoft.app_secret="your_app_secret" 
firebase functions:config:set microsoft.tenant_id="your_tenant_id"
firebase functions:config:set microsoft.redirect_uri="your_redirect_uri"
```

### Phase 4: Database Schema Updates

#### 4.1 Firestore Collections Enhancement
Update the `streams` collection schema:

```javascript
// Enhanced stream document structure
{
  // Existing fields
  batch: "Batch1",
  subject: "VedicMaths", 
  topic: "Algebra",
  subtopic: "Linear Equations",
  centres: ["Centre1"],
  startTime: Timestamp,
  status: "active",
  
  // New platform-specific fields
  platform: "teams", // or "jitsi"
  meetLink: "https://teams.microsoft.com/l/meetup-join/...",
  meetingId: "teams_meeting_id_or_jitsi_room_name",
  recordingEnabled: true,
  transcriptionEnabled: true,
  
  // Platform-specific data
  platformData: {
    // For Teams
    joinUrl: "https://teams.microsoft.com/l/meetup-join/...",
    webUrl: "https://teams.microsoft.com/l/meetup-join/...", 
    conferenceId: "conference_id",
    organizerEmail: "admin@domain.com",
    
    // For Jitsi
    roomName: "batch1-vedicmaths-algebra-abc123",
    features: ["recording", "transcription", ...]
  }
}
```

### Phase 5: UI/UX Enhancements

#### 5.1 Platform-Specific Meeting Controls
```javascript
// In MeetingsPage.jsx render method
{currentStreamData && (
  <div style={{ marginBottom: "16px" }}>
    {currentStreamData.platform === 'teams' ? (
      <TeamsControls
        meetingData={currentStreamData.platformData}
        onJoinMeeting={() => window.open(currentStreamData.meetLink, "_blank")}
      />
    ) : (
      <JitsiControls 
        meetingData={currentStreamData.platformData}
        onJoinMeeting={() => window.open(currentStreamData.meetLink, "_blank")}
      />
    )}
  </div>
)}
```

#### 5.2 Platform-Specific Instructions
```javascript
const TeamsInstructions = () => (
  <div style={{
    padding: "12px",
    backgroundColor: "#f0f9ff", 
    border: "1px solid #0ea5e9",
    borderRadius: "8px",
    marginBottom: "16px"
  }}>
    <h4 style={{ margin: "0 0 8px 0", color: "#0369a1" }}>🟦 Teams Meeting Instructions:</h4>
    <ul style={{ margin: "0", paddingLeft: "20px", color: "#0284c7", fontSize: "14px" }}>
      <li>🎤 <strong>Automatic audio setup</strong> - Microphone ready on join</li>
      <li>📹 <strong>Camera optional</strong> - Turn on/off as needed</li>
      <li>🎬 <strong>Cloud recording</strong> - Automatically saves to SharePoint</li>
      <li>📝 <strong>Live transcription</strong> - Real-time captions available</li>
      <li>🖥️ <strong>Screen sharing</strong> - Share presentations and content</li>
      <li>💬 <strong>Meeting chat</strong> - Persistent chat with file sharing</li>
      <li>📊 <strong>Attendance tracking</strong> - Automatic attendance reports</li>
      <li>📋 <strong>Meeting notes</strong> - Collaborative note-taking</li>
    </ul>
  </div>
);
```

### Phase 6: Testing and Deployment

#### 6.1 Testing Checklist
- [ ] Teams app registration and permissions
- [ ] Firebase Functions deployment with environment variables
- [ ] Platform selector functionality
- [ ] Teams meeting creation and embedding
- [ ] Meeting controls and navigation
- [ ] Database schema updates
- [ ] Error handling and fallbacks
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness

#### 6.2 Deployment Steps
1. **Azure Setup**: Complete app registration and get credentials
2. **Environment Config**: Set Firebase Functions environment variables
3. **Function Deployment**: Deploy updated Firebase Functions
4. **Frontend Update**: Deploy updated React components
5. **Database Migration**: Update existing stream documents if needed
6. **User Testing**: Test with admin accounts
7. **Production Rollout**: Enable for all admin users

### Phase 7: Advanced Features (Future)

#### 7.1 Meeting Analytics
- Attendance tracking integration
- Meeting duration analytics
- Recording access logs
- Engagement metrics

#### 7.2 Calendar Integration
- Sync with Google Calendar
- Meeting reminders
- Recurring meeting templates
- Time zone handling

#### 7.3 Additional Platforms
- Zoom integration
- Google Meet integration
- WebEx integration
- Platform comparison matrix

## Security Considerations

### 7.1 Authentication
- Use Azure AD authentication for Teams access
- Implement proper token refresh mechanisms
- Store credentials securely in Firebase Functions environment

### 7.2 Authorization
- Verify admin permissions before creating meetings
- Implement meeting access controls
- Audit meeting creation and access

### 7.3 Data Privacy
- Handle meeting URLs securely
- Implement proper session management
- Comply with GDPR/privacy requirements

## Cost Analysis

### 7.1 Jitsi Meet (Current)
- **Cost**: Free
- **Limitations**: None for basic usage
- **Hosting**: Self-hosted or meet.jit.si

### 7.2 Microsoft Teams
- **Cost**: Requires Microsoft 365 subscription
- **Per User**: $4-22/month depending on plan
- **Features**: Advanced meeting features, cloud storage, Office integration

### 7.3 Implementation Cost
- **Development**: 20-30 hours
- **Testing**: 10-15 hours  
- **Azure Setup**: 2-3 hours
- **Documentation**: 5-8 hours

## Maintenance and Support

### 8.1 Regular Tasks
- Monitor API quotas and limits
- Update access tokens as needed
- Review meeting usage analytics
- Update platform features as released

### 8.2 Troubleshooting
- Meeting creation failures
- Embedding issues
- Authentication problems
- Recording access issues

## Success Metrics

### 9.1 Technical Metrics
- Meeting creation success rate
- Platform selection usage
- Error rates and response times
- User adoption of Teams vs Jitsi

### 9.2 User Experience
- Admin satisfaction with platform choice
- Student engagement with different platforms
- Meeting quality and reliability
- Feature utilization rates

## Conclusion

This implementation provides a comprehensive Microsoft Teams integration that:
- Maintains existing Jitsi functionality
- Adds professional Teams meeting capabilities
- Provides platform choice for administrators
- Ensures secure and scalable meeting management
- Integrates seamlessly with existing LMS architecture

The modular approach allows for future platform additions and maintains backward compatibility with current meeting workflows.

