module.exports = {
    entry: "./app/main.js",
    output: {
        path: __dirname + '/js',
        filename: "bundle.js"
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: "babel-loader"
        }
      ]
    }
}
