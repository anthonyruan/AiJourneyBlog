import { 
  users, type User, type InsertUser,
  posts, type Post, type InsertPost,
  projects, type Project, type InsertProject,
  comments, type Comment, type InsertComment,
  messages, type Message, type InsertMessage,
  subscribers, type Subscriber, type InsertSubscriber,
  aboutPage, type AboutPage, type AboutPageData, initialAboutPage
} from "@shared/schema";

import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";

export interface IStorage {
  sessionStore: session.Store;
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Posts
  getPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  getPostsByTag(tag: string): Promise<Post[]>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Comments
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  
  // Messages
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: number): Promise<boolean>;
  
  // Subscribers
  getSubscribers(): Promise<Subscriber[]>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  deleteSubscriber(id: number): Promise<boolean>;
  
  // About Page
  getAboutPage(): Promise<AboutPageData>;
  updateAboutPage(data: AboutPageData): Promise<AboutPageData>;
}

// Create memory store for in-memory session storage
const MemoryStore = createMemoryStore(session);

// MemStorage implementation for memory storage
export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private projects: Map<number, Project>;
  private comments: Map<number, Comment>;
  private messages: Map<number, Message>;
  private subscribers: Map<number, Subscriber>;
  private aboutPageData: AboutPageData;
  
  private userCurrentId: number;
  private postCurrentId: number;
  private projectCurrentId: number;
  private commentCurrentId: number;
  private messageCurrentId: number;
  private subscriberCurrentId: number;

  constructor() {
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.posts = new Map();
    this.projects = new Map();
    this.comments = new Map();
    this.messages = new Map();
    this.subscribers = new Map();
    
    this.userCurrentId = 1;
    this.postCurrentId = 1;
    this.projectCurrentId = 1;
    this.commentCurrentId = 1;
    this.messageCurrentId = 1;
    this.subscriberCurrentId = 1;
    
    // Initialize the About page data with default values
    this.aboutPageData = initialAboutPage;
    
    // Add some initial data for the admin user
    this.users.set(1, {
      id: 1, 
      username: "admin",
      // pre-hashed password for "admin" - this is the output of hashPassword("admin")
      password: "807d4a58d0c5f92d6f2b36b2091143316dea58656f469b13216ad2e11eb36a4f28afe005c0e66d5f8e0e585c034dd457c5f4cebd3c38cdcd01b292ffc882217b.d4b4266cb1e591ceb8e5674a49a1c27d",
      displayName: "Admin User",
      bio: "AI enthusiast and developer",
      email: "admin@example.com",
      avatarUrl: "/avatar.png",
      role: "admin" // 设置为管理员角色
    });
    // 已经手动添加了一个管理员用户，所以ID从2开始
    this.userCurrentId = 2;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    // 确保所有必要的字段都有值，防止类型错误
    const user: User = { 
      ...insertUser, 
      id,
      displayName: insertUser.displayName ?? null,
      bio: insertUser.bio ?? null,
      avatarUrl: insertUser.avatarUrl ?? null,
      email: insertUser.email ?? null,
      role: insertUser.role ?? "user" // 默认为普通用户
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Post methods
  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(
      (post) => post.slug === slug
    );
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postCurrentId++;
    // 确保所有必要的字段都有值，防止类型错误
    const post: Post = { 
      ...insertPost, 
      id,
      excerpt: insertPost.excerpt ?? null,
      coverImage: insertPost.coverImage ?? null,
      tags: insertPost.tags ?? null,
      huggingFaceModelTitle: insertPost.huggingFaceModelTitle ?? null,
      huggingFaceModelUrl: insertPost.huggingFaceModelUrl ?? null,
      huggingFacePlaceholder: insertPost.huggingFacePlaceholder ?? null
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, postUpdate: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...postUpdate };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.tags && post.tags.includes(tag))
      .sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectCurrentId++;
    // 确保所有必要的字段都有值，防止类型错误
    const project: Project = { 
      ...insertProject, 
      id,
      tags: insertProject.tags ?? null,
      imageUrl: insertProject.imageUrl ?? null,
      huggingFaceUrl: insertProject.huggingFaceUrl ?? null,
      isActive: insertProject.isActive ?? 0
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...projectUpdate };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Comment methods
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentCurrentId++;
    // 确保所有必要的字段都有值，防止类型错误
    const comment: Comment = { 
      ...insertComment, 
      id,
      parentId: insertComment.parentId ?? null
    };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Message methods
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const message: Message = { ...insertMessage, id };
    this.messages.set(id, message);
    return message;
  }

  async deleteMessage(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }

  // Subscriber methods
  async getSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }

  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const id = this.subscriberCurrentId++;
    const subscriber: Subscriber = { ...insertSubscriber, id };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }

  async deleteSubscriber(id: number): Promise<boolean> {
    return this.subscribers.delete(id);
  }
  
  // About Page methods
  async getAboutPage(): Promise<AboutPageData> {
    return this.aboutPageData;
  }
  
  async updateAboutPage(data: AboutPageData): Promise<AboutPageData> {
    this.aboutPageData = data;
    return this.aboutPageData;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // PostgreSQL session store setup
    const PostgresSessionStore = connectPg(session);
    
    // Create session store with PostgreSQL
    this.sessionStore = new PostgresSessionStore({
      pool: {
        connectionString: process.env.DATABASE_URL!
      } as any,
      createTableIfMissing: true
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      displayName: insertUser.displayName ?? null,
      bio: insertUser.bio ?? null,
      avatarUrl: insertUser.avatarUrl ?? null,
      email: insertUser.email ?? null,
      role: insertUser.role ?? "user" // 默认为普通用户
    }).returning();
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Post methods
  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.publishedAt));
  }
  
  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }
  
  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }
  
  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values({
      ...insertPost,
      excerpt: insertPost.excerpt ?? null,
      coverImage: insertPost.coverImage ?? null,
      tags: insertPost.tags ?? null,
      huggingFaceModelTitle: insertPost.huggingFaceModelTitle ?? null,
      huggingFaceModelUrl: insertPost.huggingFaceModelUrl ?? null,
      huggingFacePlaceholder: insertPost.huggingFacePlaceholder ?? null
    }).returning();
    return post;
  }
  
  async updatePost(id: number, postUpdate: Partial<InsertPost>): Promise<Post | undefined> {
    const [updatedPost] = await db.update(posts)
      .set(postUpdate)
      .where(eq(posts.id, id))
      .returning();
    return updatedPost;
  }
  
  async deletePost(id: number): Promise<boolean> {
    await db.delete(posts).where(eq(posts.id, id));
    return true;
  }
  
  async getPostsByTag(tag: string): Promise<Post[]> {
    // Unfortunately, for array contents we need to get all posts and filter in JS
    // In a production app, we'd use a proper tags table relation
    const allPosts = await this.getPosts();
    return allPosts.filter(post => post.tags && post.tags.includes(tag))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
  
  // Project methods
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }
  
  async getProjectById(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values({
      ...insertProject,
      tags: insertProject.tags ?? null,
      imageUrl: insertProject.imageUrl ?? null,
      huggingFaceUrl: insertProject.huggingFaceUrl ?? null,
      isActive: insertProject.isActive ?? 0
    }).returning();
    return project;
  }
  
  async updateProject(id: number, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects)
      .set(projectUpdate)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }
  
  // Comment methods
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return await db.select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values({
      ...insertComment,
      parentId: insertComment.parentId ?? null
    }).returning();
    return comment;
  }
  
  async deleteComment(id: number): Promise<boolean> {
    await db.delete(comments).where(eq(comments.id, id));
    return true;
  }
  
  // Message methods
  async getMessages(): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .orderBy(desc(messages.createdAt));
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
  
  async deleteMessage(id: number): Promise<boolean> {
    await db.delete(messages).where(eq(messages.id, id));
    return true;
  }
  
  // Subscriber methods
  async getSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers);
  }
  
  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db.insert(subscribers)
      .values(insertSubscriber)
      .returning();
    return subscriber;
  }
  
  async deleteSubscriber(id: number): Promise<boolean> {
    await db.delete(subscribers).where(eq(subscribers.id, id));
    return true;
  }
  
  // About Page methods
  async getAboutPage(): Promise<AboutPageData> {
    try {
      // Try to get the existing about page data from the database
      const [aboutData] = await db.select().from(aboutPage).limit(1);
      
      if (aboutData) {
        return {
          name: aboutData.name,
          title: aboutData.title,
          bio: aboutData.bio,
          additionalBio: aboutData.additionalBio || undefined,
          profileImage: aboutData.profileImage || undefined,
          socialLinks: aboutData.socialLinks as any || undefined,
          skills: aboutData.skills || undefined
        };
      }
      
      // If no data exists, create default data
      return this.createInitialAboutPage();
    } catch (error) {
      console.error("Error fetching about page data:", error);
      return this.createInitialAboutPage();
    }
  }
  
  async updateAboutPage(data: AboutPageData): Promise<AboutPageData> {
    try {
      // Check if data already exists
      const [existingData] = await db.select().from(aboutPage).limit(1);
      
      if (existingData) {
        // Update existing record
        const [updated] = await db.update(aboutPage)
          .set({
            name: data.name,
            title: data.title,
            bio: data.bio,
            additionalBio: data.additionalBio || null,
            profileImage: data.profileImage || null,
            socialLinks: data.socialLinks || null,
            skills: data.skills || null,
            updatedAt: new Date()
          })
          .where(eq(aboutPage.id, existingData.id))
          .returning();
          
        return {
          name: updated.name,
          title: updated.title,
          bio: updated.bio,
          additionalBio: updated.additionalBio || undefined,
          profileImage: updated.profileImage || undefined,
          socialLinks: updated.socialLinks as any || undefined,
          skills: updated.skills || undefined
        };
      } else {
        // Create new record
        const [created] = await db.insert(aboutPage)
          .values({
            name: data.name,
            title: data.title,
            bio: data.bio,
            additionalBio: data.additionalBio || null,
            profileImage: data.profileImage || null,
            socialLinks: data.socialLinks || null,
            skills: data.skills || null,
            updatedAt: new Date()
          })
          .returning();
          
        return {
          name: created.name,
          title: created.title,
          bio: created.bio,
          additionalBio: created.additionalBio || undefined,
          profileImage: created.profileImage || undefined,
          socialLinks: created.socialLinks as any || undefined,
          skills: created.skills || undefined
        };
      }
    } catch (error) {
      console.error("Error updating about page data:", error);
      throw error;
    }
  }
  
  private async createInitialAboutPage(): Promise<AboutPageData> {
    try {
      // Insert default data
      const [created] = await db.insert(aboutPage)
        .values({
          ...initialAboutPage,
          additionalBio: initialAboutPage.additionalBio || null,
          profileImage: initialAboutPage.profileImage || null,
          socialLinks: initialAboutPage.socialLinks || null,
          skills: initialAboutPage.skills || null,
          updatedAt: new Date()
        })
        .returning();
        
      return {
        name: created.name,
        title: created.title,
        bio: created.bio,
        additionalBio: created.additionalBio || undefined,
        profileImage: created.profileImage || undefined,
        socialLinks: created.socialLinks as any || undefined,
        skills: created.skills || undefined
      };
    } catch (error) {
      console.error("Error creating initial about page data:", error);
      // If there's an error creating the record, return the default data
      return initialAboutPage;
    }
  }
}

