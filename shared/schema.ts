import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: text("student_id").notNull().unique(),
  name: text("name").notNull(),
  class: text("class").notNull(),
  section: text("section").notNull(),
  rollNumber: integer("roll_number").notNull(),
  mobileNumber: text("mobile_number"),
  password: text("password").notNull(),
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  guardianPhone: text("guardian_phone"),
  guardianEmail: text("guardian_email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: text("student_id").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull(), // present, absent, holiday
  timeIn: text("time_in"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const homework = pgTable("homework", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: text("student_id").notNull(),
  subject: text("subject").notNull(),
  teacher: text("teacher").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: text("due_date").notNull(),
  status: text("status").notNull(), // pending, completed
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fees = pgTable("fees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: text("student_id").notNull(),
  feeType: text("fee_type").notNull(),
  amount: integer("amount").notNull(),
  dueDate: text("due_date").notNull(),
  status: text("status").notNull(), // paid, pending
  paidAt: timestamp("paid_at"),
  academicYear: text("academic_year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  department: text("department").notNull(),
  postedAt: timestamp("posted_at").defaultNow(),
  views: integer("views").default(0),
  priority: text("priority").default("normal"), // high, normal, low
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertHomeworkSchema = createInsertSchema(homework).omit({
  id: true,
  createdAt: true,
  submittedAt: true,
});

export const insertFeeSchema = createInsertSchema(fees).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  postedAt: true,
});

export const loginSchema = z.object({
  credential: z.string().min(1, "Credential is required"),
  password: z.string().min(1, "Password is required"),
  loginType: z.enum(["studentId", "mobile"]),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Homework = typeof homework.$inferSelect;
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
export type Fee = typeof fees.$inferSelect;
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
