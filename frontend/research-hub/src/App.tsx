import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import UploadResearch from '@/pages/UploadResearch';
import Repository from '@/pages/Repository';
import CheckPlagiarism from '@/pages/CheckPlagiarism';
import PlagiarismCheck from '@/pages/PlagiarismCheck'; // This is the "Reports" page
import MySubmissions from '@/pages/MySubmissions';
import UserManagement from '@/pages/UserManagement';
import NotFound from '@/pages/NotFound';
import Profile from '@/pages/Profile'; // <--- Import Profile

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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
              path="/check-plagiarism"
              element={
                <ProtectedRoute>
                  <CheckPlagiarism />
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
              path="/my-submissions"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MySubmissions />
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

            {/* --- NEW PROFILE ROUTE --- */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </TooltipProvider>
  );
}

export default App;