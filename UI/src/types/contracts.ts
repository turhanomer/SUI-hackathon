// Move kontratlarından gelen Sui blockchain türleri

// Survey modülü türleri
export interface Survey {
  id: string;
  title: string;
  description: string;
  owner: string;
  is_open: boolean;
  questions: Question[];
  participant_count: number;
  created_at: number;
}

export interface Question {
  prompt: string;
  options: string[];
  allows_multiple: boolean;
  max_selections: number;
}

export interface Answer {
  question_index: number;
  selected_option_indices: number[];
  free_text: string | null;
}

export interface Response {
  id: string;
  survey_id: string;
  responder: string;
  answers: Answer[];
}

// Profile modülü türleri
export interface UserProfile {
  id: string;
  owner: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  created_at: number;
  last_activity: number;
  stats_id: string;
  gamification_id: string;
}

export interface UserStats {
  id: string;
  polls_created: number;
  polls_participated: number;
  total_votes_cast: number;
}

export interface Gamification {
  id: string;
  is_verified: boolean;
  owned_badge_ids: string[];
  achievements_unlocked: string[];
  total_points: number;
}

// Badge modülü türleri
export interface SurveyCreatorBadge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  badge_type: number;
  tier: number;
  extra_surveys_allowed: number;
  minted_at: number;
  owner: string;
}

export interface BadgeStats {
  id: string;
  total_minted: number;
  creator_badges: number;
  verified_badges: number;
  whale_badges: number;
}

// Event türleri
export interface SurveyCreatedEvent {
  survey: string;
  owner: string;
}

export interface ResponseRecordedEvent {
  survey: string;
  responder: string;
  participant_count: number;
}

export interface MilestoneReachedEvent {
  survey: string;
  owner: string;
  participant_count: number;
  milestone: number;
}

export interface BadgeMintedEvent {
  badge_id: string;
  owner: string;
  badge_type: number;
  tier: number;
}

// Transaction işlemleri için yardımcı türler
export interface CreateSurveyParams {
  title: string;
  description: string;
  questions: QuestionInput[];
}

export interface QuestionInput {
  prompt: string;
  options: string[];
  allows_multiple: boolean;
  max_selections: number;
}

export interface SubmitResponseParams {
  surveyId: string;
  answers: AnswerInput[];
}

export interface AnswerInput {
  question_index: number;
  selected_option_indices: number[];
  free_text?: string;
}

export interface CreateProfileParams {
  username: string;
  bio: string;
}

export interface UpdateProfileParams {
  username?: string;
  bio?: string;
  avatar_url?: string;
}
