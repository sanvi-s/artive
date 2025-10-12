import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardNavigation = () => {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const activeElement = document.activeElement as HTMLElement;

    // Global shortcuts
    if (event.key === '/') {
      event.preventDefault();
      const searchInput = document.querySelector('[data-shortcut="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    } else if (event.key === 'u' || event.key === 'U') {
      // Example: Upload shortcut
      console.log('Upload shortcut triggered');
      // navigate('/upload'); // Assuming an upload route
    } else if (event.key === 'f' || event.key === 'F') {
      // Example: Fork shortcut - if a forkable item is focused
      const focusedForkButton = activeElement?.closest('[data-shortcut="fork"]') as HTMLButtonElement;
      if (focusedForkButton) {
        focusedForkButton.click();
        event.preventDefault();
      }
    } else if (event.key === 'Escape') {
      // Close modals/popovers
      const openDialog = document.querySelector('[role="dialog"][open]') as HTMLElement;
      if (openDialog) {
        // Assuming a way to close the dialog, e.g., dispatching a custom event or clicking a close button
        const closeButton = openDialog.querySelector('[aria-label="Close"]') as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
        } else {
          // Fallback for generic close
          openDialog.style.display = 'none'; // Simple hide, ideally use a proper close mechanism
        }
        event.preventDefault();
      }
    }

    // Grid navigation (for elements with data-grid-item)
    if (activeElement && activeElement.hasAttribute('data-grid-item')) {
      const gridItems = Array.from(document.querySelectorAll('[data-grid-item]')) as HTMLElement[];
      const currentIndex = gridItems.indexOf(activeElement);

      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      const itemsPerRow = Math.floor(activeElement.parentElement!.offsetWidth / activeElement.offsetWidth); // Simplified

      if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % gridItems.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + gridItems.length) % gridItems.length;
      } else if (event.key === 'ArrowDown') {
        nextIndex = Math.min(currentIndex + itemsPerRow, gridItems.length - 1);
      } else if (event.key === 'ArrowUp') {
        nextIndex = Math.max(currentIndex - itemsPerRow, 0);
      } else if (event.key === 'Enter') {
          activeElement.click(); // Simulate click on Enter
          event.preventDefault();
          return;
      }

      if (nextIndex !== currentIndex) {
        gridItems[nextIndex].focus();
        event.preventDefault();
      }
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
