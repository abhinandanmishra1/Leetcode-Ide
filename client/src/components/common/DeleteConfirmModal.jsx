import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTimes, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Saved Code",
  itemName = "",
  message = "",
  confirmText = "Delete",
  confirmButtonClass = "bg-red-600 hover:bg-red-700 text-white",
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#242424] border border-[#3e3e3e] rounded-xl w-full max-w-md shadow-2xl overflow-hidden font-sans text-xs text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-[#333333]">
          <div className="flex items-center space-x-2 text-sm font-semibold text-white">
            <span className="text-red-500">
              <FontAwesomeIcon icon={faTrash} />
            </span>
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <FontAwesomeIcon icon={faTimes} className="text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-200 text-xs">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-red-400 text-sm mt-0.5 flex-shrink-0"
            />
            <div className="space-y-1">
              <p className="font-semibold text-white">
                {message || (
                  <>
                    Are you sure you want to delete{" "}
                    {itemName ? <strong className="text-red-300">"{itemName}"</strong> : "this item"}?
                  </>
                )}
              </p>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                This item will be permanently removed from your saved library. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 px-4 py-3 bg-[#1e1e1e] border-t border-[#333333]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#333333] hover:bg-[#3e3e3e] text-gray-300 hover:text-white font-medium transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-1.5 rounded-lg font-semibold shadow-md transition-all active:scale-95 text-xs flex items-center space-x-1.5 ${confirmButtonClass}`}
          >
            <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
