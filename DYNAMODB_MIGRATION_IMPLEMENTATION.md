# DynamoDB Migration & Multi-User Type Implementation

## Project Goal
Migrate user data storage from Firebase Firestore to DynamoDB and implement multiple user types: Student, Teacher, Admin, Parent.

## Current State
- **Auth**: Firebase Auth (keep existing)
- **User Data**: Firebase Firestore (`students` collection) 
- **Roles**: Email domain-based (`@zenithadmin.com`, `@zenith.edu`)
- **Student Service**: Already uses DynamoDB partially
- **Limitations**: Only students stored, limited role system

## Target Architecture

### 1. Unified Users Table Schema

**Table**: `Users`
- **PK**: `USER#{userType}` (e.g., `USER#STUDENT`)
- **SK**: `{email}` (lowercase)

**GSI Indexes**:
- `UserTypeIndex`: Query by user type
- `StatusIndex`: Query by status across types  
- `OrganizationIndex`: Query by centre/franchise

## Complete DynamoDB Schema

### Table Structure

#### Users Table
**Table Name**: `Users`
**Billing Mode**: PAY_PER_REQUEST
**Encryption**: Server-side encryption enabled

#### Invoices Table  
**Table Name**: `Invoices`
**Billing Mode**: PAY_PER_REQUEST
**Encryption**: Server-side encryption enabled

### Primary Key & Indexes

#### Users Table Indexes
```javascript
// Primary Key
PK: "USER#{userType}"     // Partition Key
SK: "{email}"             // Sort Key (lowercase)

// Global Secondary Indexes
GSI1: UserTypeIndex
  - GSI1PK: "TYPE#{userType}"
  - GSI1SK: "{email}"
  - Projection: ALL

GSI2: StatusIndex  
  - GSI2PK: "STATUS#{status}"
  - GSI2SK: "{userType}#{email}"
  - Projection: ALL

GSI3: OrganizationIndex
  - GSI3PK: "ORG#{organizationId}"
  - GSI3SK: "{userType}#{email}"
  - Projection: ALL

GSI4: BatchIndex (for students/teachers)
  - GSI4PK: "BATCH#{batchName}"
  - GSI4SK: "{userType}#{email}"
  - Projection: ALL
```

#### Invoices Table Indexes
```javascript
// Primary Key
PK: "INVOICE#{year}"      // Partition Key (e.g., INVOICE#2024)
SK: "INV#{invoiceNumber}" // Sort Key (e.g., INV#INV_2024_001)

// Global Secondary Indexes
GSI1: StudentIndex
  - GSI1PK: "STUDENT#{studentEmail}"
  - GSI1SK: "{invoiceDate}#{invoiceNumber}"
  - Projection: ALL

GSI2: ParentIndex
  - GSI2PK: "PARENT#{parentEmail}"
  - GSI2SK: "{invoiceDate}#{invoiceNumber}"
  - Projection: ALL

GSI3: StatusIndex
  - GSI3PK: "STATUS#{paymentStatus}"
  - GSI3SK: "{invoiceDate}#{invoiceNumber}"
  - Projection: ALL

GSI4: DateRangeIndex
  - GSI4PK: "DATE#{year}#{month}"
  - GSI4SK: "{invoiceDate}#{invoiceNumber}"
  - Projection: ALL

GSI5: CentreIndex
  - GSI5PK: "CENTRE#{centreName}"
  - GSI5SK: "{invoiceDate}#{invoiceNumber}"
  - Projection: ALL
```

### Complete User Schema

#### Base User Structure (All Types)
```json
{
  "PK": "USER#{userType}",
  "SK": "{email}",
  "userType": "student|teacher|admin|parent",
  "email": "{email}",
  "name": "Full Name",
  "status": "active|inactive|pending|suspended",
  "mobile": "+1234567890",
  "address": "Complete Address",
  "imageUrl": "https://storage-url/image.jpg",
  "dob": "1990-01-01",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "emailVerified": true,
  "lastLoginAt": "2024-01-01T00:00:00Z",
  "isActive": true,
  
  // Common profile data
  "profile": {
    // Type-specific fields defined below
  },
  
  // Index keys
  "GSI1PK": "TYPE#{userType}",
  "GSI1SK": "{email}",
  "GSI2PK": "STATUS#{status}",
  "GSI2SK": "{userType}#{email}",
  "GSI3PK": "ORG#{organizationId}",
  "GSI3SK": "{userType}#{email}",
  "GSI4PK": "BATCH#{batchName}",
  "GSI4SK": "{userType}#{email}"
}
```

#### Student User Schema
```json
{
  "PK": "USER#STUDENT",
  "SK": "student@example.com",
  "userType": "student",
  "email": "student@example.com",
  "name": "John Doe",
  "status": "active",
  "mobile": "+1234567890",
  "address": "123 Main St, City, State",
  "imageUrl": "https://storage/student-images/john-doe.jpg",
  "dob": "2005-06-15",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "emailVerified": true,
  "lastLoginAt": "2024-01-01T10:30:00Z",
  "isActive": true,
  
  "profile": {
    // Academic Information
    "batch": "Math2024_Grade11",
    "centres": [
      {
        "centreId": "Centre_Mumbai",
        "centreName": "Mumbai Physical Centre",
        "centreType": "physical",
        "address": "123 Education St, Mumbai",
        "enrollmentDate": "2024-01-15"
      },
      {
        "centreId": "Online_OneToOne_Math",
        "centreName": "Online Mathematics - One-to-One",
        "centreType": "online",
        "teachingMode": "one_to_one",
        "assignedTeacher": "teacher@example.com",
        "scheduledSlots": [
          {
            "day": "Monday",
            "time": "16:00-17:00",
            "timezone": "Asia/Kolkata"
          },
          {
            "day": "Wednesday", 
            "time": "16:00-17:00",
            "timezone": "Asia/Kolkata"
          }
        ],
        "enrollmentDate": "2024-01-15"
      }
    ],
    "class": "11",
    "board": "CBSE",
    "school": "ABC High School",
    "enrollmentDate": "2024-01-15",
    "subjects": ["Mathematics", "Physics", "Chemistry"],
    "studentId": "STU2024001",
    "rollNumber": "11A001",
    
    // Payment Information
    "paymentInfo": {
      "amountPending": 5000,
      "totalFees": 25000,
      "amountPaid": 20000,
      "paymentType": "installment",
      "monthlyInstallment": 2500,
      "installmentDueDate": "2024-02-01",
      "payments": [
        {
          "id": "PAY_001",
          "amount": 10000,
          "date": "2024-01-15",
          "method": "online",
          "receiptNumber": "RCP_001",
          "description": "Admission + First Installment"
        },
        {
          "id": "PAY_002", 
          "amount": 10000,
          "date": "2024-01-30",
          "method": "cash",
          "receiptNumber": "RCP_002",
          "description": "Second Installment"
        }
      ]
    },
    
    // Academic Performance
    "attendance": {
      "Mathematics": {
        "Algebra": [
          {
            "date": "2024-01-20",
            "status": "present",
            "timestamp": "2024-01-20T10:00:00Z",
            "topic": "Linear Equations"
          }
        ],
        "Geometry": [
          {
            "date": "2024-01-22",
            "status": "absent", 
            "timestamp": "2024-01-22T10:00:00Z",
            "topic": "Triangles"
          }
        ]
      }
    },
    
    "examResults": [
      {
        "examId": "EXAM_001",
        "subject": "Mathematics",
        "score": 85,
        "maxScore": 100,
        "date": "2024-01-25",
        "grade": "A"
      }
    ],
    
    // Communication
    "chatIds": ["CHAT_001", "CHAT_002"],
    "parentEmails": ["parent@example.com"],
    
    // Preferences
    "preferences": {
      "language": "en",
      "timezone": "Asia/Kolkata",
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      }
    }
  },
  
  // Index Values
  "GSI1PK": "TYPE#STUDENT",
  "GSI1SK": "student@example.com",
  "GSI2PK": "STATUS#active",
  "GSI2SK": "STUDENT#student@example.com",
  "GSI3PK": "ORG#Centre_Mumbai",
  "GSI3SK": "STUDENT#student@example.com",
  "GSI4PK": "BATCH#Math2024_Grade11",
  "GSI4SK": "STUDENT#student@example.com"
}
```

#### Teacher User Schema
```json
{
  "PK": "USER#TEACHER",
  "SK": "teacher@example.com",
  "userType": "teacher",
  "email": "teacher@example.com",
  "name": "Jane Smith",
  "status": "active",
  "mobile": "+1234567891",
  "address": "456 Oak Ave, City, State",
  "imageUrl": "https://storage/teacher-images/jane-smith.jpg",
  "dob": "1985-03-20",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "emailVerified": true,
  "lastLoginAt": "2024-01-01T09:00:00Z",
  "isActive": true,
  
  "profile": {
    // Professional Information
    "employeeId": "EMP2024001",
    "designation": "Senior Mathematics Teacher",
    "department": "Mathematics",
    "joiningDate": "2024-01-01",
    "qualification": "M.Sc Mathematics, B.Ed",
    "experience": 8,
    "specialization": ["Algebra", "Calculus", "Geometry"],
    
    // Teaching Assignment
    "assignedCentres": [
      {
        "centreId": "Centre_Mumbai",
        "centreName": "Mumbai Physical Centre",
        "centreType": "physical",
        "address": "123 Education St, Mumbai"
      },
      {
        "centreId": "Online_Teaching_Platform",
        "centreName": "Online Teaching Platform",
        "centreType": "online",
        "teachingModes": ["one_to_one", "one_to_many"],
        "platformDetails": {
          "meetingRoom": "https://meet.vedic-math.com/teacher-jane",
          "backupPlatform": "zoom",
          "recordingEnabled": true
        }
      }
    ],
    "assignedBatches": [
      {
        "batchId": "Math2024_Grade11",
        "batchName": "Mathematics Grade 11",
        "subjects": ["Mathematics"],
        "students": 25,
        "centreType": "physical",
        "schedule": "Mon-Wed-Fri 10:00-12:00",
        "centreId": "Centre_Mumbai"
      },
      {
        "batchId": "Online_Math_OneToMany",
        "batchName": "Online Mathematics - Group Classes",
        "subjects": ["Mathematics"],
        "students": 15,
        "centreType": "online",
        "teachingMode": "one_to_many",
        "schedule": "Tue-Thu 16:00-17:30",
        "centreId": "Online_Teaching_Platform",
        "maxStudents": 20
      }
    ],
    "oneToOneStudents": [
      {
        "studentEmail": "student@example.com",
        "studentName": "John Doe",
        "subject": "Advanced Mathematics",
        "centreType": "online",
        "schedule": [
          {
            "day": "Monday",
            "time": "16:00-17:00",
            "timezone": "Asia/Kolkata"
          },
          {
            "day": "Wednesday",
            "time": "16:00-17:00", 
            "timezone": "Asia/Kolkata"
          }
        ],
        "hourlyRate": 1500,
        "currency": "INR",
        "startDate": "2024-01-15"
      }
    ],
    
    // Permissions & Access
    "permissions": [
      "mark_attendance",
      "create_assignments", 
      "grade_exams",
      "view_student_progress",
      "upload_content",
      "schedule_meetings"
    ],
    
    // Employment Details
    "employment": {
      "type": "full_time",
      "salary": 75000,
      "currency": "INR",
      "paymentFrequency": "monthly",
      "contractEndDate": "2025-01-01"
    },
    
    // Performance Metrics
    "performance": {
      "studentRating": 4.5,
      "attendanceRate": 95,
      "contentContributions": 15,
      "lastEvaluation": "2024-01-01"
    },
    
    // Communication
    "chatIds": ["CHAT_TEACH_001"],
    "studentGroups": ["GRP_Math11", "GRP_Math12"],
    
    // Preferences
    "preferences": {
      "language": "en",
      "timezone": "Asia/Kolkata",
      "workingHours": {
        "start": "09:00",
        "end": "18:00"
      },
      "notifications": {
        "email": true,
        "sms": true,
        "push": true
      }
    }
  },
  
  // Index Values
  "GSI1PK": "TYPE#TEACHER",
  "GSI1SK": "teacher@example.com",
  "GSI2PK": "STATUS#active",
  "GSI2SK": "TEACHER#teacher@example.com",
  "GSI3PK": "ORG#Centre_Mumbai",
  "GSI3SK": "TEACHER#teacher@example.com",
  "GSI4PK": "BATCH#Math2024_Grade11",
  "GSI4SK": "TEACHER#teacher@example.com"
}
```

