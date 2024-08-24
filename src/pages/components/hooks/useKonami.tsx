import { useState, useEffect } from 'react';

export function useKonamiCode(): void {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  console.log(isOnline);

  useEffect(() => {
    setIsOnline(false);
    console.log(isOnline);
  }, [isOnline]);
}
