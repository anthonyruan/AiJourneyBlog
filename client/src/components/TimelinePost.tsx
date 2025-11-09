import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { Post } from "@shared/schema";

interface TimelinePostProps {
  post: Post;
  commentsCount?: number;
  index: number; // Added index to determine left/right layout
}

export default function TimelinePost({ post, commentsCount = 0, index }: TimelinePostProps) {
  const formattedDate = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true });
  
  return (
    <div className="mb-20 relative max-w-7xl mx-auto">
      {/* Content card - now in a cleaner, unified layout without timeline, with increased width */}
      <div className="w-full md:w-11/12 lg:w-10/12 mx-auto">
        <div className="flex items-center justify-center mb-2">
          <div className="bg-primary-500 rounded-full w-10 h-10 flex items-center justify-center shadow-sm mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-gray-500">{formattedDate}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
          {post.coverImage && (
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="w-full h-64 md:h-80 lg:h-[420px] overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent infinite loop
                    target.src = 'https://via.placeholder.com/1200x628?text=Image+Not+Found';
                  }}
                />
              </div>
            </Link>
          )}
          <div className="p-6">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 font-heading mb-3">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary-600 transition-colors">
                {post.title}
              </Link>
            </h3>
            <p className="text-gray-600 mb-4 text-base">
              {post.excerpt}
            </p>
            <div className="flex justify-between items-center">
              <Link href={`/blog/${post.slug}`} className="text-primary-600 hover:text-primary-700 font-medium flex items-center text-sm">
                Read more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <div className="flex items-center text-gray-500 text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{commentsCount} comments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
