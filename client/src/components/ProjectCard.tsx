import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Project } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { isAdmin } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Check if description text is truncated
  useEffect(() => {
    const checkTruncation = () => {
      if (descriptionRef.current) {
        const element = descriptionRef.current;
        // Check if scrollHeight is greater than clientHeight (meaning text is truncated)
        setIsTruncated(element.scrollHeight > element.clientHeight);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [project.description]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  // Function to open the Hugging Face URL
  const openHuggingFaceUrl = () => {
    if (project.huggingFaceUrl) {
      window.open(project.huggingFaceUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  // Function to navigate to edit project page
  const goToEditProject = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    setLocation(`/edit-project/${project.id}`);
  };
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      if (!project) throw new Error("Project not found");
      const res = await apiRequest("DELETE", `/api/projects/${project.id}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to delete project");
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Open delete confirmation dialog
  const handleDeleteProject = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete action
  const confirmDelete = () => {
    deleteProjectMutation.mutate();
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer group"
        onClick={openHuggingFaceUrl}
      >
        {project.imageUrl && (
          <div className="overflow-hidden">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-900 font-heading flex-1 pr-2 leading-tight">{project.title}</h3>
            {project.isActive ? (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 shrink-0">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 shrink-0">
                Inactive
              </Badge>
            )}
          </div>
          <div>
            <p
              ref={descriptionRef}
              className={`text-gray-600 text-sm leading-relaxed mb-2 ${!isExpanded ? 'line-clamp-6' : ''}`}
            >
              {project.description}
            </p>
            {isTruncated && (
              <button
                onClick={toggleExpand}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1 mb-2 transition-colors"
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {project.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {/* Admin Edit and Delete buttons */}
          {isAdmin && (
            <div className="mb-3 space-y-2">
              <button
                onClick={goToEditProject}
                className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </button>

              <button
                onClick={handleDeleteProject}
                className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </button>
            </div>
          )}

          {/* Hugging Face button */}
          {project.huggingFaceUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent double opening
                openHuggingFaceUrl();
              }}
              className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Hugging Face
            </button>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProjectMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}