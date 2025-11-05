import { test, expect } from '@playwright/test';

import { resetDatabase, createEvent, expectEventInList } from './helpers';

/**
 * 일정 겹침 처리 E2E 테스트
 *
 * 핵심 시나리오:
 * - 겹치는 시간에 일정 생성 시 경고
 * - 경고 후 계속 진행 가능
 */

const FIXED_DATE = '2024-11-07';

test.describe('일정 겹침 처리', () => {
  // 순차 실행으로 API 충돌 방지
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, request }) => {
    await resetDatabase(request);
    await page.clock.install({ time: new Date('2024-11-07') });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
  });

  test('겹치는 시간에 일정 생성 시 경고가 표시됨', async ({ page }) => {
    // Given: 기존 일정 생성
    await createEvent(page, {
      title: '회의 A',
      date: FIXED_DATE,
      startTime: '10:00',
      endTime: '11:00',
    });

    // When: 겹치는 시간에 새 일정 추가 시도
    await page.getByLabel('제목').fill('회의 B');
    await page.getByLabel('날짜').fill(FIXED_DATE);
    await page.getByLabel('시작 시간').fill('10:30');
    await page.getByLabel('종료 시간').fill('11:30');
    await page.getByTestId('event-submit-button').click();

    // Then: 겹침 경고 다이얼로그가 표시됨
    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
  });

  test('겹침 경고에서 계속 진행하면 일정이 생성됨', async ({ page }) => {
    // Given: 기존 일정 생성
    await createEvent(page, {
      title: '점심 약속',
      date: FIXED_DATE,
      startTime: '12:00',
      endTime: '13:00',
    });

    // When: 겹치는 시간에 새 일정 추가하고 계속 진행
    await page.getByLabel('제목').fill('팀 점심');
    await page.getByLabel('날짜').fill(FIXED_DATE);
    await page.getByLabel('시작 시간').fill('12:30');
    await page.getByLabel('종료 시간').fill('13:30');
    await page.getByTestId('event-submit-button').click();

    // And: 경고 다이얼로그에서 "계속 진행" 클릭
    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: '계속 진행' }).click();
    await page.waitForTimeout(500);

    // Then: 두 일정 모두 생성됨
    await expectEventInList(page, '점심 약속');
    await expectEventInList(page, '팀 점심');
  });
});
