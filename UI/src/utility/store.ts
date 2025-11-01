import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AchievementKey, AppState, Poll, PollOption, Profile, WalletAddress } from "../types/poll";

// Simple cross-tab sync for "real-time" updates without a backend
let channel: BroadcastChannel | null = null;
try {
  // Guard older browsers or disabled environments
  if (typeof window !== "undefined" && typeof (window as any).BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel("polls");
  }
} catch {
  channel = null;
}

type Actions = {
  upsertProfile: (profile: Profile) => void;
  ensureProfile: (address: WalletAddress) => Profile;
  mintCreatorPass: (address: WalletAddress) => void;
  createPoll: (poll: Omit<Poll, "id" | "createdAt" | "votes">) => string;
  vote: (address: WalletAddress, pollId: string, optionId: string) => void;
  getPollsArray: () => Poll[];
  addAchievement: (address: WalletAddress, key: AchievementKey) => void;
};

type Store = AppState & Actions;

const FREE_POLL_LIMIT = 1;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      profiles: {},
      polls: {},
      votesByWallet: {},

      upsertProfile: (profile) => {
        set((s) => ({ profiles: { ...s.profiles, [profile.address]: profile } }));
        channel?.postMessage({ type: "profiles" });
      },

      ensureProfile: (address) => {
        const existing = get().profiles[address];
        if (existing) return existing;
        const profile: Profile = {
          address,
          displayName: address.slice(0, 6) + "…" + address.slice(-4),
          hasCreatorPass: false,
          achievements: [],
        };
        get().upsertProfile(profile);
        return profile;
      },

      mintCreatorPass: (address) => {
        const profile = get().ensureProfile(address);
        if (profile.hasCreatorPass) return;
        const updated: Profile = { ...profile, hasCreatorPass: true };
        get().upsertProfile(updated);
        get().addAchievement(address, "creator_pass_minted");
      },

      createPoll: (input) => {
        const id = crypto.randomUUID();
        const createdAt = Date.now();
        const votes: Record<string, number> = {};
        input.options.forEach((o) => (votes[o.id] = 0));

        // limit check
        const createdBy = input.createdBy;
        const authoredCount = Object.values(get().polls).filter((p) => p.createdBy === createdBy).length;
        const profile = get().ensureProfile(createdBy);
        if (authoredCount >= FREE_POLL_LIMIT && !profile.hasCreatorPass) {
          throw new Error("Poll limit reached. Mint Creator Pass NFT to create more.");
        }

        const poll: Poll = { ...input, id, createdAt, votes };
        set((s) => ({ polls: { ...s.polls, [id]: poll } }));
        // Only notify other tabs
        try { channel?.postMessage({ type: "polls" }); } catch {}
        get().addAchievement(createdBy, "first_poll");
        return id;
      },

      vote: (address, pollId, optionId) => {
        const poll = get().polls[pollId];
        if (!poll) return;
        const votesForWallet = get().votesByWallet[address] ?? {};

        // Prevent multiple votes; change of mind allowed
        const prevOption = votesForWallet[pollId];
        if (prevOption) {
          if (prevOption === optionId) return; // no change
          poll.votes[prevOption] = Math.max(0, (poll.votes[prevOption] ?? 0) - 1);
        }
        poll.votes[optionId] = (poll.votes[optionId] ?? 0) + 1;

        set((s) => ({
          polls: { ...s.polls, [pollId]: { ...poll } },
          votesByWallet: { ...s.votesByWallet, [address]: { ...votesForWallet, [pollId]: optionId } },
        }));

        // Achievement hooks
        get().addAchievement(address, "first_vote");
        const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
        if (totalVotes >= 10) {
          const author = poll.createdBy;
          get().addAchievement(author, "ten_votes_received");
        }

        try { channel?.postMessage({ type: "votes", pollId }); } catch {}
      },

      getPollsArray: () => {
        return Object.values(get().polls).sort((a, b) => b.createdAt - a.createdAt);
      },

      addAchievement: (address, key) => {
        const profile = get().ensureProfile(address);
        if (profile.achievements.includes(key)) return;
        const updated: Profile = { ...profile, achievements: [...profile.achievements, key] };
        set((s) => ({ profiles: { ...s.profiles, [address]: updated } }));
        try { channel?.postMessage({ type: "profiles" }); } catch {}
      },
    }),
    {
      name: "sui-hackathon-store",
      version: 1,
      partialize: (state) => ({ profiles: state.profiles, polls: state.polls, votesByWallet: state.votesByWallet }),
    },
  ),
);

// Listen to cross-tab messages and refresh the zustand state triggers
if (channel) {
  channel.onmessage = () => {
    // Trigger reactivity by setting a no-op update
    useStore.setState((s) => ({ ...s }));
  };
}

export function createOption(label: string): PollOption {
  return { id: crypto.randomUUID(), label };
}


