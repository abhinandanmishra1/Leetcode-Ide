import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faLink,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";

function parseLeetCodeUrl(url = "") {
  try {
    const match = url.match(/leetcode\.com\/problems\/([^/?#]+)/i);
    if (match && match[1]) {
      const slug = match[1];
      const title = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return { title, url: url.trim() };
    }
  } catch {}
  return null;
}

export default function RelatedProblemsManager({
  problems = [],
  onChange,
}) {
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("Medium");
  const [newNumber, setNewNumber] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleUrlBlur = () => {
    if (newUrl && !newTitle) {
      const parsed = parseLeetCodeUrl(newUrl);
      if (parsed) {
        setNewTitle(parsed.title);
      }
    }
  };

  const handleAddProblem = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const formattedUrl = newUrl.startsWith("http") ? newUrl.trim() : `https://${newUrl.trim()}`;

    const newProblem = {
      title: newTitle.trim(),
      url: formattedUrl,
      difficulty: newDifficulty,
      problemNumber: newNumber.trim(),
    };

    onChange([...problems, newProblem]);
    setNewTitle("");
    setNewUrl("");
    setNewDifficulty("Medium");
    setNewNumber("");
    setIsAdding(false);
  };

  const handleRemove = (indexToRemove) => {
    onChange(problems.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Related LeetCode Problems ({problems.length})
        </label>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-xs text-[#ffa116] hover:text-[#ffb74d] flex items-center space-x-1 font-medium transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
            <span>Add Problem</span>
          </button>
        )}
      </div>

      {/* Added Problems List */}
      {problems.length > 0 ? (
        <div className="space-y-2">
          {problems.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg px-3 py-2 text-xs text-gray-300"
            >
              <div className="flex items-center space-x-2.5 truncate">
                {/* Difficulty badge */}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    p.difficulty === "Easy"
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                      : p.difficulty === "Hard"
                      ? "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                      : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                  }`}
                >
                  {p.difficulty}
                </span>

                {p.problemNumber && (
                  <span className="font-mono text-gray-400">#{p.problemNumber}</span>
                )}

                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-200 hover:text-white truncate flex items-center space-x-1 hover:underline"
                >
                  <span>{p.title}</span>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[9px] text-gray-500" />
                </a>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-gray-500 hover:text-red-400 p-1 transition-colors ml-2 flex-shrink-0"
              >
                <FontAwesomeIcon icon={faTrash} className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      ) : !isAdding && (
        <p className="text-xs text-gray-500 italic">
          No related LeetCode problems attached. Link problems to help users practice this pattern.
        </p>
      )}

      {/* Add Problem Form */}
      {isAdding && (
        <form
          onSubmit={handleAddProblem}
          className="bg-[#1e1e1e] border border-[#383838] rounded-xl p-4 space-y-3 animate-in fade-in duration-100"
        >
          <div className="text-xs font-semibold text-gray-200 flex items-center justify-between">
            <span>Link LeetCode Problem</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="url"
              placeholder="Paste LeetCode URL (e.g. https://leetcode.com/problems/...)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onBlur={handleUrlBlur}
              className="sm:col-span-2 px-3 py-1.5 bg-[#141414] border border-[#333333] focus:border-[#ffa116] rounded-lg text-xs text-white placeholder-gray-500 outline-none"
              required
            />

            <input
              type="text"
              placeholder="Problem Title (e.g. Trapping Rain Water)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-3 py-1.5 bg-[#141414] border border-[#333333] focus:border-[#ffa116] rounded-lg text-xs text-white placeholder-gray-500 outline-none"
              required
            />

            <div className="flex space-x-2">
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 bg-[#141414] border border-[#333333] focus:border-[#ffa116] rounded-lg text-xs text-white outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <input
                type="text"
                placeholder="# (optional, e.g. 42)"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 bg-[#141414] border border-[#333333] focus:border-[#ffa116] rounded-lg text-xs text-white placeholder-gray-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-3 py-1 text-xs font-semibold bg-[#ffa116] hover:bg-[#ff9400] text-black rounded-lg transition-colors shadow"
            >
              Add Problem
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
