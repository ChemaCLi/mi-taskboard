import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { MissionDataProvider, useMissionData } from './MissionDataContext';
import { MissionLoadingModal } from './MissionLoadingModal';

interface MissionDataHydrationProps {
  children: ReactNode;
}

// Inner component that has access to the mission data context
function MissionDataHydrationInner({ children }: MissionDataHydrationProps) {
  const [showLoadingModal, setShowLoadingModal] = useState(true);
  const missionData = useMissionData();

  // Show modal during initial hydration
  useEffect(() => {
    // Keep modal open while hydrating
    if (missionData.globalLoading.isHydrating) {
      setShowLoadingModal(true);
    }
  }, [missionData.globalLoading]);

  const handleCloseModal = () => {
    setShowLoadingModal(false);
  };

  return (
    <>
      {children}
      <MissionLoadingModal 
        open={showLoadingModal} 
        onClose={handleCloseModal}
      />
    </>
  );
}

// Main wrapper component
export function MissionDataHydration({ children }: MissionDataHydrationProps) {
  return (
    <MissionDataProvider>
      <MissionDataHydrationInner>
        {children}
      </MissionDataHydrationInner>
    </MissionDataProvider>
  );
} 