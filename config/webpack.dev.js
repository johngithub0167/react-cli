
const EslintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const path = require('path')

 
const getStyleLoaders = (laoders) => {
  return ['style-loader', 'css-loader', {
    // 处理css 兼容性问题
    // 配合packgage.json中的browserslist来指定兼容性
    loader: 'postcss-loader',
    options: {
      postcssOptions: { 
        plugins: [
          'postcss-preset-env',
        ]
      } 
    }
  },laoders].filter(Boolean)
}


module.exports = {
  entry: './src/main.js',
  output: {
    path: undefined,
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].chunk.js',
    assetModuleFilename:'static/media/[hash:10][ext][query]',
  },
  module: {
    rules: [
      //处理css
      {
        test: /\.css$/,
        use: getStyleLoaders()
      },   
      {
        test: /\.less$/,
        use: getStyleLoaders('less-loader')
      },
      {
        test: /\.s[ac]ss$/,
        use:  getStyleLoaders('sass-loader')
      },
      {
        test: /\.styl$/,
        use: getStyleLoaders('stylus-loader')
      },
      // 处理图片
      {
        test: /\.(jpe?g|png|gif|webp|svg)/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize:10 * 1024
          },

        }
      },
      // 处理其他资源
      {
        test: /\.(woff2?|ttf)/,
        type:"asset/resource"
      },
      // 处理js
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, '../src'),
        loader: "babel-loader",
        options: {
          cacheDirectory: true, //开启缓存
          cacheCompression: false, //是否缓存压缩  开发环境不需要
          plugins:['react-refresh/babel']//激活js的HMR
        }
      }
    ]
  },
  // 处理html

  plugins: [
    new EslintWebpackPlugin({
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules',
      cache: true,
      cacheLocation: path.resolve(__dirname,'../node_modules/.cache/.eslintcache') 
    }),
    new HtmlWebpackPlugin({
      template:path.resolve(__dirname,'../public/index.html')
    }),
    new ReactRefreshWebpackPlugin()
  ],
  mode: 'development',
  devtool: 'cheap-module-source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: {
      name:(entrypoint)=>`runtime~${entrypoint.name}.js`
    }
  },
  resolve: {
    extensions:['.jsx',".js",'.json']
  },
  devServer: {
    host: 'localhost',
    port: 3001,
    hot: true,
    open: true,
    historyApiFallback: true,//解决前端路由刷新404的问题
  }
}