import { useStore } from "./store";

export type LevelInfo = {
  level: number;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number; // 0-100
  createdCount: number;
  votesCast: number;
  achievementsCount: number;
};

// XP model (can be swapped with on-chain values later)
// - Poll created: 20 XP
// - Vote cast: 5 XP
// - Achievement: 10 XP each
export function useLevelInfo(address?: string | null): LevelInfo {
  const polls = useStore((s) => s.polls);
  const votesByWallet = useStore((s) => s.votesByWallet);
  const profile = useStore((s) => (address ? s.profiles[address] : undefined));

  const createdCount = address ? Object.values(polls).filter((p) => p.createdBy === address).length : 0;
  const votesCast = address ? Object.keys(votesByWallet[address] ?? {}).length : 0;
  const achievementsCount = profile?.achievements?.length ?? 0;

  const xp = createdCount * 20 + votesCast * 5 + achievementsCount * 10 + (profile?.hasCreatorPass ? 10 : 0);

  // Level thresholds (cumulative XP)
  const thresholds = [0, 50, 120, 220, 360, 540, 760, 1020, 1320, 1660, 2040]; // levels 0..10
  let level = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) {
      level = i;
      break;
    }
  }
  const currentLevelXp = thresholds[level] ?? 0;
  const nextLevelXp = thresholds[level + 1] ?? thresholds[thresholds.length - 1] + 400;
  const span = Math.max(1, nextLevelXp - currentLevelXp);
  const progressed = Math.max(0, xp - currentLevelXp);
  const progressPercent = Math.min(100, Math.max(0, Math.round((progressed / span) * 100)));

  return { level, xp, currentLevelXp, nextLevelXp, progressPercent, createdCount, votesCast, achievementsCount };
}


