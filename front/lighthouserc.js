module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      url: [
        "http://localhost:3000",
        // "http://localhost:3000/login",
        // "http://localhost:3000/register",
        // "http://localhost:3000/topics/123", // Example: Hardcoded dynamic route
      ],
      puppeteerScript: "./auth-script.js",
      numberOfRuns: 1,
      startServerReadyTimeout: 30000,
    },
    upload: {
      target: "filesystem",
      outputDir: "../docs",
      reportFilenamePattern: "%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%",
    },
  },
};
