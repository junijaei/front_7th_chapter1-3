import { test, expect } from '@playwright/test';

import {
  createEvent,
  expectEventInList,
  expectSnackbarMessage,
  resetDatabase,
  switchView,
} from './helpers';

/**
 * 기본 일정 관리 E2E 테스트
 *
 * 핵심 사용자 시나리오:
 * - 일정 생성, 조회, 수정, 삭제
 * - 기본 입력 검증
 * - 드래그앤드롭
 */

test.describe('기본 일정 관리', () => {
  // 순차 실행으로 API 충돌 방지
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, request }) => {
    await resetDatabase(request);
    await page.clock.install({ time: new Date('2024-11-07') });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
    await page.waitForLoadState('networkidle');
  });

  test('일정 생성, 조회, 수정, 삭제 워크플로우', async ({ page }) => {
    // Given: 새 일정 데이터
    const eventData = {
      title: '팀 회의',
      date: '2024-11-07',
      startTime: '10:00',
      endTime: '11:00',
    };

    // When: 일정 생성
    await createEvent(page, eventData);

    // Then: 일정이 표시됨
    await expectEventInList(page, '팀 회의');
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('2024-11-07')).toBeVisible();
    await expect(eventList.getByText('10:00 - 11:00')).toBeVisible();

    // When: 일정 수정
    await page.getByRole('button', { name: 'Edit event' }).first().click();
    await page.getByLabel('제목').clear();
    await page.getByLabel('제목').fill('중요한 팀 회의');
    await page.getByTestId('event-submit-button').click();

    // Then: 수정된 제목이 표시됨
    await expectEventInList(page, '중요한 팀 회의');

    // When: 일정 삭제
    await page.getByRole('button', { name: 'Delete event' }).first().click();

    // Then: 일정이 삭제됨
    await expect(eventList.getByText('중요한 팀 회의')).not.toBeVisible();
    await expectSnackbarMessage(page, '일정이 삭제되었습니다');
  });

  test('필수 필드 검증', async ({ page }) => {
    // Given: 제목을 제외한 필드만 입력
    await page.getByLabel('날짜').fill('2024-11-07');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');

    // When: 일정 추가 시도
    await page.getByTestId('event-submit-button').click();

    // Then: 에러 메시지 표시
    await expectSnackbarMessage(page, '필수 정보를 모두 입력해주세요');

    // And: 일정이 생성되지 않음
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('검색 결과가 없습니다')).toBeVisible();
  });

  test('시간 역전 검증', async ({ page }) => {
    // Given: 종료 시간이 시작 시간보다 이른 데이터
    await page.getByLabel('제목').fill('시간 오류 테스트');
    await page.getByLabel('날짜').fill('2024-11-07');
    await page.getByLabel('시작 시간').fill('15:00');
    await page.getByLabel('종료 시간').fill('14:00');

    // When: 일정 추가 시도
    await page.getByTestId('event-submit-button').click();

    // Then: 에러 메시지 표시
    await expectSnackbarMessage(page, '시간 설정을 확인해주세요');
  });

  test('주간 뷰에서 일정 조회', async ({ page }) => {
    // Given: 일정 생성
    await createEvent(page, {
      title: '운동',
      date: '2024-11-07',
      startTime: '18:00',
      endTime: '19:00',
    });

    // When: 주간 뷰로 전환
    await switchView(page, 'week');

    // Then: 주간 뷰에 일정이 표시됨
    const weekView = page.getByTestId('week-view');
    await expect(weekView.getByText('운동')).toBeVisible();
  });

  test('월간 뷰에서 일정 조회', async ({ page }) => {
    // Given: 일정 생성
    await createEvent(page, {
      title: '독서 모임',
      date: '2024-11-07',
      startTime: '19:00',
      endTime: '21:00',
    });

    // When: 월간 뷰로 전환
    await switchView(page, 'month');

    // Then: 월간 뷰에 일정이 표시됨
    const monthView = page.getByTestId('month-view');
    await expect(monthView.getByText('독서 모임')).toBeVisible();
  });
});
