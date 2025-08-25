"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  GraduationCap,
  Building,
  Hash,
  Calendar,
  Users,
  BookOpen,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentSignupData, FormErrors, DEPARTMENTS, ACADEMIC_YEARS, SEMESTERS } from "@/types/auth"
import Link from "next/link"

interface StudentSignupProps {
  onSignup: (data: StudentSignupData) => Promise<void>
  isLoading?: boolean
}

const STEPS = [
  {
    title: "Account Information",
    description: "Create your student account",
    fields: ['email', 'password', 'confirmPassword', 'name']
  },
  {
    title: "Academic Details", 
    description: "Tell us about your studies",
    fields: ['department', 'studentid', 'year', 'batch', 'semester']
  }
]

export default function StudentSignup({ onSignup, isLoading = false }: StudentSignupProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<StudentSignupData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    department: '',
    studentid: '',
    year: '',
    batch: '',
    semester: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}
    const stepFields = STEPS[step].fields

    stepFields.forEach(field => {
      const value = formData[field as keyof StudentSignupData]
      
      if (!value) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      }
    })

    // Additional validations for step 0
    if (step === 0) {
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    // Additional validations for step 1
    if (step === 1) {
      if (formData.studentid && formData.studentid.length < 3) {
        newErrors.studentid = 'Student ID must be at least 3 characters'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) return

    await onSignup(formData)
    // Error handling is now done in the auth hook with Sonner
  }

  const handleInputChange = (field: keyof StudentSignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const renderStep0 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your student email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
      </div>
    </motion.div>
  )

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="department" className="text-sm font-medium text-gray-700">
          Department
        </Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
          <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
            <SelectTrigger className={`pl-10 ${errors.department ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select your department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {errors.department && <p className="text-sm text-red-600">{errors.department}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentid" className="text-sm font-medium text-gray-700">
          Student ID
        </Label>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="studentid"
            type="text"
            placeholder="Enter your student ID"
            value={formData.studentid}
            onChange={(e) => handleInputChange('studentid', e.target.value)}
            className={`pl-10 ${errors.studentid ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.studentid && <p className="text-sm text-red-600">{errors.studentid}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year" className="text-sm font-medium text-gray-700">
            Academic Year
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
            <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
              <SelectTrigger className={`pl-10 ${errors.year ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map((year) => (
                  <SelectItem key={year} value={year}>Year {year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.year && <p className="text-sm text-red-600">{errors.year}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="semester" className="text-sm font-medium text-gray-700">
            Semester
          </Label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
            <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
              <SelectTrigger className={`pl-10 ${errors.semester ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Sem" />
              </SelectTrigger>
              <SelectContent>
                {SEMESTERS.map((sem) => (
                  <SelectItem key={sem} value={sem}>Semester {sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.semester && <p className="text-sm text-red-600">{errors.semester}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="batch" className="text-sm font-medium text-gray-700">
          Batch/Section
        </Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="batch"
            type="text"
            placeholder="Enter your batch or section (e.g., A, B1, CS-A)"
            value={formData.batch}
            onChange={(e) => handleInputChange('batch', e.target.value)}
            className={`pl-10 ${errors.batch ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.batch && <p className="text-sm text-red-600">{errors.batch}</p>}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border border-border bg-card">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground font-heading">
              {STEPS[currentStep].title}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {STEPS[currentStep].description}
            </CardDescription>

            {/* Progress indicator */}
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                {STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    } ${index === currentStep ? 'ring-2 ring-accent/30' : ''}`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={currentStep === STEPS.length - 1 ? handleSubmit : (e) => e.preventDefault()}>
              <AnimatePresence mode="wait">
                {currentStep === 0 && renderStep0()}
                {currentStep === 1 && renderStep1()}
              </AnimatePresence>

              <div className="flex justify-between mt-6">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}

                <div className="ml-auto">
                  {currentStep < STEPS.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/auth/student/login"
                  className="text-primary hover:text-primary/80 font-medium hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
