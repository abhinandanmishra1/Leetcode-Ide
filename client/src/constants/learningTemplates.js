export const LEARNING_TEMPLATES = [
  {
    id: "dsa_pattern",
    name: "DSA Pattern (Pattern-X)",
    icon: "faDiagramProject",
    description: "Structure for reusable algorithm patterns, cues, blueprints, and complexity analysis",
    defaultTags: ["dsa", "pattern"],
    content: `# Pattern: [e.g. Sliding Window / Two Pointers / Monotonic Stack]

## 1. Core Intuition & When to Use
- **Problem Clues:** What indicators in the problem statement suggest this pattern?
  - E.g., contiguous subarrays/substrings satisfying a condition (min/max size).
- **Core Strategy:** In 1-2 sentences, what invariant does this pattern maintain?

## 2. Algorithmic Blueprint
1. **Initialize:** Setup window boundaries, pointers, or auxiliary data structures.
2. **Expand / Advance:** Move forward while the condition is met.
3. **Contract / Shrink:** Adjust boundaries when invalid to restore invariance.
4. **Collect:** Record answer (length, sum, count) at valid intermediate points.

## 3. Generic Code Template
\`\`\`cpp
// C++ Blueprint
int slidingWindow(const vector<int>& nums, int k) {
    int left = 0, currentSum = 0, best = 0;
    for (int right = 0; right < (int)nums.size(); ++right) {
        currentSum += nums[right];
        
        while (currentSum > k && left <= right) {
            currentSum -= nums[left++];
        }
        
        best = max(best, right - left + 1);
    }
    return best;
}
\`\`\`

## 4. Complexity Analysis
- **Time Complexity:** O(N) — each element is added and removed at most once.
- **Space Complexity:** O(1) — constant auxiliary space.

## 5. Edge Cases & Gotchas
- [ ] Empty or single-element inputs
- [ ] Window larger than array size
- [ ] Negative values violating monotonicity
- [ ] Off-by-one errors on boundary conditions
`,
  },
  {
    id: "problem_insight",
    name: "Problem-Solving Insight",
    icon: "faLightbulb",
    description: "Deep dive into a specific problem, breakthrough aha moment, and approach comparison",
    defaultTags: ["leetcode", "insights"],
    content: `# [Problem Name, e.g. LeetCode 42: Trapping Rain Water]

## 💡 Key Aha Moment
What single observation turns this problem from difficult into straightforward?
> The water trapped above index \`i\` is entirely determined by:
> \`min(max_left, max_right) - height[i]\`.

## 🔄 Approach Comparison

| Approach | Time | Space | Notes |
| :--- | :--- | :--- | :--- |
| Brute Force | O(N²) | O(1) | Recalculate max left & right per element |
| Prefix/Suffix Arrays | O(N) | O(N) | Precompute maxes in 2 passes |
| Two Pointers | O(N) | O(1) | Process inward from lowest boundary |

## 💻 Optimal Solution
\`\`\`python
# Python 3
class Solution:
    def trap(self, height: list[int]) -> int:
        if not height:
            return 0
        left, right = 0, len(height) - 1
        left_max, right_max = height[left], height[right]
        water = 0

        while left < right:
            if left_max < right_max:
                left += 1
                left_max = max(left_max, height[left])
                water += left_max - height[left]
            else:
                right -= 1
                right_max = max(right_max, height[right])
                water += right_max - height[right]

        return water
\`\`\`

## ⚠️ Pitfalls & Edge Cases
- All heights strictly increasing or strictly decreasing (water trapped = 0).
- Plateau shapes where multiple adjacent columns share the highest elevation.
`,
  },
  {
    id: "mistake_gotcha",
    name: "Mistake & Lesson Learned",
    icon: "faBug",
    description: "Postmortem of a tricky bug, failing test case, or algorithmic pitfall",
    defaultTags: ["gotchas", "debugging"],
    content: `# Postmortem: [Tricky Bug / Test Failure Summary]

## 🚨 The Symptom
What failed? (e.g. Time Limit Exceeded, Memory Limit Exceeded, Integer Overflow, WA on test case 48/52).

## 🔍 Root Cause Analysis
What incorrect assumption was made in the code?
\`\`\`cpp
// ❌ WRONG:
int mid = (left + right) / 2; // Can overflow if left + right > INT_MAX!

// ✅ FIX:
int mid = left + (right - left) / 2;
\`\`\`

## 🧠 Rule of Thumb for Future
What mental heuristic should I use to never make this mistake again?
- When doing binary search with bounds up to 10^9, always calculate midpoint with \`left + (right - left) / 2\` or use 64-bit integers.
- Be vigilant when recursion depth can reach O(N) on skewed trees or degenerate graphs.
`,
  },
  {
    id: "concept",
    name: "Important Concept / Cheat Sheet",
    icon: "faBookBookmark",
    description: "Concepts, language idioms, time complexities, or system knowledge",
    defaultTags: ["concepts", "cheat-sheet"],
    content: `# Concept: [e.g. C++ STL Container Complexity Cheat Sheet]

## Overview
Quick reference for container behavior, iterator invalidation rules, and performance characteristics.

## Summary Table

| Container | Search | Insert (Front/Back) | Memory Overhead |
| :--- | :--- | :--- | :--- |
| \`std::vector\` | O(N) / O(log N) sorted | O(1) amortized back | Low |
| \`std::deque\` | O(N) | O(1) front & back | Medium |
| \`std::unordered_map\` | O(1) avg / O(N) worst | O(1) avg | High |
| \`std::map\` (Red-Black Tree)| O(log N) | O(log N) | High |

## Practical Tips
- Prefer \`std::vector\` by default for cache locality.
- Use \`.reserve()\` when final size is approximately known to prevent multiple reallocations.
`,
  },
  {
    id: "blank",
    name: "Blank Note",
    icon: "faFile",
    description: "Start with an empty markdown canvas",
    defaultTags: [],
    content: `# Untitled Learning

Write your notes in Markdown here...
`,
  },
];
