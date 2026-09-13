import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCopy,
  faCheck,
  faShareNodes,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faWhatsapp,
  faLinkedin,
  faTelegram,
  faReddit,
} from "@fortawesome/free-brands-svg-icons";

const ShareModal = ({
  isOpen,
  onClose,
  snippetId,
  title = "CodePad Snippet",
  languageName = "Code",
}) => {
  const [copied, setCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);

  if (!isOpen || !snippetId) return null;

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
          {/* Direct Link */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Shareable Public Link
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
              Anyone with this link can view the code, run it live in the sandbox, or fork it to their workspace.
            </p>
          </div>

          {/* Social Buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Share On Social
            </label>
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
          </div>

          {/* Formatted Share Message for Chats & Communities */}
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
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
