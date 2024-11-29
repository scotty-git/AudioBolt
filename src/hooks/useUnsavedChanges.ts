import { useEffect, useState } from 'react';
import { useBeforeUnload } from 'react-router-dom';

export const useUnsavedChanges = (hasChanges: boolean) => {
  const [showPrompt, setShowPrompt] = useState(false);

  useBeforeUnload(
    (event) => {
      if (hasChanges) {
        event.preventDefault();
        return (event.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
      }
    },
    { capture: true }
  );

  useEffect(() => {
    setShowPrompt(hasChanges);
  }, [hasChanges]);

  return showPrompt;
};