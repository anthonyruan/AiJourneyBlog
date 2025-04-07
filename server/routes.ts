import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertPostSchema,
  insertProjectSchema,
  insertCommentSchema,
  insertMessageSchema,
  insertSubscriberSchema,
  aboutPageSchema,
  updateUserSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // 设置认证
  setupAuth(app);
  
  // prefix all routes with /api
  const apiRouter = express.Router();

  // Posts routes
  apiRouter.get("/posts", async (_req: Request, res: Response) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  apiRouter.get("/posts/:slug", async (req: Request, res: Response) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // 获取作者信息
      const author = await storage.getUser(post.authorId);
      
      // 将作者信息添加到响应中
      const postWithAuthor = {
        ...post,
        author: author ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName || "I'm AI Man",
          bio: author.bio || "AI Researcher & Developer",
          avatarUrl: author.avatarUrl || null
        } : {
          id: post.authorId,
          username: "anthonyruan",
          displayName: "I'm AI Man",
          bio: "AI Researcher & Developer",
          avatarUrl: null
        }
      };
      
      res.json(postWithAuthor);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  apiRouter.post("/posts", async (req: Request, res: Response) => {
    try {
      // 手动处理publishedAt字段的日期转换
      const { publishedAt, ...rest } = req.body;
      
      // 确保publishedAt是Date对象
      const parsedDate = publishedAt ? new Date(publishedAt) : new Date();
      
      // 使用已处理的日期创建新的请求数据
      const processedData = {
        ...rest,
        publishedAt: parsedDate
      };
      
      const validatedData = insertPostSchema.parse(processedData);
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Post creation error:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  apiRouter.put("/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // 手动处理publishedAt字段的日期转换
      const { publishedAt, ...rest } = req.body;
      
      // 如果有publishedAt字段，确保它是Date对象
      const processedData = {
        ...rest,
        ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {})
      };
      
      // 由于使用了transform后，不能直接使用partial
      const validatedData = z.object({
        title: z.string().optional(),
        slug: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        coverImage: z.string().optional(),
        publishedAt: z.date().optional(),
        authorId: z.number().optional(),
        tags: z.array(z.string()).optional(),
        huggingFaceModelTitle: z.string().optional(),
        huggingFaceModelUrl: z.string().optional(),
        huggingFacePlaceholder: z.string().optional(),
      }).parse(processedData);
      
      const post = await storage.updatePost(id, validatedData);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Post update error:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  apiRouter.delete("/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePost(id);
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  apiRouter.get("/posts/tag/:tag", async (req: Request, res: Response) => {
    try {
      const posts = await storage.getPostsByTag(req.params.tag);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts by tag" });
    }
  });

  // Projects routes
  apiRouter.get("/projects", async (_req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  apiRouter.get("/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProjectById(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  apiRouter.post("/projects", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  apiRouter.put("/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      // 由于schema限制，需要手动创建一个可选字段的schema
      const validatedData = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        huggingFaceUrl: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isActive: z.number().optional(),
      }).parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  apiRouter.delete("/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Comments routes
  apiRouter.get("/comments/post/:postId", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  
  // Get comment counts for all posts
  apiRouter.get("/comments/counts", async (_req: Request, res: Response) => {
    try {
      const posts = await storage.getPosts();
      const commentCounts = await Promise.all(
        posts.map(async (post) => {
          const comments = await storage.getCommentsByPostId(post.id);
          return {
            postId: post.id,
            count: comments.length
          };
        })
      );
      
      res.json(commentCounts);
    } catch (error) {
      console.error("Error fetching comment counts:", error);
      res.status(500).json({ message: "Failed to fetch comment counts" });
    }
  });

  apiRouter.post("/comments", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        createdAt: new Date()
      });
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  apiRouter.delete("/comments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteComment(id);
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Messages routes
  apiRouter.post("/messages", async (req: Request, res: Response) => {
    try {
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        createdAt: new Date()
      });
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Subscribers routes
  apiRouter.post("/subscribers", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSubscriberSchema.parse({
        ...req.body,
        createdAt: new Date()
      });
      const subscriber = await storage.createSubscriber(validatedData);
      res.status(201).json(subscriber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to create subscriber" });
    }
  });
  
  // About page routes
  apiRouter.get("/about", async (_req: Request, res: Response) => {
    try {
      const aboutPageData = await storage.getAboutPage();
      res.json(aboutPageData);
    } catch (error) {
      console.error("Error fetching about page data:", error);
      res.status(500).json({ message: "Failed to fetch about page data" });
    }
  });
  
  apiRouter.put("/about", async (req: Request, res: Response) => {
    try {
      // Check authentication - only admin should update the about page
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Validate about page data
      const validatedData = aboutPageSchema.parse(req.body);
      
      // Update the about page data
      const updatedData = await storage.updateAboutPage(validatedData);
      res.json(updatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error updating about page:", error);
      res.status(500).json({ message: "Failed to update about page" });
    }
  });

  // Register all API routes
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
