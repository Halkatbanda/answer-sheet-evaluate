import { pdfjs } from 'react-pdf';

if (pdfjs.GlobalWorkerOptions.workerSrc === 'pdf.worker.min.mjs') { 
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
}

