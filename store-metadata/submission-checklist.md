# V2.0 pre-submission checklist

Work through this before uploading the Xcode archive. Items are grouped by where you do them.

## A. In the project (done in code unless unticked)

- [x] Microphone / speech permission text describes translation **and** pronunciation practice (`ios/GRIOT/Info.plist`)
- [x] Photo-save permission text present (`NSPhotoLibraryAddUsageDescription`) — needed for "Save Image" on share cards
- [x] Privacy manifest declares Product Interaction · Analytics · not linked · not tracking; `NSPrivacyTracking` false
- [x] No push entitlement (`ios/GRIOT/GRIOT.entitlements` empty) — reminders are local
- [x] `ITSAppUsesNonExemptEncryption` = false (export compliance)
- [x] Paywall: prices/trial from the store, renewal terms, Restore, Terms + Privacy links, visible close (Guideline 3.1.2)
- [x] No hard-coded prices or "7-day trial" text anywhere in use
- [x] Version **2.0.0 (build 1)** in `ios/GRIOT/Info.plist` (what Xcode Archive uses), mirrored in the Xcode project, `app.json` and `package.json`. If you upload again for 2.0.0, raise the build number (2, 3…) in Info.plist first
- [ ] `.env` contains real `REVENUECAT_API_KEY`, `API_KEY`, `POSTHOG_API_KEY` **before** archiving (values are baked in when the JS is bundled)
- [ ] Optional: delete unused `PremiumScreen.js` (old paywall with hard-coded prices)

## B. App Store Connect

- [ ] New version **2.0.0** created
- [ ] Description, subtitle, keywords, promotional text, What's New from `app-store-listing.md`
- [ ] Primary category **Education** (App Information)
- [ ] New screenshots (6.9" and 6.5") — no tone scoring or Igbo/Hausa lessons shown
- [ ] **App Privacy**: add *Usage Data → Product Interaction* · Analytics · Not linked · Not used for tracking. Keep RevenueCat's *Purchases* entry if already listed
- [ ] Privacy Policy URL still correct, and the page **updated** with `privacy-policy.md`
- [ ] App Review notes from `app-review-notes.md`
- [ ] Subscriptions: yearly has the 7-day **Introductory Offer** if you want a trial; all three products "Ready to Submit"/approved
- [ ] Family Sharing turned on for each product (irreversible) — if wanted
- [ ] Age rating questionnaire re-confirmed

## C. RevenueCat and PostHog

- [ ] RevenueCat **current** offering contains `$rc_annual`, `$rc_monthly`, `$rc_lifetime`; entitlement `premium` attached to all three
- [ ] PostHog EU project: **Discard client IP data ON**; autocapture, session replay, surveys OFF

## D. Test on a real iPhone (TestFlight build)

- [ ] Fresh install: onboarding → first lesson → paywall (close with ✕) → Learn tab
- [ ] "Skip to translator" path works
- [ ] Sandbox purchase of each plan unlocks Premium without restart; Restore works after reinstall
- [ ] Paywall with no connection shows "couldn't load plans", not fake prices
- [ ] Lessons 1–2 free; lesson 3+ and Unit 2 open the paywall; first review free
- [ ] Microphone denied: lessons still completable; translator typing works
- [ ] Reminders fire at the chosen time; skipped after meeting the goal
- [ ] Share a proverb card; "Save Image" asks permission and doesn't crash
- [ ] Translator: voice (English), typing (Yorùbá), course phrase shows "From GRIOT lessons"
- [ ] iPhone SE + largest Dynamic Type: no clipped text on lessons, paywall, translator
- [ ] Analytics: events appear in PostHog Activity; turning the Settings switch off stops them

## E. Before release (not blocking review, but important)

- [ ] Native-speaker review of all Yorùbá: 47 lesson phrases, 15 offline phrases, 14 proverbs, 50 names (tone marks, meanings, notes)
- [ ] Native audio recordings for at least Unit 1 (the placeholder voice mispronounces Yorùbá)
- [ ] Decide ElevenLabs: configure voices, or remove the integration and its key from the app
