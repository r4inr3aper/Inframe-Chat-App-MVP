# Inframe Chat App - Backend Architecture Documentation

## Project Overview

Inframe Chat is a student-professor communication platform that facilitates direct messaging between students and professors, and enables professors to create and manage study groups. The platform has two main user roles with distinct functionalities.

## Core Features & User Flows

### Student Features
1. **Professor Discovery & Messaging**
   - Browse professors by department filter
   - View professor profiles (specialization, rating, response time, office hours)
   - Initiate direct chat conversations with professors
   - View chat history and previous conversations

2. **Study Group Participation**
   - View available study groups created by professors
   - Join study groups (professor approval required)
   - Participate in group discussions (if permissions allow)
   - View group member lists and details

### Professor Features
1. **Student Communication Management**
   - Receive and respond to student messages
   - View all incoming student conversations
   - Manage conversation history

2. **Study Group Management**
   - Create new study groups with detailed configuration
   - Add/remove students from groups
   - Bulk import students to groups
   - Configure group permissions (open chat vs professor-only messaging)
   - Set group capacity limits
   - Manage group settings and descriptions

### Admin Features (Future)
- Dashboard for platform analytics
- User management
- System monitoring

## Database Schema Design

### Core Entities

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role ENUM('student', 'professor') NOT NULL,
    department VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

#### Students Table (extends users)
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    year INTEGER,
    batch VARCHAR(50),
    semester INTEGER
);
```

#### Professors Table (extends users)
```sql
CREATE TABLE professors (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    professor_id VARCHAR(50) UNIQUE NOT NULL,
    specialization TEXT[], -- Array of specializations
    bio TEXT,
    office_hours TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    response_time VARCHAR(50) DEFAULT 'Within 24 hours',
    subjects TEXT[], -- Array of subjects taught
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP
);
```

#### Study Groups Table
```sql
CREATE TABLE study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    max_members INTEGER DEFAULT 50,
    prof_controlled BOOLEAN DEFAULT false, -- If true, only professor can send messages
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Group Members Table
```sql
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(group_id, student_id)
);
```

#### Direct Messages Table
```sql
CREATE TABLE direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    file_url TEXT,
    file_name VARCHAR(255),
    status ENUM('sending', 'sent', 'delivered', 'read') DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Group Messages Table
```sql
CREATE TABLE group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    file_url TEXT,
    file_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Chat Sessions Table (for organizing direct conversations)
```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
    last_message_id UUID REFERENCES direct_messages(id),
    unread_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, professor_id)
);
```

### Indexes for Performance
```sql
-- Message queries
CREATE INDEX idx_direct_messages_sender_recipient ON direct_messages(sender_id, recipient_id);
CREATE INDEX idx_direct_messages_created_at ON direct_messages(created_at DESC);
CREATE INDEX idx_group_messages_group_created ON group_messages(group_id, created_at DESC);

-- User lookups
CREATE INDEX idx_users_role_department ON users(role, department);
CREATE INDEX idx_professors_specialization ON professors USING GIN(specialization);

-- Group queries
CREATE INDEX idx_study_groups_professor ON study_groups(professor_id);
CREATE INDEX idx_group_members_student ON group_members(student_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
```

## API Endpoints Design

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### User Management
```
GET  /api/users/profile
PUT  /api/users/profile
GET  /api/professors?department={dept}&page={n}&limit={n}
GET  /api/professors/{id}
```

### Direct Messaging
```
GET  /api/chats/sessions                    # Get all chat sessions for current user
GET  /api/chats/sessions/{sessionId}/messages?page={n}&limit={n}
POST /api/chats/sessions/{sessionId}/messages
PUT  /api/chats/sessions/{sessionId}/read   # Mark messages as read
POST /api/chats/sessions                    # Create new chat session
```

### Study Groups
```
GET  /api/groups?professor_id={id}&page={n}&limit={n}  # Get groups (filtered)
POST /api/groups                                       # Create group (professor only)
GET  /api/groups/{id}                                  # Get group details
PUT  /api/groups/{id}                                  # Update group (professor only)
DELETE /api/groups/{id}                                # Delete group (professor only)

GET  /api/groups/{id}/members                          # Get group members
POST /api/groups/{id}/members                          # Add member (professor only)
DELETE /api/groups/{id}/members/{studentId}            # Remove member (professor only)
POST /api/groups/{id}/members/bulk                     # Bulk add members (professor only)

GET  /api/groups/{id}/messages?page={n}&limit={n}      # Get group messages
POST /api/groups/{id}/messages                         # Send group message
```

### Students Management (for professors)
```
GET  /api/students?department={dept}&year={n}&batch={batch}&page={n}&limit={n}
GET  /api/students/{id}
```

## Request/Response Examples

