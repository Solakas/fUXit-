import React from 'react';
import type { HistoryEntry } from '../types';

interface HistoryItemProps {
  entry: HistoryEntry;
  onLoad: (entry: HistoryEntry) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ entry, onLoad }) => {
  const formattedDate = new Date(entry.timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <button
      onClick={() => onLoad(entry)}
      className="w-full flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <img
        src={entry.originalImage.url}
        alt="Analysis thumbnail"
        className="w-16 h-16 object-cover rounded-md mr-4 border border-gray-600"
      />
      <div className="flex-grow overflow-hidden">
        <p className="text-sm font-medium text-gray-200 truncate" title={entry.originalImage.filename}>
          {entry.originalImage.filename}
        </p>
        <p className="text-xs text-gray-500">{formattedDate}</p>
      </div>
    </button>
  );
};

export default HistoryItem;
