# MongoDB Migration Strategy: Parallel Implementation

## Overview
This document outlines the parallel implementation strategy for migrating from DynamoDB to MongoDB while maintaining zero regression and ensuring business continuity.

## Migration Goals
- ✅ Zero downtime during migration
- ✅ Zero regression in existing functionality
- ✅ Seamless rollback capability
- ✅ Data consistency between both systems
- ✅ Gradual migration with monitoring

## Current Architecture
- **Database**: DynamoDB (Primary)
- **Services**: `studentService.jsx`, `lectureNotesService.jsx`, `simulationService.jsx`
- **Components**: Multiple React components dependent on current data structure
- **Dependencies**: AWS SDK v3, DynamoDB client

## Target Architecture
- **Database**: MongoDB Multi-Tenant (Primary) + DynamoDB (Fallback)
- **Services**: MongoDB services with DynamoDB compatibility layer
- **Components**: No changes required
- **Dependencies**: Mongoose, MongoDB driver
- **Multi-Tenancy**: URL-based client identification and database routing

---

## Phase 1: Infrastructure Setup (Week 1-2)

### 1.1 MongoDB Setup
- [ ] Verify MongoDB instance at 35.206.106.193:27017 is accessible
- [ ] Test connection from your development environment
- [ ] Configure connection strings and environment variables
- [ ] Set up connection pooling and error handling
- [ ] Ensure MongoDB instance has appropriate security settings
- [ ] Create database user with appropriate permissions (if authentication enabled)

### 1.2 Environment Configuration
```bash
# Add to .env file
# MongoDB connection (without database name - will be determined dynamically)
REACT_APP_MONGODB_URI=mongodb://35.206.106.193:27017

# Multi-tenant configuration
REACT_APP_MULTI_TENANT=true
REACT_APP_DEFAULT_CLIENT=vedic_maths_india

# Feature flags
REACT_APP_USE_MONGODB=false  # Feature flag for gradual rollout
REACT_APP_MIGRATION_MODE=parallel  # parallel, mongodb-only, dynamodb-only
```

### 1.3 Dependencies Installation
```bash
# Already installed based on package.json
npm install mongodb mongoose
```

### 1.4 Multi-Tenant Architecture Design

#### **Client Database Naming Convention**
```bash
# Database naming pattern: client_{clientIdentifier}
# Examples:
client_zenith_edu          # For zenith.edu
client_vedic_maths_india   # For vedicmathsindia.com
client_math_academy        # For mathacademy.com
```

#### **URL-Based Client Detection**
```javascript
// src/utils/clientDetector.js
export class ClientDetector {
  static getClientFromURL() {
    const hostname = window.location.hostname;
    
    // Map hostnames to client identifiers
    const clientMap = {
      'zenith.edu': 'zenith_edu',
      'vedicmathsindia.com': 'vedic_maths_india',
      'mathacademy.com': 'math_academy',
      'localhost': 'dev_client', // Development
      '127.0.0.1': 'dev_client'  // Development
    };
    
    return clientMap[hostname] || 'default_client';
  }
  
  static getDatabaseName() {
    const clientId = this.getClientFromURL();
    return `client_${clientId}`;
  }
  
  static getClientConfig() {
    const clientId = this.getClientFromURL();
    
    // Client-specific configurations
    const clientConfigs = {
      'zenith_edu': {
        name: 'Zenith Education',
        theme: 'zenith',
        logo: '/logos/zenith.png',
        primaryColor: '#1e40af',
        features: ['students', 'teachers', 'admin']
      },
      'vedic_maths_india': {
        name: 'Vedic Maths India',
        theme: 'vedic',
        logo: '/logos/vedic.png',
        primaryColor: '#dc2626',
        features: ['students', 'simulations', 'videos']
      },
      'math_academy': {
        name: 'Math Academy',
        theme: 'academy',
        logo: '/logos/academy.png',
        primaryColor: '#059669',
        features: ['students', 'courses', 'assessments']
      }
    };
    
    return clientConfigs[clientId] || clientConfigs['default_client'];
  }
}
```

### 1.5 Local MongoDB Setup Considerations
Since you're using a local MongoDB instance at `35.206.106.193:27017`, consider the following:

#### **Network Access**
- Ensure your development machine can reach the MongoDB instance
- Check firewall settings on the MongoDB server
- Verify network connectivity: `telnet 35.206.106.193 27017`

#### **Security Configuration**
- If authentication is enabled, update connection string:
  ```bash
  REACT_APP_MONGODB_URI=mongodb://username:password@35.206.106.193:27017/vedicmaths
  ```
- If no authentication, ensure MongoDB is not exposed to public internet
- Consider using VPN or private network for production

