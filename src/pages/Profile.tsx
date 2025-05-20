import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Clock, BookOpen, FileQuestion, Calendar, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/uploadImage";

// Activity type icons mapping
const activityIcons: Record<string, JSX.Element> = {
  quiz: <FileQuestion className="h-5 w-5 text-orange-400" />,
  flashcard: <BookOpen className="h-5 w-5 text-purple-400" />,
  study: <Clock className="h-5 w-5 text-blue-400" />,
  timetable: <Calendar className="h-5 w-5 text-green-400" />
};

export default function Profile() {
  const { user, setUser, isLoading } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadImage(file);
    if (result.success && result.url) {
      setUser({
        ...user,
        avatar: result.url
      });
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update profile picture",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout username={user.name.split(" ")[0]}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card className="frosted-card lg:col-span-1">
            <CardContent className="pt-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4" onClick={handleAvatarClick}>
                <AvatarImage src={user.avatar || ""} />
                <AvatarFallback className="text-2xl bg-peach-light">
                  {user.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1">
                  <Upload className="h-4 w-4 text-gray-500" />
                </div>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              
              <h2 className="text-xl font-medium mb-1">{user.name}</h2>
              <p className="text-muted-foreground mb-4">{user.email}</p>
              
              <p className="text-sm text-muted-foreground">
                Member since {user.joinDate}
              </p>
              
              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-semibold">{user.stats.totalStudyHours}</p>
                  <p className="text-xs text-muted-foreground">Study Hours</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-semibold">{user.stats.flashcardsMastered}</p>
                  <p className="text-xs text-muted-foreground">Cards Mastered</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-semibold">{user.stats.quizzesTaken}</p>
                  <p className="text-xs text-muted-foreground">Quizzes Taken</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-semibold">{user.stats.averageScore}%</p>
                  <p className="text-xs text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="activity">
              <TabsList className="mb-4">
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="activity" className="space-y-4">
                <Card className="frosted-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.recentActivity && user.recentActivity.length > 0 ? (
                      <ul className="space-y-4">
                        {user.recentActivity.map(activity => (
                          <li 
                            key={activity.id}
                            className="flex items-center gap-4 pb-4 border-b last:border-0"
                          >
                            <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                              {activityIcons[activity.type]}
                            </div>
                            
                            <div className="flex-1">
                              <p className="font-medium">{activity.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {activity.description}
                              </p>
                            </div>
                            
                            <div className="text-right text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(activity.timestamp)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No recent activity to show
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="subjects">
                <Card className="frosted-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Subject Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.subjects && user.subjects.length > 0 ? (
                      <div className="space-y-5">
                        {user.subjects.map(subject => (
                          <div key={subject.name} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{subject.name}</span>
                              <span className="text-sm text-muted-foreground">
                                Last studied: {new Date(subject.lastStudied).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-orange-500 to-purple-500" 
                                style={{ width: `${subject.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No subjects added yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="achievements">
                <Card className="frosted-card h-64 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Achievement tracking will be available in a future update
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
