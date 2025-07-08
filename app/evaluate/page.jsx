"use client"

import { useState, useEffect, Suspense, useCallback } from "react" // Added useCallback
import { useSearchParams, useRouter } from "next/navigation"
import PDFViewer from "../../components/PDFViewer"
import QuestionPanel from "../../components/QuestionPanel"
import MarksPanel from "../../components/MarksPanel"
import PageSelectionPopup from "../../components/PageSelectionPopup"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { ArrowLeft, Send } from "lucide-react"

// Component for the main evaluation content
function EvaluateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const subject = searchParams.get("subject")
  const rollNumber = searchParams.get("rollNumber")

  const [pdfUrl, setPdfUrl] = useState("")
  const [totalQuestions, setTotalQuestions] = useState(20)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [selectedMark, setSelectedMark] = useState(null)
  const [evaluationData, setEvaluationData] = useState([])
  const [showPageSelection, setShowPageSelection] = useState(true)
  const [blankPages, setBlankPages] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isDataLoaded, setIsDataLoaded] = useState(false); // New state to track if initial data is loaded

  // --- Security Feature 1: Disable Right-Click (Context Menu) ---
  useEffect(() => {
    const disableContextMenu = (e) => {
      e.preventDefault()
    }
    document.addEventListener("contextmenu", disableContextMenu)
    return () => {
      document.removeEventListener("contextmenu", disableContextMenu)
    }
  }, [])

  // --- Security Feature 2: Disable Keyboard Shortcuts (e.g., F12, Ctrl+Shift+I for DevTools) ---
  // Note: This is a deterrent, not foolproof. Users can bypass this easily.
  useEffect(() => {
    const disableDevToolsShortcuts = (e) => {
      // F12 key
      if (e.keyCode === 123) {
        e.preventDefault();
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (view source)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) {
        e.preventDefault();
      }
      if (e.ctrlKey && e.keyCode === 85) { // Ctrl+U
        e.preventDefault();
      }
      // Cmd+Option+I (for Mac)
      if (e.metaKey && e.altKey && e.keyCode === 73) {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", disableDevToolsShortcuts);
    return () => {
      document.removeEventListener("keydown", disableDevToolsShortcuts);
    };
  }, []);

  // --- Security Feature 3: Prevent Text Selection ---
  useEffect(() => {
    const disableTextSelection = (e) => {
      if (e.target.nodeName === 'CANVAS' || e.target.closest('.pdf-viewer-container')) { // Target PDF viewer area
        e.preventDefault();
      }
    };
    document.addEventListener("selectstart", disableTextSelection);
    return () => {
      document.removeEventListener("selectstart", disableTextSelection);
    };
  }, []);


  useEffect(() => {
    if (subject && rollNumber) {
      loadEvaluationData()
    }
  }, [subject, rollNumber]) // Dependencies for useEffect

  // Using useCallback for functions passed down to children to prevent unnecessary re-renders
  const loadEvaluationData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch answer sheet URL and total questions
      const response = await fetch(`/api/evaluation-data?subject=${subject}&rollNumber=${rollNumber}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json()

      setPdfUrl(data.answerSheetUrl || "/placeholder.pdf")
      setTotalQuestions(data.totalQuestions || 20)

      // Fetch existing evaluation data if any
      const existingEvaluationResponse = await fetch(`/api/evaluation?subject=${subject}&rollNumber=${rollNumber}`)
      if (existingEvaluationResponse.ok) {
        const existing = await existingEvaluationResponse.json()
        setEvaluationData(existing.evaluationData || [])
        setBlankPages(existing.blankPages || [])
      }
      setIsDataLoaded(true); // Mark data as loaded
    } catch (error) {
      console.error("Error loading evaluation data:", error)
      alert("Failed to load evaluation data. Please try again.")
      router.push("/"); // Redirect on load failure for security/usability
    } finally {
      setLoading(false)
    }
  }, [subject, rollNumber, router]) // Add router to dependencies

  const handlePDFClick = useCallback((x, y, pageNumber) => {
    if (selectedQuestion && selectedMark !== null && !blankPages.includes(pageNumber)) {
      const newEvaluation = {
        questionNumber: selectedQuestion,
        marks: selectedMark,
        coordinates: { x, y, pageNumber },
        timestamp: new Date().toISOString(),
      }
      setEvaluationData((prev) => {
        // Filter out existing entry for the same questionNumber and add the new one
        const filtered = prev.filter((item) => item.questionNumber !== selectedQuestion)
        return [...filtered, newEvaluation]
      })

      // Reset selections after a mark is applied
      setSelectedQuestion(null)
      setSelectedMark(null)
    }
  }, [selectedQuestion, selectedMark, blankPages]) // Dependencies for useCallback

  const handleSubmitEvaluation = useCallback(async () => {
    if (evaluationData.length === 0) {
      alert("No evaluation data to submit. Please mark at least one question.")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        subject,
        rollNumber,
        evaluationData,
        blankPages,
        totalQuestions,
        submittedAt: new Date().toISOString(),
      }
      console.log("Submitting evaluation data:", payload); // For debugging, remove in production
      const response = await fetch("/api/submit-evaluation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // --- Security Feature 4: Add a simple CSRF token (for more robust protection, use a dedicated library) ---
          // This assumes your server issues a token and expects it back.
          // For now, it's illustrative. A real CSRF token should be more dynamic.
          // "X-CSRF-Token": "YOUR_CLIENT_SIDE_CSRF_TOKEN_HERE"
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert("Evaluation submitted successfully!")
        router.push("/") // Redirect to home or a success page
      } else if (response.status === 401 || response.status === 403) {
        // --- Security Feature 5: Handle Unauthorized/Forbidden access ---
        alert("Session expired or unauthorized access. Please log in again.");
        router.push("/login"); // Redirect to login page
      }
      else {
        // Attempt to read error message from server if available
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to submit evaluation");
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error)
      alert(`Failed to submit evaluation: ${error.message || "Please try again."}`)
    } finally {
      setSubmitting(false)
    }
  }, [subject, rollNumber, evaluationData, blankPages, totalQuestions, router]) // Dependencies for useCallback

  const getTotalMarks = useCallback(() => {
    return evaluationData.reduce((total, item) => total + item.marks, 0)
  }, [evaluationData]) // Dependencies for useCallback

  // Show loading spinner if data is not yet loaded
  if (loading && !isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-700">Loading evaluation data...</p>
        </div>
      </div>
    )
  }

  if (!pdfUrl && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-lg font-semibold text-red-600 mb-4">
            Error: Answer sheet not found or invalid parameters.
          </p>
          <Button onClick={() => router.push("/")} variant="destructive">
            Go back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    // --- Security Feature 7: Prevent Copying/Pasting on the entire page ---
    // Note: User can still use browser's "Print to PDF" or screenshots.
    <div
      className="min-h-screen bg-gray-50 select-none pointer-events-auto"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()} // Prevent dragging images/text
    >

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/home")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {subject?.toUpperCase()} - Roll No: {rollNumber}
                </h1>
                <p className="text-sm text-gray-500">
                  Total Marks: {getTotalMarks()} | Questions Evaluated: {evaluationData.length}/{totalQuestions}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* You can re-enable this button if needed, perhaps with a different text */}
              {/* <Button
                variant="outline"
                onClick={() => setShowPageSelection(true)} // Example: Show page selection again
                className="mr-2"
              >
                Manage Blank Pages
              </Button> */}

              <Button onClick={handleSubmitEvaluation} disabled={submitting || evaluationData.length === 0}>
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Submitting..." : "Submit Evaluation"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
          {/* Marks Panel - Left */}
          <div className="col-span-2">
            <MarksPanel selectedMark={selectedMark} onMarkSelect={setSelectedMark} />
          </div>

          {/* PDF Viewer - Center */}
          <div className="col-span-8">
            <Card className="h-full">
              <CardContent className="p-2 h-full pdf-viewer-container"> {/* Added class for selection disabling */}
                <PDFViewer
                  pdfUrl={pdfUrl}
                  onPDFClick={handlePDFClick}
                  evaluationData={evaluationData}
                  blankPages={blankPages}
                  selectedQuestion={selectedQuestion}
                  selectedMark={selectedMark}
                />
              </CardContent>
            </Card>
          </div>

          {/* Question Panel - Right */}
          <div className="col-span-2">
            <QuestionPanel
              totalQuestions={totalQuestions}
              selectedQuestion={selectedQuestion}
              onQuestionSelect={setSelectedQuestion}
              evaluationData={evaluationData}
            />
          </div>
        </div>
      </div>

      {/* Page Selection Popup - Only shown when showPageSelection is true */}
      {showPageSelection && (
        <PageSelectionPopup
          pdfUrl={pdfUrl}
          blankPages={blankPages}
          onBlankPagesChange={setBlankPages}
          onClose={() => setShowPageSelection(false)}
        />
      )}
    </div>
  )
}

export default function EvaluatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid"></div>
        </div>
      }
    >
      <EvaluateContent />
    </Suspense>
  )
}