#### **Connection Testing**
```bash
# Test connection using MongoDB shell
# Option 1: With database name in URI
mongosh mongodb://35.206.106.193:27017/vedicmaths

# Option 2: Without database name (will connect to 'test' database by default)
mongosh mongodb://35.206.106.193:27017

# Test connection using Node.js
node -e "
const { MongoClient } = require('mongodb');

// Option 1: Database name in URI
const client1 = new MongoClient('mongodb://35.206.106.193:27017/vedicmaths');
client1.connect().then(() => {
  console.log('✅ MongoDB connection successful with database: vedicmaths');
  client1.close();
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err);
});

// Option 2: Database name in options
const client2 = new MongoClient('mongodb://35.206.106.193:27017', {
  dbName: 'vedicmaths'
});
client2.connect().then(() => {
  console.log('✅ MongoDB connection successful with database: vedicmaths');
  client2.close();
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err);
});
"
```

---

## Phase 2: MongoDB Schema Design (Week 2)

### 2.1 Student Schema
```javascript
// src/models/Student.js
const studentSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    index: true 
  },
  name: { type: String, required: true },
  batch: { type: String, required: true },
  centres: [String],
  subjects: [String],
  enrollmentDate: Date,
  imageUrl: String,
  class: String,
  board: String,
  mobile: String,
  address: String,
  status: { 
    type: String, 
    default: 'inactive',
    enum: ['active', 'inactive', 'suspended']
  },
  dob: String,
  school: String,
  amountPending: { type: Number, default: 0 },
  paymentType: { type: String, default: 'lumpsum' },
  payments: [Object],
  monthlyInstallment: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
  chatIds: [String],
  attendance: Object
}, {
  timestamps: true
});

// Virtual fields for DynamoDB compatibility
studentSchema.virtual('PK').get(function() {
  return 'STUDENT#ALL';
});

studentSchema.virtual('SK').get(function() {
  return `STUDENT#${this.email}`;
});

studentSchema.virtual('GSI1PK').get(function() {
  return `BATCH#${this.batch}`;
});

studentSchema.virtual('GSI1SK').get(function() {
  return `STUDENT#${this.email}`;
});

// Ensure virtual fields are included in JSON
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// Indexes for performance
studentSchema.index({ email: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ centres: 1 });
```

---

## Phase 3: MongoDB Service Implementation (Week 3-4)

### 3.1 Multi-Tenant MongoDB Connection Setup
```javascript
// src/services/multiTenantMongoDBConnection.js
import mongoose from 'mongoose';
import { ClientDetector } from '../utils/clientDetector';

class MultiTenantMongoDBConnection {
  constructor() {
    this.connections = new Map(); // Store connections per client
    this.defaultConnection = null;
  }

