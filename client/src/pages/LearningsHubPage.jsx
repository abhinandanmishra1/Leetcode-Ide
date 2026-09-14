import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faPlus,
  faBookOpen,
  faCompass,
  faLock,
  faGlobe,
  faLink,
  faTag,
  faFilter,
  faUser,
  faRotateLeft,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { CodePadBrand } from "../components/Brand/CodePadLogo";
import LearningCard from "../components/Learnings/LearningCard";
import DeleteConfirmModal from "../components/common/DeleteConfirmModal";
import AuthModal from "../components/Auth/AuthModal";
import UserAvatar from "../components/common/UserAvatar";
import { learningsApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LearningsHubPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();

  // Active Tab: "mine" or "explore"
  const activeTab = searchParams.get("tab") || (user ? "mine" : "explore");
  const selectedTag = searchParams.get("tag") || "";
  const selectedVisibility = searchParams.get("visibility") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // State
  const [learnings, setLearnings] = useState([]);
  const [counts, setCounts] = useState({ all: 0, private: 0, unlisted: 0, public: 0 });
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync tab with URL
  const handleTabChange = (tabName) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tabName);
    setSearchParams(nextParams);
  };

  const handleTagClick = (tag) => {
    const nextParams = new URLSearchParams(searchParams);
    if (selectedTag === tag) {
      nextParams.delete("tag");
    } else {
      nextParams.set("tag", tag);
    }
    setSearchParams(nextParams);
  };

  const handleVisibilityChange = (vis) => {
    const nextParams = new URLSearchParams(searchParams);
    if (vis === "all") {
      nextParams.delete("visibility");
    } else {
      nextParams.set("visibility", vis);
    }
    setSearchParams(nextParams);
  };

  // Fetch data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "mine") {
        if (!user) {
          setLearnings([]);
          setLoading(false);
          return;
        }
        const params = {
          sort: sortBy,
          limit: 30,
        };
        if (selectedVisibility !== "all") params.visibility = selectedVisibility;
        if (selectedTag) params.tag = selectedTag;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

        const res = await learningsApi.getMyLearnings(params);
        setLearnings(res.learnings || []);
        if (res.counts) setCounts(res.counts);
      } else {
        const params = {
          sort: sortBy,
          limit: 30,
        };
        if (selectedTag) params.tag = selectedTag;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

        const res = await learningsApi.getPublic(params);
        setLearnings(res.learnings || []);
      }
    } catch (err) {
      console.error("Failed to fetch learnings:", err);
      setLearnings([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, user, selectedVisibility, selectedTag, debouncedSearch, sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Note Deletion
  const confirmDelete = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    try {
      await learningsApi.delete(noteToDelete.learningId);
      setLearnings((prev) => prev.filter((item) => item.learningId !== noteToDelete.learningId));
      setNoteToDelete(null);
      toast.success("Learning note deleted");
      loadData();
    } catch (err) {
      if (err.response?.status === 404) {
        setLearnings((prev) => prev.filter((item) => item.learningId !== noteToDelete.learningId));
        setNoteToDelete(null);
        toast.info("This note was already removed.");
      } else {
        toast.error("Failed to delete note: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-gray-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#1e1e1e]/90 backdrop-blur-md border-b border-[#2d2d2d] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-shrink-0">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <CodePadBrand />
            </Link>
            <nav className="hidden sm:flex items-center space-x-1 pl-3 border-l border-[#333333] text-xs">
              <Link
                to="/ide"
                className="px-2.5 py-1 text-gray-400 hover:text-white rounded-md hover:bg-[#2c2c2c] transition-colors"
              >
                IDE
              </Link>
              <Link
                to="/learnings"
                className="px-2.5 py-1 text-[#ffa116] font-semibold bg-[#2a2a2a] rounded-md transition-colors"
              >
                Learnings
              </Link>
              <Link
                to="/explore"
                className="px-2.5 py-1 text-gray-400 hover:text-white rounded-md hover:bg-[#2c2c2c] transition-colors"
              >
                Explore
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  setIsAuthModalOpen(true);
                } else {
                  navigate("/learnings/new");
                }
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#ffa116] hover:bg-[#ff9400] text-black rounded-lg transition-all shadow active:scale-95 cursor-pointer"
            >
              <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
              <span>New Learning</span>
            </button>

            {user ? (
              <Link
                to={`/u/${user.username}`}
                className="flex items-center space-x-1.5 p-1 rounded-full hover:ring-2 hover:ring-[#ffa116] transition-all"
              >
                <UserAvatar avatar={user.avatar} name={user.name} username={user.username} size="sm" />
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
        <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl p-6 sm:p-8 space-y-3 relative overflow-hidden">
          <div className="flex items-center space-x-2 text-[#ffa116] text-xs font-bold uppercase tracking-wider">
            <FontAwesomeIcon icon={faBookOpen} />
            <span>Developer Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            CodePad Learnings
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Create, structure, and master algorithmic patterns, problem insights, code snippets, and postmortems directly inside your IDE instead of scattered Gists.
          </p>

          {/* Search Input Bar */}
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
                placeholder="Search notes by title or keywords (e.g. Sliding Window, DP, Trees)..."
                className="w-full pl-9 pr-8 py-2 bg-[#141414] border border-[#333333] focus:border-[#ffa116] rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d2d2d] pb-4">
          {/* Main Tabs */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleTabChange("mine")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "mine"
                  ? "bg-[#ffa116] text-black shadow"
                  : "bg-[#1f1f1f] text-gray-300 hover:bg-[#292929] hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faBookOpen} className="text-xs" />
              <span>My Notes</span>
              {user && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === "mine" ? "bg-black/20 text-black" : "bg-[#2c2c2c] text-gray-300"}`}>
                  {counts.all}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("explore")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "explore"
                  ? "bg-[#ffa116] text-black shadow"
                  : "bg-[#1f1f1f] text-gray-300 hover:bg-[#292929] hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faCompass} className="text-xs" />
              <span>Community Explore</span>
            </button>
          </div>

          {/* Right Sub-filters (Visibility for 'mine', Sort dropdown) */}
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "mine" && user && (
              <div className="flex items-center space-x-1 bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleVisibilityChange("all")}
                  className={`px-2 py-1 rounded transition-colors ${
                    selectedVisibility === "all" ? "bg-[#333333] text-white font-semibold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  All ({counts.all})
                </button>
                <button
                  type="button"
                  onClick={() => handleVisibilityChange("private")}
                  className={`px-2 py-1 rounded transition-colors flex items-center space-x-1 ${
                    selectedVisibility === "private" ? "bg-amber-950/60 text-amber-300 font-semibold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faLock} className="text-[9px]" />
                  <span>Private ({counts.private})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVisibilityChange("unlisted")}
                  className={`px-2 py-1 rounded transition-colors flex items-center space-x-1 ${
                    selectedVisibility === "unlisted" ? "bg-sky-950/60 text-sky-300 font-semibold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faLink} className="text-[9px]" />
                  <span>Unlisted ({counts.unlisted})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVisibilityChange("public")}
                  className={`px-2 py-1 rounded transition-colors flex items-center space-x-1 ${
                    selectedVisibility === "public" ? "bg-emerald-950/60 text-emerald-300 font-semibold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faGlobe} className="text-[9px]" />
                  <span>Public ({counts.public})</span>
                </button>
              </div>
            )}

            {/* Sort selection */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg text-xs text-gray-300 outline-none cursor-pointer"
            >
              <option value="latest">Recently Created</option>
              <option value="popular">Most Viewed</option>
              {activeTab === "mine" && <option value="title">Title (A-Z)</option>}
            </select>
          </div>
        </div>

        {/* Selected Tag Indicator */}
        {selectedTag && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-400">Filtering by tag:</span>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#2a2a2a] text-[#ffa116] border border-[#3a3a3a] font-mono">
              <FontAwesomeIcon icon={faTag} className="text-[10px]" />
              <span>#{selectedTag}</span>
              <button
                type="button"
                onClick={() => handleTagClick(selectedTag)}
                className="hover:text-white ml-1 text-xs"
              >
                ✕
              </button>
            </span>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-gray-400">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-[#ffa116]" />
            <p className="text-xs">Loading learnings...</p>
          </div>
        ) : activeTab === "mine" && !user ? (
          /* Sign-in Callout for Guest on My Notes */
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4 my-8">
            <div className="w-12 h-12 rounded-full bg-[#ffa116]/10 text-[#ffa116] flex items-center justify-center mx-auto text-xl">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <h2 className="text-lg font-bold text-white">Sign In to View Your Notebook</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your personal library stores all your private DSA patterns, problem insights, and code templates. Sign in with Google to start saving.
            </p>
            <div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2 text-xs font-bold bg-[#ffa116] hover:bg-[#ff9400] text-black rounded-lg transition-colors shadow"
              >
                Sign In with Google
              </button>
            </div>
          </div>
        ) : learnings.length === 0 ? (
          /* Empty State */
          <div className="bg-[#181818] border border-[#292929] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 my-8">
            <div className="w-12 h-12 rounded-full bg-[#262626] text-gray-400 flex items-center justify-center mx-auto text-lg">
              <FontAwesomeIcon icon={faBookOpen} />
            </div>
            <h3 className="text-base font-bold text-white">
              {activeTab === "mine" ? "No learnings created yet" : "No public learnings found"}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {activeTab === "mine"
                ? "Start building your personal engineering cheat sheets, DSA patterns, and postmortems."
                : "No community notes matched your search or tag filters. Be the first to share one!"}
            </p>
            {activeTab === "mine" && (
              <button
                type="button"
                onClick={() => navigate("/learnings/new")}
                className="px-4 py-2 text-xs font-semibold bg-[#ffa116] hover:bg-[#ff9400] text-black rounded-lg transition-colors shadow"
              >
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          /* Grid of Learnings */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {learnings.map((learning) => (
              <LearningCard
                key={learning.learningId}
                learning={learning}
                showAuthor={activeTab === "explore"}
                onTagClick={handleTagClick}
                onDelete={(item) => setNoteToDelete(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <DeleteConfirmModal
          isOpen={!!noteToDelete}
          title="Delete Learning Note"
          message={`Are you sure you want to delete "${noteToDelete.title}"? This action cannot be undone.`}
          confirmLabel={isDeleting ? "Deleting..." : "Delete Note"}
          onConfirm={confirmDelete}
          onCancel={() => setNoteToDelete(null)}
          disabled={isDeleting}
        />
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
