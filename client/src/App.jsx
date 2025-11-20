import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ReportProblem from './pages/ReportProblem';
import ProblemDetail from './pages/ProblemDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProblems from './pages/admin/AdminProblems';
import AdminUsers from './pages/admin/AdminUsers';
import DepartmentDashboard from './pages/department/DepartmentDashboard';
import Leaderboard from './pages/Leaderboard';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import VerificationPending from './pages/VerificationPending';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/problems/:id" element={<ProblemDetail />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              
              {/* Protected Routes - All authenticated users */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/report" element={
                <ProtectedRoute>
                  <ReportProblem />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/verification-pending" element={
                <ProtectedRoute>
                  <VerificationPending />
                </ProtectedRoute>
              } />
              
              {/* Admin Only Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/problems" element={
                <ProtectedRoute requireAdmin>
                  <AdminProblems />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              
              {/* Department Staff Routes */}
              <Route path="/department" element={
                <ProtectedRoute requireDepartment>
                  <DepartmentDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;