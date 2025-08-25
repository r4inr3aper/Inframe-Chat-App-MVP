// Basic auth types for form data
export interface LoginData {
  email: string
  password: string
  role?: 'student' | 'teacher' | 'admin'
}

export interface StudentSignupData {
  email: string
  password: string
  confirmPassword?: string
  name: string
  department: string
  studentid: string
  year: string
  batch: string
  semester: string
}

export interface ProfessorSignupData {
  email: string
  password: string
  confirmPassword?: string
  name: string
  department: string
  professorid: string
  specialisation: string[]
  bio: string
  officeHours: string
  subjects: string[]
}

export interface FormErrors {
  [key: string]: string
}

// Constants for form options
export const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Engineering',
  'Business',
  'Psychology'
]

export const ACADEMIC_YEARS = ['1', '2', '3', '4']

export const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8']

export const SUBJECTS_BY_DEPARTMENT: Record<string, string[]> = {
  'Computer Science': [
    'Data Structures',
    'Algorithms',
    'Database Systems',
    'Software Engineering',
    'Machine Learning',
    'Web Development',
    'Mobile Development',
    'Cybersecurity'
  ],
  'Mathematics': [
    'Calculus',
    'Linear Algebra',
    'Statistics',
    'Probability Theory',
    'Discrete Mathematics',
    'Number Theory'
  ],
  'Physics': [
    'Classical Mechanics',
    'Quantum Physics',
    'Thermodynamics',
    'Electromagnetism',
    'Optics',
    'Nuclear Physics'
  ],
  'Chemistry': [
    'Organic Chemistry',
    'Inorganic Chemistry',
    'Physical Chemistry',
    'Analytical Chemistry',
    'Biochemistry'
  ],
  'Biology': [
    'Cell Biology',
    'Genetics',
    'Ecology',
    'Microbiology',
    'Anatomy',
    'Physiology'
  ],
  'Engineering': [
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Aerospace Engineering'
  ],
  'Business': [
    'Marketing',
    'Finance',
    'Management',
    'Economics',
    'Accounting',
    'Business Strategy'
  ],
  'Psychology': [
    'Cognitive Psychology',
    'Social Psychology',
    'Developmental Psychology',
    'Clinical Psychology',
    'Research Methods'
  ]
}