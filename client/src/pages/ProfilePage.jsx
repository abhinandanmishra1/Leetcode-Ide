import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCalendar,
  faCode,
  faUsers,
  faCodeFork,
  faUserPlus,
  faUserCheck,
  faEdit,
  faCheck,
  faArrowLeft,
  faCompass,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { CodePadBrand } from "../components/Brand/CodePadLogo";
import AuthModal from "../components/Auth/AuthModal";
import UserAvatar from "../components/common/UserAvatar";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../api";

function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateProfile } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!username) return;

    if (username.toLowerCase() === "author") {
      navigate("/u/admin", { replace: true });
      return;
    }

    setLoading(true);
    Promise.all([
      usersApi.getProfile(username),
      usersApi.getSnippets(username),
    ])
      .then(([prof, userSnippets]) => {
        setProfileData(prof);
        setIsFollowing(prof.isFollowing);
        setFollowerCount(prof.stats?.followers || 0);
        setSnippets(userSnippets || []);
      })
      .catch((err) => {
        console.error("Failed to load user profile:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const res = await usersApi.toggleFollow(username);
      setIsFollowing(res.following);
      setFollowerCount(res.followersCount);
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const openEditModal = () => {
    if (!profileData?.user) return;
    setEditName(profileData.user.name || "");
    setEditUsername(profileData.user.username || "");
    setEditBio(profileData.user.bio || "");
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError(null);

    const cleanUsername = editUsername.trim().toLowerCase();
    const cleanName = editName.trim();

    if (!cleanUsername) {
      setEditError("Username cannot be empty");
      return;
    }

    if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
      setEditError("Username must be 3-30 characters with only lowercase letters, numbers, and underscores");
      return;
    }

    setEditLoading(true);
    try {
      const res = await updateProfile({
        name: cleanName,
        username: cleanUsername,
        bio: editBio,
      });

      if (!res.success) {
        setEditError(res.error || "Failed to update profile");
        setEditLoading(false);
        return;
      }

      setProfileData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          name: res.user?.name || cleanName,
          username: res.user?.username || cleanUsername,
          bio: res.user?.bio ?? editBio,
        },
      }));
      setIsEditModalOpen(false);

      if (cleanUsername !== username.toLowerCase()) {
        navigate(`/u/${cleanUsername}`, { replace: true });
      }
    } catch (err) {
      setEditError(err.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const isSelf = currentUser && profileData?.user && currentUser.username === profileData.user.username;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-gray-200 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs text-gray-400">Loading developer profile...</div>
        </div>
      </div>
    );
  }

  if (!profileData?.user) {
    return (
      <div className="min-h-screen bg-[#141414] text-gray-200 flex flex-col items-center justify-center space-y-4 p-4">
        <h2 className="text-2xl font-bold text-white">User @{username} not found</h2>
        <p className="text-xs text-gray-400">The developer profile you are looking for does not exist.</p>
        <Link
          to="/explore"
          className="px-4 py-2 bg-[#262626] hover:bg-[#303030] text-xs font-semibold rounded-lg text-white"
        >
          Explore Community Coders
        </Link>
      </div>
    );
  }

  const user = profileData.user;
  const stats = profileData.stats || { snippets: 0, followers: 0, following: 0 };

  return (
    <div className="min-h-screen bg-[#141414] text-gray-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#1e1e1e]/90 backdrop-blur-md border-b border-[#2d2d2d] px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <CodePadBrand />
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/explore"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-[#282828] hover:bg-[#333333] border border-[#3e3e3e] rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faCompass} className="text-[#ffa116]" />
              <span>Explore</span>
            </Link>
            <Link
              to="/ide"
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#2cbb5d] hover:bg-[#26a050] text-white rounded-lg transition-colors shadow"
            >
              Open IDE
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Banner */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-5">
              <UserAvatar
                avatar={user.avatar}
                name={user.name}
                username={user.username}
                size="xl"
                className="border-2 border-[#ffa116]/80 shadow-lg"
              />

              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">{user.name}</h1>
                  <span className="text-xs sm:text-sm font-mono text-[#ffa116]">@{user.username}</span>
                </div>

                {/* Bio */}
                <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
                  {user.bio || (isSelf ? "Add a short bio to introduce yourself..." : "No bio provided.")}
                  {isSelf && (
                    <button
                      type="button"
                      onClick={openEditModal}
                      title="Edit profile & username"
                      className="ml-2 text-gray-500 hover:text-[#ffa116] transition-colors text-xs inline-flex items-center space-x-1"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      <span className="text-[11px] underline">Edit</span>
                    </button>
                  )}
                </p>

                <div className="flex items-center space-x-4 text-xs text-gray-500 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <FontAwesomeIcon icon={faCalendar} className="text-[10px]" />
                    <span>
                      Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "recently"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow / Edit Button */}
            <div className="flex items-center space-x-3 self-end sm:self-center">
              {isSelf ? (
                <button
                  type="button"
                  onClick={openEditModal}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow active:scale-95 bg-[#262626] hover:bg-[#333333] text-gray-200 border border-[#3e3e3e] hover:border-[#ffa116]"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-[#ffa116]" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow active:scale-95 ${
                    isFollowing
                      ? "bg-[#282828] hover:bg-[#333333] text-gray-200 border border-[#3e3e3e]"
                      : "bg-[#ffa116] hover:bg-[#e08d0e] text-black"
                  }`}
                >
                  <FontAwesomeIcon icon={isFollowing ? faUserCheck : faUserPlus} />
                  <span>{isFollowing ? "Following" : "Follow"}</span>
                </button>
              )}
            </div>
          </div>

          {/* User Metrics Counters */}
          <div className="grid grid-cols-3 gap-4 border-t border-[#2d2d2d] mt-6 pt-5 text-center sm:text-left">
            <div>
              <div className="text-lg sm:text-xl font-bold text-white">{snippets.length}</div>
              <div className="text-[11px] text-gray-500 flex items-center justify-center sm:justify-start space-x-1">
                <FontAwesomeIcon icon={faCode} className="text-[10px]" />
                <span>Public Snippets</span>
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold text-white">{followerCount}</div>
              <div className="text-[11px] text-gray-500 flex items-center justify-center sm:justify-start space-x-1">
                <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                <span>Followers</span>
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold text-white">{stats.following || 0}</div>
              <div className="text-[11px] text-gray-500 flex items-center justify-center sm:justify-start space-x-1">
                <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                <span>Following</span>
              </div>
            </div>
          </div>
        </div>

        {/* User's Public Snippets Collection */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FontAwesomeIcon icon={faCode} className="text-[#ffa116]" />
              <span>Shared Code & Solutions</span>
            </h2>
            <span className="text-xs text-gray-500">{snippets.length} total</span>
          </div>

          {snippets.length === 0 ? (
            <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl p-10 text-center space-y-3">
              <div className="text-gray-500 text-sm">No public snippets published yet.</div>
              {isSelf && (
                <Link
                  to="/ide"
                  className="inline-block px-4 py-2 bg-[#2cbb5d] hover:bg-[#26a050] text-white text-xs font-semibold rounded-lg"
                >
                  Write Your First Snippet
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {snippets.map((s) => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/s/${s.snippetId}`)}
                  className="bg-[#1c1c1c] border border-[#2d2d2d] hover:border-[#3e3e3e] rounded-xl p-4 cursor-pointer transition-all hover:bg-[#202020] flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2c22] text-[#2cbb5d] border border-[#2cbb5d]/30">
                        {s.languageName}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#ffa116] transition-colors line-clamp-1">
                      {s.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {s.description || "LeetCode-style algorithmic solution"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#262626] text-[11px] text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1" title={`${s.forksCount || 0} forks`}>
                        <FontAwesomeIcon icon={faCodeFork} className="text-[9px]" />
                        <span>{s.forksCount || 0}</span>
                      </span>
                    </div>
                    <span className="text-[#ffa116] text-xs font-semibold group-hover:underline">
                      Run & Inspect →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1e1e1e] border border-[#333333] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-4">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faEdit} className="text-[#ffa116]" />
                <h3 className="text-base font-bold text-white">Edit Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-xs text-red-300">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  maxLength={50}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Alex Turing"
                  className="w-full bg-[#141414] border border-[#3a3a3a] focus:border-[#ffa116] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Username
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs text-gray-500 font-mono">@</span>
                  <input
                    type="text"
                    value={editUsername}
                    maxLength={30}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username"
                    className="w-full bg-[#141414] border border-[#3a3a3a] focus:border-[#ffa116] rounded-xl pl-7 pr-3 py-2 text-xs text-white font-mono placeholder-gray-500 focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  3-30 characters (lowercase letters, numbers, underscores). Your profile URL will be <span className="text-gray-400 font-mono">/u/{editUsername || "username"}</span>.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-300">
                    Bio
                  </label>
                  <span className="text-[11px] text-gray-500">{editBio.length}/250</span>
                </div>
                <textarea
                  value={editBio}
                  maxLength={250}
                  rows={3}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell other developers about yourself, contest rankings, or favorite algorithms..."
                  className="w-full bg-[#141414] border border-[#3a3a3a] focus:border-[#ffa116] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editLoading}
                  className="px-4 py-2 bg-[#282828] hover:bg-[#333333] text-gray-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center space-x-2 px-5 py-2 bg-[#ffa116] hover:bg-[#e08d0e] disabled:opacity-50 text-black text-xs font-bold rounded-xl transition-all shadow"
                >
                  {editLoading && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />}
                  <span>{editLoading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
