import { 
  type Student, 
  type InsertStudent,
  type Attendance,
  type InsertAttendance,
  type Homework,
  type InsertHomework,
  type Fee,
  type InsertFee,
  type Announcement,
  type InsertAnnouncement
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Students
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByCredential(credential: string, type: 'login_id' | 'phone'): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Attendance
  getStudentAttendance(studentId: string): Promise<Attendance[]>;
  getAttendanceStats(studentId: string): Promise<{ present: number; absent: number; percentage: number }>;
  
  // Homework
  getStudentHomework(studentId: string): Promise<Homework[]>;
  updateHomeworkStatus(id: string, status: string): Promise<void>;
  
  // Fees
  getStudentFees(studentId: string): Promise<Fee[]>;
  getFeeStats(studentId: string): Promise<{ paid: number; pending: number }>;
  
  // Announcements
  getAllAnnouncements(): Promise<Announcement[]>;
}

export class MemStorage implements IStorage {
  private students: Map<string, Student>;
  private attendance: Map<string, Attendance>;
  private homework: Map<string, Homework>;
  private fees: Map<string, Fee>;
  private announcements: Map<string, Announcement>;

  constructor() {
    this.students = new Map();
    this.attendance = new Map();
    this.homework = new Map();
    this.fees = new Map();
    this.announcements = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample student
    const student: Student = {
      id: randomUUID(),
      name: "Arjun Kumar",
      full_name: "Arjun Kumar",
      class: "10",
      section: "A",
      login_id: "STU001234",
      password: "password123",
      fee_status: "partial",
      phone: "9876543210",
      phone1: "+91 9876543210",
      phone2: null,
      mobile_2: null,
      email: "arjun.kumar@email.com",
      address: "123 Main Street, Delhi",
      parent_name: "Rajesh Kumar",
      mother_name: "Priya Kumar",
      parent_relation: "Father",
      fee_paid: "45000",
      fee_pending: "15000",
      discount_amount: "0",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.students.set(student.id, student);

    // Sample attendance data
    const attendanceRecords = [
      { date: "2024-12-10", status: "present", timeIn: "8:30 AM" },
      { date: "2024-12-09", status: "holiday", timeIn: null },
      { date: "2024-12-08", status: "absent", timeIn: null },
      { date: "2024-12-07", status: "present", timeIn: "8:25 AM" },
      { date: "2024-12-06", status: "present", timeIn: "8:35 AM" },
    ];
    
    attendanceRecords.forEach(record => {
      const attendance: Attendance = {
        id: randomUUID(),
        student_id: student.login_id,
        date: record.date,
        status: record.status,
        time_in: record.timeIn,
        createdAt: new Date(),
      };
      this.attendance.set(attendance.id, attendance);
    });

    // Sample homework data
    const homeworkRecords = [
      {
        subject: "Mathematics",
        teacher: "Mr. Sharma",
        title: "Quadratic Equations - Exercise 5.1",
        description: "Complete all problems from page 89-91. Show detailed working for each solution.",
        dueDate: "2024-12-12",
        status: "pending"
      },
      {
        subject: "English Literature",
        teacher: "Ms. Priya",
        title: "Essay on Environmental Conservation",
        description: "Write a 500-word essay on environmental conservation and its importance in today's world.",
        dueDate: "2024-12-15",
        status: "completed"
      }
    ];

    homeworkRecords.forEach(record => {
      const homework: Homework = {
        id: randomUUID(),
        student_id: student.login_id,
        subject: record.subject,
        teacher: record.teacher,
        title: record.title,
        description: record.description,
        due_date: record.dueDate,
        status: record.status,
        submitted_at: record.status === "completed" ? new Date() : null,
        createdAt: new Date(),
      };
      this.homework.set(homework.id, homework);
    });

    // Sample fee data
    const feeRecords = [
      {
        feeType: "Quarterly Fee - Q3",
        amount: 15000,
        dueDate: "2024-11-30",
        status: "paid",
        academicYear: "2024-25"
      },
      {
        feeType: "Quarterly Fee - Q4",
        amount: 15000,
        dueDate: "2024-12-31",
        status: "pending",
        academicYear: "2024-25"
      }
    ];

    feeRecords.forEach(record => {
      const fee: Fee = {
        id: randomUUID(),
        student_id: student.login_id,
        fee_type: record.feeType,
        amount: record.amount.toString(),
        due_date: record.dueDate,
        status: record.status,
        paid_at: record.status === "paid" ? new Date() : null,
        academic_year: record.academicYear,
        createdAt: new Date(),
      };
      this.fees.set(fee.id, fee);
    });

    // Sample announcements
    const announcementRecords = [
      {
        title: "Sports Day Celebration",
        description: "Dear Students and Parents, we are excited to announce our Annual Sports Day on December 15, 2024. All students are required to participate in at least one event. Registration forms are available at the sports department.",
        department: "Principal's Office",
        priority: "high",
        views: 126
      },
      {
        title: "Parent-Teacher Meeting",
        description: "Parent-Teacher meeting scheduled for December 20, 2024, from 9:00 AM to 5:00 PM. Please book your time slots through the school portal or contact the office directly.",
        department: "Academic Department",
        priority: "normal",
        views: 89
      },
      {
        title: "Winter Break Schedule",
        description: "Winter break will commence from December 23, 2024, and school will reopen on January 8, 2025. Students should complete all pending assignments before the break.",
        department: "Administration",
        priority: "normal",
        views: 203
      }
    ];

    announcementRecords.forEach(record => {
      const announcement: Announcement = {
        id: randomUUID(),
        title: record.title,
        message: record.description,
        description: record.description,
        image_url: null,
        target_class: null,
        target_section: null,
        department: record.department,
        post_date: new Date().toISOString().split('T')[0],
        created_by: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.announcements.set(announcement.id, announcement);
    });
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByCredential(credential: string, type: 'login_id' | 'phone'): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => {
      if (type === 'login_id') {
        return student.login_id === credential;
      } else {
        return student.phone === credential;
      }
    });
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { 
      id,
      name: insertStudent.name || null,
      full_name: insertStudent.full_name || null,
      class: insertStudent.class,
      section: insertStudent.section || null,
      login_id: insertStudent.login_id,
      password: insertStudent.password,
      fee_status: insertStudent.fee_status || null,
      phone: insertStudent.phone || null,
      phone1: insertStudent.phone1 || null,
      phone2: insertStudent.phone2 || null,
      mobile_2: insertStudent.mobile_2 || null,
      email: insertStudent.email || null,
      address: insertStudent.address || null,
      parent_name: insertStudent.parent_name || null,
      mother_name: insertStudent.mother_name || null,
      parent_relation: insertStudent.parent_relation || null,
      fee_paid: insertStudent.fee_paid || null,
      fee_pending: insertStudent.fee_pending || null,
      discount_amount: insertStudent.discount_amount || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.students.set(id, student);
    return student;
  }

  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values())
      .filter(record => record.student_id === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getAttendanceStats(studentId: string): Promise<{ present: number; absent: number; percentage: number }> {
    const records = await this.getStudentAttendance(studentId);
    const validRecords = records.filter(r => r.status !== 'holiday');
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const percentage = validRecords.length > 0 ? Math.round((present / validRecords.length) * 100) : 0;
    
    return { present, absent, percentage };
  }

  async getStudentHomework(studentId: string): Promise<Homework[]> {
    return Array.from(this.homework.values())
      .filter(hw => hw.student_id === studentId)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }

  async updateHomeworkStatus(id: string, status: string): Promise<void> {
    const homework = this.homework.get(id);
    if (homework) {
      homework.status = status;
      if (status === 'completed') {
        homework.submitted_at = new Date();
      }
      this.homework.set(id, homework);
    }
  }

  async getStudentFees(studentId: string): Promise<Fee[]> {
    return Array.from(this.fees.values())
      .filter(fee => fee.student_id === studentId)
      .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
  }

  async getFeeStats(studentId: string): Promise<{ paid: number; pending: number }> {
    const fees = await this.getStudentFees(studentId);
    const paid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + parseFloat(f.amount), 0);
    const pending = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + parseFloat(f.amount), 0);
    
    return { paid, pending };
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values())
      .sort((a, b) => new Date(b.post_date || 0).getTime() - new Date(a.post_date || 0).getTime());
  }
}

export const storage = new MemStorage();
