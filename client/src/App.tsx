import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jams from './pages/Jams';
import Showcase from './pages/Showcase';
import Resources from './pages/Resources';
import Community from './pages/Community';

// Components
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jams" element={<Jams />} />
              <Route path="/showcase" element={<Showcase />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/community" element={<Community />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;