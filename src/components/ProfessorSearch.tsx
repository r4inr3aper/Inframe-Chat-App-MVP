"use client"

import { useState, useEffect } from "react"
import { Search, MessageCircle, Star, Clock, User, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Professor } from "@/types/chat"
import { ProfessorService } from "@/services/professorService"
import { useAuth } from "@/hooks/useAuth"

interface ProfessorSearchProps {
  onSelectProfessor: (professor: Professor) => void
  className?: string
}

export default function ProfessorSearch({ onSelectProfessor, className = "" }: ProfessorSearchProps) {
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth()
  const [professors, setProfessors] = useState<Professor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load professors from backend on component mount
  useEffect(() => {
    const loadProfessors = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return
      }

      if (!isAuthenticated || !accessToken) {
        setError('Please log in to view professors.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const data = await ProfessorService.getAllProfessors(accessToken)
        setProfessors(data)
        setFilteredProfessors(data)
      } catch (err: any) {
        console.error('Failed to load professors:', err)
        setError(err.message || 'Failed to load professors. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfessors()
  }, [isAuthenticated, accessToken, authLoading])

  // Get unique departments
  const departments = Array.from(new Set(professors.map(prof => prof.department)))

  useEffect(() => {
    let filtered = professors

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(prof =>
        prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.specialization.some(spec => 
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        prof.subjects.some(subject => 
          subject.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Filter by department
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(prof => prof.department === selectedDepartment)
    }

    setFilteredProfessors(filtered)
  }, [searchQuery, selectedDepartment, professors])

  const handleStartChat = (professor: Professor) => {
    onSelectProfessor(professor)
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Find a Professor</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!isAuthenticated || !accessToken) {
                setError('Please log in to refresh professors.')
                return
              }

              try {
                setIsLoading(true)
                setError(null)
                ProfessorService.clearCache() // Clear cache to force fresh data
                const data = await ProfessorService.getAllProfessors(accessToken)
                setProfessors(data)
                setFilteredProfessors(data)
              } catch (err: any) {
                setError(err.message || 'Failed to refresh professors')
              } finally {
                setIsLoading(false)
              }
            }}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, department, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {(isLoading || authLoading) ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {authLoading ? 'Checking authentication...' : 'Loading professors...'}
            </h3>
            <p className="text-muted-foreground">
              {authLoading ? 'Please wait while we verify your login' : 'Please wait while we fetch the latest data'}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="h-12 w-12 text-destructive mx-auto mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-foreground mb-2">Error loading professors</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">{error}</p>
            <div className="space-y-2">
              <Button
                onClick={async () => {
                  if (!isAuthenticated || !accessToken) {
                    setError('Please log in to load professors.')
                    return
                  }

                  try {
                    setIsLoading(true)
                    setError(null)
                    const data = await ProfessorService.getAllProfessors(accessToken)
                    setProfessors(data)
                    setFilteredProfessors(data)
                  } catch (err: any) {
                    setError(err.message || 'Failed to load professors')
                  } finally {
                    setIsLoading(false)
                  }
                }}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? 'Retrying...' : 'Try Again'}
              </Button>
              {error.includes('Authentication') && (
                <p className="text-xs text-muted-foreground mt-2">
                  Please log in to view professors. If you're already logged in, try refreshing the page.
                </p>
              )}
            </div>
          </div>
        ) : filteredProfessors.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No professors found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessors.map(professor => (
              <Card key={professor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={professor.avatar} alt={professor.name} />
                        <AvatarFallback>
                          {professor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {professor.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{professor.name}</h3>
                      <p className="text-sm text-muted-foreground">{professor.department}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{professor.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{professor.bio}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{professor.responseTime}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {professor.specialization.slice(0, 2).map(spec => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {professor.specialization.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{professor.specialization.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleStartChat(professor)}
                    className="w-full"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
