const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');
const sharedPath = path.resolve(projectRoot, '..', 'shared', 'src');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

if ('disableHierarchicalLookup' in config.resolver) {
  delete config.resolver.disableHierarchicalLookup;
}

config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  path.join(workspaceRoot, 'node_modules')
];

// Custom resolver para manejar @shared
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@shared/')) {
    const modulePath = moduleName.replace('@shared/', '');
    const fullPath = path.join(sharedPath, modulePath + '.js');
    return {
      filePath: fullPath,
      type: 'sourceFile',
    };
  }
  
  if (moduleName.startsWith('@bc/shared/')) {
    const modulePath = moduleName.replace('@bc/shared/', '');
    const fullPath = path.join(sharedPath, modulePath + '.js');
    return {
      filePath: fullPath,
      type: 'sourceFile',
    };
  }

  // Fallback al resolver por defecto
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  react: path.join(projectRoot, 'node_modules/react'),
  'react/jsx-runtime': path.join(projectRoot, 'node_modules/react/jsx-runtime'),
  'react-native': path.join(projectRoot, 'node_modules/react-native'),
  '@reduxjs/toolkit': path.join(projectRoot, 'node_modules/@reduxjs/toolkit'),
  'react-redux': path.join(projectRoot, 'node_modules/react-redux')
};

module.exports = config;