import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export function MicIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="1" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="22" />
    </svg>
  );
}

export function StopIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export function SpeakerIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

export function PlayingIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="5" y1="6" x2="5" y2="18">
        <animate
          attributeName="y1"
          values="6;10;6"
          dur="0.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y2"
          values="18;14;18"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </line>
      <line x1="10" y1="4" x2="10" y2="20">
        <animate
          attributeName="y1"
          values="4;8;4"
          dur="0.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y2"
          values="20;16;20"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </line>
      <line x1="15" y1="8" x2="15" y2="16">
        <animate
          attributeName="y1"
          values="8;5;8"
          dur="0.7s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y2"
          values="16;19;16"
          dur="0.7s"
          repeatCount="indefinite"
        />
      </line>
      <line x1="19" y1="6" x2="19" y2="18">
        <animate
          attributeName="y1"
          values="6;9;6"
          dur="0.55s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y2"
          values="18;15;18"
          dur="0.55s"
          repeatCount="indefinite"
        />
      </line>
    </svg>
  );
}

export function ResetIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}
