import { PDFDocument } from 'pdf-lib';

export const readFileContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to read file content'));
        return;
      }

      try {
        // For text files, read as text
        if (file.type === 'text/plain') {
          resolve(event.target.result as string);
          return;
        }

        // For binary files, try to extract text
        const arrayBuffer = event.target.result as ArrayBuffer;
        const text = new TextDecoder('utf-8').decode(arrayBuffer);
        
        // Clean up the text
        const cleanedText = text
          .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/[^\w\s.,!?-]/g, '') // Keep only basic punctuation and alphanumeric
          .trim();

        if (!cleanedText) {
          throw new Error('No readable text content found in file');
        }

        resolve(cleanedText);
      } catch (error) {
        reject(new Error('Failed to read file content'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    // Read as text for text files, ArrayBuffer for others
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

export const isFileTypeSupported = (file: File): boolean => {
  const supportedTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  return supportedTypes.includes(file.type);
}; 