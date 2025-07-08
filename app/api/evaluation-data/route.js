export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get("subject")
  const rollNumber = searchParams.get("rollNumber")

  // Mock response - replace with actual API call
  const mockData = {
    subject,
    rollNumber,
    answerSheetUrl: "/placeholder.pdf",
    totalQuestions: 50,
  }

  return Response.json(mockData)
}
