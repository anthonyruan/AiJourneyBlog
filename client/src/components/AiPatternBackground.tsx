import React from 'react';

export default function AiPatternBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10">
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-800"
      >
        <defs>
          <pattern
            id="ai-pattern"
            patternUnits="userSpaceOnUse"
            width="100"
            height="100"
            patternTransform="scale(2) rotate(0)"
          >
            {/* Circuit lines */}
            <path d="M10,10 L40,10 L40,40" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M60,10 L90,10 L90,40" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M10,60 L10,90 L40,90" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M60,90 L90,90 L90,60" fill="none" stroke="currentColor" strokeWidth="1" />
            
            {/* Nodes */}
            <circle cx="10" cy="10" r="2" fill="currentColor" />
            <circle cx="40" cy="10" r="2" fill="currentColor" />
            <circle cx="40" cy="40" r="2" fill="currentColor" />
            <circle cx="60" cy="10" r="2" fill="currentColor" />
            <circle cx="90" cy="10" r="2" fill="currentColor" />
            <circle cx="90" cy="40" r="2" fill="currentColor" />
            <circle cx="10" cy="60" r="2" fill="currentColor" />
            <circle cx="10" cy="90" r="2" fill="currentColor" />
            <circle cx="40" cy="90" r="2" fill="currentColor" />
            <circle cx="60" cy="90" r="2" fill="currentColor" />
            <circle cx="90" cy="90" r="2" fill="currentColor" />
            <circle cx="90" cy="60" r="2" fill="currentColor" />
            
            {/* Connecting lines */}
            <path d="M25,40 L25,60" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M75,40 L75,60" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M40,25 L60,25" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M40,75 L60,75" fill="none" stroke="currentColor" strokeWidth="1" />
            
            {/* Brain Icon */}
            <path d="M50,45 C55,40 60,45 60,50 C60,55 55,60 50,55 C45,60 40,55 40,50 C40,45 45,40 50,45" 
                  fill="none" stroke="currentColor" strokeWidth="1" />
            
            {/* AI text */}
            <path d="M45,48 L45,52 M48,48 L48,52 M45,50 L48,50" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M51,48 L51,52" fill="none" stroke="currentColor" strokeWidth="1.5" />
            
            {/* Additional tech elements */}
            <rect x="70" y="45" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="50" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ai-pattern)" />
      </svg>
    </div>
  );
}