module.exports = (api) => {
  api && api.cache(false);

  const presets = [
    "react-app",
    "@babel/preset-env",
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ],
  ];

  return {
    presets,
  };
};
