const webpack = require('webpack');
const path = require('path');
module.exports = {
  entry: {
    blog: [
      './src/index'
    ]
  },
  output: {
    path: path.join(__dirname, 'source', 'js'),
    filename: 'blog.js',
    publicPath: 'js/'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel',
      include: [path.join(__dirname, 'src')]
    }, {
      test: /\.less$/,
      loader: 'style!css!autoprefixer!less'
    }, {
      test: /\.css$/,
      loader: 'style!css!autoprefixer'
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      comparisons: false,
      output: {
        comments: false,
        ascii_only: true
      }
    })
  ]
};
