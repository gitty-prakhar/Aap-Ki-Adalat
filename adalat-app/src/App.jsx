import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Disputes from './pages/Disputes';
import FileCase from './pages/FileCase';
import JurorPanel from './pages/JurorPanel';
import Stake from './pages/Stake';
import Admin from './pages/Admin';
import { useRealtimeEvents } from './hooks/useRealtimeEvents';

function AppContent() {
  // Activate real-time event listeners
  useRealtimeEvents();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="disputes" element={<Disputes />} />
        <Route path="file-case" element={<FileCase />} />
        <Route path="juror-panel" element={<JurorPanel />} />
        <Route path="stake" element={<Stake />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
