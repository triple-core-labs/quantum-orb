module.exports = {
  skipFiles: ["test/"],
  istanbulReporter: ["text", "json-summary"],
  mocha: {
    timeout: 200000,
    // The distribution spec sweeps all 10 000 residue classes on-chain. Under
    // coverage instrumentation that allocates enough trace data to exhaust the
    // Node heap, and it drives no coverage the reveal tests do not already
    // provide, since every reveal exercises _rank.
    grep: "rank distribution",
    invert: true,
  },
};
