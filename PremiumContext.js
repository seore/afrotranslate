// ================================================================
// PremiumContext.js - Premium Features with RevenueCat
// ================================================================

import React, { createContext, useState, useEffect, useContext } from "react";
import Purchases from "react-native-purchases";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import { REVENUECAT_API_KEY } from "@env";

const PremiumContext = createContext();

export const usePremium = () => useContext(PremiumContext);

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [products, setProducts] = useState([]);
  const [translationsToday, setTranslationsToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const FREE_TRANSLATION_LIMIT = 10;
  const FREE_LANGUAGES = ["sw", "yo", "ha", "ig", "zu", "en", "fr"];

  useEffect(() => {
    initializePurchases();
    loadTranslationCount();
    const cleanup = checkDailyReset();
    return cleanup;
  }, []);

  // Initialize RevenueCat
  const initializePurchases = async () => {
    try {
      console.log('Initializing RevenueCat...');
      
      // Configure RevenueCat
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
      });

      console.log('RevenueCat configured');

      // Load products
      await loadProducts();
      
      // Check premium status
      await checkPremiumStatus();

      setLoading(false);
      console.log('RevenueCat initialization complete');
    } catch (error) {
      console.error("RevenueCat initialization error:", error);
      setLoading(false);
      
      // Set fallback products for testing
      setProducts([
        { 
          identifier: 'griot_premium_monthly',
          product: { 
            priceString: '$4.99',
            title: 'Premium Monthly'
          }
        },
        { 
          identifier: 'griot_premium_yearly',
          product: { 
            priceString: '$39.99',
            title: 'Premium Yearly'
          }
        },
        { 
          identifier: 'griot_lifetime',
          product: { 
            priceString: '$79.99',
            title: 'Lifetime Premium'
          }
        },
      ]);
    }
  };

  // Load subscription products from RevenueCat
  const loadProducts = async () => {
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current && offerings.current.availablePackages.length > 0) {
        console.log('Products loaded:', offerings.current.availablePackages.length);
        setProducts(offerings.current.availablePackages);
      } else {
        console.log('No offerings available, using fallback');
        // Fallback products
        setProducts([
          { 
            identifier: 'griot_premium_monthly',
            product: { 
              priceString: '$4.99',
              title: 'Premium Monthly'
            }
          },
          { 
            identifier: 'griot_premium_yearly',
            product: { 
              priceString: '$39.99',
              title: 'Premium Yearly'
            }
          },
          { 
            identifier: 'griot_lifetime',
            product: { 
              priceString: '$79.99',
              title: 'Lifetime Premium'
            }
          },
        ]);
      }
    } catch (error) {
      console.error("Load products error:", error);
      // Set fallback products
      setProducts([
        { 
          identifier: 'griot_premium_monthly',
          product: { 
            priceString: '$4.99',
            title: 'Premium Monthly'
          }
        },
        { 
          identifier: 'griot_premium_yearly',
          product: { 
            priceString: '$39.99',
            title: 'Premium Yearly'
          }
        },
        { 
          identifier: 'griot_lifetime',
          product: { 
            priceString: '$79.99',
            title: 'Lifetime Premium'
          }
        },
      ]);
    }
  };

  // Check if user is premium
  const checkPremiumStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();

      // Check if user has active premium entitlement
      if (customerInfo.entitlements.active["premium"]) {
        console.log('User is premium');
        setIsPremium(true);
        await AsyncStorage.setItem("isPremium", "true");
      } else {
        console.log('User is not premium');
        setIsPremium(false);
        await AsyncStorage.setItem("isPremium", "false");
      }
    } catch (error) {
      console.error("Check premium status error:", error);
      
      // Fallback to AsyncStorage
      const storedPremium = await AsyncStorage.getItem("isPremium");
      if (storedPremium === "true") {
        setIsPremium(true);
      }
    }
  };

  // Purchase a package
  const purchasePremium = async (packageToBuy) => {
    try {
      console.log('Attempting purchase:', packageToBuy);
      
      const { customerInfo } = await Purchases.purchasePackage(packageToBuy);

      // Check if premium is now active
      if (customerInfo.entitlements.active["premium"]) {
        setIsPremium(true);
        await AsyncStorage.setItem("isPremium", "true");

        Alert.alert(
          "Welcome to Premium! 🎉",
          "You now have unlimited translations and all 14 languages unlocked!"
        );
      }
    } catch (error) {
      if (!error.userCancelled) {
        console.error("Purchase error:", error);
        
        Alert.alert(
          "Purchase Failed",
          "Unable to complete purchase. Please try again or contact support.",
          [{ text: "OK" }]
        );
      }
    }
  };

  // Restore purchases
  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();

      if (customerInfo.entitlements.active["premium"]) {
        setIsPremium(true);
        await AsyncStorage.setItem("isPremium", "true");

        Alert.alert("Success", "Purchases restored!");
      } else {
        Alert.alert("No Purchases", "No active purchases found.");
      }
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert("Restore Failed", "Could not restore purchases.");
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