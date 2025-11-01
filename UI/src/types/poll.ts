export type WalletAddress = string;

export type Profile = {
  address: WalletAddress;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  hasCreatorPass: boolean; // mock NFT mint flag
  achievements: AchievementKey[];
};

export type AchievementKey =
  | "first_vote"
  | "first_poll"
  | "creator_pass_minted"
  | "ten_votes_received";

export type PollOption = {
  id: string;
  label: string;
};

export type Poll = {
  id: string;
  question: string;
  description?: string;
  imageUrl?: string;
  options: PollOption[];
  createdBy: WalletAddress;
  createdAt: number;
  votes: Record<string, number>; // optionId -> count
};

export type VoteRecord = {
  [pollId: string]: string; // optionId per poll for the current wallet
};

export type AppState = {
  profiles: Record<WalletAddress, Profile>;
  polls: Record<string, Poll>;
  // votes by wallet
  votesByWallet: Record<WalletAddress, VoteRecord>;
};


