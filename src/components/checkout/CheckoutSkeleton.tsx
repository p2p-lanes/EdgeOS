'use client';

import { motion } from 'framer-motion';

const PassRowSkeleton = () => (
  <div className="px-5 py-3 flex items-center justify-between gap-4">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {/* Checkbox */}
      <div className="w-5 h-5 rounded-md bg-gray-200 flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200 flex-shrink-0" />
          <div className="h-4 w-32 bg-gray-200 rounded-md" />
        </div>
        <div className="h-3 w-24 bg-gray-100 rounded-md ml-6" />
      </div>
    </div>
    <div className="flex-shrink-0 space-y-1.5 flex flex-col items-end">
      <div className="h-3 w-10 bg-gray-100 rounded-md" />
      <div className="h-4 w-14 bg-gray-200 rounded-md" />
    </div>
  </div>
);

const SectionHeaderSkeleton = ({ width = 'w-24' }: { width?: string }) => (
  <div className="relative px-5 py-2 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 overflow-hidden">
    <div
      className="absolute inset-0 opacity-100"
      style={{
        backgroundImage:
          'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 6px)',
      }}
    />
    <div className={`relative h-3 ${width} bg-gray-200/70 rounded-md`} />
  </div>
);

const AttendeeCardSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    {/* Member Header */}
    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
      <div className="flex items-center gap-3">
        <div className="bg-gray-200 p-2 rounded-full w-8 h-8" />
        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-200 rounded-md" />
          <div className="h-3 w-16 bg-gray-100 rounded-md" />
        </div>
      </div>
    </div>

    {/* Month Pass Section */}
    <SectionHeaderSkeleton width="w-20" />
    <div className="divide-y divide-gray-100">
      <PassRowSkeleton />
    </div>

    {/* Weekly Passes Section */}
    <SectionHeaderSkeleton width="w-24" />
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <PassRowSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default function CheckoutSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-3 animate-pulse"
      role="status"
      aria-label="Loading checkout"
    >
      {/* Early Bird Banner Skeleton */}
      <div className="bg-gradient-to-r from-amber-50/60 to-yellow-50/60 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="bg-amber-100/60 p-2 rounded-full w-9 h-9 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-44 bg-amber-100/80 rounded-md" />
          <div className="h-3 w-60 bg-amber-100/50 rounded-md" />
        </div>
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-28 bg-white border border-gray-200 rounded-xl shadow-sm" />
        <div className="h-9 w-24 bg-white border border-gray-200 rounded-xl shadow-sm" />
      </div>

      {/* Attendee Card Skeleton */}
      <AttendeeCardSkeleton rows={3} />

      <span className="sr-only">Loading passes...</span>
    </motion.div>
  );
}
