import React from 'react';
import type { HistoryEntry } from '../types';
import HistoryItem from './HistoryItem';
import TrashIcon from './icons/TrashIcon';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onLoadFromHistory: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoadFromHistory, onClearHistory }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-2xl flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
        <h2 className="text-xl font-bold text-white">History</h2>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center text-sm text-gray-400 hover:text-red-400 transition-colors"
            aria-label="Clear history"
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            Clear
          </button>
        )}
      </div>
      <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2 max-h-96">
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No past analyses found.</p>
        ) : (
          history.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} onLoad={onLoadFromHistory} />
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
