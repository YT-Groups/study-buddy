import { useEffect, useState } from 'react';

interface BackgroundImageProps {
  src: string;
  className?: string;
  children: React.ReactNode;
}

export function BackgroundImage({ src, className = '', children }: BackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return (
    <div
      className={`relative transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{ backgroundImage: `url(${src})` }}
    >
      {children}
    </div>
  );
}
