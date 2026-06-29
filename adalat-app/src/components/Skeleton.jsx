import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonBox = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-dark-800 border border-dark-700 ${className}`}
    />
  );
};

export const SkeletonText = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-dark-700 rounded-sm ${className}`}
    />
  );
};

export const EscrowSkeleton = () => {
  return (
    <div className="bg-dark-900 border border-dark-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div className="space-y-3 w-full md:w-1/2">
        <div className="flex space-x-2">
          <SkeletonBox className="h-6 w-16" />
          <SkeletonBox className="h-6 w-20" />
        </div>
        <SkeletonText className="h-4 w-32" />
        <SkeletonText className="h-3 w-48" />
      </div>
      <div className="flex space-x-3 w-full md:w-auto">
        <SkeletonBox className="h-8 w-24" />
        <SkeletonBox className="h-8 w-24" />
      </div>
    </div>
  );
};

export const JurorPanelSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-12">
      <div className="p-6 bg-dark-900 border border-dark-800 flex justify-between items-center">
        <div className="space-y-2">
          <SkeletonText className="h-3 w-24" />
          <SkeletonText className="h-6 w-16" />
        </div>
        <SkeletonBox className="h-10 w-32" />
      </div>
      
      <div className="p-8 border border-dark-700 bg-dark-900/50 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <SkeletonText className="h-4 w-32" />
            <SkeletonText className="h-4 w-40" />
          </div>
          <SkeletonBox className="h-6 w-24" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <SkeletonBox className="h-24 w-full" />
          <SkeletonBox className="h-24 w-full" />
        </div>
        
        <div className="pt-8 flex justify-center space-x-4">
          <SkeletonBox className="h-12 w-48" />
          <SkeletonBox className="h-12 w-48" />
        </div>
      </div>
    </div>
  );
};
