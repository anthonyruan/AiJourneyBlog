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
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ai-man-blog-secret-key",
    resave: true, // 确保每次请求都保存会话，即使没有修改
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000, // 清除过期会话的周期，设为24小时
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 在生产环境中使用secure
      sameSite: "lax", // 解决Safari和Chrome的SameSite策略差异
      maxAge: 7 * 24 * 60 * 60 * 1000 // 延长到7天
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

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
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