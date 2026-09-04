module.exports = {
  skipFiles: ["test/"],
  istanbulReporter: ["text", "json-summary"],
  mocha: {
    timeout: 200000,
    grep: "rank distribution",
    invert: true,
  },
};
