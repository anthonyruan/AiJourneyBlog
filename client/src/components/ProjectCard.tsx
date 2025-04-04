import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Project } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all">
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
        {project.huggingFaceUrl && (
          <Button className="w-full justify-center bg-primary-600 hover:bg-primary-700">
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Hugging Face
          </Button>
        )}
      </div>
    </div>
  );
}
