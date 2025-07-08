// components/MarksPanel.jsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"

const markOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function MarksPanel({ selectedMark, onMarkSelect }) {
  return (
    <Card className="h-full flex flex-col shadow-lg border border-gray-200">
      <CardHeader className="pb-3 border-b bg-gray-50">
        <CardTitle className="text-lg font-semibold text-gray-800">Marks</CardTitle>
        <div className="text-sm text-gray-600">Select marks to assign</div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div className="grid grid-cols-4 gap-2">
          {markOptions.map((mark) => (
            <Button
              key={mark}
              variant={selectedMark === mark ? "default" : "outline"}
              className={`h-10 text-base font-medium transition-all duration-200 
                          ${selectedMark === mark 
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md ring-2 ring-blue-500 ring-offset-1" 
                              : "hover:bg-gray-100 border border-gray-300 text-gray-700"
                          }`}
              onClick={() => onMarkSelect(mark)}
            >
              {mark}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}