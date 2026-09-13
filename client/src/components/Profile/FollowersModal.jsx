import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUsers,
  faSearch,
  faUserCheck,
  faUserPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import UserAvatar from "../common/UserAvatar";
import { usersApi } from "../../api";
import { useAuth } from "../../context/AuthContext";

const FollowersModal = ({
  isOpen,
  onClose,
  username,
  initialTab = "followers",
  onFollowCountChange,
  onOpenAuthModal,
}) => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingMap, setTogglingMap] = useState({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery("");
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen || !username) return;

    let isMounted = true;
    setLoading(true);

    const fetchList =
      activeTab === "followers"
        ? usersApi.getFollowers(username)
        : usersApi.getFollowing(username);

    fetchList
      .then((data) => {
        if (isMounted) {
          setUsersList(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        console.error("Failed to load followers/following:", err);
        if (isMounted) setUsersList([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, username, activeTab]);

  if (!isOpen) return null;

  const handleToggleFollow = async (targetUser) => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    const tUsername = targetUser.username;
    setTogglingMap((prev) => ({ ...prev, [tUsername]: true }));

    try {
      const res = await usersApi.toggleFollow(tUsername);
      setUsersList((prev) =>
        prev.map((u) =>
          u.username === tUsername ? { ...u, isFollowing: res.following } : u
        )
      );

      if (onFollowCountChange) {
        onFollowCountChange({
          username: tUsername,
          isFollowing: res.following,
          followersCount: res.followersCount,
          tab: activeTab,
        });
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    } finally {
      setTogglingMap((prev) => ({ ...prev, [tUsername]: false }));
    }
  };

  const filteredUsers = usersList.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.bio && u.bio.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#1e1e1e] border border-[#3e3e3e] rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-gray-200 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2d2d2d] bg-[#252525]">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faUsers} className="text-[#ffa116]" />
            <span className="text-sm font-bold text-white">
              @{username}'s Network
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md"
          >
            <FontAwesomeIcon icon={faTimes} className="text-sm" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 border-b border-[#2d2d2d] bg-[#1a1a1a] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("followers")}
            className={`py-3 text-center transition-colors border-b-2 ${
              activeTab === "followers"
                ? "border-[#ffa116] text-[#ffa116] bg-[#222222]"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#1f1f1f]"
            }`}
          >
            Followers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("following")}
            className={`py-3 text-center transition-colors border-b-2 ${
              activeTab === "following"
                ? "border-[#ffa116] text-[#ffa116] bg-[#222222]"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#1f1f1f]"
            }`}
          >
            Following
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-[#2d2d2d] bg-[#181818]">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"
            />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121212] border border-[#333333] rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#ffa116]"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <FontAwesomeIcon
                icon={faSpinner}
                className="animate-spin text-lg text-[#ffa116]"
              />
              <div className="text-xs">Loading {activeTab}...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-1">
              <p className="text-xs font-medium text-gray-400">
                {searchQuery
                  ? "No matching users found"
                  : activeTab === "followers"
                  ? "No followers yet"
                  : "Not following anyone yet"}
              </p>
              <p className="text-[11px] text-gray-600">
                {searchQuery
                  ? "Try a different search term"
                  : activeTab === "followers"
                  ? "Be the first to follow this developer!"
                  : "Start exploring community coders on Explore."}
              </p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isBusy = togglingMap[u.username];
              const isCurrentUserSelf =
                currentUser &&
                (currentUser.username === u.username ||
                  (u.isSelf !== undefined && u.isSelf));

              return (
                <div
                  key={u.id || u.username}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#222222]/80 hover:bg-[#282828] border border-[#2e2e2e] transition-colors"
                >
                  {/* User Profile Info */}
                  <Link
                    to={`/u/${u.username}`}
                    onClick={onClose}
                    className="flex items-center space-x-3 min-w-0 flex-1 pr-3 group"
                  >
                    <UserAvatar
                      avatar={u.avatar}
                      name={u.name}
                      username={u.username}
                      size="md"
                      className="border border-[#3e3e3e] group-hover:border-[#ffa116] transition-colors flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-white group-hover:text-[#ffa116] transition-colors truncate">
                          {u.name || u.username}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono truncate">
                          @{u.username}
                        </span>
                      </div>
                      {u.bio && (
                        <p className="text-[11px] text-gray-400 truncate max-w-xs pt-0.5">
                          {u.bio}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Follow / Unfollow Action Button */}
                  {!isCurrentUserSelf && (
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleToggleFollow(u)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 flex items-center space-x-1.5 ${
                          u.isFollowing
                            ? "bg-[#2c2c2c] hover:bg-red-950/50 hover:text-red-300 hover:border-red-700/60 text-gray-300 border border-[#3e3e3e] group/btn"
                            : "bg-[#ffa116] hover:bg-[#e08d0e] text-black"
                        }`}
                      >
                        {isBusy ? (
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin text-[10px]"
                          />
                        ) : u.isFollowing ? (
                          <>
                            <FontAwesomeIcon
                              icon={faUserCheck}
                              className="text-[10px] text-[#2cbb5d] group-hover/btn:hidden"
                            />
                            <span className="group-hover/btn:hidden">Following</span>
                            <span className="hidden group-hover/btn:inline text-red-400">
                              Unfollow
                            </span>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faUserPlus}
                              className="text-[10px]"
                            />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