#### Parent User Schema
```json
{
  "PK": "USER#PARENT",
  "SK": "parent@example.com",
  "userType": "parent",
  "email": "parent@example.com", 
  "name": "Robert Johnson",
  "status": "active",
  "mobile": "+1234567892",
  "address": "789 Pine St, City, State",
  "imageUrl": "https://storage/parent-images/robert-johnson.jpg",
  "dob": "1975-08-10",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "emailVerified": true,
  "lastLoginAt": "2024-01-01T19:00:00Z",
  "isActive": true,
  
  "profile": {
    // Personal Information
    "occupation": "Software Engineer",
    "company": "Tech Corp",
    "alternateContact": "+1234567893",
    "emergencyContact": "+1234567894",
    "relationship": "father",
    
    // Children Information
    "children": [
      {
        "email": "child1@example.com",
        "name": "John Doe",
        "relationship": "son",
        "batch": "Math2024_Grade11",
        "centre": "Centre_Mumbai",
        "class": "11",
        "linkedDate": "2024-01-01"
      },
      {
        "email": "child2@example.com", 
        "name": "Jane Doe",
        "relationship": "daughter",
        "batch": "Science2024_Grade9",
        "centre": "Centre_Mumbai", 
        "class": "9",
        "linkedDate": "2024-01-01"
      }
    ],
    
    // Payment Information
    "paymentInfo": {
      "totalOutstanding": 10000,
      "monthlyCommitment": 5000,
      "paymentMethod": "auto_debit",
      "bankDetails": {
        "accountHolder": "Robert Johnson",
        "bankName": "HDFC Bank",
        "accountNumber": "****1234",
        "ifscCode": "HDFC0001234"
      },
      "gstDetails": {
        "isGstApplicable": true,
        "gstNumber": "27ABCDE1234F1Z5",
        "gstRegisteredName": "Robert Johnson Enterprises",
        "billingAddress": {
          "addressLine1": "789 Pine St",
          "addressLine2": "Near City Mall",
          "city": "Mumbai",
          "state": "Maharashtra",
          "pincode": "400001",
          "country": "India"
        },
        "gstCategory": "regular",
        "registrationDate": "2023-01-15",
        "isActive": true,
        "exemptionReason": null
      },
      "invoicePreferences": {
        "requireGstInvoice": true,
        "invoiceFormat": "detailed",
        "emailInvoice": true,
        "invoiceLanguage": "en",
        "additionalDetails": "Please include HSN codes"
      },
      "paymentHistory": [
        {
          "id": "PAY_P001",
          "amount": 15000,
          "baseAmount": 12711.86,
          "gstAmount": 2288.14,
          "gstRate": 18,
          "date": "2024-01-15",
          "method": "online",
          "childEmail": "child1@example.com",
          "description": "Tuition Fee - John",
          "receiptNumber": "RCP_P001",
          "invoiceNumber": "INV_P001",
          "gstInvoiceGenerated": true,
          "hsnCode": "999293"
        }
      ]
    },
    
    // Communication Preferences
    "communicationPreferences": {
      "progressReports": "weekly",
      "attendanceAlerts": "immediate", 
      "paymentReminders": "3_days_before",
      "meetingNotifications": true
    },
    
    // Access Permissions
    "permissions": [
      "view_child_progress",
      "view_attendance",
      "make_payments",
      "schedule_meetings",
      "view_assignments",
      "download_reports"
    ],
    
    // Communication
    "chatIds": ["CHAT_PAR_001"],
    "teacherContacts": [
      {
        "teacherEmail": "teacher@example.com",
        "childEmail": "child1@example.com",
        "subject": "Mathematics"
      }
    ],
    
    // Preferences
    "preferences": {
      "language": "en",
      "timezone": "Asia/Kolkata",
      "notifications": {
        "email": true,
        "sms": true,
        "push": true,
        "frequency": "important_only"
      }
    }
  },
  
  // Index Values
  "GSI1PK": "TYPE#PARENT",
  "GSI1SK": "parent@example.com",
  "GSI2PK": "STATUS#active",
  "GSI2SK": "PARENT#parent@example.com",
  "GSI3PK": "ORG#Centre_Mumbai",
  "GSI3SK": "PARENT#parent@example.com",
  "GSI4PK": "BATCH#Math2024_Grade11",
  "GSI4SK": "PARENT#parent@example.com"
}
```

#### Super Admin User Schema
```json
{
  "PK": "USER#ADMIN",
  "SK": "superadmin@zenithadmin.com",
  "userType": "admin",
  "email": "superadmin@zenithadmin.com",
  "name": "Sarah Wilson",
  "status": "active",
  "mobile": "+1234567890",
  "address": "Admin Office, Corporate Tower",
  "imageUrl": "https://storage/admin-images/sarah-wilson.jpg",
  "dob": "1980-12-05",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "emailVerified": true,
  "lastLoginAt": "2024-01-01T08:00:00Z",
  "isActive": true,
  
  "profile": {
    // Administrative Information
    "employeeId": "SADM2024001",
    "designation": "Super Administrator",
    "department": "Executive Management",
    "accessLevel": "super_admin",
    "adminType": "super_admin",
    "joiningDate": "2024-01-01",
    
    // Super Admin Permissions (Full System Access)
    "permissions": [
      "user_management",
      "admin_management",
      "content_management", 
      "system_configuration",
      "financial_management",
      "report_generation",
      "data_export",
      "backup_restore",
      "user_impersonation",
      "system_monitoring",
      "security_management",
      "audit_logs",
      "system_settings",
      "create_admins",
      "delete_admins",
      "modify_permissions"
    ],
    
    // Access Control (Global)
    "accessScope": "global",
    "managedCentres": ["all"],
    "managedBatches": ["all"],
    "managedAdmins": ["all"],
    "dataAccess": {
      "students": "full",
      "teachers": "full", 
      "parents": "full",
      "admins": "full",
      "financial": "full",
      "system": "full",
      "audit": "full"
    },
    
    // Super Admin Responsibilities
    "responsibilities": [
      "Overall system administration",
      "Admin user management",
      "System security oversight",
      "Policy creation and enforcement",
      "Financial oversight",
      "Compliance management"
    ],
    
    // Enhanced Security Settings
    "security": {
      "mfaEnabled": true,
      "mfaRequired": true,
      "lastPasswordChange": "2024-01-01",
      "passwordExpiryDays": 90,
      "loginAttempts": 0,
      "sessionTimeout": 3600,
      "ipWhitelist": ["192.168.1.0/24", "10.0.0.0/8"],
      "auditLogging": true,
      "advancedSecurity": true
    },
    
    // System Activity
    "activity": {
      "lastAction": "admin_created",
      "lastActionTimestamp": "2024-01-01T10:30:00Z",
      "actionsToday": 25,
      "loginSessions": 1,
      "criticalActions": 3
    },
    
    // Preferences
    "preferences": {
      "language": "en",
      "timezone": "Asia/Kolkata",
      "dashboardLayout": "executive",
      "notifications": {
        "email": true,
        "sms": true,
        "push": true,
        "systemAlerts": true,
        "userActivities": true,
        "securityAlerts": true,
        "auditAlerts": true
      }
    }
  },
  
  // Index Values
  "GSI1PK": "TYPE#ADMIN", 
  "GSI1SK": "superadmin@zenithadmin.com",
  "GSI2PK": "STATUS#active",
  "GSI2SK": "ADMIN#superadmin@zenithadmin.com",
  "GSI3PK": "ORG#GLOBAL",
  "GSI3SK": "ADMIN#superadmin@zenithadmin.com",
  "GSI4PK": "BATCH#ALL",
  "GSI4SK": "ADMIN#superadmin@zenithadmin.com"
}
```

