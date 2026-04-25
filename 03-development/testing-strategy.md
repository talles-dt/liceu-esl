# Lexio Testing Strategy (MVP)

## Test Pyramid

```
        E2E — 10%
       (Playwright)
      /             \
 Integration — 30%   \
 (Jest + Supabase)    \
    /                  \
Unit — 60% ——————————— Snapshot/Regression
(Jest + Vitest)        (Prompts)
```

## Unit Tests (60%)

**Tools**: Jest (API logic), Vitest (UI components)

```typescript
// __tests__/utils/nvidia-client.test.ts
describe('generateLesson', () => {
  it('returns valid four-pillar JSON schema', async () => {
    const result = await generateLesson('grammar', 'B1', ['coffee', 'tech']);
    expect(result).toMatchSchema(lessonSchema);         // Zod validation
    expect(result.grammar.toLowerCase()).toContain('pt'); // PT contrast enforced
    expect(result.mnemonic.split('→').length).toBe(4);  // 4-part structure
  });

  it('falls back to Gemma on primary model 500', async () => {
    mockNIM.mockImplementationOnce(() => { throw new Error('500'); });
    const result = await generateLesson('logic', 'B1', ['coffee']);
    expect(result).toBeDefined(); // Fallback succeeded
  });
});
```

```typescript
// __tests__/engine/adaptive-engine.test.ts
describe('calculateNextLesson', () => {
  it('applies i+1 progression when accuracy >= 0.8', () => {
    const user = { current_level: 'B1', avg_comprehension: 4.2 } as UserProfile;
    const last = { accuracy: 0.85, time_per_question: 20 } as Lesson;
    const config = calculateNextLesson(user, last);
    expect(config.difficulty).toBe('B1.5');
  });

  it('adds PT contrast when accuracy < 0.5', () => {
    const user = { current_level: 'B1' } as UserProfile;
    const last = { accuracy: 0.4 } as Lesson;
    const config = calculateNextLesson(user, last);
    expect(config.add_pt_contrast).toBe(true);
  });
});
```

## Integration Tests (30%)

**Tools**: Jest + Supabase local (`npx supabase start`) + NIM mock

```typescript
// __tests__/api/lesson.test.ts
describe('POST /api/v1/lesson/generate', () => {
  it('enforces grammar pillar on Monday', async () => {
    vi.setSystemTime(new Date('2026-04-27')); // Monday
    const res = await POST(mockRequest({ user_id: TEST_USER_ID }));
    const body = await res.json();
    expect(body.content.grammar).toBeDefined();
    expect(body.content.grammar).toMatch(/pt-br|portuguese|brasile/i);
  });

  it('returns cached lesson when credits exhausted', async () => {
    process.env.NVIDIA_CREDIT_LIMIT = '0';
    const res = await POST(mockRequest({ user_id: TEST_USER_ID }));
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Lexio-Source')).toBe('cache');
  });
});
```

## E2E Tests (10%)

**Tools**: Playwright (mobile viewport + desktop)

```typescript
// e2e/day-one-flow.spec.ts
test('user completes Day 1 flow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in with Google' }).click();
  await expect(page).toHaveURL(/placement/);

  // Complete placement quiz (mock answers)
  await completePlacementQuiz(page, 'B1');
  await expect(page).toHaveURL(/roadmap/);
  await expect(page.getByText('Fluency in')).toBeVisible();

  // Start first lesson
  await page.getByRole('button', { name: 'Start first lesson' }).click();
  await expect(page.locator('[data-pillar]')).toBeVisible();

  // Complete lesson + submit rating
  await page.getByRole('button', { name: 'Complete lesson' }).click();
  await page.getByRole('radio', { name: '4' }).click();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('streak')).toBeVisible();
});
```

## Pillar Enforcement Validation

```typescript
// __tests__/validation/pillars.test.ts
const REQUIRED_KEYS = ['grammar', 'logic', 'communication', 'mnemonic'];

test('all four pillar keys present in lesson output', async () => {
  const output = await generateLesson('logic', 'B1', []);
  REQUIRED_KEYS.forEach(key => expect(output).toHaveProperty(key));
});

test('grammar field contains PT-BR warning', () => {
  const output = { grammar: "Pattern: ... PT-BR warning: Don't say 'I have interest'." };
  expect(output.grammar.toLowerCase()).toMatch(/pt-br|portuguese|brasile/);
});

test('mnemonic follows four-part structure', () => {
  const output = { mnemonic: "INTEREST→COFFEE SHOP→steam rising→'tenho' vs 'I am'" };
  expect(output.mnemonic.split('→').length).toBe(4);
});
```

## Prompt Regression Testing

When a prompt changes, compare new outputs against baseline:

```bash
# Record baseline outputs (run before any prompt change)
npm run test:prompts -- --record --tag=v1.0-mvp

# After prompt change: compare
npm run test:prompts -- --compare --baseline=v1.0-mvp
# Flag: >10% structural change (missing keys, broken mnemonic pattern) requires manual review
```

## Test Data Management

- Use `dummy_user` Supabase account for all integration/E2E tests
- Seed test data: `npm run db:seed:test`
- Never use real user data in tests (LGPD)
- Reset test state between runs: `npm run db:reset:test`

## CI Test Execution

```yaml
# .github/workflows/test.yml
- name: Run unit tests
  run: npm test -- --coverage

- name: Run integration tests
  run: npx supabase start && npm run test:integration

- name: Run E2E (staging)
  run: npx playwright test --project=chromium
  env:
    PLAYWRIGHT_BASE_URL: https://staging.lexio.oliceu.com
```
