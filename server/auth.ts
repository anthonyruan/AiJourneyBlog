import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import createMemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    
    if (!hashed || !salt) {
      console.error("Invalid stored password format");
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    // 确保两个缓冲区长度一致
    if (hashedBuf.length !== suppliedBuf.length) {
      console.error(`Buffer length mismatch: ${hashedBuf.length} vs ${suppliedBuf.length}`);
      return false;
    }
    
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

// 检查用户是否为管理员
export function isAdmin(user: SelectUser | undefined): boolean {
  return !!user && user.role === 'admin';
}

export function setupAuth(app: Express) {
  // 使用更强壮的会话配置
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ai-man-blog-secret-key-v2",
    resave: true, // 确保每次请求都保存会话
    saveUninitialized: false, // 不保存未初始化的会话，减少服务器负担
    rolling: true, // 每次请求都重设过期时间
    store: storage.sessionStore, // 使用数据库会话存储
    name: 'ai_man_sid', // 自定义cookie名，增加安全性
    cookie: {
      httpOnly: true, // 防止客户端JS访问cookie
      secure: process.env.NODE_ENV === "production", // 生产环境使用HTTPS
      sameSite: "lax", // 平衡安全和用户体验
      maxAge: 14 * 24 * 60 * 60 * 1000, // 两周有效期
      path: '/'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        // 强制保存会话，确保会话ID已写入cookie
        req.session.save((err) => {
          if (err) return next(err);
          return res.status(200).json(user);
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      // 确保会话被销毁
      req.session.destroy((err) => {
        if (err) return next(err);
        // 告诉客户端清除cookie，确保使用正确的cookie名称和路径
        res.clearCookie('ai_man_sid', { path: '/' });
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res, next) => {
    try {
      // 增加检查确保会话有效
      if (!req.session || !req.session.id) {
        return res.sendStatus(401);
      }
      
      // 检查认证状态
      if (!req.isAuthenticated()) {
        return res.sendStatus(401);
      }
      
      // 刷新会话，确保防止会话固定攻击
      req.session.touch();
      
      // 返回用户数据
      res.json(req.user);
    } catch (err) {
      console.error("Error checking user session:", err);
      next(err);
    }
  });
  
  app.put("/api/user/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = parseInt(req.params.id);
    
    // Check if user is updating their own profile
    if (req.user!.id !== userId) {
      return res.status(403).send("You can only update your own profile");
    }
    
    const updateData = req.body;
    
    // If user wants to change password
    if (updateData.password) {
      // Verify current password if provided
      if (updateData.currentPassword) {
        const isPasswordValid = await comparePasswords(
          updateData.currentPassword,
          req.user!.password
        );
        
        if (!isPasswordValid) {
          return res.status(400).send("Current password is incorrect");
        }
        
        // Hash the new password
        updateData.password = await hashPassword(updateData.password);
      } else {
        // Current password needed to change password
        return res.status(400).send("Current password is required to change password");
      }
    }
    
    // Remove currentPassword from update data
    delete updateData.currentPassword;
    
    try {
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      
      // Update the session
      req.login(updatedUser, (err) => {
        if (err) {
          console.error("Error updating user session:", err);
          return res.status(500).send("Error updating user session");
        }
        
        res.json(updatedUser);
      });
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).send("Error updating user");
    }
  });
}