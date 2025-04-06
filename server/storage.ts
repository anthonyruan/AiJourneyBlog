import { 
  users, type User, type InsertUser,
  posts, type Post, type InsertPost,
  projects, type Project, type InsertProject,
  comments, type Comment, type InsertComment,
  messages, type Message, type InsertMessage,
  subscribers, type Subscriber, type InsertSubscriber
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private projects: Map<number, Project>;
  private comments: Map<number, Comment>;
  private messages: Map<number, Message>;
  private subscribers: Map<number, Subscriber>;
  
  private userCurrentId: number;
  private postCurrentId: number;
  private projectCurrentId: number;
  private commentCurrentId: number;
  private messageCurrentId: number;
  private subscriberCurrentId: number;

  constructor() {
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
    
    // Add some initial data for the admin user
    this.users.set(1, {
      id: 1, 
      username: "admin",
      // pre-hashed password for "admin" - this is the output of hashPassword("admin")
      password: "807d4a58d0c5f92d6f2b36b2091143316dea58656f469b13216ad2e11eb36a4f28afe005c0e66d5f8e0e585c034dd457c5f4cebd3c38cdcd01b292ffc882217b.d4b4266cb1e591ceb8e5674a49a1c27d",
      displayName: "Admin User",
      bio: "AI enthusiast and developer",
      email: "admin@example.com",
      avatarUrl: "/avatar.png"
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
      email: insertUser.email ?? null
    };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();

// Add sample data
(async () => {
  const admin = await storage.getUserByUsername("admin");
  if (!admin) return;

  // Sample posts
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
      publishedAt: new Date("2023-04-15T12:00:00Z"),
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
      publishedAt: new Date("2023-03-28T14:30:00Z"),
      authorId: admin.id,
      tags: ["Hugging Face", "Text Generation"]
    },
    {
      title: "Getting Started with the Hugging Face Transformers Library",
      slug: "getting-started-with-transformers",
      content: `# Getting Started with the Hugging Face Transformers Library

A step-by-step guide to working with pre-trained transformer models using the Hugging Face library. Perfect for AI beginners!

## What are Transformers?

Transformers are a type of neural network architecture that has been shown to be very effective for many NLP tasks. The Hugging Face Transformers library provides easy access to pre-trained models that you can use right away.

## Basic Usage

Here's a simple example of how to use a pre-trained sentiment analysis model:

\`\`\`python
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Load pre-trained model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")
model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")

# Prepare input
text = "I've been waiting for a HuggingFace course my whole life."
inputs = tokenizer(text, return_tensors="pt")

# Get prediction
with torch.no_grad():
    outputs = model(**inputs)
    
predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
positive_score = predictions[0, 1].item()
print(f"Positive sentiment score: {positive_score:.4f}")
\`\`\`

## Available Tasks

The Transformers library supports many tasks out of the box:

- Text classification
- Named entity recognition
- Question answering
- Text generation
- Translation
- Summarization
- And more!

## Conclusion

Hugging Face's Transformers library makes it incredibly easy to start using state-of-the-art NLP models. Give it a try and let me know your thoughts in the comments!`,
      excerpt: "A step-by-step guide to working with pre-trained transformer models using the Hugging Face library. Perfect for AI beginners!",
      coverImage: "https://images.unsplash.com/photo-1550837368-6594235de85c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80",
      publishedAt: new Date("2023-03-12T09:15:00Z"),
      authorId: admin.id,
      tags: ["Python", "Tutorial"]
    }
  ];

  for (const postData of samplePosts) {
    await storage.createPost(postData);
  }

  // Sample projects
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
    },
    {
      title: "Text-to-Image",
      description: "Generate images from text descriptions using a fine-tuned Stable Diffusion model specialized in artistic styles.",
      imageUrl: "https://images.unsplash.com/photo-1550837368-6594235de85c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80",
      huggingFaceUrl: "https://huggingface.co/spaces/demo/text-to-image",
      tags: ["Generative AI", "Stable Diffusion"],
      isActive: 1
    }
  ];

  for (const projectData of sampleProjects) {
    await storage.createProject(projectData);
  }

  // Sample comments
  const sampleComments = [
    {
      name: "Sarah Chen",
      content: "I really enjoyed your post on Named Entity Recognition! I've been trying to implement something similar for my research project. Do you have any tips for handling domain-specific entities?",
      postId: 1,
      createdAt: new Date("2023-04-13T18:30:00Z")
    },
    {
      name: "Miguel Santos",
      content: "Great blog! I'm wondering how you're handling the hosting of these Hugging Face demos within your personal website. Are you using iframes or some kind of API integration?",
      postId: 2,
      createdAt: new Date("2023-03-24T10:45:00Z")
    },
    {
      name: "Admin User",
      content: "Thanks Miguel! I'm using Hugging Face's Inference API for some models and embedding the Spaces using iframes for the more interactive demos. I'll write a detailed post about the integration process soon.",
      postId: 2,
      parentId: 2,
      createdAt: new Date("2023-03-25T14:20:00Z")
    },
    {
      name: "Alex Johnson",
      content: "I tried your Sentiment Analyzer tool and it's working great! One suggestion: could you add support for analyzing sentiment in multiple languages?",
      postId: 3,
      createdAt: new Date("2023-03-05T09:10:00Z")
    }
  ];

  for (const commentData of sampleComments) {
    await storage.createComment(commentData);
  }
})();
