import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, hashPassword, comparePassword, generateToken, AuthenticatedRequest } from "./middleware/auth";
import { generateAssessment } from "./services/openrouter";
import {
  insertUserSchema,
  insertDiaryEntrySchema,
  insertStorySchema,
  insertMistakeSchema,
  insertAchievementSchema,
  insertStudySessionSchema,
  insertPersonSchema,
  insertCalendarEventSchema,
  insertAiAssessmentSchema,
} from "@shared/schema";
import { z } from "zod";

const signUpSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const data = signUpSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const data = signInSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await comparePassword(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Diary routes
  app.get('/api/diary', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const entries = await storage.getDiaryEntries(req.user!.id);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/diary', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertDiaryEntrySchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const entry = await storage.createDiaryEntry(data);
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/diary/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertDiaryEntrySchema.partial().parse(req.body);
      const entry = await storage.updateDiaryEntry(req.params.id, data);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/diary/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deleteDiaryEntry(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Story routes
  app.get('/api/stories', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const stories = await storage.getStories(req.user!.id);
      res.json(stories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/stories', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertStorySchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const story = await storage.createStory(data);
      res.status(201).json(story);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/stories/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertStorySchema.partial().parse(req.body);
      const story = await storage.updateStory(req.params.id, data);
      res.json(story);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/stories/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deleteStory(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Mistakes routes
  app.get('/api/mistakes', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const mistakes = await storage.getMistakes(req.user!.id);
      res.json(mistakes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/mistakes', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertMistakeSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const mistake = await storage.createMistake(data);
      res.status(201).json(mistake);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/mistakes/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertMistakeSchema.partial().parse(req.body);
      const mistake = await storage.updateMistake(req.params.id, data);
      res.json(mistake);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/mistakes/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deleteMistake(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Achievement routes
  app.get('/api/achievements', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const achievements = await storage.getAchievements(req.user!.id);
      res.json(achievements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/achievements', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertAchievementSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const achievement = await storage.createAchievement(data);
      res.status(201).json(achievement);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/achievements/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertAchievementSchema.partial().parse(req.body);
      const achievement = await storage.updateAchievement(req.params.id, data);
      res.json(achievement);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/achievements/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deleteAchievement(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Study session routes
  app.get('/api/study-sessions', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const sessions = await storage.getStudySessions(req.user!.id);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/study-sessions', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertStudySessionSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const session = await storage.createStudySession(data);
      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/study-sessions/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertStudySessionSchema.partial().parse(req.body);
      const session = await storage.updateStudySession(req.params.id, data);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/study-sessions/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deleteStudySession(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // People routes
  app.get('/api/people', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const people = await storage.getPeople(req.user!.id);
      res.json(people);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/people', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertPersonSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const person = await storage.createPerson(data);
      res.status(201).json(person);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/people/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertPersonSchema.partial().parse(req.body);
      const person = await storage.updatePerson(req.params.id, data);
      res.json(person);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/people/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deletePerson(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Calendar routes
  app.get('/api/calendar', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const events = await storage.getCalendarEvents(req.user!.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/calendar', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertCalendarEventSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const event = await storage.createCalendarEvent(data);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/calendar/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertCalendarEventSchema.partial().parse(req.body);
      const event = await storage.updateCalendarEvent(req.params.id, data);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/calendar/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deleteCalendarEvent(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Assessment routes
  app.get('/api/ai-assessments', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const assessments = await storage.getAiAssessments(req.user!.id);
      res.json(assessments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/ai-assessments', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { responses } = req.body;
      
      if (!responses || typeof responses !== 'object') {
        return res.status(400).json({ message: 'Responses are required' });
      }

      // Generate assessment using OpenRouter
      const assessment = await generateAssessment(responses);
      
      const data = insertAiAssessmentSchema.parse({
        userId: req.user!.id,
        responses,
        growthScore: assessment.growthScore,
        recommendations: assessment.recommendations,
      });
      
      const savedAssessment = await storage.createAiAssessment(data);
      res.status(201).json(savedAssessment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/ai-assessments/latest', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const assessment = await storage.getLatestAiAssessment(req.user!.id);
      res.json(assessment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
