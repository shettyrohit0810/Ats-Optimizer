"use client";

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import * as mammoth from 'mammoth';

// PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface FileViewerProps {
  file: File;
}

const FileViewer = ({ file }: FileViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [docxHtml, setDocxHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const processFile = async () => {
      setIsLoading(true);
      setError('');
      try {
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocxHtml(result.value);
        }
      } catch (e) {
        console.error('Error processing file:', e);
        setError('Could not display the document.');
      } finally {
        setIsLoading(false);
      }
    };
    processFile();
  }, [file]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF file.');
    setIsLoading(false);
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-4">Loading preview...</div>;
    }
    if (error) {
      return <div className="text-center p-4 text-red-500">{error}</div>;
    }

    if (file.type === 'application/pdf') {
      return (
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
        >
          {Array.from(new Array(numPages || 0), (el, index) => (
            <div key={`page_wrapper_${index + 1}`} className="mb-2 last:mb-0">
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={containerWidth ? containerWidth - 20 : undefined}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          ))}
        </Document>
      );
    }

    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return (
        <div 
          className="p-4 mammoth-docx-preview"
          dangerouslySetInnerHTML={{ __html: docxHtml }} 
        />
      );
    }

    return <div className="text-center p-4">Unsupported file type.</div>;
  };

  return (
    <div ref={containerRef} className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 h-full overflow-y-auto" style={{ maxHeight: '80vh' }}>
      {renderContent()}
    </div>
  );
};

export default FileViewer; 