#### Batch Admin User Schema
```json
{
  "PK": "USER#ADMIN",
  "SK": "batchadmin@zenithadmin.com",
  "userType": "admin",
  "email": "batchadmin@zenithadmin.com",
  "name": "John Smith",
  "status": "active",
  "mobile": "+1234567891",
  "address": "Regional Office, Mumbai",
  "imageUrl": "https://storage/admin-images/john-smith.jpg",
  "dob": "1985-07-15",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "emailVerified": true,
  "lastLoginAt": "2024-01-01T09:00:00Z",
  "isActive": true,
  
  "profile": {
    // Administrative Information
    "employeeId": "BADM2024001",
    "designation": "Batch Administrator",
    "department": "Academic Operations",
    "accessLevel": "batch_admin",
    "adminType": "batch_admin",
    "joiningDate": "2024-01-01",
    
    // Batch-Specific Assignment
    "assignedBatches": [
      {
        "batchId": "Math2024_Grade11",
        "batchName": "Mathematics Grade 11",
        "centre": "Centre_Mumbai",
        "subjects": ["Mathematics"],
        "studentCount": 25,
        "assignedDate": "2024-01-01",
        "permissions": ["full"]
      },
      {
        "batchId": "Math2024_Grade12",
        "batchName": "Mathematics Grade 12", 
        "centre": "Centre_Mumbai",
        "subjects": ["Advanced Mathematics"],
        "studentCount": 20,
        "assignedDate": "2024-01-01",
        "permissions": ["full"]
      }
    ],
    
    // Batch Admin Permissions (Limited)
    "permissions": [
      "batch_user_management",
      "batch_content_management",
      "batch_attendance_management",
      "batch_exam_management",
      "batch_report_generation",
      "batch_financial_view",
      "batch_communication",
      "student_progress_tracking",
      "teacher_coordination"
    ],
    
    // Access Control (Batch-Specific)
    "accessScope": "batch",
    "managedCentres": ["Centre_Mumbai"],
    "managedBatches": ["Math2024_Grade11", "Math2024_Grade12"],
    "dataAccess": {
      "students": "batch_only",
      "teachers": "batch_only", 
      "parents": "batch_only",
      "admins": "view_only",
      "financial": "batch_only",
      "system": "read_only"
    },
    
    // Batch Admin Responsibilities
    "responsibilities": [
      "Batch student management",
      "Teacher coordination for assigned batches",
      "Batch performance monitoring",
      "Parent communication",
      "Attendance oversight",
      "Exam coordination"
    ],
    
    // Standard Security Settings
    "security": {
      "mfaEnabled": true,
      "mfaRequired": false,
      "lastPasswordChange": "2024-01-01",
      "passwordExpiryDays": 180,
      "loginAttempts": 0,
      "sessionTimeout": 7200,
      "ipWhitelist": null,
      "auditLogging": true,
      "advancedSecurity": false
    },
    
    // Activity Tracking
    "activity": {
      "lastAction": "student_updated",
      "lastActionTimestamp": "2024-01-01T14:30:00Z",
      "actionsToday": 15,
      "loginSessions": 1,
      "batchActivities": {
        "Math2024_Grade11": 8,
        "Math2024_Grade12": 7
      }
    },
    
    // Batch Admin Preferences
    "preferences": {
      "language": "en",
      "timezone": "Asia/Kolkata",
      "dashboardLayout": "batch_focused",
      "defaultBatch": "Math2024_Grade11",
      "notifications": {
        "email": true,
        "sms": false,
        "push": true,
        "systemAlerts": false,
        "batchAlerts": true,
        "parentCommunication": true,
        "attendanceAlerts": true
      }
    }
  },
  
  // Index Values (Batch-Specific)
  "GSI1PK": "TYPE#ADMIN", 
  "GSI1SK": "batchadmin@zenithadmin.com",
  "GSI2PK": "STATUS#active",
  "GSI2SK": "ADMIN#batchadmin@zenithadmin.com",
  "GSI3PK": "ORG#Centre_Mumbai",
  "GSI3SK": "ADMIN#batchadmin@zenithadmin.com",
  "GSI4PK": "BATCH#Math2024_Grade11",
  "GSI4SK": "ADMIN#batchadmin@zenithadmin.com"
}
```

## Invoice Database Schema

### Complete Invoice Schema

```json
{
  "PK": "INVOICE#2024",
  "SK": "INV#INV_2024_001",
  "invoiceNumber": "INV_2024_001",
  "invoiceDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  
  // Invoice Status & Type
  "status": "paid|pending|overdue|cancelled|refunded",
  "invoiceType": "tuition|admission|exam|miscellaneous",
  "paymentStatus": "paid|partial|unpaid",
  "isGstApplicable": true,
  
  // Student Information
  "studentInfo": {
    "email": "student@example.com",
    "name": "John Doe",
    "studentId": "STU2024001",
    "rollNumber": "11A001",
    "batch": "Math2024_Grade11",
    "centres": [
      {
        "centreId": "Centre_Mumbai",
        "centreName": "Mumbai Physical Centre",
        "centreType": "physical"
      },
      {
        "centreId": "Online_OneToOne_Math",
        "centreName": "Online Mathematics - One-to-One",
        "centreType": "online",
        "teachingMode": "one_to_one"
      }
    ],
    "class": "11",
    "board": "CBSE"
  },
  
  // Parent Information (who pays)
  "parentInfo": {
    "email": "parent@example.com",
    "name": "Robert Johnson",
    "mobile": "+1234567892",
    "address": "789 Pine St, City, State",
    "relationship": "father"
  },
  
  // Teacher Information (if applicable)
  "teacherInfo": {
    "email": "teacher@example.com",
    "name": "Jane Smith",
    "employeeId": "EMP2024001",
    "subjects": ["Mathematics"],
    "batchAssigned": "Math2024_Grade11"
  },
  
  // Admin Information (who created/managed)
  "adminInfo": {
    "createdBy": "admin@zenithadmin.com",
    "createdByName": "Sarah Wilson",
    "approvedBy": "admin@zenithadmin.com",
    "approvedByName": "Sarah Wilson",
    "lastModifiedBy": "admin@zenithadmin.com"
  },
  
  // Invoice Items & Amounts
  "items": [
    {
      "itemId": "ITEM_001",
      "description": "Mathematics Tuition Fee - Physical Centre - January 2024",
      "category": "tuition",
      "subject": "Mathematics",
      "centreType": "physical",
      "centreId": "Centre_Mumbai",
      "period": "2024-01",
      "quantity": 1,
      "unitPrice": 8000.00,
      "totalPrice": 8000.00,
      "hsnCode": "999293",
      "gstRate": 18,
      "gstAmount": 1440.00,
      "discountAmount": 0,
      "discountPercentage": 0
    },
    {
      "itemId": "ITEM_002", 
      "description": "Online One-to-One Mathematics - January 2024 (8 hours)",
      "category": "tuition",
      "subject": "Mathematics",
      "centreType": "online",
      "teachingMode": "one_to_one",
      "centreId": "Online_OneToOne_Math",
      "teacherEmail": "teacher@example.com",
      "period": "2024-01",
      "quantity": 8,
      "unitPrice": 1500.00,
      "totalPrice": 12000.00,
      "hsnCode": "999293",
      "gstRate": 18,
      "gstAmount": 2160.00,
      "discountAmount": 1000.00,
      "discountPercentage": 8.33
    }
  ],
  
  // Amount Summary
  "amountSummary": {
    "subtotal": 19000.00,
    "totalGstAmount": 3600.00,
    "totalDiscountAmount": 1000.00,
    "totalAmount": 21600.00,
    "amountPaid": 21600.00,
    "amountPending": 0,
    "currency": "INR",
    "breakdown": {
      "physicalCentreFees": 9440.00,
      "onlineFees": 13160.00,
      "discount": -1000.00
    }
  },
  
  // GST Details (if applicable)
  "gstDetails": {
    "isGstInvoice": true,
    "gstNumber": "27ABCDE1234F1Z5",
    "gstRegisteredName": "Robert Johnson Enterprises",
    "billingAddress": {
      "addressLine1": "789 Pine St",
      "addressLine2": "Near City Mall",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "placeOfSupply": "Maharashtra",
    "gstBreakup": {
      "cgst": 1144.07,
      "sgst": 1144.07,
      "igst": 0,
      "cess": 0
    }
  },
  
  // Payment Information
  "payments": [
    {
      "paymentId": "PAY_001",
      "paymentDate": "2024-01-15",
      "amount": 15000,
      "method": "online",
      "transactionId": "TXN_12345",
      "bankReference": "HDFC_REF_001",
      "status": "success",
      "paidBy": "parent@example.com",
      "receiptNumber": "RCP_001",
      "notes": "Payment for January tuition"
    }
  ],
  
  // Additional Information
  "additionalInfo": {
    "notes": "January 2024 Mathematics tuition fee",
    "termsAndConditions": "Payment due within 30 days",
    "academicYear": "2023-24",
    "semester": "2",
    "installmentNumber": 1,
    "totalInstallments": 12
  },
  
  // System Information
  "metadata": {
    "generatedBy": "system",
    "invoiceTemplate": "standard_gst",
    "emailSent": true,
    "emailSentAt": "2024-01-15T10:35:00Z",
    "remindersSent": 0,
    "lastReminderAt": null,
    "printCount": 2,
    "lastPrintedAt": "2024-01-15T11:00:00Z"
  },
  
  // Index Values for GSIs
  "GSI1PK": "STUDENT#student@example.com",
  "GSI1SK": "2024-01-15#INV_2024_001",
  "GSI2PK": "PARENT#parent@example.com",
  "GSI2SK": "2024-01-15#INV_2024_001",
  "GSI3PK": "STATUS#paid",
  "GSI3SK": "2024-01-15#INV_2024_001",
  "GSI4PK": "DATE#2024#01",
  "GSI4SK": "2024-01-15#INV_2024_001",
  "GSI5PK": "CENTRE#Centre_Mumbai",
  "GSI5SK": "2024-01-15#INV_2024_001"
}
```

### Invoice Query Patterns

```javascript
// Get invoice by invoice number
PK = "INVOICE#2024" AND SK = "INV#INV_2024_001"

// Get all invoices for a student
GSI1PK = "STUDENT#student@example.com"

// Get all invoices for a parent
GSI2PK = "PARENT#parent@example.com"

// Get all pending invoices
GSI3PK = "STATUS#pending"

// Get invoices for a specific month
GSI4PK = "DATE#2024#01"

// Get invoices for a centre
GSI5PK = "CENTRE#Centre_Mumbai"

// Get invoices in date range (using GSI1 with begins_with)
GSI1PK = "STUDENT#student@example.com" 
AND GSI1SK BETWEEN "2024-01-01" AND "2024-01-31"
```

### Updated User Schemas (Payment References)

#### Updated Student Schema - Payment Section
```json
{
  // ... existing student fields ...
  
  "profile": {
    // ... existing profile fields ...
    
    // Updated Payment Information - References only
    "paymentInfo": {
      "totalFees": 25000,
      "amountPaid": 20000,
      "amountPending": 5000,
      "paymentType": "installment",
      "monthlyInstallment": 2500,
      "nextDueDate": "2024-02-01",
      "invoiceIds": ["INV_2024_001", "INV_2024_002"], // Reference to invoices
      "lastPaymentDate": "2024-01-30",
      "paymentHistory": "see_invoices_table" // Reference indicator
    }
    
    // ... rest of profile ...
  }
}
```

