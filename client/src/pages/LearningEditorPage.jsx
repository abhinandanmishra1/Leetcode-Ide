import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faFloppyDisk,
  faSpinner,
  faLock,
  faLink,
  faGlobe,
  faTag,
  faBold,
  faItalic,
  faCode,
  faListUl,
  faListOl,
  faQuoteLeft,
  faTable,
  faDiagramProject,
  faEye,
  faPen,
  faColumns,
} from "@fortawesome/free-solid-svg-icons";
import MarkdownRenderer from "../components/Learnings/MarkdownRenderer";
import RelatedProblemsManager from "../components/Learnings/RelatedProblemsManager";
import TemplatePickerModal from "../components/Learnings/TemplatePickerModal";
import { LEARNING_TEMPLATES } from "../constants/learningTemplates";
import { learningsApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LearningEditorPage() {
  const { learningId } = useParams();
  const isEditing = Boolean(learningId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [relatedProblems, setRelatedProblems] = useState([]);
  const [visibility, setVisibility] = useState("private");

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("split"); // "split" | "write" | "preview"

  const textareaRef = useRef(null);

  // Load existing note in edit mode
  useEffect(() => {
    if (!isEditing) {
      // Default to DSA Pattern template for convenience if creating fresh
      const defaultTpl = LEARNING_TEMPLATES[0];
      setContent(defaultTpl.content);
      setTags([...defaultTpl.defaultTags]);
      return;
    }

    setLoading(true);
    learningsApi
      .getById(learningId)
      .then((data) => {
        if (!data.isAuthor) {
          toast.warning("You do not have permission to edit this learning note.");
          navigate(`/learnings/${learningId}`, { replace: true });
          return;
        }
        setTitle(data.title || "");
        setContent(data.content || "");
        setTags(data.tags || []);
        setRelatedProblems(data.relatedProblems || []);
        setVisibility(data.visibility || "private");
      })
      .catch((err) => {
        toast.error("Failed to load note: " + (err.response?.data?.message || err.message));
        navigate("/learnings", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [learningId, isEditing, navigate]);

  // Insert markdown helper at cursor position
  const insertText = (before, after = "", placeholder = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const current = ta.value;

    const selected = current.slice(start, end) || placeholder;
    const replacement = `${before}${selected}${after}`;

    const updated = current.slice(0, start) + replacement + current.slice(end);
    setContent(updated);

    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  // Keyboard Tab support (insert 2 spaces instead of moving focus)
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      insertText("  ", "");
    }
    // Ctrl+S / Cmd+S save shortcut
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      handleSave();
    }
  };

  // Tag management
  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (clean && !tags.includes(clean) && tags.length < 10) {
        setTags([...tags, clean]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Template selection
  const handleApplyTemplate = (tpl) => {
    setContent(tpl.content);
    if (!title.trim()) {
      setTitle(tpl.name);
    }
    // Merge tags
    const combined = Array.from(new Set([...tags, ...tpl.defaultTags]));
    setTags(combined);
  };

  // Save handler
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please enter a title for your note.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Please write some content in your note.");
      return;
    }

    setErrorMsg("");
    setSaving(true);

    const payload = {
      title: title.trim(),
      content,
      tags,
      relatedProblems,
      visibility,
    };

    try {
      if (isEditing) {
        await learningsApi.update(learningId, payload);
        toast.success("Learning note updated");
        navigate(`/learnings/${learningId}`);
      } else {
        const created = await learningsApi.create(payload);
        toast.success("Learning note created");
        navigate(`/learnings/${created.learningId}`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save note");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center text-gray-400">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-[#ffa116]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-gray-200 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#1e1e1e] border-b border-[#2e2e2e] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Back & Breadcrumb */}
        <div className="flex items-center space-x-3 min-w-0">
          <Link
            to={isEditing ? `/learnings/${learningId}` : "/learnings"}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white rounded-lg hover:bg-[#2c2c2c] transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-xs font-semibold text-gray-300 truncate">
            {isEditing ? "Edit Learning" : "New Learning"}
          </span>
        </div>

        {/* Right: Template picker, Visibility, Save */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-300 bg-[#262626] hover:bg-[#333333] border border-[#383838] rounded-lg transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faDiagramProject} className="text-[#ffa116] text-[11px]" />
            <span>Templates</span>
          </button>

          {/* Visibility selector */}
          <div className="relative inline-flex items-center">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border outline-none cursor-pointer transition-all ${
                visibility === "private"
                  ? "bg-amber-950/40 text-amber-300 border-amber-800/60"
                  : visibility === "unlisted"
                  ? "bg-sky-950/40 text-sky-300 border-sky-800/60"
                  : "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
              }`}
            >
              <option value="private" className="bg-[#1e1e1e] text-amber-300">
                🔒 Private
              </option>
              <option value="unlisted" className="bg-[#1e1e1e] text-sky-300">
                🔗 Unlisted
              </option>
              <option value="public" className="bg-[#1e1e1e] text-emerald-300">
                🌍 Public
              </option>
            </select>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold bg-[#ffa116] hover:bg-[#ff9400] text-black rounded-lg transition-all shadow active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faFloppyDisk} className="text-xs" />
                <span>{isEditing ? "Save Changes" : "Create"}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-rose-950/60 border-b border-rose-800/60 text-rose-200 px-6 py-2 text-xs flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg("")} className="text-rose-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Form Body */}
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Title Input */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Learning Title (e.g. Sliding Window Pattern, Dijkstra Insights)..."
            className="w-full text-xl sm:text-2xl font-extrabold bg-transparent text-white placeholder-gray-600 outline-none pb-2 border-b border-[#2b2b2b] focus:border-[#ffa116] transition-colors"
            autoFocus={!isEditing}
          />
        </div>

        {/* Markdown Toolbar & View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl px-3 py-2 text-xs">
          {/* Quick Markdown Formatting Controls */}
          <div className="flex items-center space-x-1 flex-wrap">
            <button
              type="button"
              onClick={() => insertText("## ", "")}
              title="Heading 2"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2b2b2b] rounded font-bold"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertText("### ", "")}
              title="Heading 3"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2b2b2b] rounded font-bold"
            >
              H3
            </button>
            <div className="w-[1px] h-4 bg-[#333333] mx-1" />
            <button
              type="button"
              onClick={() => insertText("**", "**", "bold text")}
              title="Bold"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2b2b2b] rounded"
            >
              <FontAwesomeIcon icon={faBold} />
            </button>
            <button
              type="button"
              onClick={() => insertText("*", "*", "italic text")}
              title="Italic"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2b2b2b] rounded"
            >
              <FontAwesomeIcon icon={faItalic} />
            </button>
            <button
              type="button"
              onClick={() => insertText("```cpp\n", "\n```\n", "// Code here")}
              title="Code Block"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2b2b2b] rounded"
            >
              <FontAwesomeIcon icon={faCode} />
            </button>
            <div className="w-[1px] h-4 bg-[#333333] mx-1" />
            <button
              type="button"
              onClick={() => insertText("- ", "")}
              title="Bullet List"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2b2b2b] rounded"
            >
              <FontAwesomeIcon icon={faListUl} />
            </button>
            <button
              type="button"
              onClick={() => insertText("1. ", "")}
              title="Numbered List"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2b2b2b] rounded"
            >
              <FontAwesomeIcon icon={faListOl} />
            </button>
            <button
              type="button"
              onClick={() => insertText("> ", "")}
              title="Quote"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2b2b2b] rounded"
            >
              <FontAwesomeIcon icon={faQuoteLeft} />
            </button>
            <button
              type="button"
              onClick={() =>
                insertText(
                  "| Feature | Description |\n| :--- | :--- |\n| Item 1 | Value 1 |\n"
                )
              }
              title="Table"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2b2b2b] rounded"
            >
              <FontAwesomeIcon icon={faTable} />
            </button>
          </div>

          {/* View Toggles (Write, Split, Preview) */}
          <div className="flex items-center space-x-1 bg-[#252525] p-0.5 rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode("write")}
              className={`px-2 py-1 rounded transition-colors flex items-center space-x-1 ${
                viewMode === "write" ? "bg-[#383838] text-white font-semibold" : "text-gray-400 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faPen} className="text-[10px]" />
              <span className="hidden sm:inline">Write</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`px-2 py-1 rounded transition-colors flex items-center space-x-1 ${
                viewMode === "split" ? "bg-[#383838] text-white font-semibold" : "text-gray-400 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faColumns} className="text-[10px]" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-2 py-1 rounded transition-colors flex items-center space-x-1 ${
                viewMode === "preview" ? "bg-[#383838] text-white font-semibold" : "text-gray-400 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faEye} className="text-[10px]" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-h-[450px] grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Write Textarea */}
          {(viewMode === "write" || viewMode === "split") && (
            <div
              className={`flex flex-col bg-[#191919] border border-[#2d2d2d] rounded-xl overflow-hidden focus-within:border-[#ffa116] transition-colors ${
                viewMode === "write" ? "md:col-span-2" : ""
              }`}
            >
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your notes in Markdown here... Use ```lang for code blocks!"
                className="flex-1 w-full p-4 bg-transparent text-gray-200 font-mono text-xs sm:text-sm leading-relaxed outline-none resize-none selection:bg-[#ffa116] selection:text-black"
                rows={22}
              />
            </div>
          )}

          {/* Live Preview */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div
              className={`flex flex-col bg-[#191919] border border-[#2d2d2d] rounded-xl p-5 overflow-y-auto max-h-[620px] ${
                viewMode === "preview" ? "md:col-span-2" : ""
              }`}
            >
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-[#282828] pb-1">
                Live Markdown Preview
              </div>
              <MarkdownRenderer content={content} />
            </div>
          )}
        </div>

        {/* Metadata Management: Tags & Related LeetCode Problems */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#262626]">
          {/* Tags Input */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Tags ({tags.length}/10)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#191919] border border-[#2e2e2e] rounded-xl focus-within:border-[#ffa116]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-mono text-[#ffa116] bg-[#282828] border border-[#383838]"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-white ml-1 text-xs"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={tags.length === 0 ? "Add tags (e.g. dsa, dynamic-programming, arrays) & press Enter" : "Add more tags..."}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-1 min-w-[140px] bg-transparent text-xs text-white placeholder-gray-500 outline-none p-1"
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Press Enter or comma to create a tag. Tags make your notes searchable.
            </p>
          </div>

          {/* Related LeetCode Problems */}
          <div>
            <RelatedProblemsManager problems={relatedProblems} onChange={setRelatedProblems} />
          </div>
        </div>
      </div>

      {/* Template Picker Modal */}
      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleApplyTemplate}
        hasExistingContent={Boolean(content.trim())}
      />
    </div>
  );
}
