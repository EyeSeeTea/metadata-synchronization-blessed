module.exports = process.env.CYPRESS_ENV ? {} : {
    "presets": ["babel-preset-react-app"]
}
