# Frontend Engineering Standards & Paradigms

이 문서는 프로젝트의 일관성, 유지보수성, 확장성을 보장하기 위한 프론트엔드 엔지니어링 표준입니다.

## 1. Core Paradigms (핵심 패러다임)

### 1.1 Declarative UI (선언형 UI)
- **Do**: "어떤 상태일 때 무엇을 보여준다"라고 명세합니다.
- **Don't**: DOM을 직접 조작하거나 명령적으로 제어하지 않습니다.
- **Why**: 상태(State)와 뷰(View)의 동기화를 보장하고 예측 가능성을 높입니다.

### 1.2 Unidirectional Data Flow (단방향 데이터 흐름)
- 데이터는 부모에서 자식으로 `props`를 통해 흐릅니다.
- 자식은 부모의 상태를 직접 변경하지 않고, 부모가 전달한 `handler` 함수를 호출하여 요청합니다.

### 1.3 Separation of Concerns (관심사의 분리)
- **View (UI)**: 데이터가 어떻게 보여질지만 담당합니다. (Stateless 권장)
- **Logic (Hooks)**: 데이터가 어떻게 변하고 처리되는지를 담당합니다. (Stateful)
- **Data (API/Store)**: 원본 데이터의 Fetching 및 전역 상태 관리를 담당합니다.

---

## 2. React Best Practices

### 2.1 Component Composition (합성)
- 복잡한 컴포넌트를 만들 때, 내부에서 모든 것을 처리하기보다 `children`이나 `slot` 패턴(props로 컴포넌트 전달)을 사용하세요.
- **Example**:
  ```tsx
  // Bad
  <Card title="Title" content="Content" footerButton={<Button />} />

  // Good
  <Card>
    <CardHeader>Title</CardHeader>
    <CardBody>Content</CardBody>
    <CardFooter><Button /></CardFooter>
  </Card>
  ```

### 2.2 Custom Hooks Pattern
- UI에서 비즈니스 로직(데이터 필터링, 폼 처리, API 호출 등)이 15줄 이상 차지한다면 Custom Hook으로 분리합니다.
- Hook의 이름은 `use`로 시작하며, 반환 값은 데이터와 함수들로 구성합니다.

### 2.3 Immutable State (불변성)
- 객체나 배열 상태를 수정할 때는 반드시 복사본을 만들어 업데이트합니다. (Spread 연산자 `...` 등 활용)
- 복잡한 객체 로직은 `Immer`와 같은 라이브러리나 `useReducer`를 고려합니다.

---

## 3. Next.js 14+ (App Router) Paradigms

### 3.1 Server Components First
- 기본적으로 모든 컴포넌트는 **Server Component**로 작성합니다.
- `useState`, `useEffect`, 브라우저 API(`window`, `localStorage`)가 필요한 경우에만 파일 최상단에 `"use client"`를 선언합니다.
- **Why**: 번들 사이즈 감소, 초기 로딩 속도 향상, 보안(비밀키 은닉) 강화.

### 3.2 Data Fetching
- **Server Component**: `async/await`를 사용하여 컴포넌트 내부에서 직접 데이터를 가져옵니다. `fetch` API의 캐싱 기능을 활용합니다.
- **Client Component**: `useEffect` 대신 `TanStack Query`나 `SWiR` 같은 라이브러리를 사용하여 서버 상태를 관리합니다.

### 3.3 Colocation (위치시키기)
- 특정 페이지에서만 사용되는 컴포넌트나 유틸리티는 해당 페이지 폴더(`src/app/feature-xyz/_components`) 내부에 위치시킵니다.
- 전역적으로 재사용될 때만 `src/components`로 올립니다.

---

## 4. Code Quality & Refactoring Rules

### 4.1 Component Atomicity
- 하나의 컴포넌트 파일이 **250줄**을 넘어가면 분리 신호로 간주합니다.
- `renderXYZ` 같은 함수를 컴포넌트 내부에 만들기보다, 별도 컴포넌트로 분리합니다.

### 4.2 Naming Conventions
- **Component**: `PascalCase` (e.g., `UserProfile.tsx`)
- **Hook**: `camelCase` (e.g., `useAuth.ts`)
- **Interface/Type**: 명사형 `PascalCase` (e.g., `User`, `TopicData`)
- **Event Handler**: `handle[Action]` (e.g., `handleSubmit`, `handleClick`)
- **Props Handler**: `on[Action]` (e.g., `onSubmit`, `onClick`)
- **File/Directory**: `kebab-case` 권장 (e.g., `user-profile.tsx`, `auth-guard/`) - *함수나 컴포넌트 파일명에 대쉬(-) 사용 가능*


### 4.3 Styling (Tailwind CSS)
- 복잡한 클래스 문자열은 `cn()` (clsx + tailwind-merge) 유틸리티를 사용하여 가독성을 높입니다.
- 색상이나 사이즈는 하드코딩하지 않고 `tailwind.config.ts`의 테마 변수를 사용합니다.

### 4.4 Directory Structure & Constants
- **Types**: 컴포넌트 내부에서만 쓰이는 타입이 아니면 `src/types` 또는 `src/api/types.ts`로 분리하여 순환 참조를 방지합니다.
- **Constants**: 매직 넘버나 설정값은 `src/constants` 폴더에서 관리합니다.

---

## 5. AI Coding Guide

