/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // generate static website
	output: "export",
	images: {
		unoptimized: true,
	},
	webpack: (config, {isServer}) => {
		if (!isServer) {
			// Fixes npm packages that depend on `fs` module
			config.resolve.fallback.fs = false;
		}
		return config;
	}
};

export default nextConfig;
