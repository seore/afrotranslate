import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePremium } from './PremiumContext';

export default function SettingsScreen({ onClose, onOpenPremium }) {
  const { isPremium, translationsToday, FREE_TRANSLATION_LIMIT } = usePremium();

  const openURL = async (url, title) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${title}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${title}`);
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'diamond',
          label: isPremium ? 'Premium Active' : 'Upgrade to Premium',
          value: isPremium ? '✓' : '',
          color: '#FFD700',
          onPress: () => {
            if (!isPremium) {
              onClose();
              onOpenPremium();
            }
          },
          showChevron: !isPremium,
        },
        {
          icon: 'stats-chart',
          label: 'Translations Today',
          value: isPremium ? 'Unlimited' : `${translationsToday}/${FREE_TRANSLATION_LIMIT}`,
          color: '#00F5FF',
          onPress: null,
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          icon: 'shield-checkmark',
          label: 'Privacy Policy',
          color: '#00F5FF',
          onPress: () => openURL('https://seore.github.io/afrotranslate-privacy/privacy.html', 'Privacy Policy'),
          showChevron: true,
        },
        {
          icon: 'document-text',
          label: 'Terms of Service',
          color: '#00F5FF',
          onPress: () => openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/', 'Terms of Service'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle',
          label: 'Help & Support',
          color: '#00F5FF',
          onPress: () => openURL('https://seore.github.io/griot-support/support.html', 'Support'),
          showChevron: true,
        },
        {
          icon: 'mail',
          label: 'Contact Us',
          //value: 'seorem2021@gmail.com',
          color: '#00F5FF',
          onPress: () => openURL('mailto:seorem2021@gmail.com', 'Email'),
          showChevron: true,
        },
        {
          icon: 'star',
          label: 'Rate GRIOT',
          color: '#FFD700',
          onPress: () => {
            // TODO: Replace with your actual App Store ID after approval
            Alert.alert('Rate GRIOT', 'Thank you for using GRIOT! App Store link coming soon.');
            // Linking.openURL('https://apps.apple.com/app/id123456789');
          },
          showChevron: true,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle',
          label: 'Version',
          value: '1.1.0',
          color: '#666',
          onPress: null,
        },
        {
          icon: 'code-slash',
          label: 'Developer',
          value: 'Seore Soyannwo',
          color: '#666',
          onPress: null,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.settingItem,
                      itemIndex === section.items.length - 1 && styles.lastItem,
                    ]}
                    onPress={item.onPress}
                    disabled={!item.onPress}
                    activeOpacity={item.onPress ? 0.7 : 1}
                  >
                    <View style={styles.settingLeft}>
                      <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                        <Ionicons name={item.icon} size={20} color={item.color} />
                      </View>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                    </View>
                    
                    <View style={styles.settingRight}>
                      {item.value && (
                        <Text style={styles.settingValue}>{item.value}</Text>
                      )}
                      {item.showChevron && (
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              GRIOT - African Voice Translator
            </Text>
            <Text style={styles.footerSubtext}>
              Connecting cultures through language
            </Text>
            <Text style={styles.footerCopyright}>
              © 2026 Seore Soyannwo. All rights reserved.
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 60 : 40,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  footerCopyright: {
    fontSize: 11,
    color: '#444',
  },
});