import { initializeApp, getApps } from 'firebase/app';
import { getConfig } from './config';

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(getConfig()) : getApps()[0];

export { app };