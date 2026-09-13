import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeFork, faLock } from "@fortawesome/free-solid-svg-icons";
import UserAvatar from "../common/UserAvatar";
import Tooltip from "../ui/tooltip";

const SharedBanner = ({ snippet, onFork, isForking }) => {
  if (!snippet) return null;

  const author = snippet.author;

  return (
    <div className="bg-[#242424] border-b border-[#383838] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Left: Author Info & Snippet Details */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="flex items-center space-x-2.5">
          {author?.username ? (
            <Link
              to={`/u/${author.username}`}
              className="hover:opacity-80 transition-opacity flex-shrink-0"
              title={`View @${author.username}'s profile`}
            >
              <UserAvatar
                avatar={author?.avatar}
                name={author?.name}
                username={author?.username}
                size="md"
              />
            </Link>
          ) : (
            <UserAvatar
              avatar={author?.avatar}
              name={author?.name}
              username={author?.username}
              size="md"
            />
          )}

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="font-semibold text-white truncate text-sm">
                {snippet.title}
              </span>
              <span className="bg-[#1c2e22] text-[#2cbb5d] border border-[#2cbb5d]/40 px-2 py-0.5 rounded text-[10px] font-mono">
                {snippet.languageName}
              </span>
            </div>
            <div className="text-gray-400 text-[11px] flex items-center space-x-2 mt-0.5">
              <span>by</span>
              {author?.username ? (
                <Link
                  to={`/u/${author.username}`}
                  className="text-[#ffa116] hover:underline font-medium"
                >
                  @{author.username}
                </Link>
              ) : (
                <span className="text-gray-300">Anonymous Coder</span>
              )}
              <span>•</span>
              <span className="flex items-center space-x-1 text-gray-400" title={`${snippet.forksCount || 0} forks`}>
                <FontAwesomeIcon icon={faCodeFork} className="text-[9px]" />
                <span>{snippet.forksCount || 0} {snippet.forksCount === 1 ? "fork" : "forks"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Read-Only Badge & Fork Action Button */}
      <div className="flex items-center space-x-2.5">
        <div className="hidden sm:flex items-center space-x-1 text-amber-400/90 bg-amber-950/40 border border-amber-800/50 px-2.5 py-1 rounded text-[11px]">
          <FontAwesomeIcon icon={faLock} className="text-[9px]" />
          <span>Read-Only Preview</span>
        </div>

        <Tooltip content="Clone this code to your editor to modify & run" side="bottom">
          <button
            type="button"
            onClick={onFork}
            disabled={isForking}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#ffa116] hover:bg-[#e08d0e] text-black font-semibold rounded-md shadow transition-all active:scale-95 disabled:opacity-50 text-xs"
          >
            <FontAwesomeIcon icon={faCodeFork} className="text-xs" />
            <span>{isForking ? "Forking..." : "Fork to My Editor"}</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default SharedBanner;