  async connect(clientId = null) {
    try {
      // Determine client ID if not provided
      const targetClientId = clientId || ClientDetector.getClientFromURL();
      const databaseName = `client_${targetClientId}`;
      
      // Check if connection already exists for this client
      if (this.connections.has(targetClientId)) {
        return this.connections.get(targetClientId);
      }

      const uri = process.env.REACT_APP_MONGODB_URI;
      
      // Create new connection for this client
      const connection = await mongoose.createConnection(uri, {
        dbName: databaseName,
        maxPoolSize: 5, // Smaller pool per client
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      // Store connection
      this.connections.set(targetClientId, connection);
      
      console.log(`✅ MongoDB connected for client: ${targetClientId} (${databaseName})`);
      return connection;
    } catch (error) {
      console.error(`❌ MongoDB connection failed for client ${clientId}:`, error);
      throw error;
    }
  }

  async getConnection(clientId = null) {
    const targetClientId = clientId || ClientDetector.getClientFromURL();
    
    if (!this.connections.has(targetClientId)) {
      await this.connect(targetClientId);
    }
    
    return this.connections.get(targetClientId);
  }

  async disconnect(clientId = null) {
    if (clientId) {
      // Disconnect specific client
      if (this.connections.has(clientId)) {
        await this.connections.get(clientId).disconnect();
        this.connections.delete(clientId);
        console.log(`✅ MongoDB disconnected for client: ${clientId}`);
      }
    } else {
      // Disconnect all clients
      for (const [clientId, connection] of this.connections) {
        await connection.disconnect();
        console.log(`✅ MongoDB disconnected for client: ${clientId}`);
      }
      this.connections.clear();
    }
  }

  async createClientDatabase(clientId) {
    try {
      const connection = await this.connect(clientId);
      const db = connection.db;
      
      // Create initial collections
      await db.createCollection('students');
      await db.createCollection('lectureNotes');
      await db.createCollection('simulations');
      
      console.log(`✅ Created database structure for client: ${clientId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create database for client ${clientId}:`, error);
      throw error;
    }
  }

  async listClientDatabases() {
    try {
      // Use default connection to list databases
      if (!this.defaultConnection) {
        const uri = process.env.REACT_APP_MONGODB_URI;
        this.defaultConnection = await mongoose.createConnection(uri);
      }
      
      const adminDb = this.defaultConnection.db.admin();
      const databases = await adminDb.listDatabases();
      
      // Filter client databases
      const clientDatabases = databases.databases.filter(db => 
        db.name.startsWith('client_')
      );
      
      return clientDatabases;
    } catch (error) {
      console.error('❌ Failed to list client databases:', error);
      throw error;
    }
  }

  async migrateClientData(sourceClientId, targetClientId) {
    try {
      const sourceConnection = await this.getConnection(sourceClientId);
      const targetConnection = await this.getConnection(targetClientId);
      
      // Migrate collections
      const collections = ['students', 'lectureNotes', 'simulations'];
      
      for (const collectionName of collections) {
        const sourceCollection = sourceConnection.db.collection(collectionName);
        const targetCollection = targetConnection.db.collection(collectionName);
        
        const documents = await sourceCollection.find({}).toArray();
        if (documents.length > 0) {
          await targetCollection.insertMany(documents);
          console.log(`✅ Migrated ${documents.length} documents for ${collectionName}`);
        }
      }
      
      console.log(`✅ Data migration completed from ${sourceClientId} to ${targetClientId}`);
    } catch (error) {
      console.error(`❌ Data migration failed:`, error);
      throw error;
    }
  }
}

export const multiTenantMongoDBConnection = new MultiTenantMongoDBConnection();
```

---

## Phase 3.5: White-Label Configuration (Week 4)

### 3.5.1 Client Theme Configuration
```javascript
// src/config/clientThemes.js
export const CLIENT_THEMES = {
  'zenith_edu': {
    name: 'Zenith Education',
    logo: '/logos/zenith.png',
    favicon: '/favicons/zenith.ico',
    faviconType: 'image/x-icon',
    pageTitle: 'Zenith Education - Student Management System',
    pageDescription: 'Comprehensive student management system for Zenith Education',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    accentColor: '#fbbf24',
    fontFamily: 'Inter, sans-serif',
    customCSS: `
      :root {
        --primary-color: #1e40af;
        --secondary-color: #3b82f6;
        --accent-color: #fbbf24;
      }
    `
  },
  'vedic_maths_india': {
    name: 'Vedic Maths India',
    logo: '/logos/vedic.png',
    favicon: '/favicons/vedic.ico',
    faviconType: 'image/x-icon',
    pageTitle: 'Vedic Maths India - Learning Platform',
    pageDescription: 'Advanced Vedic Mathematics learning platform with simulations',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    accentColor: '#f59e0b',
    fontFamily: 'Poppins, sans-serif',
    customCSS: `
      :root {
        --primary-color: #dc2626;
        --secondary-color: #ef4444;
        --accent-color: #f59e0b;
      }
    `
  },
  'math_academy': {
    name: 'Math Academy',
    logo: '/logos/academy.png',
    favicon: '/favicons/academy.ico',
    faviconType: 'image/x-icon',
    pageTitle: 'Math Academy - Interactive Learning',
    pageDescription: 'Interactive mathematics learning with progress tracking',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    accentColor: '#84cc16',
    fontFamily: 'Roboto, sans-serif',
    customCSS: `
      :root {
        --primary-color: #059669;
        --secondary-color: #10b981;
        --accent-color: #84cc16;
      }
    `
  }
};
```

### 3.5.2 Dynamic Theme Application
```javascript
// src/hooks/useClientTheme.js
import { useEffect, useState } from 'react';
import { ClientDetector } from '../utils/clientDetector';
import { CLIENT_THEMES } from '../config/clientThemes';

export const useClientTheme = () => {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientId = ClientDetector.getClientFromURL();
    const clientTheme = CLIENT_THEMES[clientId] || CLIENT_THEMES['vedic_maths_india'];
    
    // Apply theme to document
    document.documentElement.style.setProperty('--primary-color', clientTheme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', clientTheme.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', clientTheme.accentColor);
    document.documentElement.style.setProperty('--font-family', clientTheme.fontFamily);
    
    // Update favicon with multiple formats support
    updateFavicon(clientTheme);
    
    // Update page title and meta tags
    updatePageMetadata(clientTheme);
    
    setTheme(clientTheme);
    setLoading(false);
  }, []);

  return { theme, loading };
};

// Function to update favicon with multiple formats
const updateFavicon = (theme) => {
  // Remove existing favicon links
  const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
  existingFavicons.forEach(link => link.remove());
  
  // Add new favicon links
  const faviconLink = document.createElement('link');
  faviconLink.rel = 'icon';
  faviconLink.type = theme.faviconType || 'image/x-icon';
  faviconLink.href = theme.favicon;
  document.head.appendChild(faviconLink);
  
  // Add Apple touch icon if available
  if (theme.appleTouchIcon) {
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = theme.appleTouchIcon;
    document.head.appendChild(appleTouchIcon);
  }
  
  // Add manifest if available
  if (theme.manifest) {
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = theme.manifest;
    document.head.appendChild(manifestLink);
  }
};

