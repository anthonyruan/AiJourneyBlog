import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
  isAdmin: boolean;
};

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;
type InsertUser = z.infer<typeof insertUserSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // In a real application, we would fetch the user from the server
  // For now, we'll use a simplified approach
  useEffect(() => {
    // Check if we have stored admin status in localStorage
    const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(storedIsAdmin);
  }, []);

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      // In a real app, this would be a fetch to the server
      // For now, we'll return null to indicate not logged in
      return null;
    },
    enabled: false, // Disable this query since we're not actually fetching
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // In a real application, this would call the server
      // For our demo, we'll just simulate an admin login

      if (credentials.username === "admin" && credentials.password === "admin") {
        // Store admin status
        localStorage.setItem("isAdmin", "true");
        setIsAdmin(true);
        
        // Return a mock user that matches the User type
        return {
          id: 1,
          username: "admin",
          password: "***",
          displayName: "Administrator",
          bio: null,
          avatarUrl: null,
          email: null,
        } as User;
      }
      
      throw new Error("Invalid credentials");
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "You are now logged in as admin",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      // In a real application, this would register a new user
      // For our demo, we'll just throw an error as registration isn't implemented
      throw new Error("Registration not implemented in demo");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // In a real application, this would call the server
      // For our demo, we'll just clear the admin status
      localStorage.removeItem("isAdmin");
      setIsAdmin(false);
    },
    onSuccess: () => {
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}