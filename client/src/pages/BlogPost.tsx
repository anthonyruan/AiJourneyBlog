import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "@/components/CommentSection";
import NewsletterForm from "@/components/NewsletterForm";
import HuggingFaceEmbed from "@/components/HuggingFaceEmbed";
import { Markdown } from "@/components/ui/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, ArrowLeft } from "lucide-react";
import { Post as BasePost } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

// 扩展Post类型，添加author字段
interface Post extends BasePost {
  author?: {
    id: number;
    username: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string | null;
  };
}

// Replace Chinese comments with English to avoid encoding issues

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { isAdmin, user } = useAuth();

  // Get post data
  const { data: post, isLoading, isError } = useQuery<Post>({
    queryKey: [`/api/posts/${params.slug}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/posts/${params.slug}`);
      if (!res.ok) throw new Error("Failed to fetch post");
      return res.json();
    },
  });

  useEffect(() => {
    if (isError) {
      setLocation("/not-found");
    }
  }, [isError, setLocation]);

  // Check if post has Hugging Face model data
  const hasHuggingFaceModel = post?.huggingFaceModelUrl && post.huggingFaceModelTitle;
  
  // Navigate to edit page
  const handleEditPost = () => {
    if (post) {
      setLocation(`/edit-post/${post.slug}`);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="py-12 container mx-auto px-4 max-w-3xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : post ? (
        <>
          <article className="py-12 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
              {/* Back button and Admin Edit button */}
              <div className="flex justify-between items-center mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setLocation("/")}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditPost}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 border-blue-200 hover:border-blue-400"
                  >
                    <Edit className="h-4 w-4" /> Edit Post
                  </Button>
                )}
              </div>
              
              {/* Post Header */}
              <header className="mb-8">
                <h1 className="text-4xl font-bold font-heading text-gray-900 mb-4">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center text-gray-600 mb-6">
                  <span className="mr-4">
                    {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                  </span>
                  <span className="mr-4">•</span>
                  <span>5 min read</span>
                </div>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-auto rounded-lg mb-8 shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite loop
                      target.src = 'https://via.placeholder.com/1200x630?text=Image+Not+Found';
                    }}
                  />
                )}
              </header>
              
              {/* Post Content */}
              <div className="prose prose-blue max-w-none">
                <Markdown content={post.content} />
                
                {/* Insert Hugging Face Embed if available */}
                {hasHuggingFaceModel && (
                  <div className="my-10 border-2 border-blue-200 rounded-xl p-6 bg-blue-50/50 shadow-lg">
                    <h3 className="text-2xl font-bold mb-6 text-center text-blue-800">{post.huggingFaceModelTitle}</h3>
                    <HuggingFaceEmbed
                      title={post.huggingFaceModelTitle || ""}
                      modelUrl={post.huggingFaceModelUrl || ""}
                      placeholderText={post.huggingFacePlaceholder || "Enter content..."}
                    />
                  </div>
                )}
              </div>
              
              {/* Author Info */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center">
                  {post.author?.avatarUrl ? (
                    <img 
                      src={post.author.avatarUrl} 
                      alt={post.author.displayName || "Author"} 
                      className="h-12 w-12 rounded-full object-cover mr-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.src = 'https://via.placeholder.com/48?text=A';
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {post.author?.displayName || "I'm AI Man"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {post.author?.bio || "AI Researcher & Developer"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
          
          {/* Comments Section */}
          <CommentSection postId={post.id} />
          
          {/* Newsletter */}
          <NewsletterForm />
        </>
      ) : null}
    </>
  );
}
