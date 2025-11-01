import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useContractServices } from "./contractServices";
import { useState } from "react";
import type {
  Survey,
  UserProfile,
  SurveyCreatorBadge,
  CreateSurveyParams,
  SubmitResponseParams,
  CreateProfileParams,
} from "../types/contracts";

/**
 * Sui blockchain ile etkileşim için ana hook
 */
export function useSuiContracts() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { surveyService, profileService, badgeService } = useContractServices();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Profil oluşturma
   */
  const createProfile = async (params: CreateProfileParams) => {
    if (!account) {
      setError("Wallet bağlı değil");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const txData = profileService.createProfile(params);
      
      return new Promise((resolve, reject) => {
        signAndExecute(
          {
            transaction: txData as any,
          },
          {
            onSuccess: (result) => {
              console.log("Profil oluşturuldu:", result);
              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error("Profil oluşturma hatası:", err);
              setError(err.message);
              setIsLoading(false);
              reject(err);
            },
          }
        );
      });
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Kullanıcının profilini getir
   */
  const getUserProfile = async (address?: string): Promise<UserProfile | null> => {
    const targetAddress = address || account?.address;
    if (!targetAddress) return null;

    try {
      return await profileService.getUserProfile(client, targetAddress);
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  /**
   * Anket oluşturma (bedava)
   */
  const createSurvey = async (params: CreateSurveyParams) => {
    if (!account) {
      setError("Wallet bağlı değil");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const txData = surveyService.createFreeSurvey(params);

      return new Promise((resolve, reject) => {
        signAndExecute(
          {
            transaction: txData as any,
          },
          {
            onSuccess: (result) => {
              console.log("Anket oluşturuldu:", result);
              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error("Anket oluşturma hatası:", err);
              setError(err.message);
              setIsLoading(false);
              reject(err);
            },
          }
        );
      });
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Badge ile anket oluşturma
   */
  const createSurveyWithBadge = async (params: CreateSurveyParams, badgeId: string) => {
    if (!account) {
      setError("Wallet bağlı değil");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const txData = surveyService.createSurveyWithBadge(params, badgeId);

      return new Promise((resolve, reject) => {
        signAndExecute(
          {
            transaction: txData as any,
          },
          {
            onSuccess: (result) => {
              console.log("Badge ile anket oluşturuldu:", result);
              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error("Badge ile anket oluşturma hatası:", err);
              setError(err.message);
              setIsLoading(false);
              reject(err);
            },
          }
        );
      });
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Ankete cevap gönderme
   */
  const submitResponse = async (params: SubmitResponseParams, profileStatsId: string) => {
    if (!account) {
      setError("Wallet bağlı değil");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const txData = surveyService.submitResponse(params, profileStatsId);

      return new Promise((resolve, reject) => {
        signAndExecute(
          {
            transaction: txData as any,
          },
          {
            onSuccess: (result) => {
              console.log("Cevap gönderildi:", result);
              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error("Cevap gönderme hatası:", err);
              setError(err.message);
              setIsLoading(false);
              reject(err);
            },
          }
        );
      });
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Kullanıcının anketlerini getir
   */
  const getUserSurveys = async (address?: string): Promise<Survey[]> => {
    const targetAddress = address || account?.address;
    if (!targetAddress) return [];

    try {
      return await surveyService.getUserSurveys(client, targetAddress);
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  /**
   * Belirli bir anketi getir
   */
  const getSurvey = async (surveyId: string): Promise<Survey | null> => {
    try {
      return await surveyService.getSurvey(client, surveyId);
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  /**
   * Kullanıcının badge'lerini getir
   */
  const getUserBadges = async (address?: string): Promise<SurveyCreatorBadge[]> => {
    const targetAddress = address || account?.address;
    if (!targetAddress) return [];

    try {
      return await badgeService.getUserBadges(client, targetAddress);
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  /**
   * Anketi kapatma
   */
  const closeSurvey = async (surveyId: string) => {
    if (!account) {
      setError("Wallet bağlı değil");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const txData = surveyService.closeSurvey(surveyId);

      return new Promise((resolve, reject) => {
        signAndExecute(
          {
            transaction: txData as any,
          },
          {
            onSuccess: (result) => {
              console.log("Anket kapatıldı:", result);
              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error("Anket kapatma hatası:", err);
              setError(err.message);
              setIsLoading(false);
              reject(err);
            },
          }
        );
      });
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  return {
    // State
    isLoading,
    error,
    account,

    // Profile işlemleri
    createProfile,
    getUserProfile,

    // Survey işlemleri
    createSurvey,
    createSurveyWithBadge,
    submitResponse,
    getUserSurveys,
    getSurvey,
    closeSurvey,

    // Badge işlemleri
    getUserBadges,
  };
}
