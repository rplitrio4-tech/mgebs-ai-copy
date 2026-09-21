import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const workspaceStates = mysqlTable("workspace_states", {
  id: int("id").autoincrement().primaryKey(),
  visitorId: varchar("visitorId", { length: 128 }).notNull().unique(),
  messagesJson: text("messagesJson").notNull(),
  memoryJson: text("memoryJson").notNull(),
  skillsJson: text("skillsJson").notNull(),
  secretsJson: text("secretsJson").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const marketplaceSkills = mysqlTable("marketplace_skills", {
  id: int("id").autoincrement().primaryKey(),
  visitorId: varchar("visitorId", { length: 128 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  visibility: mysqlEnum("visibility", ["private", "public"]).default("private").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewerNote: text("reviewerNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type WorkspaceState = typeof workspaceStates.$inferSelect;
export type MarketplaceSkill = typeof marketplaceSkills.$inferSelect;
