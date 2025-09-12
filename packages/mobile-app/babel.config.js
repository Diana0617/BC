module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Temporalmente comentamos nativewind hasta configurarlo correctamente
      // ['nativewind/babel', { mode: 'compileOnly' }],
    ],
  };
};