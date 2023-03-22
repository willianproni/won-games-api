module.exports = {
  // ...
  'list-content-type': {
    enabled: true,
    resolve: './src/plugins/list-content-type'
  },
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024, // 256mb in bytes
      provider: 'local',
      providerOptions: {
        sizeLimit: 100000,
      },
    },
  },
  // ...
}