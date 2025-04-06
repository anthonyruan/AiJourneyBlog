import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Post } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Create form validation schema
const editPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.string().optional(),
  huggingFaceModelTitle: z.string().optional(),
  huggingFaceModelUrl: z.string().optional(),
  huggingFacePlaceholder: z.string().optional(),
});

type EditPostFormValues = Omit<z.infer<typeof editPostSchema>, 'tags'> & {
  tags: string | string[];
};

export default function EditPost() {
  const { slug } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
  // Redirect non-admin users
  useEffect(() => {
    if (isAdmin === false) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // Fetch post data
  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ["/api/posts", slug],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/posts/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch post");
      return res.json();
    },
    enabled: !!slug,
  });

  const form = useForm<EditPostFormValues>({
    resolver: zodResolver(editPostSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      tags: "",
      slug: "",
      coverImage: "",
      huggingFaceModelTitle: "",
      huggingFaceModelUrl: "",
      huggingFacePlaceholder: "",
    },
  });

  // Set form default values when post data is loaded
  useEffect(() => {
    if (post) {
      const formData: any = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt ?? "",
        slug: post.slug,
        coverImage: post.coverImage ?? "",
        huggingFaceModelTitle: post.huggingFaceModelTitle ?? "",
        huggingFaceModelUrl: post.huggingFaceModelUrl ?? "",
        huggingFacePlaceholder: post.huggingFacePlaceholder ?? "",
      };
      
      // Process tags array
      if (post.tags && Array.isArray(post.tags)) {
        formData.tags = post.tags.join(", ");
      } else {
        formData.tags = "";
      }
      
      form.reset(formData);
    }
  }, [post, form]);

  // API call to update post
  const updateMutation = useMutation({
    mutationFn: async (data: EditPostFormValues) => {
      // Process tags: convert string to array
      const tags = typeof data.tags === "string" 
        ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean)
        : data.tags;
      
      const formattedData = {
        ...data,
        tags,
      };

      const res = await apiRequest("PUT", `/api/posts/${post?.id}`, formattedData);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update post");
      }
      return await res.json();
    },
    onSuccess: () => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
      navigate(`/blog/${form.getValues().slug}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditPostFormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="post-url-slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be used in the URL of your post
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of your post" 
                        className="resize-y"
                        {...field} 
                      />
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
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your post content here..." 
                        className="min-h-[300px] resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      You can use Markdown for formatting. 添加图片请使用: ![图片描述](图片URL)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="AI, Machine Learning, NLP" {...field} />
                    </FormControl>
                    <FormDescription>
                      Separate tags with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4 border border-gray-200 rounded-lg p-4 mt-6">
                <h3 className="text-lg font-medium">Hugging Face Model (Optional)</h3>
                <FormField
                  control={form.control}
                  name="huggingFaceModelTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Title</FormLabel>
                      <FormControl>
                        <Input placeholder="My AI Model" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="huggingFaceModelUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://huggingface.co/spaces/username/model" {...field} />
                      </FormControl>
                      <FormDescription>
                        The full URL to your Hugging Face space
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="huggingFacePlaceholder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placeholder Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter some text..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Text shown in the input field before user interaction
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Post"}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/blog/${post?.slug}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}