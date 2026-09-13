/**
 * Initial seed template: Binary Search (Lower Bound) across all 6 core languages.
 * Seeded into localStorage only on the first visit.
 * If the user edits or deletes any of these, their choice in localStorage is permanently respected.
 */
export const INITIAL_SEEDED_TEMPLATES = [
  // C++ (id: 54)
  {
    id: "binarysearch_54",
    command: "/binarysearch",
    name: "Binary Search",
    description: "Lower bound binary search: returns first index where arr[idx] >= target",
    languageId: 54,
    languageName: "C++ (GCC 11+)",
    code: `int binarySearch(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size();

    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;

        if (arr[mid] >= target) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return lo;
}`,
  },

  // Java (id: 62)
  {
    id: "binarysearch_62",
    command: "/binarysearch",
    name: "Binary Search",
    description: "Lower bound binary search: returns first index where arr[idx] >= target",
    languageId: 62,
    languageName: "Java (OpenJDK 17)",
    code: `public static int binarySearch(int[] arr, int target) {
    int lo = 0, hi = arr.length;

    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;

        if (arr[mid] >= target) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return lo;
}`,
  },

  // Python 3 (id: 71)
  {
    id: "binarysearch_71",
    command: "/binarysearch",
    name: "Binary Search",
    description: "Lower bound binary search: returns first index where arr[idx] >= target",
    languageId: 71,
    languageName: "Python 3",
    code: `def binary_search(arr: list[int], target: int) -> int:
    lo, hi = 0, len(arr)

    while lo < hi:
        mid = lo + (hi - lo) // 2

        if arr[mid] >= target:
            hi = mid
        else:
            lo = mid + 1

    return lo`,
  },

  // JavaScript (id: 63)
  {
    id: "binarysearch_63",
    command: "/binarysearch",
    name: "Binary Search",
    description: "Lower bound binary search: returns first index where arr[idx] >= target",
    languageId: 63,
    languageName: "JavaScript (Node.js 20)",
    code: `function binarySearch(arr, target) {
    let lo = 0, hi = arr.length;

    while (lo < hi) {
        const mid = lo + Math.floor((hi - lo) / 2);

        if (arr[mid] >= target) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return lo;
}`,
  },

  // TypeScript (id: 74)
  {
    id: "binarysearch_74",
    command: "/binarysearch",
    name: "Binary Search",
    description: "Lower bound binary search: returns first index where arr[idx] >= target",
    languageId: 74,
    languageName: "TypeScript",
    code: `function binarySearch(arr: number[], target: number): number {
    let lo = 0, hi = arr.length;

    while (lo < hi) {
        const mid = lo + Math.floor((hi - lo) / 2);

        if (arr[mid] >= target) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return lo;
}`,
  },

  // C (id: 50)
  {
    id: "binarysearch_50",
    command: "/binarysearch",
    name: "Binary Search",
    description: "Lower bound binary search: returns first index where arr[idx] >= target",
    languageId: 50,
    languageName: "C (GCC 11+)",
    code: `int binarySearch(const int arr[], int n, int target) {
    int lo = 0, hi = n;

    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;

        if (arr[mid] >= target) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return lo;
}`,
  },
];

export default INITIAL_SEEDED_TEMPLATES;
