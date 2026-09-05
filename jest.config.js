/** Minimal jest config — none existed in this scaffold before the
 * guard-evaluator unit tests (2026-09-05). ts-jest against the same
 * tsconfig.json used by `nest build`; only *.spec.ts files under src/. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
};
