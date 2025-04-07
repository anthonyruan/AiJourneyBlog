import { pgTable, text, serial, integer, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema - keeping the existing one
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  email: true,
});

// Blog Posts schema
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  publishedAt: timestamp("published_at").notNull(),
  authorId: integer("author_id").notNull(),
  tags: text("tags").array(),
  huggingFaceModelTitle: text("hugging_face_model_title"),
  huggingFaceModelUrl: text("hugging_face_model_url"),
  huggingFacePlaceholder: text("hugging_face_placeholder"),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true
});

// Projects schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  huggingFaceUrl: text("hugging_face_url"),
  tags: text("tags").array(),
  isActive: integer("is_active").notNull().default(1),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true
});

// Comments schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  postId: integer("post_id").notNull(),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true
});

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true
});

// Subscribers schema
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;

// About page schema
export const aboutPage = pgTable("about_page", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  additionalBio: text("additional_bio"),
  profileImage: text("profile_image"),
  socialLinks: jsonb("social_links"),
  skills: text("skills").array(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const aboutPageSchema = z.object({
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
  skills: z.array(z.string()).optional(),
});

export const initialAboutPage = {
  name: "Admin User",
  title: "AI Researcher & Developer",
  bio: "I'm an AI enthusiast and developer focused on natural language processing and computer vision applications. My journey began with traditional machine learning and has evolved to working with transformer-based models and generative AI.",
  additionalBio: "Currently, I'm exploring the intersection of multimodal learning and practical applications of AI in everyday tools. This blog documents my learning process, challenges, and discoveries along the way.",
  profileImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80",
  socialLinks: {
    github: "https://github.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    huggingface: "https://huggingface.co"
  },
  skills: [
    "Python", "PyTorch", "TensorFlow", "NLP", "Computer Vision", 
    "Hugging Face", "Transformers", "Generative AI", "LLMs", 
    "React", "Web Development"
  ]
};

export type AboutPage = typeof aboutPage.$inferSelect;
export type AboutPageData = z.infer<typeof aboutPageSchema>;
