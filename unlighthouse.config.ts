export default {
    site: "https://ninjatype.com",
    scanner: {
        // Run multiple samples for accuracy
        samples: 1,
        // Throttle like mobile
        throttle: false,
        // Include all routes
        sitemap: true,
    },
    outputPath: "./unlighthouse-reports",
    // Optional: Configure which routes to scan
    include: ["/", "/history", "/learn", "/about", "/contact", "/settings"],
};
