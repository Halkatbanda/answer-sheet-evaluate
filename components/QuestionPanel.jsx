// components/QuestionPanel.jsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge" 


export default function QuestionPanel({ totalQuestions, selectedQuestion, onQuestionSelect, evaluationData }) {
  const isQuestionEvaluated = (questionNumber) => {
    return evaluationData.some((item) => item.questionNumber === questionNumber)
  }

  // getQuestionMarks is no longer needed if marks are not displayed here
  // const getQuestionMarks = (questionNumber) => {
  //   const evaluation = evaluationData.find((item) => item.questionNumber === questionNumber)
  //   return evaluation ? evaluation.marks : null
  // }

  return (
    <Card className="h-full flex flex-col shadow-lg border border-gray-200">
      <CardHeader className="pb-3 border-b bg-gray-50">
        <CardTitle className="text-lg font-semibold text-gray-800">Questions</CardTitle>
        <div className="text-sm text-gray-600">
          <span className="font-medium text-blue-700">{evaluationData.length}</span> / {totalQuestions} evaluated
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div className="grid grid-cols-4 gap-2"> 
          {Array.from({ length: totalQuestions }, (_, i) => {
            const questionNumber = i + 1
            const isSelected = selectedQuestion === questionNumber
            const isEvaluated = isQuestionEvaluated(questionNumber)
            // Marks are no longer retrieved as they won't be displayed
            // const marks = getQuestionMarks(questionNumber)

            return (
              <Button
                key={questionNumber}
                variant={
                  isSelected
                    ? "default" 
                    : isEvaluated
                    ? "outline" 
                    : "outline" 
                }
                className={`h-10 text-base font-medium transition-all duration-200 
                            flex items-center justify-center text-center
                            ${isSelected
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md ring-2 ring-blue-500 ring-offset-1" 
                                : isEvaluated
                                ? "bg-green-100 hover:bg-green-200 text-green-800 border-green-300" 
                                : "hover:bg-gray-100 border border-gray-300 text-gray-700" 
                            }`}
                onClick={() => onQuestionSelect(questionNumber)}
              >
                <span className="font-semibold">Q{questionNumber}</span>

                {!isEvaluated && selectedQuestion === questionNumber && (
                  <Badge variant="outline" className="text-xs px-1 py-0.5 rounded-full bg-white text-blue-600 absolute bottom-1 right-1">
                    Sel.
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}