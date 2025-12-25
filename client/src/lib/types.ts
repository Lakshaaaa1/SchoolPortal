export interface DashboardData {
  attendancePercentage: number;
  feeStatus: string;
  todayHomework: {
    subject: string;
    title: string;
    status: 'pending' | 'completed';
  }[];
  recentAnnouncements: {
    title: string;
    description: string;
    timeAgo: string;
    priority: string;
  }[];
}

export interface AttendanceStats {
  present: number;
  absent: number;
  percentage: number;
}

export interface FeeStats {
  paid: number;
  pending: number;
}
