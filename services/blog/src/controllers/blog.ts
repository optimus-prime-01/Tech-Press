import { Request, Response } from "express";
import { sql } from "../utils/db.js";
import { redisClient } from "../server.js";
import TryCatch from "../utils/TryCatch.js";

// Helper function to safely use Redis
const safeRedisGet = async (key: string) => {
  try {
    if (redisClient.isReady) {
      return await redisClient.get(key);
    }
  } catch (error) {
    console.log("⚠️ Redis get failed:", error);
  }
  return null;
};

const safeRedisSet = async (key: string, value: string, options?: any) => {
  try {
    if (redisClient.isReady) {
      return await redisClient.set(key, value, options);
    }
  } catch (error) {
    console.log("⚠️ Redis set failed:", error);
  }
  return null;
};

const safeRedisDel = async (pattern: string) => {
  try {
    if (redisClient.isReady) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        return await redisClient.del(keys);
      }
    }
  } catch (error) {
    console.log("⚠️ Redis del failed:", error);
  }
  return 0;
};

export const getAllBlogs = TryCatch(async (req: Request, res: Response) => {
  const { search = "", category = "" } = req.query;
  
  const cacheKey = `blogs:${search}:${category}`;
  
  // Try to get from cache first
  const cachedBlogs = await safeRedisGet(cacheKey);
  if (cachedBlogs) {
    console.log("📦 Serving from cache");
    return res.json(JSON.parse(cachedBlogs));
  }
  
  // Get from database with author info
  const blogs = await sql`
    SELECT b.*, u.name as author_name, u.image as author_image
    FROM blogs b
    LEFT JOIN users u ON b.author = u.id
    ORDER BY b.create_at DESC
  `;
  
  // Cache the result
  await safeRedisSet(cacheKey, JSON.stringify(blogs), { EX: 3600 });
  
  res.json(blogs);
});

export const getSingleBlog = TryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const cacheKey = `blog:${id}`;
  
  // Try to get from cache first
  const cachedBlog = await safeRedisGet(cacheKey);
  if (cachedBlog) {
    console.log("📦 Serving blog from cache");
    return res.json(JSON.parse(cachedBlog));
  }
  
  // Get from database with author info
  const blogs = await sql`
    SELECT b.*, u.name as author_name, u.image as author_image
    FROM blogs b
    LEFT JOIN users u ON b.author = u.id
    WHERE b.id = ${id}
  `;
  
  if (blogs.length === 0) {
    return res.status(404).json({ message: "Blog not found" });
  }
  
  // Cache the result
  await safeRedisSet(cacheKey, JSON.stringify(blogs[0]), { EX: 3600 });
  
  res.json(blogs[0]);
});

export const addComment = TryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { comment, parentId } = req.body;
  const user = (req as any).user;
  
  if (!comment) {
    return res.status(400).json({ message: "Comment is required" });
  }
  
  const newComment = await sql`
    INSERT INTO comments (comment, userid, username, blogid, parentid)
    VALUES (${comment}, ${user._id}, ${user.name}, ${id}, ${parentId || null})
    RETURNING *
  `;
  
  // Invalidate cache
  await safeRedisDel(`blog:${id}`);
  await safeRedisDel(`comments:${id}`);
  
  res.status(201).json(newComment[0]);
});

export const getAllComments = TryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const cacheKey = `comments:${id}`;
  
  // Try to get from cache first
  const cachedComments = await safeRedisGet(cacheKey);
  if (cachedComments) {
    console.log("📦 Serving comments from cache");
    return res.json(JSON.parse(cachedComments));
  }
  
  // Get from database
  const comments = await sql`SELECT * FROM comments WHERE blogid = ${id} ORDER BY create_at DESC`;
  
  // Cache the result
  await safeRedisSet(cacheKey, JSON.stringify(comments), { EX: 1800 });
  
  res.json(comments);
});

export const deleteComment = TryCatch(async (req: Request, res: Response) => {
  const { commentid } = req.params;
  const user = (req as any).user;
  
  const comment = await sql`SELECT * FROM comments WHERE id = ${commentid}`;
  
  if (comment.length === 0) {
    return res.status(404).json({ message: "Comment not found" });
  }
  
  if (comment[0].userid !== user._id) {
    return res.status(403).json({ message: "Not authorized" });
  }
  
  await sql`DELETE FROM comments WHERE id = ${commentid}`;
  
  // Invalidate cache
  await safeRedisDel(`comments:${comment[0].blogid}`);
  
  res.json({ message: "Comment deleted" });
});

export const saveBlog = TryCatch(async (req: Request, res: Response) => {
  const { blogid } = req.params;
  const user = (req as any).user;
  
  const existingSave = await sql`SELECT * FROM savedblogs WHERE userid = ${user._id} AND blogid = ${blogid}`;
  
  if (existingSave.length > 0) {
    return res.status(400).json({ message: "Blog already saved" });
  }
  
  await sql`INSERT INTO savedblogs (userid, blogid) VALUES (${user._id}, ${blogid})`;
  
  res.status(201).json({ message: "Blog saved" });
});

export const getSavedBlog = TryCatch(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  const savedBlogs = await sql`
    SELECT b.* FROM blogs b
    INNER JOIN savedblogs sb ON b.id::text = sb.blogid
    WHERE sb.userid = ${user._id}
    ORDER BY sb.create_at DESC
  `;
  
  res.json(savedBlogs);
});