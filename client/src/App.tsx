import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SelectUsername from './pages/SelectUsername';
import OAuthCallback from './pages/OAuthCallback';
import Jams from './pages/Jams';
import Showcase from './pages/Showcase';
import Resources from './pages/Resources';
import Support from './pages/Support';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import About from './pages/About';
import GameDashboard from './pages/GameDashboard';
import GameForm from './pages/GameForm';
import Community from './pages/Community';
import UserProfile from './pages/UserProfile';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/forgot-password', '/reset-password', '/select-username', '/oauth-callback'].includes(location.pathname);

  return (
    <div className="app">
      <Navbar />
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/select-username" element={<SelectUsername />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
        </Routes>
      ) : (
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jams" element={<Jams />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/support" element={<Support />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard/games" element={<GameDashboard />} />
            <Route path="/games/new" element={<GameForm />} />
            <Route path="/games/:id/edit" element={<GameForm />} />
            <Route path="/community" element={<Community />} />
            <Route path="/users/:username" element={<UserProfile />} />
          </Routes>
        </main>
      )}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;