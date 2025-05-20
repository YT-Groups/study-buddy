import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { generateQuizFromFile } from '@/lib/quizGeneration';
import { isFileTypeSupported } from '@/lib/fileProcessing';
import { toast } from 'sonner';
import { Quiz } from '@/lib/quizGeneration';

interface QuizUploadProps {
  onQuizGenerated: (quiz: Quiz) => void;
}

export function QuizUpload({ onQuizGenerated }: QuizUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!isFileTypeSupported(file)) {
      toast.error(`File type not supported: ${file.name}`, {
        duration: 3000,
      });
      return;
    }
    
    setSelectedFile(file);
    toast.success(`File selected: ${file.name}`, {
      duration: 2000,
    });
  };

  const handleGenerateQuiz = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first", {
        duration: 3000,
      });
      return;
    }

    try {
      setIsGenerating(true);
      const quiz = await generateQuizFromFile(selectedFile);
      onQuizGenerated(quiz);
      toast.success("Quiz generated successfully!", {
        duration: 2000,
      });
    } catch (error) {
      toast.error("Failed to generate quiz. Please try again.", {
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Upload Study Material</h3>
          <p className="text-sm text-muted-foreground">
            Upload your study materials to generate a quiz
          </p>
        </CardHeader>
        
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Drop file here or click to browse</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF, Word documents (.doc, .docx), PowerPoint presentations (.ppt, .pptx), and text files
            </p>
            <input
              type="file"
              className="hidden"
              id="quiz-file-upload"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
            />
            <Button
              onClick={() => document.getElementById("quiz-file-upload")?.click()}
              variant="outline"
              className="mx-auto"
            >
              Select File
            </Button>
          </div>
          
          {selectedFile && (
            <div className="mt-6">
              <div className="flex items-center p-2 bg-secondary/20 rounded">
                <FileText className="h-4 w-4 mr-2" />
                <span className="flex-1 text-sm truncate">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating Quiz..." : "Generate Quiz"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 