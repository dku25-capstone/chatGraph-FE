유틸리티/ 공통 코드 - 외부 호출

# 역할

- 외부 API나 DB 연결 역할만
- lib에서 제공하는 유틸리티 함수를 services 에서 활용하는 구조
- fetch 함수, axios, 외부 API 요청 전송 등

# 컴포넌트

- `openai.ts`: OpenAI API 요청 유틸
- `neo4j.ts`: Neo4j 연결 및 쿼리 함수
- `auth.ts`: 인증 관련 라이브러리(JWT 등)
