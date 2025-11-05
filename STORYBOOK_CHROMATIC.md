# Storybook & Chromatic 시각적 회귀 테스트 가이드

## 개요

이 프로젝트는 Storybook과 Chromatic을 사용하여 시각적 회귀 테스트를 수행합니다.

## 설치된 패키지

### Storybook
- `storybook` - Storybook 코어
- `@storybook/react-vite` - React + Vite 통합
- `@storybook/addon-docs` - 자동 문서화
- `@storybook/addon-a11y` - 접근성 테스트
- `@storybook/addon-vitest` - Vitest 통합
- `@storybook/addon-onboarding` - 온보딩 가이드
- `@storybook/test` - 테스트 유틸리티

### Chromatic
- `chromatic` - Chromatic CLI
- `@chromatic-com/storybook` - Chromatic 애드온

## 사용 방법

### Storybook 개발 서버 실행

```bash
pnpm storybook
```

브라우저에서 `http://localhost:6006`으로 접속하여 스토리를 확인할 수 있습니다.

### Storybook 빌드

```bash
pnpm build-storybook
```

정적 빌드가 `storybook-static/` 디렉토리에 생성됩니다.

### Chromatic 배포

Chromatic을 사용하려면 먼저 프로젝트를 설정해야 합니다:

1. [Chromatic](https://www.chromatic.com/)에 가입
2. 새 프로젝트 생성
3. 프로젝트 토큰 받기
4. 환경 변수에 토큰 추가:

```bash
# .env 파일 생성 (git에 커밋하지 않음)
CHROMATIC_PROJECT_TOKEN=your-project-token
```

5. Chromatic에 배포:

```bash
pnpm chromatic
```

또는 프로젝트 토큰을 직접 전달:

```bash
pnpm chromatic --project-token=<your-project-token>
```

### CI/CD에서 Chromatic 사용

#### GitHub Actions 예시

`.github/workflows/chromatic.yml` 파일을 생성:

```yaml
name: Chromatic

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Chromatic이 변경 이력을 추적하기 위해 필요

      - uses: pnpm/action-setup@v3
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: \${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitZeroOnChanges: true # 변경사항이 있어도 빌드 실패하지 않음
```

#### GitHub Secrets 설정

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. `New repository secret` 클릭
3. Name: `CHROMATIC_PROJECT_TOKEN`
4. Value: Chromatic에서 받은 프로젝트 토큰
5. `Add secret` 클릭

## 스토리 작성 가이드

### 기본 스토리 구조

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { YourComponent } from './YourComponent';

const meta = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered', // 'centered' | 'fullscreen' | 'padded'
  },
  tags: ['autodocs'],
  args: {
    // 기본 args
    onAction: fn(),
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // 스토리별 args
  },
};

export const WithCustomProps: Story = {
  args: {
    // 다른 props
  },
};
```

### 인터랙션 테스트 예시

```typescript
import { within, userEvent, expect } from '@storybook/test';

export const WithInteraction: Story = {
  args: {
    isOpen: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 버튼 클릭
    await userEvent.click(canvas.getByRole('button', { name: '열기' }));

    // 다이얼로그가 표시되는지 확인
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
  },
};
```

## 작성된 스토리

현재 다음 컴포넌트에 대한 스토리가 작성되어 있습니다:

1. **OverlapDialog** (`src/components/OverlapDialog.stories.tsx`)
   - Closed: 닫힌 상태
   - SingleOverlap: 단일 일정 겹침
   - MultipleOverlaps: 여러 일정 겹침
   - LongTitleOverlap: 긴 제목 처리

2. **RecurringEventDialog** (`src/components/RecurringEventDialog.stories.tsx`)
   - Closed: 닫힌 상태
   - EditMode: 수정 모드
   - DeleteMode: 삭제 모드

## 추가 스토리 작성 권장

다음 컴포넌트들에 대한 스토리를 추가로 작성하는 것을 권장합니다:

- `EventForm` - 일정 작성/수정 폼
- `EventList` - 일정 목록
- `CalendarView` - 캘린더 뷰
- `calendar/MonthView` - 월간 뷰
- `calendar/WeekView` - 주간 뷰

## 시각적 회귀 테스트 워크플로우

1. **개발 단계**: 컴포넌트 개발 시 Storybook으로 다양한 상태 확인
2. **PR 생성**: Chromatic이 자동으로 시각적 변경사항 감지
3. **리뷰**: Chromatic 대시보드에서 변경사항 검토
4. **승인**: 의도된 변경사항이면 승인, 아니면 수정
5. **병합**: 모든 변경사항이 승인되면 PR 병합

## 참고 자료

- [Storybook 공식 문서](https://storybook.js.org/)
- [Chromatic 공식 문서](https://www.chromatic.com/docs/)
- [Storybook 베스트 프랙티스](https://storybook.js.org/docs/writing-stories/best-practices)
