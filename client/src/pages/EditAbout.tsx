import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Form validation schema for about page - matches backend schema
const aboutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(1, "Bio is required"),
  additionalBio: z.string().optional(),
  profileImage: z.string().optional(),
  socialLinks: z.object({
    github: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    huggingface: z.string().optional(),
  }).optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional().transform(val => {
    // Handle either string or array
    if (typeof val === 'string') {
      return val.split(',').map(skill => skill.trim()).filter(Boolean);
    }
    return val;
  }),
});

type AboutFormValues = z.infer<typeof aboutSchema>;

export default function EditAbout() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Fetch about page data
  const { data: aboutData, isLoading: isLoadingAbout } = useQuery({
    queryKey: ['/api/about'],
    queryFn: async () => {
      const res = await fetch('/api/about');
      if (!res.ok) throw new Error('Failed to fetch about page data');
      return res.json();
    },
  });

  // Form setup
  const form = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      additionalBio: "",
      profileImage: "",
      socialLinks: {
        github: "",
        twitter: "",
        linkedin: "",
        huggingface: "",
      },
      skills: [],
    },
  });

  // Update form values when aboutData is loaded
  useEffect(() => {
    if (aboutData) {
      // Format skills as comma-separated string for the form if they exist
      const formattedSkills = aboutData.skills || [];
      
      form.reset({
        ...aboutData,
        skills: formattedSkills,
      });
    }
  }, [aboutData, form]);

  // Client-side only to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to homepage if not admin
  useEffect(() => {
    if (isClient && !isAdmin) {
      navigate("/");
      toast({
        title: "Unauthorized",
        description: "You need to be an admin to edit the about page.",
        variant: "destructive",
      });
    }
  }, [isClient, isAdmin, navigate, toast]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: AboutFormValues) => {
      const res = await apiRequest('PUT', '/api/about', data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update about page');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "About page has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/about'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating about page",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Submit handler
  const onSubmit = (data: AboutFormValues) => {
    updateMutation.mutate(data);
  };

  if (!isClient || !isAdmin) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Edit About Page</h1>
      
      {isLoadingAbout ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>About Page Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Your professional title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/your-image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Bio Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Biography</h3>
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief introduction of yourself"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="additionalBio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Bio (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="More detailed information about your background and interests"
                            className="min-h-[150px]"
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Social Media Links</h3>
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/yourusername" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/yourusername" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/yourusername" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.huggingface"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hugging Face</FormLabel>
                        <FormControl>
                          <Input placeholder="https://huggingface.co/yourusername" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Skills */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Skills</h3>
                  
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills (comma-separated)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Python, NLP, Machine Learning, React, etc." 
                            {...field} 
                            value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/about')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}