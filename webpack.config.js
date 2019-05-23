const { webpackConfig, webpackMerge } = require('just-scripts');
module.exports = webpackMerge(webpackConfig, {
  externals: [
    {
      react: 'React'
    },
    {
      'react-dom': 'ReactDOM'
    }
  ]
});
