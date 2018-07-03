module.exports = function(api) {
  api.cache(true);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['> 0.5%', 'not ie 11', 'not op_mini all'],
          },
          useBuiltIns: 'usage',
        },
      ],
      '@babel/preset-react',
    ],
    plugins: [
      'babel-plugin-lodash',
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-syntax-dynamic-import',
      'react-loadable/babel',
      // [
      //   'import-inspector',
      //   {
      //     serverSideRequirePath: true,
      //   },
      // ],
    ],
  };
};
