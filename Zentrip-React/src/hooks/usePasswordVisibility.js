import { useState } from 'react';

export function usePasswordVisibility(initialVisible = false) {
  const [isVisible, setIsVisible] = useState(initialVisible);

  const toggleVisibility = () => {
    setIsVisible((previous) => !previous);
  };

  return {
    isVisible,
    inputType: isVisible ? 'text' : 'password',
    toggleVisibility,
  };
}
