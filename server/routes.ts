import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCodeAnalysisSchema, insertChatMessageSchema } from "@shared/schema";
import { analyzeCode, answerCodeQuestion } from "./services/openai";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.py')) {
      cb(null, true);
    } else {
      cb(new Error('Only Python files (.py) are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload and analyze code file
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const code = req.file.buffer.toString('utf-8');
      const filename = req.file.originalname;

      // Create analysis record
      const analysis = await storage.createCodeAnalysis({
        filename,
        code,
        language: "python"
      });

      res.json({ analysisId: analysis.id, filename, code });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Analyze code (from text input)
  app.post("/api/analyze", async (req, res) => {
    try {
      const validatedData = insertCodeAnalysisSchema.parse(req.body);
      
      // Create analysis record
      const analysis = await storage.createCodeAnalysis(validatedData);
      
      // Perform AI analysis
      const analysisResult = await analyzeCode(validatedData.code, validatedData.filename ?? undefined);
      
      // Update analysis with results
      const updatedAnalysis = await storage.updateCodeAnalysis(analysis.id, {
        explanation: analysisResult.explanation,
        issues: analysisResult.issues
      });

      res.json(updatedAnalysis);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Get analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getCodeAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Send chat message
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      
      // Get the analysis to provide context
      const analysis = await storage.getCodeAnalysis(validatedData.analysisId);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      // Get previous chat messages for context
      const previousMessages = await storage.getChatMessages(validatedData.analysisId);
      const context = previousMessages.map(m => `Q: ${m.message}\nA: ${m.response}`).join('\n\n');
      
      // Generate AI response
      const response = await answerCodeQuestion(
        analysis.code, 
        validatedData.message, 
        context
      );
      
      // Save chat message
      const chatMessage = await storage.createChatMessage({
        ...validatedData,
        response
      });

      res.json(chatMessage);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Get chat messages for an analysis
  app.get("/api/chat/:analysisId", async (req, res) => {
    try {
      const analysisId = parseInt(req.params.analysisId);
      const messages = await storage.getChatMessages(analysisId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
