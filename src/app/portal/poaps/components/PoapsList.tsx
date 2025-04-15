'use client'

import { PoapProps, PoapResponse } from '@/types/Poaps';
import Poap from './Poap';
import { usePoapsProvider } from '@/providers/poapsProvider';

const PoapsList = () => {
  const { poaps, loading } = usePoapsProvider()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">Loading POAPs...</p>
      </div>
    );
  }

  if (!poaps || poaps.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">No POAPs available right now</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-6 mt-6 mx-2">
      {poaps.map((poap: PoapProps, index: number) => (
        <Poap key={poap.id || poap._id || `poap-${index}`} poap={poap} />
      ))}
    </div>
  );
};

export default PoapsList; 