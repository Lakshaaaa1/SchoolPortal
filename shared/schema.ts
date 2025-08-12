import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, decimal, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Students table matching Supabase schema
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  full_name: text("full_name"),
  class: text("class").notNull(),
  section: text("section"),
  login_id: text("login_id").notNull().unique(),
  password: text("password").notNull(),
  fee_status: text("fee_status").default("pending"),
  phone: text("phone"),
  phone1: text("phone1"),
  phone2: text("phone2"),
  mobile_2: text("mobile_2"),
  email: text("email"),
  address: text("address"),
  parent_name: text("parent_name"),
  mother_name: text("mother_name"),
  parent_relation: text("parent_relation"),
  fee_paid: decimal("fee_paid").default("0"),
  fee_pending: decimal("fee_pending").default("0"),
  discount_amount: decimal("discount_amount").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Homework assignments table
export const homework_assignments = pgTable("homework_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  due_date: date("due_date"),
  attachment_url: text("attachment_url"),
  class_name: text("class_name").notNull(),
  created_by: text("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exam marks table
export const exam_marks = pgTable("exam_marks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  class_name: text("class_name").notNull(),
  student_name: text("student_name").notNull(),
  student_id: varchar("student_id"),
  exam_type: text("exam_type").notNull(),
  exam_name: text("exam_name"),
  subject: text("subject"),
  out_of: integer("out_of").notNull(),
  marks_obtained: integer("marks_obtained").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fee structures table
export const fee_structures = pgTable("fee_structures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  class: text("class").notNull(),
  fee_type: text("fee_type").notNull(),
  amount: decimal("amount").notNull(),
  description: text("description"),
  installments: integer("installments").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fee payments table
export const fee_payments = pgTable("fee_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  student_id: varchar("student_id").notNull(),
  amount_paid: decimal("amount_paid").notNull(),
  payment_date: date("payment_date").default(sql`CURRENT_DATE`),
  installment_no: integer("installment_no").default(1),
  amount_pending: decimal("amount_pending").default("0"),
  payment_mode: text("payment_mode").notNull(),
  term: varchar("term").default("Term 1"),
  term_no: integer("term_no").default(1),
  discount_amount: decimal("discount_amount").default("0"),
  submitted_by: text("submitted_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title"),
  message: text("message"),
  description: text("description"),
  image_url: text("image_url"),
  target_class: text("target_class"),
  target_section: text("target_section"),
  department: text("department"),
  post_date: date("post_date").default(sql`CURRENT_DATE`),
  created_by: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Timetables table
export const timetables = pgTable("timetables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  class: text("class").notNull(),
  section: text("section"),
  day: text("day").notNull(),
  subject: text("subject").notNull(),
  period: integer("period"),
  period_no: integer("period_no"),
  teacher_id: varchar("teacher_id"),
  start_time: time("start_time"),
  end_time: time("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teachers table
export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  assigned_class: text("assigned_class"),
  assigned_classes: text("assigned_classes").array(),
  login_id: text("login_id").notNull().unique(),
  password: text("password").notNull(),
  subject: text("subject"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  role: text("role"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leaves table
export const leaves = pgTable("leaves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  student_id: varchar("student_id").notNull(),
  date: date("date").notNull(),
  reason: text("reason"),
  status: text("status").default("pending"),
  approved_by: varchar("approved_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student tokens table for push notifications
export const student_tokens = pgTable("student_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  student_id: varchar("student_id").notNull(),
  class: text("class").notNull(),
  section: text("section"),
  fcm_token: text("fcm_token").notNull(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHomeworkSchema = createInsertSchema(homework_assignments).omit({
  id: true,
  createdAt: true,
});

export const insertExamMarksSchema = createInsertSchema(exam_marks).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeePaymentSchema = createInsertSchema(fee_payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimetableSchema = createInsertSchema(timetables).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeaveSchema = createInsertSchema(leaves).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentTokenSchema = createInsertSchema(student_tokens).omit({
  id: true,
  updated_at: true,
});

// Additional tables for legacy compatibility
export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  student_id: varchar("student_id").notNull(),
  date: date("date").notNull(),
  status: text("status").notNull(), // 'present', 'absent', 'holiday'
  time_in: text("time_in"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const homework = pgTable("homework", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  student_id: varchar("student_id").notNull(),
  subject: text("subject").notNull(),
  teacher: text("teacher").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  due_date: date("due_date").notNull(),
  status: text("status").default("pending"), // 'pending', 'completed', 'overdue'
  submitted_at: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fees = pgTable("fees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  student_id: varchar("student_id").notNull(),
  fee_type: text("fee_type").notNull(),
  amount: decimal("amount").notNull(),
  due_date: date("due_date").notNull(),
  status: text("status").default("pending"), // 'pending', 'paid', 'overdue'
  paid_at: timestamp("paid_at"),
  academic_year: text("academic_year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for additional tables
export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertHomeworkSchemaLegacy = createInsertSchema(homework).omit({
  id: true,
  createdAt: true,
});

export const insertFeeSchema = createInsertSchema(fees).omit({
  id: true,
  createdAt: true,
});

// Login schema - supports both login_id and phone
export const loginSchema = z.object({
  credential: z.string().min(1, "Login ID or phone is required"),
  password: z.string().min(1, "Password is required"),
  loginType: z.enum(["login_id", "phone"]),
});

// Type exports
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type HomeworkAssignment = typeof homework_assignments.$inferSelect;
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
export type ExamMarks = typeof exam_marks.$inferSelect;
export type InsertExamMarks = z.infer<typeof insertExamMarksSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type FeeStructure = typeof fee_structures.$inferSelect;
export type FeePayment = typeof fee_payments.$inferSelect;
export type InsertFeePayment = z.infer<typeof insertFeePaymentSchema>;
export type Timetable = typeof timetables.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Teacher = typeof teachers.$inferSelect;
export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
export type StudentToken = typeof student_tokens.$inferSelect;
export type InsertStudentToken = z.infer<typeof insertStudentTokenSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Legacy compatibility types
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Homework = typeof homework.$inferSelect;
export type InsertHomeworkLegacy = z.infer<typeof insertHomeworkSchemaLegacy>;
export type Fee = typeof fees.$inferSelect;
export type InsertFee = z.infer<typeof insertFeeSchema>;
