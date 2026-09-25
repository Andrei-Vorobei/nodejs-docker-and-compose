module.exports = {
  apps: [
    {
      name: 'kpd-backend',
      script: 'dist/src/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
