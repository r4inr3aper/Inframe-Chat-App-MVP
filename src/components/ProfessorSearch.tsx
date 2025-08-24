"use client"

import { useState, useEffect } from "react"
import { Search, MessageCircle, Star, Clock, User, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Professor } from "@/types/chat"
import professorsData from "@/data/professors.json"

interface ProfessorSearchProps {
  onSelectProfessor: (professor: Professor) => void
  className?: string
}

export default function ProfessorSearch({ onSelectProfessor, className = "" }: ProfessorSearchProps) {
  const [professors] = useState<Professor[]>(professorsData as Professor[])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>(professors)

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
        <h1 className="text-2xl font-bold text-foreground mb-4">Find a Professor</h1>
        
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
        {filteredProfessors.length === 0 ? (
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
