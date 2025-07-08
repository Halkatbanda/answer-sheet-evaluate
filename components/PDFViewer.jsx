// components/PDFViewer.jsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "./ui/button";

import dynamic from "next/dynamic";

const PdfRenderer = dynamic(() => import("./PdfRenderer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">PDF Viewer is Loading...</p>
      </div>
    </div>
  ),
});

const PdfPage = dynamic(() => import("react-pdf").then(mod => mod.Page), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 animate-pulse"></div> 
});

export default function PDFViewer({
  pdfUrl,
  onPDFClick,
  onPDFLoaded,
  evaluationData, 
  blankPages,
  selectedQuestion, 
  selectedMark,     
}) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    if (onPDFLoaded) {
      onPDFLoaded(numPages); 
    }
    console.log("PDFViewer: Document loaded successfully. Page:", numPages);
  }

  const onDocumentLoadError = (error) => {
    console.error("PDFViewer: Error in loading document:", error);
    setError("PDF fail in loading pdf: " + (error.message || "unknown error"));
    setLoading(false);
  };

  useEffect(() => {
    console.log("PDFViewer: PDF URL changed:", pdfUrl);
    if (!pdfUrl) {
      setLoading(true);
      setError("no PDF URL provided.");
      setNumPages(0);
      setPageNumber(1);
      setScale(1.0);
    } else {
      setLoading(false); 
      setError(null);
      setPageNumber(1);
      setScale(1.0);
    }
  }, [pdfUrl]);

  const handlePageClick = (event) => {
    if (blankPages.includes(pageNumber)) {
      alert("this is a blank page. Please select a different page.");
      return;
    }


    if (!selectedQuestion || selectedMark === null) {
      alert("Please select a question and marks before clicking on the PDF.");
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    onPDFClick(x, y, pageNumber); 
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(numPages, prev + 1));
  const zoomIn = () => setScale((prev) => Math.min(2.0, prev + 0.2));
  const zoomOut = () => setScale((prev) => Math.max(0.5, prev - 0.2));

  const getMarkStyles = (item) => {
    const isCurrentSelected = selectedQuestion !== null && selectedQuestion === item.questionNumber;
    let baseStyles = {
       position: 'absolute',
    left: `${item.coordinates.x}%`,
    top: `${item.coordinates.y}%`,
    background: isCurrentSelected ? 'rgba(255, 165, 0, 0.9)' : 'rgba(52, 152, 219, 0.9)',
    color: 'white',
    borderRadius: '4px',
    minWidth: '60px',
    padding: '4px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    boxShadow: isCurrentSelected ? '0 0 10px rgba(255,165,0,0.7)' : '0 0 5px rgba(0,0,0,0.3)',
    border: '2px solid white',
    textAlign: 'center',
    lineHeight: '1.2',
    textShadow: '0 1px 1px rgba(0,0,0,0.3)',
    };

    if (selectedQuestion !== null && selectedQuestion === item.questionNumber) {
      baseStyles.background = 'rgba(255, 165, 0, 0.95)'; 
      baseStyles.boxShadow = '0 0 10px rgba(255,165,0,0.8)';
      baseStyles.transform = 'translate(-50%, -50%) scale(1.1)';
      baseStyles.zIndex = 11; 
    }

    return baseStyles;
  };

  const isBlankPage = blankPages.includes(pageNumber);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-red-50 rounded-lg text-red-700 p-4">
        <p className="font-semibold text-lg mb-2">Error in loading pdf:</p>
        <p className="text-center">{error}</p>
        <p className="text-sm mt-2">Please ensure that the PDF URL is valid and accessible, and that the worker is set up correctly.</p>
      </div>
    );
  }

  if (loading || !pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">PDF is Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-2 bg-white border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">
            {pageNumber} / {numPages || "..."}
            {isBlankPage && <span className="text-red-500 ml-2">(BLANK)</span>}
          </span>
          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={pageNumber >= numPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 2.0}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {selectedQuestion !== null && selectedMark !== null && (
        <div className="bg-blue-50 border-b p-2 text-center flex-shrink-0">
          <p className="text-sm text-blue-700 font-semibold">
            Ready to mark: Question {selectedQuestion} with {selectedMark} marks – Click on PDF
          </p>
        </div>
      )}
      {selectedQuestion === null && selectedMark === null && (
        <div className="bg-gray-50 border-b p-2 text-center text-gray-600 text-sm flex-shrink-0">
          Select a question and marks to start the evaluation.
        </div>
      )}

      <div className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center items-start">
        <div className="relative">
          <PdfRenderer
            file={pdfUrl}
            onDocumentLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-full w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-2 text-gray-500">Document is Loading...</p>
              </div>
            }
          >
            <div
              onClick={handlePageClick}
              className={`relative shadow-lg ${!isBlankPage ? "cursor-crosshair" : "cursor-not-allowed opacity-70"}`}
              style={{ minWidth: '400px', minHeight: '600px' }}
            >
              <PdfPage
                pageNumber={pageNumber}
                scale={scale}
                renderAnnotationLayer={true}
                renderTextLayer={true}
                onRenderError={(err) => console.error(`PDFViewer: Page ${pageNumber} Rendering Error:`, err)}
              />

              {evaluationData
                .filter(item => item.coordinates?.pageNumber === pageNumber)
                .map((item) => (
                  <div
                    key={`mark-${item.questionNumber}-${item.coordinates.x}-${item.coordinates.y}`}
                    style={getMarkStyles(item)}
                  >
                    <span>Q: {item.questionNumber}</span>
                    <span>M: {item.marks}</span>
                  </div>
                ))}
              {isBlankPage && (
                <div className="absolute inset-0 bg-red-100 bg-opacity-30 flex items-center justify-center pointer-events-none">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">Blank Page</div>
                </div>
              )}
            </div>
          </PdfRenderer>
        </div>
      </div>
    </div>
  );
}