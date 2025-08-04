import { useState } from "react";
import { 
  Calendar,
  CreditCard,
  BookOpen,
  Megaphone,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Users,
  FileText,
  CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import type { HomeworkAssignment, Announcement, ExamMarks, FeePayment, FeeStructure, Timetable, Teacher, Leave } from "@shared/schema";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { student } = useAuth();

  // Fetch homework data from Supabase
  const { data: homeworkData } = useQuery<HomeworkAssignment[]>({
    queryKey: ["homework", student?.class],
    queryFn: async () => {
      if (!student?.class) return [];
      const { data, error } = await supabase
        .from('homework_assignments')
        .select('*')
        .eq('class_name', student.class)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!student?.class,
  });

  // Fetch announcements from Supabase
  const { data: announcements } = useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch fee data from Supabase
  const { data: feeData } = useQuery({
    queryKey: ["fees", student?.id],
    queryFn: async () => {
      if (!student?.id) return { structures: [], payments: [] };
      
      const [structuresResult, paymentsResult] = await Promise.all([
        supabase
          .from('fee_structures')
          .select('*')
          .eq('class', student.class),
        supabase
          .from('fee_payments')
          .select('*')
          .eq('student_id', student.id)
      ]);

      if (structuresResult.error) throw structuresResult.error;
      if (paymentsResult.error) throw paymentsResult.error;

      return {
        structures: structuresResult.data || [],
        payments: paymentsResult.data || []
      };
    },
    enabled: !!student?.id && !!student?.class,
  });

  // Fetch exam results from Supabase
  const { data: examResults } = useQuery<ExamMarks[]>({
    queryKey: ["exam_marks", student?.name],
    queryFn: async () => {
      if (!student?.name) return [];
      const { data, error } = await supabase
        .from('exam_marks')
        .select('*')
        .eq('student_name', student.name)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: !!student?.name,
  });

  // Calculate fee stats
  const feeStats = feeData ? {
    totalDue: (feeData.structures || []).reduce((sum, s) => sum + parseFloat(s.amount?.toString() || '0'), 0),
    totalPaid: (feeData.payments || []).reduce((sum, p) => sum + parseFloat(p.amount_paid?.toString() || '0'), 0),
    pending: (feeData.structures || []).reduce((sum, s) => sum + parseFloat(s.amount?.toString() || '0'), 0) - 
             (feeData.payments || []).reduce((sum, p) => sum + parseFloat(p.amount_paid?.toString() || '0'), 0)
  } : { totalDue: 0, totalPaid: 0, pending: 0 };

  const todayHomework = homeworkData?.slice(0, 2) || [];
  const recentAnnouncements = announcements?.slice(0, 3) || [];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Done</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Due</Badge>;
      case "paid":
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderDashboard = () => (
    <div className="p-4 space-y-4 slide-up pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 mb-4">
        <h2 className="text-xl font-bold">Welcome back, {student?.full_name || student?.name}!</h2>
        <p className="text-blue-100">Class {student?.class}{student?.section ? `-${student?.section}` : ""}</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Fee Status</p>
                <p className="text-lg font-semibold">
                  {feeStats.pending > 0 ? `₹${feeStats.pending.toLocaleString()} Due` : "Paid Up"}
                </p>
              </div>
              <CreditCard className="text-green-200 h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Exams</p>
                <p className="text-lg font-semibold">
                  {examResults?.length || 0} Results
                </p>
              </div>
              <GraduationCap className="text-purple-200 h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Homework */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <BookOpen className="text-primary mr-2 h-5 w-5" />
            Recent Homework
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {todayHomework.length > 0 ? (
            todayHomework.map((hw) => (
              <div key={hw.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{hw.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{hw.description}</p>
                  {hw.due_date && (
                    <p className="text-xs text-orange-600 mt-1">
                      Due: {new Date(hw.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge variant="secondary">View</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No recent homework assignments</p>
          )}
        </CardContent>
      </Card>

      {/* Latest Exam Results */}
      {examResults && examResults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <GraduationCap className="text-primary mr-2 h-5 w-5" />
              Latest Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {examResults.slice(0, 3).map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{result.exam_name || result.exam_type}</p>
                  <p className="text-xs text-gray-600">{result.subject}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {result.marks_obtained}/{result.out_of}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round((result.marks_obtained / result.out_of) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Announcements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Megaphone className="text-secondary mr-2 h-5 w-5" />
            School Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAnnouncements.length > 0 ? (
            recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="border-l-4 border-primary pl-3">
                <p className="font-medium text-sm">{announcement.title || announcement.message}</p>
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {announcement.description || announcement.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {announcement.department} • {formatTimeAgo(new Date(announcement.created_at))}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No recent announcements</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Fetch timetable data from Supabase
  const { data: timetableData } = useQuery<Timetable[]>({
    queryKey: ["timetable", student?.class, student?.section],
    queryFn: async () => {
      if (!student?.class) return [];
      let query = supabase
        .from('timetables')
        .select('*')
        .eq('class', student.class);
      
      if (student.section) {
        query = query.eq('section', student.section);
      }
      
      const { data, error } = await query.order('day').order('period_no');
      if (error) throw error;
      return data || [];
    },
    enabled: !!student?.class,
  });

  // Fetch teachers data from Supabase
  const { data: teachersData } = useQuery<Teacher[]>({
    queryKey: ["teachers", student?.class],
    queryFn: async () => {
      if (!student?.class) return [];
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .contains('assigned_classes', [student.class]);
      if (error) throw error;
      return data || [];
    },
    enabled: !!student?.class,
  });

  // Fetch leave requests data from Supabase
  const { data: leaveData } = useQuery<Leave[]>({
    queryKey: ["leaves", student?.id],
    queryFn: async () => {
      if (!student?.id) return [];
      const { data, error } = await supabase
        .from('leaves')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!student?.id,
  });

  const renderAttendance = () => (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Attendance</h2>
        <p className="text-gray-600">Monthly attendance records</p>
      </div>
      
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-gray-600 mb-2">Attendance tracking coming soon</p>
          <p className="text-sm text-gray-500">
            Your school will integrate attendance data with Google Sheets
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderHomework = () => (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Homework & Assignments</h2>
        <p className="text-gray-600">Your class assignments and tasks</p>
      </div>

      <div className="space-y-4">
        {homeworkData && homeworkData.length > 0 ? (
          homeworkData.map((hw) => (
            <Card key={hw.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <BookOpen className="text-blue-600 h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{hw.subject}</p>
                        <p className="text-xs text-gray-600">Class {hw.class_name}</p>
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-800 mb-2">{hw.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{hw.description}</p>
                    {hw.due_date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>Due: {new Date(hw.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary">View</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-gray-600 mb-2">No homework assignments</p>
              <p className="text-sm text-gray-500">
                New homework will appear here when assigned by teachers
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderFee = () => (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Fee Status</h2>
        <p className="text-gray-600">Your fee payments and dues</p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Fee Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">₹{feeStats.totalPaid.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Paid</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">₹{feeStats.pending.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Structures */}
      {feeData?.structures && feeData.structures.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Fee Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feeData.structures.map((structure) => (
              <div key={structure.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{structure.fee_type}</p>
                  <p className="text-xs text-gray-600">Class {structure.class}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">₹{parseFloat(structure.amount.toString()).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{structure.period}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {feeData?.payments && feeData.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feeData.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{payment.fee_type}</p>
                  <p className="text-xs text-gray-600">
                    Paid on {new Date(payment.payment_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-green-600">
                    ₹{parseFloat(payment.amount_paid.toString()).toLocaleString()}
                  </p>
                  <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!feeData?.structures || feeData.structures.length === 0) && 
       (!feeData?.payments || feeData.payments.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-gray-600 mb-2">No fee information available</p>
            <p className="text-sm text-gray-500">
              Fee details will appear here once your school adds them
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderExams = () => (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Exam Schedule</h2>
        <p className="text-gray-600">Upcoming exams and test dates</p>
      </div>
      
      <Card>
        <CardContent className="p-6 text-center">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-gray-600 mb-2">Exam schedule coming soon</p>
          <p className="text-sm text-gray-500">
            Your exam timetable will be published here by your school
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderResults = () => (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Exam Results</h2>
        <p className="text-gray-600">Your exam scores and performance</p>
      </div>

      <div className="space-y-4">
        {examResults && examResults.length > 0 ? (
          examResults.map((result) => (
            <Card key={result.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <GraduationCap className="text-purple-600 h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{result.subject}</p>
                        <p className="text-xs text-gray-600">{result.exam_name || result.exam_type}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-blue-600">{result.marks_obtained}</p>
                        <p className="text-xs text-gray-500">Marks Scored</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-700">{result.out_of}</p>
                        <p className="text-xs text-gray-500">Total Marks</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          {Math.round((result.marks_obtained / result.out_of) * 100)}%
                        </p>
                        <p className="text-xs text-gray-500">Percentage</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-gray-600 mb-2">No exam results available</p>
              <p className="text-sm text-gray-500">
                Your exam results will appear here once published
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">School Announcements</h2>
        <p className="text-gray-600">Important notices and updates</p>
      </div>

      <div className="space-y-4">
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Megaphone className="text-blue-600 h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{announcement.title || announcement.message}</p>
                        <p className="text-xs text-gray-600">{announcement.department || 'School Administration'}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      {announcement.description || announcement.message}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{formatTimeAgo(new Date(announcement.created_at))}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-gray-600 mb-2">No announcements</p>
              <p className="text-sm text-gray-500">
                School announcements and notices will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Student Profile</h2>
        <p className="text-gray-600">Your personal information and settings</p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {student?.full_name?.charAt(0) || student?.name?.charAt(0) || 'S'}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold">{student?.full_name || student?.name}</h3>
              <p className="text-gray-600">Class {student?.class}{student?.section ? `-${student?.section}` : ""}</p>
              <p className="text-sm text-gray-500">ID: {student?.login_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Father's Name</p>
                <p className="text-sm font-semibold">{student?.father_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Mother's Name</p>
                <p className="text-sm font-semibold">{student?.mother_name || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-sm font-semibold">{student?.phone || student?.mobile_2 || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                <p className="text-sm font-semibold">
                  {student?.date_of_birth 
                    ? new Date(student.date_of_birth).toLocaleDateString() 
                    : 'Not provided'
                  }
                </p>
              </div>
            </div>

            {student?.address && (
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-sm font-semibold">{student.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {/* Add settings functionality */}}
            >
              <Users className="h-4 w-4 mr-2" />
              Family Information
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {/* Add timetable functionality */}}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Class Timetable
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {/* Add leave functionality */}}
            >
              <FileText className="h-4 w-4 mr-2" />
              Leave Requests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "attendance":
        return renderAttendance();
      case "homework":
        return renderHomework();
      case "fees":
        return renderFee();
      case "exams":
        return renderExams();
      case "results":
        return renderResults();
      case "announcements":
        return renderAnnouncements();
      case "profile":
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  if (!student) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <Header />
      <main>
        {renderContent()}
      </main>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
