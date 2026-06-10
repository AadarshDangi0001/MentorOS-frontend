import React from 'react';

export default function StarRating({ rating, reviewsCount }) {
  return (
    <div className="text-right flex flex-col items-end">
      <div className="flex items-center gap-1 text-primary-container mb-1">
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          star
        </span>
        <span className="font-label-md text-label-md">{rating.toFixed(1)}</span>
      </div>
      {reviewsCount !== undefined && (
        <p className="text-xs text-secondary">({reviewsCount} reviews)</p>
      )}
    </div>
  );
}
