"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { BookOpen, FileText } from "lucide-react"

const subjects = [
  { value: "mathematics", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "english", label: "English" },
  { value: "history", label: "History" },
]

export default function HomePage() {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [rollNumber, setRollNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLoadPaper = async () => {
    if (!selectedSubject || !rollNumber) {
      alert("Please select a subject and enter roll number")
      return
    }

    setLoading(true)
    try {
      router.push(`/evaluate?subject=${selectedSubject}&rollNumber=${rollNumber}`)
    } catch (error) {
      console.error("Error loading paper:", error)
      alert("Failed to load paper. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Answer Sheet Evaluator</CardTitle>
          <CardDescription>Select subject and enter roll number to begin evaluation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.value} value={subject.value}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {subject.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rollNumber">Roll Number</Label>
            <Input
              id="rollNumber"
              type="text"
              placeholder="Enter student roll number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="text-center font-mono"
            />
          </div>

          <Button
            onClick={handleLoadPaper}
            disabled={loading || !selectedSubject || !rollNumber}
            className="w-full"
            size="lg"
          >
            {loading ? "Loading..." : "Load Paper"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
