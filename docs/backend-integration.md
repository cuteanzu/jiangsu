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

- `authApi.sendCode`：`POST /api/auth/send-code`
- `authApi.login`：`POST /api/auth/login`
- `authApi.register`：`POST /api/auth/register`
- `authApi.me`：`GET /api/auth/me`
- `authApi.updateProfile`：`PUT /api/auth/profile`
- `authApi.resetPassword`：`POST /api/auth/reset-password`
- `authApi.refresh`：`POST /api/auth/refresh`
- `authApi.logout`：`POST /api/auth/logout`
- `schoolsApi.listUniversities`：`GET /api/schools/universities`
- `schoolsApi.search`：`GET /api/schools`
- `schoolsApi.detail`：`GET /api/schools/{id}`
- `schoolsApi.hot`：`GET /api/schools/hot`
- `citiesApi.list`：`GET /api/cities/profiles`
- `contentApi.experiences`：`GET /api/experiences`
- `contentApi.qa`：`GET /api/qa`
- `userApi.favorites`：`GET /api/user/favorites`
- `userApi.addFavorite`：`POST /api/user/favorites/{schoolId}`
- `userApi.removeFavorite`：`DELETE /api/user/favorites/{schoolId}`
- `userApi.submissions`：`GET /api/user/submissions`
- `userApi.createSubmission`：`POST /api/submissions`

## 账号与内容闭环

1. 游客可浏览地图、经验和问答。
2. 用户通过邮箱验证码注册，之后可用用户名或邮箱登录。
3. 忘记密码走邮箱验证码重置。
4. 地图学校卡片可收藏，未登录时进入登录页。
5. 个人中心读取当前用户、收藏学校和投稿记录。
6. 个人中心可提交校园经验、问答线索、数据纠错和功能建议，后端返回审核状态。
7. 校园经验页和问答页优先读取后端内容；接口失败或数据库为空时展示本地精选兜底。

## 后续数据工作

1. 把 `jiangsu_universities.csv` 的学校与生活字段导入后端数据库。
2. 把初始校园经验和问答内容导入 `experience`、`qa_entry` 等表。
3. 管理后台审核投稿，通过后再进入公开经验和问答。
4. 后续可以把经验、问答详情页做成独立路由，方便搜索引擎收录。

部署服务器时参考 [deployment.md](deployment.md)。
