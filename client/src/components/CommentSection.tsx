import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Comment } from "@shared/schema";

const commentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  content: z.string().min(5, "Comment must be at least 5 characters"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyToId, setReplyToId] = useState<number | null>(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: [`/api/comments/post/${postId}`],
    queryFn: async () => {
      const resp = await fetch(`/api/comments/post/${postId}`);
      if (!resp.ok) throw new Error("Failed to fetch comments");
      return resp.json();
    }
  });

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      name: "",
      content: "",
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: CommentFormValues) => {
      const resp = await apiRequest("POST", "/api/comments", {
        ...data,
        postId,
        parentId: replyToId,
      });
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/comments/post/${postId}`] });
      form.reset();
      setReplyToId(null);
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to post comment: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CommentFormValues) => {
    commentMutation.mutate(data);
  };

  // Function to organize comments into a hierarchy with replies
  const organizeComments = (allComments: Comment[]) => {
    const commentMap = new Map<number, Comment & { replies?: Comment[] }>();
    const topLevelComments: (Comment & { replies?: Comment[] })[] = [];

    // First pass: populate the map
    allComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into hierarchy
    allComments.forEach(comment => {
      if (comment.parentId && commentMap.has(comment.parentId)) {
        const parent = commentMap.get(comment.parentId)!;
        parent.replies?.push(commentMap.get(comment.id)!);
      } else {
        topLevelComments.push(commentMap.get(comment.id)!);
      }
    });

    return topLevelComments;
  };

  const organizedComments = organizeComments(comments);

  const handleReply = (commentId: number) => {
    setReplyToId(commentId);
    // Scroll to the form
    document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelReply = () => {
    setReplyToId(null);
  };

  const renderComment = (comment: Comment & { replies?: Comment[] }) => (
    <div key={comment.id} className="flex space-x-4">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">{comment.name}</h4>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </p>
        </div>
        <div className="mt-1 text-sm text-gray-600">
          <p>{comment.content}</p>
        </div>
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto text-sm text-primary-600 hover:text-primary-700 font-medium"
            onClick={() => handleReply(comment.id)}
          >
            Reply
          </Button>
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => (
              <div key={reply.id} className="ml-6 border-l-2 border-gray-100 pl-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{reply.name}</h4>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  <p>{reply.content}</p>
                </div>
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-sm text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => handleReply(comment.id)}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="py-12 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading sm:text-4xl">
            Discussions
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Join the conversation
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-8">
          {/* Comment form */}
          <div className="mb-8" id="comment-form">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {replyToId ? "Reply to comment" : "Leave a comment"}
            </h3>
            
            {replyToId && (
              <div className="mb-4 flex items-center">
                <span className="text-sm text-gray-500 mr-2">Replying to comment</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={cancelReply}
                >
                  Cancel
                </Button>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your comment here..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={commentMutation.isPending}
                >
                  {commentMutation.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Comments list */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent comments</h3>

            {isLoading ? (
              <p className="text-gray-500">Loading comments...</p>
            ) : organizedComments.length > 0 ? (
              <div className="space-y-6">
                {organizedComments.map(comment => renderComment(comment))}
              </div>
            ) : (
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
