import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Activity } from '@shared/schema';
import { 
  CheckCircle, 
  Zap, 
  MessageSquare, 
  Layers,
  Clock,
  TrendingUp 
} from 'lucide-react';

const activityIcons = {
  deployment: CheckCircle,
  workflow_created: Zap,
  conversation: MessageSquare,
  template_used: Layers,
};

const activityColors = {
  deployment: 'bg-secondary/10 text-secondary',
  workflow_created: 'bg-primary/10 text-primary',
  conversation: 'bg-accent/10 text-accent',
  template_used: 'bg-purple-100 text-purple-600',
};

export function ActivityFeed() {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="w-3/4 h-4 bg-muted rounded mb-1"></div>
                  <div className="w-1/2 h-3 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const IconComponent = activityIcons[activity.type as keyof typeof activityIcons] || TrendingUp;
              const colorClass = activityColors[activity.type as keyof typeof activityColors] || 'bg-muted text-muted-foreground';
              
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(activity.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatTime(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Unknown time';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`;
  return date.toLocaleDateString();
}
