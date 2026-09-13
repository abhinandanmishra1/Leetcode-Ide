import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faBolt,
  faShieldHalved,
  faCloud,
  faShareNodes,
  faUsers,
  faCheckCircle,
  faArrowRight,
  faCode,
  faCompass,
  faStar,
  faTerminal,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { CodePadBrand } from "../components/Brand/CodePadLogo";
import AuthModal from "../components/Auth/AuthModal";
import { useAuth } from "../context/AuthContext";
import { snippetsApi } from "../api";

const FEATURE_CARDS = [
  {
    icon: faBolt,
    iconColor: "text-[#ffa116]",
    title: "Sub-Second Sandbox Execution",
    description:
      "Powered by an asynchronous BullMQ queue and isolated runners. Compile and execute with immediate feedback.",
  },
  {
    icon: faShieldHalved,
    iconColor: "text-[#2cbb5d]",
    title: "Hardened Ephemeral Security",
    description:
      "Strict memory caps (256MB), 5s CPU timeouts, non-root jail execution, and multi-tier AST heuristic defense.",
  },
  {
    icon: faCloud,
    iconColor: "text-[#00b4d8]",
    title: "MongoDB Cloud Persistence",
    description:
      "Save your algorithms, test suites, and notes permanently on the cloud. Access your portfolio anywhere.",
  },
  {
    icon: faShareNodes,
    iconColor: "text-[#a855f7]",
    title: "1-Click Read-Only Sharing",
    description:
      "Share solutions with unique short URLs. Viewers can inspect code, run tests live in sandbox, and fork with 1 click.",
  },
  {
    icon: faUsers,
    iconColor: "text-[#f43f5e]",
    title: "Profiles & Social Following",
    description:
      "Claim your unique developer handle, follow competitive coders, and discover community algorithms.",
  },
  {
    icon: faTerminal,
    iconColor: "text-[#eab308]",
    title: "Multi-Case Test Runner",
    description:
      "Configure up to 8 test cases with expected outputs. Compare expected vs actual outputs with exact line diffing.",
  },
];

