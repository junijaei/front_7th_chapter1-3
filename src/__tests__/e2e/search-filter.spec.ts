import { test, expect } from '@playwright/test';

import { resetDatabase, createEvent, expectEventInList } from './helpers';

/**
 * 검색 및 필터링 E2E 테스트
 *
 * 핵심 시나리오:
 * - 제목으로 검색
 * - 카테고리로 필터링
 */

const FIXED_DATE = '2024-11-07';

test.describe('검색 및 필터링', () => {
  // 순차 실행으로 API 충돌 방지
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, request }) => {
    await resetDatabase(request);
    await page.clock.install({ time: new Date('2024-11-07') });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
  });

  test('제목으로 일정 검색', async ({ page }) => {
    // Given: 여러 일정 생성
    await createEvent(page, {
      title: '팀 회의',
      date: FIXED_DATE,
      startTime: '10:00',
      endTime: '11:00',
    });

    await createEvent(page, {
      title: '점심 약속',
      date: FIXED_DATE,
      startTime: '12:00',
      endTime: '13:00',
    });

    await createEvent(page, {
      title: '프로젝트 회의',
      date: FIXED_DATE,
      startTime: '14:00',
      endTime: '15:00',
    });

    // When: 존재하지 않는 검색어로 검색
    await page.getByPlaceholder('검색어를 입력하세요').fill('존재하지않는일정');
    await page.waitForTimeout(300);

    // Then: 검색 결과가 없음
    await expect(page.getByText('팀 회의')).not.toBeVisible();
    await expect(page.getByText('점심 약속')).not.toBeVisible();
    await expect(page.getByText('프로젝트 회의')).not.toBeVisible();

    // When: "회의"로 검색
    await page.getByPlaceholder('검색어를 입력하세요').clear();
    await page.getByPlaceholder('검색어를 입력하세요').fill('회의');
    await page.waitForTimeout(300);

    // Then: "회의"가 포함된 일정만 표시
    await expectEventInList(page, '팀 회의');
    await expectEventInList(page, '프로젝트 회의');
    await expect(page.getByText('점심 약속')).not.toBeVisible();
  });
});
