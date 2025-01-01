# SwaggerToNotion
Swagger to Notion: Automated API Documentation

Swagger에서 제공하는 API 명세를 Notion 데이터베이스에 자동으로 정리해주는 프로그램입니다.
Swagger 데이터를 파싱하여 Notion에 새로운 데이터 베이스를 생성합니다.
손쉽게 노션의 명세서에 최신화가 가능해집니다.
node.js의 스웨거 swagger-ui-express에서 사용가능합니다.

주요 기능

	1.	Notion과 자동 연동:
	•	Swagger에서 추출한 API 명세를 바탕으로 Notion 데이터베이스를 생성하고 내용을 채웁니다.
	2.	상세한 API 문서화:
	•	각 API 엔드포인트의 주요 정보를 Notion에 기록:
	•	Description: API의 목적과 요약.
	•	Path: API 엔드포인트 경로.
	•	Method: HTTP 메서드(GET, POST 등).
	•	Request Body: 요청 본문 스키마와 세부 정보($ref 처리 포함).
	•	Responses: 응답 상태 코드 및 스키마.
	3.	동적 태그 지원:
	•	Swagger에서 추출한 태그(예: User, Auth 등)를 자동으로 추가하고 시각적으로 구분.

작동 방식

	1.	Swagger 명세를 지정된 URL에서 가져옵니다.
	2.	Notion 데이터베이스를 생성합니다.
	3.	API 세부 정보를 데이터베이스에 추가하고, 요청/응답 스키마는 하위 블록으로 기록합니다.

사용 방법

	1.	저장소 클론
	2.	Notion 통합 키와 부모 페이지 ID를 설정(또는 env파일)
	3.	Swagger URL을 입력하고 스크립트를 실행