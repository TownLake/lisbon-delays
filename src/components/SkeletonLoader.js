// SkeletonLoader.js
import React from 'react';

const SkeletonLoader = () => (
  <div className="centered-flex h-64 bg-gray-200 animate-pulse rounded-lg">
    <div className="w-full max-w-lg h-32 bg-gray-300 rounded-lg"></div>
  </div>
);

export default SkeletonLoader;
