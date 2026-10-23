// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['ios/*', 'android/*', 'training_data/*', 'models/*', '.expo/*', '.venv/*'],
  },
  {
    // '@env' is a babel alias from react-native-dotenv, not a real module.
    rules: {
      'import/no-unresolved': ['error', { ignore: ['^@env$'] }],
    },
  },
]);
