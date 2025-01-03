const fetch = require("node-fetch");
const { Client } = require("@notionhq/client");

require("dotenv").config();

// // 노션 개발자 키
// const notion = new Client({ auth: "" });

// // 부모 페이지 ID (데이터베이스를 생성할 위치)
// const parentPageId = ""; // Notion 페이지 ID 입력

// // 스웨거 url : /로 끝나야 합니다.
// const severUrl = "http://localhost:3000/";


// 환경 변수 읽기
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
// /로 끝나야 실행
const severUrl = process.env.SWAGGER_URL.endsWith("/")
    ? process.env.SWAGGER_URL
    : process.env.SWAGGER_URL + "/";

// 데이터베이스 생성 함수
async function createDatabase() {
    try {
        // 노션에서 데이터 베이스(표 생성)
        const response = await notion.databases.create({
            parent: { page_id: parentPageId },
            title: [
                {
                    type: "text",
                    text: { content: "API 명세서" }, // 데이터베이스 이름
                },
            ],
            // api의 속성
            properties: {
                Tags: { multi_select: {} }, // 태그 (동적으로 추가 가능)
                Description: { title: {} }, // 제목 속성
                Path: { rich_text: {} }, // 텍스트 속성
                // api 메소드
                Method: {
                    select: {
                        options: [
                            { name: "GET", color: "green" },
                            { name: "POST", color: "blue" },
                            { name: "PUT", color: "yellow" },
                            { name: "DELETE", color: "red" },
                        ],
                    },
                },
            }
        });
        
        console.log("Database created successfully:", response.id);
        return response.id; // 생성된 데이터베이스 ID 반환
    } catch (error) {
        console.error("Error creating database:", error.message);
        throw error;
    }
}

// 스웨거에서 내용을 fetch
async function fetchSwaggerDocFromJs(severUrl) {
    try {
        // 노드 스웨거 주소
        let response = await fetch(severUrl + "api-docs/swagger-ui-init.js");

        if (response.ok) {
            const scriptContent = await response.text();

            // options.swaggerDoc 파싱
            const swaggerDocMatch = scriptContent.match(/var options = ({[\s\S]*?});/);
            if (!swaggerDocMatch) {
                throw new Error("SwaggerDoc not found in the script.");
            }

            const options = JSON.parse(swaggerDocMatch[1]);
            return options.swaggerDoc;
        }

        // 스프링의 경우 v3 API
        response = await fetch(severUrl + "v3/api-docs");
        if (!response.ok) {
            throw new Error(`Failed to fetch Swagger UI: ${response.statusText}`);
        }
        return await response.json(); // 스크립트를 JSON으로 읽음
    } catch (error) {
        console.error("Error fetching or parsing SwaggerDoc:", error.message);
        throw error;
    }
}

// `$ref`를 따라가서 참조된 스키마를 가져오는 함수
function resolveSchema(schema, components) {
    if (!schema || !schema.$ref) return schema;

    const refPath = schema.$ref.replace("#/components/schemas/", "");
    const resolvedSchema = components.schemas[refPath];

    if (!resolvedSchema) {
        console.warn(`Schema not found for $ref: ${schema.$ref}`);
        return { error: `Schema not found for $ref: ${schema.$ref}` };
    }

    return resolvedSchema;
}

// 요청 파라미터와 응답 정보 형식화
function formatRequestBody(requestBody = {}, components) {
    if (!requestBody || !requestBody.content) return "No request body";

    const contentTypes = Object.keys(requestBody.content);
    const formattedBodies = contentTypes.map((type) => {
        const schema = requestBody.content[type].schema;
        const resolvedSchema = resolveSchema(schema, components);
        return `${type}:\n${JSON.stringify(resolvedSchema, null, 2)}`;
    });

    return formattedBodies.join("\n\n");
}

function formatResponses(responses = {}, components) {
    if (Object.keys(responses).length === 0) return "No responses";

    const formattedResponses = Object.entries(responses).map(([status, response]) => {
        const content = response.content || {};
        const contentTypes = Object.keys(content);
        const body = contentTypes.map((type) => {
            const schema = content[type].schema;
            const resolvedSchema = resolveSchema(schema, components);
            return `${type}:\n${JSON.stringify(resolvedSchema, null, 2)}`;
        });

        return `Status ${status}:\n${response.description || "No description"}\n${body.join("\n\n")}`;
    });

    return formattedResponses.join("\n\n");
}

// 상세 정보(요청 바디, 상태 코드)를 상위 페이지 바로 아래에 추가
async function addDetailsToPage(apiPageId, requestBody, responses) {
    try {
        await notion.blocks.children.append({
            block_id: apiPageId,
            children: [
                {
                    object: "block",
                    type: "heading_2",
                    heading_2: {
                        rich_text: [{ text: { content: "Request Body" } }],
                    },
                },
                {
                    object: "block",
                    type: "code",
                    code: {
                        rich_text: [{ text: { content: requestBody } }],
                        language: "json",
                    },
                },
                {
                    object: "block",
                    type: "heading_2",
                    heading_2: {
                        rich_text: [{ text: { content: "Responses" } }],
                    },
                },
                {
                    object: "block",
                    type: "code",
                    code: {
                        rich_text: [{ text: { content: responses } }],
                        language: "json",
                    },
                },
            ],
        });
        console.log(`Added details to API page`);
    } catch (error) {
        console.error("Error adding details to API page:", error.message);
    }
}

// 노션 데이터베이스에 API 정보 추가
async function addApiToNotion(databaseId, swaggerData) {
    const paths = swaggerData.paths || {}; // null/undefined 방지
    const components = swaggerData.components || {};

    for (const [path, methods] of Object.entries(paths)) {
        for (const [method, details] of Object.entries(methods || {})) { // null/undefined 방지
            const description = details?.summary || "No description provided";
            const requestBody = formatRequestBody(details?.requestBody, components);
            const responses = formatResponses(details?.responses, components);

            try {
                // 상위 페이지 생성
                const apiPage = await notion.pages.create({
                    parent: { database_id: databaseId },
                    properties: {
                        Tags: {
                            multi_select: details.tags?.map(tag => ({ name: tag })) || [],
                        },
                        Description: {
                            title: [{ text: { content: description } }],
                        },
                        Path: {
                            rich_text: [{ text: { content: path } }],
                        },
                        Method: {
                            select: { name: method.toUpperCase() },
                        },
                    },
                });

                console.log(`Added ${method.toUpperCase()} ${path} to Notion`);

                // 상세 정보 상위 페이지 아래에 추가
                if (apiPage.id) {
                    await addDetailsToPage(apiPage.id, requestBody, responses);
                }
            } catch (error) {
                console.error(`Failed to add ${method.toUpperCase()} ${path}:`, error.message);
            }
        }
    }
}

// 실행
(async () => {
    
    try {
        // Step 1: 데이터베이스 생성
        const databaseId = await createDatabase();

        // Step 2: Swagger 명세 가져오기
        const swaggerDoc = await fetchSwaggerDocFromJs(severUrl);

        // Step 3: 데이터베이스에 API 명세 추가
        await addApiToNotion(databaseId, swaggerDoc);
    } catch (error) {
        console.error("Error:", error.message);
    }
})();