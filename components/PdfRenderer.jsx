"use client";

import { useEffect, useState, useCallback } from "react"; // useCallback भी जोड़ा
import { Document, Page, pdfjs } from "react-pdf";

// Make sure your workerSrc path is correct.
// If /public/pdf.worker.min.mjs, then '/pdf.worker.min.mjs' is correct.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const RETRY_DELAY_MS = 3000; // 3 सेकंड का विलंब (delay) प्रत्येक पुनः प्रयास के बीच

export default function PdfRenderer({
  file,
  pageNumber,
  scale,
  onDocumentLoadSuccess, // Parent से पास किया गया सक्सेस कॉलबैक
  onLoadError,           // Parent से पास किया गया एरर कॉलबैक
  children,
}) {
  const [isClient, setIsClient] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [error, setError] = useState(null); // त्रुटि को स्टोर करने के लिए
  const [retryCount, setRetryCount] = useState(0); // पुनः प्रयासों की संख्या ट्रैक करने के लिए

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- PDF डॉक्यूमेंट लोड होने पर आंतरिक हैंडलर ---
  const handleInternalDocumentLoadSuccess = useCallback((pdf) => {
    setIsLoadingPdf(false); // PDF सफलतापूर्वक लोड हो गया है
    setError(null);         // कोई त्रुटि नहीं है
    setRetryCount(0);       // पुनः प्रयास काउंटर रीसेट करें
    if (onDocumentLoadSuccess) {
      onDocumentLoadSuccess(pdf); // पैरेंट कॉम्पोनेंट को इवेंट पास करें
    }
  }, [onDocumentLoadSuccess]);

  // --- PDF डॉक्यूमेंट लोड होने में त्रुटि आने पर आंतरिक हैंडलर ---
  const handleInternalLoadError = useCallback((err) => {
    console.error(`Attempt ${retryCount + 1} failed to load PDF document:`, err);
    setError(err); // त्रुटि को स्टोर करें
    setIsLoadingPdf(true); // लोडिंग स्टेट को ट्रू रखें ताकि रीट्राय मैसेज दिखे
    
    // पुनः प्रयास की संख्या बढ़ाएं और थोड़ी देर बाद फिर से कोशिश करें
    setTimeout(() => {
      setRetryCount(prevCount => prevCount + 1);
    }, RETRY_DELAY_MS);

    if (onLoadError) {
      onLoadError(err); // पैरेंट कॉम्पोनेंट को एरर पास करें
    }
  }, [retryCount, onLoadError]);

  // --- पुनः प्रयास लॉजिक ---
  // जब `retryCount` बदलता है, तो यह फिर से रेंडरिंग को ट्रिगर करेगा,
  // और `Document` कॉम्पोनेंट फिर से `file` प्रोप को प्रोसेस करने का प्रयास करेगा।
  useEffect(() => {
    if (isClient && error) { // केवल क्लाइंट-साइड पर और अगर कोई त्रुटि है तो ही
      setIsLoadingPdf(true); // लोडिंग स्थिति सक्रिय करें
      setError(null);        // पिछली त्रुटि को साफ करें
    }
  }, [retryCount, isClient, error]); // जब भी retryCount बढ़ता है, यह फिर से ट्रिगर होता है

  if (!isClient) {
    // अगर अभी क्लाइंट-साइड नहीं है (जैसे कि Next.js में सर्वर-साइड रेंडरिंग के दौरान)
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Preparing viewer...</p>
      </div>
    );
  }

  return (
    <>
      {(isLoadingPdf || error) && ( // लोडर दिखाएं अगर लोडिंग हो रही है या कोई त्रुटि है
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10 rounded-lg">
          <div className="text-center">
            {error ? (
              <>
                <p className="text-lg font-medium text-red-600 mb-2">Error loading PDF!</p>
                <p className="text-sm text-gray-700 mb-4">Retrying in {RETRY_DELAY_MS / 1000} seconds (Attempt {retryCount + 1})...</p>
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500 mx-auto"></div>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-700">Loading PDF...</p>
                <p className="text-sm text-gray-500 mt-1">Please wait</p>
              </>
            )}
          </div>
        </div>
      )}
      <Document
        key={retryCount} // key को retryCount से बांधें ताकि हर पुनः प्रयास पर Document को फिर से माउंट किया जा सके
        file={file}
        onLoadSuccess={handleInternalDocumentLoadSuccess}
        onLoadError={handleInternalLoadError}
        className={isLoadingPdf || error ? "opacity-0" : "opacity-100 transition-opacity duration-300"} // लोडिंग या त्रुटि के दौरान छिपाएं
      >
        {children}
      </Document>
    </>
  );
}