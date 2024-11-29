import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OnboardingFlow, onboardingFlowSchema } from '../../../types/onboarding';
import { saveOnboardingFlow, loadOnboardingFlow } from '../../../utils/onboardingStorage';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';

export const useOnboardingForm = () => {
  const [hasChanges, setHasChanges] = useState(false);
  const showUnsavedPrompt = useUnsavedChanges(hasChanges);

  const form = useForm<OnboardingFlow>({
    resolver: zodResolver(onboardingFlowSchema),
    defaultValues: loadOnboardingFlow() || {
      id: `flow-${Date.now()}`,
      sections: [],
      updatedAt: new Date().toISOString(),
    },
  });

  const handleSave = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    saveOnboardingFlow(values);
    setHasChanges(false);
  }, [form]);

  const formState = useMemo(() => ({
    isDirty: form.formState.isDirty,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
  }), [form.formState]);

  return {
    form,
    formState,
    handleSave,
    showUnsavedPrompt,
    setHasChanges,
  };
};