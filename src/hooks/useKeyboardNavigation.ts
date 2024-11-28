import { useCallback } from 'react';

interface UseKeyboardNavigationProps {
  itemCount: number;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  onSelect: () => void;
  onEscape: () => void;
}

export function useKeyboardNavigation({
  itemCount,
  selectedIndex,
  setSelectedIndex,
  onSelect,
  onEscape,
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < itemCount - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : prev
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0) {
            onSelect();
          }
          break;
        case 'Escape':
          event.preventDefault();
          onEscape();
          break;
      }
    },
    [itemCount, selectedIndex, setSelectedIndex, onSelect, onEscape]
  );

  return { handleKeyDown };
}