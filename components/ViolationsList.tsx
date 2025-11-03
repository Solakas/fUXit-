import React, { useState } from 'react';
import type { Violation } from '../types';
import ViolationIcon from './icons/ViolationIcon';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';

interface ViolationsListProps {
  violations: Violation[];
  onHoverViolation: (violation: Violation | null) => void;
}

const ViolationsList: React.FC<ViolationsListProps> = ({ violations, onHoverViolation }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!violations || violations.length === 0) {
    return null;
  }

  const handleCopy = () => {
    const textToCopy = violations
      .map(v => `Category: ${v.category}\nDescription: ${v.description}`)
      .join('\n\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
        console.error("Failed to copy violations:", err);
    });
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-700">
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-red-400">UI/UX Violations</h3>
        <button
          onClick={handleCopy}
          className={`flex items-center text-sm px-3 py-1 rounded-md transition-all duration-200 ${
            isCopied
              ? 'bg-green-600/20 text-green-400'
              : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
          }`}
          aria-live="polite"
        >
          {isCopied ? (
            <>
              <CheckIcon className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4 mr-2" />
              Copy All
            </>
          )}
        </button>
      </div>
      <ul className="space-y-3">
        {violations.map((violation) => (
          <li
            key={violation.id}
            onMouseEnter={() => onHoverViolation(violation)}
            onMouseLeave={() => onHoverViolation(null)}
            className="flex items-start p-3 rounded-md transition-colors bg-gray-800/50 hover:bg-gray-700/50 cursor-pointer"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center mr-4 mt-1 ring-1 ring-red-500/30">
                <ViolationIcon className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h4 className="font-semibold text-indigo-300">{violation.category}</h4>
              <p className="text-gray-400 text-sm">{violation.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViolationsList;