// Function to update page metadata
const updatePageMetadata = (theme) => {
  // Update page title
  document.title = theme.pageTitle || theme.name;
  
  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    document.head.appendChild(metaDescription);
  }
  metaDescription.content = theme.pageDescription || '';
  
  // Update Open Graph tags
  updateOpenGraphTags(theme);
  
  // Update Twitter Card tags
  updateTwitterCardTags(theme);
};

// Function to update Open Graph tags
const updateOpenGraphTags = (theme) => {
  const ogTags = {
    'og:title': theme.pageTitle || theme.name,
    'og:description': theme.pageDescription || '',
    'og:image': theme.logo || '',
    'og:site_name': theme.name,
    'og:type': 'website'
  };
  
  Object.entries(ogTags).forEach(([property, content]) => {
    let metaTag = document.querySelector(`meta[property="${property}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', property);
      document.head.appendChild(metaTag);
    }
    metaTag.content = content;
  });
};

// Function to update Twitter Card tags
const updateTwitterCardTags = (theme) => {
  const twitterTags = {
    'twitter:card': 'summary_large_image',
    'twitter:title': theme.pageTitle || theme.name,
    'twitter:description': theme.pageDescription || '',
    'twitter:image': theme.logo || ''
  };
  
  Object.entries(twitterTags).forEach(([name, content]) => {
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = name;
      document.head.appendChild(metaTag);
    }
    metaTag.content = content;
  });
};
```

### 3.5.3 Favicon and Metadata File Management

#### **Favicon File Structure**
```bash
public/
├── favicons/
│   ├── zenith.ico          # Zenith Education favicon
│   ├── vedic.ico          # Vedic Maths India favicon
│   ├── academy.ico        # Math Academy favicon
│   └── default.ico        # Default favicon
├── logos/
│   ├── zenith.png         # Zenith Education logo
│   ├── vedic.png          # Vedic Maths India logo
│   ├── academy.png        # Math Academy logo
│   └── default.png        # Default logo
└── manifests/
    ├── zenith.json        # Zenith Education PWA manifest
    ├── vedic.json         # Vedic Maths India PWA manifest
    └── academy.json       # Math Academy PWA manifest
```

#### **PWA Manifest Example**
```json
// public/manifests/zenith.json
{
  "name": "Zenith Education - Student Management",
  "short_name": "Zenith",
  "description": "Comprehensive student management system",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1e40af",
  "theme_color": "#1e40af",
  "icons": [
    {
      "src": "/logos/zenith.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logos/zenith.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### **Enhanced Client Theme Configuration**
```javascript
// src/config/enhancedClientThemes.js
export const ENHANCED_CLIENT_THEMES = {
  'zenith_edu': {
    name: 'Zenith Education',
    logo: '/logos/zenith.png',
    favicon: '/favicons/zenith.ico',
    faviconType: 'image/x-icon',
    appleTouchIcon: '/logos/zenith-180x180.png',
    manifest: '/manifests/zenith.json',
    pageTitle: 'Zenith Education - Student Management System',
    pageDescription: 'Comprehensive student management system for Zenith Education',
    keywords: 'education, student management, zenith, learning',
    author: 'Zenith Education',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    accentColor: '#fbbf24',
    fontFamily: 'Inter, sans-serif',
    customCSS: `
      :root {
        --primary-color: #1e40af;
        --secondary-color: #3b82f6;
        --accent-color: #fbbf24;
      }
    `
  },
  'vedic_maths_india': {
    name: 'Vedic Maths India',
    logo: '/logos/vedic.png',
    favicon: '/favicons/vedic.ico',
    faviconType: 'image/x-icon',
    appleTouchIcon: '/logos/vedic-180x180.png',
    manifest: '/manifests/vedic.json',
    pageTitle: 'Vedic Maths India - Learning Platform',
    pageDescription: 'Advanced Vedic Mathematics learning platform with simulations',
    keywords: 'vedic maths, mathematics, learning, simulations',
    author: 'Vedic Maths India',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    accentColor: '#f59e0b',
    fontFamily: 'Poppins, sans-serif',
    customCSS: `
      :root {
        --primary-color: #dc2626;
        --secondary-color: #ef4444;
        --accent-color: #f59e0b;
      }
    `
  }
};
```

### 3.5.4 Dynamic Page Title Management

#### **Page-Specific Title Configuration**
```javascript
// src/config/pageTitles.js
export const PAGE_TITLES = {
  'zenith_edu': {
    '/': 'Zenith Education - Student Management System',
    '/students': 'Students - Zenith Education',
    '/teachers': 'Teachers - Zenith Education',
    '/admin': 'Admin Dashboard - Zenith Education',
    '/reports': 'Reports - Zenith Education',
    '/analytics': 'Analytics - Zenith Education'
  },
  'vedic_maths_india': {
    '/': 'Vedic Maths India - Learning Platform',
    '/students': 'Students - Vedic Maths India',
    '/videos': 'Video Library - Vedic Maths India',
    '/simulations': 'Simulations - Vedic Maths India',
    '/exams': 'Exams - Vedic Maths India',
    '/attendance': 'Attendance - Vedic Maths India'
  },
  'math_academy': {
    '/': 'Math Academy - Interactive Learning',
    '/students': 'Students - Math Academy',
    '/courses': 'Courses - Math Academy',
    '/assessments': 'Assessments - Math Academy',
    '/progress': 'Progress Tracking - Math Academy'
  }
};

// Function to get page-specific title
export const getPageTitle = (clientId, pathname) => {
  const clientTitles = PAGE_TITLES[clientId];
  if (!clientTitles) return 'Default Title';
  
  return clientTitles[pathname] || clientTitles['/'] || 'Default Title';
};
```

#### **Enhanced useClientTheme Hook with Page Titles**
```javascript
// src/hooks/useClientThemeWithPages.js
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ClientDetector } from '../utils/clientDetector';
import { ENHANCED_CLIENT_THEMES } from '../config/enhancedClientThemes';
import { getPageTitle } from '../config/pageTitles';

export const useClientThemeWithPages = () => {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const clientId = ClientDetector.getClientFromURL();
    const clientTheme = ENHANCED_CLIENT_THEMES[clientId] || ENHANCED_CLIENT_THEMES['vedic_maths_india'];
    
    // Apply theme to document
    document.documentElement.style.setProperty('--primary-color', clientTheme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', clientTheme.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', clientTheme.accentColor);
    document.documentElement.style.setProperty('--font-family', clientTheme.fontFamily);
    
    // Update favicon and metadata
    updateFavicon(clientTheme);
    updatePageMetadata(clientTheme);
    
    setTheme(clientTheme);
    setLoading(false);
  }, []);

  // Update page title when route changes
  useEffect(() => {
    if (theme) {
      const clientId = ClientDetector.getClientFromURL();
      const pageTitle = getPageTitle(clientId, location.pathname);
      document.title = pageTitle;
      
      // Update meta description for the specific page
      updatePageDescription(theme, location.pathname);
    }
  }, [location.pathname, theme]);

  return { theme, loading };
};

// Function to update page description based on current page
const updatePageDescription = (theme, pathname) => {
  const pageDescriptions = {
    '/students': 'Manage student information, enrollment, and progress',
    '/videos': 'Access comprehensive video library for learning',
    '/simulations': 'Interactive simulations for hands-on learning',
    '/exams': 'Take assessments and track performance',
    '/attendance': 'Monitor student attendance and participation'
  };
  
  const description = pageDescriptions[pathname] || theme.pageDescription;
  
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    document.head.appendChild(metaDescription);
  }
  metaDescription.content = description;
};
```

### 3.5.5 Client-Specific Features
```javascript
// src/config/clientFeatures.js
export const CLIENT_FEATURES = {
  'zenith_edu': {
    modules: ['students', 'teachers', 'admin', 'reports', 'analytics'],
    permissions: {
      students: ['read', 'write', 'delete'],
      teachers: ['read', 'write'],
      admin: ['read', 'write', 'delete', 'manage_users']
    },
    integrations: ['zoom', 'google_meet', 'stripe'],
    customFields: {
      students: ['parent_contact', 'emergency_contact', 'medical_info'],
      teachers: ['qualifications', 'specializations', 'availability']
    }
  },
  'vedic_maths_india': {
    modules: ['students', 'videos', 'simulations', 'exams', 'attendance'],
    permissions: {
      students: ['read', 'write'],
      videos: ['read', 'write', 'delete'],
      simulations: ['read', 'write', 'delete']
    },
    integrations: ['youtube', 'vimeo', 'dropbox'],
    customFields: {
      students: ['batch', 'centres', 'subjects', 'attendance'],
      videos: ['subject', 'topic', 'difficulty', 'duration']
    }
  },
  'math_academy': {
    modules: ['students', 'courses', 'assessments', 'progress_tracking'],
    permissions: {
      students: ['read', 'write'],
      courses: ['read', 'write', 'delete'],
      assessments: ['read', 'write', 'delete']
    },
    integrations: ['canvas', 'blackboard', 'paypal'],
    customFields: {
      students: ['grade_level', 'learning_style', 'goals'],
      courses: ['curriculum', 'prerequisites', 'objectives']
    }
  }
};
```

---

## Phase 4: Compatibility Layer (Week 4-5)

### 4.1 DynamoDB Compatibility Adapter
```javascript
// src/services/adapters/dynamoDBCompatibilityAdapter.js
export class DynamoDBCompatibilityAdapter {
  static transformStudentToDynamoDBFormat(mongoStudent) {
    if (!mongoStudent) return null;
    
    return {
      PK: 'STUDENT#ALL',
      SK: `STUDENT#${mongoStudent.email}`,
      name: mongoStudent.name,
      email: mongoStudent.email,
      batch: mongoStudent.batch,
      centres: mongoStudent.centres || [],
      subjects: mongoStudent.subjects || [],
      enrollmentDate: mongoStudent.enrollmentDate,
      imageUrl: mongoStudent.imageUrl || '',
      class: mongoStudent.class || '',
      board: mongoStudent.board || '',
      mobile: mongoStudent.mobile || '',
      address: mongoStudent.address || '',
      status: mongoStudent.status || 'inactive',
      dob: mongoStudent.dob || '',
      school: mongoStudent.school || '',
      amountPending: mongoStudent.amountPending || 0,
      paymentType: mongoStudent.paymentType || 'lumpsum',
      payments: mongoStudent.payments || [],
      monthlyInstallment: mongoStudent.monthlyInstallment || 0,
      updatedAt: mongoStudent.updatedAt?.toISOString() || new Date().toISOString(),
      chatIds: mongoStudent.chatIds || [],
      attendance: mongoStudent.attendance || {},
      GSI1PK: `BATCH#${mongoStudent.batch}`,
      GSI1SK: `STUDENT#${mongoStudent.email}`,
    };
  }

