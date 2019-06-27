// const fs = require('fs')
module.exports = {
    devServer: {
        proxy: 'http://cloud-ultrasound.loc',
        port: 9000,
        open: true,
        compress: true,
        disableHostCheck: true,
//        https: {
//            key: fs.readFileSync('./example.com+7-key.pem'),
//            cert: fs.readFileSync('./example.com+7.pem'),
//            ca: fs.readFileSync('./example.com+7.pem'),
//        },
    },

    outputDir: '../public',

    indexPath: process.env.NODE_ENV === 'production'
        ? '../resources/views/app.blade.php'
        : 'index.html',

    transpileDependencies: [/node_modules[/\\\\]vuetify[/\\\\]/],
    publicPath: undefined,
    assetsDir: undefined,
    runtimeCompiler: undefined,
    productionSourceMap: false,
    parallel: undefined,
    css: undefined
}
