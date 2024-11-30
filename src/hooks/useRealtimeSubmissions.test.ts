import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { useRealtimeSubmissions } from './useRealtimeSubmissions';
import { useAuth } from './useAuth';
import { db } from '../lib/firebaseConfig';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { setupTestEnvironment, cleanupTestEnvironment } from '../test/setup';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';

// Mock Firebase Auth with test user
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { 
      uid: 'test-user-id',
      email: 'test@example.com',
      getIdTokenResult: () => Promise.resolve({
        claims: { test: true }
      })
    }
  }))
}));

describe('useRealtimeSubmissions', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment(testEnv);
  });

  const mockSubmission = {
    uid: 'test-user-id',
    type: 'onboarding',
    answers: { question1: 'answer1' },
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  let submissionId: string;

  beforeEach(async () => {
    // Add a test submission
    const docRef = await addDoc(collection(db, 'submissions'), mockSubmission);
    submissionId = docRef.id;
  });

  afterEach(async () => {
    // Clean up test submission
    if (submissionId) {
      await deleteDoc(doc(db, 'submissions', submissionId));
    }
  });

  it('should receive real-time updates', async () => {
    const { result } = renderHook(() => 
      useRealtimeSubmissions({ type: 'onboarding' })
    );

    // Wait for initial data
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    expect(result.current.error).toBe(null);
    expect(result.current.submissions).toHaveLength(1);
    expect(result.current.submissions[0]).toMatchObject({
      uid: 'test-user-id',
      type: 'onboarding'
    });

    // Test adding a new submission
    const newSubmission = {
      ...mockSubmission,
      answers: { question1: 'new answer' }
    };

    await act(async () => {
      await addDoc(collection(db, 'submissions'), newSubmission);
    });

    // Wait for real-time update
    await waitFor(() => {
      expect(result.current.submissions).toHaveLength(2);
    }, { timeout: 5000 });
  });

  it('should handle offline mode', async () => {
    // Simulate offline mode
    await act(async () => {
      // @ts-ignore - Accessing internal property for testing
      window.navigator.onLine = false;
      window.dispatchEvent(new Event('offline'));
    });

    const { result } = renderHook(() => 
      useRealtimeSubmissions()
    );

    await waitFor(() => {
      expect(result.current.networkStatus).toBe('offline');
    }, { timeout: 5000 });

    expect(result.current.error?.message).toContain('Network connection lost');

    // Restore online mode
    await act(async () => {
      // @ts-ignore - Accessing internal property for testing
      window.navigator.onLine = true;
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.networkStatus).toBe('online');
    }, { timeout: 5000 });

    expect(result.current.error).toBe(null);
  });

  it('should handle authentication state', () => {
    // Mock user as not authenticated
    (useAuth as any).mockImplementation(() => ({ user: null }));

    const { result } = renderHook(() => useRealtimeSubmissions());

    expect(result.current.loading).toBe(false);
    expect(result.current.error?.message).toBe('User not authenticated');
    expect(result.current.submissions).toHaveLength(0);
  });
});