  static transformArrayToDynamoDBFormat(mongoStudents) {
    return mongoStudents.map(student => 
      this.transformStudentToDynamoDBFormat(student)
    );
  }
}
```

---

## Phase 5: Service Integration (Week 5-6)

### 5.1 Update Service Exports
```javascript
// src/services/studentService.jsx
// Replace existing exports with hybrid service

// Import hybrid service
import { hybridStudentService } from './hybridStudentService';

// Export hybrid service functions
export const upsertStudent = hybridStudentService.upsertStudent.bind(hybridStudentService);
export const getStudentByEmail = hybridStudentService.getStudentByEmail.bind(hybridStudentService);
export const getStudentsByBatch = hybridStudentService.getStudentsByBatch.bind(hybridStudentService);
export const getAllStudents = hybridStudentService.getAllStudents.bind(hybridStudentService);
export const updateStudentStatus = hybridStudentService.updateStudentStatus.bind(hybridStudentService);
export const deleteStudent = hybridStudentService.deleteStudent.bind(hybridStudentService);
export const updateStudentAttendance = hybridStudentService.updateStudentAttendance.bind(hybridStudentService);

// Keep existing DynamoDB-specific functions for fallback
export const ensureStudentTableExists = async () => {
  // This function is no longer needed for MongoDB
  // Keep for backward compatibility
  console.log('Table creation not needed for MongoDB');
  return true;
};
```

---

## Phase 6: Data Migration (Week 6-7)

### 6.1 Data Export Script
```javascript
// scripts/exportDynamoDBData.js
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import fs from 'fs';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

