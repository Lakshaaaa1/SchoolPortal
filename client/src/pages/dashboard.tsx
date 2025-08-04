import { useState, useEffect } from "react";
import { 
  Calendar,
  CreditCard,
  BookOpen,
  Megaphone,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import type { AttendanceStats, FeeStats } from "@/lib/types";
import type { Homework, Announcement } from "@shared/schema";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { student } = useAuth();

  // Fetch attendance data
  const { data: attendanceData } = useQuery({
    queryKey: ["/api/attendance", student?.studentId],
    enabled: !!student?.studentId,
  });

  // Fetch homework data
  const { data: homeworkData } = useQuery<Homework[]>({
    queryKey: ["/api/homework", student?.studentId],
    enabled: !!student?.studentId,
  });

  // Fetch fee data
  const { data: feeData } = useQuery({
    queryKey: ["/api/fees", student?.studentId],
    enabled: !!student?.studentId,
  });

  // Fetch announcements
  const { data: announcements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const attendanceStats: AttendanceStats = attendanceData?.stats || { present: 0, absent: 0, percentage: 0 };
  const feeStats: FeeStats = feeData?.stats || { paid: 0, pending: 0 };
  const todayHomework = homeworkData?.slice(0, 2) || [];
  const recentAnnouncements = announcements?.slice(0, 2) || [];

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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Attendance</p>
                <p className="text-2xl font-bold">{attendanceStats.percentage}%</p>
              </div>
              <Calendar className="text-blue-200 h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Fee Status</p>
                <p className="text-sm font-semibold">
                  {feeStats.pending > 0 ? "Pending" : "Paid"}
                </p>
              </div>
              <CreditCard className="text-green-200 h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Homework */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <BookOpen className="text-primary mr-2 h-5 w-5" />
            Today's Homework
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {todayHomework.length > 0 ? (
            todayHomework.map((hw) => (
              <div key={hw.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{hw.subject}</p>
                  <p className="text-xs text-gray-600">{hw.title}</p>
                </div>
                {getStatusBadge(hw.status)}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No homework for today</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Megaphone className="text-secondary mr-2 h-5 w-5" />
            Recent Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAnnouncements.length > 0 ? (
            recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="border-l-4 border-primary pl-3">
                <p className="font-medium text-sm">{announcement.title}</p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {announcement.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTimeAgo(new Date(announcement.postedAt))}
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

  const renderAttendance = () => (
    <div className="p-4 pb-20">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Attendance Overview
            <select className="text-sm border border-gray-300 rounded-lg px-2 py-1">
              <option>December 2024</option>
              <option>November 2024</option>
            </select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{attendanceStats.present}</p>
              <p className="text-xs text-gray-600">Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-error">{attendanceStats.absent}</p>
              <p className="text-xs text-gray-600">Absent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{attendanceStats.percentage}%</p>
              <p className="text-xs text-gray-600">Percentage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-200">
          {attendanceData?.attendance?.map((record: any) => (
            <div key={record.id} className="py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  {new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(record.status)}
                {record.timeIn && (
                  <p className="text-xs text-gray-600 mt-1">{record.timeIn}</p>
                )}
              </div>
            </div>
          )) || (
            <p className="text-sm text-gray-600 py-4">No attendance records found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderHomework = () => (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Homework & Assignments</h3>
        <div className="flex space-x-2">
          <Button size="sm" variant="default">All</Button>
          <Button size="sm" variant="secondary">Pending</Button>
        </div>
      </div>

      <div className="space-y-4">
        {homeworkData?.map((hw) => (
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
                      <p className="text-xs text-gray-600">{hw.teacher}</p>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">{hw.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{hw.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <Clock className="mr-1 h-3 w-3" />
                    <span>
                      {Math.ceil((new Date(hw.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                    </span>
                  </div>
                </div>
                {getStatusBadge(hw.status)}
              </div>
              <div className="flex items-center justify-between">
                <Button variant="link" size="sm">View Details</Button>
                {hw.status === 'pending' && (
                  <Button size="sm">Mark Complete</Button>
                )}
              </div>
            </CardContent>
          </Card>
        )) || (
          <p className="text-sm text-gray-600">No homework assignments found</p>
        )}
      </div>
    </div>
  );

  const renderFee = () => (
    <div className="p-4 pb-20">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Fee Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-success">{formatCurrency(feeStats.paid)}</p>
              <p className="text-xs text-gray-600">Paid</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-warning">{formatCurrency(feeStats.pending)}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee History</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-200">
          {feeData?.fees?.map((fee: any) => (
            <div key={fee.id} className="py-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{fee.feeType}</p>
                  <p className="text-xs text-gray-600">Academic Year {fee.academicYear}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatCurrency(fee.amount)}</p>
                  {getStatusBadge(fee.status)}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                {fee.status === 'paid' && fee.paidAt && (
                  <span>Paid: {new Date(fee.paidAt).toLocaleDateString()}</span>
                )}
              </div>
              {fee.status === 'pending' && (
                <Button className="w-full mt-3" size="sm">
                  Pay Now
                </Button>
              )}
            </div>
          )) || (
            <p className="text-sm text-gray-600 py-4">No fee records found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">School Announcements</h3>
        <Button variant="link" size="sm">Mark All Read</Button>
      </div>

      <div className="space-y-4">
        {announcements?.map((announcement) => (
          <Card key={announcement.id} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Megaphone className="text-blue-600 h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{announcement.title}</p>
                      <p className="text-xs text-gray-600">{announcement.department}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{announcement.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>Posted: {new Date(announcement.postedAt).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>{announcement.views} views</span>
                  </div>
                </div>
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
              </div>
            </CardContent>
          </Card>
        )) || (
          <p className="text-sm text-gray-600">No announcements found</p>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-4 pb-20">
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {student?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-gray-800">{student?.name}</h3>
            <p className="text-sm text-gray-600">Student ID: {student?.studentId}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Class</span>
              <span className="text-sm font-medium">{student?.class}-{student?.section}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Roll Number</span>
              <span className="text-sm font-medium">{student?.rollNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Academic Year</span>
              <span className="text-sm font-medium">2024-25</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Guardian Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Father's Name</span>
            <span className="text-sm font-medium">{student?.fatherName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Mother's Name</span>
            <span className="text-sm font-medium">{student?.motherName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Contact Number</span>
            <span className="text-sm font-medium">{student?.guardianPhone}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium">{student?.guardianEmail}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center">
            <AlertCircle className="text-gray-600 mr-3 h-4 w-4" />
            <span>Notification Settings</span>
          </div>
        </Button>

        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center">
            <BookOpen className="text-gray-600 mr-3 h-4 w-4" />
            <span>Contact Teacher</span>
          </div>
        </Button>

        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center">
            <AlertCircle className="text-gray-600 mr-3 h-4 w-4" />
            <span>Help & Support</span>
          </div>
        </Button>

        <Button 
          variant="destructive" 
          className="w-full"
          onClick={() => {
            if (confirm('Are you sure you want to logout?')) {
              // Handle logout in App.tsx
              window.location.reload();
            }
          }}
        >
          Logout
        </Button>
      </div>
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
      case "fee":
        return renderFee();
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
