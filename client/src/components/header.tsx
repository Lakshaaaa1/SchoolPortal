import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  onNotificationClick?: () => void;
}

export default function Header({ onNotificationClick }: HeaderProps) {
  const { student } = useAuth();
  
  if (!student) return null;

  const getInitials = (name?: string) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-semibold text-sm">
              {getInitials(student.full_name || student.name)}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{student.full_name || student.name}</h2>
            <p className="text-xs text-gray-600">
              Class {student.class}{student.section ? `-${student.section}` : ""} | ID: {student.login_id}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-blue-50 transition-colors"
          onClick={onNotificationClick}
        >
          <BellRing className="h-6 w-6 text-blue-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-semibold animate-pulse">
            !
          </span>
        </Button>
      </div>
    </header>
  );
}
