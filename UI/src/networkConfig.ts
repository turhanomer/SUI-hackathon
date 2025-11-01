import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

// Move kontrat adresleri ve package ID'leri
// Deploy tarihi: 2025-11-01
export const VOTING_SYSTEM_CONFIG = {
  devnet: {
    PACKAGE_ID: "0x0", // Deploy sonrası güncellenecek
    PROFILE_REGISTRY_ID: "0x0", // Init'te oluşturulan ProfileRegistry shared object ID
    USER_SURVEY_LIMIT_ID: "0x0", // Init'te oluşturulan UserSurveyLimit shared object ID
    BADGE_STATS_ID: "0x0", // Init'te oluşturulan BadgeStats shared object ID
    ADMIN_CAP_ID: "0x0", // Admin capability ID (badge basımı için)
  },
  testnet: {
    PACKAGE_ID: "0xaf3644efb8aff2eb41add964cdc6482b3e7a1949698f169af2a522c37e4f8c0e",
    PROFILE_REGISTRY_ID: "0x651aac156f7bc5a98a8abf5ceeef897c531d77fdab7ccbd4845729a664d94fe7",
    USER_SURVEY_LIMIT_ID: "0x5e18a29872113a1cea847316b07220578f58f83a92f27bff50111bd6f469cdc5",
    BADGE_STATS_ID: "0xe3ea75b4747d02e6b6dc4fc7f1b21eeff475a0b924bc40195436dcb9606392f8",
    ADMIN_CAP_ID: "0x297c23ea760a7284e8192f2bffde9a93323fc5edeba0b4b244916e8dd0269ba9",
  },
  mainnet: {
    PACKAGE_ID: "0x0",
    PROFILE_REGISTRY_ID: "0x0",
    USER_SURVEY_LIMIT_ID: "0x0",
    BADGE_STATS_ID: "0x0",
    ADMIN_CAP_ID: "0x0",
  },
};

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: VOTING_SYSTEM_CONFIG.devnet,
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: VOTING_SYSTEM_CONFIG.testnet,
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: VOTING_SYSTEM_CONFIG.mainnet,
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