// Initialize and export the database storage
export const storage = new DatabaseStorage();

// Initialize database with admin user and sample data
(async function initializeDatabase() {
  try {
    // Check if an admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    
    // If no admin exists, create one with default data
    if (!existingAdmin) {
      console.log("Creating admin user and sample data...");
      
      // Create admin user - the password will be hashed in auth.ts when first accessed
      const admin = await storage.createUser({
        username: "admin",
        password: "807d4a58d0c5f92d6f2b36b2091143316dea58656f469b13216ad2e11eb36a4f28afe005c0e66d5f8e0e585c034dd457c5f4cebd3c38cdcd01b292ffc882217b.d4b4266cb1e591ceb8e5674a49a1c27d",
        displayName: "Admin User",
        bio: "AI enthusiast and developer",
        email: "admin@example.com",
        avatarUrl: "/avatar.png",
        role: "admin" // 设置为管理员角色
      });
      
      // Create sample posts
      const samplePosts = [
        {
          title: "Building a Custom Named Entity Recognition Model",
          slug: "building-custom-ner-model",
          content: `# Building a Custom Named Entity Recognition Model

In this post, I explore how to build and train a custom Named Entity Recognition (NER) model using the Hugging Face transformers library, specifically fine-tuning BERT for domain-specific entity extraction.

## What is Named Entity Recognition?

Named Entity Recognition (NER) is a natural language processing task that involves identifying and classifying named entities in text into predefined categories such as person names, organizations, locations, time expressions, quantities, monetary values, percentages, etc.

## Fine-tuning BERT for NER

BERT (Bidirectional Encoder Representations from Transformers) is a transformer-based machine learning model for NLP. Here's how to fine-tune it for NER:

\`\`\`python
import torch
from transformers import AutoTokenizer, AutoModelForTokenClassification

# Load pre-trained model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
model = AutoModelForTokenClassification.from_pretrained("distilbert-base-uncased", num_labels=9)

# Prepare your dataset
# ... (dataset preparation code)

# Fine-tune the model
# ... (training code)
\`\`\`

## Results

After training, our model achieves an F1 score of 0.92 on the test dataset, which is a significant improvement over the baseline model.

## Conclusion

Fine-tuning BERT for NER tasks provides excellent results with relatively little effort, especially when you have a good labeled dataset. Try it out and let me know your experiences in the comments below!`,
          excerpt: "In this post, I explore how to build and train a custom Named Entity Recognition (NER) model using the Hugging Face transformers library, specifically fine-tuning BERT for domain-specific entity extraction.",
          coverImage: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80",
          publishedAt: new Date(),
          authorId: admin.id,
          tags: ["Machine Learning", "NLP"]
        },
        {
          title: "Deploying My First Text Generation Model",
          slug: "deploying-text-generation-model",
          content: `# Deploying My First Text Generation Model

I've just deployed my first fine-tuned GPT-2 model on Hugging Face Spaces. Here's how I trained it on a custom dataset and made it available as a public API.

## Training the Model

First, I collected a custom dataset of short stories and used it to fine-tune a GPT-2 model. The process involved:

1. Data cleaning and preprocessing
2. Tokenization
3. Fine-tuning with the Hugging Face Trainer API

\`\`\`python
from transformers import GPT2LMHeadModel, GPT2Tokenizer, TextDataset, DataCollatorForLanguageModeling
from transformers import Trainer, TrainingArguments

# Load pre-trained model and tokenizer
model = GPT2LMHeadModel.from_pretrained('gpt2')
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')

# Set up training args
training_args = TrainingArguments(
    output_dir="./results",
    overwrite_output_dir=True,
    num_train_epochs=3,
    per_device_train_batch_size=4,
    save_steps=10_000,
    save_total_limit=2,
)

# Train the model
trainer = Trainer(
    model=model,
    args=training_args,
    data_collator=data_collator,
    train_dataset=dataset,
)

trainer.train()
\`\`\`

## Deploying on Hugging Face Spaces

After training, I pushed the model to the Hugging Face Model Hub and created a Gradio interface for it.

Check out the model at: [Story Generator Demo](https://huggingface.co/spaces/your-username/story-generator)

## Next Steps

I'm planning to improve the model by:
- Using a larger dataset
- Fine-tuning a larger base model
- Adding more control over the generation process

Let me know what you think in the comments below!`,
          excerpt: "I've just deployed my first fine-tuned GPT-2 model on Hugging Face Spaces. Here's how I trained it on a custom dataset and made it available as a public API.",
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          authorId: admin.id,
          tags: ["Hugging Face", "Text Generation"]
        }
      ];
      
      for (const postData of samplePosts) {
        await storage.createPost(postData);
      }
      
      // Create sample projects
      const sampleProjects = [
        {
          title: "Image Captioning",
          description: "An AI model that generates descriptive captions for uploaded images using a vision-language model.",
          imageUrl: "https://images.unsplash.com/photo-1592424002053-21f369ad7fdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80",
          huggingFaceUrl: "https://huggingface.co/spaces/demo/image-captioning",
          tags: ["Computer Vision", "BLIP"],
          isActive: 1
        },
        {
          title: "Sentiment Analyzer",
          description: "A tool that analyzes the sentiment of text inputs, providing polarity scores and emotional content detection.",
          imageUrl: "https://images.unsplash.com/photo-1597589827703-f4b68eafa0ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80",
          huggingFaceUrl: "https://huggingface.co/spaces/demo/sentiment-analysis",
          tags: ["NLP", "RoBERTa"],
          isActive: 1
        }
      ];
      
      for (const projectData of sampleProjects) {
        await storage.createProject(projectData);
      }
      
      // Create sample comments
      await storage.createComment({
        name: "Sarah Chen",
        content: "I really enjoyed your post on Named Entity Recognition! I've been trying to implement something similar for my research project. Do you have any tips for handling domain-specific entities?",
        postId: 1,
        createdAt: new Date()
      });
      
      console.log("Database initialized with sample data");
    } else {
      console.log("Database already initialized with admin user");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
})();