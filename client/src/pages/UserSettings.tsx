import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Form validation schema
const userSettingsSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  currentPassword: z.string().min(1, "Current password is required to change password").optional(),
  password: z.string().min(6, "New password must be at least 6 characters").optional(),
  confirmPassword: z.string().optional(),
  displayName: z.string().optional(),
}).refine(data => {
  // If password is set, confirmPassword must match
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  // If password is set, currentPassword must be provided
  if (data.password && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;

export default function UserSettings() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Form setup
  const form = useForm<UserSettingsFormValues>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      username: "",
      currentPassword: "",
      password: "",
      confirmPassword: "",
      displayName: "",
    },
  });

  // Client-side rendering detection
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update form default values
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        displayName: user.displayName || "",
      });
    }
  }, [user, form]);

  // Redirect if not logged in
  useEffect(() => {
    if (isClient && !isLoading && !user) {
      navigate("/auth");
      toast({
        title: "Login Required",
        description: "You need to be logged in to access this page",
        variant: "destructive",
      });
    }
  }, [isClient, isLoading, user, navigate, toast]);

  // Update user information
  const updateUserMutation = useMutation({
    mutationFn: async (data: UserSettingsFormValues) => {
      if (!user) throw new Error("User not logged in");
      
      // Only send changed fields
      const updatedFields: Record<string, any> = {};
      
      if (data.username && data.username !== user.username) {
        updatedFields.username = data.username;
      }
      
      if (data.displayName && data.displayName !== user.displayName) {
        updatedFields.displayName = data.displayName;
      }
      
      if (data.password) {
        updatedFields.password = data.password;
        updatedFields.currentPassword = data.currentPassword;
      }
      
      // If no changes, don't send request
      if (Object.keys(updatedFields).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes detected to update",
        });
        return user;
      }
      
      const res = await apiRequest('PUT', `/api/user/${user.id}`, updatedFields);
      
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Failed to update user information");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Update Successful",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      // Clear password fields
      form.setValue("currentPassword", "");
      form.setValue("password", "");
      form.setValue("confirmPassword", "");
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Submit handler
  const onSubmit = (data: UserSettingsFormValues) => {
    updateUserMutation.mutate(data);
  };

  if (isLoading || !isClient) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-8">User Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Display Name */}
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                
                {/* Current Password */}
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* New Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Confirm New Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? (
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
    </div>
  );
}