module.exports = {
    transform: {
      '^.+\\.jsx?$': 'babel-jest'
    },
    transformIgnorePatterns: [
      '/node_modules/(?!axios/).*'
    ],
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'jsx'],
  };
  