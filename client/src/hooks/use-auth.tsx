import { createContext, ReactNode, useContext, useEffect, useCallback } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User } from "@shared/schema";
import { apiRequest, queryClient, getQueryFn } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useLocation } from "wouter";

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
  const [, navigate] = useLocation();

  // 添加会话恢复函数
  const checkSession = useCallback(async () => {
    try {
      // 手动检查会话状态
      const res = await fetch('/api/user', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (res.ok) {
        const userData = await res.json();
        queryClient.setQueryData(["/api/user"], userData);
        return userData;
      } else if (res.status === 401) {
        queryClient.setQueryData(["/api/user"], null);
      }
      return null;
    } catch (error) {
      console.error("Session check error:", error);
      return null;
    }
  }, []);

  // 使用增强的用户会话查询
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });

  // 页面加载时检查会话状态
  useEffect(() => {
    // 只在会话可能丢失时检查（如用户存储但查询未返回）
    const sessionCheck = async () => {
      if (!user && !isLoading) {
        await checkSession();
      }
    };
    
    sessionCheck();
    
    // 添加窗口焦点事件监听器，确保会话最新
    const handleFocus = () => {
      refetch();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, isLoading, checkSession, refetch]);

  // 检查管理员权限
  const isAdmin = !!user && user.role === 'admin';

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        // 增加更好的错误处理
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
          credentials: "include"
        });
        
        if (!res.ok) {
          let errorMessage = "Login failed";
          
          try {
            // 尝试解析详细错误信息
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch {}
          
          throw new Error(errorMessage);
        }
        
        // 解析并返回用户数据
        return await res.json();
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // 更新缓存中的用户数据
      queryClient.setQueryData(["/api/user"], data);
      
      // 强制刷新以确保最新状态
      refetch();
      
      // 显示成功消息
      const isUserAdmin = data.role === 'admin';
      toast({
        title: "Login successful",
        description: isUserAdmin ? "You are now logged in as administrator" : "You are now logged in",
      });
      
      // 使用wouter的navigate而非window.location重定向
      // 这样避免了页面完全刷新
      setTimeout(() => {
        navigate("/");
      }, 300);
    },
    onError: (error: any) => {
      // 增强错误处理
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Unable to log in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      try {
        // 增加更好的错误处理
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
          credentials: "include"
        });
        
        if (!res.ok) {
          let errorMessage = "Registration failed";
          
          try {
            // 尝试解析详细错误信息
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch {}
          
          throw new Error(errorMessage);
        }
        
        // 解析并返回用户数据
        return await res.json();
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // 更新缓存中的用户数据
      queryClient.setQueryData(["/api/user"], data);
      
      // 强制刷新以确保最新状态
      refetch();
      
      toast({
        title: "Registration successful",
        description: "Your account has been created and you are now logged in",
      });
      
      // 使用wouter的navigate
      setTimeout(() => {
        navigate("/");
      }, 300);
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        // 增加更好的错误处理
        const res = await fetch("/api/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache",
          }
        });
        
        if (!res.ok) {
          let errorMessage = "Logout failed";
          
          try {
            // 尝试解析详细错误信息
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch {}
          
          throw new Error(errorMessage);
        }
        
        // 清理会话数据
        localStorage.removeItem("lastAuthRefresh");
        sessionStorage.removeItem("lastAuthRefresh");
        
        // 不需要返回数据
        return;
      } catch (error) {
        console.error("Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // 立即清除缓存中的用户数据
      queryClient.setQueryData(["/api/user"], null);
      
      // 清除所有可能的用户数据相关缓存
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });
      
      // 使用wouter导航，但添加短延迟以确保清除完成
      setTimeout(() => {
        navigate("/");
      }, 300);
    },
    onError: (error: any) => {
      // 增强错误处理
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Unable to log out. Please try again.",
        variant: "destructive",
      });
      
      // 即使出错也尝试清理本地缓存
      queryClient.setQueryData(["/api/user"], null);
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