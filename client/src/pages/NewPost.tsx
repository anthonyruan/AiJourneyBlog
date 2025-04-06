import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
    .replace(/\-\-+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
};

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string(),
  content: z.string(),
  coverImage: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  tags: z.string().optional().transform(val => 
    val ? val.split(',').map(tag => tag.trim()) : []
  ),
  huggingFaceModelTitle: z.string().optional().or(z.literal("")),
  huggingFaceModelUrl: z.string().url("Please enter a valid Hugging Face URL").optional().or(z.literal("")),
  huggingFacePlaceholder: z.string().optional().or(z.literal("")),
});

// Using the original schema type, but to solve TypeScript errors, we manually define the tags type
type PostFormValues = Omit<z.infer<typeof postSchema>, 'tags'> & {
  tags: string | string[];
};

export default function NewPost() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState("edit");

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      coverImage: "",
      tags: [],
      huggingFaceModelTitle: "",
      huggingFaceModelUrl: "",
      huggingFacePlaceholder: "",
    },
  });

  const watchContent = form.watch("content");

  const postMutation = useMutation({
    mutationFn: async (data: PostFormValues & { slug: string }) => {
      const currentDate = new Date().toISOString();
      const resp = await apiRequest("POST", "/api/posts", {
        ...data,
        publishedAt: currentDate,
        authorId: 1, // Using admin user id
      });
      return resp.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Post created!",
        description: "Your post has been published successfully",
      });
      setLocation(`/blog/${data.slug}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create post: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostFormValues) => {
    // tags have already been converted to string arrays by the schema
    const slug = slugify(data.title);
    postMutation.mutate({ ...data, slug });
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create New Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          请使用直接图片链接，不要使用短链接。对于ibb.co网站，请使用直接图片URL（以.jpg、.png等结尾的链接），而不是图片页面链接。
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief summary of your post"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => {
                    // Special handling: if field.value is an array, convert to comma-separated string
                    const value = Array.isArray(field.value) ? field.value.join(', ') : field.value;
                    return (
                      <FormItem>
                        <FormLabel>Tags (comma separated)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="AI, Machine Learning, NLP" 
                            {...field}
                            value={value}
                            onChange={(e) => {
                              // When user inputs, only update the string value of the field
                              field.onChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                
                <div className="space-y-4 border border-gray-200 p-4 rounded-md">
                  <h3 className="text-lg font-medium">Hugging Face Model (Optional)</h3>
                  <p className="text-sm text-gray-500">If you want to embed a Hugging Face model in your article, please fill in the following fields</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="huggingFaceModelTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Example: Text Classification Model" {...field} />
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
                            <Input 
                              placeholder="https://huggingface.co/spaces/username/model-name" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="huggingFacePlaceholder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placeholder Text</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter text for analysis..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Tabs value={tab} onValueChange={setTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content (Markdown)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write your post content in Markdown format..."
                              rows={20}
                              {...field}
                            />
                          </FormControl>
                          <div className="text-sm text-gray-500 mt-1">
                            支持Markdown格式。添加图片请使用: ![图片描述](图片URL)
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-4">
                    <div className="border border-gray-200 rounded-md p-4 min-h-[200px]">
                      {watchContent ? (
                        <Markdown content={watchContent} />
                      ) : (
                        <p className="text-gray-400 italic">Your preview will appear here...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation("/")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={postMutation.isPending}
                  >
                    {postMutation.isPending ? "Publishing..." : "Publish Post"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