#### Updated Parent Schema - Payment Section
```json
{
  // ... existing parent fields ...
  
  "profile": {
    // ... existing profile fields ...
    
    // Updated Payment Information - References only
    "paymentInfo": {
      "totalOutstanding": 10000,
      "monthlyCommitment": 5000,
      "paymentMethod": "auto_debit",
      "bankDetails": {
        "accountHolder": "Robert Johnson",
        "bankName": "HDFC Bank",
        "accountNumber": "****1234",
        "ifscCode": "HDFC0001234"
      },
      "gstDetails": {
        // ... existing GST details ...
      },
      "invoicePreferences": {
        // ... existing invoice preferences ...
      },
      "invoiceIds": ["INV_2024_001", "INV_2024_002"], // Reference to invoices
      "paymentHistory": "see_invoices_table" // Reference indicator
    }
    
    // ... rest of profile ...
  }
}
```

### Schema Validation Rules

```javascript
// Required fields for all user types
const baseRequiredFields = [
  'PK', 'SK', 'userType', 'email', 'name', 'status', 
  'createdAt', 'updatedAt', 'emailVerified'
];

// User type specific required fields
const userTypeRequiredFields = {
  student: ['profile.batch', 'profile.centres', 'profile.class'],
  teacher: ['profile.employeeId', 'profile.assignedBatches'],
  parent: ['profile.children', 'profile.paymentInfo'],
  admin: ['profile.accessLevel', 'profile.adminType', 'profile.permissions']
};

// Admin type validation
const adminTypeValidation = {
  types: ['super_admin', 'batch_admin'],
  accessLevels: ['super_admin', 'batch_admin'],
  requiredFields: {
    super_admin: ['permissions', 'security.mfaRequired', 'dataAccess'],
    batch_admin: ['assignedBatches', 'managedBatches', 'accessScope']
  },
  permissions: {
    super_admin: [
      'user_management', 'admin_management', 'content_management',
      'system_configuration', 'financial_management', 'report_generation',
      'data_export', 'backup_restore', 'user_impersonation',
      'system_monitoring', 'security_management', 'audit_logs'
    ],
    batch_admin: [
      'batch_user_management', 'batch_content_management',
      'batch_attendance_management', 'batch_exam_management',
      'batch_report_generation', 'batch_financial_view',
      'batch_communication', 'student_progress_tracking'
    ]
  }
};

// GST validation rules for parents
const gstValidationRules = {
  gstNumber: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  validCategories: ['regular', 'composition', 'exempt', 'unregistered'],
  requiredFields: {
    withGst: ['gstNumber', 'gstRegisteredName', 'billingAddress'],
    withoutGst: ['exemptionReason']
  }
};

// Invoice validation rules
const invoiceValidationRules = {
  requiredFields: [
    'PK', 'SK', 'invoiceNumber', 'invoiceDate', 'status', 
    'studentInfo', 'parentInfo', 'items', 'amountSummary'
  ],
  statusOptions: ['paid', 'pending', 'overdue', 'cancelled', 'refunded'],
  invoiceTypes: ['tuition', 'admission', 'exam', 'miscellaneous'],
  paymentMethods: ['cash', 'online', 'cheque', 'bank_transfer', 'auto_debit'],
  invoiceNumberPattern: /^INV_\d{4}_\d{3,6}$/,
  gstRates: [0, 5, 12, 18, 28]
};

// Status validation
const validStatuses = ['active', 'inactive', 'pending', 'suspended'];

// Email validation patterns
const emailPatterns = {
  student: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  teacher: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  parent: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  admin: /^[a-zA-Z0-9._%+-]+@zenithadmin\.com$/
};
```

### Data Size Considerations

```javascript
// DynamoDB item size limits
const maxItemSize = 400; // KB
const maxAttributeNameLength = 255;
const maxStringAttributeLength = 400000;

// Estimated sizes per user type
const estimatedSizes = {
  student: '15-25 KB',
  teacher: '10-20 KB', 
  parent: '8-15 KB',
  admin: '5-10 KB'
};
```

## Implementation Phases (Testable Independently)

### Phase 1: Core Infrastructure & Services (Week 1-2)
*Goal: Build foundation services with unit testing*

#### 1.1 Create User Service Layer
**File**: `src/services/userService.js`
```javascript
// Core functions to implement
- createUser(userData, userType)
- getUserByEmail(email)
- getUsersByType(userType)
- updateUser(email, data)
- deleteUser(email)
- getUsersByOrganization(orgId)
- validateUserType(userType)
- getUserPermissions(email)
```

#### 1.2 Create Invoice Service Layer
**File**: `src/services/invoiceService.js`
```javascript
// Core invoice functions
- createInvoice(invoiceData)
- getInvoiceById(invoiceNumber)
- getInvoicesByStudent(studentEmail)
- getInvoicesByParent(parentEmail)
- getInvoicesByStatus(status)
- getInvoicesByDateRange(startDate, endDate)
- updateInvoiceStatus(invoiceNumber, status)
- recordPayment(invoiceNumber, paymentData)
- generateInvoiceNumber(year)
- calculateGST(amount, gstRate)
- getInvoicesByBatch(batchName)
- getInvoicesByCentre(centreName)
```

**Testing Phase 1.1 & 1.2**:
- Unit tests for all user service functions
- Unit tests for all invoice service functions
- DynamoDB table creation and schema validation (Users & Invoices)
- Mock data CRUD operations for both tables
- Invoice-user relationship testing

#### 1.3 Enhanced AuthContext
**File**: `src/contexts/AuthContext.js`
```javascript
// New context functions
- getUserType()
- isStudent(), isTeacher(), isAdmin(), isParent()
- isSuperAdmin(), isBatchAdmin()
- getAdminType()
- hasPermission(permission)
- canAccess(resource)
- canAccessBatch(batchId)
- getUserProfile()
- refreshUserProfile()
- getAdminScope()
```

**Testing Phase 1.3**:
- Authentication flow testing
- User type detection validation
- Permission system testing

#### 1.4 Route Guards & Components
**Files**:
- `src/components/UserTypeRoute.jsx`
- `src/components/PermissionRoute.jsx`
- `src/components/MultiRoleRoute.jsx`

**Testing Phase 1.4**:
- Route access control testing
- Permission-based navigation
- Role-based component rendering

**Phase 1 Deliverables**:
- ✅ User service with full CRUD operations
- ✅ Invoice service with full CRUD operations
- ✅ Enhanced authentication context
- ✅ Route protection system
- ✅ Unit test coverage > 90%

---

### Phase 2: User Interface & Registration System (Week 3-4)
*Goal: Update UI for multi-user types with component testing*

#### 2.1 Enhanced Registration UI
**Update**: `src/pages/SignupPage.jsx`

**UI Modifications**:
```javascript
// Add user type selection
<UserTypeSelector 
  selectedType={userType}
  onChange={setUserType}
  options={['student', 'teacher', 'parent']}
/>

// Dynamic form fields based on user type
{userType === 'student' && <StudentFields />}
{userType === 'teacher' && <TeacherFields />}
{userType === 'parent' && <ParentFields />}

// Type-specific validation
const validateForm = (data, userType) => { ... }
```

**New Components to Create**:
- `src/components/UserTypeSelector.jsx`
- `src/components/forms/StudentFields.jsx`
- `src/components/forms/TeacherFields.jsx`
- `src/components/forms/ParentFields.jsx` (includes GST details form)
- `src/components/forms/GstDetailsSection.jsx`

#### 2.2 User Management Dashboard
**New File**: `src/pages/UserManagementPage.jsx`

**UI Features**:
```javascript
// Multi-tab interface
<Tabs>
  <Tab label="Students" component={<UserList type="student" />} />
  <Tab label="Teachers" component={<UserList type="teacher" />} />
  <Tab label="Parents" component={<UserList type="parent" />} />
  <Tab label="Admins" component={<UserList type="admin" />} />
</Tabs>

// User action buttons
<UserActions>
  <CreateUserButton type={selectedType} />
  <BulkImportButton type={selectedType} />
  <ExportUsersButton type={selectedType} />
</UserActions>
```

#### 2.3 Navigation & Header Updates
**Update**: `src/components/Navbar.jsx`

**UI Modifications**:
```javascript
// User type indicator
<UserTypeIndicator type={getUserType()} />

// Type-specific navigation items
{isTeacher() && <TeacherNavItems />}
{isParent() && <ParentNavItems />}
{isAdmin() && <AdminNavItems />}

// Enhanced user menu
<UserMenu>
  <ProfileLink />
  <DashboardLink userType={getUserType()} />
  <SettingsLink />
</UserMenu>
```

#### 2.4 Profile Management UI
**New File**: `src/pages/ProfilePage.jsx`

**UI Components**:
```javascript
// Dynamic profile editor
<ProfileEditor userType={getUserType()}>
  {userType === 'student' && <StudentProfile />}
  {userType === 'teacher' && <TeacherProfile />}
  {userType === 'parent' && <ParentProfile />}
</ProfileEditor>

// Profile sections
<ProfileSections>
  <PersonalInfo />
  <ContactInfo />
  <TypeSpecificInfo />
  <SecuritySettings />
</ProfileSections>
```

**Testing Phase 2**:
- Component rendering tests for all user types
- Form validation testing
- UI interaction testing
- Responsive design validation

**Phase 2 Deliverables**:
- ✅ Multi-user type registration system
- ✅ User management dashboard
- ✅ Updated navigation and profiles
- ✅ Component test coverage > 85%

---

### Phase 3: Page-Specific Modifications & Features (Week 5-6)
*Goal: Update all existing pages for multi-user support with integration testing*

#### 3.1 Dashboard Pages by User Type

**Student Dashboard** - `src/pages/StudentDashboard.jsx`
```javascript
// Enhanced student view with payment visibility
<StudentDashboard>
  <WelcomeCard student={userProfile} />
  <QuickActions>
    <JoinClassButton />
    <ViewAssignmentsButton />
    <CheckAttendanceButton />
    <ViewPaymentsButton />
  </QuickActions>
  <PaymentSummaryCard>
    <AmountPending />
    <NextDueDate />
    <PaymentStatus />
    <ViewInvoicesLink />
  </PaymentSummaryCard>
  <RecentActivity />
  <UpcomingClasses />
</StudentDashboard>
```

**Teacher Dashboard** - `src/pages/TeacherDashboard.jsx` (New)
```javascript
<TeacherDashboard>
  <TeacherWelcome teacher={userProfile} />
  <ClassManagement>
    <MyClasses />
    <OnlineClasses />
    <OneToOneStudents />
    <CreateClassButton />
    <ManageStudentsButton />
  </ClassManagement>
  <TeachingEarnings>
    <MonthlyEarnings />
    <PendingPayments />
    <EarningsBreakdown />
    <ViewPaymentHistory />
  </TeachingEarnings>
  <StudentProgress />
  <AttendanceTracker />
  <OnlineSessionManagement>
    <UpcomingSessions />
    <RecordedSessions />
    <SessionRecordings />
  </OnlineSessionManagement>
</TeacherDashboard>
```

