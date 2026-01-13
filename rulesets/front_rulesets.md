# Frontend Engineering Standards & Paradigms

이 문서는 프로젝트의 일관성, 유지보수성, 확장성을 보장하기 위한 프론트엔드 엔지니어링 표준입니다.

# 1. Core Paradigms (핵심 패러다임)

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

# 2. React Best Practices

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

# 3. Next.js 14+ (App Router) Paradigms

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

# 4. Conventions

### 4.2 Naming Conventions

- **Component**: `kebab-case` (e.g., `use-profile.tsx`)
- **Hook**: `camelCase` (e.g., `use-auth.ts`)
- **Interface/Type**: 명사형 `kebab-case` (e.g., `user`, `topic-data`)
- **Event Handler**: `handle-[action]` (e.g., `handle-submit`, `handle-click`)
- **Props Handler**: `on-[action]` (e.g., `on-submit`, `on-click`)
- **File/Directory**: `kebab-case` 권장 (e.g., `user-profile.tsx`, `auth-guard/`) - *함수나 컴포넌트 파일명에 대쉬(-) 사용 가능*

### 4.3 Styling (Tailwind CSS)

- 복잡한 클래스 문자열은 `cn()` (clsx + tailwind-merge) 유틸리티를 사용하여 가독성을 높입니다.
- 색상이나 사이즈는 하드코딩하지 않고 `tailwind.config.ts`의 테마 변수를 사용합니다.

### 4.4 Directory Structure & Constants

- **Types**: 컴포넌트 내부에서만 쓰이는 타입이 아니면 `src/types` 또는 `src/api/types.ts`로 분리하여 순환 참조를 방지합니다.
- **Constants**: 매직 넘버나 설정값은 `src/constants` 폴더에서 관리합니다.

---

# 5. AI Coding Guide

- **Step-by-Step**: 한 번에 하나의 기능만 구현하고 승인을 받는다.
- **No Unused Code**: 사용하지 않는 라이브러리나 주석 처리된 코드를 생성하지 않는다.
- **Error Handling**: 모든 비동기 작업에는 에러 핸들링 로직(Try-Catch, Error Boundary)을 포함한다.
- AI는 코드를 제안할 때 '왜 이 방식이 최적인지' 짧게 설명한다.
- 승인 전까지는 코드베이스 전체를 수정하는 명령을 금지한다.

---

# 토스 프론트엔드 코드 품질 지표

- 다음은 토스에서 사용하는 프론트엔드 코드 품질 높이는 방법이야 참고해

## **1. 가독성**

**가독성**(Readability)은 코드가 읽기 쉬운 정도를 말해요. 코드가 변경하기 쉬우려면 먼저 코드가 어떤 동작을 하는지 이해할 수 있어야 해요.

읽기 좋은 코드는 읽는 사람이 한 번에 머릿속에서 고려하는 맥락이 적고, 위에서 아래로 자연스럽게 이어져요.

### **가독성을 높이는 전략**

