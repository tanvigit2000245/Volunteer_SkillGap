import React from 'react';

export default function DecorativePanel() {
  return (
    <div className="w-full h-full relative overflow-hidden select-none flex items-stretch">
      <img
        src="/img1.png"
        alt="Volunteer Skill Gap"
        className="w-full h-full object-cover object-left select-none pointer-events-none"
      />
    </div>
  );
}