**Parent Dashboard** - `src/pages/ParentDashboard.jsx` (New)
```javascript
<ParentDashboard>
  <ChildrenOverview children={userProfile.children} />
  <PaymentSummaryAdvanced>
    <TotalOutstanding />
    <MonthlyCommitment />
    <PaymentBreakdown>
      <PhysicalCentreFees />
      <OnlineTutoringFees />
      <GSTBreakdown />
    </PaymentBreakdown>
    <QuickPaymentButton />
    <ViewDetailedPayments />
  </PaymentSummaryAdvanced>
  <AttendanceOverview>
    <PhysicalClassAttendance />
    <OnlineSessionAttendance />
  </AttendanceOverview>
  <CommunicationCenter />
  <ProgressReports />
  <OnlineSessionTracking>
    <UpcomingOnlineSessions />
    <CompletedSessions />
    <OneToOneProgress />
  </OnlineSessionTracking>
</ParentDashboard>
```

**Super Admin Dashboard** - `src/pages/SuperAdminDashboard.jsx` (New)
```javascript
<SuperAdminDashboard>
  <ExecutiveOverview />
  <SystemHealthMetrics />
  <AdminManagement>
    <CreateAdminButton />
    <ManageAdminPermissions />
    <AdminActivityMonitor />
  </AdminManagement>
  <GlobalUserManagement />
  <SystemConfiguration />
  <SecurityManagement />
  <AuditLogs />
  <FinancialOverview />
</SuperAdminDashboard>
```

**Batch Admin Dashboard** - `src/pages/BatchAdminDashboard.jsx` (New)
```javascript
<BatchAdminDashboard>
  <BatchOverview batches={assignedBatches} />
  <BatchSelector defaultBatch={defaultBatch} />
  <BatchUserManagement>
    <StudentManagement />
    <TeacherCoordination />
    <ParentCommunication />
  </BatchUserManagement>
  <BatchPerformance />
  <AttendanceMonitor />
  <ExamManagement />
  <BatchReports />
</BatchAdminDashboard>
```

#### 3.2 Video & Content Access Control
**Update**: `src/pages/VideoListPage.jsx`

**UI Modifications**:
```javascript
// User type based access
const canAccessVideo = (video, userType, userProfile) => {
  switch(userType) {
    case 'student': return userProfile.batch === video.batch;
    case 'teacher': return userProfile.assignedBatches.includes(video.batch);
    case 'parent': return hasChildInBatch(video.batch);
    case 'admin': return true;
  }
};

// Type-specific video controls
{isTeacher() && <TeacherVideoControls />}
{isParent() && <ParentViewControls />}
{isAdmin() && <AdminVideoManagement />}
```

#### 3.3 Attendance System Updates
**Update**: `src/pages/AttendancePage.jsx`

**UI Modifications**:
```javascript
// Role-based attendance interface
{isTeacher() && (
  <TeacherAttendanceView>
    <ClassSelector />
    <StudentList />
    <MarkAttendanceControls />
  </TeacherAttendanceView>
)}

{isParent() && (
  <ParentAttendanceView>
    <ChildSelector />
    <AttendanceHistory />
    <AttendanceReports />
  </ParentAttendanceView>
)}

{isStudent() && (
  <StudentAttendanceView>
    <MyAttendance />
    <AttendanceStats />
  </StudentAttendanceView>
)}
```

#### 3.4 Meeting & Communication Pages
**Update**: `src/pages/MeetingsPage.jsx`

**UI Modifications**:
```javascript
// Enhanced meeting access
<MeetingAccess userType={getUserType()}>
  {isTeacher() && <HostMeetingControls />}
  {isStudent() && <JoinMeetingInterface />}
  {isParent() && <ParentMeetingView />}
  {isAdmin() && <MeetingManagement />}
</MeetingAccess>
```

#### 3.5 Payment Tracking & Billing Interface
**New Pages**: 
- `src/pages/StudentPaymentPage.jsx`
- `src/pages/TeacherPaymentPage.jsx`
- `src/pages/ParentPaymentPage.jsx`
- `src/pages/PaymentTrackingPage.jsx`

**UI Implementations**:

##### Student Payment Tracking
```javascript
<StudentPaymentPage>
  <PaymentOverview>
    <TotalFeesCard />
    <AmountPaidCard />
    <PendingAmountCard />
    <NextDueDateCard />
  </PaymentOverview>
  <PaymentBreakdown>
    <PhysicalCentreFeesChart />
    <OnlineTutoringFeesChart />
    <SubjectWiseBreakdown />
  </PaymentBreakdown>
  <PaymentHistory>
    <PaymentTimeline />
    <InvoiceList />
    <ReceiptDownloads />
  </PaymentHistory>
  <OnlineSessionTracking>
    <CompletedSessions />
    <SessionCosts />
    <TeacherWiseBreakdown />
  </OnlineSessionTracking>
</StudentPaymentPage>
```

##### Teacher Payment Tracking
```javascript
<TeacherPaymentPage>
  <EarningsOverview>
    <MonthlyEarningsCard />
    <PendingPaymentsCard />
    <YearToDateCard />
    <TaxDeductionsCard />
  </EarningsOverview>
  <EarningsBreakdown>
    <PhysicalClassEarnings />
    <OnlineSessionEarnings>
      <OneToOneEarnings />
      <GroupClassEarnings />
      <HourlyRateBreakdown />
    </OnlineSessionEarnings>
    <BonusesAndIncentives />
  </EarningsBreakdown>
  <PaymentHistory>
    <SalaryHistory />
    <SessionPayments />
    <TaxDocuments />
  </PaymentHistory>
  <SessionAnalytics>
    <HoursTracked />
    <StudentCount />
    <EarningsPerSession />
  </SessionAnalytics>
</TeacherPaymentPage>
```

##### Parent Payment Tracking
```javascript
<ParentPaymentPage>
  <PaymentDashboard>
    <TotalSpendingCard />
    <MonthlyCommitmentCard />
    <OutstandingAmountCard />
    <GSTSavingsCard />
  </PaymentDashboard>
  <ChildWiseBreakdown>
    {children.map(child => (
      <ChildPaymentCard key={child.email}>
        <ChildInfo />
        <FeeBreakdown>
          <PhysicalCentreFees />
          <OnlineTutoringFees />
          <ExtraActivities />
        </FeeBreakdown>
        <PaymentSchedule />
      </ChildPaymentCard>
    ))}
  </ChildWiseBreakdown>
  <PaymentMethods>
    <AutoDebitSettings />
    <PaymentHistory />
    <GSTInvoiceManagement />
  </PaymentMethods>
  <OnlineSessionManagement>
    <ScheduledSessions />
    <SessionCosts />
    <TeacherPreferences />
  </OnlineSessionManagement>
</ParentPaymentPage>
```

##### Universal Payment Tracking
```javascript
<PaymentTrackingPage>
  <PaymentFilters>
    <DateRangeSelector />
    <UserTypeFilter />
    <PaymentStatusFilter />
    <CentreTypeFilter />
    <TeachingModeFilter />
  </PaymentFilters>
  <PaymentAnalytics>
    <RevenueCharts />
    <PaymentTrends />
    <OnlineVsPhysicalRevenue />
    <TeacherEarningsComparison />
  </PaymentAnalytics>
  <PaymentDataTable>
    <SortableColumns />
    <ExportOptions />
    <BulkActions />
  </PaymentDataTable>
</PaymentTrackingPage>
```

#### 3.6 Online Centre Management
**New Page**: `src/pages/OnlineCentreManagement.jsx`

**UI Implementation**:
```javascript
<OnlineCentreManagement>
  <CentreTypes>
    <PhysicalCentres />
    <OnlineCentres>
      <OneToOneCentres />
      <GroupClassCentres />
    </OnlineCentres>
  </CentreTypes>
  <SessionScheduling>
    <WeeklyScheduleView />
    <TeacherAvailability />
    <StudentBookings />
    <ConflictResolution />
  </SessionScheduling>
  <OnlineTools>
    <MeetingRoomSetup />
    <RecordingSettings />
    <WhiteboardTools />
    <AttendanceTracking />
  </OnlineTools>
  <PaymentIntegration>
    <OnlineRateSettings />
    <AutoBilling />
    <SessionCharging />
  </PaymentIntegration>
</OnlineCentreManagement>
```

**New Components Created**:
- Payment tracking components (10 new components)
- Online centre management components (10 new components)
- GST integration components (4 enhanced components)

**Testing Phase 3**:
- Page-level integration testing
- User flow testing for each type
- Access control validation
- Feature functionality testing

**Phase 3 Deliverables**:
- ✅ All pages updated for multi-user types
- ✅ Type-specific features implemented
- ✅ Access control fully functional
- ✅ Integration test coverage > 80%

---

### Phase 4: Data Migration & System Integration (Week 7)
*Goal: Migrate data and ensure system cohesion with migration testing*

#### 4.1 Data Migration Scripts
**File**: `src/scripts/migrateUsers.js`

**Migration Process**:
```javascript
const migrationSteps = [
  'backupFirestoreData',
  'createDynamoDBTables', 
  'transformStudentData',
  'migrateToNewSchema',
  'validateMigration',
  'switchServices'
];
```

#### 4.2 Service Integration
**Updates Required**:
- Replace all `studentService` calls with `userService`
- Update all role checks throughout application
- Migrate existing data references

#### 4.3 Backwards Compatibility
**Temporary Dual System**:
- Maintain Firestore reads during transition
- Write to both systems temporarily
- Gradual feature migration

**Testing Phase 4**:
- Data migration validation
- System integration testing
- Performance benchmarking
- Rollback procedure testing

**Phase 4 Deliverables**:
- ✅ Complete data migration
- ✅ All services integrated
- ✅ Performance validated
- ✅ Rollback procedures tested

---

### Phase 5: End-to-End Testing & Production Deployment (Week 8)
*Goal: Comprehensive system validation and production readiness*

#### 5.1 Comprehensive E2E Testing

**User Journey Testing**:
```javascript
// Student complete flow
- Registration as student
- Profile completion
- Video access and viewing
- Exam participation
- Attendance tracking

// Teacher complete flow  
- Teacher account creation
- Class management
- Student progress tracking
- Content upload/management
- Attendance marking

// Parent complete flow
- Parent registration
- Child linking
- Payment processing
- Progress monitoring
- Communication with teachers

// Admin complete flow
- User management (all types)
- System configuration
- Report generation
- Content moderation
```

#### 5.2 Cross-User Type Interactions
```javascript
// Test scenarios
- Parent making payments for student
- Teacher marking attendance for students
- Admin managing all user types
- Student-teacher interactions
- Parent-teacher communications
```

