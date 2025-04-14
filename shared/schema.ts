import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  address: text("address"),
  ensName: text("ens_name")
});

// Signatures table
export const signatures = pgTable("signatures", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  originalMessage: text("original_message").notNull(),
  signature: text("signature").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  valid: boolean("valid").default(true).notNull(),
  messageType: text("message_type").notNull(),
  chainId: integer("chain_id").notNull(),
  documentHash: text("document_hash"),
  documentName: text("document_name"),
  signerAddress: text("signer_address").notNull(),
  signerEns: text("signer_ens")
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  theme: text("theme").default("system").notNull(),
  autoConnect: boolean("auto_connect").default(true).notNull(),
  preferredNetwork: text("preferred_network").default("1").notNull(),
  showTestnets: boolean("show_testnets").default(false).notNull(),
  defaultMessageType: text("default_message_type").default("text").notNull(),
  signatureExpiration: integer("signature_expiration").default(30).notNull(),
  displayEns: boolean("display_ens").default(true).notNull(),
  backupFrequency: text("backup_frequency").default("manual").notNull()
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  signatures: many(signatures),
  settings: many(settings)
}));

// Signature relations
export const signaturesRelations = relations(signatures, ({ one }) => ({
  user: one(users, {
    fields: [signatures.userId],
    references: [users.id]
  })
}));

// Settings relations
export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, {
    fields: [settings.userId],
    references: [users.id]
  })
}));

// Schemas for inserts
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  address: true,
  ensName: true
});

export const insertSignatureSchema = createInsertSchema(signatures).omit({
  id: true
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSignature = z.infer<typeof insertSignatureSchema>;
export type Signature = typeof signatures.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
