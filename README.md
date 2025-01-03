# SwaggerToNotion

**Swagger to Notion: Automated API Documentation**

Swagger에서 제공하는 API 명세를 **Notion 데이터베이스**에 자동으로 정리해주는 프로그램입니다.  
Swagger 데이터를 파싱하여 Notion에 새로운 데이터베이스를 생성하고 최신화된 API 명세를 손쉽게 관리할 수 있도록 지원합니다.  
node의 `swagger-ui-express`, **Spring 기반 Swagger**(`v3/api-docs`)에서 가능합니다.

---

## 주요 기능

1. **Notion과 자동 연동**  
   - Swagger에서 추출한 API 명세를 바탕으로 Notion 데이터베이스를 생성하고 내용을 채웁니다.

2. **상세한 API 문서화**  
   - 각 API 엔드포인트의 주요 정보를 Notion에 기록:
     - **Description**: API의 목적과 요약.
     - **Path**: API 엔드포인트 경로.
     - **Method**: HTTP 메서드(GET, POST 등).
     - **Request Body**: 요청 본문 스키마와 세부 정보(`$ref` 처리 포함).
     - **Responses**: 응답 상태 코드 및 스키마.

3. **동적 태그 지원**  
   - Swagger에서 추출한 태그(예: `User`, `Auth` 등)를 자동으로 추가하고, 태그별로 시각적으로 구분.

4. **Spring Swagger 지원**  
   - Spring의 Swagger 명세(`v3/api-docs`)를 처리하여 Spring 기반 프로젝트에서도 활용 가능합니다.

---

## 작동 방식

1. Swagger 명세를 지정된 서버 URL에서 가져옵니다.
2. Notion 데이터베이스를 생성합니다.
3. 각 API 엔드포인트의 세부 정보를 데이터베이스에 추가하고, 요청/응답 스키마는 하위 블록으로 기록합니다.

---

## 사용 방법

스웨거를 추출할 서버가 켜져 있어야합니다.

### 1. 저장소 클론
```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. 환경 변수 설정 (`.env`)
`.env` 파일에 아래 정보를 입력하세요:
```
NOTION_API_KEY=<YOUR_NOTION_INTEGRATION_KEY>
NOTION_PARENT_PAGE_ID=<YOUR_PARENT_PAGE_ID>
SWAGGER_URL=http://localhost:3000/
```

또는 파일에 직접 입력하셔도 됩니다
**⚠️ 중요**: 직접 입력시 `SWAGGER_URL`은 반드시 `/`로 끝나야 합니다.

### 3. 의존성 설치
```bash
npm install
```

### 4. 스크립트 실행
```bash
node SwaggerToNotion.js
```

---

## 요구 사항
- Node.js 18 이상 (또는 `node-fetch`를 추가로 설치)
- Notion 통합 설정 및 권한 공유
- Swagger 명세 파일 제공 (`swagger-ui-express` 또는 `v3/api-docs`)

---
### **문의**
프로그램 사용 중 문의 사항이 있거나 개선 아이디어가 있다면 이슈를 생성해주세요! 😊