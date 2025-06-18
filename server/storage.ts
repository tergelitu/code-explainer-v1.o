import { users, codeAnalyses, chatMessages, type User, type InsertUser, type CodeAnalysis, type InsertCodeAnalysis, type ChatMessage, type InsertChatMessage } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createCodeAnalysis(analysis: InsertCodeAnalysis): Promise<CodeAnalysis>;
  getCodeAnalysis(id: number): Promise<CodeAnalysis | undefined>;
  updateCodeAnalysis(id: number, updates: Partial<CodeAnalysis>): Promise<CodeAnalysis | undefined>;
  
  createChatMessage(message: InsertChatMessage & { response: string }): Promise<ChatMessage>;
  getChatMessages(analysisId: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private codeAnalyses: Map<number, CodeAnalysis>;
  private chatMessages: Map<number, ChatMessage>;
  private currentUserId: number;
  private currentAnalysisId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.codeAnalyses = new Map();
    this.chatMessages = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
    this.currentMessageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCodeAnalysis(insertAnalysis: InsertCodeAnalysis): Promise<CodeAnalysis> {
    const id = this.currentAnalysisId++;
    const analysis: CodeAnalysis = {
      ...insertAnalysis,
      id,
      explanation: null,
      issues: null,
      createdAt: new Date(),
    };
    this.codeAnalyses.set(id, analysis);
    return analysis;
  }

  async getCodeAnalysis(id: number): Promise<CodeAnalysis | undefined> {
    return this.codeAnalyses.get(id);
  }

  async updateCodeAnalysis(id: number, updates: Partial<CodeAnalysis>): Promise<CodeAnalysis | undefined> {
    const analysis = this.codeAnalyses.get(id);
    if (!analysis) return undefined;
    
    const updated = { ...analysis, ...updates };
    this.codeAnalyses.set(id, updated);
    return updated;
  }

  async createChatMessage(messageData: InsertChatMessage & { response: string }): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = {
      ...messageData,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(analysisId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (message) => message.analysisId === analysisId
    );
  }
}

export const storage = new MemStorage();
