import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(1, "Project description is required"),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  huggingFaceUrl: z.string().url("Please enter a valid Hugging Face URL").optional().or(z.literal("")),
  tags: z.string().optional().transform(val => 
    val ? val.split(',').map(tag => tag.trim()) : []
  ),
  isActive: z.number().default(1),
});

// To solve TypeScript errors, we manually define the tags type
type ProjectFormValues = Omit<z.infer<typeof projectSchema>, 'tags'> & {
  tags: string | string[];
};

export default function NewProject() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      huggingFaceUrl: "",
      tags: [],
      isActive: 1,
    },
  });

  const projectMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const resp = await apiRequest("POST", "/api/projects", data);
      return resp.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Project created successfully!",
        description: "Your AI project has been published",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setLocation("/projects");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create project: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    projectMutation.mutate(data);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create New AI Project</CardTitle>
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
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Example: Image Recognition Model" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the functionality and purpose of your AI project..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="huggingFaceUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hugging Face URL</FormLabel>
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

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => {
                    // Special handling, if field.value is an array, convert to comma-separated string
                    const value = Array.isArray(field.value) ? field.value.join(', ') : field.value;
                    return (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="NLP, Image Recognition, Text Generation" 
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

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Project Status
                        </FormLabel>
                        <FormMessage />
                        <p className="text-sm text-muted-foreground">
                          Set as active to display this project in the project list
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean(field.value)}
                          onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation("/projects")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={projectMutation.isPending}
                  >
                    {projectMutation.isPending ? "Publishing..." : "Publish Project"}
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