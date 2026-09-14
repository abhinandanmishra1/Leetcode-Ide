import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCompass,
  faCodeFork,
  faFire,
  faClock,
  faUser,
  faCode,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import { CodePadBrand } from "../components/Brand/CodePadLogo";
import { snippetsApi } from "../api";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/Auth/AuthModal";
import UserAvatar from "../components/common/UserAvatar";

const LANGUAGE_FILTERS = [
  { label: "All Languages", id: null },
  { label: "C++", id: 54 },
  { label: "Python", id: 71 },
  { label: "JavaScript", id: 63 },
  { label: "Java", id: 62 },
  { label: "Go", id: 60 },
  { label: "Rust", id: 73 },
];

function ExplorePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState(null);
  const [sortBy, setSortBy] = useState("latest"); // "latest" | "popular"
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = {
      sort: sortBy,
      limit: 24,
    };
    if (selectedLang) params.languageId = selectedLang;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    snippetsApi
      .getPublic(params)
      .then((res) => {
        setSnippets(res.snippets || []);
      })
      .catch((err) => {
        console.error("Failed to load explore feed:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedLang, sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-[#141414] text-gray-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#1e1e1e]/90 backdrop-blur-md border-b border-[#2d2d2d] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link to="/">
              <CodePadBrand />
            </Link>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link
              to="/learnings"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-[#252525] hover:bg-[#2f2f2f] rounded-lg transition-colors border border-[#383838]"
            >
              <FontAwesomeIcon icon={faBookOpen} className="text-[#ffa116] text-[10px]" />
              <span>Learnings</span>
            </Link>
            <Link
              to="/ide"
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#2cbb5d] hover:bg-[#26a050] text-white rounded-lg transition-colors shadow"
            >
              Open IDE
            </Link>
            {user ? (
              <Link
                to={`/u/${user.username}`}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-white bg-[#282828] hover:bg-[#333333] border border-[#3e3e3e] rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faUser} className="text-[#ffa116] text-[10px]" />
                <span>@{user.username}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 text-xs text-gray-300 hover:text-white"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 text-[#ffa116] text-xs font-bold uppercase tracking-wider">
            <FontAwesomeIcon icon={faCompass} />
            <span>Community Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Explore Code Snippets & Solutions</h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
            Browse algorithms, dynamic programming solutions, and data structures shared by the community. Run them
            directly in the sandbox or fork them to your editor.
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-xl">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snippets by title, problem, or keywords..."
                className="w-full bg-[#141414] border border-[#383838] pl-9 pr-4 py-2.5 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-[#ffa116]"
              />
            </div>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Language Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {LANGUAGE_FILTERS.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => setSelectedLang(filter.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedLang === filter.id
                    ? "bg-[#ffa116] text-black font-semibold"
                    : "bg-[#222222] text-gray-300 hover:bg-[#2c2c2c] border border-[#333333]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center space-x-1 bg-[#1e1e1e] border border-[#333333] p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setSortBy("latest")}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-colors ${
                sortBy === "latest" ? "bg-[#2e2e2e] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faClock} className="text-[10px]" />
              <span>Latest</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy("popular")}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-colors ${
                sortBy === "popular" ? "bg-[#2e2e2e] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faFire} className="text-[10px] text-[#ffa116]" />
              <span>Popular</span>
            </button>
          </div>
        </div>

        {/* Snippets Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-xs text-gray-400">Loading snippets...</div>
          </div>
        ) : snippets.length === 0 ? (
          <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl p-12 text-center space-y-3">
            <div className="text-gray-400 text-sm">No snippets match your current search or filter.</div>
            <Link
              to="/ide"
              className="inline-block px-4 py-2 bg-[#2cbb5d] hover:bg-[#26a050] text-white text-xs font-semibold rounded-lg"
            >
              Create New Snippet in IDE
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {snippets.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/s/${s.snippetId}`)}
                className="bg-[#1c1c1c] border border-[#2d2d2d] hover:border-[#404040] rounded-xl p-5 cursor-pointer transition-all hover:bg-[#212121] flex flex-col justify-between space-y-4 group shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2c22] text-[#2cbb5d] border border-[#2cbb5d]/30">
                      {s.languageName}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-[#ffa116] transition-colors line-clamp-1">
                    {s.title}
                  </h3>

                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {s.description || "Community solution on CodePad"}
                  </p>

                  {/* Code snippet preview */}
                  <div className="mt-3 p-2.5 bg-[#141414] border border-[#282828] rounded-lg font-mono text-[11px] text-gray-400 line-clamp-2 overflow-hidden select-none">
                    {s.code.split("\n").slice(0, 2).join("\n")}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#262626] text-xs">
                  {/* Author */}
                  {s.author ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/u/${s.author.username}`);
                      }}
                      className="flex items-center space-x-1.5 text-gray-400 hover:text-white"
                    >
                      <UserAvatar
                        avatar={s.author.avatar}
                        name={s.author.name}
                        username={s.author.username}
                        size="xs"
                      />
                      <span className="text-[11px] font-medium">@{s.author.username}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-500">Anonymous</span>
                  )}

                  <div className="flex items-center space-x-3 text-gray-500 text-[11px]">
                    <span className="flex items-center space-x-1" title={`${s.forksCount || 0} forks`}>
                      <FontAwesomeIcon icon={faCodeFork} className="text-[9px]" />
                      <span>{s.forksCount || 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default ExplorePage;
