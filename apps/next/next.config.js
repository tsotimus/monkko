/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        // Needed for mongodb
        config.resolve.fallback = {
        "mongodb-client-encryption": false ,
        "aws4": false
    };
    return config;
  },
};

export default nextConfig;
