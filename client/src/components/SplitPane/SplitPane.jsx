import React, { useState, useEffect, useRef, useCallback } from "react";
import { getItemWithFallback } from "../../utils/storage";

export const SplitPane = ({
  children,
  minLeft = 320,
  minRight = 280,
  minTop = 200,
  minBottom = 180,
  storageKey = "codepad_split_ratio",
}) => {
  const [leftPane, rightPane] = React.Children.toArray(children);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 768 : false));

  // Split ratio stored as percentage (0.20 to 0.80), default 55%
  const [splitRatio, setSplitRatio] = useState(() => {
    try {
      const fallbackKey = storageKey === "codepad_split_ratio" ? "leetcode_ide_split_ratio" : null;
      const saved = getItemWithFallback(storageKey, fallbackKey);
      return saved ? Math.min(0.80, Math.max(0.20, parseFloat(saved))) : 0.55;
    } catch {
      return 0.55;
    }
  });

  // Track window resize for mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (!isMobile) {
        // Horizontal resizing
        const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : undefined);
        if (clientX === undefined) return;
        const offset = clientX - rect.left;
        const clampedOffset = Math.max(minLeft, Math.min(rect.width - minRight, offset));
        const newRatio = clampedOffset / rect.width;
        setSplitRatio(newRatio);
        try {
          localStorage.setItem(storageKey, newRatio.toString());
        } catch {}
      } else {
        // Vertical resizing
        const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : undefined);
        if (clientY === undefined) return;
        const offset = clientY - rect.top;
        const clampedOffset = Math.max(minTop, Math.min(rect.height - minBottom, offset));
        const newRatio = clampedOffset / rect.height;
        setSplitRatio(newRatio);
        try {
          localStorage.setItem(storageKey, newRatio.toString());
        } catch {}
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isDragging, isMobile, minLeft, minRight, minTop, minBottom, storageKey]);

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex ${isMobile ? "flex-col" : "flex-row"} w-full h-[calc(100vh-50px)] overflow-hidden ${
        isDragging ? "select-none cursor-" + (isMobile ? "row-resize" : "col-resize") : ""
      }`}
    >
      {/* Primary Pane (Code Editor) */}
      <div
        style={!isMobile ? { width: `${splitRatio * 100}%` } : { height: `${splitRatio * 100}%` }}
        className="overflow-hidden flex flex-col relative"
      >
        {leftPane}
        {/* Transparent overlay during dragging prevents iframe/monaco event stealing */}
        {isDragging && <div className="absolute inset-0 z-50 bg-transparent" />}
      </div>

      {/* Draggable Divider Handle */}
      <div
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        title="Drag to resize panels"
        className={`${
          isMobile
            ? "h-2 w-full cursor-row-resize border-y border-[#333333]"
            : "w-2 h-full cursor-col-resize border-x border-[#333333]"
        } bg-[#1e1e1e] hover:bg-[#383838] transition-colors flex items-center justify-center group select-none z-10 flex-shrink-0`}
      >
        <div
          className={`${
            isMobile ? "w-8 h-1" : "w-1 h-8"
          } bg-[#555555] group-hover:bg-[#ffa116] rounded-full transition-colors`}
        />
      </div>

      {/* Secondary Pane (Console / Testcases) */}
      <div
        style={!isMobile ? { width: `${(1 - splitRatio) * 100}%` } : { height: `${(1 - splitRatio) * 100}%` }}
        className="overflow-hidden flex flex-col relative"
      >
        {rightPane}
        {isDragging && <div className="absolute inset-0 z-50 bg-transparent" />}
      </div>
    </div>
  );
};

export default SplitPane;
