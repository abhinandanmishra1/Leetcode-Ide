import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    const res = await loginWithGoogle(credentialResponse.credential);
    if (res.success) {
      if (onSuccess) onSuccess(res.user);
      onClose();
    } else {
      setError(res.error || "Google Sign-In failed.");
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In prompt was closed or failed to initialize.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] border border-[#3e3e3e] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2d2d] bg-[#252525]">
          <span className="text-base font-bold text-white tracking-wide">
            Sign In to <span className="text-[#ffa116]">CodePad</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md"
          >
            <FontAwesomeIcon icon={faTimes} className="text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-950/70 border border-red-800 text-red-300 text-xs px-3.5 py-2.5 rounded-lg flex items-center space-x-2">
              <FontAwesomeIcon icon={faCircleExclamation} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Login Component */}
          <div className="flex justify-center py-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              text="continue_with"
              size="large"
              width="260"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
