import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Quiz, QuizQuestion } from '@/lib/quizGeneration';
import { toast } from 'sonner';

interface QuizViewProps {
  quiz: Quiz;
  onComplete: (score: number) => void;
  onClose: () => void;
}

export function QuizView({ quiz, onComplete, onClose }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map());
  const [showExplanation, setShowExplanation] = useState(false);
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  const handleAnswer = (answer: string) => {
    setUserAnswers(prev => new Map(prev).set(currentQuestion.id, answer));
    setShowExplanation(true);
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      // Calculate score
      let correctAnswers = 0;
      quiz.questions.forEach(question => {
        const userAnswer = userAnswers.get(question.id);
        if (userAnswer?.toLowerCase() === question.correctAnswer.toLowerCase()) {
          correctAnswers++;
        }
      });
      
      const score = (correctAnswers / quiz.questions.length) * 100;
      onComplete(score);
    }
  };
  
  const renderQuestion = (question: QuizQuestion) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <p className="text-lg">{question.question}</p>
            <div className="grid gap-2">
              {question.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={userAnswers.get(question.id) === option ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleAnswer(option)}
                  disabled={showExplanation}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );
        
      case 'fill-blank':
        return (
          <div className="space-y-4">
            <p className="text-lg">{question.question}</p>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Type your answer..."
              onChange={(e) => handleAnswer(e.target.value)}
              disabled={showExplanation}
            />
          </div>
        );
        
      case 'definition':
        return (
          <div className="space-y-4">
            <p className="text-lg">{question.question}</p>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Type your definition..."
              onChange={(e) => handleAnswer(e.target.value)}
              disabled={showExplanation}
            />
          </div>
        );
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-medium">{quiz.title}</h2>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <Card className="p-6 mb-4">
        {renderQuestion(currentQuestion)}
      </Card>
      
      {showExplanation && (
        <Card className="p-4 mb-4 bg-muted">
          <p className="text-sm">
            <strong>Explanation:</strong> {currentQuestion.explanation}
          </p>
        </Card>
      )}
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Exit Quiz
        </Button>
        <Button
          onClick={handleNext}
          disabled={!userAnswers.has(currentQuestion.id)}
        >
          {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </div>
    </div>
  );
} 