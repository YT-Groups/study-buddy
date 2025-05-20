
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Material {
  id: string;
  title: string;
  type: 'flashcard' | 'quiz';
  progress: number;
  subject?: string;
}

interface RecentMaterialsProps {
  materials: Material[];
}

export function RecentMaterials({ materials }: RecentMaterialsProps) {
  if (!materials.length) {
    return (
      <div className="frosted-card p-6 text-center">
        <h3 className="font-medium mb-2">No recent materials</h3>
        <p className="text-muted-foreground mb-4">Create flashcards or quizzes to get started</p>
        <div className="flex gap-4 justify-center">
          <Button>Create Flashcards</Button>
          <Button variant="outline">Create Quiz</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Materials</h3>
        <Button variant="link" className="text-sm">
          View all <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((material) => (
          <Card key={material.id} className="frosted-card overflow-hidden card-hover">
            <div className={`h-1 ${material.type === 'flashcard' ? 'bg-peach' : 'bg-blue-400'}`} />
            <CardContent className="p-4">
              <div className="mb-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {material.type}
                </span>
                {material.subject && (
                  <span className="text-xs ml-2 px-1.5 py-0.5 rounded-full bg-secondary">
                    {material.subject}
                  </span>
                )}
              </div>
              
              <h4 className="font-medium truncate">{material.title}</h4>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="w-2/3">
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${material.type === 'flashcard' ? 'bg-peach' : 'bg-blue-400'}`}
                      style={{ width: `${material.progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{material.progress}% complete</span>
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                Continue
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
