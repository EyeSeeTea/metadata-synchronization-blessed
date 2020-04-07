module.exports = process.env.CYPRESS_E2E
    ? {}
    : {
          presets: ["@babel/typescript", "babel-preset-react-app"],
      };
