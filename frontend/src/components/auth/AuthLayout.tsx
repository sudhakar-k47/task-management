import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-foreground mb-2">
            Task Management
          </h1>
          {/* <p className="text-primary-foreground/80">
            Professional Task Management
          </p> */}
        </div>
        
        <div className="bg-card rounded-xl shadow-elegant p-8 animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};