#### 5.3 Performance & Load Testing
- Database query performance
- UI responsiveness across user types
- Concurrent user handling
- Large dataset operations

#### 5.4 Security & Access Control Testing
- Permission boundary testing
- Data isolation validation
- Authentication flow security
- Role escalation prevention

#### 5.5 Production Deployment
- Environment configuration
- Database setup and seeding
- Application deployment
- Monitoring and alerting setup

**Phase 5 Deliverables**:
- ✅ Complete E2E test suite
- ✅ Performance benchmarks met
- ✅ Security validation passed
- ✅ Production deployment completed
- ✅ Post-deployment monitoring active

---

## Testing Strategy Summary

### Independent Phase Testing
1. **Phase 1**: Unit tests for services and components
2. **Phase 2**: Component and UI integration tests  
3. **Phase 3**: Page-level feature tests
4. **Phase 4**: Migration and system integration tests
5. **Phase 5**: End-to-end user journey validation

### Test Coverage Goals
- **Unit Tests**: >90% coverage
- **Component Tests**: >85% coverage  
- **Integration Tests**: >80% coverage
- **E2E Tests**: 100% user journey coverage

### Rollback Criteria
Each phase includes rollback procedures if testing fails:
- Data backup and restore procedures
- Service fallback mechanisms
- UI component rollback capability
- Complete system restoration process

## User Type Specifications

### Student
- Profile: batch, centres, class, board, school, enrollment
- Features: Video access, exams, attendance

### Teacher  
- Profile: employeeId, specialization, assigned batches
- Features: Content management, student tracking, attendance

### Admin
- Profile: permissions, access level, department
- Features: Full system access, user management, reports

### Parent
- Profile: children (linked students), emergency contact
- Features: Child progress tracking, communication, attendance, payments

## Technical Requirements

### Environment Variables
```env
REACT_APP_DYNAMODB_USERS_TABLE=Users
REACT_APP_DEFAULT_USER_TYPE=student
```

### Dependencies
- Existing AWS SDK setup (already configured)
- No new dependencies required

## Migration Strategy

### Data Backup
1. Export all Firestore student records
2. Create JSON backup files
3. Verify data integrity

### Parallel Operations
1. Keep Firestore operational during migration
2. Write to both systems temporarily
3. Gradual switchover by feature

### Rollback Plan
1. Maintain Firestore backups
2. Quick switch back capability
3. Data sync validation

## Success Criteria

### Technical
- [ ] All user types can register/login
- [ ] Role-based access works correctly
- [ ] Data migration 100% accurate
- [ ] Performance maintained or improved

### Functional  
- [ ] All existing features preserved
- [ ] New user type features working
- [ ] Seamless user experience
- [ ] No authentication issues

## Risk Mitigation

1. **Data Loss**: Comprehensive backups, parallel operations
2. **Downtime**: Gradual migration, rollback capability
3. **User Impact**: Communication, testing, validation
4. **Performance**: Query optimization, proper indexing

## Next Steps

1. **Immediate**: Start with Phase 1 - create user service
2. **Priority**: Update AuthContext for unified user management
3. **Timeline**: Complete migration within 8 weeks
4. **Testing**: Continuous testing throughout implementation

## Page-Specific Modification Summary

| Page/Component | Current State | Student View | Teacher View | Parent View | Super Admin View | Batch Admin View | Changes Required |
|----------------|---------------|--------------|--------------|-------------|------------------|------------------|------------------|
| **SignupPage.jsx** | Student only | ✅ Enhanced form | 🆕 Teacher fields | 🆕 Parent fields | 🆕 Super admin creation | 🆕 Batch admin creation | Add user type selector, dynamic fields |
| **LoginPage.jsx** | Basic auth | ✅ Same | ✅ Same | ✅ Same | ✅ Same | ✅ Same | Enhanced post-login routing by admin type |
| **Navbar.jsx** | Student/Admin | ✅ Student nav | 🆕 Teacher nav | 🆕 Parent nav | 🆕 Super admin nav | 🆕 Batch admin nav | Admin type indicators, dynamic menus |
| **VideoListPage.jsx** | Student/Admin | ✅ Batch access | 🆕 Teaching batches | 🆕 Children's videos | ✅ All videos | 🆕 Batch videos only | Access control by admin type |
| **AttendancePage.jsx** | Admin/Franchise | ❌ View only | 🆕 Mark attendance | 🆕 Children's attendance | ✅ All attendance | 🆕 Batch attendance | Role-based interfaces by admin type |
| **MeetingsPage.jsx** | Student/Admin | ✅ Join meetings | 🆕 Host meetings | 🆕 Monitor children | ✅ Manage all | 🆕 Batch meetings | Admin type specific controls |
| **ExamPage.jsx** | Student/Admin | ✅ Take exams | 🆕 Create/monitor | 🆕 Children's results | ✅ Manage all exams | 🆕 Batch exams | Content access by admin scope |
| **UserManagementPage.jsx** | Admin/Franchise | ❌ Not accessible | 🆕 My students | 🆕 My children | ✅ All users + admins | 🆕 Batch users only | Scope-based user management |
| **InvoiceForm.jsx** | Admin/Franchise | ❌ Not accessible | ❌ Not accessible | 🆕 Pay for children | ✅ Create all invoices | 🆕 Batch invoices | Admin scope-based invoice creation |
| **ReceiptPage.jsx** | Admin/Franchise | ❌ View receipts | ❌ Not accessible | 🆕 Payment history | ✅ All receipts | 🆕 Batch receipts | Admin scope-based receipt access |
| **ProfilePage.jsx** | 🆕 New page | 🆕 Student profile | 🆕 Teacher profile | 🆕 Parent profile | 🆕 Super admin profile | 🆕 Batch admin profile | Dynamic profile by admin type |
| **StudentPaymentPage.jsx** | 🆕 New page | 🆕 View payments/invoices | ❌ Not applicable | ❌ Not applicable | ❌ Not applicable | ❌ Not applicable | Student payment visibility |
| **TeacherPaymentPage.jsx** | 🆕 New page | ❌ Not applicable | 🆕 Track teaching payments | ❌ Not applicable | ❌ Not applicable | ❌ Not applicable | Teacher payment tracking |
| **ParentPaymentPage.jsx** | 🆕 New page | ❌ Not applicable | ❌ Not applicable | 🆕 Track child payments | ❌ Not applicable | ❌ Not applicable | Parent payment tracking |
| **PaymentTrackingPage.jsx** | 🆕 New page | 🆕 Own payments | 🆕 Teaching earnings | 🆕 Child payments | ✅ All payments | 🆕 Batch payments | Universal payment tracking |
| **InvoiceManagementPage.jsx** | 🆕 New page | ❌ Not accessible | 🆕 Batch invoices | 🆕 Child invoices | ✅ All invoices | 🆕 Batch invoices only | Scope-based invoice management |
| **InvoiceDetailPage.jsx** | 🆕 New page | 🆕 Own invoices | 🆕 Related invoices | 🆕 Child invoices | ✅ All invoices | 🆕 Batch invoices | Admin scope-based invoice viewing |
| **AdminManagementPage.jsx** | 🆕 New page | ❌ Not accessible | ❌ Not accessible | ❌ Not accessible | 🆕 Manage all admins | ❌ Not accessible | Super admin exclusive page |

Legend: ✅ Exists, 🆕 New Feature, ❌ Currently Not Available

## UI Component Architecture

### New Components to Create

```
src/components/
├── UserTypeSelector.jsx          # User type selection in forms
├── UserTypeIndicator.jsx         # Display user type in UI
├── forms/
│   ├── StudentFields.jsx         # Student-specific form fields
│   ├── TeacherFields.jsx         # Teacher-specific form fields
│   ├── ParentFields.jsx          # Parent-specific form fields
│   ├── AdminFields.jsx           # Admin-specific form fields
│   └── GstDetailsSection.jsx     # GST information form
├── gst/
│   ├── GstDetailsForm.jsx        # GST registration details
│   ├── GstInvoiceGenerator.jsx   # Generate GST invoices
│   ├── BillingAddressForm.jsx    # GST billing address
│   ├── GstComplianceReports.jsx  # GST compliance reporting
│   └── GstValidationHelper.jsx   # GST number validation
├── dashboards/
│   ├── StudentDashboard.jsx      # Student home view
│   ├── TeacherDashboard.jsx      # Teacher home view
│   ├── ParentDashboard.jsx       # Parent home view (includes GST summary)
│   ├── SuperAdminDashboard.jsx   # Super admin executive view
│   └── BatchAdminDashboard.jsx   # Batch admin focused view
├── navigation/
│   ├── StudentNavItems.jsx       # Student navigation
│   ├── TeacherNavItems.jsx       # Teacher navigation
│   ├── ParentNavItems.jsx        # Parent navigation
│   ├── SuperAdminNavItems.jsx    # Super admin navigation
│   └── BatchAdminNavItems.jsx    # Batch admin navigation
├── admin/
│   ├── AdminManagement.jsx       # Super admin - manage admins
│   ├── CreateAdminForm.jsx       # Create new admin users
│   ├── AdminPermissions.jsx      # Manage admin permissions
│   ├── BatchAssignment.jsx       # Assign batches to batch admins
│   ├── AdminActivityMonitor.jsx  # Track admin activities
│   ├── SystemConfiguration.jsx   # System settings (super admin)
│   ├── SecurityManagement.jsx    # Security controls (super admin)
│   └── AuditLogs.jsx            # System audit logs (super admin)
└── common/
    ├── UserProfileCard.jsx       # Dynamic profile display
    ├── AccessControl.jsx         # Permission-based rendering
    ├── AdminTypeIndicator.jsx    # Show admin type
    └── UserTypeRoute.jsx         # Route protection with admin types
```

### Enhanced Pages to Create

```
src/pages/
├── UserManagementPage.jsx        # Replaces StudentManagementPage
├── ProfilePage.jsx               # User profile management
├── TeacherDashboard.jsx          # Teacher-specific dashboard
├── ParentDashboard.jsx           # Parent-specific dashboard
├── SuperAdminDashboard.jsx       # Super admin dashboard
├── BatchAdminDashboard.jsx       # Batch admin dashboard
├── AdminManagementPage.jsx       # Super admin - manage other admins
├── ParentPaymentPage.jsx         # Parent payment interface
├── StudentPaymentPage.jsx        # Student payment view (read-only)
├── TeacherPaymentPage.jsx        # Teacher payment tracking
├── PaymentTrackingPage.jsx       # Universal payment tracking
├── OnlineCentreManagement.jsx    # Manage online centres and sessions
├── InvoiceManagementPage.jsx     # Admin invoice management
├── InvoiceDetailPage.jsx         # Detailed invoice view
└── UserSettingsPage.jsx          # User-specific settings
```

