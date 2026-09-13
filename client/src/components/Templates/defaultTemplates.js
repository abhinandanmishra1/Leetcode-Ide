/**
 * Initial seed templates across core languages:
 * 1. /segtree (Segment Tree - Point update & range sum queries in O(log N))
 * 2. /dsu (Disjoint Set Union - Path compression & union by rank in O(α(N)))
 * 3. /bitmask-dp (State Compression DP - Bitmask dynamic programming)
 */
export const INITIAL_SEEDED_TEMPLATES = [
  // ==========================================
  // C++ (id: 54)
  // ==========================================
  {
    id: "segtree_54",
    command: "/segtree",
    name: "Segment Tree",
    description: "Point update and range sum query Segment Tree in O(log N)",
    languageId: 54,
    languageName: "C++ (GCC 11+)",
    code: `// Segment Tree (Point Update & Range Sum Query) - O(log N)
template <typename T = long long>
class SegmentTree {
private:
    int n;
    vector<T> tree;

    void build(const vector<T>& arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = start + (end - start) / 2;
        build(arr, 2 * node, start, mid);
        build(arr, 2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    void update(int node, int start, int end, int idx, T val) {
        if (start == end) {
            tree[node] = val;
            return;
        }
        int mid = start + (end - start) / 2;
        if (idx <= mid)
            update(2 * node, start, mid, idx, val);
        else
            update(2 * node + 1, mid + 1, end, idx, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    T query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return tree[node];
        int mid = start + (end - start) / 2;
        return query(2 * node, start, mid, l, r) +
               query(2 * node + 1, mid + 1, end, l, r);
    }

public:
    SegmentTree(int n) : n(n), tree(4 * n, 0) {}
    SegmentTree(const vector<T>& arr) : n(arr.size()), tree(4 * arr.size(), 0) {
        if (n > 0) build(arr, 1, 0, n - 1);
    }

    void update(int idx, T val) { update(1, 0, n - 1, idx, val); }
    T query(int l, int r) { return query(1, 0, n - 1, l, r); }
};`,
  },
  {
    id: "dsu_54",
    command: "/dsu",
    name: "Disjoint Set Union (DSU)",
    description: "Union-Find with path compression and union by rank in O(α(N))",
    languageId: 54,
    languageName: "C++ (GCC 11+)",
    code: `// Disjoint Set Union (DSU) / Union-Find with Path Compression & Union by Rank
class DSU {
private:
    vector<int> parent;
    vector<int> rank;
    int numComponents;

public:
    DSU(int n) : parent(n), rank(n, 0), numComponents(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]); // Path compression
        return parent[x];
    }

    bool unite(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        if (rootX == rootY) return false;

        // Union by rank
        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }
        numComponents--;
        return true;
    }

    bool isConnected(int x, int y) {
        return find(x) == find(y);
    }

    int count() const {
        return numComponents;
    }
};`,
  },
  {
    id: "bitmask_dp_54",
    command: "/bitmask-dp",
    name: "State Compression DP",
    description: "Bitmask Dynamic Programming / State Compression template in O(2^N * N^2)",
    languageId: 54,
    languageName: "C++ (GCC 11+)",
    code: `// State Compression DP (Bitmask Dynamic Programming) - O(2^N * N^2)
// Template: Minimum Hamiltonian Cycle / Traveling Salesperson Problem (TSP)
int stateCompressionDP(int n, const vector<vector<int>>& cost) {
    int fullMask = (1 << n);
    const int INF = 1e9;

    // dp[mask][i] = minimum cost to visit subset of nodes 'mask' ending at node 'i'
    vector<vector<int>> dp(fullMask, vector<int>(n, INF));
    dp[1][0] = 0; // Starting at node 0 with mask 1 (000...001)

    for (int mask = 1; mask < fullMask; mask++) {
        for (int u = 0; u < n; u++) {
            if (!(mask & (1 << u))) continue;
            if (dp[mask][u] == INF) continue;

            // Try transitioning to unvisited neighbor v
            for (int v = 0; v < n; v++) {
                if (mask & (1 << v)) continue;
                int nextMask = mask | (1 << v);
                dp[nextMask][v] = min(dp[nextMask][v], dp[mask][u] + cost[u][v]);
            }
        }
    }

    int minCost = INF;
    for (int u = 1; u < n; u++) {
        minCost = min(minCost, dp[fullMask - 1][u] + cost[u][0]);
    }
    return minCost;
}`,
  },

  // ==========================================
  // Python 3 (id: 71)
  // ==========================================
  {
    id: "segtree_71",
    command: "/segtree",
    name: "Segment Tree",
    description: "Point update and range sum query Segment Tree in O(log N)",
    languageId: 71,
    languageName: "Python 3",
    code: `# Segment Tree (Point Update & Range Query) - O(log N)
class SegmentTree:
    def __init__(self, arr: list[int]):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        if self.n > 0:
            self._build(arr, 1, 0, self.n - 1)

    def _build(self, arr: list[int], node: int, start: int, end: int):
        if start == end:
            self.tree[node] = arr[start]
            return
        mid = (start + end) // 2
        self._build(arr, 2 * node, start, mid)
        self._build(arr, 2 * node + 1, mid + 1, end)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def update(self, idx: int, val: int):
        def _update(node: int, start: int, end: int):
            if start == end:
                self.tree[node] = val
                return
            mid = (start + end) // 2
            if idx <= mid:
                _update(2 * node, start, mid)
            else:
                _update(2 * node + 1, mid + 1, end)
            self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

        _update(1, 0, self.n - 1)

    def query(self, l: int, r: int) -> int:
        def _query(node: int, start: int, end: int) -> int:
            if r < start or end < l:
                return 0
            if l <= start and end <= r:
                return self.tree[node]
            mid = (start + end) // 2
            return _query(2 * node, start, mid) + _query(2 * node + 1, mid + 1, end)

        return _query(1, 0, self.n - 1)`,
  },
  {
    id: "dsu_71",
    command: "/dsu",
    name: "Disjoint Set Union (DSU)",
    description: "Union-Find with path compression and union by rank in O(α(N))",
    languageId: 71,
    languageName: "Python 3",
    code: `# Disjoint Set Union (DSU) / Union-Find with Path Compression & Union by Rank
class DSU:
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.num_components = n

    def find(self, x: int) -> int:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]

    def unite(self, x: int, y: int) -> bool:
        root_x = self.find(x)
        root_y = self.find(y)
        if root_x == root_y:
            return False

        # Union by rank
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1

        self.num_components -= 1
        return True

    def is_connected(self, x: int, y: int) -> bool:
        return self.find(x) == self.find(y)

    def count(self) -> int:
        return self.num_components`,
  },
  {
    id: "bitmask_dp_71",
    command: "/bitmask-dp",
    name: "State Compression DP",
    description: "Bitmask Dynamic Programming / State Compression template in O(2^N * N^2)",
    languageId: 71,
    languageName: "Python 3",
    code: `# State Compression DP (Bitmask Dynamic Programming) - O(2^N * N^2)
# Template: Minimum Hamiltonian Cycle / Traveling Salesperson Problem (TSP)
def state_compression_dp(n: int, cost: list[list[int]]) -> int:
    full_mask = 1 << n
    inf = float('inf')

    # dp[mask][u] = minimum cost to visit subset 'mask' ending at node 'u'
    dp = [[inf] * n for _ in range(full_mask)]
    dp[1][0] = 0  # Start at node 0

    for mask in range(1, full_mask):
        for u in range(n):
            if not (mask & (1 << u)):
                continue
            if dp[mask][u] == inf:
                continue

            for v in range(n):
                if mask & (1 << v):
                    continue
                next_mask = mask | (1 << v)
                dp[next_mask][v] = min(dp[next_mask][v], dp[mask][u] + cost[u][v])

    min_cost = inf
    for u in range(1, n):
        min_cost = min(min_cost, dp[full_mask - 1][u] + cost[u][0])

    return min_cost`,
  },

  // ==========================================
  // Java (id: 62)
  // ==========================================
  {
    id: "segtree_62",
    command: "/segtree",
    name: "Segment Tree",
    description: "Point update and range sum query Segment Tree in O(log N)",
    languageId: 62,
    languageName: "Java (OpenJDK 17)",
    code: `// Segment Tree (Point Update & Range Query) - O(log N)
static class SegmentTree {
    private int n;
    private long[] tree;

    public SegmentTree(long[] arr) {
        this.n = arr.length;
        this.tree = new long[4 * n];
        if (n > 0) build(arr, 1, 0, n - 1);
    }

    private void build(long[] arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = start + (end - start) / 2;
        build(arr, 2 * node, start, mid);
        build(arr, 2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    public void update(int idx, long val) {
        update(1, 0, n - 1, idx, val);
    }

    private void update(int node, int start, int end, int idx, long val) {
        if (start == end) {
            tree[node] = val;
            return;
        }
        int mid = start + (end - start) / 2;
        if (idx <= mid) update(2 * node, start, mid, idx, val);
        else update(2 * node + 1, mid + 1, end, idx, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    public long query(int l, int r) {
        return query(1, 0, n - 1, l, r);
    }

    private long query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return tree[node];
        int mid = start + (end - start) / 2;
        return query(2 * node, start, mid, l, r) + query(2 * node + 1, mid + 1, end, l, r);
    }
}`,
  },
  {
    id: "dsu_62",
    command: "/dsu",
    name: "Disjoint Set Union (DSU)",
    description: "Union-Find with path compression and union by rank in O(α(N))",
    languageId: 62,
    languageName: "Java (OpenJDK 17)",
    code: `// Disjoint Set Union (DSU) / Union-Find with Path Compression & Union by Rank
static class DSU {
    private int[] parent;
    private int[] rank;
    private int numComponents;

    public DSU(int n) {
        parent = new int[n];
        rank = new int[n];
        numComponents = n;
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    public int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]); // Path compression
        }
        return parent[x];
    }

    public boolean unite(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        if (rootX == rootY) return false;

        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }
        numComponents--;
        return true;
    }

    public boolean isConnected(int x, int y) {
        return find(x) == find(y);
    }

    public int count() {
        return numComponents;
    }
}`,
  },
  {
    id: "bitmask_dp_62",
    command: "/bitmask-dp",
    name: "State Compression DP",
    description: "Bitmask Dynamic Programming / State Compression template in O(2^N * N^2)",
    languageId: 62,
    languageName: "Java (OpenJDK 17)",
    code: `// State Compression DP (Bitmask Dynamic Programming) - O(2^N * N^2)
// Template: Minimum Hamiltonian Cycle / Traveling Salesperson Problem (TSP)
public static int stateCompressionDP(int n, int[][] cost) {
    int fullMask = 1 << n;
    int INF = 1_000_000_000;

    int[][] dp = new int[fullMask][n];
    for (int[] row : dp) Arrays.fill(row, INF);
    dp[1][0] = 0; // Start at node 0

    for (int mask = 1; mask < fullMask; mask++) {
        for (int u = 0; u < n; u++) {
            if ((mask & (1 << u)) == 0) continue;
            if (dp[mask][u] == INF) continue;

            for (int v = 0; v < n; v++) {
                if ((mask & (1 << v)) != 0) continue;
                int nextMask = mask | (1 << v);
                dp[nextMask][v] = Math.min(dp[nextMask][v], dp[mask][u] + cost[u][v]);
            }
        }
    }

    int minCost = INF;
    for (int u = 1; u < n; u++) {
        minCost = Math.min(minCost, dp[fullMask - 1][u] + cost[u][0]);
    }
    return minCost;
}`,
  },

  // ==========================================
  // JavaScript (id: 63)
  // ==========================================
  {
    id: "segtree_63",
    command: "/segtree",
    name: "Segment Tree",
    description: "Point update and range sum query Segment Tree in O(log N)",
    languageId: 63,
    languageName: "JavaScript (Node.js 20)",
    code: `// Segment Tree (Point Update & Range Query) - O(log N)
class SegmentTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(0);
    if (this.n > 0) this.build(arr, 1, 0, this.n - 1);
  }

  build(arr, node, start, end) {
    if (start === end) {
      this.tree[node] = arr[start];
      return;
    }
    const mid = Math.floor((start + end) / 2);
    this.build(arr, 2 * node, start, mid);
    this.build(arr, 2 * node + 1, mid + 1, end);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  update(idx, val, node = 1, start = 0, end = this.n - 1) {
    if (start === end) {
      this.tree[node] = val;
      return;
    }
    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) this.update(idx, val, 2 * node, start, mid);
    else this.update(idx, val, 2 * node + 1, mid + 1, end);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  query(l, r, node = 1, start = 0, end = this.n - 1) {
    if (r < start || end < l) return 0;
    if (l <= start && end <= r) return this.tree[node];
    const mid = Math.floor((start + end) / 2);
    return this.query(l, r, 2 * node, start, mid) + this.query(l, r, 2 * node + 1, mid + 1, end);
  }
}`,
  },
  {
    id: "dsu_63",
    command: "/dsu",
    name: "Disjoint Set Union (DSU)",
    description: "Union-Find with path compression and union by rank in O(α(N))",
    languageId: 63,
    languageName: "JavaScript (Node.js 20)",
    code: `// Disjoint Set Union (DSU) / Union-Find with Path Compression & Union by Rank
class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.numComponents = n;
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  unite(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    this.numComponents--;
    return true;
  }

  isConnected(x, y) {
    return this.find(x) === this.find(y);
  }

  count() {
    return this.numComponents;
  }
}`,
  },
  {
    id: "bitmask_dp_63",
    command: "/bitmask-dp",
    name: "State Compression DP",
    description: "Bitmask Dynamic Programming / State Compression template in O(2^N * N^2)",
    languageId: 63,
    languageName: "JavaScript (Node.js 20)",
    code: `// State Compression DP (Bitmask Dynamic Programming) - O(2^N * N^2)
// Template: Minimum Hamiltonian Cycle / Traveling Salesperson Problem (TSP)
function stateCompressionDP(n, cost) {
  const fullMask = 1 << n;
  const INF = 1e9;

  const dp = Array.from({ length: fullMask }, () => new Array(n).fill(INF));
  dp[1][0] = 0; // Start at node 0 with mask 1

  for (let mask = 1; mask < fullMask; mask++) {
    for (let u = 0; u < n; u++) {
      if (!(mask & (1 << u))) continue;
      if (dp[mask][u] === INF) continue;

      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue;
        const nextMask = mask | (1 << v);
        dp[nextMask][v] = Math.min(dp[nextMask][v], dp[mask][u] + cost[u][v]);
      }
    }
  }

  let minCost = INF;
  for (let u = 1; u < n; u++) {
    minCost = Math.min(minCost, dp[fullMask - 1][u] + cost[u][0]);
  }
  return minCost;
}`,
  },
];

export default INITIAL_SEEDED_TEMPLATES;
