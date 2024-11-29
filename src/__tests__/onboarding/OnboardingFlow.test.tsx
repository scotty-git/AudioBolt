import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { UserOnboarding } from '../../pages/UserOnboarding/UserOnboarding';
import { loadOnboardingFlow } from '../../utils/onboardingStorage';
import { defaultOnboardingFlow } from '../../data/defaultOnboardingFlow';

vi.mock('../../utils/onboardingStorage', () => ({
  loadOnboardingFlow: vi.fn(),
  saveOnboardingFlow: vi.fn(),
  saveUserProgress: vi.fn(),
  createNewUserProgress: vi.fn(() => ({
    userId: 'test-user',
    flowId: 'test-flow',
    progress: {
      completedSections: [],
      skippedSections: [],
      currentSectionId: undefined,
      lastUpdated: new Date().toISOString()
    },
    responses: [],
    metadata: {
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      deviceInfo: 'test',
      userAgent: 'test'
    }
  }))
}));

const renderOnboarding = () => {
  return render(
    <BrowserRouter>
      <UserOnboarding />
    </BrowserRouter>
  );
};

describe('Onboarding Flow', () => {
  beforeEach(() => {
    vi.mocked(loadOnboardingFlow).mockReturnValue(defaultOnboardingFlow);
  });

  describe('Initial Render', () => {
    it('renders the onboarding title and description', async () => {
      renderOnboarding();
      await waitFor(() => {
        expect(screen.getByText(defaultOnboardingFlow.title)).toBeInTheDocument();
        expect(screen.getByText(defaultOnboardingFlow.description)).toBeInTheDocument();
      });
    });
  });
});