### Invoice Management Components

```
src/components/invoices/
├── InvoiceList.jsx               # List invoices with filters
├── InvoiceCard.jsx               # Individual invoice summary
├── InvoiceDetail.jsx             # Detailed invoice view
├── InvoiceGenerator.jsx          # Create new invoices
├── PaymentRecorder.jsx           # Record payments against invoices
├── InvoiceStatusBadge.jsx        # Status indicator
├── InvoiceFilters.jsx            # Filter invoices by criteria
├── InvoiceDownload.jsx           # Download/print invoices
├── StudentInvoiceView.jsx        # Student-specific invoice view
├── ParentInvoiceView.jsx         # Parent-specific invoice view
├── TeacherInvoiceView.jsx        # Teacher-specific invoice view
└── AdminInvoiceView.jsx          # Admin-specific invoice view
```

### Payment Tracking Components

```
src/components/payments/
├── PaymentTracker.jsx            # Universal payment tracking
├── StudentPaymentView.jsx        # Student payment dashboard
├── TeacherPaymentView.jsx        # Teacher earnings tracker
├── ParentPaymentView.jsx         # Parent payment overview
├── PaymentTimeline.jsx           # Payment history timeline
├── PaymentFilters.jsx            # Filter payments by criteria
├── PaymentSummaryCard.jsx        # Payment summary widgets
├── EarningsCalculator.jsx        # Teacher earnings calculator
├── PaymentReminders.jsx          # Payment due reminders
└── PaymentAnalytics.jsx          # Payment analytics and reports
```

### Online Centre Components

```
src/components/online/
├── OnlineCentreManager.jsx       # Manage online centres
├── SessionScheduler.jsx          # Schedule online sessions
├── OneToOneScheduler.jsx         # One-to-one session scheduling
├── OneToManyScheduler.jsx        # Group session scheduling
├── OnlineAttendance.jsx          # Online session attendance
├── MeetingRoomManager.jsx        # Virtual meeting room management
├── RecordingManager.jsx          # Session recording management
├── OnlinePaymentCalculator.jsx   # Calculate online teaching fees
├── TeachingModeSelector.jsx      # Select teaching mode
└── VirtualClassroom.jsx          # Virtual classroom interface
```

## Detailed Feature & User Role Allocation Table

### Complete System Features by User Type

| **Feature Category** | **Feature** | **Student** | **Teacher** | **Parent** | **Super Admin** | **Batch Admin** | **Description** |
|---------------------|-------------|-------------|-------------|------------|-----------------|-----------------|-----------------|
| **🔐 Authentication & Account** |
| | User Registration | ✅ Self | ❌ Admin creates | ✅ Self | ✅ Creates all | ✅ Creates batch users | Account creation |
| | Login/Logout | ✅ Own account | ✅ Own account | ✅ Own account | ✅ Own account | ✅ Own account | System access |
| | Password Reset | ✅ Own password | ✅ Own password | ✅ Own password | ✅ Own password | ✅ Own password | Self-service password reset |
| | Profile Management | ✅ Own profile | ✅ Own profile | ✅ Own profile | ✅ Own profile | ✅ Own profile | Edit personal information |
| | Account Deactivation | ❌ Request only | ❌ Request only | ❌ Request only | ✅ All accounts | ✅ Batch accounts | Account status management |
| **👥 User Management** |
| | View User List | ❌ Classmates only | 📋 My students | 👨‍👩‍👧‍👦 My children | ✅ All users | 📚 Batch users only | User visibility scope |
| | Create Users | ❌ No | ❌ No | ❌ No | ✅ All types | ✅ Students/Teachers | User creation rights |
| | Edit User Profiles | ❌ Own only | ❌ Own only | 👨‍👩‍👧‍👦 Children only | ✅ All users | 📚 Batch users | Profile editing scope |
| | Delete Users | ❌ No | ❌ No | ❌ No | ✅ All users | ❌ No | User deletion rights |
| | Assign User Roles | ❌ No | ❌ No | ❌ No | ✅ All roles | ❌ No | Role assignment |
| | Bulk User Import | ❌ No | ❌ No | ❌ No | ✅ All users | ✅ Batch users | Mass user creation |
| **🏫 Centre & Batch Management** |
| | View Centres | 🏫 Enrolled only | 🏫 Assigned only | 👨‍👩‍👧‍👦 Children's centres | ✅ All centres | 📚 Assigned batches | Centre visibility |
| | Create Centres | ❌ No | ❌ No | ❌ No | ✅ All centres | ❌ No | Centre creation |
| | Manage Physical Centres | ❌ No | ❌ No | ❌ No | ✅ All centres | ❌ No | Physical location management |
| | Manage Online Centres | ❌ No | 🌐 Assigned only | ❌ No | ✅ All online centres | 🌐 Assigned online | Virtual centre management |
| | Create Batches | ❌ No | ❌ Request only | ❌ No | ✅ All batches | ❌ No | Batch creation |
| | Assign Students to Batches | ❌ No | ❌ Request only | ❌ No | ✅ All assignments | ✅ Own batch only | Student batch assignment |
| | Assign Teachers to Batches | ❌ No | ❌ No | ❌ No | ✅ All assignments | ❌ No | Teacher batch assignment |
| **📚 Academic Management** |
| | View Classes | 📅 Own schedule | 📅 Teaching schedule | 👨‍👩‍👧‍👦 Children's classes | ✅ All classes | 📚 Batch classes | Class visibility |
| | Create Classes | ❌ No | ✅ Own classes | ❌ No | ✅ All classes | ✅ Batch classes | Class creation |
| | Schedule Classes | ❌ No | ✅ Own classes | ❌ No | ✅ All classes | ✅ Batch classes | Class scheduling |
| | Cancel Classes | ❌ No | ✅ Own classes | ❌ No | ✅ All classes | ✅ Batch classes | Class cancellation |
| | View Attendance | ✅ Own attendance | ✅ Teaching classes | 👨‍👩‍👧‍👦 Children's attendance | ✅ All attendance | 📚 Batch attendance | Attendance tracking |
| | Mark Attendance | ❌ No | ✅ Teaching classes | ❌ No | ✅ All classes | ✅ Batch classes | Attendance recording |
| | Create Assignments | ❌ No | ✅ Teaching subjects | ❌ No | ✅ All assignments | ✅ Batch assignments | Assignment creation |
| | Submit Assignments | ✅ Own assignments | ❌ No | ❌ No | ❌ No | ❌ No | Assignment submission |
| | Grade Assignments | ❌ No | ✅ Teaching assignments | ❌ No | ✅ All assignments | ✅ Batch assignments | Assignment grading |
| **🌐 Online Teaching** |
| | Join Online Classes | ✅ Enrolled classes | ❌ No | ❌ Observer only | ✅ All classes | 📚 Batch classes | Online class participation |
| | Host Online Classes | ❌ No | ✅ Assigned classes | ❌ No | ✅ All classes | ✅ Batch classes | Online class hosting |
| | Schedule One-to-One | ❌ Request only | ✅ Assigned students | 👨‍👩‍👧‍👦 For children | ✅ All sessions | 📚 Batch students | Individual tutoring |
| | Schedule Group Online | ❌ No | ✅ Assigned groups | ❌ No | ✅ All groups | ✅ Batch groups | Group online classes |
| | Record Sessions | ❌ No | ✅ Own sessions | ❌ No | ✅ All sessions | ✅ Batch sessions | Session recording |
| | Access Recordings | ✅ Own classes | ✅ Own sessions | 👨‍👩‍👧‍👦 Children's classes | ✅ All recordings | 📚 Batch recordings | Recording access |
| | Manage Virtual Rooms | ❌ No | ✅ Assigned rooms | ❌ No | ✅ All rooms | ✅ Batch rooms | Virtual classroom management |
| | Whiteboard Access | ✅ Student mode | ✅ Full access | ❌ No | ✅ Full access | ✅ Full access | Interactive whiteboard |
| **📊 Progress & Analytics** |
| | View Own Progress | ✅ Detailed reports | ✅ Teaching analytics | ❌ No | ✅ All analytics | 📚 Batch analytics | Personal progress tracking |
| | View Student Progress | ❌ No | ✅ Teaching students | 👨‍👩‍👧‍👦 Own children | ✅ All students | 📚 Batch students | Student performance monitoring |
| | Generate Reports | ❌ Basic only | ✅ Class reports | 👨‍👩‍👧‍👦 Children reports | ✅ All reports | 📚 Batch reports | Report generation |
| | Export Data | ❌ Own data only | ✅ Class data | 👨‍👩‍👧‍👦 Children data | ✅ All data | 📚 Batch data | Data export capabilities |
| | Performance Analytics | ✅ Own performance | ✅ Teaching analytics | 👨‍👩‍👧‍👦 Children analytics | ✅ System analytics | 📚 Batch analytics | Advanced analytics |
| **📝 Exam Management** |
| | Take Exams | ✅ Assigned exams | ❌ No | ❌ No | ❌ No | ❌ No | Exam participation |
| | Create Exams | ❌ No | ✅ Subject exams | ❌ No | ✅ All exams | ✅ Batch exams | Exam creation |
| | Schedule Exams | ❌ No | ✅ Subject exams | ❌ No | ✅ All exams | ✅ Batch exams | Exam scheduling |
| | View Exam Results | ✅ Own results | ✅ Teaching subjects | 👨‍👩‍👧‍👦 Children results | ✅ All results | 📚 Batch results | Result access |
| | Grade Exams | ❌ No | ✅ Teaching subjects | ❌ No | ✅ All exams | ✅ Batch exams | Exam grading |
| | Exam Analytics | ✅ Own performance | ✅ Teaching analytics | 👨‍👩‍👧‍👦 Children analytics | ✅ System analytics | 📚 Batch analytics | Exam performance analysis |
| **💰 Payment & Billing** |
| | View Own Payments | ✅ Payment history | ❌ No | 👨‍👩‍👧‍👦 Children payments | ✅ All payments | 📚 Batch payments | Payment visibility |
| | Make Payments | ❌ Parent pays | ❌ No | ✅ For children | ❌ No | ❌ No | Payment processing |
| | View Invoices | ✅ Own invoices | ❌ No | 👨‍👩‍👧‍👦 Children invoices | ✅ All invoices | 📚 Batch invoices | Invoice access |
| | Create Invoices | ❌ No | ❌ No | ❌ No | ✅ All invoices | ✅ Batch invoices | Invoice creation |
| | Payment Tracking | ✅ Own payments | ✅ Earnings tracking | 👨‍👩‍👧‍👦 Family payments | ✅ All tracking | 📚 Batch tracking | Payment monitoring |
| | Generate Receipts | ✅ Download own | ❌ No | ✅ Family receipts | ✅ All receipts | 📚 Batch receipts | Receipt generation |
| | GST Management | ❌ No | ❌ No | ✅ GST details | ✅ All GST | ✅ Batch GST | GST handling |
| | Fee Structure | ✅ View own | ✅ View rates | 👨‍👩‍👧‍👦 Children fees | ✅ Manage all | ✅ Batch fees | Fee management |
| **💸 Teacher Payments** |
| | View Earnings | ❌ No | ✅ Own earnings | ❌ No | ✅ All earnings | 📚 Batch earnings | Teacher payment visibility |
| | Track Session Payments | ❌ No | ✅ Own sessions | ❌ No | ✅ All sessions | 📚 Batch sessions | Session-based payment tracking |
| | Monthly Salary | ❌ No | ✅ Own salary | ❌ No | ✅ All salaries | 📚 Batch salaries | Salary management |
| | Bonus/Incentives | ❌ No | ✅ Own bonuses | ❌ No | ✅ All bonuses | 📚 Batch bonuses | Additional compensation |
| | Tax Documents | ❌ No | ✅ Own documents | ❌ No | ✅ All documents | 📚 Batch documents | Tax documentation |
| **🔔 Communication** |
| | Send Messages | ✅ To teachers | ✅ To students/parents | ✅ To teachers | ✅ To all | 📚 Batch users | Messaging system |
| | Receive Notifications | ✅ All notifications | ✅ All notifications | ✅ All notifications | ✅ All notifications | ✅ All notifications | Notification system |
| | Parent-Teacher Chat | ❌ No | ✅ With parents | ✅ With teachers | ✅ Monitor all | 📚 Batch chats | Direct communication |
| | Announcements | ✅ Receive | ✅ Create batch | ❌ Receive | ✅ Create all | ✅ Create batch | System announcements |
| | Meeting Requests | ✅ Request | ✅ Accept/decline | ✅ Request | ✅ Manage all | 📚 Batch meetings | Meeting coordination |
| **⚙️ System Administration** |
| | System Settings | ❌ No | ❌ No | ❌ No | ✅ Full access | ❌ No | System configuration |
| | User Permissions | ❌ No | ❌ No | ❌ No | ✅ All permissions | ❌ No | Permission management |
| | Data Backup | ❌ No | ❌ No | ❌ No | ✅ Full backup | ❌ No | System backup |
| | Security Settings | ❌ No | ❌ No | ❌ No | ✅ All security | ❌ No | Security configuration |
| | Audit Logs | ❌ No | ❌ No | ❌ No | ✅ All logs | 📚 Batch logs | System audit trail |
| | System Monitoring | ❌ No | ❌ No | ❌ No | ✅ Full monitoring | ❌ No | System health monitoring |
| **📊 Analytics & Reporting** |
| | Revenue Analytics | ❌ No | ❌ No | ❌ No | ✅ All revenue | 📚 Batch revenue | Financial analytics |
| | User Analytics | ❌ No | ❌ No | ❌ No | ✅ All users | 📚 Batch users | User behavior analytics |
| | Performance Metrics | ✅ Own metrics | ✅ Teaching metrics | 👨‍👩‍👧‍👦 Children metrics | ✅ All metrics | 📚 Batch metrics | Performance measurement |
| | Custom Reports | ❌ No | ✅ Class reports | 👨‍👩‍👧‍👦 Children reports | ✅ All reports | 📚 Batch reports | Custom reporting |
| | Data Export | ✅ Own data | ✅ Teaching data | 👨‍👩‍👧‍👦 Children data | ✅ All data | 📚 Batch data | Data export functionality |

