import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Template } from '@shared/schema';
import { 
  Target, 
  Users, 
  TrendingUp, 
  FileText,
  ExternalLink,
  Crown,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-is-mobile';

const categoryIcons = {
  'Customer Service': Target,
  'Human Resources': Users,
  'Sales & Marketing': TrendingUp,
  'Content & Marketing': FileText,
};

export function TemplateLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
  });

  const useTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await apiRequest('POST', `/api/templates/${templateId}/use`);
      return response.json();
    },
    onSuccess: (assistant) => {
      toast({
        title: "Template Used Successfully",
        description: `Created assistant: ${assistant.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assistants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Use Template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUseTemplate = (templateId: number) => {
    useTemplateMutation.mutate(templateId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Template Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-lg"></div>
                    <div>
                      <div className="w-24 h-4 bg-muted rounded mb-1"></div>
                      <div className="w-16 h-3 bg-muted rounded"></div>
                    </div>
                  </div>
                  <div className="w-12 h-5 bg-muted rounded"></div>
                </div>
                <div className="w-full h-12 bg-muted rounded mb-3"></div>
                <div className="flex items-center justify-between">
                  <div className="w-20 h-3 bg-muted rounded"></div>
                  <div className="w-16 h-6 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isMobile = useIsMobile()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Template Library</CardTitle>
          <Button variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isMobile ? 'mobile-grid gap-4' : ''}`}>
          {templates.map((template) => {
            const IconComponent = categoryIcons[template.category as keyof typeof categoryIcons] || Target;
            const isLoading = useTemplateMutation.isPending;

            return (
              <div 
                key={template.id}
                className="border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </div>
                  </div>

                  {template.isPopular ? (
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                      <Crown className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  ) : template.usageCount && template.usageCount < 500 ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  ) : null}
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      Used by {template.usageCount?.toLocaleString() || 0} teams
                    </span>
                  </div>

                  <Button 
                    size="sm" 
                    onClick={() => handleUseTemplate(template.id)}
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? 'Creating...' : 'Use Template'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}