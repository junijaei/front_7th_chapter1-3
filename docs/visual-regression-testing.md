# 시각적 회귀 테스트 가이드

## 개요

이 프로젝트는 Playwright의 시각적 회귀 테스트 기능을 사용하여 UI 변경 사항을 자동으로 감지합니다.

## 설정

### Playwright 설정 (playwright.config.ts:38-49)

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,          // 허용 가능한 픽셀 차이 개수
    maxDiffPixelRatio: 0.01,     // 허용 가능한 픽셀 차이 비율 (1%)
    animations: 'disabled',       // 애니메이션 비활성화
    caret: 'hide',               // 커서 숨기기
  },
}
```

## 테스트 실행

### 로컬 개발 환경

```bash
# 시각적 회귀 테스트 실행
pnpm test:visual

# 스냅샷 업데이트 (UI 변경 승인)
pnpm test:visual:update

# UI 모드로 테스트 실행
pnpm test:visual:ui
```

### CI/CD 환경

시각적 회귀 테스트는 PR이 생성되거나 업데이트될 때 자동으로 실행됩니다.

- `.github/workflows/ci.yml`의 `visual-regression-test` 작업에서 실행
- 테스트 결과와 스냅샷은 GitHub Actions Artifacts에 업로드됨

## 테스트 커버리지

현재 시각적 회귀 테스트는 다음 화면들을 커버합니다:

### 기본 캘린더 뷰
1. **초기 캘린더 화면** - 앱 로드 시 기본 화면
2. **월간 보기** - 월 단위 캘린더 뷰
3. **주간 보기** - 주 단위 캘린더 뷰
4. **이벤트가 추가된 캘린더** - 이벤트가 표시된 캘린더
5. **여러 이벤트가 있는 주간/월간 보기** - 다양한 이벤트 표시

### 검색 기능
6. **검색 결과 화면** - 이벤트 검색 결과
7. **빈 검색 결과 화면** - 결과가 없는 경우

### 일정 상태별 시각적 표현
8. **카테고리별 이벤트 표시** - 업무/개인/가족/기타 카테고리별 색상
9. **알림 설정된 이벤트** - 다양한 알림 시간 표시
10. **알림 활성화 상태** - 알림 시간 도달 시 빨간색 bold 표시
11. **반복 일정 표시** - 반복 아이콘이 표시된 이벤트

### 다이얼로그 및 모달
12. **이벤트 생성 폼 (빈 상태)** - 초기 폼 화면
13. **이벤트 생성 폼 (입력 중)** - 데이터가 입력된 폼
14. **반복 설정 확장 폼** - 반복 일정 옵션이 표시된 폼
15. **이벤트 편집 모달** - 기존 이벤트 수정 폼
16. **일정 겹침 경고 다이얼로그** - 시간 충돌 경고
17. **반복 일정 수정 확인 다이얼로그** - 단일/전체 수정 선택

### 폼 컨트롤 상태
18. **카테고리 선택 드롭다운** - 열린 상태
19. **알림 설정 드롭다운** - 열린 상태
20. **반복 유형 드롭다운** - 열린 상태
21. **뷰 타입 선택 드롭다운** - 열린 상태

### 텍스트 길이에 따른 처리
22. **긴 제목 이벤트** - Ellipsis 처리 확인
23. **긴 설명이 있는 편집 폼** - 긴 텍스트 렌더링
24. **주간 보기 긴 제목 처리** - 주간 뷰에서의 긴 제목
25. **월간 보기 많은 이벤트** - 한 날짜에 여러 이벤트

## 스냅샷 관리

### 스냅샷 저장 위치

```
src/__tests__/e2e/visual-regression.spec.ts-snapshots/
├── chromium/
│   ├── calendar-initial-view.png
│   ├── calendar-month-view.png
│   ├── calendar-week-view.png
│   └── ...
```

### 스냅샷 업데이트 워크플로우

의도적인 UI 변경이 있을 때:

1. **로컬에서 스냅샷 업데이트**
   ```bash
   pnpm test:visual:update
   ```

2. **변경사항 검토 및 커밋**
   ```bash
   git add src/__tests__/e2e/**/*-snapshots/
   git commit -m "chore: update visual regression snapshots"
   ```

3. **또는 GitHub Actions 사용**
   - GitHub Actions 탭에서 "Update Visual Snapshots" 워크플로우 실행
   - 대상 브랜치 선택
   - 워크플로우가 자동으로 스냅샷을 업데이트하고 커밋

## CI/CD 파이프라인

### visual-regression-test 작업

```yaml
visual-regression-test:
  runs-on: ubuntu-latest
  steps:
    - 체크아웃
    - 의존성 설치
    - Playwright 브라우저 설치
    - 시각적 회귀 테스트 실행 (스냅샷 자동 업데이트)
    - 테스트 결과 업로드
    - 스냅샷 아티팩트 업로드
```

### 주요 특징

- `continue-on-error: true`: 테스트 실패 시에도 파이프라인 계속 진행
- 자동 스냅샷 업데이트: `--update-snapshots` 플래그 사용
- 아티팩트 보관: 30일간 테스트 결과, 7일간 스냅샷 보관

## 문제 해결

### 스냅샷이 일치하지 않는 경우

1. **의도된 변경인 경우**
   - 로컬에서 `pnpm test:visual:update` 실행
   - 새 스냅샷을 검토하고 커밋

2. **의도하지 않은 변경인 경우**
   - 시각적 차이를 확인 (diff 이미지 참조)
   - 코드 변경사항을 검토하고 수정
   - 테스트 재실행

### 플랫폼 간 차이

- CI는 Ubuntu Linux에서 실행됨
- 로컬 개발 환경이 다를 경우 약간의 렌더링 차이 발생 가능
- `maxDiffPixels`와 `maxDiffPixelRatio`로 허용 오차 조정 가능

### 애니메이션 관련 문제

- Playwright 설정에서 애니메이션이 비활성화되어 있음
- 추가 대기가 필요한 경우 `page.waitForTimeout()` 사용
- CSS 트랜지션도 비활성화 고려

## 모범 사례

1. **스냅샷 크기 최소화**
   - 전체 페이지 스크린샷 대신 특정 요소 스크린샷 사용 고려
   - 동적 콘텐츠(시간, 날짜 등)는 고정값으로 테스트

2. **테스트 안정성**
   - 비동기 작업 완료를 확실히 대기
   - 네트워크 요청 완료 대기 (`waitForLoadState('networkidle')`)
   - 애니메이션 완료 대기

3. **스냅샷 버전 관리**
   - 스냅샷은 Git에 커밋하여 버전 관리
   - UI 변경 시 스냅샷도 함께 업데이트
   - PR 리뷰 시 스냅샷 변경사항도 검토

4. **선택적 테스트**
   - 시각적 테스트는 별도 파일로 분리 (`visual-regression.spec.ts`)
   - 필요한 경우에만 실행하여 CI 시간 최적화

## 참고 자료

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [GitHub Actions Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
