import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { ProctedRoute } from "./components/ProtectedRoute";

import { ManageUsers } from "./pages/ManageUsers";
import { ManageClasses } from "./pages/ManageClasses";
import { AssignUsers } from "./pages/AssignUsers";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={
          <ProctedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProctedRoute>
        } />
        <Route path="/admin/users" element={
          <ProctedRoute allowedRole="ADMIN">
            <ManageUsers />
          </ProctedRoute>
        } />
         <Route path="/admin/classes" element={
          <ProctedRoute allowedRole="ADMIN">
            <ManageClasses />
          </ProctedRoute>
        } />
        <Route path="/admin/assign" element={
          <ProctedRoute allowedRole="ADMIN">
            <AssignUsers />
          </ProctedRoute>
        } />
        <Route path="/teacher" element={
          <ProctedRoute allowedRole="TEACHER">
            <TeacherDashboard />
          </ProctedRoute>
        } />
        <Route path="/student" element={
          <ProctedRoute allowedRole="STUDENT">
            <StudentDashboard />
          </ProctedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;