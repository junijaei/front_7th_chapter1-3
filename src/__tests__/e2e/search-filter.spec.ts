import { test, expect } from '@playwright/test';

import { resetDatabase, createEvent, switchView } from './helpers';

/**
 * E2E 테스트: 검색 및 필터링
 *
 * 테스트 범위:
 * - 제목으로 일정 검색
 * - 설명으로 일정 검색
 * - 위치로 일정 검색
 * - 검색 결과 없음 처리
 * - 검색어 입력 중 실시간 필터링
 * - 검색 초기화
 * - 주간/월간 뷰에서 검색 동작
 *
 * 제외 항목:
 * - 기본 일정 관리 (별도 파일)
 * - 반복 일정 (별도 파일)
 * - 일정 겹침 (별도 파일)
 * - 알림 시스템 (별도 파일)
 */

const FIXED_DATE = '2024-11-07'; // 목요일

test.describe('검색 및 필터링', () => {
  test.beforeEach(async ({ page, request }) => {
    // Given: 데이터베이스 초기화
    await resetDatabase(request);
    await page.clock.install({ time: new Date('2024-11-07') });

    // When: 애플리케이션 페이지 로드
    await page.goto('/');

    // Then: 페이지가 정상적으로 로드됨
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
  });

  test.describe('1. 제목으로 검색', () => {
    test('1.1 제목으로 일정을 검색할 수 있어야 함', async ({ page }) => {
      // Given: 여러 일정 생성
      await createEvent(page, {
        title: '팀 회의',
        date: FIXED_DATE,
        startTime: '10:00',
        endTime: '11:00',
      });

      await createEvent(page, {
        title: '프로젝트 리뷰',
        date: FIXED_DATE,
        startTime: '14:00',
        endTime: '15:00',
      });

      await createEvent(page, {
        title: '점심 약속',
        date: FIXED_DATE,
        startTime: '12:00',
        endTime: '13:00',
      });

      // When: "회의" 키워드로 검색
      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('회의');
      await page.waitForTimeout(300);

      // Then: "회의"가 포함된 일정만 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('팀 회의')).toBeVisible();
      await expect(eventList.getByText('프로젝트 리뷰')).not.toBeVisible();
      await expect(eventList.getByText('점심 약속')).not.toBeVisible();
    });

    test('1.2 부분 검색이 가능해야 함', async ({ page }) => {
      // Given: 일정 생성
      await createEvent(page, {
        title: '중요한 프레젠테이션',
        date: FIXED_DATE,
        startTime: '15:00',
        endTime: '16:00',
      });

      await createEvent(page, {
        title: '워크숍',
        date: FIXED_DATE,
        startTime: '13:00',
        endTime: '14:00',
      });

      // When: "프레" 부분 검색
      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('프레');
      await page.waitForTimeout(300);

      // Then: "프레"가 포함된 일정만 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('중요한 프레젠테이션')).toBeVisible();
      await expect(eventList.getByText('워크숍')).not.toBeVisible();
    });

    test('1.3 대소문자 구분 없이 검색할 수 있어야 함', async ({ page }) => {
      // Given: 영문 제목 일정 생성
      await createEvent(page, {
        title: 'Team Meeting',
        date: FIXED_DATE,
        startTime: '10:00',
        endTime: '11:00',
      });

      // When: 소문자로 검색
      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('team');
      await page.waitForTimeout(300);

      // Then: 일정이 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('Team Meeting')).toBeVisible();
    });
  });

  test.describe('2. 설명 및 위치로 검색', () => {
    test('2.1 설명으로 일정을 검색할 수 있어야 함', async ({ page }) => {
      // Given: 설명이 있는 일정 생성
      await createEvent(page, {
        title: '회의',
        date: FIXED_DATE,
        startTime: '10:00',
        endTime: '11:00',
        description: '분기별 실적 검토',
      });

      await createEvent(page, {
        title: '미팅',
        date: FIXED_DATE,
        startTime: '14:00',
        endTime: '15:00',
        description: '신규 프로젝트 킥오프',
      });

      // When: 설명 키워드로 검색
      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('실적');
      await page.waitForTimeout(300);

      // Then: 해당 설명을 가진 일정만 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('회의')).toBeVisible();
      await expect(eventList.getByText('미팅')).not.toBeVisible();
    });

    test('2.2 위치로 일정을 검색할 수 있어야 함', async ({ page }) => {
      // Given: 위치가 있는 일정 생성
      await createEvent(page, {
        title: '고객 미팅',
        date: FIXED_DATE,
        startTime: '11:00',
        endTime: '12:00',
        location: '강남역 카페',
      });

      await createEvent(page, {
        title: '팀 회의',
        date: FIXED_DATE,
        startTime: '13:00',
        endTime: '14:00',
        location: '회의실 A',
      });

      // When: 위치 키워드로 검색
      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('강남');
      await page.waitForTimeout(300);

      // Then: 해당 위치의 일정만 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('고객 미팅')).toBeVisible();
      await expect(eventList.getByText('팀 회의')).not.toBeVisible();
    });

    test('2.3 제목, 설명, 위치 모두에서 검색할 수 있어야 함', async ({ page }) => {
      // Given: 다양한 정보를 가진 일정들 생성
      await createEvent(page, {
        title: '중요 회의',
        date: FIXED_DATE,
        startTime: '09:00',
        endTime: '10:00',
        description: '월간 보고서 검토',
        location: '본사 회의실',
      });

      await createEvent(page, {
        title: '점심',
        date: FIXED_DATE,
        startTime: '12:00',
        endTime: '13:00',
        description: '월간 팀 빌딩',
        location: '레스토랑',
      });

      await createEvent(page, {
        title: '워크숍',
        date: FIXED_DATE,
        startTime: '14:00',
        endTime: '16:00',
        description: '교육 세션',
        location: '세미나실',
      });

      // When: "월간" 키워드로 검색 (설명에 포함)
      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('월간');
      await page.waitForTimeout(300);

      // Then: "월간"이 설명에 포함된 일정들이 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('중요 회의')).toBeVisible();
      await expect(eventList.getByText('점심')).toBeVisible();
      await expect(eventList.getByText('워크숍')).not.toBeVisible();
    });
  });

  test.describe('3. 검색 결과 처리', () => {
    test('3.1 검색 결과가 없을 때 안내 메시지가 표시되어야 함', async ({ page }) => {
      // Given: 일정 생성
      await createEvent(page, {
        title: '회의',
        date: FIXED_DATE,
        startTime: '10:00',
        endTime: '11:00',
      });

      // When: 존재하지 않는 키워드로 검색
      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('존재하지않는일정');
      await page.waitForTimeout(300);

      // Then: 검색 결과 없음 메시지 표시
      await expect(page.getByText('검색 결과가 없습니다')).toBeVisible();
    });

    test('3.2 검색어를 지우면 모든 일정이 다시 표시되어야 함', async ({ page }) => {
      // Given: 여러 일정 생성
      await createEvent(page, {
        title: '회의 A',
        date: FIXED_DATE,
        startTime: '10:00',
        endTime: '11:00',
      });

      await createEvent(page, {
        title: '미팅 B',
        date: FIXED_DATE,
        startTime: '14:00',
        endTime: '15:00',
      });

      // When: 검색 후
      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('회의');
      await page.waitForTimeout(300);

      // Then: 필터링된 결과만 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('회의 A')).toBeVisible();
      await expect(eventList.getByText('미팅 B')).not.toBeVisible();

      // When: 검색어 지우기
      await searchInput.clear();
      await page.waitForTimeout(300);

      // Then: 모든 일정이 다시 표시됨
      await expect(eventList.getByText('회의 A')).toBeVisible();
      await expect(eventList.getByText('미팅 B')).toBeVisible();
    });

    test('3.3 실시간으로 검색 결과가 업데이트되어야 함', async ({ page }) => {
      // Given: 일정 생성
      await createEvent(page, {
        title: '프론트엔드 개발',
        date: FIXED_DATE,
        startTime: '10:00',
        endTime: '12:00',
      });

      await createEvent(page, {
        title: '백엔드 개발',
        date: FIXED_DATE,
        startTime: '13:00',
        endTime: '15:00',
      });

      await createEvent(page, {
        title: '디자인 검토',
        date: FIXED_DATE,
        startTime: '15:00',
        endTime: '16:00',
      });

      const searchInput = page.getByPlaceholder('검색...');
      const eventList = page.getByTestId('event-list');

      // When: "개발" 입력
      await searchInput.fill('개발');
      await page.waitForTimeout(300);

      // Then: "개발"이 포함된 일정만 표시
      await expect(eventList.getByText('프론트엔드 개발')).toBeVisible();
      await expect(eventList.getByText('백엔드 개발')).toBeVisible();
      await expect(eventList.getByText('디자인 검토')).not.toBeVisible();

      // When: "프론트" 로 변경
      await searchInput.clear();
      await searchInput.fill('프론트');
      await page.waitForTimeout(300);

      // Then: "프론트"가 포함된 일정만 표시
      await expect(eventList.getByText('프론트엔드 개발')).toBeVisible();
      await expect(eventList.getByText('백엔드 개발')).not.toBeVisible();
      await expect(eventList.getByText('디자인 검토')).not.toBeVisible();
    });
  });

  test.describe('4. 주간/월간 뷰에서 검색', () => {
    test('4.1 주간 뷰에서 검색이 동작해야 함', async ({ page }) => {
      // Given: 일정 생성
      await createEvent(page, {
        title: '주간 회의',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
      });

      await createEvent(page, {
        title: '일정 검토',
        date: '2024-11-08',
        startTime: '14:00',
        endTime: '15:00',
      });

      // When: 주간 뷰로 전환 후 검색
      await switchView(page, 'week');
      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('회의');
      await page.waitForTimeout(300);

      // Then: 주간 뷰에 필터링된 결과만 표시
      const weekView = page.getByTestId('week-view');
      await expect(weekView.getByText('주간 회의')).toBeVisible();

      // 이벤트 리스트도 필터링됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('주간 회의')).toBeVisible();
      await expect(eventList.getByText('일정 검토')).not.toBeVisible();
    });

    test('4.2 월간 뷰에서 검색이 동작해야 함', async ({ page }) => {
      // Given: 일정 생성
      await createEvent(page, {
        title: '월간 보고',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
      });

      await createEvent(page, {
        title: '주간 미팅',
        date: '2024-11-14',
        startTime: '14:00',
        endTime: '15:00',
      });

      // When: 월간 뷰로 전환 후 검색
      await switchView(page, 'month');
      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('월간');
      await page.waitForTimeout(300);

      // Then: 월간 뷰에 필터링된 결과만 표시
      const monthView = page.getByTestId('month-view');
      await expect(monthView.getByText('월간 보고')).toBeVisible();

      // 이벤트 리스트도 필터링됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('월간 보고')).toBeVisible();
      await expect(eventList.getByText('주간 미팅')).not.toBeVisible();
    });

    test('4.3 뷰 전환 후에도 검색 상태가 유지되어야 함', async ({ page }) => {
      // Given: 일정 생성 및 검색
      await createEvent(page, {
        title: '디자인 회의',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
      });

      await createEvent(page, {
        title: '개발 회의',
        date: '2024-11-07',
        startTime: '14:00',
        endTime: '15:00',
      });

      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('디자인');
      await page.waitForTimeout(300);

      // When: Week 뷰에서 검색 결과 확인
      await switchView(page, 'week');
      const weekView = page.getByTestId('week-view');
      await expect(weekView.getByText('디자인 회의')).toBeVisible();

      // When: Month 뷰로 전환
      await switchView(page, 'month');

      // Then: Month 뷰에서도 같은 검색 결과 유지
      const monthView = page.getByTestId('month-view');
      await expect(monthView.getByText('디자인 회의')).toBeVisible();

      // And: 이벤트 리스트에서도 필터링 유지
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('디자인 회의')).toBeVisible();
      await expect(eventList.getByText('개발 회의')).not.toBeVisible();
    });
  });

  test.describe('5. 카테고리 검색', () => {
    test('5.1 카테고리로 일정을 검색할 수 있어야 함', async ({ page }) => {
      // Given: 카테고리가 있는 일정 생성
      await createEvent(page, {
        title: '팀 회의',
        date: FIXED_DATE,
        startTime: '10:00',
        endTime: '11:00',
        category: '업무',
      });

      await createEvent(page, {
        title: '저녁 식사',
        date: FIXED_DATE,
        startTime: '18:00',
        endTime: '19:00',
        category: '개인',
      });

      await createEvent(page, {
        title: '프로젝트 리뷰',
        date: FIXED_DATE,
        startTime: '14:00',
        endTime: '15:00',
        category: '업무',
      });

      // When: "업무" 카테고리로 검색
      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('업무');
      await page.waitForTimeout(300);

      // Then: "업무" 카테고리 일정들만 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('팀 회의')).toBeVisible();
      await expect(eventList.getByText('프로젝트 리뷰')).toBeVisible();
      await expect(eventList.getByText('저녁 식사')).not.toBeVisible();
    });
  });

  test.describe('6. 특수 문자 검색', () => {
    test('6.1 특수 문자가 포함된 검색어를 처리할 수 있어야 함', async ({ page }) => {
      // Given: 특수 문자가 포함된 일정 생성
      await createEvent(page, {
        title: 'Q&A 세션',
        date: FIXED_DATE,
        startTime: '15:00',
        endTime: '16:00',
      });

      await createEvent(page, {
        title: 'R&D 미팅',
        date: FIXED_DATE,
        startTime: '10:00',
        endTime: '11:00',
      });

      // When: "&" 특수 문자로 검색
      const searchInput = page.getByPlaceholder('검색...');
      await searchInput.fill('Q&A');
      await page.waitForTimeout(300);

      // Then: 해당 일정이 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('Q&A 세션')).toBeVisible();
      await expect(eventList.getByText('R&D 미팅')).not.toBeVisible();
    });
  });
});
