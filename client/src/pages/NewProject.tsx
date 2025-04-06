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
  title: z.string().min(1, "项目标题是必填的"),
  description: z.string().min(1, "项目描述是必填的"),
  imageUrl: z.string().url("请输入有效的URL").optional().or(z.literal("")),
  huggingFaceUrl: z.string().url("请输入有效的Hugging Face URL").optional().or(z.literal("")),
  tags: z.string().optional().transform(val => 
    val ? val.split(',').map(tag => tag.trim()) : []
  ),
  isActive: z.boolean().default(true),
});

// 为了解决TypeScript的错误，我们手动定义tags的类型
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
      isActive: true,
    },
  });

  const projectMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const resp = await apiRequest("POST", "/api/projects", data);
      return resp.json();
    },
    onSuccess: (data) => {
      toast({
        title: "项目创建成功！",
        description: "您的AI项目已成功发布",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setLocation("/projects");
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: `创建项目失败: ${error}`,
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
            <CardTitle className="text-2xl font-bold">创建新的AI项目</CardTitle>
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
                        <FormLabel>项目标题</FormLabel>
                        <FormControl>
                          <Input placeholder="例如：图像识别模型" {...field} />
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
                        <FormLabel>封面图片URL (可选)</FormLabel>
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
                      <FormLabel>项目描述</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="描述您的AI项目功能和用途..."
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
                    // 特殊处理，如果field.value是数组，则转换为逗号分隔的字符串
                    const value = Array.isArray(field.value) ? field.value.join(', ') : field.value;
                    return (
                      <FormItem>
                        <FormLabel>标签 (逗号分隔)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="NLP, 图像识别, 文本生成" 
                            {...field}
                            value={value}
                            onChange={(e) => {
                              // 当用户输入时，只更新字段的字符串值
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
                          项目状态
                        </FormLabel>
                        <FormMessage />
                        <p className="text-sm text-muted-foreground">
                          设置为活跃状态以在项目列表中显示此项目
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
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
                    取消
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={projectMutation.isPending}
                  >
                    {projectMutation.isPending ? "发布中..." : "发布项目"}
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