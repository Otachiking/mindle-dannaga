'use client';

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-[#0b2d79] to-[#1470e6] text-white py-4 mt-8">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-1">
          <p className="text-sm font-medium">
            Copyright © 2026 - Mindle Data Analyst Competition
          </p>
          <p className="text-xs text-white/70">
            Created by <span className="font-semibold text-white">Dan Naga</span> (Muhammad Iqbal Rasyid & Dilla Agustin Nurul Ashfiya)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
