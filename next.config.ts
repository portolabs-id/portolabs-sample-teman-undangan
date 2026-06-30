import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

// Enable getCloudflareContext() during `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
