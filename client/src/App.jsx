import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import IdePage from "./pages/IdePage";
import ProfilePage from "./pages/ProfilePage";
import ExplorePage from "./pages/ExplorePage";
import LearningsHubPage from "./pages/LearningsHubPage";
import LearningEditorPage from "./pages/LearningEditorPage";
import LearningDetailPage from "./pages/LearningDetailPage";

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

      {/* Learnings Knowledge Hub */}
      <Route path="/learnings" element={<LearningsHubPage />} />
      <Route path="/learnings/new" element={<LearningEditorPage />} />
      <Route path="/learnings/:learningId" element={<LearningDetailPage />} />
      <Route path="/learnings/:learningId/edit" element={<LearningEditorPage />} />

      {/* Community Explore Feed */}
      <Route path="/explore" element={<ExplorePage />} />

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
