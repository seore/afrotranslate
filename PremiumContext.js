import React, { createContext, useState, useEffect, useContext, Children } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const PremiumContext = createContext();

export const usePremium = () => useContext(PremiumContext);

export const PremiumProvider = ({ children }) => {
    const [isPremium, setIsPremium] = useState(false);
    const [products, setProducts] = useState([]);
    const [translationsToday, setTranslationToday] = useState(0);
    const [loading, setLoading] = useState(true);

    const FREE_TRANSLATION_LIMIT = 20;
    const FREE_LANGUAGES = ['sw', 'yo', 'ha', 'ig', 'zu', 'en', 'fr'];

    useEffect(() => {
        initializePurchases();
        loadTranslationCount();
        checkDailyReset();
    }, []);

    const initializePurchases = async () => {
        try {
            await InAppPurchases.connectAsync();

            InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
                if (responseCode === InAppPurchases.IAPResponseCode.OK) {
                    results.forEach(purchase => {
                        if (!purchase.acknowledged) {
                            console.log('Purchase successful:', purchase);
                            finishPurchase(purchase);
                        }
                    });
                } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
                    console.log('Purchase cancelled');
                } else {
                    console.warn('Purchase failed:', errorCode);
                }
            });

            const { results } = await InAppPurchases.getProductsAsync([
                'griot_premium_monthly',
                'griot_premium_yearly',
                'griot_lifetime',
            ]);

            setProducts(results);
            await checkPremiumStatus();
            setLoading(false);
        } catch (error) {
            console.warn('Purchase initialisation error:', error);
            setLoading(false);
        }
    };

    const checkPremiumStatus = async () => {
        try {
            const storedPremium = await InAppPurchases.getPurchaseHistoryAsync();

            if (history.results && history.results.length > 0) {
                const hasActivePurchase = history.results.some(purchase => {
                    if (purchase.productId === 'griot_lifetime') {
                        return purchase.acknowledged;
                    }
                    if (purchase.productId.includes('monthly') || purchase.productId.includes('yearly')) {
                        return purchase.acknowledged && !isExpired(purchase);
                    }
                    return false;
                });

                if (hasActivePurchase) {
                    await AsyncStorage.setItem('isPremium', 'true');
                    setIsPremium(true);
                }
            }
        } catch (error) {
            console.error('Check premium status error:', error);
        }
    };

    const isExpired = (purchase) => {
        if (!purchase.expirationDate) return false;
        return new Date(purchase.expirationDate) < new Date();
    };

    const finishPurchase = async (purchase) => {
        try {
            await InAppPurchases.finishTransactionAsync(purchase, false);
            await AsyncStorage.setItem('isPremium', 'true');
            setIsPremium(true);

            Alert.alert(
                'Welcome to GRIOT Premium!',
                'You now have unlimited translations and access to all languages!'
            );
        } catch (error) {
            console.error('Finish purchase error:', error);
        }
    };

    const purchasePremium = async (productId) => {
        try {
            await InAppPurchases.purchaseItemAsync(productId);
        } catch (error) {
            console.error('Purchase error:', error);
            Alert.alert('Purchase failed', 'Could not complete purchase. Please try again.');
        }
    };

    const restorePurchases = async () => {
        try {
            const history = await InAppPurchases.getPurchaseHistoryAsync();

            if (history.results && history.results.length > 0) {
                await checkPremiumStatus();
                Alert.alert('Success', 'Purchase restored!');
            } else {
                Alert.alert('No Purchases', 'No previous purchases found.');
            }
        } catch (error) {
            console.error('Restore error:', error);
            Alert.alert('Restore Failed', 'Could not restore purchases.');
        }
    };

    const loadTranslationCount = async () => {
        try {
            const count = await AsyncStorage.getItem('translationsToday');
            const date = await AsyncStorage.getItem('translationDate');
            const today = new Date().toDateString();

            if (date === today && count) {
                setTranslationToday(parseInt(count));
            } else {
                await AsyncStorage.setItem('translationDate', today);
                await AsyncStorage.setItem('translationsToday', '0');
                setTranslationToday(0);
            }
        } catch (error) {
            console.error('Load translation count error:', error);
        }
    };

    const checkDailyReset = () => {
        setInterval(async () => {
            const storedDate = await AsyncStorage.getItem('translationDate');
            const today = new Date().toDateString();

            if (storedDate !== today) {
                await AsyncStorage.setItem('translationDate', today);
                await AsyncStorage.setItem('translationsToday', '0');
                setTranslationsToday(0);
            }
        }, 60000);
    };

    const incrementTranslationCount = async () => {
        const newCount = translationsToday + 1;
        setTranslationToday(newCount);
        await AsyncStorage.setItem('translationsToday', newCount.toString());
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
        if (isPremium) return 'Unlimited';
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