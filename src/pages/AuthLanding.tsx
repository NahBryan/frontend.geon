/* eslint-disable no-irregular-whitespace */
import React, { useState } from "react";
import {
  Sprout,
  Compass,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Globe,
  Activity,
} from "lucide-react";
import { CorporateFooter } from "../components/Footer";
import { ReviewPaneDeck } from "@/components/ReviewPane";
import { BodyContentMesh } from "@/components/BodyCards";
import { useAuth } from "@/context/AuthContext";
import { sileo } from "sileo";
interface AuthLandingProps {
  onAuthSuccess: (userData: {
    full_name: string;
    email: string;
    subscription_type: "free" | "medium" | "premium";
  }) => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({ onAuthSuccess }) => {
  const { login, signup } = useAuth();
  const [currentView, setCurrentView] = useState<"landing" | "auth">("landing");
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (authTab === "signup") {
        // Trigger context registration pipeline
        const response = await signup(email, password, fullName);
        if (response.success) {
          // Auto log the user in following successful profile creation
          const loginResponse = await login(email, password);
          if (loginResponse.success) {
            onAuthSuccess({
              full_name: fullName || "Agro Operator",
              email: email,
              subscription_type: "free",
            });
          } else {
            sileo.error({
            title: "Encountered An Error Logging In",
            description:
              loginResponse.message ||
                "Profile built, but initial verification failed.",
            duration: 3000, // Keeps the layout on screen for 3 seconds instead of the default 6
          });
          }
        } else {
          sileo.error({
            title: "Encountered An Error Signing you Up",
            description:
              response.message ||
              "Unable to initialize profile context matrix.",
            duration: 3000, // Keeps the layout on screen for 3 seconds instead of the default 6
          });
        }
      } else {
        // Trigger context verification login pipeline
        const response = await login(email, password);
        if (response.success) {
          onAuthSuccess({
            full_name: fullName || "GEoN Enterprise Node",
            email: email,
            subscription_type: "premium", // Adjusted based on server context profile configuration
          });
        } else {
          sileo.error({
            title: "Encountered An Error Logging In",
            description:
              response.message || "Terminal authentication handshake rejected.",
            duration: 3000, // Keeps the layout on screen for 3 seconds instead of the default 6
          });
        }
      }
    } catch (err) {
      console.error("Auth landing execution exception:", err);
      sileo.error({
            title: "Oops, Encountered An Unexpected Error",
            description:
              "An unexpected operational hardware connection error occurred.",
            duration: 3000, // Keeps the layout on screen for 3 seconds instead of the default 6
          });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentView === "landing") {
    return (
      <div className="w-full min-h-screen overflow-x-hidden flex flex-col font-sans bg-stone-50 selection:bg-emerald-200 selection:text-emerald-900 text-stone-800">
                {/* Navigation Header Bar */}       {" "}
        <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br from-emerald-500 to-teal-600">
                            <Sprout size={18} className="text-white" />         
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold font-serif leading-tight tracking-wide text-stone-900">
                                GEoN                {" "}
                <strong className="text-emerald-600 font-extrabold font-sans text-sm">
                                    ML                {" "}
                </strong>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-medium">
                                Agricultural Analytics Platform            
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setAuthTab("signin");
                setCurrentView("auth");
              }}
              className="text-xs font-bold text-stone-600 hover:text-emerald-600 transition-colors cursor-pointer px-3 py-2 bg-transparent border-none"
            >
                            Sign In            {" "}
            </button>
            <button
              onClick={() => {
                setAuthTab("signup");
                setCurrentView("auth");
              }}
              className="text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl text-white shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 bg-gradient-to-r from-emerald-600 to-teal-600 hover:-translate-y-px active:translate-y-0 transition-all cursor-pointer border-none"
            >
                            Get Started Free            {" "}
            </button>
          </div>
        </header>
        <main className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12 lg:py-6 relative">
          <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -z-10" />
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-mono font-bold tracking-wider text-emerald-700 shadow-sm">
                            <Globe size={12} className="text-emerald-600" />   
                        <span>GEOSPATIAL SATELLITE ENGINE INTEGRATED</span>     
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-stone-900 leading-[1.1] tracking-tight">
                            Predictive crop intelligence optimized for          
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 font-bold font-sans">
                                Cameroonian Farmlands.              {" "}
              </span>
            </h1>
            <p className="text-sm md:text-base text-stone-600 leading-relaxed max-w-2xl">
                            Utilize precision machine learning models and
              high-resolution               satellite arrays to evaluate
              regional precipitation variances,               project historical
              price indices, and monitor live soil health               vectors
              effortlessly.            {" "}
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setAuthTab("signup");
                  setCurrentView("auth");
                }}
                className="group px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-700/10 hover:shadow-emerald-700/20 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:-translate-y-px active:translate-y-0 transition-all border-none"
              >
                                <span>Launch Analytics Workspace</span>
                <ArrowRight
                  size={13}
                  className="group-hover:translate-x-0.5 transition-transform text-emerald-200"
                />
              </button>
              <button
                onClick={() => {
                  setAuthTab("signin");
                  setCurrentView("auth");
                }}
                className="px-6 py-3.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 cursor-pointer border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-all shadow-sm"
              >
                                Access Active Workspace              {" "}
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative rounded-2xl border border-stone-200/80 p-6 space-y-4 shadow-xl bg-white/90 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity
                    size={14}
                    className="text-emerald-600 animate-pulse"
                  />
                  <span className="font-mono text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                                        Live Diagnostics Pipeline              
                  </span>
                </div>
              </div>
              <div className="h-48 rounded-xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-100/60 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#059669_1px,transparent_1px),linear-gradient(to_bottom,#059669_1px,transparent_1px)] bg-[size:24px_24px]" />
                <Compass size={36} className="text-emerald-600/60 mb-2" />     
                <span className="text-xs font-bold text-stone-800">
                                    Satellite Matrix Active                {" "}
                </span>
              </div>
            </div>
          </div>
        </main>
                {/* Dynamic Structural Core Content Additions */}
                <BodyContentMesh />
                <ReviewPaneDeck />        {/* Reusable Core Corporate Footer */}
               {" "}
        <CorporateFooter
          onNavAuth={() => {
            setAuthTab("signup");
            setCurrentView("auth");
          }}
        />
      </div>
    );
  }

  {
    /* Split Interface Authentication View Layer */
  }
  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-stone-50 text-stone-800 font-sans selection:bg-emerald-200">
      <div className="w-full max-w-md mx-auto space-y-6 pt-16 px-4 pb-12">
        <div className="flex flex-col items-center text-center space-y-2">
          <button
            onClick={() => setCurrentView("landing")}
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105 border-none bg-gradient-to-br from-emerald-500 to-teal-600"
          >
                        <Sprout size={20} className="text-white" />       
          </button>
          <h2 className="text-3xl font-serif font-medium text-stone-900 tracking-tight mt-1">
            {authTab === "signin" ? "Welcome Back" : "Create Operator Account"} 
          </h2>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white shadow-xl overflow-hidden">
          <div className="grid grid-cols-2 border-b border-stone-100 text-center font-mono">
            <button
              type="button"
              onClick={() => setAuthTab("signin")}
              className={`py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${authTab === "signin" ? "text-emerald-700 bg-emerald-50/40 border-b-2 border-emerald-600" : "text-stone-400 hover:text-stone-600 bg-transparent border-none"}`}
            >
                            Sign In            {" "}
            </button>
            <button
              type="button"
              onClick={() => setAuthTab("signup")}
              className={`py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${authTab === "signup" ? "text-emerald-700 bg-emerald-50/40 border-b-2 border-emerald-600" : "text-stone-400 hover:text-stone-600 bg-transparent border-none"}`}
            >
                            Sign Up            {" "}
            </button>
          </div>
          <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
            {authTab === "signup" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 block">
                                    Operator Full Name                {" "}
                </label>
                <div className="relative flex items-center">
                  <User
                    size={14}
                    className="absolute left-3.5 text-stone-400"
                  />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jean-Pierre Eyidi"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-emerald-500 focus:bg-white transition-colors font-medium"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 block">
                                Registered Email              {" "}
              </label>
              <div className="relative flex items-center">
                <Mail size={14} className="absolute left-3.5 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@domain.cm"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-emerald-500 focus:bg-white transition-colors font-medium font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 block">
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock size={14} className="absolute left-3.5 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-10 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-emerald-500 focus:bg-white transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer bg-transparent border-none"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}     
                </button>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 bg-gradient-to-r from-emerald-600 to-teal-600 border-none"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                                        <ShieldCheck size={13} />               
                    <span>
                      {authTab === "signin"
                        ? "Verify Terminal Credentials"
                        : "Initialize Operator Profile"}
                    </span>
                  </>
               )}
              </button>
            </div>
          </form>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={() => setCurrentView("landing")}
            className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600 transition-colors cursor-pointer bg-transparent border-none"
          >
          </button>
        </div>
      </div>
      <CorporateFooter
        onNavAuth={() => {
          setAuthTab("signup");
          setCurrentView("auth");
        }}
      />
    </div>
  );
};
