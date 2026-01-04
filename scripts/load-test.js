/**
 * Performance & Security Test Script
 *
 * Run with: node scripts/load-test.js
 *
 * Tests:
 * 1. Response times for API endpoints
 * 2. Caching effectiveness (X-Cache headers)
 * 3. Rate limiting behavior
 * 4. Security headers presence
 */

const BASE_URL = "http://localhost:3000";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logResult(test, passed, details = "") {
  const status = passed ? `${colors.green}✓ PASS` : `${colors.red}✗ FAIL`;
  console.log(
    `${status}${colors.reset} ${test}${details ? ` - ${details}` : ""}`
  );
}

// Test 1: Response Time Test
async function testResponseTimes() {
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", colors.cyan);
  log("📊 RESPONSE TIME TEST", colors.bold);
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", colors.cyan);

  const endpoints = [
    { name: "Basel Standards", url: "/api/basel/standards" },
    { name: "Podcast Categories", url: "/api/angle/categories" },
    { name: "Podcasts", url: "/api/angle/podcasts" },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    const times = [];

    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      try {
        const res = await fetch(`${BASE_URL}${endpoint.url}`);
        const elapsed = Date.now() - start;
        times.push(elapsed);
      } catch (error) {
        times.push(-1);
      }
    }

    const validTimes = times.filter((t) => t >= 0);
    const avg =
      validTimes.length > 0
        ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
        : -1;

    results.push({ endpoint: endpoint.name, avg, times });

    const passed = avg < 500; // Should respond in under 500ms
    logResult(
      endpoint.name,
      passed,
      `Avg: ${avg}ms | Times: [${times.join(", ")}]ms`
    );
  }

  return results;
}

// Test 2: Cache Effectiveness Test
async function testCaching() {
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", colors.cyan);
  log("💾 CACHE EFFECTIVENESS TEST", colors.bold);
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", colors.cyan);

  const endpoints = [
    "/api/basel/standards",
    "/api/angle/categories",
    "/api/angle/podcasts",
  ];

  for (const url of endpoints) {
    try {
      // First request - should be MISS
      const res1 = await fetch(`${BASE_URL}${url}`);
      const cache1 = res1.headers.get("x-cache");

      // Second request - should be HIT
      const res2 = await fetch(`${BASE_URL}${url}`);
      const cache2 = res2.headers.get("x-cache");

      const firstIsMiss = cache1 === "MISS" || cache1 === null;
      const secondIsHit = cache2 === "HIT";

      logResult(
        url,
        secondIsHit,
        `1st: ${cache1 || "no header"} → 2nd: ${cache2 || "no header"}`
      );
    } catch (error) {
      logResult(url, false, `Error: ${error.message}`);
    }
  }
}

// Test 3: Rate Limiting Test
async function testRateLimiting() {
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", colors.cyan);
  log("🚦 RATE LIMITING TEST", colors.bold);
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", colors.cyan);

  const url = `${BASE_URL}/api/basel/standards`;
  let successCount = 0;
  let rateLimited = false;
  let rateLimitRemaining = null;

  log("Making 110 rapid requests to test rate limit (100/min)...");

  for (let i = 0; i < 110; i++) {
    try {
      const res = await fetch(url);
      rateLimitRemaining = res.headers.get("x-ratelimit-remaining");

      if (res.status === 429) {
        rateLimited = true;
        log(`  Rate limited at request #${i + 1}`, colors.yellow);
        break;
      }
      successCount++;
    } catch (error) {
      // Connection error
    }
  }

  logResult(
    "Rate Limiting Active",
    rateLimited,
    rateLimited
      ? `Blocked after ${successCount} requests`
      : `No rate limit hit (${successCount} successful)`
  );

  if (rateLimitRemaining !== null) {
    log(
      `  X-RateLimit-Remaining header present: ${rateLimitRemaining}`,
      colors.cyan
    );
  }
}

// Test 4: Security Headers Test
async function testSecurityHeaders() {
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", colors.cyan);
  log("🔒 SECURITY HEADERS TEST", colors.bold);
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", colors.cyan);

  const requiredHeaders = [
    { name: "x-frame-options", expected: "SAMEORIGIN" },
    { name: "x-content-type-options", expected: "nosniff" },
    { name: "x-xss-protection", expected: "1; mode=block" },
    { name: "referrer-policy", expected: "strict-origin-when-cross-origin" },
    { name: "x-dns-prefetch-control", expected: "on" },
  ];

  try {
    const res = await fetch(`${BASE_URL}/`);

    for (const header of requiredHeaders) {
      const value = res.headers.get(header.name);
      const passed = value === header.expected;
      logResult(
        header.name,
        passed,
        `Expected: "${header.expected}" | Got: "${value || "not set"}"`
      );
    }
  } catch (error) {
    log(`Error fetching headers: ${error.message}`, colors.red);
  }
}

// Test 5: Concurrent Request Test
async function testConcurrentRequests() {
  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", colors.cyan);
  log("⚡ CONCURRENT REQUEST TEST", colors.bold);
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", colors.cyan);

  const url = `${BASE_URL}/api/basel/standards`;
  const concurrentRequests = 20;

  log(`Sending ${concurrentRequests} concurrent requests...`);

  const start = Date.now();
  const promises = Array(concurrentRequests)
    .fill(null)
    .map(() =>
      fetch(url).then((r) => ({ status: r.status, time: Date.now() - start }))
    );

  const results = await Promise.all(promises);
  const totalTime = Date.now() - start;

  const successful = results.filter((r) => r.status === 200).length;
  const avgTime = Math.round(
    results.reduce((a, b) => a + b.time, 0) / results.length
  );

  logResult(
    "Concurrent Handling",
    successful >= concurrentRequests * 0.9,
    `${successful}/${concurrentRequests} succeeded | Total: ${totalTime}ms | Avg: ${avgTime}ms`
  );
}

// Main runner
async function runAllTests() {
  log(
    "\n╔══════════════════════════════════════════════════════════╗",
    colors.bold
  );
  log(
    "║     BETTERBANKINGS PERFORMANCE & SECURITY TEST SUITE     ║",
    colors.bold
  );
  log(
    "╚══════════════════════════════════════════════════════════╝",
    colors.bold
  );
  log(`Testing against: ${BASE_URL}`);
  log(`Time: ${new Date().toLocaleString()}`);

  try {
    await testResponseTimes();
    await testCaching();
    await testSecurityHeaders();
    await testConcurrentRequests();
    await testRateLimiting(); // Run last as it may trigger rate limit
  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, colors.red);
  }

  log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", colors.cyan);
  log("✅ TEST SUITE COMPLETE", colors.bold);
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", colors.cyan);
}

runAllTests();
