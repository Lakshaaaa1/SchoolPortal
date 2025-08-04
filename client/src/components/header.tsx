import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const { student } = useAuth();
  
  if (!student) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-semibold text-sm">
              {getInitials(student.name)}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{student.name}</h2>
            <p className="text-xs text-gray-600">
              Class {student.class}-{student.section} | Roll: {student.rollNumber}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}
