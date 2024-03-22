import fs from "fs";

const typeAndDirectory = {
  commonjs: "cjs",
  module: "mjs",
};

Object.entries(typeAndDirectory).forEach(([type, directory]) => {
  const packageJson = {
    type,
  };

  fs.writeFileSync(
    `./lib/${directory}/package.json`,
    JSON.stringify(packageJson, null, 2),
  );
});
