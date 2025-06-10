'use client';

import React from 'react';
import AirCodeEditor from '@/components/AirCodeEditorFixed';

const AirCodePage: React.FC = () => {
  return (
    <div className="h-screen overflow-hidden">
      <AirCodeEditor />
    </div>
  );
};

export default AirCodePage; 