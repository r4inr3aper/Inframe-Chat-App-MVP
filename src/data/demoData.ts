import { Professor, Group, User } from "@/types/chat"

// Demo professors
export const demoProfessors: Professor[] = [
  {
    id: "prof_1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    department: "Computer Science",
    specialization: ["Machine Learning", "Data Science"],
    bio: "Professor of Computer Science with 15 years of experience in AI and machine learning research.",
    officeHours: "Mon-Wed 2:00-4:00 PM, Room 301",
    rating: 4.8,
    responseTime: "Within 2 hours",
    subjects: ["Machine Learning", "Data Structures", "Algorithms"],
    isOnline: true,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "prof_2", 
    name: "Prof. Michael Chen",
    email: "michael.chen@university.edu",
    department: "Computer Science",
    specialization: ["Software Engineering", "Web Development"],
    bio: "Associate Professor specializing in software engineering and full-stack development.",
    officeHours: "Tue-Thu 1:00-3:00 PM, Room 205",
    rating: 4.6,
    responseTime: "Within 4 hours",
    subjects: ["Software Engineering", "Web Development", "Database Systems"],
    isOnline: false,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "prof_3",
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@university.edu", 
    department: "Mathematics",
    specialization: ["Statistics", "Probability Theory"],
    bio: "Mathematics professor with expertise in statistical analysis and probability theory.",
    officeHours: "Mon-Fri 10:00-12:00 PM, Room 402",
    rating: 4.9,
    responseTime: "Within 1 hour",
    subjects: ["Statistics", "Calculus", "Linear Algebra"],
    isOnline: true,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "prof_4",
    name: "Prof. David Kim",
    email: "david.kim@university.edu",
    department: "Physics", 
    specialization: ["Quantum Physics", "Theoretical Physics"],
    bio: "Physics professor researching quantum mechanics and theoretical physics applications.",
    officeHours: "Wed-Fri 3:00-5:00 PM, Room 501",
    rating: 4.7,
    responseTime: "Within 6 hours",
    subjects: ["Quantum Physics", "Classical Mechanics", "Thermodynamics"],
    isOnline: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  }
]

// Demo students
export const demoStudents: User[] = [
  {
    id: "student_1",
    name: "Alex Thompson",
    email: "alex.thompson@student.edu",
    department: "Computer Science",
    role: "student",
    studentId: "CS2021001",
    year: 3,
    batch: "A",
    semester: 6,
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "student_2", 
    name: "Maria Garcia",
    email: "maria.garcia@student.edu",
    department: "Computer Science",
    role: "student",
    studentId: "CS2022015",
    year: 2,
    batch: "B",
    semester: 4,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "student_3",
    name: "James Wilson", 
    email: "james.wilson@student.edu",
    department: "Mathematics",
    role: "student",
    studentId: "MATH2021008",
    year: 3,
    batch: "A",
    semester: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  }
]

// Demo study groups
export const demoGroups: Group[] = [
  {
    id: "group_1",
    name: "Advanced Machine Learning Study Group",
    description: "Weekly discussions on advanced ML algorithms, research papers, and practical implementations.",
    professor: demoProfessors[0],
    professorId: "prof_1",
    subject: "Machine Learning",
    members: [demoStudents[0], demoStudents[1]],
    maxMembers: 25,
    profControlled: false,
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    updatedAt: new Date()
  },
  {
    id: "group_2",
    name: "Web Development Bootcamp",
    description: "Hands-on web development sessions covering React, Node.js, and modern web technologies.",
    professor: demoProfessors[1], 
    professorId: "prof_2",
    subject: "Web Development",
    members: [demoStudents[0]],
    maxMembers: 20,
    profControlled: true,
    isActive: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    updatedAt: new Date()
  },
  {
    id: "group_3",
    name: "Statistics Help Desk",
    description: "Open forum for statistics questions, homework help, and exam preparation.",
    professor: demoProfessors[2],
    professorId: "prof_3", 
    subject: "Statistics",
    members: [demoStudents[2]],
    maxMembers: 30,
    profControlled: false,
    isActive: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date()
  }
]

// Quick access functions
export const getDemoProfessors = () => demoProfessors
export const getDemoStudents = () => demoStudents  
export const getDemoGroups = () => demoGroups

export const getDemoProfessorById = (id: string) => demoProfessors.find(prof => prof.id === id)
export const getDemoStudentById = (id: string) => demoStudents.find(student => student.id === id)
export const getDemoGroupById = (id: string) => demoGroups.find(group => group.id === id)

export const getDemoProfessorsByDepartment = (department: string) => 
  demoProfessors.filter(prof => prof.department === department)

export const getDemoGroupsByProfessor = (professorId: string) =>
  demoGroups.filter(group => group.professorId === professorId)

// Demo authentication users
export const demoAuthUsers = {
  student: {
    email: "student@demo.com",
    password: "demo123",
    user: demoStudents[0]
  },
  professor: {
    email: "professor@demo.com",
    password: "demo123",
    user: {
      ...demoProfessors[0],
      role: "professor" as const
    }
  }
}

// Demo chat messages for testing
export const demoChatMessages = [
  {
    id: "msg_1",
    content: "Hello! I saw you're interested in machine learning. How can I help you today?",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    sender: "professor" as const,
    status: "delivered" as const,
    type: "text" as const
  },
  {
    id: "msg_2",
    content: "Hi Dr. Johnson! I'm struggling with understanding neural networks. Could you explain backpropagation?",
    timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
    sender: "user" as const,
    status: "read" as const,
    type: "text" as const
  }
]

// Demo group chat messages
export const demoGroupChatMessages = [
  {
    id: "gmsg_1",
    content: "Welcome to the study group! Feel free to ask questions.",
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    senderId: "prof_1",
    senderName: "Dr. Sarah Johnson",
    senderRole: "professor" as const,
    type: "text" as const
  },
  {
    id: "gmsg_2",
    content: "Thanks for creating this group! I'm excited to learn.",
    timestamp: new Date(Date.now() - 82800000), // 23 hours ago
    senderId: "student_1",
    senderName: "Alex Thompson",
    senderRole: "student" as const,
    type: "text" as const
  }
]
