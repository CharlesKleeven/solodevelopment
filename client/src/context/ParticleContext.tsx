import React, { createContext, useContext, useState, useEffect } from 'react';

interface ParticleContextType {
  particlesEnabled: boolean;
  toggleParticles: () => void;
}

const ParticleContext = createContext<ParticleContextType>({
  particlesEnabled: true,
  toggleParticles: () => {},
});

export const useParticleSettings = () => useContext(ParticleContext);

export const ParticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [particlesEnabled, setParticlesEnabled] = useState(() => {
    // Check localStorage and performance
    const stored = localStorage.getItem('particlesEnabled');
    if (stored !== null) {
      return stored === 'true';
    }
    
    // Default to disabled on mobile or if user prefers reduced motion
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    return !isMobile && !prefersReducedMotion;
  });

  useEffect(() => {
    localStorage.setItem('particlesEnabled', String(particlesEnabled));
  }, [particlesEnabled]);

  const toggleParticles = () => {
    setParticlesEnabled(prev => !prev);
  };

  return (
    <ParticleContext.Provider value={{ particlesEnabled, toggleParticles }}>
      {children}
    </ParticleContext.Provider>
  );
};