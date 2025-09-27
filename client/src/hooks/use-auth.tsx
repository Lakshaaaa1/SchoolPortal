import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Student, LoginCredentials } from "@shared/schema";
import { setupNotifications } from "@/services/notifications";

interface AuthContextType {
  student: Student | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const savedStudent = localStorage.getItem("student");
    if (savedStudent) {
      try {
        setStudent(JSON.parse(savedStudent));
      } catch (error) {
        localStorage.removeItem("student");
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { credential, password, loginType } = credentials;
      
      let query = supabase
        .from('students')
        .select('*')
        .eq('password', password);

      // Query based on login type
      if (loginType === 'login_id') {
        query = query.eq('login_id', credential);
      } else {
        query = query.or(`phone.eq.${credential},phone1.eq.${credential},phone2.eq.${credential},mobile_2.eq.${credential}`);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        throw new Error("Invalid credentials");
      }

      setStudent(data);
      localStorage.setItem("student", JSON.stringify(data));
      
      // Setup push notifications after successful login
      try {
        await setupNotifications({
          studentId: data.login_id,
          className: data.class,
          section: data.section || undefined
        });
      } catch (notificationError) {
        console.error("Failed to setup push notifications:", notificationError);
        // Don't throw - login should still succeed even if notifications fail
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem("student");
  };

  return (
    <AuthContext.Provider value={{ student, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
