import { useEffect, useState } from 'react';

const WaterfallEffect = ({ trigger = false, duration = 4000 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const createParticles = () => {
      const newParticles = [];
      const particleCount = 40;

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: Math.random(),
          left: Math.random() * 100,
          delay: Math.random() * 1000,
          size: Math.random() * 6 + 3,
          opacity: Math.random() * 0.7 + 0.3,
          color: `hsl(${Math.random() * 60 + 180}, 70%, 60%)`, // Blue to cyan range
        });
      }

      setParticles(newParticles);

      // Clear particles after animation
      setTimeout(() => {
        setParticles([]);
      }, duration);
    };

    createParticles();
  }, [trigger, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="waterfall-particle"
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}ms`,
            opacity: particle.opacity,
            background: `linear-gradient(45deg, ${particle.color}, #0099cc)`,
          }}
        />
      ))}
    </div>
  );
};

export default WaterfallEffect;