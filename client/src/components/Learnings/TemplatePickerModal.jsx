import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiagramProject,
  faLightbulb,
  faBug,
  faBookBookmark,
  faFile,
  faXmark,
  faCheck,
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
  if (!isOpen) return null;

  const handleSelect = (template) => {
    if (
      hasExistingContent &&
      !window.confirm(
        "Applying this template will replace your current note text. Continue?"
      )
    ) {
      return;
    }
    onSelectTemplate(template);
    onClose();
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

        {/* Templates List */}
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

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#2e2e2e] bg-[#191919] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
