const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
if ('disableHierarchicalLookup' in config.resolver) {
  delete config.resolver.disableHierarchicalLookup;
}
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  path.join(workspaceRoot, 'node_modules')
];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  react: path.join(projectRoot, 'node_modules/react'),
  'react/jsx-runtime': path.join(projectRoot, 'node_modules/react/jsx-runtime'),
  'react-native': path.join(projectRoot, 'node_modules/react-native'),
  '@reduxjs/toolkit': path.join(projectRoot, 'node_modules/@reduxjs/toolkit'),
  'react-redux': path.join(projectRoot, 'node_modules/react-redux')
};

module.exports = config;