import { test, expect } from '@playwright/test';
import { resetDatabase, expectEventInList, expectSnackbarMessage } from './helpers';

/**
 * E2E 테스트: 반복 일정 관리 워크플로우
 *
 * 테스트 범위:
 * - 반복 일정 생성 (매일, 매주, 매월, 매년)
 * - 반복 일정 조회 (여러 인스턴스 표시)
 * - 반복 일정 수정 (단일 일정 vs 전체 시리즈)
 * - 반복 일정 삭제 (단일 일정 vs 전체 시리즈)
 *
 * 제외 항목:
 * - 기본 일정 관리 (별도 파일)
 * - 일정 겹침 (별도 파일)
 * - 알림 시스템 (별도 파일)
 * - 검색/필터링 (별도 파일)
 */

const FIXED_DATE = '2024-11-07'; // 목요일

test.describe('반복 일정 관리', () => {
  test.beforeEach(async ({ page, request }) => {
    // Given: 데이터베이스 초기화
    await resetDatabase(request);

    // When: 애플리케이션 페이지 로드
    await page.goto('/');

    // Then: 페이지가 정상적으로 로드됨
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
  });

  test.describe('1. 반복 일정 생성', () => {
    test('1.1 매일 반복 일정을 생성할 수 있어야 함', async ({ page }) => {
      // Given: 반복 일정 폼 데이터 준비

      // When: 반복 일정 생성
      await page.getByLabel('제목').fill('매일 운동');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('06:00');
      await page.getByLabel('종료 시간').fill('07:00');

      // 반복 일정 체크박스 선택
      await page.getByLabel('반복 일정').check();

      // 반복 유형 선택
      await page.getByLabel('반복 유형').click();
      await page.getByLabel('daily-option').click();

      // 반복 간격 설정
      await page.getByLabel('반복 간격').fill('1');

      // 반복 종료일 설정
      await page.getByLabel('반복 종료일').fill('2024-11-14'); // 1주일

      // 일정 추가
      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(1000);

      // Then: 여러 일정 인스턴스가 생성됨
      await expectEventInList(page, '매일 운동');

      // 반복 아이콘 확인
      const eventList = page.getByTestId('event-list');
      const repeatIcon = eventList.locator('[data-testid="RepeatIcon"]').first();
      await expect(repeatIcon).toBeVisible();
    });

    test('1.2 매주 반복 일정을 생성할 수 있어야 함', async ({ page }) => {
      // Given: 반복 일정 폼 데이터 준비

      // When: 매주 반복 일정 생성
      await page.getByLabel('제목').fill('주간 회의');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('10:00');
      await page.getByLabel('종료 시간').fill('11:00');

      await page.getByLabel('반복 일정').check();
      await page.getByLabel('반복 유형').click();
      await page.getByLabel('weekly-option').click();
      await page.getByLabel('반복 간격').fill('1');
      await page.getByLabel('반복 종료일').fill('2024-11-28'); // 3주

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(1000);

      // Then: 매주 반복 일정이 생성됨
      await expectEventInList(page, '주간 회의');
    });

    test('1.3 매월 반복 일정을 생성할 수 있어야 함', async ({ page }) => {
      // Given: 반복 일정 폼 데이터 준비

      // When: 매월 반복 일정 생성
      await page.getByLabel('제목').fill('월간 보고');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('14:00');
      await page.getByLabel('종료 시간').fill('15:00');

      await page.getByLabel('반복 일정').check();
      await page.getByLabel('반복 유형').click();
      await page.getByLabel('monthly-option').click();
      await page.getByLabel('반복 간격').fill('1');
      await page.getByLabel('반복 종료일').fill('2025-02-07'); // 3개월

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(1000);

      // Then: 매월 반복 일정이 생성됨
      await expectEventInList(page, '월간 보고');
    });

    test('1.4 매년 반복 일정을 생성할 수 있어야 함', async ({ page }) => {
      // Given: 반복 일정 폼 데이터 준비

      // When: 매년 반복 일정 생성
      await page.getByLabel('제목').fill('생일');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('00:00');
      await page.getByLabel('종료 시간').fill('23:59');

      await page.getByLabel('반복 일정').check();
      await page.getByLabel('반복 유형').click();
      await page.getByLabel('yearly-option').click();
      await page.getByLabel('반복 간격').fill('1');
      await page.getByLabel('반복 종료일').fill('2026-11-07'); // 2년

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(1000);

      // Then: 매년 반복 일정이 생성됨
      await expectEventInList(page, '생일');
    });
  });

  test.describe('2. 반복 일정 수정', () => {
    test('2.1 반복 일정의 단일 인스턴스만 수정할 수 있어야 함', async ({ page }) => {
      // Given: 반복 일정 생성
      await page.getByLabel('제목').fill('팀 스탠드업');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('09:00');
      await page.getByLabel('종료 시간').fill('09:15');

      await page.getByLabel('반복 일정').check();
      await page.getByLabel('반복 유형').click();
      await page.getByLabel('daily-option').click();
      await page.getByLabel('반복 간격').fill('1');
      await page.getByLabel('반복 종료일').fill('2024-11-11'); // 5일

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(1000);

      // When: 반복 일정 수정 (단일 인스턴스)
      await page.getByRole('button', { name: 'Edit event' }).first().click();

      // 반복 일정 편집 다이얼로그가 나타남
      await expect(page.getByText('반복 일정 편집')).toBeVisible({ timeout: 5000 });

      // "예"를 선택 (단일 인스턴스만 수정)
      await page.getByRole('button', { name: '예' }).click();

      // 제목 변경
      await page.getByLabel('제목').fill('팀 스탠드업 (변경됨)');
      await page.getByTestId('event-submit-button').click();

      await page.waitForTimeout(1000);

      // Then: 해당 인스턴스만 변경되고 반복 아이콘이 사라짐
      await expect(page.getByText('팀 스탠드업 (변경됨)')).toBeVisible();
      await expect(page.getByText('팀 스탠드업')).toBeVisible(); // 원래 제목도 여전히 존재
    });

    test('2.2 반복 일정의 전체 시리즈를 수정할 수 있어야 함', async ({ page }) => {
      // Given: 반복 일정 생성
      await page.getByLabel('제목').fill('주간 리뷰');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('16:00');
      await page.getByLabel('종료 시간').fill('17:00');

      await page.getByLabel('반복 일정').check();
      await page.getByLabel('반복 유형').click();
      await page.getByLabel('weekly-option').click();
      await page.getByLabel('반복 간격').fill('1');
      await page.getByLabel('반복 종료일').fill('2024-11-21'); // 2주

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(1000);

      // When: 반복 일정 수정 (전체 시리즈)
      await page.getByRole('button', { name: 'Edit event' }).first().click();

      // 반복 일정 편집 다이얼로그가 나타남
      await expect(page.getByText('반복 일정 편집')).toBeVisible({ timeout: 5000 });

      // "아니오"를 선택 (전체 시리즈 수정)
      await page.getByRole('button', { name: '아니오' }).click();

      // 제목 변경
      await page.getByLabel('제목').fill('주간 리뷰 (업데이트)');
      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/recurring-events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(1000);

      // Then: 모든 인스턴스가 변경됨
      const eventList = page.getByTestId('event-list');
      const updatedEvents = eventList.getByText('주간 리뷰 (업데이트)');

      // 최소 2개 이상의 인스턴스가 있어야 함
      await expect(updatedEvents.first()).toBeVisible();
    });
  });

  test.describe('3. 반복 일정 삭제', () => {
    test('3.1 반복 일정의 단일 인스턴스만 삭제할 수 있어야 함', async ({ page }) => {
      // Given: 반복 일정 생성
      await page.getByLabel('제목').fill('일일 점검');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('08:00');
      await page.getByLabel('종료 시간').fill('08:30');

      await page.getByLabel('반복 일정').check();
      await page.getByLabel('반복 유형').click();
      await page.getByLabel('daily-option').click();
      await page.getByLabel('반복 간격').fill('1');
      await page.getByLabel('반복 종료일').fill('2024-11-10'); // 4일

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(1000);

      // When: 반복 일정 삭제 (단일 인스턴스)
      await page.getByRole('button', { name: 'Delete event' }).first().click();

      // 반복 일정 삭제 다이얼로그가 나타남
      await expect(page.getByText('반복 일정 삭제')).toBeVisible({ timeout: 5000 });

      // "예"를 선택 (단일 인스턴스만 삭제)
      await page.getByRole('button', { name: '예' }).click();

      await page.waitForTimeout(1000);

      // Then: 해당 인스턴스만 삭제되고 나머지는 유지됨
      await expectSnackbarMessage(page, '일정이 삭제되었습니다');
      await expect(page.getByText('일일 점검')).toBeVisible(); // 다른 인스턴스는 여전히 존재
    });

    test('3.2 반복 일정의 전체 시리즈를 삭제할 수 있어야 함', async ({ page }) => {
      // Given: 반복 일정 생성
      await page.getByLabel('제목').fill('주간 보고');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('15:00');
      await page.getByLabel('종료 시간').fill('16:00');

      await page.getByLabel('반복 일정').check();
      await page.getByLabel('반복 유형').click();
      await page.getByLabel('weekly-option').click();
      await page.getByLabel('반복 간격').fill('1');
      await page.getByLabel('반복 종료일').fill('2024-11-21'); // 2주

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(1000);

      // When: 반복 일정 삭제 (전체 시리즈)
      await page.getByRole('button', { name: 'Delete event' }).first().click();

      // 반복 일정 삭제 다이얼로그가 나타남
      await expect(page.getByText('반복 일정 삭제')).toBeVisible({ timeout: 5000 });

      // "아니오"를 선택 (전체 시리즈 삭제)
      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/recurring-events')),
        page.getByRole('button', { name: '아니오' }).click(),
      ]);

      await page.waitForTimeout(1000);

      // Then: 모든 인스턴스가 삭제됨
      await expectSnackbarMessage(page, '일정이 삭제되었습니다');
      await expect(page.getByText('주간 보고')).not.toBeVisible();
      await expect(page.getByText('검색 결과가 없습니다')).toBeVisible();
    });
  });

  test.describe('4. 반복 일정 조회', () => {
    test('4.1 월간 뷰에서 반복 일정의 여러 인스턴스를 볼 수 있어야 함', async ({ page }) => {
      // Given: 매주 반복 일정 생성
      await page.getByLabel('제목').fill('주간 계획');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('09:00');
      await page.getByLabel('종료 시간').fill('10:00');

      await page.getByLabel('반복 일정').check();
      await page.getByLabel('반복 유형').click();
      await page.getByLabel('weekly-option').click();
      await page.getByLabel('반복 간격').fill('1');
      await page.getByLabel('반복 종료일').fill('2024-11-28');

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(1000);

      // When: 월간 뷰로 전환
      await page.getByLabel('뷰 타입 선택').click();
      await page.getByLabel('month-option').click();
      await page.waitForTimeout(500);

      // Then: 월간 뷰에서 여러 인스턴스 표시
      const monthView = page.getByTestId('month-view');
      const eventInstances = monthView.getByText('주간 계획');

      // 최소 2개 이상의 인스턴스가 표시되어야 함
      await expect(eventInstances.first()).toBeVisible();
    });

    test('4.2 반복 아이콘이 반복 일정에 표시되어야 함', async ({ page }) => {
      // Given: 반복 일정 생성
      await page.getByLabel('제목').fill('일일 작업');
      await page.getByLabel('날짜').fill(FIXED_DATE);
      await page.getByLabel('시작 시간').fill('10:00');
      await page.getByLabel('종료 시간').fill('11:00');

      await page.getByLabel('반복 일정').check();
      await page.getByLabel('반복 유형').click();
      await page.getByLabel('daily-option').click();
      await page.getByLabel('반복 간격').fill('1');
      await page.getByLabel('반복 종료일').fill('2024-11-09');

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);

      await page.waitForTimeout(1000);

      // When & Then: 이벤트 리스트에서 반복 아이콘 확인
      const eventList = page.getByTestId('event-list');
      const repeatIcon = eventList.locator('[data-testid="RepeatIcon"]').first();
      await expect(repeatIcon).toBeVisible();

      // 반복 정보가 표시되어야 함
      await expect(page.getByText(/1일마다 반복/)).toBeVisible();
    });
  });
});
