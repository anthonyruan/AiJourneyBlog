import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TimelinePost from "@/components/TimelinePost";
import ProjectCard from "@/components/ProjectCard";
import NewsletterForm from "@/components/NewsletterForm";
import { Button } from "@/components/ui/button";
import { Post, Project } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { AdminLink } from "@/components/ProtectedRoute";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { isAdmin, logoutMutation } = useAuth();

  // Get posts
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });

  // Get projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Scroll to section based on hash
  useEffect(() => {
    if (location.includes('#')) {
      const id = location.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl font-heading">
              <span className="block">AI Research &</span>
              <span className="block text-primary-600">Learning Journey</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Documenting my learning process, AI experiments, and research findings as I explore the world of artificial intelligence.
            </p>
            <div className="mt-8 flex justify-center gap-3 flex-wrap">
              <Button 
                asChild
                size="lg" 
                className="bg-primary-600 hover:bg-primary-700"
                onClick={() => setLocation("#blog")}
              >
                <Link href="#blog">Read Blog</Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="text-primary-600 border-primary-600 hover:bg-primary-50"
                onClick={() => setLocation("#projects")}
              >
                <Link href="#projects">View Projects</Link>
              </Button>
            </div>
            
            {/* Admin buttons removed - accessible only via direct URL */}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-12 bg-white" id="blog">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading sm:text-4xl">
              Recent Posts
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              My latest thoughts, experiments and learnings
            </p>
          </div>

          {/* Timeline Component */}
          <div className="mt-12 max-w-4xl mx-auto">
            {isLoadingPosts ? (
              <p className="text-center text-gray-500">Loading posts...</p>
            ) : posts.length > 0 ? (
              posts.slice(0, 3).map((post, index) => (
                <TimelinePost 
                  key={post.id} 
                  post={post} 
                  commentsCount={3} // In a real app, get actual count from DB
                  index={index} // Pass index to determine left/right layout
                />
              ))
            ) : (
              <p className="text-center text-gray-500">No posts found</p>
            )}

            {posts.length > 3 && (
              <div className="text-center mt-8">
                <Button 
                  asChild
                  variant="outline"
                  className="px-6 py-3 text-base"
                >
                  <Link href="/blog">
                    View All Posts
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-12 bg-gray-50" id="projects">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading sm:text-4xl">
              AI Projects
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              My experiments and applications hosted on Hugging Face Spaces
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingProjects ? (
              <p className="text-center text-gray-500 md:col-span-2 lg:col-span-3">Loading projects...</p>
            ) : projects.length > 0 ? (
              projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <p className="text-center text-gray-500 md:col-span-2 lg:col-span-3">No projects found</p>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterForm />
    </>
  );
}
