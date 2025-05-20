
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <main className={`flex-1 p-4 md:p-6 overflow-auto bg-background ${className}`}>
      {children}
    </main>
  );
}
