import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { loginMutation, user, isAdmin } = useAuth();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // 使用 useEffect 来处理重定向，而不是在渲染期间
  useEffect(() => {
    // 如果用户已登录（不仅仅是管理员），重定向到主页
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onSubmit = (data: LoginFormValues) => {
    // 重置任何之前的表单错误
    form.clearErrors();
    
    loginMutation.mutate(data, {
      onSuccess: () => {
        // 登录成功的处理在 useAuth 中已实现
        // 这里不需要额外操作
      },
      onError: (error) => {
        // 显示错误信息，让用户知道登录失败原因
        form.setError("root", { 
          message: error.message || "Login failed. Please check your credentials."
        });
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch min-h-[calc(100vh-10rem)]">
      {/* 左侧登录表单 */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Access
              </CardTitle>
              <CardDescription className="text-center text-gray-500">
                Enter your credentials to manage your content
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your username" 
                            className="bg-gray-50 focus:bg-white transition-all duration-200"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            className="bg-gray-50 focus:bg-white transition-all duration-200"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.root && (
                    <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
                      {form.formState.errors.root.message}
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </span>
                    ) : "Log In"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col pt-0">
              <p className="text-xs text-center text-gray-500 mt-2">
                For demo purposes, use username: "admin" password: "adminpassword"
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* 右侧介绍性内容 */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6">Welcome to I'm AI Man Content Management</h1>
          <p className="text-lg mb-8 opacity-90">
            This secure login provides access to manage your blog posts, projects, and site content. 
            Share your AI journey with the world in just a few clicks.
          </p>
          <ul className="space-y-3">
            {["Create and publish new content", "Manage your AI projects", "Moderate visitor comments", "Update your personal profile"].map((item, i) => (
              <li key={i} className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}