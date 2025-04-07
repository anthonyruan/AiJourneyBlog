import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AboutPageData } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Github, Twitter, Linkedin, ExternalLink, Pencil, Loader2 
} from "lucide-react";
import { SiHuggingface } from "react-icons/si";

export default function About() {
  const { isAdmin } = useAuth();
  
  // Fetch about page data
  const { data: aboutData, isLoading, error } = useQuery<AboutPageData>({
    queryKey: ['/api/about'],
    queryFn: async () => {
      const res = await fetch('/api/about');
      if (!res.ok) throw new Error('Failed to fetch about page data');
      return res.json();
    },
  });

  // Function to render social media icons
  const renderSocialIcon = (type: string, url?: string) => {
    if (!url) return null;
    
    let icon;
    switch (type) {
      case 'github':
        icon = <Github className="h-5 w-5" />;
        break;
      case 'twitter':
        icon = <Twitter className="h-5 w-5" />;
        break;
      case 'linkedin':
        icon = <Linkedin className="h-5 w-5" />;
        break;
      case 'huggingface':
        icon = <SiHuggingface className="h-5 w-5" />;
        break;
      default:
        icon = <ExternalLink className="h-5 w-5" />;
    }
    
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        {icon}
      </a>
    );
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !aboutData) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading About Page</h2>
          <p className="text-muted-foreground">
            There was a problem loading the about page information. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {/* Admin Edit Button */}
      {isAdmin && (
        <div className="flex justify-end mb-6">
          <Button asChild variant="outline" size="sm">
            <Link to="/edit-about">
              <Pencil className="h-4 w-4 mr-2" />
              Edit About Page
            </Link>
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Section - Left Column on Desktop */}
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <div className="aspect-square overflow-hidden bg-muted">
              {aboutData.profileImage ? (
                <img 
                  src={aboutData.profileImage} 
                  alt={aboutData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-4xl font-bold text-muted-foreground">
                    {aboutData.name?.charAt(0) || "A"}
                  </span>
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-1">{aboutData.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">{aboutData.title}</p>
              
              {/* Social Links */}
              {aboutData.socialLinks && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {aboutData.socialLinks.github && 
                    renderSocialIcon('github', aboutData.socialLinks.github)}
                  {aboutData.socialLinks.twitter && 
                    renderSocialIcon('twitter', aboutData.socialLinks.twitter)}
                  {aboutData.socialLinks.linkedin && 
                    renderSocialIcon('linkedin', aboutData.socialLinks.linkedin)}
                  {aboutData.socialLinks.huggingface && 
                    renderSocialIcon('huggingface', aboutData.socialLinks.huggingface)}
                </div>
              )}
              
              {/* Skills */}
              {aboutData.skills && aboutData.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {aboutData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Bio Section - Right Column on Desktop */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">About Me</h2>
              
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-base leading-relaxed mb-6">{aboutData.bio}</p>
                
                {aboutData.additionalBio && (
                  <div className="mt-6">
                    <p className="text-base leading-relaxed">
                      {aboutData.additionalBio}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">What I Do</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/40 p-4 rounded-md">
                    <h4 className="font-medium mb-2">AI Research & Development</h4>
                    <p className="text-sm text-muted-foreground">
                      Exploring the latest advances in machine learning and artificial intelligence.
                    </p>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Knowledge Sharing</h4>
                    <p className="text-sm text-muted-foreground">
                      Documenting my journey and sharing insights through this blog.
                    </p>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Tool Building</h4>
                    <p className="text-sm text-muted-foreground">
                      Creating practical AI-powered tools and applications.
                    </p>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Continuous Learning</h4>
                    <p className="text-sm text-muted-foreground">
                      Always learning new techniques and approaches in the fast-evolving AI field.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}