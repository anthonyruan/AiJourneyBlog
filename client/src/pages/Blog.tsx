import { useQuery } from "@tanstack/react-query";
import TimelinePost from "@/components/TimelinePost";
import { Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function Blog() {
  // Get posts
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });
  
  // Get comment counts
  const { data: commentCounts = [] } = useQuery<{postId: number, count: number}[]>({
    queryKey: ['/api/comments/counts'],
  });

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading sm:text-4xl">
              All Posts
            </h1>
            <p className="mt-2 text-xl text-gray-500">
              A collection of my thoughts, experiments and learnings
            </p>
          </div>
        </div>

        {/* Timeline Component */}
        <div className="mt-12 max-w-4xl mx-auto">
          {isLoadingPosts ? (
            <p className="text-center text-gray-500">Loading posts...</p>
          ) : posts.length > 0 ? (
            posts
              .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
              .map((post, index) => (
                <TimelinePost
                  key={post.id}
                  post={post}
                  commentsCount={commentCounts.find(c => c.postId === post.id)?.count || 0}
                  index={index} // Pass index to determine left/right layout
                />
              ))
          ) : (
            <p className="text-center text-gray-500">No posts found</p>
          )}
        </div>
      </div>
    </div>
  );
}