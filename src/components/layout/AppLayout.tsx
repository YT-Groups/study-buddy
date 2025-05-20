
import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { PageContainer } from "./PageContainer";

interface AppLayoutProps {
  children: ReactNode;
  username?: string;
}

export function AppLayout({ children, username }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex flex-col flex-1 md:ml-64">
        <Header username={username} />
        <PageContainer>
          {children}
        </PageContainer>
      </div>
    </div>
  );
}
