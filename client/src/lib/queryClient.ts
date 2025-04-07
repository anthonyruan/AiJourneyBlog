import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // 尝试解析JSON错误消息
    let errorMessage = res.statusText;
    try {
      const contentType = res.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const errorJson = await res.json();
        errorMessage = errorJson.message || errorJson.error || JSON.stringify(errorJson);
      } else {
        errorMessage = await res.text() || res.statusText;
      }
    } catch (e) {
      // 如果JSON解析失败，使用文本内容
      errorMessage = await res.text().catch(() => res.statusText);
    }
    
    // 创建更详细的错误对象
    const error = new Error(`${res.status}: ${errorMessage}`);
    (error as any).status = res.status;
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
// 首先创建一个QueryClient实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 基本查询配置，我们会在后面覆盖queryFn
      refetchInterval: false,
      refetchOnWindowFocus: true, // 窗口获得焦点时检查会话状态
      staleTime: 5 * 60 * 1000, // 5分钟内不重新获取相同的数据
      retry: 2, // 失败时重试2次
    },
    mutations: {
      retry: 1, // 允许1次重试，确保网络波动时不丢失操作
    },
  },
});

// 然后定义查询函数工厂
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // 添加更强大的错误处理
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
        // 添加防止缓存的头部，确保每次获取最新数据
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      // 特殊处理认证错误
      if (res.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        } else {
          // 这里已经有queryClient实例了
          queryClient.removeQueries({ queryKey: ["/api/user"] });
          const error = new Error("Authentication required. Please log in.");
          (error as any).status = 401;
          throw error;
        }
      }

      // 处理其他错误
      await throwIfResNotOk(res);
      
      // 解析并返回结果
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Query error:", error);
      throw error;
    }
  };

// 配置默认的queryFn
queryClient.setDefaultOptions({
  queries: {
    ...queryClient.getDefaultOptions().queries,
    queryFn: getQueryFn({ on401: "throw" }),
  }
});
