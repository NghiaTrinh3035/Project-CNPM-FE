import { Outlet } from "react-router-dom";

import { AiAssistantWidget } from "@/shared/components/ai/AiAssistantWidget";
import { AppFooter } from "@/shared/components/layout/AppFooter";
import { AppHeader } from "@/shared/components/layout/AppHeader";

export const PublicLayout = () => (
  <div className="min-h-screen bg-background text-foreground">
    <AppHeader />
    <main>
      <Outlet />
    </main>
    <AppFooter />
    <AiAssistantWidget />
  </div>
);
