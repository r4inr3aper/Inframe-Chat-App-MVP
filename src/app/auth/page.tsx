"use client"

import { motion } from "framer-motion"
import { GraduationCap, BookOpen, ArrowRight, Users, MessageCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function AuthLandingPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated (but not while loading)
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.push('/')
    }
  }, [isAuthenticated, user, authLoading, router])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground font-heading">Inframe Chat</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-foreground font-heading mb-6">
            Connect. Learn. <span className="text-accent">Grow.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Bridge the gap between students and professors with our comprehensive communication platform.
            Join study groups, get instant help, and build meaningful academic relationships.
          </p>
        </motion.div>

        {/* Authentication Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <Card className="max-w-md mx-auto border border-accent/20 bg-accent/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground font-heading">Backend Authentication</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                This app now uses real backend authentication. Please register or login with your credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Choose your role below to get started with the registration or login process.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Role Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16"
        >
          {/* Student Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border border-border shadow-lg hover:scale-105 bg-card">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground font-heading">I'm a Student</CardTitle>
              <CardDescription className="text-muted-foreground">
                Connect with professors, join study groups, and get academic support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Direct messaging with professors</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Join and participate in study groups</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Browse professors by department</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Get quick responses to your questions</span>
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <Link href="/auth/student/login" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Student Login
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/auth/student/signup" className="block">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-accent/10">
                    Create Student Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Professor Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border border-border shadow-lg hover:scale-105 bg-card">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground font-heading">I'm a Professor</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage student communications and create engaging study groups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Respond to student inquiries</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Create and manage study groups</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Bulk add students to groups</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Control group messaging permissions</span>
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <Link href="/auth/professor/login" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Professor Login
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/auth/professor/signup" className="block">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-accent/10">
                    Create Professor Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground font-heading mb-8">Why Choose Inframe Chat?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Easy Communication</h3>
              <p className="text-muted-foreground">Seamless messaging between students and professors with real-time notifications</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Study Groups</h3>
              <p className="text-muted-foreground">Collaborative learning spaces with customizable permissions and member management</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">Your academic conversations are protected with enterprise-grade security</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border mt-16">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 Inframe Chat. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
