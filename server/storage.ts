import {
  users,
  diaryEntries,
  stories,
  mistakes,
  achievements,
  studySessions,
  people,
  calendarEvents,
  aiAssessments,
  chatMessages,
  type User,
  type InsertUser,
  type DiaryEntry,
  type InsertDiaryEntry,
  type Story,
  type InsertStory,
  type Mistake,
  type InsertMistake,
  type Achievement,
  type InsertAchievement,
  type StudySession,
  type InsertStudySession,
  type Person,
  type InsertPerson,
  type CalendarEvent,
  type InsertCalendarEvent,
  type AiAssessment,
  type InsertAiAssessment,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Diary operations
  getDiaryEntries(userId: string): Promise<DiaryEntry[]>;
  createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry>;
  updateDiaryEntry(id: string, entry: Partial<InsertDiaryEntry>): Promise<DiaryEntry>;
  deleteDiaryEntry(id: string): Promise<void>;

  // Story operations
  getStories(userId: string): Promise<Story[]>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: string, story: Partial<InsertStory>): Promise<Story>;
  deleteStory(id: string): Promise<void>;

  // Mistake operations
  getMistakes(userId: string): Promise<Mistake[]>;
  createMistake(mistake: InsertMistake): Promise<Mistake>;
  updateMistake(id: string, mistake: Partial<InsertMistake>): Promise<Mistake>;
  deleteMistake(id: string): Promise<void>;

  // Achievement operations
  getAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: string, achievement: Partial<InsertAchievement>): Promise<Achievement>;
  deleteAchievement(id: string): Promise<void>;

  // Study session operations
  getStudySessions(userId: string): Promise<StudySession[]>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: string, session: Partial<InsertStudySession>): Promise<StudySession>;
  deleteStudySession(id: string): Promise<void>;
  getStudySessionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<StudySession[]>;

  // People operations
  getPeople(userId: string): Promise<Person[]>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: string, person: Partial<InsertPerson>): Promise<Person>;
  deletePerson(id: string): Promise<void>;

  // Calendar operations
  getCalendarEvents(userId: string): Promise<CalendarEvent[]>;
  getCalendarEventsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: string): Promise<void>;

  // AI Assessment operations
  getAiAssessments(userId: string): Promise<AiAssessment[]>;
  createAiAssessment(assessment: InsertAiAssessment): Promise<AiAssessment>;
  getLatestAiAssessment(userId: string): Promise<AiAssessment | undefined>;

  // Chat message operations
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Diary operations
  async getDiaryEntries(userId: string): Promise<DiaryEntry[]> {
    return await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.date));
  }

  async createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry> {
    const [diaryEntry] = await db.insert(diaryEntries).values(entry).returning();
    return diaryEntry;
  }

  async updateDiaryEntry(id: string, entry: Partial<InsertDiaryEntry>): Promise<DiaryEntry> {
    const [diaryEntry] = await db
      .update(diaryEntries)
      .set(entry)
      .where(eq(diaryEntries.id, id))
      .returning();
    return diaryEntry;
  }

  async deleteDiaryEntry(id: string): Promise<void> {
    await db.delete(diaryEntries).where(eq(diaryEntries.id, id));
  }

  // Story operations
  async getStories(userId: string): Promise<Story[]> {
    return await db
      .select()
      .from(stories)
      .where(eq(stories.userId, userId))
      .orderBy(desc(stories.updatedAt));
  }

  async createStory(story: InsertStory): Promise<Story> {
    const [newStory] = await db.insert(stories).values(story).returning();
    return newStory;
  }

  async updateStory(id: string, story: Partial<InsertStory>): Promise<Story> {
    const [updatedStory] = await db
      .update(stories)
      .set({ ...story, updatedAt: new Date() })
      .where(eq(stories.id, id))
      .returning();
    return updatedStory;
  }

  async deleteStory(id: string): Promise<void> {
    await db.delete(stories).where(eq(stories.id, id));
  }

  // Mistake operations
  async getMistakes(userId: string): Promise<Mistake[]> {
    return await db
      .select()
      .from(mistakes)
      .where(eq(mistakes.userId, userId))
      .orderBy(desc(mistakes.date));
  }

  async createMistake(mistake: InsertMistake): Promise<Mistake> {
    const [newMistake] = await db.insert(mistakes).values(mistake).returning();
    return newMistake;
  }

  async updateMistake(id: string, mistake: Partial<InsertMistake>): Promise<Mistake> {
    const [updatedMistake] = await db
      .update(mistakes)
      .set(mistake)
      .where(eq(mistakes.id, id))
      .returning();
    return updatedMistake;
  }

  async deleteMistake(id: string): Promise<void> {
    await db.delete(mistakes).where(eq(mistakes.id, id));
  }

  // Achievement operations
  async getAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.date));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }

  async updateAchievement(id: string, achievement: Partial<InsertAchievement>): Promise<Achievement> {
    const [updatedAchievement] = await db
      .update(achievements)
      .set(achievement)
      .where(eq(achievements.id, id))
      .returning();
    return updatedAchievement;
  }

  async deleteAchievement(id: string): Promise<void> {
    await db.delete(achievements).where(eq(achievements.id, id));
  }

  // Study session operations
  async getStudySessions(userId: string): Promise<StudySession[]> {
    return await db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.date));
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const [newSession] = await db.insert(studySessions).values(session).returning();
    return newSession;
  }

  async updateStudySession(id: string, session: Partial<InsertStudySession>): Promise<StudySession> {
    const [updatedSession] = await db
      .update(studySessions)
      .set(session)
      .where(eq(studySessions.id, id))
      .returning();
    return updatedSession;
  }

  async deleteStudySession(id: string): Promise<void> {
    await db.delete(studySessions).where(eq(studySessions.id, id));
  }

  async getStudySessionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<StudySession[]> {
    return await db
      .select()
      .from(studySessions)
      .where(
        and(
          eq(studySessions.userId, userId),
          gte(studySessions.date, startDate),
          lte(studySessions.date, endDate)
        )
      )
      .orderBy(desc(studySessions.date));
  }

  // People operations
  async getPeople(userId: string): Promise<Person[]> {
    return await db
      .select()
      .from(people)
      .where(eq(people.userId, userId))
      .orderBy(desc(people.updatedAt));
  }

  async createPerson(person: InsertPerson): Promise<Person> {
    const [newPerson] = await db.insert(people).values(person).returning();
    return newPerson;
  }

  async updatePerson(id: string, person: Partial<InsertPerson>): Promise<Person> {
    const [updatedPerson] = await db
      .update(people)
      .set({ ...person, updatedAt: new Date() })
      .where(eq(people.id, id))
      .returning();
    return updatedPerson;
  }

  async deletePerson(id: string): Promise<void> {
    await db.delete(people).where(eq(people.id, id));
  }

  // Calendar operations
  async getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, userId))
      .orderBy(calendarEvents.startTime);
  }

  async getCalendarEventsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.userId, userId),
          gte(calendarEvents.startTime, startDate),
          lte(calendarEvents.endTime, endDate)
        )
      )
      .orderBy(calendarEvents.startTime);
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db.insert(calendarEvents).values(event).returning();
    return newEvent;
  }

  async updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [updatedEvent] = await db
      .update(calendarEvents)
      .set(event)
      .where(eq(calendarEvents.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // AI Assessment operations
  async getAiAssessments(userId: string): Promise<AiAssessment[]> {
    return await db
      .select()
      .from(aiAssessments)
      .where(eq(aiAssessments.userId, userId))
      .orderBy(desc(aiAssessments.createdAt));
  }

  async createAiAssessment(assessment: InsertAiAssessment): Promise<AiAssessment> {
    const [newAssessment] = await db.insert(aiAssessments).values(assessment).returning();
    return newAssessment;
  }

  async getLatestAiAssessment(userId: string): Promise<AiAssessment | undefined> {
    const [assessment] = await db
      .select()
      .from(aiAssessments)
      .where(eq(aiAssessments.userId, userId))
      .orderBy(desc(aiAssessments.createdAt))
      .limit(1);
    return assessment || undefined;
  }

  // Chat message operations
  async getChatMessages(limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
