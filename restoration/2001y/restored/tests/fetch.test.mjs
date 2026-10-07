import assert from "node:assert/strict";
import test from "node:test";

process.env.wpURL = "https://wordpress.example/wp-json/wp/v2";

const { json } = await import("../lib/fetch.ts");

function captureRetryWarnings(t) {
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (...args) => warnings.push(args);
  t.after(() => {
    console.warn = originalWarn;
  });
  return warnings;
}

test("json retries transient request failures", async (t) => {
  const originalFetch = globalThis.fetch;
  const warnings = captureRetryWarnings(t);
  let calls = 0;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) {
      throw new Error("temporary WordPress failure");
    }

    return {
      ok: true,
      status: 200,
      json: async () => [{ id: 583, slug: "server" }],
    };
  };

  const result = await json("/tags?slug=server");

  assert.deepEqual(result, [{ id: 583, slug: "server" }]);
  assert.equal(calls, 2);
  assert.equal(warnings.length, 1);
});

test("json retries transient HTTP failures", async (t) => {
  const originalFetch = globalThis.fetch;
  const warnings = captureRetryWarnings(t);
  let calls = 0;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) {
      return {
        ok: false,
        status: 503,
        json: async () => ({ code: "temporarily_unavailable" }),
      };
    }

    return {
      ok: true,
      status: 200,
      json: async () => [{ id: 583, slug: "server" }],
    };
  };

  const result = await json("/tags?slug=server");

  assert.deepEqual(result, [{ id: 583, slug: "server" }]);
  assert.equal(calls, 2);
  assert.equal(warnings.length, 1);
});

test("json does not retry permanent HTTP failures", async (t) => {
  const originalFetch = globalThis.fetch;
  let calls = 0;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () => {
    calls += 1;
    return {
      ok: false,
      status: 404,
      json: async () => ({ code: "rest_no_route" }),
    };
  };

  await assert.rejects(
    json("/tags?slug=missing"),
    /WordPress API returned HTTP 404/
  );
  assert.equal(calls, 1);
});

test("json does not retry statuses outside the 5xx range", async (t) => {
  const originalFetch = globalThis.fetch;
  let calls = 0;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () => {
    calls += 1;
    return {
      ok: false,
      status: 600,
      json: async () => ({ code: "nonstandard_status" }),
    };
  };

  await assert.rejects(
    json("/tags?slug=server"),
    /WordPress API returned HTTP 600/
  );
  assert.equal(calls, 1);
});

test("json stops after the retry limit and preserves the cause", async (t) => {
  const originalFetch = globalThis.fetch;
  const warnings = captureRetryWarnings(t);
  const failure = new Error("WordPress connection reset");
  let calls = 0;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () => {
    calls += 1;
    throw failure;
  };

  await assert.rejects(json("/tags?slug=server"), (error) => {
    assert.match(error.message, /failed after 3 attempts/);
    assert.equal(error.cause, failure);
    return true;
  });
  assert.equal(calls, 3);
  assert.equal(warnings.length, 2);
});
