// SM-2 spaced repetition algorithm (the same one Anki is based on).
// quality: 0 = complete blackout, 3 = correct with difficulty, 5 = perfect recall.

export type ReviewState = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

export type ReviewResult = ReviewState & {
  nextReviewDate: Date;
  status: "LEARNING" | "REVIEWING" | "MASTERED";
};

export function applyReview(state: ReviewState, quality: number): ReviewResult {
  const q = Math.max(0, Math.min(5, quality));
  let { easeFactor, intervalDays, repetitions } = state;

  if (q < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  const status: ReviewResult["status"] = q < 3 ? "LEARNING" : intervalDays >= 21 ? "MASTERED" : "REVIEWING";

  return { easeFactor, intervalDays, repetitions, nextReviewDate, status };
}
