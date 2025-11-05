import { test, expect } from '@playwright/test';

import {
  createEvent,
  expectEventInList,
  expectEventInMonthView,
  expectEventInWeekView,
  expectSnackbarMessage,
  findEventInList,
  resetDatabase,
  switchView,
} from './helpers';

/**
 * 기본 일정 관리 워크플로우 E2E 테스트
 *
 * 테스트 범위:
 * - P0: 기본 CRUD (생성, 조회, 수정, 삭제)
 * - P1: 입력 검증, 캘린더 뷰
 * - P2: 드래그앤드롭
 */

test.describe('기본 일정 관리', () => {
  test.beforeEach(async ({ page, request }) => {
    // Given: 데이터베이스 초기화
    await resetDatabase(request);

    // When: 애플리케이션 페이지 로드
    await page.goto('/');

    // Then: 페이지가 정상적으로 로드됨
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
  });

  test.describe('1. 일정 생성 (Create)', () => {
    test('필수 필드만으로 일정 생성', async ({ page }) => {
      // Given: 필수 필드 데이터 준비
      const eventData = {
        title: '팀 회의',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
      };

      // When: 필수 필드만 입력하고 일정 추가
      await createEvent(page, eventData);

      // Then: 이벤트 리스트에 일정이 표시됨
      await expectEventInList(page, '팀 회의');
    });

    test('모든 필드로 일정 생성', async ({ page }) => {
      // Given: 모든 필드 데이터 준비
      const eventData = {
        title: '프로젝트 킥오프',
        date: '2024-11-08',
        startTime: '14:00',
        endTime: '16:00',
        description: '새 프로젝트 시작 회의',
        location: '회의실 A',
        category: '업무',
      };

      // When: 모든 필드 입력하고 일정 추가
      await createEvent(page, eventData);

      // Then: 이벤트 리스트에 모든 정보가 표시됨
      await expectEventInList(page, '프로젝트 킥오프');
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('새 프로젝트 시작 회의')).toBeVisible();
      await expect(eventList.getByText('회의실 A')).toBeVisible();
      await expect(eventList.getByText('카테고리: 업무')).toBeVisible();
    });
  });

  test.describe('2. 일정 조회 (Read)', () => {
    test('이벤트 리스트에 일정 표시', async ({ page }) => {
      // Given: 일정이 생성되어 있음
      await createEvent(page, {
        title: '점심 약속',
        date: '2024-11-07',
        startTime: '12:00',
        endTime: '13:00',
      });

      // When: 이벤트 리스트 확인
      const eventList = page.getByTestId('event-list');

      // Then: 일정 정보가 올바르게 표시됨
      await expect(eventList.getByText('점심 약속')).toBeVisible();
      await expect(eventList.getByText('2024-11-07')).toBeVisible();
      await expect(eventList.getByText('12:00 - 13:00')).toBeVisible();
    });

    test('주간 뷰에 일정 표시', async ({ page }) => {
      // Given: 일정이 생성되어 있음
      await createEvent(page, {
        title: '운동',
        date: '2024-11-07',
        startTime: '18:00',
        endTime: '19:00',
      });

      // When: 주간 뷰로 전환
      await switchView(page, 'week');

      // Then: 주간 뷰에 일정이 표시됨
      await expectEventInWeekView(page, '운동');
    });

    test('월간 뷰에 일정 표시', async ({ page }) => {
      // Given: 일정이 생성되어 있음
      await createEvent(page, {
        title: '독서 모임',
        date: '2024-11-07',
        startTime: '19:00',
        endTime: '21:00',
      });

      // When: 월간 뷰로 전환
      await switchView(page, 'month');

      // Then: 월간 뷰에 일정이 표시됨
      await expectEventInMonthView(page, '독서 모임');
    });

    test('Week/Month 뷰 전환', async ({ page }) => {
      // Given: 초기 상태 (week 뷰)
      await expect(page.getByTestId('week-view')).toBeVisible();

      // When: Month 뷰로 전환
      await switchView(page, 'month');

      // Then: Month 뷰가 표시됨
      await expect(page.getByTestId('month-view')).toBeVisible();
      await expect(page.getByTestId('week-view')).not.toBeVisible();

      // When: Week 뷰로 다시 전환
      await switchView(page, 'week');

      // Then: Week 뷰가 표시됨
      await expect(page.getByTestId('week-view')).toBeVisible();
      await expect(page.getByTestId('month-view')).not.toBeVisible();
    });
  });

  test.describe('3. 일정 수정 (Update)', () => {
    test('제목 수정', async ({ page }) => {
      // Given: 일정이 생성되어 있음
      await createEvent(page, {
        title: '회의',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
      });

      // When: 수정 버튼 클릭
      await page.getByRole('button', { name: 'Edit event' }).click();

      // And: 제목 수정
      await page.getByLabel('제목').clear();
      await page.getByLabel('제목').fill('중요한 회의');

      // And: 일정 수정 버튼 클릭
      await page.getByTestId('event-submit-button').click();

      // Then: 수정된 제목이 표시됨
      await expectEventInList(page, '중요한 회의');
      await expect(page.getByText('회의').first()).not.toBeVisible();
    });

    test('날짜 수정', async ({ page }) => {
      // Given: 일정이 생성되어 있음
      await createEvent(page, {
        title: '프레젠테이션',
        date: '2024-11-07',
        startTime: '15:00',
        endTime: '16:00',
      });

      // When: 수정 버튼 클릭
      await page.getByRole('button', { name: 'Edit event' }).click();

      // And: 날짜 수정
      await page.getByLabel('날짜').fill('2024-11-08');

      // And: 일정 수정 버튼 클릭
      await page.getByTestId('event-submit-button').click();

      // Then: 수정된 날짜가 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('2024-11-08')).toBeVisible();
    });

    test('시간 수정', async ({ page }) => {
      // Given: 일정이 생성되어 있음
      await createEvent(page, {
        title: '코드 리뷰',
        date: '2024-11-07',
        startTime: '14:00',
        endTime: '15:00',
      });

      // When: 수정 버튼 클릭
      await page.getByRole('button', { name: 'Edit event' }).click();

      // And: 시간 수정
      await page.getByLabel('시작 시간').fill('16:00');
      await page.getByLabel('종료 시간').fill('17:00');

      // And: 일정 수정 버튼 클릭
      await page.getByTestId('event-submit-button').click();

      // Then: 수정된 시간이 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('16:00 - 17:00')).toBeVisible();
    });
  });

  test.describe('4. 일정 삭제 (Delete)', () => {
    test('이벤트 리스트에서 삭제', async ({ page }) => {
      // Given: 일정이 생성되어 있음
      await createEvent(page, {
        title: '삭제할 일정',
        date: '2024-11-07',
        startTime: '09:00',
        endTime: '10:00',
      });

      // When: 삭제 버튼 클릭
      await page.getByRole('button', { name: 'Delete event' }).click();

      // Then: 일정이 리스트에서 사라짐
      await expect(page.getByText('삭제할 일정')).not.toBeVisible();
    });

    test('삭제 후 성공 메시지 확인', async ({ page }) => {
      // Given: 일정이 생성되어 있음
      await createEvent(page, {
        title: '테스트 일정',
        date: '2024-11-07',
        startTime: '11:00',
        endTime: '12:00',
      });

      // When: 삭제 버튼 클릭
      await page.getByRole('button', { name: 'Delete event' }).click();

      // Then: 성공 메시지 표시
      await expectSnackbarMessage(page, '일정이 삭제되었습니다');
    });
  });

  test.describe('5. 입력 검증', () => {
    test('제목 없이 저장 시 에러 메시지', async ({ page }) => {
      // Given: 제목을 제외한 필수 필드만 입력
      await page.getByLabel('날짜').fill('2024-11-07');
      await page.getByLabel('시작 시간').fill('10:00');
      await page.getByLabel('종료 시간').fill('11:00');

      // When: 일정 추가 버튼 클릭
      await page.getByTestId('event-submit-button').click();

      // Then: 에러 메시지 표시
      await expectSnackbarMessage(page, '필수 정보를 모두 입력해주세요');

      // And: 일정이 생성되지 않음
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('검색 결과가 없습니다')).toBeVisible();
    });

    test('날짜 없이 저장 시 에러 메시지', async ({ page }) => {
      // Given: 날짜를 제외한 필수 필드만 입력
      await page.getByLabel('제목').fill('테스트');
      await page.getByLabel('시작 시간').fill('10:00');
      await page.getByLabel('종료 시간').fill('11:00');

      // When: 일정 추가 버튼 클릭
      await page.getByTestId('event-submit-button').click();

      // Then: 에러 메시지 표시
      await expectSnackbarMessage(page, '필수 정보를 모두 입력해주세요');
    });

    test('시작시간 없이 저장 시 에러 메시지', async ({ page }) => {
      // Given: 시작시간을 제외한 필수 필드만 입력
      await page.getByLabel('제목').fill('테스트');
      await page.getByLabel('날짜').fill('2024-11-07');
      await page.getByLabel('종료 시간').fill('11:00');

      // When: 일정 추가 버튼 클릭
      await page.getByTestId('event-submit-button').click();

      // Then: 에러 메시지 표시
      await expectSnackbarMessage(page, '필수 정보를 모두 입력해주세요');
    });

    test('종료시간 없이 저장 시 에러 메시지', async ({ page }) => {
      // Given: 종료시간을 제외한 필수 필드만 입력
      await page.getByLabel('제목').fill('테스트');
      await page.getByLabel('날짜').fill('2024-11-07');
      await page.getByLabel('시작 시간').fill('10:00');

      // When: 일정 추가 버튼 클릭
      await page.getByTestId('event-submit-button').click();

      // Then: 에러 메시지 표시
      await expectSnackbarMessage(page, '필수 정보를 모두 입력해주세요');
    });

    test('시간 역전 시 에러 메시지', async ({ page }) => {
      // Given: 종료 시간이 시작 시간보다 이른 데이터
      await page.getByLabel('제목').fill('시간 오류 테스트');
      await page.getByLabel('날짜').fill('2024-11-07');
      await page.getByLabel('시작 시간').fill('15:00');
      await page.getByLabel('종료 시간').fill('14:00');

      // When: 일정 추가 버튼 클릭
      await page.getByTestId('event-submit-button').click();

      // Then: 에러 메시지 표시
      await expectSnackbarMessage(page, '시간 설정을 확인해주세요');
    });
  });

  test.describe('6. 드래그앤드롭 (P2)', () => {
    test.skip('주간 뷰에서 날짜 변경', async ({ page }) => {
      // Given: 일정이 생성되어 있음
      await createEvent(page, {
        title: '드래그 테스트',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
      });

      // When: 주간 뷰로 전환
      await switchView(page, 'week');

      // And: 다른 날짜로 드래그
      const event = await findEventInList(page, '드래그 테스트');
      const targetDate = page.locator('[data-date="2024-11-08"]');

      await event.dragTo(targetDate);

      // Then: 날짜가 변경됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('2024-11-08')).toBeVisible();
    });

    test.skip('월간 뷰에서 날짜 변경', async ({ page }) => {
      // Given: 일정이 생성되어 있음
      await createEvent(page, {
        title: '월간 드래그',
        date: '2024-11-07',
        startTime: '14:00',
        endTime: '15:00',
      });

      // When: 월간 뷰로 전환
      await switchView(page, 'month');

      // And: 다른 날짜로 드래그
      const event = await findEventInList(page, '월간 드래그');
      const targetDate = page.locator('[data-date="2024-11-10"]');

      await event.dragTo(targetDate);

      // Then: 날짜가 변경됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('2024-11-10')).toBeVisible();
    });
  });
});
