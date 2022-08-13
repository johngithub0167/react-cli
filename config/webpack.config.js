
const EslintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
// const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin  = require("mini-css-extract-plugin") 
const CssMinimizerWebpackPlugin  = require("css-minimizer-webpack-plugin")
const TerserWebpackPlugin = require("terser-webpack-plugin")
const ImageMinimizerWebpackPlugin = require("image-minimizer-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');


// 获取cross-env定义的环境变量
const isProduction = process.env.NODE_ENV === 'production'

const path = require('path')

 
const getStyleLoaders = (laoders) => {
  return [
    isProduction ? MiniCssExtractPlugin.loader:'style-loader',
    'css-loader',
    {
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
    }, laoders && {
      loader: laoders,
      options: laoders === 'less-loader' ? {
        // antd 自定义主题色配置
        lessOptions: {
          modifyVars: { '@primary-color': '#1DA57A' },
          javascriptEnabled: true,
        },
      } : {}
    },
  ].filter(Boolean)
}


module.exports = {
  entry: './src/main.js',
  output: {
    path:isProduction? path.resolve(__dirname,'../dist'):undefined,
    filename:isProduction? 'static/js/[name].[contenthash:10].js':'static/js/[name].js',
    chunkFilename:isProduction? 'static/js/[name].[contenthash:10].chunk.js':'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[hash:10][ext][query]',
    clean:true
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
          plugins: [
            !isProduction && 'react-refresh/babel'//激活js的HMR 
          ].filter(Boolean)
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
      template: path.resolve(__dirname, '../public/index.html')
    }),
    // new ReactRefreshWebpackPlugin(),
    isProduction && new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:10].css",
      chunkFilename:"static/css/[name].[contenthash:10].chunk.css"
    }),
    isProduction && new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'),
          to: path.resolve(__dirname, '../dist'),
          globOptions: {
            // 忽略index.html文件
            ignore:["**/index.html"]
          }
        },
      ],
    }),
    !isProduction && new ReactRefreshWebpackPlugin()
  ].filter(Boolean),
  mode:isProduction? 'production':'development',
  devtool: isProduction?'source-map':'cheap-module-source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // react相关依赖打包
        react: {
          name: "chunk-react",
          test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
          priority: 20,
        },
        // antd 单独打包
        antd: {
          name: "chunk-antd",
          test: /[\\/]node_modules[\\/]antd(.*)/,
          priority: 30,
        },
        // 剩下的node_modules单独打包
        libs: {
          name: 'chunk-libs',
          test: /[\\/]node_modules[\\/]/,
          priority:10
        }
      }
    },
    runtimeChunk: {
      name:(entrypoint)=>`runtime~${entrypoint.name}.js`
    },
    // 是否需要进行压缩
    minimize:isProduction,
    minimizer: [
      new CssMinimizerWebpackPlugin(),
      new TerserWebpackPlugin(), 
      new ImageMinimizerWebpackPlugin({
        minimizer: {
          implementation: ImageMinimizerWebpackPlugin.imageminGenerate, 
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      parmas: {
                        xmlnsOrder:"alphabetical"
                      }
                    }
                  ]
                },
              ],
            ],
          },
        },
      })
    ]
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
  },
  performance:false, //关闭性能分析，提升打包速度
  devServer: {
    host: 'localhost',
    port: 3001,
    hot: true,
    open: true,
    historyApiFallback: true,//解决前端路由刷新404的问题
  }
}