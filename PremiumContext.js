// ================================================================
// PremiumContext.js - Premium Features with RevenueCat
// ================================================================
// Prices, trials and plans always come from RevenueCat's *current*
// offering (so RevenueCat Experiments can change them remotely). Nothing
// is hard-coded: if offerings can't load, the paywall says so and offers
// a retry instead of showing placeholder products.

import React, { createContext, useState, useEffect, useContext } from "react";
import Purchases, { INTRO_ELIGIBILITY_STATUS, PURCHASES_ERROR_CODE } from "react-native-purchases";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import { REVENUECAT_API_KEY } from "@env";

const PremiumContext = createContext();

export const usePremium = () => useContext(PremiumContext);

const ENTITLEMENT_ID = "premium";

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [products, setProducts] = useState([]);
  const [offering, setOffering] = useState(null);
  // 'loading' | 'ready' | 'error'
  const [offeringsStatus, setOfferingsStatus] = useState("loading");
  // product identifier -> true when the user can get its trial/intro offer
  const [introEligibility, setIntroEligibility] = useState({});
  const [translationsToday, setTranslationsToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const FREE_TRANSLATION_LIMIT = 30;
  const FREE_LANGUAGES = ["sw", "yo", "ha", "ig", "zu", "en", "fr"];

  useEffect(() => {
    initializePurchases();
    loadTranslationCount();
    const cleanup = checkDailyReset();

    return () => {
      cleanup();
      Purchases.removeCustomerInfoUpdateListener(onCustomerInfo);
    };
  }, []);

  // Renewals, expiries, refunds and Family Sharing changes arrive here
  // without needing an app restart. Registered once RevenueCat is configured.
  const onCustomerInfo = (customerInfo) => applyCustomerInfo(customerInfo);

  // Initialize RevenueCat
  const initializePurchases = async () => {
    try {
      console.log('Initializing RevenueCat...');

      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
      });

      console.log('RevenueCat configured');
      Purchases.addCustomerInfoUpdateListener(onCustomerInfo);

      await loadProducts();

      await checkPremiumStatus();

      setLoading(false);
      console.log('RevenueCat initialization complete');
    } catch (error) {
      console.error("RevenueCat initialization error:", error);
      setOfferingsStatus("error");
      setLoading(false);
    }
  };

  // Load the current offering from RevenueCat
  const loadProducts = async () => {
    try {
      setOfferingsStatus("loading");
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;

      if (current && current.availablePackages.length > 0) {
        console.log('Products loaded:', current.availablePackages.length);
        setOffering(current);
        setProducts(current.availablePackages);
        setOfferingsStatus("ready");
        await loadIntroEligibility(current.availablePackages);
      } else {
        console.log('No current offering available');
        setOffering(null);
        setProducts([]);
        setOfferingsStatus("error");
      }
    } catch (error) {
      console.error("Load products error:", error);
      setOfferingsStatus("error");
    }
  };

  // Only offer a trial to people Apple will actually give it to.
  const loadIntroEligibility = async (packages) => {
    if (Platform.OS !== "ios") return;
    try {
      const ids = packages
        .filter((pkg) => pkg.product.introPrice)
        .map((pkg) => pkg.product.identifier);
      if (!ids.length) return;
      const result = await Purchases.checkTrialOrIntroductoryPriceEligibility(ids);
      const eligible = {};
      for (const id of ids) {
        eligible[id] =
          result[id]?.status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;
      }
      setIntroEligibility(eligible);
    } catch (error) {
      console.error("Intro eligibility error:", error);
    }
  };

  const applyCustomerInfo = async (customerInfo) => {
    const active = Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
    setIsPremium(active);
    await AsyncStorage.setItem("isPremium", active ? "true" : "false");
    return active;
  };

  // Check if user is premium
  const checkPremiumStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();

      // Check if user has active premium entitlement
      const active = await applyCustomerInfo(customerInfo);
      console.log(active ? 'User is premium' : 'User is not premium');
    } catch (error) {
      console.error("Check premium status error:", error);

      // Fallback to AsyncStorage
      const storedPremium = await AsyncStorage.getItem("isPremium");
      if (storedPremium === "true") {
        setIsPremium(true);
      }
    }
  };

  // Purchase a package.
  // Returns { status: 'success' | 'cancelled' | 'pending' | 'error' }.
  // `silent` skips the alerts, for screens that show their own feedback.
  const purchasePremium = async (packageToBuy, { silent = false } = {}) => {
    try {
      console.log('Attempting purchase:', packageToBuy.identifier);

      const { customerInfo } = await Purchases.purchasePackage(packageToBuy);

      // Check if premium is now active
      if (await applyCustomerInfo(customerInfo)) {
        if (!silent) {
          Alert.alert(
            "Welcome to Premium! 🎉",
            "You now have unlimited translations and all 14 languages unlocked!"
          );
        }
        return { status: "success" };
      }
      return { status: "error" };
    } catch (error) {
      if (error.userCancelled) return { status: "cancelled" };

      // e.g. Ask to Buy: waiting for a parent's approval.
      if (error.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
        return { status: "pending" };
      }

      console.error("Purchase error:", error);
      if (!silent) {
        Alert.alert(
          "Purchase Failed",
          "Unable to complete purchase. Please try again or contact support.",
          [{ text: "OK" }]
        );
      }
      return { status: "error" };
    }
  };

  // Restore purchases.
  // Returns { status: 'restored' | 'none' | 'error' }.
  const restorePurchases = async ({ silent = false } = {}) => {
    try {
      const customerInfo = await Purchases.restorePurchases();

      if (await applyCustomerInfo(customerInfo)) {
        if (!silent) Alert.alert("Success", "Purchases restored!");
        return { status: "restored" };
      }
      if (!silent) Alert.alert("No Purchases", "No active purchases found.");
      return { status: "none" };
    } catch (error) {
      console.error("Restore error:", error);
      if (!silent) Alert.alert("Restore Failed", "Could not restore purchases.");
      return { status: "error" };
    }
  };

  // Load translation usage
  const loadTranslationCount = async () => {
    try {
      const count = await AsyncStorage.getItem("translationsToday");
      const date = await AsyncStorage.getItem("translationDate");
      const today = new Date().toDateString();

      if (date === today && count) {
        setTranslationsToday(parseInt(count));
      } else {
        await AsyncStorage.setItem("translationDate", today);
        await AsyncStorage.setItem("translationsToday", "0");
        setTranslationsToday(0);
      }
    } catch (error) {
      console.error("Load translation count error:", error);
    }
  };

  // Reset translation limit daily
  const checkDailyReset = () => {
    const interval = setInterval(async () => {
      const storedDate = await AsyncStorage.getItem("translationDate");
      const today = new Date().toDateString();

      if (storedDate !== today) {
        await AsyncStorage.setItem("translationDate", today);
        await AsyncStorage.setItem("translationsToday", "0");
        setTranslationsToday(0);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  };

  // Track translation usage
  const incrementTranslationCount = async () => {
    const newCount = translationsToday + 1;
    setTranslationsToday(newCount);
    await AsyncStorage.setItem("translationsToday", newCount.toString());
  };

  const canTranslate = () => {
    if (isPremium) return true;
    return translationsToday < FREE_TRANSLATION_LIMIT;
  };

  const isLanguageUnlocked = (langCode) => {
    if (isPremium) return true;
    return FREE_LANGUAGES.includes(langCode);
  };

  const getRemainingTranslations = () => {
    if (isPremium) return "Unlimited";
    return Math.max(0, FREE_TRANSLATION_LIMIT - translationsToday);
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        products,
        offering,
        offeringsStatus,
        introEligibility,
        refreshOfferings: loadProducts,
        translationsToday,
        loading,
        purchasePremium,
        restorePurchases,
        canTranslate,
        isLanguageUnlocked,
        getRemainingTranslations,
        incrementTranslationCount,
        FREE_TRANSLATION_LIMIT,
        FREE_LANGUAGES,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};
