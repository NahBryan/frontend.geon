import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Activity } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthLanding } from "./pages/AuthLanding";
import { Toaster } from "sileo";
const DashboardLayoutContent = ({ 
  demoLiveToggleState, 
  currentPageTab,
  setCurrentPageTab
}: {
  demoLiveToggleState: boolean;
  setDemoLiveToggleState: (val: boolean) => void;
  currentPageTab: string;
  setCurrentPageTab: (val: string) => void;
}) => {
  const { user, isLoading } = useAuth(); 

  // 2. Prevent a "flash" of the dashboard screen while checking local storage/API sessions
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-stone-50">
        <span className="w-6 h-6 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  // 3. INSERTION POINT: If no valid operator profile context exists, show the landing screen
  if (!user) {
    return (
      <AuthLanding 
        onAuthSuccess={(userData) => {
          // The useAuth login method automatically sets the user state globally inside AuthProvider,
          // but you can append additional logic here if needed.
          console.log("Operator terminal access authorized:", userData.email);
        }} 
      />
    );
  }

  // 4. Fallback profile modeling for authorized users
  const activeUserSession = {
    full_name: user.full_name || "Agro Operator",
    subscription_type: user.subscription_type === "premium" ? "Production Enterprise" : "Standard Tier"
  };
  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans select-none antialiased text-slate-900">
      <Sidebar 
        currentPage={currentPageTab} 
        onPageChange={setCurrentPageTab} 
        user={activeUserSession} 
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-white z-30 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">
              Environment Data Vector Sync Protocol:
            </span>

          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] font-semibold flex items-center gap-1.5">
              <Activity size={12} className={demoLiveToggleState ? "text-slate-400" : "text-green-600 animate-pulse"} />
              <span className="uppercase text-[10px] font-bold">Data Hub Status: Sync OK</span>
            </div>
          </div>
        </header>

        {/* Workspace Display Target Content Container Window Viewport */}
        <main className="flex-1 overflow-hidden relative bg-slate-50">
          <Dashboard 
            mockMode={demoLiveToggleState} 
            activeTab={currentPageTab} 
          />
        </main>
      </div>
    </div>
  );
};

// Main Entry Point component to handle context mounting correctly
export default function App() {
  const [currentPageTab, setCurrentPageTab] = useState<string>("dashboard");
  const [demoLiveToggleState, setDemoLiveToggleState] = useState<boolean>(true);

  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <DashboardLayoutContent 
        demoLiveToggleState={demoLiveToggleState}
        setDemoLiveToggleState={setDemoLiveToggleState}
        currentPageTab={currentPageTab}
        setCurrentPageTab={setCurrentPageTab}
      />
    </AuthProvider>
  );
}