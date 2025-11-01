import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../networkConfig";
import type {
  CreateSurveyParams,
  SubmitResponseParams,
  CreateProfileParams,
  UpdateProfileParams,
  Survey,
  UserProfile,
  Response,
  SurveyCreatorBadge,
} from "../types/contracts";

/**
 * Survey işlemleri için utility fonksiyonları
 */
export class SurveyService {
  constructor(
    private packageId: string,
    private userSurveyLimitId: string
  ) {}

  createFreeSurvey(params: CreateSurveyParams) {
    const tx = new Transaction();

    // 1. Anketi oluştur
    const [survey] = tx.moveCall({
      target: `${this.packageId}::survey::create_survey`,
      arguments: [
        tx.object(this.userSurveyLimitId),
        tx.pure.string(params.title),
        tx.pure.string(params.description),
      ],
    });

    // 2. Her soru için add_question çağır
    params.questions.forEach((question) => {
      tx.moveCall({
        target: `${this.packageId}::survey::add_question`,
        arguments: [
          survey,
          tx.pure.string(question.prompt),
          tx.pure.vector("string", question.options),
          tx.pure.bool(question.allows_multiple),
          tx.pure.u8(question.max_selections),
        ],
      });
    });

    return tx;
  }

  createSurveyWithBadge(params: CreateSurveyParams, badgeId: string) {
    const tx = new Transaction();

    // 1. Badge ile anketi oluştur
    const [survey] = tx.moveCall({
      target: `${this.packageId}::survey::create_survey_with_badge`,
      arguments: [
        tx.object(badgeId),
        tx.pure.string(params.title),
        tx.pure.string(params.description),
      ],
    });

    // 2. Her soru için add_question çağır
    params.questions.forEach((question) => {
      tx.moveCall({
        target: `${this.packageId}::survey::add_question`,
        arguments: [
          survey,
          tx.pure.string(question.prompt),
          tx.pure.vector("string", question.options),
          tx.pure.bool(question.allows_multiple),
          tx.pure.u8(question.max_selections),
        ],
      });
    });

    return tx;
  }

  async getUserSurveys(client: any, ownerAddress: string): Promise<Survey[]> {
    try {
      const objects = await client.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: `${this.packageId}::survey::Survey`,
        },
        options: { showContent: true },
      });

      const surveys: Survey[] = [];
      for (const obj of objects.data) {
        if (obj.data?.content?.dataType === "moveObject") {
          const fields = obj.data.content.fields as any;
          surveys.push({
            id: obj.data.objectId,
            title: fields.title,
            description: fields.description,
            owner: fields.owner,
            is_open: fields.is_open,
            questions: fields.questions,
            participant_count: Number(fields.participant_count),
            created_at: Number(fields.created_at),
          });
        }
      }

      return surveys.sort((a, b) => b.created_at - a.created_at);
    } catch (error) {
      console.error("Error fetching user surveys:", error);
      return [];
    }
  }
}

/**
 * Profile işlemleri için utility fonksiyonları
 */
export class ProfileService {
  constructor(
    private packageId: string,
    private profileRegistryId: string
  ) {}

  createProfile(params: CreateProfileParams) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::profile::create_profile`,
      arguments: [
        tx.object(this.profileRegistryId),
        tx.pure.string(params.username),
        tx.pure.string(params.bio),
        tx.object("0x6"),
      ],
    });

    return tx;
  }

  async getUserProfile(client: any, userAddress: string): Promise<UserProfile | null> {
    try {
      const objects = await client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${this.packageId}::profile::UserProfile`,
        },
        options: { showContent: true },
      });

      if (objects.data.length === 0) return null;

      const obj = objects.data[0];
      if (obj.data?.content?.dataType !== "moveObject") return null;

      const fields = obj.data.content.fields as any;
      return {
        id: obj.data.objectId,
        owner: fields.owner,
        username: fields.username,
        bio: fields.bio,
        avatar_url: fields.avatar_url || null,
        created_at: Number(fields.created_at),
        last_activity: Number(fields.last_activity),
        stats_id: fields.stats_id,
        gamification_id: fields.gamification_id,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }
}

/**
 * Badge işlemleri için utility fonksiyonları
 */
export class BadgeService {
  constructor(
    private packageId: string,
    private badgeStatsId: string
  ) {}

  async getUserBadges(client: any, userAddress: string): Promise<SurveyCreatorBadge[]> {
    try {
      const objects = await client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${this.packageId}::badge::SurveyCreatorBadge`,
        },
        options: { showContent: true },
      });

      const badges: SurveyCreatorBadge[] = [];
      for (const obj of objects.data) {
        if (obj.data?.content?.dataType === "moveObject") {
          const fields = obj.data.content.fields as any;
          badges.push({
            id: obj.data.objectId,
            name: fields.name,
            description: fields.description,
            image_url: fields.image_url,
            badge_type: Number(fields.badge_type),
            tier: Number(fields.tier),
            extra_surveys_allowed: Number(fields.extra_surveys_allowed),
            minted_at: Number(fields.minted_at),
            owner: fields.owner,
          });
        }
      }

      return badges;
    } catch (error) {
      console.error("Error fetching user badges:", error);
      return [];
    }
  }
}

/**
 * Tüm servisleri initialize eden hook
 */
export function useContractServices() {
  const PACKAGE_ID = useNetworkVariable("PACKAGE_ID");
  const USER_SURVEY_LIMIT_ID = useNetworkVariable("USER_SURVEY_LIMIT_ID");
  const PROFILE_REGISTRY_ID = useNetworkVariable("PROFILE_REGISTRY_ID");
  const BADGE_STATS_ID = useNetworkVariable("BADGE_STATS_ID");

  const surveyService = new SurveyService(PACKAGE_ID, USER_SURVEY_LIMIT_ID);
  const profileService = new ProfileService(PACKAGE_ID, PROFILE_REGISTRY_ID);
  const badgeService = new BadgeService(PACKAGE_ID, BADGE_STATS_ID);

  return {
    surveyService,
    profileService,
    badgeService,
  };
}
