module.exports = {
  appId: 'com.company.advanced-data-extractor',
  productName: 'Advanced Data Extractor',
  directories: {
    output: 'dist',
    buildResources: 'assets'
  },
  files: [
    'build/**/*',
    'node_modules/**/*'
  ],
  extraResources: [
    {
      from: 'assets',
      to: 'assets'
    }
  ],
  mac: {
    category: 'public.app-category.productivity',
    icon: 'assets/icon.icns',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      }
    ]
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: 'assets/icon.ico'
  },
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      }
    ],
    icon: 'assets/icon.png',
    category: 'Office'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  publish: null
};