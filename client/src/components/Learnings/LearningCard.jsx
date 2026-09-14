import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faGlobe,
  faLink,
  faTag,
  faEye,
  faClock,
  faPenToSquare,
  faTrash,
  faArrowUpRightFromSquare,
  faCopy,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import UserAvatar from "../common/UserAvatar";
import Tooltip from "../ui/tooltip";

function cleanExcerpt(content = "") {
  return (
    content
      .replace(/#+\s+/g, "")
      .replace(/```[\s\S]*?```/g, "[Code]")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_~>]/g, "")
      .trim()
      .slice(0, 130) + (content.length > 130 ? "..." : "")
  );
}

function getReadingTime(content = "") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 180));
  return `${mins} min read`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LearningCard({
  learning,
  onDelete,
  onTagClick,
  showAuthor = true,
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const {
    learningId,
    title,
    content,
    tags = [],
    relatedProblems = [],
    visibility = "private",
    viewsCount = 0,
    updatedAt,
    author,
    isAuthor,
  } = learning;

  const excerpt = cleanExcerpt(content);
  const readingTime = getReadingTime(content);

  const handleCopyLink = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}/learnings/${learningId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleCardClick = () => {
    navigate(`/learnings/${learningId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between bg-[#1b1b1b] hover:bg-[#202020] border border-[#2d2d2d] hover:border-[#404040] rounded-xl p-5 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md"
    >
      <div>
        {/* Top bar: Visibility Badge & Stats/Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            {visibility === "private" && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/40 text-amber-300 border border-amber-800/40">
                <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                <span>Private</span>
              </span>
            )}
            {visibility === "unlisted" && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-950/40 text-sky-300 border border-sky-800/40">
                <FontAwesomeIcon icon={faLink} className="text-[10px]" />
                <span>Unlisted</span>
              </span>
            )}
            {visibility === "public" && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                <FontAwesomeIcon icon={faGlobe} className="text-[10px]" />
                <span>Public</span>
              </span>
            )}

            {relatedProblems.length > 0 && (
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-400 bg-[#252525]">
                <span>{relatedProblems.length} {relatedProblems.length === 1 ? "problem" : "problems"}</span>
              </span>
            )}
          </div>

          {/* Quick Actions (Author only or Share) */}
          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            <Tooltip content={copied ? "Link Copied!" : "Copy Share Link"} side="top">
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#2b2b2b] transition-colors"
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={`text-xs ${copied ? "text-[#2cbb5d]" : ""}`} />
              </button>
            </Tooltip>

            {isAuthor && (
              <>
                <Tooltip content="Edit note" side="top">
                  <Link
                    to={`/learnings/${learningId}/edit`}
                    className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#2b2b2b] transition-colors"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                  </Link>
                </Tooltip>

                {onDelete && (
                  <Tooltip content="Delete note" side="top">
                    <button
                      type="button"
                      onClick={() => onDelete(learning)}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-[#2b2b2b] transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        </div>

        {/* Note Title */}
        <h3 className="text-base font-bold text-white group-hover:text-[#ffa116] transition-colors line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Content Excerpt */}
        <p className="mt-2 text-xs text-gray-400 leading-relaxed line-clamp-3">
          {excerpt}
        </p>
      </div>

      {/* Footer Area: Tags & Metadata */}
      <div className="mt-4 pt-3 border-t border-[#262626] space-y-3">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick && onTagClick(tag);
                }}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono text-gray-300 bg-[#262626] hover:bg-[#333333] hover:text-white border border-[#333333] transition-colors"
              >
                <FontAwesomeIcon icon={faTag} className="text-[8px] text-gray-500" />
                <span>{tag}</span>
              </button>
            ))}
            {tags.length > 4 && (
              <span className="text-[10px] font-mono text-gray-500 self-center">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Meta row: Author / Time / Views */}
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center space-x-2 truncate">
            {showAuthor && author && (
              <div className="flex items-center space-x-1.5 truncate">
                <UserAvatar avatar={author.avatar} name={author.name} username={author.username} size="xs" />
                <span className="text-gray-400 truncate hover:text-white transition-colors">
                  @{author.username}
                </span>
              </div>
            )}
            {!showAuthor && (
              <span className="flex items-center space-x-1 text-gray-400">
                <FontAwesomeIcon icon={faClock} className="text-[9px]" />
                <span>{formatDate(updatedAt)}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2.5 flex-shrink-0 text-[11px]">
            <span>{readingTime}</span>
            {viewsCount > 0 && (
              <span className="flex items-center space-x-1 text-gray-400">
                <FontAwesomeIcon icon={faEye} className="text-[9px]" />
                <span>{viewsCount}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
