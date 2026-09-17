// Data access for "Mi Clase" — fully independent from src/lib/exercises.ts
// (Cambridge content). Deliberately does not touch Exercise/Question/
// Attempt/Answer/ErrorLog or any gamification table.

import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import type { PlayerExercise } from "@/lib/exercises-shared";

export async function listClassMaterials(userId: string) {
  return prisma.classMaterial.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { exercises: true } } },
  });
}

export async function getClassMaterialWithExercises(userId: string, materialId: string) {
  return prisma.classMaterial.findFirst({
    where: { id: materialId, userId },
    include: {
      exercises: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });
}

export async function deleteClassMaterial(userId: string, materialId: string) {
  await prisma.classMaterial.deleteMany({ where: { id: materialId, userId } });
}

export async function generateClassExercise(userId: string, materialId: string, focusInstructions?: string) {
  const material = await prisma.classMaterial.findFirst({ where: { id: materialId, userId } });
  if (!material) throw new Error("Material not found");

  const ai = getAIProvider();
  const generated = await ai.generateExerciseFromMaterial({
    materialText: material.extractedText,
    materialTitle: material.title,
    focusInstructions,
  });

  const exercise = await prisma.classExercise.create({
    data: {
      userId,
      materialId,
      title: generated.title,
      instructions: generated.instructions,
      questions: {
        create: generated.questions.map((q) => ({
          order: q.order,
          questionType: q.questionType,
          prompt: q.prompt,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          distractorExplanations: q.distractorExplanations ? JSON.stringify(q.distractorExplanations) : null,
        })),
      },
    },
  });

  return exercise;
}

export async function getClassExerciseForPlayer(userId: string, exerciseId: string): Promise<PlayerExercise | null> {
  const exercise = await prisma.classExercise.findFirst({
    where: { id: exerciseId, userId },
    include: { questions: true, material: { select: { title: true } } },
  });
  if (!exercise) return null;

  return {
    id: exercise.id,
    slug: exercise.id,
    title: exercise.title,
    type: "CLASS_MATERIAL",
    skill: "CLASS",
    level: "",
    topic: exercise.material.title,
    instructions: exercise.instructions,
    content: {},
    audioUrl: null,
    questions: exercise.questions
      .sort((a, b) => a.order - b.order)
      .map((q) => ({
        id: q.id,
        order: q.order,
        questionType: q.questionType,
        prompt: q.prompt,
        options: q.options ? (JSON.parse(q.options) as string[]) : null,
      })),
  };
}
