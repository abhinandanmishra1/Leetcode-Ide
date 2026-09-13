import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

/**
 * Reusable UserAvatar component that:
 * 1. Sets referrerPolicy="no-referrer" to guarantee Google user profile photos
 *    (e.g., from lh3.googleusercontent.com) load cleanly without 403 Forbidden.
 * 2. Gracefully falls back to stylized user initials or a user icon if an image
 *    fails to load, preventing broken image document icons and cut-off alt text.
 */
export default function UserAvatar({
  avatar,
  name,
  username,
  size = "md",
  className = "",
}) {
  const [imgFailed, setImgFailed] = useState(false);

  // Pre-configured sizing classes
  const sizeClasses = {
    xs: "w-5 h-5 text-[10px]",
    sm: "w-6 h-6 text-xs",
    md: "w-7 h-7 text-xs",
    lg: "w-10 h-10 text-sm",
    xl: "w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl font-bold",
  };

  const appliedSize = sizeClasses[size] || size;
  const initial = (name || username || "").trim().charAt(0).toUpperCase();

  if (avatar && !imgFailed) {
    return (
      <img
        src={avatar}
        alt=""
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setImgFailed(true)}
        className={`${appliedSize} rounded-full object-cover border border-gray-600/60 flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${appliedSize} rounded-full bg-[#2a2a2a] text-[#ffa116] border border-gray-600/60 flex items-center justify-center font-bold select-none flex-shrink-0 ${className}`}
      title={name || username || "User"}
    >
      {initial ? (
        <span>{initial}</span>
      ) : (
        <FontAwesomeIcon icon={faUser} className="text-[10px]" />
      )}
    </div>
  );
}
