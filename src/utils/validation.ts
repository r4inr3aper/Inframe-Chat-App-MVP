import { FormErrors } from "@/types/auth"

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required'
  if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address'
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number'
  return null
}

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return null
}

export const validateName = (name: string): string | null => {
  if (!name) return 'Name is required'
  if (name.length < 2) return 'Name must be at least 2 characters'
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces'
  return null
}

export const validateStudentId = (studentId: string): string | null => {
  if (!studentId) return 'Student ID is required'
  if (studentId.length < 3) return 'Student ID must be at least 3 characters'
  if (!/^[a-zA-Z0-9]+$/.test(studentId)) return 'Student ID can only contain letters and numbers'
  return null
}

export const validateProfessorId = (professorId: string): string | null => {
  if (!professorId) return 'Professor ID is required'
  if (professorId.length < 3) return 'Professor ID must be at least 3 characters'
  if (!/^[a-zA-Z0-9]+$/.test(professorId)) return 'Professor ID can only contain letters and numbers'
  return null
}

export const validateDepartment = (department: string): string | null => {
  if (!department) return 'Department is required'
  return null
}

export const validateYear = (year: string): string | null => {
  if (!year) return 'Academic year is required'
  return null
}

export const validateSemester = (semester: string): string | null => {
  if (!semester) return 'Semester is required'
  return null
}

export const validateBatch = (batch: string): string | null => {
  if (!batch) return 'Batch/Section is required'
  if (batch.length < 1) return 'Batch/Section must be at least 1 character'
  return null
}

export const validateSpecialisation = (specialisation: string[]): string | null => {
  if (!specialisation || specialisation.length === 0) return 'At least one specialization is required'
  return null
}

export const validateSubjects = (subjects: string[]): string | null => {
  if (!subjects || subjects.length === 0) return 'At least one subject is required'
  return null
}

export const validateBio = (bio: string): string | null => {
  if (!bio) return 'Bio is required'
  if (bio.length < 20) return 'Bio must be at least 20 characters'
  if (bio.length > 500) return 'Bio must be less than 500 characters'
  return null
}

export const validateOfficeHours = (officeHours: string): string | null => {
  if (!officeHours) return 'Office hours are required'
  if (officeHours.length < 5) return 'Please provide detailed office hours'
  return null
}

// Comprehensive validation functions for forms
export const validateStudentSignupStep = (step: number, data: any): FormErrors => {
  const errors: FormErrors = {}

  if (step === 0) {
    const nameError = validateName(data.name)
    if (nameError) errors.name = nameError

    const emailError = validateEmail(data.email)
    if (emailError) errors.email = emailError

    const passwordError = validatePassword(data.password)
    if (passwordError) errors.password = passwordError

    const confirmPasswordError = validateConfirmPassword(data.password, data.confirmPassword)
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError
  }

  if (step === 1) {
    const departmentError = validateDepartment(data.department)
    if (departmentError) errors.department = departmentError

    const studentIdError = validateStudentId(data.studentid)
    if (studentIdError) errors.studentid = studentIdError

    const yearError = validateYear(data.year)
    if (yearError) errors.year = yearError

    const semesterError = validateSemester(data.semester)
    if (semesterError) errors.semester = semesterError

    const batchError = validateBatch(data.batch)
    if (batchError) errors.batch = batchError
  }

  return errors
}

export const validateProfessorSignupStep = (step: number, data: any): FormErrors => {
  const errors: FormErrors = {}

  if (step === 0) {
    const nameError = validateName(data.name)
    if (nameError) errors.name = nameError

    const emailError = validateEmail(data.email)
    if (emailError) errors.email = emailError

    const passwordError = validatePassword(data.password)
    if (passwordError) errors.password = passwordError

    const confirmPasswordError = validateConfirmPassword(data.password, data.confirmPassword)
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError
  }

  if (step === 1) {
    const departmentError = validateDepartment(data.department)
    if (departmentError) errors.department = departmentError

    const professorIdError = validateProfessorId(data.professorid)
    if (professorIdError) errors.professorid = professorIdError

    const specialisationError = validateSpecialisation(data.specialisation)
    if (specialisationError) errors.specialisation = specialisationError

    const subjectsError = validateSubjects(data.subjects)
    if (subjectsError) errors.subjects = subjectsError
  }

  if (step === 2) {
    const bioError = validateBio(data.bio)
    if (bioError) errors.bio = bioError

    const officeHoursError = validateOfficeHours(data.officeHours)
    if (officeHoursError) errors.officeHours = officeHoursError
  }

  return errors
}

export const validateLoginForm = (data: any): FormErrors => {
  const errors: FormErrors = {}

  const emailError = validateEmail(data.email)
  if (emailError) errors.email = emailError

  if (!data.password) errors.password = 'Password is required'

  return errors
}
