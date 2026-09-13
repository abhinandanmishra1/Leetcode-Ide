import React from "react";

/**
 * CodePadLogo
 * Full 220x220 official CodePad SVG logo including editor glyph and wordmark.
 */
export default function CodePadLogo({
  className,
  width = 220,
  height = 220,
  ...props
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Icon */}
      <g transform="translate(30 10)">
        {/* Editor frame */}
        <path
          d="M20 10H125L160 45V145C160 156.046 151.046 165 140 165H20C8.954 165 0 156.046 0 145V30C0 18.954 8.954 10 20 10Z"
          fill="#282828"
        />

        {/* Orange folded corner */}
        <path
          d="M125 10V35C125 46.046 133.954 55 145 55H160L125 10Z"
          fill="#FFA116"
        />

        {/* Inner editor */}
        <rect
          x="12"
          y="52"
          width="136"
          height="101"
          rx="10"
          fill="white"
        />

        {/* Window dots */}
        <circle cx="28" cy="34" r="5" fill="#FFA116" />
        <circle cx="44" cy="34" r="5" fill="#B3B3B3" />
        <circle cx="60" cy="34" r="5" fill="#B3B3B3" />

        {/* < */}
        <path
          d="M48 82L34 96L48 110"
          stroke="#FFA116"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* / */}
        <path
          d="M82 78L70 114"
          stroke="#282828"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* > */}
        <path
          d="M104 82L118 96L104 110"
          stroke="#FFA116"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Wordmark */}
      <text
        x="27"
        y="202"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="31"
        fontWeight="700"
        letterSpacing="-1.5"
      >
        <tspan fill="#282828">Code</tspan>
        <tspan fill="#FFA116">Pad</tspan>
      </text>
    </svg>
  );
}

/**
 * CodePadIcon
 * Isolated vector editor icon glyph (viewBox="0 0 160 165") without text wordmark.
 */
export function CodePadIcon({
  size = 30,
  className,
  width,
  height,
  ...props
}) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 160 165"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Editor frame */}
      <path
        d="M20 10H125L160 45V145C160 156.046 151.046 165 140 165H20C8.954 165 0 156.046 0 145V30C0 18.954 8.954 10 20 10Z"
        fill="#282828"
      />

      {/* Orange folded corner */}
      <path
        d="M125 10V35C125 46.046 133.954 55 145 55H160L125 10Z"
        fill="#FFA116"
      />

      {/* Inner editor */}
      <rect
        x="12"
        y="52"
        width="136"
        height="101"
        rx="10"
        fill="white"
      />

      {/* Window dots */}
      <circle cx="28" cy="34" r="5" fill="#FFA116" />
      <circle cx="44" cy="34" r="5" fill="#B3B3B3" />
      <circle cx="60" cy="34" r="5" fill="#B3B3B3" />

      {/* < */}
      <path
        d="M48 82L34 96L48 110"
        stroke="#FFA116"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* / */}
      <path
        d="M82 78L70 114"
        stroke="#282828"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* > */}
      <path
        d="M104 82L118 96L104 110"
        stroke="#FFA116"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * CodePadBrand
 * Horizontal navigation bar lockup combining CodePadIcon with styled typography and IDE badge.
 */
export function CodePadBrand({ className = "", ...props }) {
  return (
    <div
      className={`flex items-center space-x-2 select-none flex-shrink-0 ${className}`.trim()}
      {...props}
    >
      <CodePadIcon size={30} />
      <div className="flex items-center">
        <span className="text-white font-bold text-lg tracking-tight">Code</span>
        <span className="text-[#FFA116] font-bold text-lg tracking-tight">Pad</span>
      </div>
      <span className="text-[10px] bg-[#3a3a3a] text-gray-300 font-mono px-1.5 py-0.5 rounded font-medium">
        IDE
      </span>
    </div>
  );
}
