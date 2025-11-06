import { test, expect } from '@playwright/test';

import { createEvent, resetDatabase, switchView, type EventData } from './helpers';

/**
 * 시각적 회귀 테스트
 * UI 컴포넌트의 시각적 변경 사항을 감지합니다.
 */
test.describe('시각적 회귀 테스트', () => {
  test.beforeEach(async ({ page, request }) => {
    // 데이터베이스 초기화
    await resetDatabase(request);

    // 시간 고정 (2024-11-07)
    await page.clock.install({ time: new Date('2024-11-07') });

    // 페이지 로드 및 대기
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // 추가 렌더링 대기
  });

  test('초기 캘린더 화면 스냅샷', async ({ page }) => {
    // 전체 페이지 스크린샷 비교
    await expect(page).toHaveScreenshot('calendar-initial-view.png', {
      fullPage: true,
    });
  });

  test('월간 보기 캘린더 스냅샷', async ({ page }) => {
    // 월간 보기로 전환
    await switchView(page, 'month');
    await page.waitForTimeout(500); // 뷰 전환 대기

    await expect(page).toHaveScreenshot('calendar-month-view.png', {
      fullPage: true,
    });
  });

  test('주간 보기 캘린더 스냅샷', async ({ page }) => {
    // 주간 보기로 전환
    await switchView(page, 'week');
    await page.waitForTimeout(500); // 뷰 전환 대기

    await expect(page).toHaveScreenshot('calendar-week-view.png', {
      fullPage: true,
    });
  });

  test('이벤트가 추가된 캘린더 스냅샷', async ({ page }) => {
    // 이벤트 추가
    const eventData: EventData = {
      title: '시각적 테스트 이벤트',
      date: '2024-11-07',
      startTime: '10:00',
      endTime: '11:00',
      description: '시각적 회귀 테스트용 이벤트',
      location: '회의실 A',
      category: '업무',
    };

    await createEvent(page, eventData);

    // 캘린더 스크린샷
    await expect(page).toHaveScreenshot('calendar-with-event.png', {
      fullPage: true,
    });
  });

  test('검색 결과 스냅샷', async ({ page }) => {
    // 먼저 이벤트 추가
    const eventData: EventData = {
      title: '검색 테스트 이벤트',
      date: '2024-11-07',
      startTime: '14:00',
      endTime: '15:00',
    };

    await createEvent(page, eventData);

    // 검색 입력
    const searchInput = page.getByPlaceholder('검색어를 입력하세요');
    await searchInput.fill('검색 테스트');
    await page.waitForTimeout(500); // 검색 결과 대기

    // 검색 결과 스크린샷
    await expect(page).toHaveScreenshot('calendar-search-results.png', {
      fullPage: true,
    });
  });

  test('반복 이벤트가 있는 캘린더 스냅샷', async ({ page }) => {
    // 반복 이벤트 추가를 위해 직접 폼 조작
    await page.getByLabel('제목').fill('주간 팀 미팅');
    await page.getByLabel('날짜').fill('2024-11-07');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');

    // 반복 설정 선택
    await page.getByLabel('반복 일정').click();
    await page.getByLabel('반복 유형').click();
    await page.getByLabel('weekly-option').click();
    await page.waitForTimeout(300); // 반복 옵션 렌더링 대기

    // 반복 종료일 설정
    await page.getByLabel('반복 종료일').fill('2024-12-31');

    // 저장
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/events')),
      page.getByTestId('event-submit-button').click(),
    ]);
    await page.waitForTimeout(500);

    // 반복 이벤트가 포함된 캘린더 스크린샷
    await expect(page).toHaveScreenshot('calendar-with-recurring-event.png', {
      fullPage: true,
    });
  });

  test('이벤트 편집 모달 스냅샷', async ({ page }) => {
    // 먼저 이벤트 추가
    const eventData: EventData = {
      title: '편집 테스트 이벤트',
      date: '2024-11-07',
      startTime: '16:00',
      endTime: '17:00',
    };

    await createEvent(page, eventData);

    // 이벤트 리스트에서 이벤트 클릭
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('편집 테스트 이벤트').click();
    await page.waitForTimeout(300); // 모달 애니메이션 대기

    // 폼 영역 스크린샷 (전체 페이지)
    await expect(page).toHaveScreenshot('event-edit-form.png', {
      fullPage: true,
    });
  });

  test('여러 이벤트가 있는 주간 보기 스냅샷', async ({ page }) => {
    // 여러 이벤트 추가
    const events: EventData[] = [
      {
        title: '아침 회의',
        date: '2024-11-07',
        startTime: '09:00',
        endTime: '10:00',
        category: '업무',
      },
      {
        title: '점심 약속',
        date: '2024-11-07',
        startTime: '12:00',
        endTime: '13:00',
        category: '개인',
      },
      {
        title: '프로젝트 리뷰',
        date: '2024-11-08',
        startTime: '14:00',
        endTime: '16:00',
        category: '업무',
      },
    ];

    for (const eventData of events) {
      await createEvent(page, eventData);
    }

    // 주간 보기로 전환
    await switchView(page, 'week');
    await page.waitForTimeout(500);

    // 주간 보기 스크린샷
    await expect(page).toHaveScreenshot('calendar-week-view-with-events.png', {
      fullPage: true,
    });
  });

  test('여러 이벤트가 있는 월간 보기 스냅샷', async ({ page }) => {
    // 여러 날짜에 이벤트 추가
    const events: EventData[] = [
      {
        title: '이벤트 1',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
      },
      {
        title: '이벤트 2',
        date: '2024-11-14',
        startTime: '14:00',
        endTime: '15:00',
      },
      {
        title: '이벤트 3',
        date: '2024-11-21',
        startTime: '16:00',
        endTime: '17:00',
      },
    ];

    for (const eventData of events) {
      await createEvent(page, eventData);
    }

    // 월간 보기로 전환
    await switchView(page, 'month');
    await page.waitForTimeout(500);

    // 월간 보기 스크린샷
    await expect(page).toHaveScreenshot('calendar-month-view-with-events.png', {
      fullPage: true,
    });
  });

  test('빈 검색 결과 스냅샷', async ({ page }) => {
    // 검색 입력 (결과 없음)
    const searchInput = page.getByPlaceholder('검색어를 입력하세요');
    await searchInput.fill('존재하지않는이벤트12345');
    await page.waitForTimeout(500);

    // 빈 검색 결과 스크린샷
    await expect(page).toHaveScreenshot('calendar-empty-search-results.png', {
      fullPage: true,
    });
  });

  // ===== 일정 상태별 시각적 표현 =====
  test('카테고리별 이벤트 표시 스냅샷', async ({ page }) => {
    // 다양한 카테고리의 이벤트 추가
    const events: EventData[] = [
      {
        title: '업무 미팅',
        date: '2024-11-07',
        startTime: '09:00',
        endTime: '10:00',
        category: '업무',
      },
      {
        title: '개인 약속',
        date: '2024-11-07',
        startTime: '12:00',
        endTime: '13:00',
        category: '개인',
      },
      {
        title: '가족 행사',
        date: '2024-11-07',
        startTime: '15:00',
        endTime: '16:00',
        category: '가족',
      },
      {
        title: '기타 일정',
        date: '2024-11-07',
        startTime: '18:00',
        endTime: '19:00',
        category: '기타',
      },
    ];

    for (const eventData of events) {
      await createEvent(page, eventData);
    }

    // 카테고리별 색상이 다르게 표시된 스크린샷
    await expect(page).toHaveScreenshot('calendar-with-category-colors.png', {
      fullPage: true,
    });
  });

  test('알림 설정된 이벤트 표시 스냅샷', async ({ page }) => {
    // 다양한 알림 시간의 이벤트 추가
    const events: EventData[] = [
      {
        title: '1분 전 알림',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 1,
      },
      {
        title: '10분 전 알림',
        date: '2024-11-07',
        startTime: '14:00',
        endTime: '15:00',
        notificationTime: 10,
      },
      {
        title: '1시간 전 알림',
        date: '2024-11-08',
        startTime: '09:00',
        endTime: '10:00',
        notificationTime: 60,
      },
    ];

    for (const eventData of events) {
      await createEvent(page, eventData);
    }

    // 알림 시간이 표시된 스크린샷
    await expect(page).toHaveScreenshot('calendar-with-notification-times.png', {
      fullPage: true,
    });
  });

  test('알림 활성화 상태 스냅샷', async ({ page }) => {
    // 10분 전 알림으로 14:00 이벤트 생성
    await createEvent(page, {
      title: '알림 테스트 회의',
      date: '2024-11-07',
      startTime: '14:00',
      endTime: '15:00',
      notificationTime: 10,
    });

    // 알림 시간(13:50)으로 시간 진행
    await page.clock.setSystemTime(new Date('2024-11-07T13:50:00'));
    await page.clock.runFor(2000); // setInterval 실행

    await page.waitForTimeout(500);

    // 알림이 활성화된 상태 스크린샷 (빨간색 bold 텍스트)
    await expect(page).toHaveScreenshot('calendar-notification-active.png', {
      fullPage: true,
    });
  });

  test('반복 일정 표시 스냅샷', async ({ page }) => {
    // 반복 설정이 표시된 이벤트
    await page.getByLabel('제목').fill('매주 스탠드업 미팅');
    await page.getByLabel('날짜').fill('2024-11-07');
    await page.getByLabel('시작 시간').fill('09:30');
    await page.getByLabel('종료 시간').fill('10:00');

    // 주간 반복 설정
    await page.getByLabel('반복 일정').click();
    await page.getByLabel('반복 유형').click();
    await page.getByLabel('weekly-option').click();
    await page.waitForTimeout(300);

    await page.getByLabel('반복 종료일').fill('2024-12-31');

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/events')),
      page.getByTestId('event-submit-button').click(),
    ]);
    await page.waitForTimeout(500);

    // 반복 아이콘이 표시된 스크린샷
    await expect(page).toHaveScreenshot('calendar-with-repeat-indicator.png', {
      fullPage: true,
    });
  });

  // ===== 다이얼로그 및 모달 =====
  test('이벤트 생성 폼 전체 스냅샷', async ({ page }) => {
    // 폼이 열린 초기 상태
    await expect(page).toHaveScreenshot('event-form-empty.png', {
      fullPage: true,
    });
  });

  test('이벤트 생성 폼 입력 중 스냅샷', async ({ page }) => {
    // 폼 일부 입력
    await page.getByLabel('제목').fill('새로운 프로젝트 킥오프');
    await page.getByLabel('날짜').fill('2024-11-15');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('12:00');
    await page.getByLabel('설명').fill('Q4 신규 프로젝트 시작을 위한 킥오프 미팅입니다.');
    await page.getByLabel('위치').fill('대회의실');

    await page.waitForTimeout(300);

    // 폼이 입력된 상태 스크린샷
    await expect(page).toHaveScreenshot('event-form-filled.png', {
      fullPage: true,
    });
  });

  test('반복 설정 확장 폼 스냅샷', async ({ page }) => {
    // 반복 일정 체크
    await page.getByLabel('반복 일정').click();
    await page.waitForTimeout(300);

    // 반복 설정 필드들이 나타난 상태
    await expect(page).toHaveScreenshot('event-form-repeat-expanded.png', {
      fullPage: true,
    });
  });

  test('일정 겹침 경고 다이얼로그 스냅샷', async ({ page }) => {
    // 첫 번째 이벤트 추가
    await createEvent(page, {
      title: '기존 회의',
      date: '2024-11-07',
      startTime: '14:00',
      endTime: '15:00',
    });

    // 겹치는 이벤트 추가 시도
    await page.getByLabel('제목').fill('새 회의');
    await page.getByLabel('날짜').fill('2024-11-07');
    await page.getByLabel('시작 시간').fill('14:30');
    await page.getByLabel('종료 시간').fill('15:30');
    await page.getByTestId('event-submit-button').click();

    // 경고 다이얼로그가 나타날 때까지 대기
    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(300);

    // 경고 다이얼로그 스크린샷
    await expect(page).toHaveScreenshot('dialog-event-overlap-warning.png', {
      fullPage: true,
    });
  });

  test('반복 일정 수정 확인 다이얼로그 스냅샷', async ({ page }) => {
    // 반복 이벤트 추가
    await page.getByLabel('제목').fill('주간 팀 회의');
    await page.getByLabel('날짜').fill('2024-11-07');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');

    await page.getByLabel('반복 일정').click();
    await page.getByLabel('반복 유형').click();
    await page.getByLabel('weekly-option').click();
    await page.waitForTimeout(300);

    await page.getByLabel('반복 종료일').fill('2024-12-31');

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/events')),
      page.getByTestId('event-submit-button').click(),
    ]);
    await page.waitForTimeout(500);

    // 반복 일정 클릭하여 수정 모드
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('주간 팀 회의').first().click();
    await page.waitForTimeout(300);

    // 제목 수정
    await page.getByLabel('제목').clear();
    await page.getByLabel('제목').fill('주간 팀 스탠드업');

    // 저장 시도 - 반복 일정 수정 확인 다이얼로그
    await page.getByTestId('event-submit-button').click();

    // 다이얼로그 대기
    await page.waitForTimeout(500);

    // 반복 일정 수정 확인 다이얼로그 스크린샷
    const dialog = page.locator('[role="dialog"]').last();
    if (await dialog.isVisible()) {
      await expect(page).toHaveScreenshot('dialog-recurring-event-edit.png', {
        fullPage: true,
      });
    }
  });

  // ===== 폼 컨트롤 상태 =====
  test('카테고리 선택 드롭다운 열림 스냅샷', async ({ page }) => {
    // 카테고리 드롭다운 열기
    await page.getByLabel('카테고리').click();
    await page.waitForTimeout(300);

    // 드롭다운이 열린 상태 스크린샷
    await expect(page).toHaveScreenshot('form-category-dropdown-open.png', {
      fullPage: true,
    });
  });

  test('알림 설정 드롭다운 열림 스냅샷', async ({ page }) => {
    // 알림 설정 드롭다운 열기
    await page.getByLabel('알림 설정').click();
    await page.waitForTimeout(300);

    // 드롭다운이 열린 상태 스크린샷
    await expect(page).toHaveScreenshot('form-notification-dropdown-open.png', {
      fullPage: true,
    });
  });

  test('반복 유형 드롭다운 열림 스냅샷', async ({ page }) => {
    // 반복 일정 활성화
    await page.getByLabel('반복 일정').click();
    await page.waitForTimeout(300);

    // 반복 유형 드롭다운 열기
    await page.getByLabel('반복 유형').click();
    await page.waitForTimeout(300);

    // 드롭다운이 열린 상태 스크린샷
    await expect(page).toHaveScreenshot('form-repeat-type-dropdown-open.png', {
      fullPage: true,
    });
  });

  test('뷰 타입 선택 드롭다운 열림 스냅샷', async ({ page }) => {
    // 뷰 타입 드롭다운 열기
    await page.getByLabel('뷰 타입 선택').click();
    await page.waitForTimeout(300);

    // 드롭다운이 열린 상태 스크린샷
    await expect(page).toHaveScreenshot('view-type-dropdown-open.png', {
      fullPage: true,
    });
  });

  // ===== 텍스트 길이에 따른 처리 =====
  test('긴 제목 이벤트 스냅샷 (Ellipsis 처리)', async ({ page }) => {
    // 매우 긴 제목의 이벤트 추가
    const events: EventData[] = [
      {
        title:
          '매우 긴 제목을 가진 이벤트입니다. 이 제목은 화면에 다 표시되지 않을 것이며 말줄임표로 처리되어야 합니다.',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
      },
      {
        title: '이것도 상당히 긴 제목의 이벤트로 UI에서 적절하게 처리되는지 확인이 필요합니다',
        date: '2024-11-07',
        startTime: '14:00',
        endTime: '15:00',
      },
      {
        title: '짧은 제목',
        date: '2024-11-07',
        startTime: '16:00',
        endTime: '17:00',
      },
    ];

    for (const eventData of events) {
      await createEvent(page, eventData);
    }

    // 긴 제목이 Ellipsis로 처리된 스크린샷
    await expect(page).toHaveScreenshot('calendar-long-title-ellipsis.png', {
      fullPage: true,
    });
  });

  test('긴 설명이 있는 이벤트 편집 폼 스냅샷', async ({ page }) => {
    // 긴 설명의 이벤트 추가
    await createEvent(page, {
      title: '상세 설명 이벤트',
      date: '2024-11-07',
      startTime: '10:00',
      endTime: '11:00',
      description:
        '이것은 매우 긴 설명을 가진 이벤트입니다. 프로젝트의 주요 목표는 다음과 같습니다: 1) 사용자 경험 개선, 2) 성능 최적화, 3) 새로운 기능 추가, 4) 버그 수정 및 안정화. 각 목표에 대한 구체적인 실행 계획과 일정이 필요하며, 팀원들의 적극적인 참여가 필수적입니다. 이번 회의에서는 이러한 사항들을 논의하고 우선순위를 정할 예정입니다.',
      location: '본사 대회의실 A동 3층',
      category: '업무',
    });

    // 이벤트 클릭하여 편집 모드
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('상세 설명 이벤트').click();
    await page.waitForTimeout(300);

    // 긴 설명이 표시된 편집 폼 스크린샷
    await expect(page).toHaveScreenshot('event-form-long-description.png', {
      fullPage: true,
    });
  });

  test('주간 보기에서 긴 제목 처리 스냅샷', async ({ page }) => {
    // 여러 긴 제목 이벤트 추가
    const events: EventData[] = [
      {
        title: '월요일 아침 전체 팀 회의 - Q4 계획 발표 및 논의',
        date: '2024-11-04',
        startTime: '09:00',
        endTime: '10:30',
      },
      {
        title: '화요일 클라이언트 미팅 (ABC Corp 신규 프로젝트 계약 논의)',
        date: '2024-11-05',
        startTime: '14:00',
        endTime: '16:00',
      },
      {
        title: '수요일 개발팀 스프린트 회고 및 다음 스프린트 계획 수립',
        date: '2024-11-06',
        startTime: '11:00',
        endTime: '12:30',
      },
      {
        title: '목요일 디자인 리뷰 - 새로운 UI/UX 개선안 검토 및 피드백',
        date: '2024-11-07',
        startTime: '15:00',
        endTime: '17:00',
      },
    ];

    for (const eventData of events) {
      await createEvent(page, eventData);
    }

    // 주간 보기로 전환
    await switchView(page, 'week');
    await page.waitForTimeout(500);

    // 주간 보기에서 긴 제목 처리 스크린샷
    await expect(page).toHaveScreenshot('week-view-long-titles.png', {
      fullPage: true,
    });
  });

  test('월간 보기에서 많은 이벤트가 있는 날짜 셀 스냅샷', async ({ page }) => {
    // 한 날짜에 많은 이벤트 추가
    const events: EventData[] = [
      { title: '이벤트 1', date: '2024-11-07', startTime: '09:00', endTime: '10:00' },
      { title: '이벤트 2', date: '2024-11-07', startTime: '10:00', endTime: '11:00' },
      { title: '이벤트 3', date: '2024-11-07', startTime: '11:00', endTime: '12:00' },
      { title: '이벤트 4', date: '2024-11-07', startTime: '13:00', endTime: '14:00' },
      { title: '이벤트 5', date: '2024-11-07', startTime: '14:00', endTime: '15:00' },
      { title: '이벤트 6', date: '2024-11-07', startTime: '15:00', endTime: '16:00' },
      { title: '이벤트 7', date: '2024-11-07', startTime: '16:00', endTime: '17:00' },
    ];

    for (const eventData of events) {
      await createEvent(page, eventData);
    }

    // 월간 보기로 전환
    await switchView(page, 'month');
    await page.waitForTimeout(500);

    // 많은 이벤트가 있는 셀 스크린샷
    await expect(page).toHaveScreenshot('month-view-many-events-per-day.png', {
      fullPage: true,
    });
  });
});