- **Step-by-Step**: 한 번에 하나의 기능만 구현하고 승인을 받는다.
- **No Unused Code**: 사용하지 않는 라이브러리나 주석 처리된 코드를 생성하지 않는다.
- **Error Handling**: 모든 비동기 작업에는 에러 핸들링 로직(Try-Catch, Error Boundary)을 포함한다.

## 6. 승인 프로세스

- AI는 코드를 제안할 때 '왜 이 방식이 최적인지' 짧게 설명한다.
- 승인 전까지는 코드베이스 전체를 수정하는 명령을 금지한다.

## 7. Readability Strategy - Reducing Context (맥락 줄이기)

### 7.1 Separate Mutually Exclusive Code (상호 배타적 코드 분리)
- **Problem**: 동시에 실행되지 않는 코드(예: 권한별 분기)가 하나의 컴포넌트에 섞여 있으면 읽는 사람이 고려해야 할 맥락이 너무 많아집니다.
- **Solution**: 서로 다른 실행 맥락을 가진 코드는 **별도의 컴포넌트로 분리**하여, 한 번에 하나의 맥락만 고려하도록 합니다.
- **Example**:
  ```tsx
  // Bad: isViewer 여부에 따라 Hook 실행과 렌더링 로직이 섞여 있음
  function SubmitButton() {
    const isViewer = useRole() === "viewer";
    useEffect(() => { if (!isViewer) showAnimation(); }, [isViewer]);
    return isViewer ? <TextButton disabled>Submit</TextButton> : <Button>Submit</Button>;
  }

  // Good: 완전히 분리된 두 컴포넌트로 나눔
  function SubmitButton() {
    const isViewer = useRole() === "viewer";
    return isViewer ? <ViewerSubmitButton /> : <AdminSubmitButton />;
  }
  ```

### 7.2 Abstract Implementation Details (구현 상세 추상화)
- **Problem**: 핵심 로직과 세부 구현(변수확인, 복잡한 UI 구성 등)이 뒤섞여 있으면 비즈니스 흐름을 파악하기 어렵습니다.
- **Solution**: 복잡한 조건문이나 UI 구성 로직은 **Wrapper Component**, **HOC**, 또는 **전용 하위 컴포넌트**로 숨깁니다.
- **Example**:
  ```tsx
  // Bad: 로그인 체크 로직과 UI가 섞임
  function LoginStartPage() {
    useCheckLogin({ onChecked: (status) => { if (status === "LOGGED_IN") location.href = "/home"; } });
    return <>{/* Login UI */}</>;
  }

  // Good: AuthGuard Wrapper로 로직 분리
  function App() {
    return (
      <AuthGuard>
        <LoginStartPage />
      </AuthGuard>
    );
  }
  ```

### 7.3 Split Functions Combined by Logic Type (로직 종류에 따라 합쳐진 함수 쪼개기)
- **Problem**: 쿼리 파라미터, 상태, API 호출 등 '로직의 종류'가 같다는 이유로 하나의 함수/Hook에 몰아넣으면(예: `usePageState`), 책임이 비대해지고 불필요한 리렌더링이 발생합니다.
- **Solution**: 로직의 종류가 아니라 **도메인(역할)** 단위로 Hook을 쪼갭니다.
- **Example**:
  ```tsx
  // Bad: 모든 쿼리 파라미터를 한 곳에서 관리
  export function usePageState() {
    const [query, setQuery] = useQueryParams({ cardId: NumberParam, dateFrom: DateParam, ... });
    return { values: query, controls: { ... } }; // 하나만 변해도 전체 리렌더링
  }

  // Good: 개별 파라미터별로 분리
  export function useCardIdQueryParam() {
    const [cardId, setCardId] = useQueryParam("cardId", NumberParam);
    return [cardId, setCardId] as const;
  }
  ```

## 8. Readability Strategy - Naming (이름 붙이기)

### 8.1 Name Complex Conditions (복잡한 조건에 이름 붙이기)
- **Problem**: 익명 함수와 복잡한 논리 연산자(`&&`, `||`, `some`, `filter` 등)가 중첩되면 코드의 의도를 파악하기 어렵습니다.
- **Solution**: 조건식의 결과를 명시적인 이름을 가진 변수로 분리하여, **'어떻게(How)'**가 아닌 **'무엇을(What/Why)'** 검사하는지 드러냅니다.
- **Example**:
  ```tsx
  // Bad: 조건 로직이 복잡하게 얽혀 있음
  const result = products.filter((product) =>
    product.categories.some((c) => c.id === target.id && product.prices.some((p) => p >= min && p <= max))
  );


### 8.2 Name Magic Numbers (매직 넘버에 이름 붙이기)
- **Problem**: 소스 코드에 직접 쓰인 숫자(매직 넘버)는 작성자가 아니면 그 의도(예: 애니메이션 시간, 타임아웃 등)를 알기 어렵습니다.
- **Solution**: 숫자의 의미를 명확히 설명하는 **상수(Constant)** 로 선언하여 사용합니다.
- **Example**:
  ```tsx
  // Bad: 300이 무엇을 의미하는지 불분명함
  async function onLikeClick() {
    await postLike(url);
    await delay(300);
    await refetchPostLike();
  }

  // Good: 애니메이션 지연 시간임을 명시
  const ANIMATION_DELAY_MS = 300;

  async function onLikeClick() {
    await postLike(url);
    await delay(ANIMATION_DELAY_MS);
    await refetchPostLike();
  }
  ```




