import { useQuery } from "@tanstack/react-query";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@shared/schema";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Projects() {
  const { isAdmin } = useAuth();
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  return (
    <>
      {/* Projects Header */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading sm:text-4xl">
              AI Projects Gallery
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600">
              Explore my AI projects and experiments hosted on Hugging Face Spaces
            </p>
            {/* Admin can see the add project button */}
            <div className="mt-6">
              {isAdmin && (
                <a 
                  href="/new-project" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium text-sm"
                >
                  Add New Project
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              
              {projects.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg">No projects found</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-8">
            <h2 className="text-2xl font-bold font-heading text-gray-900 mb-4">
              How to Use These Projects
            </h2>
            <p className="text-gray-700 mb-4">
              All projects are hosted on Hugging Face Spaces and are free to use. Simply click on the "View on Hugging Face" button to access the live demo. No account is required for basic usage.
            </p>
            
            <h3 className="text-xl font-bold font-heading text-gray-900 mt-6 mb-3">
              Extending or Adapting the Models
            </h3>
            <p className="text-gray-700 mb-4">
              If you want to adapt these models for your own use case:
            </p>
            <ol className="list-decimal pl-6 mb-6 text-gray-700">
              <li className="mb-2">Create a Hugging Face account if you don't have one</li>
              <li className="mb-2">Fork the Space from the demo page</li>
              <li className="mb-2">Modify the code according to your needs</li>
              <li className="mb-2">Deploy your own version</li>
            </ol>
            
            <h3 className="text-xl font-bold font-heading text-gray-900 mt-6 mb-3">
              API Access
            </h3>
            <p className="text-gray-700">
              Most projects also provide API endpoints that you can integrate into your own applications. Check the documentation on each project page for details.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