### Permission Legend
- ✅ **Full Access** - Complete functionality available
- 📋 **Limited Access** - Restricted to assigned/related items
- 👨‍👩‍👧‍👦 **Family Scope** - Access to children/family members only
- 📚 **Batch Scope** - Access limited to assigned batches
- 🏫 **Centre Scope** - Access limited to assigned centres
- 🌐 **Online Scope** - Access to online teaching features only
- 📅 **Schedule Access** - View/manage schedules
- ❌ **No Access** - Feature not available

### Feature Categories Summary

| **User Type** | **Primary Focus** | **Key Permissions** | **Access Scope** |
|---------------|-------------------|---------------------|------------------|
| **Student** | Learning & Progress | Own academic data, payment visibility, class participation | Personal scope only |
| **Teacher** | Teaching & Earnings | Class management, student progress, earnings tracking, online teaching | Assigned students/classes |
| **Parent** | Child Monitoring & Payments | Children's progress, payment management, teacher communication | Family scope |
| **Super Admin** | System Management | All features, user management, system configuration | Global access |
| **Batch Admin** | Batch Operations | Batch user management, batch analytics, batch payments | Assigned batches only |

### Access Control Matrix

| **Data Type** | **Student** | **Teacher** | **Parent** | **Super Admin** | **Batch Admin** |
|---------------|-------------|-------------|------------|-----------------|-----------------|
| **User Profiles** | Own only | Students only | Children only | All users | Batch users |
| **Academic Records** | Own only | Teaching students | Children only | All records | Batch records |
| **Payment Data** | Own payments | Own earnings | Family payments | All payments | Batch payments |
| **System Settings** | Read only | Read only | Read only | Full control | No access |
| **Analytics** | Personal | Teaching analytics | Family analytics | Global analytics | Batch analytics |

## Implementation Phases with UI Testing

### Phase-wise UI Testing Approach

#### Phase 1 Testing (Services & Infrastructure)
```javascript
// Test user service functions
describe('UserService', () => {
  test('creates user of each type', async () => {
    const userTypes = ['student', 'teacher', 'parent', 'admin'];
    for (const type of userTypes) {
      const user = await createUser(mockUserData, type);
      expect(user.userType).toBe(type);
    }
  });
});

// Test AuthContext enhancements
describe('AuthContext', () => {
  test('correctly identifies user types', () => {
    const { isStudent, isTeacher, isParent, isAdmin } = useAuth();
    // Test all combinations
  });
});
```

#### Phase 2 Testing (UI Components)
```javascript
// Test user type selector
describe('UserTypeSelector', () => {
  test('renders all user type options', () => {
    render(<UserTypeSelector options={['student', 'teacher', 'parent']} />);
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Teacher')).toBeInTheDocument();
    expect(screen.getByText('Parent')).toBeInTheDocument();
  });
});

// Test dynamic form fields
describe('Dynamic Form Fields', () => {
  test('shows correct fields for each user type', () => {
    const userTypes = ['student', 'teacher', 'parent'];
    userTypes.forEach(type => {
      render(<UserForm userType={type} />);
      // Assert type-specific fields are visible
    });
  });
});
```

#### Phase 3 Testing (Page Integration)
```javascript
// Test page access control
describe('Page Access Control', () => {
  test('redirects unauthorized users', () => {
    const routes = [
      { path: '/teacher-dashboard', allowedTypes: ['teacher', 'admin'] },
      { path: '/parent-payments', allowedTypes: ['parent', 'admin'] },
      { path: '/user-management', allowedTypes: ['admin'] }
    ];
    
    routes.forEach(route => {
      // Test access for each user type
    });
  });
});

// Test feature functionality by user type
describe('Feature Access by User Type', () => {
  test('video access follows user type rules', () => {
    const testCases = [
      { userType: 'student', expectedAccess: 'batch-based' },
      { userType: 'teacher', expectedAccess: 'assigned-batches' },
      { userType: 'parent', expectedAccess: 'children-batches' },
      { userType: 'admin', expectedAccess: 'all-videos' }
    ];
    
    testCases.forEach(testCase => {
      // Test video access logic
    });
  });
});
```

#### Phase 4 Testing (Data Migration)
```javascript
// Test data transformation
describe('Data Migration', () => {
  test('migrates student data correctly', async () => {
    const firestoreData = mockFirestoreStudents;
    const migratedData = await migrateStudentData(firestoreData);
    
    expect(migratedData).toHaveProperty('userType', 'student');
    expect(migratedData.profile).toHaveProperty('batch');
  });
  
  test('maintains data integrity', async () => {
    const originalCount = await getFirestoreStudentCount();
    await runMigration();
    const migratedCount = await getDynamoDBUserCount('student');
    
    expect(migratedCount).toBe(originalCount);
  });
});
```

#### Phase 5 Testing (End-to-End)
```javascript
// Complete user journey tests
describe('E2E User Journeys', () => {
  test('student registration to video access', async () => {
    // 1. Register as student
    await registerUser('student');
    
    // 2. Complete profile
    await fillStudentProfile();
    
    // 3. Login and access videos
    await loginAndAccessVideos();
    
    // 4. Verify batch-based access
    await verifyBatchAccess();
  });
  
  test('parent payment flow', async () => {
    // 1. Register as parent
    await registerUser('parent');
    
    // 2. Link children
    await linkChildren();
    
    // 3. Make payment
    await makePaymentForChild();
    
    // 4. Verify payment recorded
    await verifyPaymentRecorded();
  });
  
  test('teacher class management', async () => {
    // 1. Register as teacher
    await registerUser('teacher');
    
    // 2. Get assigned batches
    await getAssignedBatches();
    
    // 3. Mark attendance
    await markStudentAttendance();
    
    // 4. Verify attendance recorded
    await verifyAttendanceMarked();
  });
});

// Cross-user type interaction tests
describe('Cross-User Type Interactions', () => {
  test('parent-child data relationship', async () => {
    const parent = await createUser(parentData, 'parent');
    const child = await createUser(childData, 'student');
    
    await linkParentChild(parent.email, child.email);
    
    const parentProfile = await getUserProfile(parent.email);
    expect(parentProfile.profile.children).toContain(child.email);
  });
});
```

## Final Implementation Checklist

### Pre-Production Validation
- [ ] All user types can register successfully
- [ ] Authentication works for all user types
- [ ] Role-based access control functions correctly
- [ ] Data migration completed without loss
- [ ] Performance meets established benchmarks
- [ ] Security validation passed
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness confirmed
- [ ] Accessibility standards met
- [ ] Error handling comprehensive

### Post-Deployment Monitoring
- [ ] User registration success rates
- [ ] Authentication failure rates
- [ ] Page load times by user type
- [ ] Database query performance
- [ ] Error rates and exception handling
- [ ] User adoption of new features
- [ ] System stability metrics

This comprehensive plan provides a structured approach to achieve unified user management with DynamoDB storage while maintaining system stability and user experience. Each phase can be tested independently, ensuring quality and reliability throughout the implementation process.
