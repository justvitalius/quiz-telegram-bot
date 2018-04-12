module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: "bot-app",
      script: "./src/bot/index.js",
      env: {
        NODE_ENV: "prealpha"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },

    {
      name: "api-app",
      script: "./src/statistics/index.js",
      env: {
        NODE_ENV: "prealpha"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
