# Inframes Chat App Features

## Overview
A comprehensive chat application that allows students to connect with professors and enables professors to manage study groups.

## Features

### For Students
1. **Professor Search & Discovery**
   - Search professors by name, department, or specialization
   - Filter by department
   - View professor profiles with ratings, response times, and office hours
   - See professor availability status (online/offline)

2. **Chat with Professors**
   - Start conversations with any professor
   - Real-time messaging interface
   - Message status indicators (sent, delivered, read)
   - Chat history management

3. **Study Groups**
   - Browse available study groups across all departments
   - View group details including professor, members, and subject
   - Join groups with available spots
   - Leave groups when needed
   - See group member previews and statistics

### For Professors
1. **Group Management (Admin)**
   - Create new study groups with custom settings
   - Edit group information (name, description, subject, max members)
   - Add/remove students from groups
   - Search and filter students by department
   - View group member lists with student details
   - Delete groups when no longer needed
   - Bulk member management with checkboxes

2. **Group Overview**
   - View all created groups in a unified interface
   - See group statistics (member count, creation date)
   - Quick access to group management actions
   - Visual member previews with avatars

3. **Student Management**
   - Browse all students in the system
   - Filter students by department
   - Search students by name, email, or student ID
   - Add students to multiple groups simultaneously

## Data Structure

### JSON Data Files
All data is stored in JSON files for easy backend integration:

- `src/data/professors.json` - Professor profiles and information
- `src/data/students.json` - Student profiles and information
- `src/data/groups.json` - Study group data with members
- `src/data/chats.json` - Chat sessions and messages
- `src/data/user.json` - Current user information

### Key Data Models

#### Professor
```typescript
interface Professor {
  id: string
  name: string
  email: string
  department: string
  specialization: string[]
  avatar?: string
  isOnline: boolean
  officeHours: string
  bio: string
  rating: number
  responseTime: string
  subjects: string[]
}
```

#### Group
```typescript
interface Group {
  id: string
  name: string
  description: string
  professorId: string
  professor: Professor
  members: User[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  maxMembers?: number
  subject?: string
}
```

#### User
```typescript
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  studentId?: string
  professorId?: string
  department: string
  role: "student" | "professor"
}
```

## Services

### ChatService
Handles all chat-related operations:
- Start new chats with professors
- Send and receive messages
- Manage chat sessions
- Simulate professor responses

### GroupService
Manages group operations for professors:
- Create, update, and delete groups
- Add/remove members
- Search students
- Filter by department

### UserService
Manages user authentication and role switching:
- Get current user information
- Switch between student/professor roles (for demo)
- Role-based access control

## Components

### Core Components
- `ProfessorSearch` - Search and discover professors
- `ChatInterface` - Real-time chat interface
- `ChatSidebar` - Chat list and navigation
- `ProfessorGroupManagement` - Complete group management for professors
- `GroupView` - Unified group view for both students and professors

### UI Components
Built with shadcn/ui components for consistent design:
- Cards, Dialogs, Buttons, Inputs
- Tables, Badges, Avatars
- Tabs, Select dropdowns, Checkboxes

### UI/UX Enhancements
- **Custom Scrollbars**: Beautiful, themed scrollbars throughout the app
  - `custom-scrollbar` class for standard scrollable areas
  - `custom-scrollbar-thin` class for compact lists and dialogs
  - Consistent with app theme colors and hover states
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Role-Based Navigation**: Different interfaces for students vs professors

## Role-Based Features

### Student View
- Professor search and discovery
- Chat initiation and management
- View professor availability and information

### Professor View
- Group creation and management
- Student search and selection
- Member management (add/remove)
- Group settings and configuration

## Demo Features
- Role switching button to test both student and professor views
- Simulated professor responses in chats
- Pre-populated sample data for testing

## Backend Integration Ready
All data operations use service classes that can easily be replaced with actual API calls:
- JSON data can be replaced with REST API endpoints
- Service methods return proper TypeScript interfaces
- Error handling and loading states included

## New Group View & Chat Features

### Student Group Experience
- **My Groups Only**: Shows only groups the student has been added to by professors
- **No Self-Join**: Students cannot manually join groups (professor-controlled membership)
- **Group Cards**: Rich information display with:
  - Professor details and online status
  - Member count and capacity
  - Creation date and subject code
  - Member avatar previews
  - Group Chat access button

### Professor Group Experience
- **Unified Group Overview**: All created groups in one view
- **Quick Actions**: Edit, manage members, or delete groups
- **Visual Statistics**: Member counts, capacity indicators
- **Integrated Management**: Direct access to detailed group management

### Group Chat System
- **Real-time Group Messaging**: Chat with all group members
- **Group Chat Sidebar**: Dedicated sidebar for group chat navigation
- **Message History**: Persistent chat history for each group
- **Role Indicators**: Visual distinction between professor and student messages
- **Typing Indicators**: See when someone is typing
- **Message Timestamps**: Clear time indicators for all messages

### Enhanced Group Cards
- **Professor Information**: Avatar, name, department, online status
- **Group Statistics**: Member count, max capacity, creation date
- **Member Previews**: Avatar stack showing first 4 members
- **Action Buttons**: Context-sensitive actions (Group Chat, Manage)
- **Hover Effects**: Smooth transitions and interactive elements

## Navigation & UI Features

### Unified Navigation Bar
- **Find Professors**: Search and discover professors
- **Study Groups**: View assigned/created groups
- **Group Chat**: Access group messaging with dedicated sidebar
- **Manage Groups**: Professor-only group management interface
- **Role Switcher**: Demo feature to test both student and professor views

### Smart Sidebar System
- **Chat Sidebar**: For professor-student conversations
- **Group Chat Sidebar**: Dedicated interface for group messaging
- **Auto-switching**: Sidebar changes based on current view
- **Collapsible**: Mobile-friendly responsive design

### Enhanced UI Elements
- **Custom Scrollbars**: Beautiful themed scrollbars throughout
- **Smooth Animations**: Hover effects and transitions
- **Role-based Interface**: Different features based on user role
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Proper feedback for user actions

## Getting Started
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Use the role switcher to test both student and professor features
4. **As a Student**:
   - View assigned study groups
   - Search for professors and start chats
   - Participate in group chats
   - View group details and member information
5. **As a Professor**:
   - Create and manage study groups
   - Add/remove students from groups
   - Moderate group chats
   - View group overview and statistics

## Future Enhancements
- Real-time notifications
- File sharing in chats
- Group chat functionality within study groups
- Calendar integration for office hours and group meetings
- Advanced search filters and sorting options
- Mobile app support with push notifications
- Group discussion forums
- Assignment and resource sharing within groups
