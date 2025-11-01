import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PollsPage from "./pages/PollsPage";
import ProfilePage from "./pages/ProfilePage";
import CreatePollPage from "./pages/CreatePollPage";
import VotePage from "./pages/VotePage";
import AboutPage from "./pages/AboutPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { useEffect } from "react";
import { seedIfEmpty } from "./utility/seed";

function App() {
  useEffect(() => {
    seedIfEmpty();
  }, []);
  return (
    <div className="app">
      <Navbar />
      <div className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/polls" element={<PollsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/create" element={<CreatePollPage />} />
          <Route path="/vote/:id" element={<VotePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
