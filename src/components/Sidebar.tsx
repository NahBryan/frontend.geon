import React from "react";
import { LayoutDashboard, TrendingUp, Map, Wheat, ShieldAlert, FileText, CreditCard, Leaf, ChevronRight } from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  user: { full_name: string; subscription_type: string };
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, user }) => {
  const sections = [
    {
      title: "Analytics Engines",
      items: [
        { id: "dashboard", label: "Dashboard Workspace", icon: LayoutDashboard },
        { id: "prices", label: "Price Forecasting Matrix", icon: TrendingUp },
        { id: "suitability", label: "Geospatial Suitability Grid", icon: Map },
        { id: "yield", label: "Yield Prediction Calculator", icon: Wheat },
        { id: "risk", label: "Risk Mitigation Evaluation", icon: ShieldAlert }
      ]
    },
    {
      title: "Core Platform Tools",
      items: [
        { id: "reports", label: "Telemetry Exporter", icon: FileText },
        { id: "subscription", label: "API Plan Tiers", icon: CreditCard }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen select-none">
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-md shadow-green-600/10">
          <Leaf size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-slate-900">GEoN</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Intelligence Hub</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              {section.title}
            </h4>
            {section.items.map(item => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer border-none ${
                    active 
                      ? "bg-green-50 text-green-700 font-bold shadow-sm" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <item.icon size={15} className={active ? "text-green-600" : "text-slate-400"} />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight size={12} className="text-green-600" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">{user.full_name}</p>
            <span className="inline-block text-[9px] font-bold text-green-700 bg-green-100 px-1.5 rounded uppercase tracking-wide mt-0.5">
              {user.subscription_type}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};