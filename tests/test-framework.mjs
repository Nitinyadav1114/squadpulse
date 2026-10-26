// ============================================================================
// SquadPulse Test Framework - Zero-Dependency Asynchronous Test Harness
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

class TestRegistry {
  constructor() {
    this.currentTier = 'Tier 1';
    this.currentSuite = '';
    this.suites = [];
    this.stats = {
      'Tier 1': { total: 0, passed: 0, failed: 0 },
      'Tier 2': { total: 0, passed: 0, failed: 0 },
      'Tier 3': { total: 0, passed: 0, failed: 0 },
      'Tier 4': { total: 0, passed: 0, failed: 0 },
      other: { total: 0, passed: 0, failed: 0 },
    };
    this.failures = [];
  }

  setTier(tier) {
    this.currentTier = tier;
    if (!this.stats[tier]) {
      this.stats[tier] = { total: 0, passed: 0, failed: 0 };
    }
  }

  describe(name, fn) {
    this.currentSuite = name;
    this.suites.push({ tier: this.currentTier, name, fn });
  }

  recordPass(tier, suite, testName, durationMs) {
    const tierKey = this.stats[tier] ? tier : 'other';
    this.stats[tierKey].total++;
    this.stats[tierKey].passed++;
    console.log(`    ${colors.green}✔${colors.reset} ${testName} ${colors.dim}(${durationMs.toFixed(1)}ms)${colors.reset}`);
  }

  recordFail(tier, suite, testName, error, durationMs) {
    const tierKey = this.stats[tier] ? tier : 'other';
    this.stats[tierKey].total++;
    this.stats[tierKey].failed++;
    this.failures.push({ tier, suite, testName, error });
    console.log(`    ${colors.red}✖ ${testName}${colors.reset}`);
    console.log(`      ${colors.red}${error.message || error}${colors.reset}`);
    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(1, 4).join('\n');
      console.log(`      ${colors.dim}${stackLines}${colors.reset}`);
    }
  }
}

export const registry = new TestRegistry();

export function setTestTier(tier) {
  registry.setTier(tier);
}

export function describe(name, fn) {
  registry.describe(name, fn);
}

const currentTests = [];
export function it(name, fn) {
  currentTests.push({ name, fn });
}
export const test = it;

export async function runSuite(suiteObj) {
  registry.setTier(suiteObj.tier);
  console.log(`\n${colors.bright}${colors.cyan}▶ [${suiteObj.tier}] ${suiteObj.name}${colors.reset}`);
  currentTests.length = 0;
  await suiteObj.fn();

  for (const t of currentTests) {
    const start = performance.now();
    try {
      await t.fn();
      const dur = performance.now() - start;
      registry.recordPass(suiteObj.tier, suiteObj.name, t.name, dur);
    } catch (err) {
      const dur = performance.now() - start;
      registry.recordFail(suiteObj.tier, suiteObj.name, t.name, err, dur);
    }
  }
}

export const assert = {
  ok(val, msg = 'Expected value to be truthy') {
    if (!val) throw new Error(msg);
  },
  equal(actual, expected, msg) {
    if (actual != expected) {
      throw new Error(msg || `Expected ${JSON.stringify(actual)} == ${JSON.stringify(expected)}`);
    }
  },
  strictEqual(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(msg || `Expected strict equality: actual [${actual}] !== expected [${expected}]`);
    }
  },
  notStrictEqual(actual, expected, msg) {
    if (actual === expected) {
      throw new Error(msg || `Expected values not to be strictly equal: [${actual}]`);
    }
  },
  deepEqual(actual, expected, msg) {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    if (actStr !== expStr) {
      throw new Error(msg || `Deep equality mismatch:\nActual:   ${actStr}\nExpected: ${expStr}`);
    }
  },
  closeTo(actual, expected, delta = 0.001, msg) {
    if (Math.abs(actual - expected) > delta) {
      throw new Error(msg || `Expected ${actual} to be within ${delta} of ${expected}`);
    }
  },
  throws(fn, expectedMatch, msg) {
    let threw = false;
    let caughtErr = null;
    try {
      fn();
    } catch (err) {
      threw = true;
      caughtErr = err;
    }
    if (!threw) {
      throw new Error(msg || 'Expected function to throw, but it succeeded');
    }
    if (expectedMatch && caughtErr) {
      const errMsg = caughtErr.message || String(caughtErr);
      if (typeof expectedMatch === 'string' && !errMsg.includes(expectedMatch)) {
        throw new Error(`Expected error message to include "${expectedMatch}", got "${errMsg}"`);
      }
      if (expectedMatch instanceof RegExp && !expectedMatch.test(errMsg)) {
        throw new Error(`Expected error message to match ${expectedMatch}, got "${errMsg}"`);
      }
    }
  },
  includes(container, item, msg) {
    if (typeof container === 'string') {
      if (!container.includes(item)) {
        throw new Error(msg || `Expected string to contain "${item}", got "${container}"`);
      }
    } else if (Array.isArray(container)) {
      if (!container.includes(item)) {
        throw new Error(msg || `Expected array to contain item: ${JSON.stringify(item)}`);
      }
    } else {
      throw new Error('container must be string or array');
    }
  },
  lengthOf(container, expectedLen, msg) {
    const len = container ? container.length : 0;
    if (len !== expectedLen) {
      throw new Error(msg || `Expected length ${expectedLen}, got ${len}`);
    }
  },
  isTrue(val, msg) {
    if (val !== true) throw new Error(msg || `Expected true, got ${val}`);
  },
  isFalse(val, msg) {
    if (val !== false) throw new Error(msg || `Expected false, got ${val}`);
  },
  isAtLeast(actual, min, msg) {
    if (actual < min) throw new Error(msg || `Expected ${actual} >= ${min}`);
  },
  isAtMost(actual, max, msg) {
    if (actual > max) throw new Error(msg || `Expected ${actual} <= ${max}`);
  },
};
