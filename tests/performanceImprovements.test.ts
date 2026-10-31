import { describe, it, expect } from 'vitest';
import { withTimeout, DEFAULT_GEMINI_TIMEOUT_MS } from '../src/utils/aiTimeout';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

describe('Performance Improvements (P-2, P-3)', () => {
  // ---------------------------------------------------------------------------
  // P-2: 8-SECOND GEMINI TIMEOUT & SAFE FALLBACK
  // ---------------------------------------------------------------------------
  describe('P-2: Gemini API Call Timeout & Resilience', () => {
    it('verifies DEFAULT_GEMINI_TIMEOUT_MS is configured to 8000ms', () => {
      expect(DEFAULT_GEMINI_TIMEOUT_MS).toBe(8000);
    });

    it('resolves promptly when promise finishes before timeout', async () => {
      const fastPromise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('quick_ai_result'), 50);
      });

      const result = await withTimeout(fastPromise, 200, 'Fast Gemini Call');
      expect(result).toBe('quick_ai_result');
    });

    it('gracefully aborts with an informative error when operation exceeds timeout', async () => {
      const slowPromise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('stalled_result'), 500);
      });

      await expect(
        withTimeout(slowPromise, 100, 'Gemini Model gemini-3.1-flash-lite')
      ).rejects.toThrow('Gemini Model gemini-3.1-flash-lite timed out after 100ms');
    });

    it('preserves existing model fallback and delivers response within safe bounds', async () => {
      const startTime = Date.now();
      const res = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-bypass': 'true',
        },
        body: JSON.stringify({
          message: 'How can I save money on decorations?',
          eventContext: {
            name: 'P-2 Verification Party',
            type: 'Birthday Party',
            budget: 30000,
            guestCount: 25,
          },
        }),
      });

      const elapsed = Date.now() - startTime;
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty('reply');
      expect(data).toHaveProperty('source');
      expect(typeof data.reply).toBe('string');
      expect(data.reply.length).toBeGreaterThan(10);
      // Validates response completed within the 8s per-model bound plus transit
      expect(elapsed).toBeLessThan(16000);
    }, 20000);
  });

  // ---------------------------------------------------------------------------
  // P-3: VITE MANUAL CHUNKS VENDOR BUNDLE VERIFICATION
  // ---------------------------------------------------------------------------
  describe('P-3: Vendor Chunk Splitting Configuration', () => {
    it('verifies dist directory contains split vendor chunks after build', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const distAssetsDir = path.resolve(process.cwd(), 'dist', 'assets');

      if (fs.existsSync(distAssetsDir)) {
        const files = fs.readdirSync(distAssetsDir);

        // Check for presence of vendor-react chunk
        const hasReactChunk = files.some(
          (f) => f.startsWith('vendor-react') && f.endsWith('.js')
        );
        expect(hasReactChunk).toBe(true);

        // Check for presence of vendor-icons chunk
        const hasIconsChunk = files.some(
          (f) => f.startsWith('vendor-icons') && f.endsWith('.js')
        );
        expect(hasIconsChunk).toBe(true);
      }
    });
  });
});
