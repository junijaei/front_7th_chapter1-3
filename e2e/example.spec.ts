import { test, expect } from '@playwright/test';

/**
 * 기본 E2E 테스트 예제
 *
 * 이 파일은 Playwright E2E 테스트의 예제입니다.
 * 실제 테스트를 작성할 때 이 파일을 참고하거나 삭제하세요.
 */

test.describe('기본 애플리케이션 테스트', () => {
  test('홈페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/');

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/Vite/);
  });

  test('일정 추가 폼이 표시되어야 함', async ({ page }) => {
    await page.goto('/');

    // 일정 추가 제목 확인
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();

    // 제목 입력 필드 확인
    await expect(page.getByLabel('제목')).toBeVisible();
  });
});
