
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StudyStatsProps {
  weeklyStudyTime: number;
  weeklyStudyGoal: number;
  flashcardProgress: number;
  quizProgress: number;
}

export function StudyStats({
  weeklyStudyTime,
  weeklyStudyGoal,
  flashcardProgress,
  quizProgress
}: StudyStatsProps) {
  const studyTimePercentage = Math.min(100, (weeklyStudyTime / weeklyStudyGoal) * 100);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="frosted-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Weekly Study Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">{weeklyStudyTime} hrs</span>
              <span className="text-muted-foreground text-sm">Goal: {weeklyStudyGoal} hrs</span>
            </div>
            <Progress value={studyTimePercentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {studyTimePercentage >= 100 
                ? "Congratulations! You've hit your weekly goal!"
                : `${Math.round(studyTimePercentage)}% of your weekly goal completed`}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="frosted-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Material Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Flashcards</span>
                <span className="text-muted-foreground">{flashcardProgress}%</span>
              </div>
              <Progress value={flashcardProgress} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Quizzes</span>
                <span className="text-muted-foreground">{quizProgress}%</span>
              </div>
              <Progress value={quizProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
