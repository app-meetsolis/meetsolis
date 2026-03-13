/**
 * Transcript quota enforcement — Story 3.2 stubs
 * Real enforcement implemented in Story 4.4
 */

/**
 * Check if user has remaining transcript quota.
 * Throws if limit exceeded (no-op stub — always passes).
 */
export async function checkTranscriptLimit(_userId: string): Promise<void> {
  // Story 4.4: query user plan + usage count and throw if exceeded
  return;
}

/**
 * Increment transcript usage count for user.
 * No-op stub — real implementation in Story 4.4.
 */
export async function incrementTranscriptCount(_userId: string): Promise<void> {
  // Story 4.4: increment usage counter in DB
  return;
}
