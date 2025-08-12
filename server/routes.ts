import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { credential, password, loginType } = loginSchema.parse(req.body);
      
      const student = await storage.getStudentByCredential(credential, loginType);
      
      if (!student || student.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd create a proper session/JWT here
      res.json({ 
        student: {
          id: student.id,
          login_id: student.login_id,
          name: student.name,
          class: student.class,
          section: student.section,
          phone: student.phone,
          parent_name: student.parent_name,
          mother_name: student.mother_name,
          email: student.email,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Student data
  app.get("/api/student/:studentId", async (req, res) => {
    try {
      const student = await storage.getStudentByCredential(req.params.studentId, 'login_id');
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json({
        id: student.id,
        login_id: student.login_id,
        name: student.name,
        class: student.class,
        section: student.section,
        phone: student.phone,
        parent_name: student.parent_name,
        mother_name: student.mother_name,
        email: student.email,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Attendance
  app.get("/api/attendance/:studentId", async (req, res) => {
    try {
      const attendance = await storage.getStudentAttendance(req.params.studentId);
      const stats = await storage.getAttendanceStats(req.params.studentId);
      
      res.json({ attendance, stats });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Homework
  app.get("/api/homework/:studentId", async (req, res) => {
    try {
      const homework = await storage.getStudentHomework(req.params.studentId);
      res.json(homework);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/homework/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      await storage.updateHomeworkStatus(req.params.id, status);
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Fees
  app.get("/api/fees/:studentId", async (req, res) => {
    try {
      const fees = await storage.getStudentFees(req.params.studentId);
      const stats = await storage.getFeeStats(req.params.studentId);
      
      res.json({ fees, stats });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Announcements
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
