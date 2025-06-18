import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const codeAnalyses = pgTable("code_analyses", {
  id: serial("id").primaryKey(),
  filename: text("filename"),
  code: text("code").notNull(),
  language: text("language").notNull().default("python"),
  explanation: jsonb("explanation"),
  issues: jsonb("issues"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id").references(() => codeAnalyses.id).notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCodeAnalysisSchema = createInsertSchema(codeAnalyses).pick({
  filename: true,
  code: true,
  language: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  analysisId: true,
  message: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCodeAnalysis = z.infer<typeof insertCodeAnalysisSchema>;
export type CodeAnalysis = typeof codeAnalyses.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
