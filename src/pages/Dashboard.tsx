import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { StudyStats } from "@/components/dashboard/StudyStats";
import { RecentMaterials } from "@/components/dashboard/RecentMaterials";

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // Calculate stats from user data
  const stats = {
    weeklyStudyTime: user.stats.totalStudyHours,
    weeklyStudyGoal: 20, // This could be made configurable in user preferences
    flashcardProgress: (user.stats.flashcardsMastered / 100) * 100, // Assuming 100 is total possible
    quizProgress: user.stats.averageScore
  };

  // Get recent materials from user's activity
  const recentMaterials = user.recentActivity
    .filter(activity => activity.type === 'quiz' || activity.type === 'flashcard')
    .map(activity => ({
      id: activity.id,
      title: activity.title,
      type: activity.type as 'quiz' | 'flashcard',
      progress: activity.type === 'quiz' ? 
        Number(activity.result) || 0 : 
        0, // You might want to store progress in the activity result
      subject: activity.subject || 'General'
    }))
    .slice(0, 3); // Only show last 3 items

  return (
    <AppLayout username={user.name.split(" ")[0]}>
      <div className="space-y-8">
        <WelcomeSection 
          username={user.name} 
          avatar={user.avatar}
          currentClass={user.recentActivity[0]?.type === 'study' ? {
            name: user.recentActivity[0].title,
            time: user.recentActivity[0].timestamp,
            timeRemaining: 'Ongoing'
          } : undefined}
        />
        
        <StudyStats
          weeklyStudyTime={stats.weeklyStudyTime}
          weeklyStudyGoal={stats.weeklyStudyGoal}
          flashcardProgress={stats.flashcardProgress}
          quizProgress={stats.quizProgress}
        />
        
        <RecentMaterials materials={recentMaterials} />
      </div>
    </AppLayout>
  );
}
