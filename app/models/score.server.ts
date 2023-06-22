import type { Score } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Score };

export function getScoreByUsername(username: Score["username"]) {
  return prisma.score.findUnique({ where: { username } });
}

export function updateScore(username: Score["username"], turns: Score["turns"], speed: Score["speed"], score: Score["score"]) {
  return prisma.score.upsert({
    create: { username, turns, speed, score },
    update: { turns, speed, score },
    where: { username }
  });
}

export async function tryToUpdateScore(username: Score["username"], turns: Score["turns"], speed: Score["speed"], score: Score["score"]) {
  const previousScore = await getScoreByUsername(username);
  if (!previousScore || score < previousScore.score) {
    return updateScore(username, turns, speed, score);
  }
}

export function rankList() {
  return prisma.score.findMany({
    orderBy: [{ score: "asc" }, { updatedAt: "asc" }]
  });
}

export function deleteScore(username: Score["username"]) {
  return prisma.score.deleteMany({ where: { username } });
}