import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadResearch from "./pages/UploadResearch";
import Repository from "./pages/Repository";
import PlagiarismCheck from "./pages/PlagiarismCheck";
import CheckPlagiarism from "./pages/CheckPlagiarism";
import MySubmissions from "./pages/MySubmissions";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-submissions"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MySubmissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <UploadResearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repository"
              element={
                <ProtectedRoute>
                  <Repository />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plagiarism"
              element={
                <ProtectedRoute>
                  <PlagiarismCheck />
                </ProtectedRoute>
              }
            />
            <Route
              path="/check-plagiarism"
              element={
                <ProtectedRoute>
                  <CheckPlagiarism />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
