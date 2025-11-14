module.exports = {
    testEnvironment: "node",
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov"],
    coveragePathIgnorePatterns: ["/node_modules/"],
    coverageThreshold: {
      global: {
        lines: 70,
        statements: 70,
        branches: 50,
        functions: 70
      }
    }
  };
  