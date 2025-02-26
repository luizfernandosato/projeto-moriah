
import React from 'react';
import GerarRecibo from './GerarRecibo';

const EmbedRecibo = () => {
  return (
    <div className="min-h-screen bg-secondary/30">
      <main className="container mx-auto px-4 py-8 animate-fadeIn">
        <GerarRecibo />
      </main>
    </div>
  );
};

export default EmbedRecibo;
