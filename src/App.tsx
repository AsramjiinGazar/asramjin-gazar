import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import { PrefetchOnAuth } from "@/components/PrefetchOnAuth";
import { createQueryClient } from "@/lib/queryClient";
import { PageSkeleton } from "@/components/skeletons/PageSkeleton";

const queryClient = createQueryClient();

const Home = lazy(() => import("./pages/Home"));
const Students = lazy(() => import("./pages/Students"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Quest = lazy(() => import("./pages/Quest"));
const CalendarPage = lazy(() => import("./pages/Calendar"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

function AppRoutes() {
  const location = useLocation();
  const showNav = location.pathname !== "/login" && location.pathname !== "/register" && location.pathname !== "/admin";

  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/students" element={<Students />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/quest" element={<Quest />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {showNav && <BottomNav />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PrefetchOnAuth />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
