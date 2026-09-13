/**
 * Battle-tested Competitive Programming Templates
 * These are available in the editor via slash commands (e.g. /trie, /dsu)
 */
export const DEFAULT_TEMPLATES = [
  {
    command: "/trie",
    name: "Trie (Prefix Tree)",
    description: "Trie implementation with insert, search, and startsWith",
    code: `class Trie {
private:
    struct Node {
        Node* links[26] = {nullptr};
        bool isEnd = false;
        
        bool containsKey(char ch) { return links[ch - 'a'] != nullptr; }
        Node* get(char ch) { return links[ch - 'a']; }
        void put(char ch, Node* node) { links[ch - 'a'] = node; }
        void setEnd() { isEnd = true; }
    };
    
    Node* root;

public:
    Trie() { root = new Node(); }
    
    void insert(const string& word) {
        Node* node = root;
        for (char ch : word) {
            if (!node->containsKey(ch)) {
                node->put(ch, new Node());
            }
            node = node->get(ch);
        }
        node->setEnd();
    }
    
    bool search(const string& word) {
        Node* node = root;
        for (char ch : word) {
            if (!node->containsKey(ch)) return false;
            node = node->get(ch);
        }
        return node->isEnd;
    }
    
    bool startsWith(const string& prefix) {
        Node* node = root;
        for (char ch : prefix) {
            if (!node->containsKey(ch)) return false;
            node = node->get(ch);
        }
        return true;
    }
};`,
  },
  {
    command: "/dsu",
    name: "Disjoint Set Union (DSU / Union-Find)",
    description: "DSU with path compression and union by rank/size",
    code: `class DSU {
private:
    vector<int> parent;
    vector<int> size;

public:
    DSU(int n) : parent(n), size(n, 1) {
        iota(parent.begin(), parent.end(), 0);
    }
    
    int find(int x) {
        if (parent[x] == x) return x;
        return parent[x] = find(parent[x]); // Path compression
    }
    
    bool unite(int a, int b) {
        int rootA = find(a);
        int rootB = find(b);
        if (rootA == rootB) return false;
        
        if (size[rootA] < size[rootB]) swap(rootA, rootB);
        parent[rootB] = rootA;
        size[rootA] += size[rootB];
        return true;
    }
    
    bool connected(int a, int b) {
        return find(a) == find(b);
    }
};`,
  },
  {
    command: "/segtree",
    name: "Segment Tree",
    description: "Range sum query with point updates",
    code: `class SegmentTree {
private:
    int n;
    vector<long long> tree;

    void build(const vector<long long>& arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = start + (end - start) / 2;
        build(arr, 2 * node, start, mid);
        build(arr, 2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    void update(int node, int start, int end, int idx, long long val) {
        if (start == end) {
            tree[node] = val;
            return;
        }
        int mid = start + (end - start) / 2;
        if (idx <= mid) update(2 * node, start, mid, idx, val);
        else update(2 * node + 1, mid + 1, end, idx, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    long long query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return tree[node];
        int mid = start + (end - start) / 2;
        return query(2 * node, start, mid, l, r) + query(2 * node + 1, mid + 1, end, l, r);
    }

public:
    SegmentTree(const vector<long long>& arr) {
        n = arr.size();
        tree.resize(4 * n, 0);
        if (n > 0) build(arr, 1, 0, n - 1);
    }

    void update(int idx, long long val) {
        update(1, 0, n - 1, idx, val);
    }

    long long query(int l, int r) {
        return query(1, 0, n - 1, l, r);
    }
};`,
  },
  {
    command: "/dijkstra",
    name: "Dijkstra's Shortest Path",
    description: "Single-source shortest paths on weighted graph using min-heap",
    code: `vector<long long> dijkstra(int n, int src, const vector<vector<pair<int, int>>>& adj) {
    constexpr long long INF = 1e18;
    vector<long long> dist(n, INF);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (const auto& [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
  },
  {
    command: "/bfs",
    name: "Breadth-First Search (BFS)",
    description: "Level-order traversal and unweighted shortest path template",
    code: `void bfs(int start, const vector<vector<int>>& adj, int n) {
    vector<bool> visited(n, false);
    queue<int> q;

    visited[start] = true;
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}`,
  },
  {
    command: "/dfs",
    name: "Depth-First Search (DFS)",
    description: "Recursive graph traversal template",
    code: `void dfs(int u, const vector<vector<int>>& adj, vector<bool>& visited) {
    visited[u] = true;
    for (int v : adj[u]) {
        if (!visited[v]) {
            dfs(v, adj, visited);
        }
    }
}`,
  },
  {
    command: "/binarysearch",
    name: "Binary Search Template",
    description: "Robust binary search boundary condition template",
    code: `int binarySearch(const vector<int>& arr, int target) {
    int left = 0, right = static_cast<int>(arr.size()) - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1; // Not found
}`,
  },
  {
    command: "/modexp",
    name: "Fast Modular Exponentiation",
    description: "Computes (base^exp) % mod in O(log exp)",
    code: `long long power(long long base, long long exp, long long mod = 1000000007) {
    long long res = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) res = (res * base) % mod;
        base = (base * base) % mod;
        exp >>= 1;
    }
    return res;
}`,
  },
];

export default DEFAULT_TEMPLATES;
