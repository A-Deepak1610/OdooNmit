import { v7 as uuidv7 } from 'uuid';

/**
 * Generate a time-ordered UUIDv7 identifier
 */
export const generateId = (): string => {
  return uuidv7();
};
