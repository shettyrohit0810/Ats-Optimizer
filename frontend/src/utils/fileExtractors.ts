// Dynamic imports to avoid SSR issues
let pdfjsLib: any = null;
let mammoth: any = null;

// Initialize PDF.js only on client-side
const initializePdfjs = async () => {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    
    // Use the local worker file from public directory
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
  return pdfjsLib;
};

// Initialize Mammoth only on client-side
const initializeMammoth = async () => {
  if (typeof window !== 'undefined' && !mammoth) {
    mammoth = await import('mammoth');
  }
  return mammoth;
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const pdfjs = await initializePdfjs();
    if (!pdfjs) {
      throw new Error('PDF.js not available');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer.slice(0) }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const extractTextFromDOCX = async (file: File): Promise<string> => {
  try {
    const mammothLib = await initializeMammoth();
    if (!mammothLib) {
      throw new Error('Mammoth not available');
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammothLib.extractRawText({ arrayBuffer: arrayBuffer.slice(0) });
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to extract text from DOCX');
  }
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;
  
  if (fileType === 'application/pdf') {
    return await extractTextFromPDF(file);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return await extractTextFromDOCX(file);
  } else {
    throw new Error('Unsupported file type');
  }
}; 