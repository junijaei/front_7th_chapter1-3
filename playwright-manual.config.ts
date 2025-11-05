import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정 (수동 서버 시작용)
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './src/__tests__/e2e',

  /* 병렬 실행 설정 */
  fullyParallel: true,

  /* CI에서 재시도 설정 */
  retries: process.env.CI ? 2 : 0,

  /* 워커 설정 */
  workers: process.env.CI ? 1 : undefined,

  /* 리포터 설정 */
  reporter: 'html',

  /* 공통 테스트 설정 */
  use: {
    /* 베이스 URL */
    baseURL: 'http://localhost:5173',

    /* 액션 실패 시 스크린샷 */
    screenshot: 'only-on-failure',

    /* 액션 실패 시 비디오 */
    video: 'retain-on-failure',

    /* 트레이스 수집 */
    trace: 'on-first-retry',
  },

  /* 프로젝트 설정 (브라우저별) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
