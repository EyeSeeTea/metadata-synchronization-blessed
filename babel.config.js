module.exports = process.env.CYPRESS_ENV ? {} : {
    "presets": ["@babel/typescript", "babel-preset-react-app"]
};
