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
  BookOpen,
  Building,
  Hash,
  GraduationCap,
  Clock,
  FileText,
  Plus,
  X,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ProfessorSignupData, FormErrors, DEPARTMENTS, SUBJECTS_BY_DEPARTMENT } from "@/types/auth"
import Link from "next/link"

interface ProfessorSignupProps {
  onSignup: (data: ProfessorSignupData) => Promise<void>
  isLoading?: boolean
}

const STEPS = [
  {
    title: "Account Information",
    description: "Create your professor account",
    fields: ['email', 'password', 'confirmPassword', 'name']
  },
  {
    title: "Professional Details", 
    description: "Tell us about your expertise",
    fields: ['department', 'professorid', 'specialisation', 'subjects']
  },
  {
    title: "Additional Information",
    description: "Complete your profile",
    fields: ['bio', 'officeHours']
  }
]

export default function ProfessorSignup({ onSignup, isLoading = false }: ProfessorSignupProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [newSpecialisation, setNewSpecialisation] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [formData, setFormData] = useState<ProfessorSignupData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    department: '',
    professorid: '',
    specialisation: [],
    subjects: [],
    bio: '',
    officeHours: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}
    const stepFields = STEPS[step].fields

    stepFields.forEach(field => {
      const value = formData[field as keyof ProfessorSignupData]
      
      if (field === 'specialisation' || field === 'subjects') {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field] = `At least one ${field} is required`
        }
      } else if (!value) {
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
      if (formData.professorid && formData.professorid.length < 3) {
        newErrors.professorid = 'Professor ID must be at least 3 characters'
      }
    }

    // Additional validations for step 2
    if (step === 2) {
      if (formData.bio && formData.bio.length < 20) {
        newErrors.bio = 'Bio must be at least 20 characters'
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

  const handleInputChange = (field: keyof ProfessorSignupData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addSpecialisation = () => {
    if (newSpecialisation.trim() && !formData.specialisation.includes(newSpecialisation.trim())) {
      handleInputChange('specialisation', [...formData.specialisation, newSpecialisation.trim()])
      setNewSpecialisation('')
    }
  }

  const removeSpecialisation = (spec: string) => {
    handleInputChange('specialisation', formData.specialisation.filter(s => s !== spec))
  }

  const addSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      handleInputChange('subjects', [...formData.subjects, newSubject.trim()])
      setNewSubject('')
    }
  }

  const removeSubject = (subject: string) => {
    handleInputChange('subjects', formData.subjects.filter(s => s !== subject))
  }

  const addPredefinedSubject = (subject: string) => {
    if (!formData.subjects.includes(subject)) {
      handleInputChange('subjects', [...formData.subjects, subject])
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
            placeholder="Enter your institutional email"
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
        <Label htmlFor="professorid" className="text-sm font-medium text-gray-700">
          Professor ID
        </Label>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="professorid"
            type="text"
            placeholder="Enter your professor ID"
            value={formData.professorid}
            onChange={(e) => handleInputChange('professorid', e.target.value)}
            className={`pl-10 ${errors.professorid ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.professorid && <p className="text-sm text-red-600">{errors.professorid}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Specializations
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add specialization"
            value={newSpecialisation}
            onChange={(e) => setNewSpecialisation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialisation())}
          />
          <Button type="button" onClick={addSpecialisation} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.specialisation.map((spec, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {spec}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeSpecialisation(spec)}
              />
            </Badge>
          ))}
        </div>
        {errors.specialisation && <p className="text-sm text-red-600">{errors.specialisation}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Subjects You Teach
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
          />
          <Button type="button" onClick={addSubject} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.department && SUBJECTS_BY_DEPARTMENT[formData.department] && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-2">Quick add from {formData.department}:</p>
            <div className="flex flex-wrap gap-1">
              {SUBJECTS_BY_DEPARTMENT[formData.department].map((subject) => (
                <Button
                  key={subject}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPredefinedSubject(subject)}
                  className="text-xs h-6"
                  disabled={formData.subjects.includes(subject)}
                >
                  {subject}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {formData.subjects.map((subject, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {subject}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeSubject(subject)}
              />
            </Badge>
          ))}
        </div>
        {errors.subjects && <p className="text-sm text-red-600">{errors.subjects}</p>}
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
          Professional Bio
        </Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <Textarea
            id="bio"
            placeholder="Tell students about your background, research interests, and teaching philosophy..."
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className={`pl-10 min-h-[100px] resize-none ${errors.bio ? 'border-red-500' : ''}`}
          />
        </div>
        <p className="text-xs text-gray-500">{formData.bio.length}/500 characters</p>
        {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="officeHours" className="text-sm font-medium text-gray-700">
          Office Hours
        </Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="officeHours"
            type="text"
            placeholder="e.g., Mon-Wed 2:00-4:00 PM, Room 301"
            value={formData.officeHours}
            onChange={(e) => handleInputChange('officeHours', e.target.value)}
            className={`pl-10 ${errors.officeHours ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.officeHours && <p className="text-sm text-red-600">{errors.officeHours}</p>}
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
              <BookOpen className="w-8 h-8 text-primary" />
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
                {currentStep === 2 && renderStep2()}
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
                  href="/auth/professor/login"
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
