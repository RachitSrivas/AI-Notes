
import SharedNote from './pages/SharedNote';
import React from 'react'; // <-- Add this import
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Auth from './pages/Auth';
import Workspace from './pages/Workspace';

// Change JSX.Element to React.ReactNode
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('peblo_token');
  return token ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Workspace />
              </PrivateRoute>
            } 
          />
          <Route path="/shared/:id" element={<SharedNote />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;