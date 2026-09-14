import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiagramProject,
  faLightbulb,
  faBug,
  faBookBookmark,
  faFile,
  faXmark,
  faCheck,
  faTriangleExclamation,
  faArrowRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { LEARNING_TEMPLATES } from "../../constants/learningTemplates";

const ICON_MAP = {
  faDiagramProject,
  faLightbulb,
  faBug,
  faBookBookmark,
  faFile,
};

export default function TemplatePickerModal({
  isOpen,
  onClose,
  onSelectTemplate,
  hasExistingContent,
}) {
  const [pendingTemplate, setPendingTemplate] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setPendingTemplate(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (template) => {
    if (hasExistingContent) {
      setPendingTemplate(template);
      return;
    }
    onSelectTemplate(template);
    onClose();
  };

  const handleConfirmReplace = () => {
    if (pendingTemplate) {
      onSelectTemplate(pendingTemplate);
      setPendingTemplate(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#1e1e1e] border border-[#333333] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e2e] bg-[#222222]">
          <div>
            <h2 className="text-base font-bold text-white">Choose a Starter Template</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Jumpstart your learning notes with proven structures
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#2f2f2f] transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Body: Confirmation vs Template Picker */}
        {pendingTemplate ? (
          <div className="p-6 space-y-5">
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="text-amber-400 text-base mt-0.5 flex-shrink-0"
              />
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white">
                  Replace existing note content?
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Applying <strong className="text-amber-300">"{pendingTemplate.name}"</strong> will overwrite your current note text. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#2e2e2e] bg-[#161616] space-y-1 text-xs">
              <span className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold">Selected Template</span>
              <p className="text-white font-medium">{pendingTemplate.name}</p>
              <p className="text-gray-400 text-[11px]">{pendingTemplate.description}</p>
            </div>
          </div>
        ) : (
          /* Templates List */
          <div className="p-6 overflow-y-auto space-y-3.5">
            {LEARNING_TEMPLATES.map((tpl) => {
              const icon = ICON_MAP[tpl.icon] || faFile;
              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelect(tpl)}
                  className="group flex items-start space-x-4 p-4 rounded-xl border border-[#2e2e2e] hover:border-[#ffa116] bg-[#171717] hover:bg-[#242424] transition-all cursor-pointer"
                >
                  <div className="p-3 rounded-lg bg-[#252525] group-hover:bg-[#ffa116]/10 text-[#ffa116] transition-colors flex-shrink-0">
                    <FontAwesomeIcon icon={icon} className="text-base" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white group-hover:text-[#ffa116] transition-colors">
                        {tpl.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {tpl.description}
                    </p>
                    {tpl.defaultTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {tpl.defaultTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-400 bg-[#222222] border border-[#2f2f2f]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#2e2e2e] bg-[#191919] flex items-center justify-end space-x-2">
          {pendingTemplate ? (
            <>
              <button
                type="button"
                onClick={() => setPendingTemplate(null)}
                className="px-3.5 py-1.5 text-xs text-gray-300 hover:text-white rounded-lg bg-[#2c2c2c] hover:bg-[#383838] transition-colors font-medium"
              >
                Back to Templates
              </button>
              <button
                type="button"
                onClick={handleConfirmReplace}
                className="px-4 py-1.5 text-xs font-bold text-black rounded-lg bg-[#ffa116] hover:bg-[#ffb03a] shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
              >
                <FontAwesomeIcon icon={faArrowRotateRight} className="text-[10px]" />
                <span>Replace & Apply</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-gray-300 hover:text-white transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
