import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import IdePage from "./pages/IdePage";
import ProfilePage from "./pages/ProfilePage";
import ExplorePage from "./pages/ExplorePage";

function App() {
  return (
    <Routes>
      {/* Product Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* CodePad Playground IDE */}
      <Route path="/ide" element={<IdePage />} />

      {/* Shared Read-Only Snippet View */}
      <Route path="/s/:snippetId" element={<IdePage />} />

      {/* Developer Profile & Public Snippets */}
      <Route path="/u/:username" element={<ProfilePage />} />

      {/* Community Explore Feed */}
      <Route path="/explore" element={<ExplorePage />} />

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