const POPULAR_LANGUAGES = [
  { id: 54, name: "C++ (GCC 11+)", tag: "cpp", badge: "Fastest" },
  { id: 71, name: "Python 3.10+", tag: "python", badge: "Popular" },
  { id: 62, name: "Java (OpenJDK 17)", tag: "java", badge: "Enterprise" },
  { id: 63, name: "JavaScript (Node.js)", tag: "javascript", badge: "Full-Stack" },
  { id: 60, name: "Go (1.20+)", tag: "go", badge: "High-Perf" },
  { id: 73, name: "Rust (1.70+)", tag: "rust", badge: "Memory-Safe" },
];

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [trendingSnippets, setTrendingSnippets] = useState([]);
  const [demoCodeLang, setDemoCodeLang] = useState("cpp");
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoOutput, setDemoOutput] = useState("Click 'Run Demo' to execute in sandbox...");

  // Load trending public snippets
  useEffect(() => {
    snippetsApi
      .getPublic({ limit: 3, sort: "popular" })
      .then((res) => {
        if (res.snippets && res.snippets.length > 0) {
          setTrendingSnippets(res.snippets);
        }
      })
      .catch(() => {});
  }, []);

  const handleRunDemo = () => {
    setDemoRunning(true);
    setDemoOutput("Queueing job... dispatching to Docker runner...");
    setTimeout(() => {
      setDemoRunning(false);
      setDemoOutput("Status: Accepted (0ms, 4.2 MB)\nOutput: [0, 1]\nAll 3 test cases passed! ✓");
    }, 900);
  };

  const demoCodes = {
    cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (mp.count(complement)) return {mp[complement], i};
        mp[nums[i]] = i;
    }
    return {};
}`,
    python: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
    }
    return [];
}`,
  };

  return (
    <div className="min-h-screen bg-[#141414] text-gray-200 selection:bg-[#ffa116] selection:text-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#1e1e1e]/90 backdrop-blur-md border-b border-[#2d2d2d] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <CodePadBrand />
            </Link>
            <span className="bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              v2.0
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#languages" className="hover:text-white transition-colors">
              Languages
            </a>
            <Link to="/explore" className="hover:text-white transition-colors">
              Community Explore
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/u/${user.username}`}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-white bg-[#282828] hover:bg-[#333333] border border-[#3e3e3e] rounded-lg transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <span className="font-bold text-[#ffa116]">@{user.username}</span>
                  )}
                  <span>@{user.username}</span>
                </Link>
                <Link
                  to="/ide"
                  className="px-3 py-1.5 text-xs font-semibold bg-[#2cbb5d] hover:bg-[#26a050] text-white rounded-lg transition-colors shadow"
                >
                  Open IDE
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <Link
                  to="/ide"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#ffa116] hover:bg-[#e08d0e] text-black rounded-lg transition-all shadow active:scale-95"
                >
                  <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
                  <span>Start Coding</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 overflow-hidden bg-gradient-to-b from-[#1c1c1c] via-[#141414] to-[#141414]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-[#252525] border border-[#3e3e3e] px-3.5 py-1.5 rounded-full text-xs text-gray-300 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2cbb5d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2cbb5d]"></span>
            </span>
            <span>Now with Cloud Persistence, Google OAuth & Social Discovery</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Build, Test & Share <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ffa116] via-[#ffc04d] to-[#2cbb5d]">
              LeetCode-Style Algorithms
            </span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            The ultra-fast online coding playground. Compile and execute across C++, Python, Java, JavaScript, Rust,
            and Go with isolated sandboxes, live test cases, and 1-click shareable URLs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/ide"
              className="flex items-center space-x-2 px-6 py-3 bg-[#2cbb5d] hover:bg-[#26a050] text-white text-sm font-semibold rounded-xl shadow-lg transition-all active:scale-95 hover:shadow-[#2cbb5d]/20"
            >
              <FontAwesomeIcon icon={faPlay} />
              <span>Launch IDE Playground</span>
            </Link>
            <Link
              to="/explore"
              className="flex items-center space-x-2 px-6 py-3 bg-[#262626] hover:bg-[#303030] border border-[#3e3e3e] text-white text-sm font-semibold rounded-xl transition-all"
            >
              <FontAwesomeIcon icon={faCompass} className="text-[#ffa116]" />
              <span>Explore Community Snippets</span>
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-10 text-center border-t border-[#2d2d2d]">
            <div>
              <div className="text-2xl font-bold text-white">6+</div>
              <div className="text-xs text-gray-500">Core Compilers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#2cbb5d]">0ms</div>
              <div className="text-xs text-gray-500">Local Latency</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#ffa116]">1-Click</div>
              <div className="text-xs text-gray-500">Instant Sharing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#00b4d8]">100%</div>
              <div className="text-xs text-gray-500">Ephemeral Sandboxed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Code Demo Card */}
      <section className="px-4 sm:px-8 max-w-5xl mx-auto -mt-6">
        <div className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Window Header */}
          <div className="bg-[#262626] px-4 py-3 border-b border-[#333333] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="text-xs font-mono text-gray-400 ml-2">TwoSum.cpp</span>
            </div>

            {/* Language Switcher Tabs */}
            <div className="flex items-center space-x-1 bg-[#1a1a1a] p-1 rounded-lg text-xs font-mono">
              <button
                type="button"
                onClick={() => setDemoCodeLang("cpp")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  demoCodeLang === "cpp" ? "bg-[#333333] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                C++
              </button>
              <button
                type="button"
                onClick={() => setDemoCodeLang("python")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  demoCodeLang === "python" ? "bg-[#333333] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Python
              </button>
              <button
                type="button"
                onClick={() => setDemoCodeLang("javascript")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  demoCodeLang === "javascript" ? "bg-[#333333] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                JavaScript
              </button>
            </div>

            <button
              type="button"
              onClick={handleRunDemo}
              disabled={demoRunning}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#2cbb5d] hover:bg-[#26a050] text-white text-xs font-semibold rounded-md transition-all shadow"
            >
              {demoRunning ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
              ) : (
                <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
              )}
              <span>{demoRunning ? "Running..." : "Run Demo"}</span>
            </button>
          </div>

          {/* Card Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#333333]">
            <div className="p-4 bg-[#1a1a1a] font-mono text-xs text-gray-300 overflow-x-auto leading-relaxed">
              <pre>{demoCodes[demoCodeLang]}</pre>
            </div>
            <div className="p-4 bg-[#141414] font-mono text-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <FontAwesomeIcon icon={faTerminal} className="text-[#ffa116]" />
                  <span>Execution Output Console</span>
                </div>
                <div className="bg-[#1c1c1c] p-3 rounded-lg border border-[#2d2d2d] text-gray-300 min-h-[140px] whitespace-pre-wrap">
                  {demoOutput}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-[#262626]">
                <span>Input: nums = [2,7,11,15], target = 9</span>
                <Link to="/ide" className="text-[#ffa116] hover:underline flex items-center space-x-1 font-medium">
                  <span>Open in Full IDE</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Everything You Need To Solve & Share</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Engineered specifically for algorithmic problem solving, contest practice, and developer collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_CARDS.map((card, idx) => (
            <div
              key={idx}
              className="bg-[#1c1c1c] border border-[#2e2e2e] hover:border-[#ffa116]/50 rounded-xl p-6 space-y-3 transition-all hover:-translate-y-1 shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-[#262626] flex items-center justify-center text-lg">
                <FontAwesomeIcon icon={card.icon} className={card.iconColor} />
              </div>
              <h3 className="text-base font-bold text-white">{card.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Languages Section */}
      <section id="languages" className="py-16 px-4 sm:px-8 bg-[#181818] border-t border-b border-[#2d2d2d]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Supported Compilers & Runtimes</h2>
            <p className="text-xs text-gray-400">All runtimes are pre-installed in native Docker containers.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {POPULAR_LANGUAGES.map((lang) => (
              <div
                key={lang.id}
                className="bg-[#222222] border border-[#333333] rounded-lg p-3 text-center space-y-1 hover:border-[#2cbb5d] transition-colors"
              >
                <div className="text-xs font-bold text-white truncate">{lang.name}</div>
                <div className="text-[10px] text-[#2cbb5d] font-mono">{lang.badge}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Community Snippets */}
      {trendingSnippets.length > 0 && (
        <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Trending Community Snippets</h2>
              <p className="text-xs text-gray-400 mt-1">Recently saved and popular algorithms from developers.</p>
            </div>
            <Link to="/explore" className="text-xs text-[#ffa116] hover:underline font-semibold flex items-center space-x-1">
              <span>View All</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {trendingSnippets.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/s/${s.snippetId}`)}
                className="bg-[#1c1c1c] border border-[#2d2d2d] hover:border-[#3e3e3e] rounded-xl p-4 cursor-pointer transition-all hover:bg-[#222222] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2c22] text-[#2cbb5d] border border-[#2cbb5d]/30">
                      {s.languageName}
                    </span>
                    <span className="text-[11px] text-gray-500">{s.viewsCount || 0} views</span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{s.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{s.description || "Community solution"}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#282828] text-xs">
                  <div className="flex items-center space-x-2 text-gray-400">
                    {s.author?.avatar ? (
                      <img src={s.author.avatar} alt={s.author.name} className="w-5 h-5 rounded-full" />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-gray-700 inline-block" />
                    )}
                    <span className="text-[11px]">@{s.author?.username || "anonymous"}</span>
                  </div>
                  <span className="text-[#ffa116] text-xs font-semibold">Open & Run →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Footer Banner */}
      <section className="py-20 px-4 sm:px-8 text-center bg-gradient-to-b from-[#141414] to-[#1c1c1c] border-t border-[#262626]">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-3xl font-extrabold text-white">Ready to Code & Test?</h2>
          <p className="text-xs text-gray-400">
            No registration or credit card required. Jump straight into the IDE or sign in with Google to save to cloud.
          </p>
          <div className="flex justify-center pt-2">
            <Link
              to="/ide"
              className="px-8 py-3.5 bg-[#2cbb5d] hover:bg-[#26a050] text-white font-bold text-sm rounded-xl shadow-xl transition-all active:scale-95"
            >
              Launch CodePad IDE Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-8 bg-[#111111] border-t border-[#222222] text-xs text-gray-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <CodePadBrand />
          <div>CodePad • Cloud Sandboxed Multi-Language Playground & Social Hub</div>
          <div className="flex items-center space-x-4">
            <Link to="/ide" className="hover:text-gray-300">
              IDE
            </Link>
            <Link to="/explore" className="hover:text-gray-300">
              Explore
            </Link>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default LandingPage;
