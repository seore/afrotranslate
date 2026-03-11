import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePremium } from './PremiumContext';

const { width } = Dimensions.get('window');

export default function PremiumScreen({ onClose }) {
  const { products, purchasePremium, restorePurchases, isPremium, togglePremiumForTesting } = usePremium();

  const features = [
    { icon: 'infinite', title: 'Unlimited Translations', desc: 'Never run out of translations' },
    { icon: 'language', title: 'All 14 Languages', desc: 'Unlock every African language' },
    { icon: 'chatbubble-ellipses', title: 'Conversation Mode', desc: 'Real-time two-way conversations' },
    { icon: 'mic', title: 'Premium AI Voices', desc: 'Native African pronunciation' },
    { icon: 'cloud-offline', title: 'Extended Offline Mode', desc: '500+ phrases per language' },
    { icon: 'chatbubbles', title: 'Conversation History', desc: 'Save and export conversations' },
    { icon: 'notifications-off', title: 'Ad-Free Experience', desc: 'No interruptions' },
    { icon: 'flash', title: 'Priority Support', desc: 'Get help faster' },
  ];

  const getProductPrice = (identifier) => {
    const product = products.find(p => p.identifier === identifier);
    if (product && product.product) {
      return product.product.priceString || '$4.99';
    }
    // Fallback prices
    if (identifier === 'griot_premium_monthly') return '$4.99';
    if (identifier === 'griot_premium_yearly') return '$39.99';
    if (identifier === 'griot_lifetime') return '$59.99';
    return '...';
  };

  const getProductPackage = (identifier) => {
    return products.find(p => p.identifier === identifier);
  };

  const handlePurchase = (identifier) => {
    const packageToBuy = getProductPackage(identifier);
    if (packageToBuy) {
      purchasePremium(packageToBuy);
    } else {
      // In development, offer to enable for testing
      if (__DEV__) {
        Alert.alert(
          'Product Not Found',
          'Enable premium for testing?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Enable Premium (Test)', 
              onPress: () => togglePremiumForTesting()
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Product not available');
      }
    }
  };

  if (isPremium) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0A0A0A', '#1A1A1A']}
          style={styles.gradient}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.premiumBadge}>
            <Ionicons name="checkmark-circle" size={80} color="#00F5FF" />
            <Text style={styles.premiumTitle}>You're Premium! 🎉</Text>
            <Text style={styles.premiumSubtitle}>Enjoy unlimited translations</Text>
          </View>

          {__DEV__ && (
            <TouchableOpacity 
              style={styles.manageBtn}
              onPress={() => {
                togglePremiumForTesting();
                onClose();
              }}
            >
              <Text style={styles.manageBtnText}>Disable Premium (Testing)</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A']}
        style={styles.gradient}
      >
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>Unlock the full GRIOT experience</Text>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon} size={24} color="#00F5FF" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Choose Your Plan</Text>

            {/* Yearly - Best Value */}
            <TouchableOpacity
              style={[styles.pricingCard, styles.bestValue]}
              onPress={() => handlePurchase('griot_premium_yearly')}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <Text style={styles.pricingName}>Yearly</Text>
              <Text style={styles.pricingPrice}>{getProductPrice('griot_premium_yearly')}/year</Text>
              <Text style={styles.pricingSave}>Save 33% • $19.89 off</Text>
            </TouchableOpacity>

            {/* Monthly */}
            <TouchableOpacity
              style={styles.pricingCard}
              onPress={() => handlePurchase('griot_premium_monthly')}
            >
              <Text style={styles.pricingName}>Monthly</Text>
              <Text style={styles.pricingPrice}>{getProductPrice('griot_premium_monthly')}/month</Text>
              <Text style={styles.pricingDesc}>Billed monthly</Text>
            </TouchableOpacity>

            {/* Lifetime */}
            <TouchableOpacity
              style={styles.pricingCard}
              onPress={() => handlePurchase('griot_lifetime')}
            >
              <Text style={styles.pricingName}>Lifetime</Text>
              <Text style={styles.pricingPrice}>{getProductPrice('griot_lifetime')}</Text>
              <Text style={styles.pricingDesc}>One-time payment • Never pay again</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.restoreBtn} onPress={restorePurchases}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            • 7-day free trial for subscriptions{'\n'}
            • Cancel anytime, no questions asked{'\n'}
            • Subscriptions auto-renew unless turned off 24hrs before period ends{'\n'}
            • Payment charged to App Store account
          </Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  featureCard: {
    width: (width - 50) / 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,245,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#666',
  },
  pricingSection: {
    marginBottom: 30,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  bestValue: {
    borderColor: '#00F5FF',
    backgroundColor: 'rgba(0,245,255,0.05)',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#00F5FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
  },
  pricingName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00F5FF',
    marginBottom: 4,
  },
  pricingSave: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  pricingDesc: {
    fontSize: 13,
    color: '#666',
  },
  restoreBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00F5FF',
  },
  terms: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    textAlign: 'center',
  },
  premiumBadge: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginTop: 20,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  manageBtn: {
    backgroundColor: '#00F5FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 40,
  },
  manageBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
});