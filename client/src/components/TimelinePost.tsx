import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { Post } from "@shared/schema";

interface TimelinePostProps {
  post: Post;
  commentsCount?: number;
  index: number; // 添加索引以确定左右布局
}

export default function TimelinePost({ post, commentsCount = 0, index }: TimelinePostProps) {
  const formattedDate = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true });
  const isEven = index % 2 === 0; // 偶数索引在左侧，奇数索引在右侧
  
  return (
    <div className="mb-16 relative max-w-4xl mx-auto">
      {/* Timeline line - centered */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2 -mt-6 h-full"></div>
      
      {/* Timeline dot - centered */}
      <div className="absolute left-1/2 bg-primary-500 rounded-full w-8 h-8 z-10 flex items-center justify-center shadow-md transform -translate-x-1/2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      </div>
      
      {/* Content card - conditionally positioned, with responsive layout */}
      <div className={`w-full md:w-5/12 ${isEven ? 'md:ml-auto md:mr-8 lg:mr-12' : 'md:mr-auto md:ml-8 lg:ml-12'}`}>
        <div className={`text-sm text-gray-500 mb-1 text-center md:text-left ${isEven ? 'md:text-right' : 'md:text-left'}`}>{formattedDate}</div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
          {post.coverImage && (
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-40 object-cover"
            />
          )}
          <div className="p-5">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900 font-heading mb-2">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary-600 transition-colors">
                {post.title}
              </Link>
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
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
