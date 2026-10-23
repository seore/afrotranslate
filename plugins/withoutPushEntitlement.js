// GRIOT only schedules local reminder notifications, which need no push
// entitlement. expo-notifications adds `aps-environment` automatically;
// remove it so signing and App Store capabilities stay as they were.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};
