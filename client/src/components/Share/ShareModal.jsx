import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCopy,
  faCheck,
  faShareNodes,
  faMessage,
  faLock,
  faLink,
  faGlobe,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faWhatsapp,
  faLinkedin,
  faTelegram,
  faReddit,
} from "@fortawesome/free-brands-svg-icons";
import Tooltip from "../common/Tooltip";
import { snippetsApi } from "../../api";

const ShareModal = ({
  isOpen,
  onClose,
  snippetId,
  title = "CodePad Snippet",
  languageName = "Code",
  initialVisibility = "unlisted",
  onVisibilityChange,
  isAuthor = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const [visibility, setVisibility] = useState(initialVisibility || "unlisted");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisibility(initialVisibility || "unlisted");
    }
  }, [isOpen, initialVisibility]);

  if (!isOpen || !snippetId) return null;

  const handleSetVisibility = async (newVis) => {
    if (!isAuthor) return;
    setVisibility(newVis);
    setIsUpdating(true);
    try {
      await snippetsApi.update(snippetId, {
        visibility: newVis,
        isPublic: newVis === "public",
      });
      if (onVisibilityChange) {
        onVisibilityChange(newVis);
      }
    } catch (err) {
      console.error("Failed to update snippet visibility:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const shareUrl = `${window.location.origin}/s/${snippetId}`;
  const shareMessage = `🚀 Check out my solution for "${title}" (${languageName}) on CodePad!\n\n💻 Run and inspect it live in the browser:\n${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(shareMessage);
    setMessageCopied(true);
    setTimeout(() => setMessageCopied(false), 2500);
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check out my solution for "${title}" (${languageName}) on CodePad! 💻 Run and test it live:`
  )}&url=${encodeURIComponent(shareUrl)}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    shareMessage
  )}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(
    `🚀 Check out my solution for "${title}" (${languageName}) on CodePad! Run and inspect it live:`
  )}`;

  const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(
    shareUrl
  )}&title=${encodeURIComponent(
    `Check out my solution for "${title}" (${languageName}) on CodePad`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] border border-[#3e3e3e] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2d2d] bg-[#252525]">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faShareNodes} className="text-[#ffa116]" />
            <span className="text-base font-bold text-white">Share Code Snippet</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md"
          >
            <FontAwesomeIcon icon={faTimes} className="text-sm" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Access & Privacy Controls */}
          <div className="bg-[#181818] border border-[#2d2d2d] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-gray-200">Access & Privacy</span>
                {isUpdating && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs text-[#ffa116]" />}
              </div>

              {/* Make Private Toggle */}
              {isAuthor && (
                <Tooltip
                  content={
                    visibility === "private"
                      ? "Currently Private: Only you can access this snippet. URL sharing is disabled."
                      : "Make Private: Only you can view or run this code. Other users opening the link will be denied access."
                  }
                  side="top"
                >
                  <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
                    <span className="text-xs flex items-center space-x-1">
                      <FontAwesomeIcon
                        icon={faLock}
                        className={visibility === "private" ? "text-red-400" : "text-gray-500"}
                      />
                      <span className={visibility === "private" ? "text-red-400 font-semibold" : "text-gray-400"}>
                        Make Private
                      </span>
                    </span>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={visibility === "private"}
                        onChange={(e) => handleSetVisibility(e.target.checked ? "private" : "unlisted")}
                      />
                      <div
                        className={`w-9 h-5 rounded-full transition-colors ${
                          visibility === "private" ? "bg-red-500" : "bg-[#333333]"
                        }`}
                      />
                      <div
                        className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          visibility === "private" ? "translate-x-4" : ""
                        }`}
                      />
                    </div>
                  </label>
                </Tooltip>
              )}
            </div>

            {/* Access Level Selector (when not private) */}
            {visibility !== "private" ? (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] text-gray-400">Choose who can access this snippet:</div>
                <div className="grid grid-cols-2 gap-2">
                  <Tooltip
                    content="Default: Anyone with this direct URL can view and run your code. It will NOT appear on the public Explore page."
                    side="top"
                  >
                    <button
                      type="button"
                      disabled={!isAuthor}
                      onClick={() => handleSetVisibility("unlisted")}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left w-full ${
                        visibility === "unlisted"
                          ? "bg-[#ffa116]/10 border-[#ffa116] text-[#ffa116] font-semibold"
                          : "bg-[#222222] border-[#333333] text-gray-300 hover:text-white"
                      }`}
                    >
                      <FontAwesomeIcon icon={faLink} className="text-[11px]" />
                      <div>
                        <div>Anyone with URL</div>
                        <div className="text-[10px] opacity-75 font-normal">Link only (Default)</div>
                      </div>
                    </button>
                  </Tooltip>

                  <Tooltip
                    content="Show for All: Visible to everyone on the Community Explore page, search, and your public profile."
                    side="top"
                  >
                    <button
                      type="button"
                      disabled={!isAuthor}
                      onClick={() => handleSetVisibility("public")}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left w-full ${
                        visibility === "public"
                          ? "bg-[#2cbb5d]/10 border-[#2cbb5d] text-[#2cbb5d] font-semibold"
                          : "bg-[#222222] border-[#333333] text-gray-300 hover:text-white"
                      }`}
                    >
                      <FontAwesomeIcon icon={faGlobe} className="text-[11px]" />
                      <div>
                        <div>Show for All</div>
                        <div className="text-[10px] opacity-75 font-normal">Public on Explore</div>
                      </div>
                    </button>
                  </Tooltip>
                </div>

                {isAuthor && (
                  <div className="flex items-center justify-between p-2.5 bg-red-950/20 border border-red-900/30 rounded-lg mt-2">
                    <div className="text-[11px] text-gray-300">
                      <span className="text-white font-semibold">Want to revoke access?</span>
                      <span className="block text-gray-400 text-[10px]">Unsharing makes this snippet private and stops anyone else from opening this link.</span>
                    </div>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleSetVisibility("private")}
                      className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 transition-colors flex items-center space-x-1.5 flex-shrink-0 ml-2 active:scale-95"
                    >
                      <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                      <span>Unshare Code</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300 flex items-start space-x-2">
                  <FontAwesomeIcon icon={faLock} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white">This snippet is currently Unshared (Private).</strong> Only you can view or run it. Anyone else visiting this link will be blocked with Access Forbidden.
                  </div>
                </div>

                {isAuthor && (
                  <div className="flex items-center justify-between p-2.5 bg-[#222222] border border-[#383838] rounded-lg">
                    <div className="text-[11px] text-gray-300">
                      <span className="text-white font-semibold">Ready to re-share?</span>
                      <span className="block text-gray-400 text-[10px]">Enable link sharing so others can view and test your solution.</span>
                    </div>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleSetVisibility("unlisted")}
                      className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#ffa116] hover:bg-[#e08d0e] text-black transition-colors flex items-center space-x-1.5 flex-shrink-0 ml-2 active:scale-95 shadow"
                    >
                      <FontAwesomeIcon icon={faLink} className="text-[10px]" />
                      <span>Re-share Link</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Direct Link */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Shareable Public Link{" "}
              {visibility === "private" && (
                <span className="text-red-400 font-normal normal-case">(Inactive - Private)</span>
              )}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[#141414] border border-[#383838] rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-[#ffa116]"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  copied
                    ? "bg-[#2cbb5d] text-white"
                    : "bg-[#ffa116] hover:bg-[#e08d0e] text-black"
                }`}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              {visibility === "private"
                ? "🔒 Private mode active: other users visiting this URL will be blocked."
                : visibility === "public"
                ? "🌐 Public: Anyone with this link can view & run, and it is listed on Explore."
                : "🔗 Link-only: Anyone with this link can view & run in their browser."}
            </p>
          </div>

          {/* Social Buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Share On Social
            </label>
            {visibility === "private" ? (
              <div className="p-3 rounded-lg bg-[#181818] border border-[#2d2d2d] text-xs text-gray-500 italic">
                Social sharing is disabled while snippet is private. Change access above to share.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 py-2 px-3 bg-[#262626] hover:bg-[#333333] border border-[#3e3e3e] rounded-lg text-xs text-gray-200 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTwitter} className="text-[#1da1f2]" />
                  <span>Twitter / X</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 py-2 px-3 bg-[#262626] hover:bg-[#333333] border border-[#3e3e3e] rounded-lg text-xs text-gray-200 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="text-[#25d366]" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 py-2 px-3 bg-[#262626] hover:bg-[#333333] border border-[#3e3e3e] rounded-lg text-xs text-gray-200 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTelegram} className="text-[#229ed9]" />
                  <span>Telegram</span>
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 py-2 px-3 bg-[#262626] hover:bg-[#333333] border border-[#3e3e3e] rounded-lg text-xs text-gray-200 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faLinkedin} className="text-[#0a66c2]" />
                  <span>LinkedIn</span>
                </a>
              </div>
            )}
          </div>

          {/* Formatted Share Message for Chats & Communities */}
          {visibility !== "private" && (
            <div className="border-t border-[#2d2d2d] pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <FontAwesomeIcon icon={faMessage} className="text-[#ffa116]" />
                  <span>Share Message</span>
                </label>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-xs text-[#ffa116] hover:underline font-semibold flex items-center space-x-1"
                >
                  <FontAwesomeIcon icon={messageCopied ? faCheck : faCopy} className="text-[11px]" />
                  <span>{messageCopied ? "Copied Message!" : "Copy Message"}</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={3}
                value={shareMessage}
                className="w-full bg-[#141414] border border-[#383838] rounded-lg p-2.5 text-xs font-sans text-gray-300 focus:outline-none resize-none leading-relaxed"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Formatted message with direct link and call-to-action ready to paste into Discord, Slack, Telegram, or group chats.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
