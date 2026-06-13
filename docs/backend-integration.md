# 后端对接说明

这个前端已经按你的 Spring Boot 后端做了基础接入层，默认走同源 `/api`。

## 本地开发

1. 启动后端，默认端口是 `9090`。

后端是 Spring Boot 3，需要 JDK 17。先确认：

```bash
java -version
```

如果显示 `1.8`，需要先安装 JDK 17，或把 `JAVA_HOME` 临时切到 JDK 17 后再启动后端。

```bash
cd D:\项目\江苏校园指北\江苏校园指北\jiangsu-college-guide\backend
mvn spring-boot:run
```

2. 启动前端。

```bash
cd D:\项目\jiangsu
npm run dev
```

Vite 会把前端请求的 `/api/*` 代理到 `http://localhost:9090`。

## 环境变量

复制 `.env.example` 为 `.env.local` 后可按需修改：

```bash
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:9090
```

生产环境推荐仍让前端请求 `/api`，再由 Nginx、Cloudflare Worker、服务器网关或同域部署规则把 `/api` 转发到 Spring Boot 服务。

## 已封装的接口

前端服务层在 `src/services/api.ts`：

- `authApi.login`：`POST /api/auth/login`
- `authApi.register`：`POST /api/auth/register`
- `authApi.me`：`GET /api/auth/me`
- `schoolsApi.listUniversities`：`GET /api/schools/universities`
- `schoolsApi.search`：`GET /api/schools`
- `schoolsApi.detail`：`GET /api/schools/{id}`
- `schoolsApi.hot`：`GET /api/schools/hot`
- `citiesApi.list`：`GET /api/cities/profiles`
- `contentApi.experiences`：`GET /api/experiences`
- `contentApi.qa`：`GET /api/qa`

## 下一步接入顺序

1. 地图页先接 `schoolsApi.listUniversities()`，保留静态高校数据作为失败兜底。
2. 校园经验页接 `contentApi.experiences()`，把本地 mock 内容作为空数据兜底。
3. 问答页接 `contentApi.qa()`。
4. 登录页接 `authApi.login()`，个人中心接 `authApi.me()`、收藏和投稿接口。
5. 把 `jiangsu_universities.csv` 的 183 条学校与生活字段导入后端数据库，再由接口输出给前端。
