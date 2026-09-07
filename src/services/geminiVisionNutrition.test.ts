import { describe, it, expect } from 'vitest';
import { analyzeFoodImage } from './geminiVisionNutrition.service.js';

describe('Gemini Vision Nutrition Service', () => {
  it('analyzes food image payload and returns structured calories and protein estimates', async () => {
    // 1x1 transparent PNG base64 string
    const sampleBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = await analyzeFoodImage({
      imageBase64: sampleBase64,
      userNotes: 'Grilled breast with brown rice',
    });

    expect(result).toBeDefined();
    expect(result.dishName).toBeTruthy();
    expect(result.totalCalories).toBeGreaterThan(0);
    expect(result.totalProteinGrams).toBeGreaterThan(0);
    expect(result.totalCarbsGrams).toBeGreaterThanOrEqual(0);
    expect(result.totalFatsGrams).toBeGreaterThanOrEqual(0);
    expect(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PRE_WORKOUT', 'POST_WORKOUT']).toContain(
      result.suggestedCategory
    );
    expect(Array.isArray(result.detectedItems)).toBe(true);
    expect(result.detectedItems.length).toBeGreaterThan(0);

    const firstItem = result.detectedItems[0];
    expect(firstItem.name).toBeTruthy();
    expect(firstItem.calories).toBeGreaterThan(0);
    expect(firstItem.proteinGrams).toBeGreaterThan(0);
  });

  it('handles raw base64 string without data URL prefix', async () => {
    const rawBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = await analyzeFoodImage({
      imageBase64: rawBase64,
      mimeType: 'image/png',
    });

    expect(result.totalCalories).toBeGreaterThan(0);
    expect(result.totalProteinGrams).toBeGreaterThan(0);
  });
});
