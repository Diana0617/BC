const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Define paths
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

// Watch all packages in the monorepo
config.watchFolders = [
  path.resolve(workspaceRoot, 'shared'),
];

// Configure how Metro resolves modules
config.resolver = {
  ...config.resolver,
  
  // Node modules paths - buscar en shared también
  nodeModulesPath: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'shared/node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ],
  
  // Resolver main fields
  resolverMainFields: ['react-native', 'browser', 'main'],
  
  // Platforms
  platforms: ['native', 'android', 'ios', 'web'],
};

module.exports = config;