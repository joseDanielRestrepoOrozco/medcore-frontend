import { type ReactNode } from "react";
import LayoutNavbar from "../Navbar";
import LayoutSidebar from "./Sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LayoutNavbar />
      <div className="flex">
        <LayoutSidebar />
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-4 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
