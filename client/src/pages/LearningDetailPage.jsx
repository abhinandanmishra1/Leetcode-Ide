import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faLock,
  faLink,
  faGlobe,
  faTag,
  faEye,
  faClock,
  faPenToSquare,
  faTrash,
  faCopy,
  faCheck,
  faArrowUpRightFromSquare,
  faSpinner,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import MarkdownRenderer from "../components/Learnings/MarkdownRenderer";
import UserAvatar from "../components/common/UserAvatar";
import DeleteConfirmModal from "../components/common/DeleteConfirmModal";
import { learningsApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getReadingTime(content = "") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 180));
  return `${mins} min read`;
}

export default function LearningDetailPage() {
  const { learningId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [learning, setLearning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    learningsApi
      .getById(learningId)
      .then((data) => {
        setLearning(data);
      })
      .catch((err) => {
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.message;
        setError({ status, msg });
      })
      .finally(() => setLoading(false));
  }, [learningId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await learningsApi.delete(learningId);
      toast.success("Learning note deleted");
      navigate("/learnings?tab=mine", { replace: true });
    } catch (err) {
      if (err.response?.status === 404) {
        toast.info("This note was already removed.");
        navigate("/learnings?tab=mine", { replace: true });
      } else {
        toast.error("Failed to delete note: " + (err.response?.data?.message || err.message));
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center text-gray-400">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-[#ffa116]" />
      </div>
    );
  }

  // Handle Privacy / Forbidden Barrier
  if (error?.status === 403) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center p-6 text-center">
        <div className="bg-[#1c1c1c] border border-amber-900/50 rounded-2xl p-8 sm:p-12 max-w-md space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-amber-950/60 text-amber-400 flex items-center justify-center mx-auto text-2xl border border-amber-800/40">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <h2 className="text-xl font-bold text-white">Private Learning Note</h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            This learning note is marked as private by the author. Only the owner has permission to view this content.
          </p>
          <div className="pt-2">
            <Link
              to="/learnings"
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-[#2a2a2a] hover:bg-[#383838] text-white rounded-lg transition-colors border border-[#3e3e3e]"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              <span>Back to Learnings</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Not Found
  if (error || !learning) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center p-6 text-center">
        <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl p-8 sm:p-12 max-w-md space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#262626] text-gray-400 flex items-center justify-center mx-auto text-2xl">
            <FontAwesomeIcon icon={faShieldHalved} />
          </div>
          <h2 className="text-xl font-bold text-white">Learning Note Not Found</h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            The note you are looking for does not exist or has been removed.
          </p>
          <div className="pt-2">
            <Link
              to="/learnings"
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-[#2a2a2a] hover:bg-[#383838] text-white rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              <span>Explore Learnings</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    title,
    content,
    tags = [],
    relatedProblems = [],
    visibility,
    viewsCount,
    updatedAt,
    createdAt,
    author,
    isAuthor,
  } = learning;

  const readingTime = getReadingTime(content);

  return (
    <div className="min-h-screen bg-[#141414] text-gray-200 selection:bg-[#ffa116] selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#1e1e1e]/95 backdrop-blur-md border-b border-[#2d2d2d] px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 truncate">
            <Link
              to="/learnings"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white rounded-lg hover:bg-[#2c2c2c] transition-colors flex-shrink-0"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              <span>Learnings</span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-xs font-medium text-gray-400 truncate">{title}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#282828] hover:bg-[#333333] text-gray-200 hover:text-white border border-[#3e3e3e] rounded-lg transition-colors shadow cursor-pointer"
            >
              <FontAwesomeIcon
                icon={copied ? faCheck : faCopy}
                className={`text-xs ${copied ? "text-[#2cbb5d]" : "text-gray-400"}`}
              />
              <span>{copied ? "Link Copied!" : "Share"}</span>
            </button>

            {isAuthor && (
              <>
                <Link
                  to={`/learnings/${learningId}/edit`}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#282828] hover:bg-[#333333] text-gray-200 hover:text-white border border-[#3e3e3e] rounded-lg transition-colors shadow"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="text-xs text-[#ffa116]" />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#282828] hover:bg-rose-950/50 text-gray-400 hover:text-rose-400 border border-[#3e3e3e] hover:border-rose-900/50 rounded-lg transition-colors shadow cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Reader Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        {/* Note Header Metadata */}
        <div className="space-y-4 border-b border-[#292929] pb-6">
          {/* Visibility badge & reading time */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center space-x-2">
              {visibility === "private" && (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-800/50">
                  <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                  <span>Private Note (Only You)</span>
                </span>
              )}
              {visibility === "unlisted" && (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-sky-950/50 text-sky-300 border border-sky-800/50">
                  <FontAwesomeIcon icon={faLink} className="text-[10px]" />
                  <span>Unlisted Note (Direct Link)</span>
                </span>
              )}
              {visibility === "public" && (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-800/50">
                  <FontAwesomeIcon icon={faGlobe} className="text-[10px]" />
                  <span>Public Note</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                <span>{readingTime}</span>
              </span>
              {viewsCount > 0 && (
                <span className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                  <span>{viewsCount} views</span>
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h1>

          {/* Author info & timestamps */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            {author && (
              <Link
                to={`/u/${author.username}`}
                className="flex items-center space-x-2.5 group hover:text-white transition-colors"
              >
                <UserAvatar avatar={author.avatar} name={author.name} username={author.username} size="sm" />
                <div>
                  <span className="font-semibold text-gray-200 group-hover:text-[#ffa116] transition-colors">
                    {author.name || author.username}
                  </span>
                  <span className="text-gray-500 ml-1.5">@{author.username}</span>
                </div>
              </Link>
            )}
            <div className="text-[11px] text-gray-500">
              Updated on {formatDate(updatedAt || createdAt)}
            </div>
          </div>
        </div>

        {/* Related Problems Card (if attached) */}
        {relatedProblems.length > 0 && (
          <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <span>Related LeetCode Problems</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#282828] text-gray-400">
                {relatedProblems.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {relatedProblems.map((p, idx) => (
                <a
                  key={idx}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-[#161616] hover:bg-[#222222] border border-[#2b2b2b] hover:border-[#3d3d3d] rounded-xl px-3.5 py-2.5 transition-colors group"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        p.difficulty === "Easy"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                          : p.difficulty === "Hard"
                          ? "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                          : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                      }`}
                    >
                      {p.difficulty}
                    </span>
                    {p.problemNumber && (
                      <span className="font-mono text-gray-400 text-xs">#{p.problemNumber}</span>
                    )}
                    <span className="text-xs font-medium text-gray-200 group-hover:text-white truncate">
                      {p.title}
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                    className="text-[10px] text-gray-500 group-hover:text-gray-300 ml-2 flex-shrink-0"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Note Content (Rendered Markdown with Interactive Code Blocks) */}
        <div className="bg-[#181818] border border-[#282828] rounded-2xl p-6 sm:p-10 shadow-sm">
          <MarkdownRenderer content={content} />
        </div>

        {/* Tags List */}
        {tags.length > 0 && (
          <div className="pt-4 border-t border-[#262626] flex items-center space-x-2 flex-wrap gap-2">
            <span className="text-xs text-gray-500 flex items-center space-x-1">
              <FontAwesomeIcon icon={faTag} className="text-[10px]" />
              <span>Tags:</span>
            </span>
            {tags.map((tag) => (
              <Link
                key={tag}
                to={`/learnings?tag=${tag}`}
                className="px-2.5 py-1 rounded-md text-xs font-mono text-[#ffa116] bg-[#222222] hover:bg-[#2b2b2b] border border-[#333333] transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Learning Note"
        message={`Are you sure you want to delete "${title}"? This cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete Note"}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        disabled={isDeleting}
      />
    </div>
  );
}