- **맥락 줄이기**
    - [**같이 실행되지 않는 코드 분리하기**](https://frontend-fundamentals.com/code-quality/code/examples/submit-button.html)
    - [**구현 상세 추상화하기**](https://frontend-fundamentals.com/code-quality/code/examples/login-start-page.html)
    - [**로직 종류에 따라 합쳐진 함수 쪼개기**](https://frontend-fundamentals.com/code-quality/code/examples/use-page-state-readability.html)
- **이름 붙이기**
    - [**복잡한 조건에 이름 붙이기**](https://frontend-fundamentals.com/code-quality/code/examples/condition-name.html)
    - [**매직 넘버에 이름 붙이기**](https://frontend-fundamentals.com/code-quality/code/examples/magic-number-readability.html)
- **위에서 아래로 읽히게 하기**
    - [**시점 이동 줄이기**](https://frontend-fundamentals.com/code-quality/code/examples/user-policy.html)
    - [**삼항 연산자 단순하게 하기**](https://frontend-fundamentals.com/code-quality/code/examples/ternary-operator.html)

## **2. 예측 가능성**

**예측 가능성**(Predictability)이란, 함께 협업하는 동료들이 함수나 컴포넌트의 동작을 얼마나 예측할 수 있는지를 말해요. 예측 가능성이 높은 코드는 일관적인 규칙을 따르고, 함수나 컴포넌트의 이름과 파라미터, 반환 값만 보고도 어떤 동작을 하는지 알 수 있어요.

### **예측 가능성을 높이는 전략**

- [**이름 겹치지 않게 관리하기**](https://frontend-fundamentals.com/code-quality/code/examples/http.html)
- [**같은 종류의 함수는 반환 타입 통일하기**](https://frontend-fundamentals.com/code-quality/code/examples/use-user.html)
- [**숨은 로직 드러내기**](https://frontend-fundamentals.com/code-quality/code/examples/hidden-logic.html)

## **3. 응집도**

**응집도**(Cohesion)란, 수정되어야 할 코드가 항상 같이 수정되는지를 말해요. 응집도가 높은 코드는 코드의 한 부분을 수정해도 의도치 않게 다른 부분에서 오류가 발생하지 않아요. 함께 수정되어야 할 부분이 반드시 함께 수정되도록 구조적으로 뒷받침되기 때문이죠.

**가독성과 응집도는 서로 상충할 수 있어요**

일반적으로 응집도를 높이기 위해서는 변수나 함수를 추상화하는 등 가독성을 떨어뜨리는 결정을 해야 해요. 함께 수정되지 않으면 오류가 발생할 수 있는 경우에는, 응집도를 우선해서 코드를 공통화, 추상화하세요. 위험성이 높지 않은 경우에는, 가독성을 우선하여 코드 중복을 허용하세요.

### **응집도를 높이는 전략**

- [**함께 수정되는 파일을 같은 디렉토리에 두기**](https://frontend-fundamentals.com/code-quality/code/examples/code-directory.html)
- [**매직 넘버 없애기**](https://frontend-fundamentals.com/code-quality/code/examples/magic-number-cohesion.html)
- [**폼의 응집도 생각하기**](https://frontend-fundamentals.com/code-quality/code/examples/form-fields.html)

## **4. 결합도**

**결합도**(Coupling)란, 코드를 수정했을 때의 영향범위를 말해요. 코드를 수정했을 때 영향범위가 적어서, 변경에 따른 범위를 예측할 수 있는 코드가 수정하기 쉬운 코드예요.

### **결합도를 낮추는 전략**

- [**책임을 하나씩 관리하기**](https://frontend-fundamentals.com/code-quality/code/examples/use-page-state-coupling.html)
- [**중복 코드 허용하기**](https://frontend-fundamentals.com/code-quality/code/examples/use-bottom-sheet.html)
- [**Props Drilling 지우기**](https://frontend-fundamentals.com/code-quality/code/examples/item-edit-modal.html)

## **코드 품질 여러 각도로 보기**

아쉽게도 이 4가지 기준을 모두 한꺼번에 충족하기는 어려워요.

예를 들어서, 함수나 변수가 항상 같이 수정되기 위해서 공통화 및 추상화하면, 응집도가 높아지죠. 그렇지만 코드가 한 차례 추상화되기 때문에 가독성이 떨어져요.

중복 코드를 허용하면, 코드의 영향범위를 줄일 수 있어서, 결합도를 낮출 수 있어요. 그렇지만 한쪽을 수정했을 때 다른 한쪽을 실수로 수정하지 못할 수 있어서, 응집도가 떨어지죠.

프론트엔드 개발자는 현재 직면한 상황을 바탕으로, 깊이 있게 고민하면서, 장기적으로 코드가 수정하기 쉽게 하기 위해서 어떤 가치를 우선해야 하는지 고민해야 해요.