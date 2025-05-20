import { readFileContent } from './fileProcessing';

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'definition';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  sourceText?: string; // Add source text for better explanations
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  createdAt: string;
  subject?: string;
}

// Helper function to generate a unique ID
const generateId = () => `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to extract key terms and their definitions
const extractKeyTerms = (content: string): Map<string, { definition: string, source: string }> => {
  const terms = new Map<string, { definition: string, source: string }>();
  const sentences = content.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    // Look for patterns like "X is defined as Y" or "X refers to Y"
    const definitionPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|are|refers to|means)\s+(.+)/i;
    const match = sentence.match(definitionPattern);
    
    if (match) {
      const term = match[1].trim();
      const definition = match[2].trim();
      if (term && definition) {
        terms.set(term, { definition, source: sentence.trim() });
      }
    }
  });
  
  return terms;
};

// Helper function to extract objectives
const extractObjectives = (content: string): string[] => {
  const objectives: string[] = [];
  const lines = content.split('\n');
  
  lines.forEach(line => {
    if (line.toLowerCase().includes('objective') || 
        line.toLowerCase().includes('learning outcome') ||
        line.toLowerCase().includes('aim')) {
      objectives.push(line.trim());
    }
  });
  
  return objectives;
};

// Helper function to generate multiple choice questions
const generateMultipleChoiceQuestions = (content: string, count: number): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.length > 20);
  const terms = Array.from(extractKeyTerms(content).keys());
  const objectives = extractObjectives(content);
  
  // First, generate questions from objectives
  objectives.forEach(objective => {
    const words = objective.split(/\s+/);
    const keyTerm = words.find(word => word.length > 5) || words[Math.floor(Math.random() * words.length)];
    
    if (keyTerm) {
      const question = objective.replace(keyTerm, '_____');
      const options = [
        keyTerm,
        ...terms.filter(t => t !== keyTerm).slice(0, 3)
      ].sort(() => Math.random() - 0.5);
      
      questions.push({
        id: generateId(),
        type: 'multiple-choice',
        question,
        options,
        correctAnswer: keyTerm,
        explanation: `The answer is "${keyTerm}" because from the objective: "${objective}"`,
        sourceText: objective
      });
    }
  });
  
  // Then generate questions from regular content
  for (let i = 0; i < count - objectives.length && i < sentences.length; i++) {
    const sentence = sentences[i];
    const words = sentence.split(/\s+/);
    
    const keyTerm = terms.find(term => sentence.includes(term)) || 
                   words.find(word => word.length > 5) ||
                   words[Math.floor(Math.random() * words.length)];
    
    if (keyTerm) {
      const question = sentence.replace(keyTerm, '_____');
      const options = [
        keyTerm,
        ...terms.filter(t => t !== keyTerm).slice(0, 3)
      ].sort(() => Math.random() - 0.5);
      
      questions.push({
        id: generateId(),
        type: 'multiple-choice',
        question,
        options,
        correctAnswer: keyTerm,
        explanation: `The answer is "${keyTerm}" because from the text: "${sentence.trim()}"`,
        sourceText: sentence.trim()
      });
    }
  }
  
  return questions;
};

// Helper function to generate fill in the blank questions
const generateFillBlankQuestions = (content: string, count: number): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.length > 20);
  const terms = Array.from(extractKeyTerms(content).keys());
  
  for (let i = 0; i < count && i < sentences.length; i++) {
    const sentence = sentences[i];
    const words = sentence.split(/\s+/);
    
    const keyTerm = terms.find(term => sentence.includes(term)) || 
                   words.find(word => word.length > 5) ||
                   words[Math.floor(Math.random() * words.length)];
    
    if (keyTerm) {
      const question = sentence.replace(keyTerm, '_____');
      
      questions.push({
        id: generateId(),
        type: 'fill-blank',
        question,
        correctAnswer: keyTerm,
        explanation: `The answer is "${keyTerm}" because from the text: "${sentence.trim()}"`,
        sourceText: sentence.trim()
      });
    }
  }
  
  return questions;
};

// Helper function to generate definition questions
const generateDefinitionQuestions = (terms: Map<string, { definition: string, source: string }>, count: number): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  const termEntries = Array.from(terms.entries());
  
  for (let i = 0; i < count && i < termEntries.length; i++) {
    const [term, { definition, source }] = termEntries[i];
    
    questions.push({
      id: generateId(),
      type: 'definition',
      question: `Define the term: ${term}`,
      correctAnswer: definition,
      explanation: `The term "${term}" is defined as: "${definition}" from the text: "${source}"`,
      sourceText: source
    });
  }
  
  return questions;
};

export const generateQuizFromFile = async (file: File): Promise<Quiz> => {
  try {
    const content = await readFileContent(file);
    const terms = extractKeyTerms(content);
    
    // Generate questions in the required format
    const multipleChoiceQuestions = generateMultipleChoiceQuestions(content, 30); // Section A: 30 MCQs
    const definitionQuestions = generateDefinitionQuestions(terms, 10); // Section B: 10 definitions
    const fillBlankQuestions = generateFillBlankQuestions(content, 10); // Section C: 10 fill in the blanks
    
    // Combine all questions
    const allQuestions = [
      ...multipleChoiceQuestions,
      ...definitionQuestions,
      ...fillBlankQuestions
    ];
    
    // Create the quiz
    const quiz: Quiz = {
      id: generateId(),
      title: `Quiz from ${file.name}`,
      description: `Generated quiz from ${file.name} with 30 multiple choice questions, 10 definition questions, and 10 fill-in-the-blank questions`,
      questions: allQuestions,
      createdAt: new Date().toISOString(),
      subject: 'General'
    };
    
    return quiz;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz from file');
  }
}; 