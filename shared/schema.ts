import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
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
