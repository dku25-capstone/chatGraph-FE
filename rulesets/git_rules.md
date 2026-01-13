## 1. 커밋 메시지 규칙

- **형식**: `type: 커밋메시지` (예: `feat: 좋아요 기능 추가`)
- **태그 (Type)**:

• `feat`: 새로운 기능 추가, UI 구현

• `fix`: 버그 수정

• `build`: 빌드 시스템, 외부 의존성 변경 (npm, webpack 등)

• `ci`: CI 설정 파일 및 스크립트 변경 (GitHub Actions 등)

• `docs`: 문서 수정 및 추가 (README, API 문서 등)

• `perf`: 성능 개선

• `refactor`: 코드 구조 개선 (리팩토링)

• `style`: 코드 의미에 영향을 미치지 않는 포맷팅 변경

• `chore`: 유지보수 및 기타 관리 작업

• `test`: 테스트 추가 및 수정

## 2. PR (Pull Request) 규칙

- **제목**: 커밋 메시지 방식과 동일 (`type: PR 내용`)
- **이슈 연결**: 관련 이슈는 `- #이슈번호` 형식으로 본문에 포함
- **프로세스**:

• 코드 리뷰 후 Approve를 받으면 Merge 진행

• Merge 완료 후 해당 작업 브랜치는 반드시 삭제하여 정리한다.

## 3. Issue Template ([issue.md](http://issue.md/))

```jsx
## 이슈 제목

`[type]: 태스크 명칭`

## 1. 목표 (Goal)

- 해결하고자 하는 구체적인 목표

## 2. 관련 요구사항 (Context)

- `Engineering_PRD.md`의 관련 항목 명시

## 3. 원자 단위 작업 리스트 (Atomic Tasklist)

- 작업 항목 1
- 작업 항목 2

## 4. 성공 기준 (Definition of Done)

- 작업 완료를 판단할 구체적인 기준 명시
```

## 4. Pull Request Template

```jsx
PR 제목 `type: PR 내용 요약`

1. 작업 내용 (Summary)
• 이번 PR에서 변경된 핵심 내용을 요약합니다.

2. 관련 이슈 (Related Issues)
• 관련 이슈: - #이슈번호

3. 주요 변경 사항 (Key Changes)
• 기술적 변경 사항 

• UI/UX 변경 사항 

4. 리뷰 포인트 (Review Points)
• 리뷰어가 중점적으로 봐주었으면 하는 부분

5. 체크리스트 (Checklist)
• `git_rules.md`를 준수했는가?

• 관련 테스트를 완료했는가?

• 브랜치 전략에 부합하는가?

```## 1. 커밋 메시지 규칙

- **형식**: `type: 커밋메시지` (예: `feat: 좋아요 기능 추가`)
- **태그 (Type)**:

• `feat`: 새로운 기능 추가, UI 구현

• `fix`: 버그 수정

• `build`: 빌드 시스템, 외부 의존성 변경 (npm, webpack 등)

• `ci`: CI 설정 파일 및 스크립트 변경 (GitHub Actions 등)

• `docs`: 문서 수정 및 추가 (README, API 문서 등)

• `perf`: 성능 개선

• `refactor`: 코드 구조 개선 (리팩토링)

• `style`: 코드 의미에 영향을 미치지 않는 포맷팅 변경

• `chore`: 유지보수 및 기타 관리 작업

• `test`: 테스트 추가 및 수정

## 2. PR (Pull Request) 규칙

- **제목**: 커밋 메시지 방식과 동일 (`type: PR 내용`)
- **이슈 연결**: 관련 이슈는 `- #이슈번호` 형식으로 본문에 포함
- **프로세스**:

• 코드 리뷰 후 Approve를 받으면 Merge 진행

• Merge 완료 후 해당 작업 브랜치는 반드시 삭제하여 정리한다.

## 3. Issue Template ([issue.md](http://issue.md/))

```jsx
## 이슈 제목

`[type]: 태스크 명칭`

## 1. 목표 (Goal)

- 해결하고자 하는 구체적인 목표

## 2. 관련 요구사항 (Context)

- `Engineering_PRD.md`의 관련 항목 명시

## 3. 원자 단위 작업 리스트 (Atomic Tasklist)

- 작업 항목 1
- 작업 항목 2

## 4. 성공 기준 (Definition of Done)

- 작업 완료를 판단할 구체적인 기준 명시
```

## 4. Pull Request Template

```jsx
PR 제목 `type: PR 내용 요약`

1. 작업 내용 (Summary)
• 이번 PR에서 변경된 핵심 내용을 요약합니다.

2. 관련 이슈 (Related Issues)
• 관련 이슈: - #이슈번호

3. 주요 변경 사항 (Key Changes)
• 기술적 변경 사항 

• UI/UX 변경 사항 

4. 리뷰 포인트 (Review Points)
• 리뷰어가 중점적으로 봐주었으면 하는 부분

5. 체크리스트 (Checklist)
• `git_rules.md`를 준수했는가?

• 관련 테스트를 완료했는가?

• 브랜치 전략에 부합하는가?

```