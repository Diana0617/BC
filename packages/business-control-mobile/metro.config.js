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
    const fs = require('fs');
    const modulePath = moduleName.replace('@shared/', '');
    
    // Intentar primero con .js
    let fullPath = path.join(sharedPath, modulePath + '.js');
    
    // Si no existe, intentar con index.js (para carpetas)
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(sharedPath, modulePath, 'index.js');
    }
    
    // Si tampoco existe index.js, intentar sin extensión (dejará que Metro lo resuelva)
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(sharedPath, modulePath);
    }
    
    return {
      filePath: fullPath,
      type: 'sourceFile',
    };
  }
  
  if (moduleName.startsWith('@bc/shared/')) {
    const fs = require('fs');
    const modulePath = moduleName.replace('@bc/shared/', '');
    
    // Intentar primero con .js
    let fullPath = path.join(sharedPath, modulePath + '.js');
    
    // Si no existe, intentar con index.js (para carpetas)
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(sharedPath, modulePath, 'index.js');
    }
    
    // Si tampoco existe index.js, intentar sin extensión
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(sharedPath, modulePath);
    }
    
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

// Configurar servidor Metro para usar IP de red local
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url === '/') {
        const hostname = process.env.REACT_NATIVE_PACKAGER_HOSTNAME || '192.168.0.213';
        console.log('📱 Metro Bundler activo en:', hostname + ':8081');
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;