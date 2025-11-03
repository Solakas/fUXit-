
import React, { useState } from 'react';
import StarIcon from './icons/StarIcon';

interface RatingProps {
  onSubmit: (rating: number, feedback: string) => void;
}

const Rating: React.FC<RatingProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, feedback);
    }
  };

  return (
    <div className="bg-gray-800 max-w-lg mx-auto p-6 rounded-lg shadow-2xl mb-8">
      <h3 className="text-xl font-bold text-white mb-4 text-center">Rate the Analysis</h3>
      <div className="flex justify-center items-center space-x-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
            aria-label={`Rate ${star} out of 5 stars`}
          >
            <StarIcon
              className="w-8 h-8 cursor-pointer transition-colors"
              filled={star <= (hoverRating || rating)}
            />
          </button>
        ))}
      </div>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Optional: Provide additional feedback..."
        className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        rows={3}
      />
      <button
        onClick={handleSubmit}
        disabled={rating === 0}
        className="mt-4 w-full inline-flex items-center justify-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
      >
        Submit Feedback
      </button>
    </div>
  );
};

export default Rating;
