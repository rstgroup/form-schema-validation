var path = require('path');

const entry = path.resolve(__dirname, "./src/index.js");

const rules = [
    {
        test: /.js?$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        }
    }
];

const umdBundle = {
    path: path.resolve(__dirname, "./dist/"),
    filename: "index.js",
    libraryTarget: "umd"
};

const cjsBundle = {
    path: path.resolve(__dirname, "./dist/"),
    filename: "cjs.js",
    libraryTarget: "commonjs2"
};

module.exports = [
    { entry: entry, module: { rules: rules }, output: umdBundle },
    { entry: entry, module: { rules: rules }, output: cjsBundle }
];
