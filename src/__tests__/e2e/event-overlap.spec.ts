import { test, expect } from '@playwright/test';
import { resetDatabase, createEvent, expectEventInList } from './helpers';

/**
 * E2E 테스트: 일정 겹침 처리
 *
 * 테스트 범위:
 * - 일정 생성 시 겹침 감지 및 경고
 * - 일정 수정 시 겹침 감지 및 경고
 * - 드래그앤드롭 시 겹침 감지 및 경고
 * - 겹침 경고에서 "계속 진행" 선택
 * - 겹침 경고에서 "취소" 선택
 *
 * 제외 항목:
 * - 기본 일정 관리 (별도 파일)
 * - 반복 일정 (별도 파일)
 * - 알림 시스템 (별도 파일)
 * - 검색/필터링 (별도 파일)
 */

const FIXED_DATE = '2024-11-07'; // 목요일

test.describe('일정 겹침 처리', () => {
  test.beforeEach(async ({ page, request }) => {
    // Given: 데이터베이스 초기화
    await resetDatabase(request);

    // When: 애플리케이션 페이지 로드
    await page.goto('/');

    // Then: 페이지가 정상적으로 로드됨
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
  });

  test.describe('1. 일정 생성 시 겹침 감지', () => {
    test('1.1 겹치는 시간에 새 일정 추가 시 경고가 표시되어야 함', async ({ page }) => {
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
      await expect(page.getByText(/다음 일정과 겹칩니다/)).toBeVisible();
      await expect(page.getByText('회의 A')).toBeVisible();
    });

    test('1.2 겹침 경고에서 "계속 진행"을 선택하면 일정이 생성되어야 함', async ({ page }) => {
      // Given: 기존 일정 생성
      await createEvent(page, {
        title: '점심 약속',
        date: FIXED_DATE,
        startTime: '12:00',
        endTime: '13:00',
      });

      // When: 겹치는 시간에 새 일정 추가
      await page.getByLabel('제목').fill('팀 점심');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('12:30');
      await page.getByLabel('종료 시간').fill('13:30');
      await page.getByTestId('event-submit-button').click();

      // 경고 다이얼로그에서 "계속 진행" 클릭
      await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: '계속 진행' }).click();
      await page.waitForTimeout(500);

      // Then: 두 일정 모두 생성됨
      await expectEventInList(page, '점심 약속');
      await expectEventInList(page, '팀 점심');
    });

    test('1.3 겹침 경고에서 "취소"를 선택하면 일정이 생성되지 않아야 함', async ({ page }) => {
      // Given: 기존 일정 생성
      await createEvent(page, {
        title: '프레젠테이션',
        date: FIXED_DATE,
        startTime: '14:00',
        endTime: '15:00',
      });

      // When: 겹치는 시간에 새 일정 추가 시도
      await page.getByLabel('제목').fill('다른 회의');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('14:30');
      await page.getByLabel('종료 시간').fill('15:30');
      await page.getByTestId('event-submit-button').click();

      // 경고 다이얼로그에서 "취소" 클릭
      await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: '취소' }).click();
      await page.waitForTimeout(500);

      // Then: 기존 일정만 존재
      await expectEventInList(page, '프레젠테이션');
      await expect(page.getByText('다른 회의')).not.toBeVisible();
    });

    test('1.4 정확히 같은 시간의 일정도 겹침으로 감지되어야 함', async ({ page }) => {
      // Given: 기존 일정 생성
      await createEvent(page, {
        title: '일정 1',
        date: FIXED_DATE,
        startTime: '16:00',
        endTime: '17:00',
      });

      // When: 정확히 같은 시간에 일정 추가 시도
      await page.getByLabel('제목').fill('일정 2');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('16:00');
      await page.getByLabel('종료 시간').fill('17:00');
      await page.getByTestId('event-submit-button').click();

      // Then: 겹침 경고 표시
      await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
    });

    test('1.5 부분적으로 겹치는 시간도 감지되어야 함', async ({ page }) => {
      // Given: 기존 일정 생성 (09:00-10:00)
      await createEvent(page, {
        title: '아침 회의',
        date: FIXED_DATE,
        startTime: '09:00',
        endTime: '10:00',
      });

      // When: 부분적으로 겹치는 일정 추가 (09:30-10:30)
      await page.getByLabel('제목').fill('후속 미팅');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('09:30');
      await page.getByLabel('종료 시간').fill('10:30');
      await page.getByTestId('event-submit-button').click();

      // Then: 겹침 경고 표시
      await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('2. 일정 수정 시 겹침 감지', () => {
    test('2.1 일정 시간 수정 시 겹침이 발생하면 경고가 표시되어야 함', async ({ page }) => {
      // Given: 두 개의 일정 생성
      await createEvent(page, {
        title: '회의 1',
        date: FIXED_DATE,
        startTime: '10:00',
        endTime: '11:00',
      });

      await createEvent(page, {
        title: '회의 2',
        date: FIXED_DATE,
        startTime: '13:00',
        endTime: '14:00',
      });

      // When: 회의 2의 시간을 수정하여 회의 1과 겹치게 함
      const editButtons = page.getByRole('button', { name: 'Edit event' });
      await editButtons.nth(1).click(); // 두 번째 일정 (회의 2) 수정

      await page.getByLabel('시작 시간').fill('10:30');
      await page.getByLabel('종료 시간').fill('11:30');
      await page.getByTestId('event-submit-button').click();

      // Then: 겹침 경고 표시
      await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('회의 1')).toBeVisible();
    });

    test('2.2 수정 시 겹침 경고에서 "계속 진행"을 선택하면 변경이 저장되어야 함', async ({ page }) => {
      // Given: 두 개의 일정 생성
      await createEvent(page, {
        title: '워크숍',
        date: FIXED_DATE,
        startTime: '11:00',
        endTime: '12:00',
      });

      await createEvent(page, {
        title: '교육',
        date: FIXED_DATE,
        startTime: '15:00',
        endTime: '16:00',
      });

      // When: 교육 시간을 수정하여 워크숍과 겹치게 함
      const editButtons = page.getByRole('button', { name: 'Edit event' });
      await editButtons.nth(1).click();

      await page.getByLabel('시작 시간').fill('11:30');
      await page.getByLabel('종료 시간').fill('12:30');
      await page.getByTestId('event-submit-button').click();

      // 경고 다이얼로그에서 "계속 진행" 클릭
      await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: '계속 진행' }).click();
      await page.waitForTimeout(500);

      // Then: 수정된 시간이 반영됨
      await expect(page.getByText('11:30 - 12:30')).toBeVisible();
    });
  });

  test.describe('3. 드래그앤드롭 시 겹침 감지', () => {
    test('3.1 드래그앤드롭으로 일정을 이동할 때 겹침이 발생하면 경고가 표시되어야 함', async ({ page }) => {
      // Given: 같은 시간에 다른 날짜의 일정 두 개 생성
      await createEvent(page, {
        title: '회의 목요일',
        date: '2024-11-07', // 목요일
        startTime: '14:00',
        endTime: '15:00',
      });

      await createEvent(page, {
        title: '회의 금요일',
        date: '2024-11-08', // 금요일
        startTime: '14:00',
        endTime: '15:00',
      });

      // When: 주간 뷰에서 금요일 회의를 목요일로 드래그
      const weekView = page.getByTestId('week-view');
      const fridayEvent = weekView.getByText('회의 금요일').first();

      // 목요일 셀 찾기
      const thursdayCell = page.locator('td').filter({ has: page.locator('text="7"') }).first();

      await fridayEvent.dragTo(thursdayCell);
      await page.waitForTimeout(1000);

      // Then: 겹침 경고 표시
      await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
    });

    test('3.2 드래그앤드롭 겹침 경고에서 "계속 진행"을 선택하면 이동이 완료되어야 함', async ({ page }) => {
      // Given: 같은 시간에 다른 날짜의 일정 두 개 생성
      await createEvent(page, {
        title: '일정 A',
        date: '2024-11-07', // 목요일
        startTime: '09:00',
        endTime: '10:00',
      });

      await createEvent(page, {
        title: '일정 B',
        date: '2024-11-08', // 금요일
        startTime: '09:00',
        endTime: '10:00',
      });

      // When: 주간 뷰에서 금요일 일정을 목요일로 드래그
      const weekView = page.getByTestId('week-view');
      const fridayEvent = weekView.getByText('일정 B').first();
      const thursdayCell = page.locator('td').filter({ has: page.locator('text="7"') }).first();

      await fridayEvent.dragTo(thursdayCell);
      await page.waitForTimeout(1000);

      // 경고 다이얼로그에서 "계속 진행" 클릭
      await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: '계속 진행' }).click();
      await page.waitForTimeout(500);

      // Then: 이벤트 리스트에서 두 일정 모두 목요일 날짜로 표시됨
      const eventList = page.getByTestId('event-list');
      const eventADate = eventList.locator('text="2024-11-07"').first();
      const eventBDate = eventList.locator('text="2024-11-07"').nth(1);

      await expect(eventADate).toBeVisible();
      await expect(eventBDate).toBeVisible();
    });
  });

  test.describe('4. 겹침 미발생 케이스', () => {
    test('4.1 시간이 겹치지 않으면 경고 없이 일정이 생성되어야 함', async ({ page }) => {
      // Given: 기존 일정 생성
      await createEvent(page, {
        title: '회의 1',
        date: FIXED_DATE,
        startTime: '10:00',
        endTime: '11:00',
      });

      // When: 겹치지 않는 시간에 새 일정 추가
      await page.getByLabel('제목').fill('회의 2');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('11:00'); // 정확히 종료 시간 후
      await page.getByLabel('종료 시간').fill('12:00');

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(500);

      // Then: 경고 없이 두 일정 모두 생성됨
      await expectEventInList(page, '회의 1');
      await expectEventInList(page, '회의 2');
      await expect(page.getByText('일정 겹침 경고')).not.toBeVisible();
    });

    test('4.2 다른 날짜의 같은 시간대는 겹침으로 간주되지 않아야 함', async ({ page }) => {
      // Given: 목요일 일정 생성
      await createEvent(page, {
        title: '목요일 회의',
        date: '2024-11-07',
        startTime: '14:00',
        endTime: '15:00',
      });

      // When: 금요일 같은 시간에 일정 추가
      await page.getByLabel('제목').fill('금요일 회의');
      await page.getByLabel('날짜').fill('2024-11-08');
      await page.getByLabel('시작 시간').fill('14:00');
      await page.getByLabel('종료 시간').fill('15:00');

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(500);

      // Then: 경고 없이 두 일정 모두 생성됨
      await expectEventInList(page, '목요일 회의');
      await expectEventInList(page, '금요일 회의');
      await expect(page.getByText('일정 겹침 경고')).not.toBeVisible();
    });
  });
});
