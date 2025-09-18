import { Flashcard } from "@/contexts/UserContext";
import { initializeCard } from "./spaced-repetition";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { GlobalWorkerOptions } from "pdfjs-dist";
import { getDocument } from "pdfjs-dist";

// Use Vite’s import.meta.url trick to get a proper string
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

/**
 * Extracts text from a PDF file with fallback
 */
async function extractPDFText(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();

    // First try using PDF.js
    try {
      const pdf = await pdfjsLib.getDocument({
        data: buffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      }).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        text += pageText + "\n\n";
      }
      return text;
    } catch (pdfError) {
      console.warn(
        "PDF.js extraction failed, falling back to basic text extraction:",
        pdfError instanceof Error ? pdfError.message : String(pdfError)
      );

      // Fallback to basic text extraction
      const decoder = new TextDecoder("utf-8");
      let text = decoder.decode(buffer);

      // Clean up the text
      text = text
        .replace(/[^\x20-\x7E\n\r]/g, " ") // Replace non-printable chars with space
        .replace(/\s+/g, " ") // Collapse multiple spaces
        .trim();

      return text;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error extracting PDF text:", errorMessage);
    throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
  }
}

/**
 * Extracts text from a Word document
 */
async function extractWordText(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error extracting Word text:", errorMessage);
    throw new Error(
      `Failed to extract text from Word document: ${errorMessage}`
    );
  }
}

/**
 * Detects the text encoding of a file using byte order marks (BOM)
 */
function detectTextEncoding(buffer: ArrayBuffer): string {
  const arr = new Uint8Array(buffer).subarray(0, 4);

  // Detect UTF-8 BOM (EF BB BF)
  if (arr[0] === 0xef && arr[1] === 0xbb && arr[2] === 0xbf) {
    return "utf-8";
  }
  // Detect UTF-16 LE BOM (FF FE)
  if (arr[0] === 0xff && arr[1] === 0xfe) {
    return "utf-16le";
  }
  // Detect UTF-16 BE BOM (FE FF)
  if (arr[0] === 0xfe && arr[1] === 0xff) {
    return "utf-16be";
  }
  // Default to UTF-8 if no BOM is detected
  return "utf-8";
}

/**
 * Reads plain text file with proper encoding
 */
async function readPlainText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const encoding = detectTextEncoding(buffer);
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buffer);
}

/**
 * Cleans text by removing invalid characters and normalizing line endings
 */
function cleanText(text: string): string {
  return text
    .replace(/\uFEFF/g, "") // Remove BOM
    .replace(/\x00/g, "") // Remove null bytes
    .replace(/[^\x20-\x7E\x0A\x0D\u00A0-\uFFFF]/g, "") // Remove control characters except newlines
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();
}

/**
 * Checks if text contains only valid characters
 */
function isValidText(text: string): boolean {
  // Skip very short text
  if (text.length < 3) return false;

  // Check for reasonable text length
  if (text.length > 1000) return false;

  // Check for reasonable character distribution
  const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
  if (letterCount < text.length * 0.1) return false; // At least 10% should be letters

  // Check for binary data patterns
  if (/[\x00-\x08\x0E-\x1F\x7F-\xFF]/.test(text)) return false;

  return true;
}

/**
 * Generates flashcards from text content with simple, reliable parsing
 */
// export async function generateFlashcardsFromText(text: string) {
//   const flashcards = [];

//   // Clean and normalize the text first
//   const cleanedText = cleanText(text);

//   // Split into lines
//   const lines = cleanedText.split("\n");

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim();

//     // Skip empty lines or lines that appear to be binary data
//     if (!line || !isValidText(line)) continue;

//     try {
//       // Check for colon separator (Term: Definition)
//       if (line.includes(":")) {
//         const colonIndex = line.indexOf(":");
//         const front = line.substring(0, colonIndex).trim();
//         const back = line.substring(colonIndex + 1).trim();

//         if (front && back && isValidText(front) && isValidText(back)) {
//           flashcards.push(
//             initializeCard(front, back, `card-${i}-${Date.now()}`)
//           );
//         }
//         // Check for dash separator (Term - Definition)
//       } else if (line.includes(" - ")) {
//         const dashIndex = line.indexOf(" - ");
//         const front = line.substring(0, dashIndex).trim();
//         const back = line.substring(dashIndex + 3).trim();

//         if (front && back && isValidText(front) && isValidText(back)) {
//           flashcards.push({
//             id: `card-${i}-${Date.now()}`,
//             front,
//             back,
//             mastered: false,
//           });
//         }
//       }
//       // Check for question mark (Question? Answer)
//       else if (line.includes("?")) {
//         const questionIndex = line.indexOf("?");
//         const front = line.substring(0, questionIndex + 1).trim();
//         const back = line.substring(questionIndex + 1).trim();

//         if (front && back && isValidText(front) && isValidText(back)) {
//           flashcards.push({
//             id: `card-${i}-${Date.now()}`,
//             front,
//             back,
//             mastered: false,
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error processing line:", line, error);
//       continue;
//     }
//   }

//   return flashcards;
// }

/**
 * Generates flashcards from LLM using a local server
 */
export async function generateFlashcardsFromLLM(text: string): Promise<Flashcard[]> {
  const chunks: string[] = [];
  const words = text.split(/\s+/);
  const chunkSize = 500; // smaller chunks for slow CPUs

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    chunks.push(chunk);
  }

  const allFlashcards: Flashcard[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const response = await fetch("http://localhost:8000/generate-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: chunk }),
      });

      if (!response.ok) {
        console.warn(`Failed to generate flashcards for chunk ${i + 1}`);
        continue;
      }

      const data = await response.json();
      const flashcards = data.items.map((item: any, index: number) => ({
        id: `card-${i}-${index}-${Date.now()}`,
        front: item.front,
        back: item.back,
        mastered: false,
      }));

      allFlashcards.push(...flashcards);
    } catch (err) {
      console.error(`Chunk ${i + 1} failed:`, err);
    }
  }

  return allFlashcards;
}


/**
 * Reads the content of a file based on its type
 */
export async function readFileContent(file: File): Promise<string> {
  try {
    let text: string;

    // Handle different file types
    if (file.type === "application/pdf") {
      text = await extractPDFText(file);
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword"
    ) {
      text = await extractWordText(file);
    } else if (file.type === "text/plain" || !file.type) {
      text = await readPlainText(file);
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    // Clean and normalize the text
    return cleanText(text);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error reading file:", errorMessage);
    throw new Error(`Failed to read file: ${errorMessage}`);
  }
}
