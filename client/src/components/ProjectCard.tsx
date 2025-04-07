import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Edit } from "lucide-react";
import { Project } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { isAdmin } = useAuth();
  const [_, setLocation] = useLocation();
  
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

  return (
    <div 
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer"
      onClick={openHuggingFaceUrl}
    >
      {project.imageUrl && (
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900 font-heading mb-2">{project.title}</h3>
          {project.isActive ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
              Inactive
            </Badge>
          )}
        </div>
        <p className="text-gray-600 mb-4">
          {project.description}
        </p>
        {project.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {/* Admin Edit button */}
        {isAdmin && (
          <div className="mb-4">
            <button 
              onClick={goToEditProject}
              className="inline-flex items-center justify-center w-full px-4 py-2 mb-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium text-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
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
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium text-sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Hugging Face
          </button>
        )}
      </div>
    </div>
  );
}
