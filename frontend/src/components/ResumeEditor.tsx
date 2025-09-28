"use client";

import React, { useState, useEffect, useRef } from 'react';

// Dynamically import Monaco Editor to avoid SSR issues
// const Editor = dynamic(() => import('@monaco-editor/react'), {
//   ssr: false,
//   loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded flex items-center justify-center">
//     <p className="text-gray-500">Loading editor...</p>
//   </div>
// });

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  location: string;
  linkedin: string;
  github: string;
  personal_website: string;
}

interface Education {
  school: string;
  degree: string;
  location: string;
  graduation_date: string;
  gpa: string;
  relevant_courses: string[];
}

interface Experience {
  title: string;
  company: string;
  location: string;
  dates: string;
  highlights: string[];
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  link: string;
  highlights: string[];
  start_date: string;
  end_date: string;
  duration: string;
}

interface TechnicalSkills {
  languages: string[];
  frameworks_and_libraries: string[];
  databases: string[];
  cloud_technologies: string[];
  other_tools: string[];
}

interface ResumeData {
  contact_info: ContactInfo;
  professional_summary: string;
  skills: {
    technical: TechnicalSkills;
    soft: string[];
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  projects: Project[];
  experience: Experience[];
  education: Education[];
  achievements: string[];
  languages: string[];
  interests: string[];
  honors: string[];
  extra_curricular: string[];
}

interface ResumeEditorProps {
  resumeData: ResumeData | null;
  onDataChange: (data: ResumeData) => void;
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ resumeData, onDataChange }) => {
  const [data, setData] = useState<ResumeData | null>(resumeData);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(resumeData);
  }, [resumeData]);

  const downloadAsPDF = async () => {
    if (!resumeRef.current || isGeneratingPDF) return;

    setIsGeneratingPDF(true);

    try {
      // Dynamically import the libraries to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      // Create a temporary clone of the resume element for PDF generation
      const clonedElement = resumeRef.current.cloneNode(true) as HTMLElement;
      
      // Remove interactive elements from clone
      const buttonsInClone = clonedElement.querySelectorAll('button');
      buttonsInClone.forEach(button => button.remove());
      
      // Convert all input and textarea elements to span elements with their values
      const inputs = clonedElement.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        const span = document.createElement('span');
        if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
          span.textContent = input.value || input.placeholder || '';
          span.className = input.className.replace(/focus:[^\s]*/g, ''); // Remove focus classes
          // Copy computed styles for proper rendering
          const computedStyle = window.getComputedStyle(input);
          span.style.fontWeight = computedStyle.fontWeight;
          span.style.fontStyle = computedStyle.fontStyle;
          span.style.fontSize = computedStyle.fontSize;
          span.style.color = '#000000'; // Force black color
          span.style.display = 'inline';
          span.style.whiteSpace = input.tagName === 'TEXTAREA' ? 'pre-wrap' : 'nowrap';
        }
        input.parentNode?.replaceChild(span, input);
      });
      
      // Strip all CSS custom properties and force basic colors on all elements
      const allElements = clonedElement.querySelectorAll('*');
      allElements.forEach(element => {
        if (element instanceof HTMLElement) {
          // Remove any CSS custom properties
          const style = element.style;
          for (let i = style.length - 1; i >= 0; i--) {
            const property = style[i];
            if (property.startsWith('--')) {
              style.removeProperty(property);
            }
          }
          
          // Force safe colors for any inline styles
          if (style.color && (style.color.includes('oklch') || style.color.includes('color('))) {
            style.color = '#000000';
          }
          if (style.backgroundColor && (style.backgroundColor.includes('oklch') || style.backgroundColor.includes('color('))) {
            style.backgroundColor = 'transparent';
          }
          if (style.borderColor && (style.borderColor.includes('oklch') || style.borderColor.includes('color('))) {
            style.borderColor = '#000000';
          }
        }
      });
      
      // Add comprehensive CSS for PDF rendering
      const style = document.createElement('style');
      style.textContent = `
        /* Complete CSS reset to eliminate OKLCH and modern color functions */
        .pdf-temp-container,
        .pdf-temp-container *,
        .pdf-temp-container *::before,
        .pdf-temp-container *::after {
          color: #000000 !important;
          background-color: transparent !important;
          border-color: #000000 !important;
          outline-color: #000000 !important;
          text-decoration-color: #000000 !important;
          fill: #000000 !important;
          stroke: #000000 !important;
          box-shadow: none !important;
          text-shadow: none !important;
          filter: none !important;
          backdrop-filter: none !important;
        }
        
        .pdf-temp-container {
          background-color: #ffffff !important;
          font-family: Arial, sans-serif !important;
          font-size: 11px !important;
          line-height: 1.4 !important;
          color: #000000 !important;
          width: 8.5in !important;
          min-height: 11in !important;
          max-width: 8.5in !important;
          padding: 0.75in !important;
          box-sizing: border-box !important;
          overflow: visible !important;
        }
        .pdf-temp-container * {
          box-sizing: border-box !important;
          max-width: 100% !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        
        /* Explicit color overrides for specific classes */
        .pdf-temp-container .text-blue-600,
        .pdf-temp-container [class*="text-blue"] {
          color: #2563eb !important;
        }
        .pdf-temp-container .text-gray-600,
        .pdf-temp-container [class*="text-gray-6"] {
          color: #4b5563 !important;
        }
        .pdf-temp-container .text-gray-700,
        .pdf-temp-container [class*="text-gray-7"] {
          color: #374151 !important;
        }
        .pdf-temp-container .text-gray-800,
        .pdf-temp-container [class*="text-gray-8"] {
          color: #1f2937 !important;
        }
        .pdf-temp-container .text-black,
        .pdf-temp-container [class*="text-black"] {
          color: #000000 !important;
        }
        
        /* Font and text styling */
        .pdf-temp-container .text-xl {
          font-size: 18px !important;
        }
        .pdf-temp-container .text-lg {
          font-size: 16px !important;
        }
        .pdf-temp-container .text-sm {
          font-size: 12px !important;
        }
        .pdf-temp-container .text-xs {
          font-size: 10px !important;
        }
        .pdf-temp-container .font-bold {
          font-weight: bold !important;
        }
        .pdf-temp-container .font-semibold {
          font-weight: 600 !important;
        }
        .pdf-temp-container .italic {
          font-style: italic !important;
        }
        .pdf-temp-container .text-center {
          text-align: center !important;
        }
        .pdf-temp-container .text-right {
          text-align: right !important;
        }
        .pdf-temp-container .uppercase {
          text-transform: uppercase !important;
        }
        .pdf-temp-container .tracking-wide {
          letter-spacing: 0.025em !important;
        }
        
        /* Border styling */
        .pdf-temp-container .border-b {
          border-bottom: 1px solid #000000 !important;
        }
        .pdf-temp-container .border-gray-400,
        .pdf-temp-container [class*="border-gray"] {
          border-color: #9ca3af !important;
        }
        
        /* Spacing and layout */
        .pdf-temp-container .space-y-4 > * + * {
          margin-top: 12px !important;
        }
        .pdf-temp-container .space-y-3 > * + * {
          margin-top: 8px !important;
        }
        .pdf-temp-container .space-y-2 > * + * {
          margin-top: 8px !important;
        }
        .pdf-temp-container .space-y-1 > * + * {
          margin-top: 4px !important;
        }
        .pdf-temp-container .mb-4 {
          margin-bottom: 12px !important;
        }
        .pdf-temp-container .mb-3 {
          margin-bottom: 8px !important;
        }
        .pdf-temp-container .mb-2 {
          margin-bottom: 8px !important;
        }
        .pdf-temp-container .mb-1 {
          margin-bottom: 4px !important;
        }
        .pdf-temp-container .mt-2 {
          margin-top: 8px !important;
        }
        .pdf-temp-container .mt-1 {
          margin-top: 4px !important;
        }
        .pdf-temp-container .pb-3 {
          padding-bottom: 12px !important;
        }
        .pdf-temp-container .pb-1 {
          padding-bottom: 4px !important;
        }
        
        /* Flexbox and layout */
        .pdf-temp-container .flex {
          display: flex !important;
        }
        .pdf-temp-container .flex-wrap {
          flex-wrap: wrap !important;
        }
        .pdf-temp-container .justify-center {
          justify-content: center !important;
        }
        .pdf-temp-container .justify-between {
          justify-content: space-between !important;
        }
        .pdf-temp-container .items-start {
          align-items: flex-start !important;
        }
        .pdf-temp-container .items-center {
          align-items: center !important;
        }
        .pdf-temp-container .gap-1 {
          gap: 4px !important;
        }
        .pdf-temp-container .gap-2 {
          gap: 8px !important;
        }
        .pdf-temp-container .flex-1 {
          flex: 1 !important;
        }
        .pdf-temp-container .w-24 {
          width: 6rem !important;
        }
        .pdf-temp-container .mr-2 {
          margin-right: 8px !important;
        }
        .pdf-temp-container .mr-4 {
          margin-right: 16px !important;
        }
        .pdf-temp-container .mt-0\.5 {
          margin-top: 2px !important;
        }
        
        /* Force visibility and dimensions */
        .pdf-temp-container [style*="display: none"] {
          display: block !important;
        }
        .pdf-temp-container [style*="width: 0"] {
          width: auto !important;
        }
        .pdf-temp-container [style*="height: 0"] {
          height: auto !important;
        }
        .pdf-temp-container [style*="visibility: hidden"] {
          visibility: visible !important;
        }
        .pdf-temp-container [style*="opacity: 0"] {
          opacity: 1 !important;
        }
        
        /* Remove any CSS variables that might contain OKLCH */
        .pdf-temp-container * {
          --tw-bg-opacity: 1 !important;
          --tw-text-opacity: 1 !important;
          --tw-border-opacity: 1 !important;
          --tw-ring-opacity: 1 !important;
          --tw-shadow: none !important;
          --tw-ring-shadow: none !important;
          --tw-ring-color: transparent !important;
        }
      `;
      document.head.appendChild(style);
      
      // Create temporary container with exact PDF dimensions
      const tempContainer = document.createElement('div');
      tempContainer.className = 'pdf-temp-container';
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.visibility = 'hidden';
      tempContainer.appendChild(clonedElement);
      
      document.body.appendChild(tempContainer);

      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      let canvas;
      try {
        // Create canvas with exact dimensions and settings
        canvas = await html2canvas(tempContainer, {
          scale: 1.5, // Slightly lower scale for better performance
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          width: Math.ceil(tempContainer.scrollWidth),
          height: Math.ceil(tempContainer.scrollHeight),
          windowWidth: Math.ceil(tempContainer.scrollWidth),
          windowHeight: Math.ceil(tempContainer.scrollHeight),
          onclone: (clonedDoc) => {
            // Ensure all elements are visible in the cloned document
            const clonedContainer = clonedDoc.querySelector('.pdf-temp-container') as HTMLElement;
            if (clonedContainer) {
              clonedContainer.style.position = 'static';
              clonedContainer.style.visibility = 'visible';
            }
          }
        });
      } finally {
        // Always clean up temporary elements
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }

      // Create PDF with exact letter dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter', // 8.5" x 11" = 612 x 792 points
        compress: true
      });

      const imgData = canvas.toDataURL('image/png', 0.95); // Slight compression for smaller file
      const pdfWidth = 612; // Letter width in points
      const pdfHeight = 792; // Letter height in points
      
      // Calculate optimal scaling to fit on single page if possible
      // const imgAspectRatio = canvas.width / canvas.height;
      // const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let imgWidth = pdfWidth;
      let imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // If content would fit on one page with slight scaling, do that
      if (imgHeight > pdfHeight && imgHeight <= pdfHeight * 1.1) {
        // Scale down slightly to fit on one page
        imgHeight = pdfHeight;
        imgWidth = (canvas.width * pdfHeight) / canvas.height;
        
        // Center horizontally if scaled down
        const xOffset = (pdfWidth - imgWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 0, imgWidth, imgHeight);
      } else {
        // Use multi-page approach for longer content
        let position = 0;
        let heightLeft = imgHeight;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add additional pages if content overflows
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage('letter', 'portrait');
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      }

      // Generate filename with proper sanitization
      const name = data?.contact_info?.name || 'resume';
      const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const filename = `${sanitizedName}_resume.pdf`;

      // Save the PDF
      pdf.save(filename);

      // Success notification
      console.log('PDF generated successfully:', filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // More detailed error messaging
      let errorMessage = 'Failed to generate PDF. ';
      if (error instanceof Error) {
        if (error.message.includes('canvas')) {
          errorMessage += 'Canvas rendering failed. Please try refreshing the page.';
        } else if (error.message.includes('jsPDF')) {
          errorMessage += 'PDF creation failed. Please check your browser compatibility.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      alert(errorMessage);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!data) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border">
        <p className="text-gray-600">Upload and analyze a resume to enable editing</p>
      </div>
    );
  }

  const updateContactInfo = (field: keyof ContactInfo, value: string) => {
    const newData = {
      ...data,
      contact_info: {
        ...data.contact_info,
        [field]: value
      }
    };
    setData(newData);
    onDataChange(newData);
  };

  const updateEducation = (index: number, field: keyof Education, value: string | string[]) => {
    const newEducation = [...data.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    const newData = {
      ...data,
      education: newEducation
    };
    setData(newData);
    onDataChange(newData);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
    const newExperience = [...data.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    const newData = {
      ...data,
      experience: newExperience
    };
    setData(newData);
    onDataChange(newData);
  };

  const updateProject = (index: number, field: keyof Project, value: string | string[]) => {
    const newProjects = [...data.projects];
    newProjects[index] = {
      ...newProjects[index],
      [field]: value
    };
    const newData = {
      ...data,
      projects: newProjects
    };
    setData(newData);
    onDataChange(newData);
  };

  const updateTechnicalSkills = (category: keyof TechnicalSkills, value: string[]) => {
    const newData = {
      ...data,
      skills: {
        ...data.skills,
        technical: {
          ...data.skills.technical,
          [category]: value
        }
      }
    };
    setData(newData);
    onDataChange(newData);
  };

  const addExperience = () => {
    const newData = {
      ...data,
      experience: [
        ...data.experience,
        {
          title: '',
          company: '',
          location: '',
          dates: '',
          highlights: ['']
        }
      ]
    };
    setData(newData);
    onDataChange(newData);
  };

  const addProject = () => {
    const newData = {
      ...data,
      projects: [
        ...data.projects,
        {
          name: '',
          description: '',
          technologies: [],
          link: '',
          highlights: [''],
          start_date: '',
          end_date: '',
          duration: ''
        }
      ]
    };
    setData(newData);
    onDataChange(newData);
  };

  return (
    <div className="flex flex-col">
      {/* Download Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={downloadAsPDF}
          disabled={isGeneratingPDF}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
            isGeneratingPDF 
              ? 'bg-gray-400 cursor-not-allowed text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isGeneratingPDF ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* PDF-sized Resume Container */}
      <div 
        ref={resumeRef}
        className="bg-white border border-gray-300 shadow-lg mx-auto"
        style={{
          width: '8.5in',
          minHeight: '11in',
          padding: '0.75in',
          fontSize: '11px',
          lineHeight: '1.4',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <div className="space-y-4">
          {/* Header Section */}
          <div className="text-center border-b border-gray-400 pb-3">
            <input
              type="text"
              value={data.contact_info.name}
              onChange={(e) => updateContactInfo('name', e.target.value)}
              className="text-xl font-bold text-center w-full border-none outline-none focus:bg-blue-50 rounded px-2 py-1 text-black bg-transparent"
              placeholder="Full Name"
              style={{ fontSize: '18px' }}
            />
            <div className="text-xs text-gray-700 mt-2 space-y-1">
              <div className="flex flex-wrap justify-center gap-1">
                <input
                  type="text"
                  value={data.contact_info.location}
                  onChange={(e) => updateContactInfo('location', e.target.value)}
                  className="border-none outline-none focus:bg-blue-50 rounded px-1 text-black bg-transparent text-center"
                  placeholder="Location"
                />
                <span>|</span>
                <input
                  type="text"
                  value={data.contact_info.phone}
                  onChange={(e) => updateContactInfo('phone', e.target.value)}
                  className="border-none outline-none focus:bg-blue-50 rounded px-1 text-black bg-transparent text-center"
                  placeholder="Phone"
                />
                <span>|</span>
                <input
                  type="email"
                  value={data.contact_info.email}
                  onChange={(e) => updateContactInfo('email', e.target.value)}
                  className="border-none outline-none focus:bg-blue-50 rounded px-1 text-black bg-transparent text-center"
                  placeholder="Email"
                />
              </div>
              {(data.contact_info.personal_website || data.contact_info.linkedin || data.contact_info.github) && (
                <div className="flex flex-wrap justify-center gap-1 text-blue-600 text-xs">
                  {data.contact_info.personal_website && (
                    <input
                      type="url"
                      value={data.contact_info.personal_website}
                      onChange={(e) => updateContactInfo('personal_website', e.target.value)}
                      className="border-none outline-none focus:bg-blue-50 rounded px-1 text-blue-600 bg-transparent text-center"
                      placeholder="Website"
                    />
                  )}
                  {data.contact_info.linkedin && (
                    <input
                      type="url"
                      value={data.contact_info.linkedin}
                      onChange={(e) => updateContactInfo('linkedin', e.target.value)}
                      className="border-none outline-none focus:bg-blue-50 rounded px-1 text-blue-600 bg-transparent text-center"
                      placeholder="LinkedIn"
                    />
                  )}
                  {data.contact_info.github && (
                    <input
                      type="url"
                      value={data.contact_info.github}
                      onChange={(e) => updateContactInfo('github', e.target.value)}
                      className="border-none outline-none focus:bg-blue-50 rounded px-1 text-blue-600 bg-transparent text-center"
                      placeholder="GitHub"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Education Section */}
          {data.education && data.education.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-black border-b border-gray-400 pb-1 mb-2 uppercase tracking-wide">Education</h3>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(index, 'school', e.target.value)}
                      className="font-bold border-none outline-none focus:bg-blue-50 rounded px-1 flex-1 text-black bg-transparent"
                      placeholder="University/School Name"
                    />
                    <input
                      type="text"
                      value={edu.graduation_date}
                      onChange={(e) => updateEducation(index, 'graduation_date', e.target.value)}
                      className="border-none outline-none focus:bg-blue-50 rounded px-1 text-right text-black bg-transparent"
                      placeholder="Graduation Date"
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="italic border-none outline-none focus:bg-blue-50 rounded px-1 flex-1 text-black bg-transparent"
                      placeholder="Degree"
                    />
                    <input
                      type="text"
                      value={edu.location}
                      onChange={(e) => updateEducation(index, 'location', e.target.value)}
                      className="italic border-none outline-none focus:bg-blue-50 rounded px-1 text-right text-black bg-transparent"
                      placeholder="Location"
                    />
                  </div>
                  {edu.relevant_courses && edu.relevant_courses.length > 0 && (
                    <div className="mt-1">
                      <textarea
                        value={edu.relevant_courses.join(', ')}
                        onChange={(e) => updateEducation(index, 'relevant_courses', e.target.value.split(', '))}
                        className="text-xs border-none outline-none focus:bg-blue-50 rounded px-1 w-full resize-none text-black bg-transparent"
                        placeholder="Relevant Courses (comma separated)"
                        rows={1}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Experience Section */}
          {data.experience && data.experience.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-black border-b border-gray-400 pb-1 uppercase tracking-wide">Experience</h3>
                <button
                  onClick={addExperience}
                  className="text-blue-600 hover:text-blue-800 text-xs print:hidden"
                >
                  + Add Experience
                </button>
              </div>
              {data.experience.map((exp, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      className="font-bold border-none outline-none focus:bg-blue-50 rounded px-1 flex-1 text-black bg-transparent"
                      placeholder="Company Name"
                    />
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(index, 'location', e.target.value)}
                      className="border-none outline-none focus:bg-blue-50 rounded px-1 text-right text-black bg-transparent"
                      placeholder="Location"
                    />
                  </div>
                  <div className="flex justify-between items-start mb-1">
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      className="italic font-semibold border-none outline-none focus:bg-blue-50 rounded px-1 flex-1 text-black bg-transparent"
                      placeholder="Job Title"
                    />
                    <input
                      type="text"
                      value={exp.dates}
                      onChange={(e) => updateExperience(index, 'dates', e.target.value)}
                      className="italic border-none outline-none focus:bg-blue-50 rounded px-1 text-right text-black bg-transparent"
                      placeholder="Start Date -- End Date"
                    />
                  </div>
                  <div className="space-y-1">
                    {exp.highlights && exp.highlights.map((highlight, hIndex) => (
                      <div key={hIndex} className="flex items-start">
                        <span className="text-black mr-2 mt-0.5">•</span>
                        <textarea
                          value={highlight}
                          onChange={(e) => {
                            const newHighlights = [...exp.highlights];
                            newHighlights[hIndex] = e.target.value;
                            updateExperience(index, 'highlights', newHighlights);
                          }}
                          className="flex-1 border-none outline-none focus:bg-blue-50 rounded px-1 resize-none text-xs text-black bg-transparent"
                          placeholder="Achievement or responsibility"
                          rows={2}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newHighlights = [...exp.highlights, ''];
                        updateExperience(index, 'highlights', newHighlights);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs ml-4 print:hidden"
                    >
                      + Add bullet point
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects Section */}
          {data.projects && data.projects.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-black border-b border-gray-400 pb-1 uppercase tracking-wide">Projects</h3>
                <button
                  onClick={addProject}
                  className="text-blue-600 hover:text-blue-800 text-xs print:hidden"
                >
                  + Add Project
                </button>
              </div>
              {data.projects.map((project, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                      className="font-bold border-none outline-none focus:bg-blue-50 rounded px-1 flex-1 text-black bg-transparent"
                      placeholder="Project Name"
                    />
                    <input
                      type="text"
                      value={project.duration || `${project.start_date} -- ${project.end_date}`}
                      onChange={(e) => updateProject(index, 'duration', e.target.value)}
                      className="border-none outline-none focus:bg-blue-50 rounded px-1 text-right text-black bg-transparent"
                      placeholder="Duration"
                    />
                  </div>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-1">
                      <input
                        type="text"
                        value={project.technologies.join(', ')}
                        onChange={(e) => updateProject(index, 'technologies', e.target.value.split(', '))}
                        className="text-xs italic border-none outline-none focus:bg-blue-50 rounded px-1 w-full text-black bg-transparent"
                        placeholder="Technologies (comma separated)"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    {project.highlights && project.highlights.map((highlight, hIndex) => (
                      <div key={hIndex} className="flex items-start">
                        <span className="text-black mr-2 mt-0.5">•</span>
                        <textarea
                          value={highlight}
                          onChange={(e) => {
                            const newHighlights = [...project.highlights];
                            newHighlights[hIndex] = e.target.value;
                            updateProject(index, 'highlights', newHighlights);
                          }}
                          className="flex-1 border-none outline-none focus:bg-blue-50 rounded px-1 resize-none text-xs text-black bg-transparent"
                          placeholder="Project achievement or feature"
                          rows={2}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newHighlights = [...project.highlights, ''];
                        updateProject(index, 'highlights', newHighlights);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs ml-4 print:hidden"
                    >
                      + Add bullet point
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Technical Skills Section */}
          {data.skills && data.skills.technical && (
            <div>
              <h3 className="text-sm font-bold text-black border-b border-gray-400 pb-1 mb-2 uppercase tracking-wide">Technical Skills</h3>
              <div className="space-y-1 text-xs">
                {Object.entries(data.skills.technical).map(([category, skills]) => (
                  skills && skills.length > 0 && (
                    <div key={category} className="flex">
                      <span className="font-bold w-24 capitalize text-black">
                        {category.replace(/_/g, ' ')}:
                      </span>
                      <input
                        type="text"
                        value={skills.join(', ')}
                        onChange={(e) => updateTechnicalSkills(category as keyof TechnicalSkills, e.target.value.split(', '))}
                        className="flex-1 border-none outline-none focus:bg-blue-50 rounded px-1 text-black bg-transparent"
                        placeholder={`Enter ${category.replace(/_/g, ' ')} (comma separated)`}
                      />
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Honors Section */}
          {data.honors && data.honors.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-black border-b border-gray-400 pb-1 mb-2 uppercase tracking-wide">Honors</h3>
              <div className="space-y-1">
                {data.honors.map((honor, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-black mr-2 mt-0.5">•</span>
                    <textarea
                      value={honor}
                      onChange={(e) => {
                        const newHonors = [...data.honors];
                        newHonors[index] = e.target.value;
                        const newData = { ...data, honors: newHonors };
                        setData(newData);
                        onDataChange(newData);
                      }}
                      className="flex-1 border-none outline-none focus:bg-blue-50 rounded px-1 resize-none text-xs text-black bg-transparent"
                      placeholder="Honor or achievement"
                      rows={1}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor; 