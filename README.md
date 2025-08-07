# Zenith LMS - Learning Management System

## How Our Application Uses AWS Lambda

### 1. **Lambda Function URLs for API Endpoints**
- **CRUD Operations**: All database operations (Create, Read, Update, Delete) are handled through Lambda Function URLs
- **Benefits**: Direct HTTP endpoints without API Gateway, reduced latency, simplified architecture
- **Implementation**: Separate functions for user management, course management, content management

### 2. **AI Content Generation**
- **Video Processing**: Lambda functions analyze uploaded video content
- **Note Generation**: AI models running on Lambda extract key concepts and generate study materials
- **Question Generation**: Automated creation of quiz questions based on video content
- **Scalability**: Functions scale automatically based on video upload volume

### 3. **Payment Processing & Receipt Generation**
- **Multi-Modal Payment System**: Supports Cash, Cheque, and Online payment methods
- **Receipt Generation**: Automatic generation of professional receipts with unique registration numbers
- **Data Storage**: Dual storage system using Firestore and DynamoDB for redundancy
- **Payment Tracking**: Comprehensive payment history with pending amount calculations
- **Receipt Management**: 
  - Print-to-PDF functionality
  - Receipt reprinting capabilities
  - Excel export with filtering options
  - Payment mode tracking (Cash/Cheque/Online)
- **Student Payment History**: Maintains complete payment records per student
- **Compliance**: Secure payment data handling with audit trails

### 4. **Event-Driven Notifications**
- **EventBridge Integration**: Events trigger Lambda functions for notifications
- **Multiple Channels**: Email, push notifications, and Telegram integration
- **Event Types**: 
  - Exam scheduling notifications
  - Attendance alerts
  - Student enrollment confirmations
  - Assignment deadlines
  - Payment confirmations

### 5. **Serverless Architecture Benefits**
- **Cost Efficiency**: Pay only for actual usage
- **Auto Scaling**: Handles traffic spikes automatically
- **High Availability**: Built-in redundancy and fault tolerance
- **Maintenance-Free**: No server management required

## Payment System Features

### Receipt Generation
- **Automatic Receipt IDs**: Unique document IDs for each transaction
- **Registration Numbers**: Auto-generated unique student registration numbers
- **Amount in Words**: Converts numeric amounts to text format
- **Subject Tracking**: Records enrolled subjects for each payment
- **Payment Details**: Stores admission fees, tuition fees, and payment modes
- **Print Functionality**: Built-in browser print-to-PDF capability

### Payment Modes
- **Cash Payments**: Direct cash transactions
- **Cheque Payments**: With cheque number tracking and validation
- **Online Payments**: Digital payment processing (expandable)

### Data Management
- **Dual Storage**: Firestore for real-time operations, DynamoDB for analytics
- **Payment History**: Complete transaction records per student
- **Pending Amount Tracking**: Automatic calculation of outstanding balances
- **Export Capabilities**: Excel export with date ranges and filtering
- **Receipt Reprinting**: Click-to-regenerate receipts from payment history

### Security & Compliance
- **Secure Data Storage**: Encrypted payment information
- **Audit Trails**: Complete transaction history for compliance
- **User Authentication**: Role-based access control for payment operations
- **Data Backup**: Redundant storage across multiple AWS services