async function exportTableData(tableName) {
  const items = [];
  let lastEvaluatedKey = undefined;
  
  do {
    const params = {
      TableName: tableName,
      ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
    };
    
    const result = await docClient.send(new ScanCommand(params));
    items.push(...result.Items);
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  
  return items;
}

async function exportAllData() {
  const tables = ['Students', 'LectureNotes', 'Simulations'];
  
  for (const table of tables) {
    console.log(`Exporting data from ${table}...`);
    const data = await exportTableData(table);
    
    const filename = `./exports/${table.toLowerCase()}_data.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Exported ${data.length} items to ${filename}`);
  }
}

exportAllData().catch(console.error);
```

---

## Phase 7: Testing & Validation (Week 7-8)

### 7.1 Unit Tests
```javascript
// src/tests/services/hybridStudentService.test.js
import { hybridStudentService } from '../../services/hybridStudentService';

describe('Hybrid Student Service', () => {
  beforeEach(() => {
    // Mock environment variables
    process.env.REACT_APP_USE_MONGODB = 'true';
    process.env.REACT_APP_MIGRATION_MODE = 'parallel';
  });

  test('getStudentByEmail returns DynamoDB compatible format', async () => {
    const student = await hybridStudentService.getStudentByEmail('test@example.com');
    
    expect(student).toHaveProperty('PK');
    expect(student).toHaveProperty('SK');
    expect(student).toHaveProperty('email');
    expect(student).toHaveProperty('name');
    expect(student.PK).toBe('STUDENT#ALL');
    expect(student.SK).toMatch(/^STUDENT#/);
  });
});
```

---

## Phase 8: Gradual Rollout (Week 8-9)

### 8.1 Feature Flag Strategy
```javascript
// src/config/featureFlags.js
export const FEATURE_FLAGS = {
  USE_MONGODB: process.env.REACT_APP_USE_MONGODB === 'true',
  MIGRATION_MODE: process.env.REACT_APP_MIGRATION_MODE || 'parallel',
  MONGODB_READ_ONLY: process.env.REACT_APP_MONGODB_READ_ONLY === 'true',
  MONGODB_WRITE_ENABLED: process.env.REACT_APP_MONGODB_WRITE_ENABLED === 'true'
};
```

### 8.2 Rollout Phases
1. **Phase 1: Read-Only MongoDB (Week 8)**
   - Enable MongoDB for read operations only
   - Keep DynamoDB for all write operations
   - Monitor read performance and accuracy

2. **Phase 2: Parallel Writes (Week 9)**
   - Enable MongoDB for write operations
   - Write to both MongoDB and DynamoDB
   - Monitor data consistency between systems

3. **Phase 3: MongoDB Primary (Week 10)**
   - Switch to MongoDB as primary
   - Keep DynamoDB as backup
   - Monitor system performance

---

## Phase 8.5: Client Management & Administration (Week 9)

### 8.5.1 Client Management Dashboard
```javascript
// src/components/ClientManagementDashboard.jsx
import React, { useState, useEffect } from 'react';
import { multiTenantMongoDBConnection } from '../services/multiTenantMongoDBConnection';
import { ClientDetector } from '../utils/clientDetector';

const ClientManagementDashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const databases = await multiTenantMongoDBConnection.listClientDatabases();
      setClients(databases);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load clients:', error);
      setLoading(false);
    }
  };

  const createNewClient = async (clientId, clientName) => {
    try {
      await multiTenantMongoDBConnection.createClientDatabase(clientId);
      await loadClients();
      console.log(`✅ Created new client: ${clientName}`);
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  const migrateClientData = async (sourceClientId, targetClientId) => {
    try {
      await multiTenantMongoDBConnection.migrateClientData(sourceClientId, targetClientId);
      console.log(`✅ Data migration completed`);
    } catch (error) {
      console.error('Data migration failed:', error);
    }
  };

  if (loading) return <div>Loading clients...</div>;

  return (
    <div className="client-management-dashboard">
      <h2>Client Management</h2>
      
      <div className="clients-list">
        {clients.map(client => (
          <div key={client.name} className="client-card">
            <h3>{client.name}</h3>
            <p>Size: {(client.sizeOnDisk / 1024 / 1024).toFixed(2)} MB</p>
            <p>Collections: {client.collections || 'N/A'}</p>
            <button onClick={() => migrateClientData(client.name, 'new_client')}>
              Migrate Data
            </button>
          </div>
        ))}
      </div>
      
      <div className="create-client-form">
        <h3>Create New Client</h3>
        <input type="text" placeholder="Client ID" id="newClientId" />
        <input type="text" placeholder="Client Name" id="newClientName" />
        <button onClick={() => {
          const clientId = document.getElementById('newClientId').value;
          const clientName = document.getElementById('newClientName').value;
          createNewClient(clientId, clientName);
        }}>
          Create Client
        </button>
      </div>
    </div>
  );
};

export default ClientManagementDashboard;
```

### 8.5.2 Client Configuration Management
```javascript
// src/services/clientConfigurationService.js
import { multiTenantMongoDBConnection } from './multiTenantMongoDBConnection';

class ClientConfigurationService {
  async getClientConfig(clientId) {
    const connection = await multiTenantMongoDBConnection.getConnection(clientId);
    const configCollection = connection.db.collection('client_config');
    
    const config = await configCollection.findOne({ _id: 'main_config' });
    return config || this.getDefaultConfig(clientId);
  }

  async updateClientConfig(clientId, updates) {
    const connection = await multiTenantMongoDBConnection.getConnection(clientId);
    const configCollection = connection.db.collection('client_config');
    
    const result = await configCollection.updateOne(
      { _id: 'main_config' },
      { $set: updates },
      { upsert: true }
    );
    
    return result;
  }

  async getDefaultConfig(clientId) {
    // Return default configuration based on client ID
    const defaultConfigs = {
      'zenith_edu': {
        theme: 'zenith',
        features: ['students', 'teachers', 'admin'],
        integrations: ['zoom', 'stripe']
      },
      'vedic_maths_india': {
        theme: 'vedic',
        features: ['students', 'videos', 'simulations'],
        integrations: ['youtube', 'dropbox']
      }
    };
    
    return defaultConfigs[clientId] || defaultConfigs['vedic_maths_india'];
  }
}

export const clientConfigurationService = new ClientConfigurationService();
```

---

## Phase 9: Monitoring & Rollback (Ongoing)

### 9.1 Health Checks
```javascript
// src/services/healthCheck.js
export class HealthCheckService {
  static async checkMongoDBHealth() {
    try {
      await mongoDBConnection.connect();
      const result = await mongoDBConnection.getConnection().db.admin().ping();
      return { status: 'healthy', response: result };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
```

### 9.2 Rollback Procedures
```javascript
// src/services/rollbackService.js
export class RollbackService {
  static async rollbackToDynamoDB() {
    // Disable MongoDB
    process.env.REACT_APP_USE_MONGODB = 'false';
    
    // Verify DynamoDB connectivity
    // Test critical operations
    
    console.log('Rollback to DynamoDB completed');
  }
}
```

---

## Risk Mitigation

### **High-Risk Scenarios**
1. **Data Loss During Migration**
   - **Mitigation**: Parallel writes, comprehensive backups, rollback procedures

2. **Performance Degradation**
   - **Mitigation**: Performance testing, gradual rollout, monitoring

3. **Data Inconsistency**
   - **Mitigation**: Data validation scripts, consistency checks

### **Rollback Triggers**
- Data inconsistency > 1%
- Performance degradation > 20%
- Error rate > 5%
- User complaints > 10%

---

## Success Metrics

### **Technical Metrics**
- Zero data loss
- < 100ms response time increase
- < 1% error rate
- 100% data consistency

### **Business Metrics**
- Zero downtime
- Zero user complaints
- Improved query performance
- Reduced operational costs

---

## Timeline Summary

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1-2 | Infrastructure Setup | MongoDB setup, multi-tenant config |
| 2 | Schema Design | MongoDB schemas with compatibility |
| 3-4 | MongoDB Services | Multi-tenant MongoDB services |
| 4 | White-Label Config | Client themes, features, branding |
| 4-5 | Compatibility Layer | DynamoDB compatibility adapter |
| 5-6 | Service Integration | Hybrid service implementation |
| 6-7 | Data Migration | Multi-tenant data export/import |
| 7-8 | Testing | Unit, integration, regression tests |
| 8-9 | Gradual Rollout | Feature flags, phased rollout |
| 9 | Client Management | Client dashboard, configuration |
| 9-10 | Monitoring | Health checks, performance monitoring |
| 10-11 | Cleanup | Remove DynamoDB dependencies |
| 11-12 | Optimization | Performance tuning, final cleanup |

---

## Next Steps

1. **Immediate Actions**
   - Set up MongoDB instance
   - Create development environment
   - Begin schema design

2. **Week 1-2**
   - Complete infrastructure setup
   - Create MongoDB schemas
   - Set up development workflow

3. **Week 3-4**
   - Implement MongoDB services
   - Create compatibility layer
   - Begin testing

4. **Week 5-6**
   - Complete service integration
   - Implement data migration
   - Comprehensive testing

5. **Week 7-8**
   - Gradual rollout
   - Monitor performance
   - Address any issues

This parallel implementation strategy ensures zero regression while providing a safe migration path with multiple fallback options.

---

## Multi-Tenant Deployment Considerations

### **Domain Configuration**
```bash
# Example domain mappings for different clients
zenith.edu → client_zenith_edu database
vedicmathsindia.com → client_vedic_maths_india database
mathacademy.com → client_math_academy database
localhost:3000 → client_dev_client database (development)
```

### **Database Isolation**
- **Separate Databases**: Each client gets their own database (`client_{clientId}`)
- **Connection Pooling**: Separate connection pools per client for performance
- **Data Segregation**: Complete data isolation between clients
- **Backup Strategy**: Individual database backups per client

### **Scaling Strategy**
- **Horizontal Scaling**: Add more MongoDB instances as needed
- **Client Distribution**: Distribute clients across different MongoDB servers
- **Load Balancing**: Route client requests based on load
- **Monitoring**: Per-client performance and usage metrics

### **Security Considerations**
- **Network Isolation**: Ensure MongoDB is not exposed to public internet
- **Client Authentication**: Separate authentication per client if needed
- **Data Encryption**: Encrypt data at rest and in transit
- **Access Control**: Role-based access control per client

### **Backup & Recovery**
- **Per-Client Backups**: Individual backup schedules per client
- **Point-in-Time Recovery**: Restore specific client data to specific time
- **Cross-Client Migration**: Tools for migrating data between clients
- **Disaster Recovery**: Client-specific recovery procedures

This multi-tenant architecture provides a scalable, secure, and maintainable solution for white-labeling your application across multiple clients while maintaining complete data isolation and customization capabilities.
