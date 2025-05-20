import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Clock, Upload, FileText, BookOpen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { QuizUpload } from '@/components/quiz/QuizUpload';
import { QuizView } from '@/components/quiz/QuizView';
import { Quiz } from '@/lib/quizGeneration';
import { useUser } from '@/contexts/UserContext';

// Mock data
const mockQuizzes = [
  {
    id: "quiz-1",
    title: "World History Midterm",
    description: "Review quiz covering ancient civilizations through the Renaissance",
    questionCount: 25,
    timeLimit: "45 min",
    difficulty: "Medium",
    subject: "History",
    lastTaken: "1 week ago",
    score: "85%"
  },
  {
    id: "quiz-2",
    title: "Biology Cell Functions",
    description: "Test your knowledge of cellular processes and organelles",
    questionCount: 20,
    timeLimit: "30 min",
    difficulty: "Hard",
    subject: "Biology",
    lastTaken: null,
    score: null
  },
  {
    id: "quiz-3",
    title: "Spanish Verb Conjugation",
    description: "Practice quiz on regular and irregular verb forms in Spanish",
    questionCount: 30,
    timeLimit: "40 min",
    difficulty: "Easy",
    subject: "Languages",
    lastTaken: "3 days ago",
    score: "92%"
  }
];

export default function Quizzes() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [showUpload, setShowUpload] = useState(true);

  const acceptedFileTypes = [
    "application/pdf", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "application/vnd.ms-powerpoint", // .ppt
    "text/plain"
  ];
  
  const filteredQuizzes = searchQuery 
    ? mockQuizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        quiz.subject?.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockQuizzes;
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Process the files
  const handleFiles = (files: FileList) => {
    const validFiles: File[] = [];
    
    Array.from(files).forEach(file => {
      if (acceptedFileTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        toast.error(`File type not supported: ${file.name}`);
      }
    });
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  };

  // Clear selected files
  const clearFiles = () => {
    setSelectedFiles([]);
  };

  // Generate quiz from files
  const generateQuiz = () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to generate a quiz");
      return;
    }
    
    toast.success("Generating quiz from your files...");
    // Here you would implement the actual quiz generation logic
    // This would typically involve sending the files to a backend API
    
    // Reset selected files after processing
    clearFiles();
  };

  const handleQuizGenerated = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setShowUpload(false);
  };

  const handleQuizComplete = (score: number) => {
    // Here you can add logic to save the quiz results
    setCurrentQuiz(null);
    setShowUpload(true);
  };

  const handleCloseQuiz = () => {
    setCurrentQuiz(null);
    setShowUpload(true);
  };

  if (!showUpload && currentQuiz) {
    return (
      <AppLayout username={user?.name.split(" ")[0]}>
        <QuizView
          quiz={currentQuiz}
          onComplete={handleQuizComplete}
          onClose={handleCloseQuiz}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout username={user?.name.split(" ")[0]}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-medium mb-2">Quizzes</h1>
            <p className="text-muted-foreground">
              Upload your study materials to generate custom quizzes
            </p>
          </div>

          {showUpload ? (
            <QuizUpload onQuizGenerated={handleQuizGenerated} />
          ) : (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">No Active Quiz</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a file to generate a new quiz
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <Button onClick={() => setShowUpload(true)}>
                    Create New Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
