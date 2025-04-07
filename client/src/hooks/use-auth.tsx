import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User } from "@shared/schema";
import { apiRequest, queryClient, getQueryFn } from "../lib/queryClient";
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

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    // 增加重试次数，处理会话初始化延迟的情况
    retry: 3,
    retryDelay: 1000,
    // 每次组件挂载或窗口获得焦点时重新验证会话
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // 会话状态相对稳定，可以较长时间缓存
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Check if the user is an admin based on their role
  const isAdmin = !!user && user.role === 'admin';

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      // 直接设置用户数据到缓存中，确保登录状态立即可见
      queryClient.setQueryData(["/api/user"], data);
      
      // 使用refetch而不是invalidateQueries，确保获取最新的用户状态
      refetch();
      
      const isUserAdmin = data.role === 'admin';
      toast({
        title: "Login successful",
        description: isUserAdmin ? "You are now logged in as administrator" : "You are now logged in",
      });
      
      // 使用正常的路由导航而不是页面刷新
      // 减少延迟，因为我们已经改进了服务器端会话处理
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
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
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", userData);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      // 直接设置用户数据到缓存中
      queryClient.setQueryData(["/api/user"], data);
      
      // 使用refetch而不是invalidateQueries
      refetch();
      
      toast({
        title: "Registration successful",
        description: "You are now logged in",
      });
      
      // 减少延迟，因为我们已经改进了服务器端会话处理
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
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
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Logout failed");
      }
    },
    onSuccess: () => {
      // 直接将用户数据设为null
      queryClient.setQueryData(["/api/user"], null);
      
      // 使用refetch而不是invalidateQueries
      refetch();
      
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });
      
      // 刷新页面，确保所有组件刷新并清除状态
      // 但减少延迟
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
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