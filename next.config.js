/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Escludi i moduli problematici
      'react-native$': 'react-native-web',
      'react-native-reanimated': 'react-native-reanimated/lib/module/web',
    }
    
    // Ignora i moduli problematici
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
    }
    
    return config
  },
  transpilePackages: [
    'react-native',
    'react-native-web',
    'expo',
    '@expo',
    '@react-native',
    'react-native-reanimated',
    'react-native-safe-area-context',
    'react-native-screens',
    'react-native-svg',
  ]
}

module.exports = nextConfig 