### Authentication
```json
// POST /api/auth/login
{
  "email": "student@university.edu",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@university.edu",
      "name": "John Doe",
      "role": "student",
      "department": "Computer Science"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### Create Study Group
```json
// POST /api/groups
{
  "name": "Advanced Algorithms Study Group",
  "description": "Weekly discussions on advanced algorithms and data structures",
  "subject": "Computer Science",
  "maxMembers": 25,
  "profControlled": false
}

// Response
{
  "success": true,
  "data": {
    "id": "group_uuid",
    "name": "Advanced Algorithms Study Group",
    "description": "Weekly discussions on advanced algorithms and data structures",
    "professorId": "prof_uuid",
    "professor": {
      "id": "prof_uuid",
      "name": "Dr. Smith",
      "department": "Computer Science"
    },
    "subject": "Computer Science",
    "maxMembers": 25,
    "profControlled": false,
    "memberCount": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Send Message
```json
// POST /api/chats/sessions/{sessionId}/messages
{
  "content": "Hello Professor, I have a question about the assignment",
  "type": "text"
}

// Response
{
  "success": true,
  "data": {
    "id": "message_uuid",
    "content": "Hello Professor, I have a question about the assignment",
    "senderId": "student_uuid",
    "recipientId": "prof_uuid",
    "type": "text",
    "status": "sent",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Real-time Features (WebSocket Events)

### Connection Events
```
// Client connects
CONNECT -> server assigns user to appropriate rooms

// Join professor-specific room for direct messages
JOIN_PROFESSOR_ROOM: { professorId: "uuid" }

// Join group-specific room for group messages
JOIN_GROUP_ROOM: { groupId: "uuid" }
```

### Message Events
```
// Direct message events
NEW_DIRECT_MESSAGE: {
  sessionId: "uuid",
  message: { /* message object */ }
}

MESSAGE_READ: {
  sessionId: "uuid",
  messageIds: ["uuid1", "uuid2"]
}

// Group message events
NEW_GROUP_MESSAGE: {
  groupId: "uuid",
  message: { /* message object */ }
}

// Typing indicators
TYPING_START: { sessionId: "uuid", userId: "uuid" }
TYPING_STOP: { sessionId: "uuid", userId: "uuid" }
```

### Presence Events
```
USER_ONLINE: { userId: "uuid" }
USER_OFFLINE: { userId: "uuid" }
```

## Business Logic & Permissions

### Role-Based Access Control

#### Students Can:
- View all professors and their profiles
- Send messages to any professor
- View study groups they're members of
- Send messages in groups (if group allows)
- Join groups (with professor approval)

#### Professors Can:
- View and respond to all student messages
- Create, update, and delete their own study groups
- Add/remove students from their groups
- Configure group messaging permissions
- View all students for group management
- Bulk import students to groups

### Group Messaging Rules
- If `prof_controlled = true`: Only professor can send messages
- If `prof_controlled = false`: All members can send messages
- Professors can always send messages regardless of settings

### Data Validation Rules
- Email must be unique across all users
- Student IDs and Professor IDs must be unique
- Group names must be unique per professor
- Maximum group size enforced at application level
- Message content cannot be empty
- File uploads must be validated for type and size

## Technical Requirements

### Technology Stack Recommendations
- **Backend Framework**: Node.js with Express.js or Python with FastAPI
- **Database**: PostgreSQL (for ACID compliance and JSON support)
- **Real-time**: Socket.IO or native WebSockets
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 or similar cloud storage
- **Caching**: Redis for session management and real-time features

### Performance Considerations
- Implement pagination for all list endpoints (default: 20 items per page)
- Use database indexes for frequently queried fields
- Cache professor profiles and group information
- Implement message batching for real-time updates
- Use connection pooling for database connections

### Security Requirements
- JWT token expiration: 15 minutes (access), 7 days (refresh)
- Rate limiting on all endpoints (100 requests/minute per user)
- Input validation and sanitization for all user inputs
- File upload restrictions (max 10MB, specific file types only)
- CORS configuration for frontend domain only
- SQL injection prevention through parameterized queries

### Error Handling
```json
// Standard error response format
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Email format is invalid"
    }
  }
}
```

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@localhost:5432/Inframe_chat
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
CORS_ORIGIN=http://localhost:3000
PORT=8000
```

## Development Setup

### Database Setup
1. Install PostgreSQL
2. Create database: `createdb Inframe_chat`
3. Run migrations to create tables
4. Seed with sample data from provided JSON files

### API Testing
- Use provided JSON data files for initial testing
- Implement comprehensive test suite covering all endpoints
- Test real-time functionality with multiple clients
- Validate all permission scenarios

### Deployment Considerations
- Use environment-specific configurations
- Implement health check endpoints
- Set up logging and monitoring
- Configure auto-scaling for WebSocket connections
- Database backup and recovery procedures

## Frontend Integration Notes

The frontend expects specific data structures as defined in the TypeScript interfaces:
- User, Professor, Student types
- Group, GroupChatMessage types
- ChatSession, ChatMessage types

Ensure API responses match these interfaces for seamless integration.
