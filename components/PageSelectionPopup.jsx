"use client";
import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { X, Check } from "lucide-react";
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function PageSelectionPopup({ pdfUrl, blankPages, onBlankPagesChange, onClose }) {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [localBlankPages, setLocalBlankPages] = useState([...blankPages]);
  const [pdfLoadError, setPdfLoadError] = useState(null);
  const [documentLoaded, setDocumentLoaded] = useState(false);

 
  useEffect(() => {
    if (pdfUrl) { 
      console.log("PDF URL is available, attempting to load:", pdfUrl);
      setLoading(false); 
      setPdfLoadError(null); 
      setNumPages(0); 
      setDocumentLoaded(true); 
    } else {
      
      console.log("PDF URL is not available.");
      setLoading(true);
      setDocumentLoaded(false);
      setPdfLoadError(null); 
      setNumPages(0);
    }
  }, [pdfUrl]);

  function onDocumentLoadSuccess({ numPages: loadedNumPages }) {
    console.log("Document loaded with pages:", loadedNumPages);
    setNumPages(loadedNumPages);
    setLoading(false);
    setDocumentLoaded(true);
    setPdfLoadError(null);
  }

  // const handlePdfLoadError = (error) => {
  //   console.error("PDF load error:", error);
  //   setPdfLoadError(error.message || "Failed to load PDF");
  //   setLoading(false);
  //   setDocumentLoaded(false);
  // };

  const toggleBlankPage = (pageNumber) => {
    setLocalBlankPages((prev) => {
      if (prev.includes(pageNumber)) {
        return prev.filter((p) => p !== pageNumber);
      } else {
        return [...prev, pageNumber].sort((a, b) => a - b);
      }
    });
  };

  const handleSave = () => {
    onBlankPagesChange(localBlankPages);
    onClose();
  };

  if (!pdfUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Missing PDF</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">No PDF URL provided</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pdfLoadError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading PDF</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{pdfLoadError}</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Select Blank Pages</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="ml-2">Loading PDF...</p>
            </div>
          )}

          {documentLoaded && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Click on pages that are blank or should not be evaluated.
              </div>
              
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                //onLoadError={handlePdfLoadError}
                loading={null} // We handle loading state ourselves
              >
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {Array.from({ length: numPages }, (_, i) => {
                    const pageNumber = i + 1;
                    const isBlank = localBlankPages.includes(pageNumber);

                    return (
                      <div
                        key={pageNumber}
                        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                          isBlank ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => toggleBlankPage(pageNumber)}
                      >
                        <Page
                          pageNumber={pageNumber}
                          scale={0.2}
                          className="pointer-events-none"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs text-center py-1">
                          Page {pageNumber}
                        </div>
                        {isBlank && (
                          <div className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center">
                            <X className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Document>
            </>
          )}
        </CardContent>

        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {localBlankPages.length} pages marked as blank
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}