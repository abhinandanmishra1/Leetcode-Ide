import React, { createContext, useContext, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur = 5000) => addToast(msg, "error", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
    warning: (msg, dur = 5000) => addToast(msg, "warning", dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-[99999] flex flex-col space-y-2.5 pointer-events-none max-w-sm w-full px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md text-xs transition-all duration-200 animate-in slide-in-from-bottom-3 select-none ${
              t.type === "error"
                ? "bg-[#221010]/95 border-red-500/40 text-red-200"
                : t.type === "success"
                ? "bg-[#0d2215]/95 border-[#2cbb5d]/40 text-emerald-200"
                : t.type === "warning"
                ? "bg-[#281b07]/95 border-amber-500/40 text-amber-200"
                : "bg-[#1e1e1e]/95 border-[#383838] text-gray-200"
            }`}
          >
            <div className="mt-0.5 shrink-0 text-sm">
              {t.type === "error" && (
                <FontAwesomeIcon icon={faCircleExclamation} className="text-red-400" />
              )}
              {t.type === "success" && (
                <FontAwesomeIcon icon={faCheckCircle} className="text-[#2cbb5d]" />
              )}
              {t.type === "warning" && (
                <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-400" />
              )}
              {t.type === "info" && (
                <FontAwesomeIcon icon={faCircleInfo} className="text-[#00b4d8]" />
              )}
            </div>
            <div className="flex-1 leading-relaxed font-medium">{t.message}</div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-white p-0.5 shrink-0 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: (msg) => console.log("[Success]", msg),
      error: (msg) => console.error("[Error]", msg),
      info: (msg) => console.log("[Info]", msg),
      warning: (msg) => console.warn("[Warning]", msg),
    };
  }
  return ctx;
}

export default ToastContext;
