import { 
  Home, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  Megaphone, 
  User,
  GraduationCap,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "homework", label: "Homework", icon: BookOpen },
  { id: "fees", label: "Fees", icon: CreditCard },
  { id: "results", label: "Results", icon: GraduationCap },
  { id: "announcements", label: "News", icon: Megaphone },
  { id: "profile", label: "Profile", icon: User },
];

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 max-w-md mx-auto">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center py-2 px-3 h-auto",
                isActive ? "text-primary" : "text-gray-600"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
