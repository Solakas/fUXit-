import React, { useState } from 'react';

interface ImageComparatorProps {
  originalImageUrl: string;
  improvedImageUrl: string;
}

const ImageComparator: React.FC<ImageComparatorProps> = ({ originalImageUrl, improvedImageUrl }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative w-full aspect-[9/16] sm:aspect-video max-w-full mx-auto select-none rounded-lg overflow-hidden group shadow-xl border-2 border-gray-700">
      {/* Improved Image (clipped) */}
      <div
        className="absolute top-0 left-0 h-full w-full"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img
          src={improvedImageUrl}
          alt="Improved design"
          className="h-full w-full object-contain object-left"
        />
         <div className="absolute top-2 right-2 bg-green-500/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none">
            IMPROVED
        </div>
      </div>

      {/* Original Image (base) */}
      <img
        src={originalImageUrl}
        alt="Original design"
        className="block h-full w-full object-contain object-left"
      />
      <div className="absolute top-2 left-2 bg-gray-500/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none">
          ORIGINAL
      </div>

      {/* Slider */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white/70 backdrop-blur-sm cursor-ew-resize pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-2xl backdrop-blur-sm flex items-center justify-center text-gray-600 transition-transform duration-200 group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 rotate-90">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
          </svg>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onInput={(e: React.ChangeEvent<HTMLInputElement>) => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        aria-label="Image comparison slider"
      />
    </div>
  );
};

export default ImageComparator;
