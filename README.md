# 毛孩档案 App MVP

一个移动端优先的流浪猫狗图文档案 App，用来安全记录附近流浪动物的出现、喂养、健康、绝育、救助和送养过程。也支持记录自家宠物，但核心场景是流浪动物。

产品一句话定位：

> 给每只流浪毛孩建立一个安全档案，可以持续追踪，也可以分享给可信的人一起更新。

本产品不做宠物版小红书，不做公开宠物订阅平台，不做公开附近流浪动物地图。

## 在线预览

- [PawLog MVP on GitHub Pages](https://zhigangzhuang.github.io/pawlog-mvp/)

## 当前版本

这是一个纯前端 Web MVP。

技术栈：

- React
- TypeScript
- Tailwind CSS
- Vite
- localStorage
- mock data

## 核心体验

底部导航：

```text
首页 ｜ 图鉴 ｜ + ｜ 地图 ｜ 我的
```

页面职责：

- 首页：优先看我记录或可协作记录的流浪猫狗动态
- 图鉴：搜索、分类、筛选所有我能看到的流浪动物和辅助宠物档案
- +：发动态、新建毛孩
- 地图：我的记录地点，流浪动物默认模糊
- 我的：数据、共享权限、工具和设置

当前支持：

- 首页流浪猫狗优先的图文动态流
- 动态详情
- 流浪动物长期主页
- 图鉴
- 发动态
- 多动物动态
- 动物关系
- 送养/转交后的持续记录
- 分享给我的 / 允许我记录
- 出现、喂养、健康观察、TNR、救助、可领养状态
- 流浪动物位置保护
- 自家宠物辅助记录
- 120+ 条 mock 动态和 40+ 只 mock 毛孩

## 文档入口

产品和开发规则已经拆到 `docs/`：

- [PRD.md](docs/PRD.md)：产品定位、核心对象、功能范围
- [UX_RULES.md](docs/UX_RULES.md)：不可轻易违背的交互规则
- [DATA_MODEL.md](docs/DATA_MODEL.md)：核心数据模型
- [PRIVACY_RULES.md](docs/PRIVACY_RULES.md)：流浪动物和分享隐私红线
- [ROADMAP.md](docs/ROADMAP.md)：版本规划
- [QA_CHECKLIST.md](docs/QA_CHECKLIST.md)：手工验收清单
- [MOBILE_QA_REPORT.md](docs/MOBILE_QA_REPORT.md)：线上移动端验收记录
- [CHANGELOG.md](docs/CHANGELOG.md)：明显改动记录
- [design/README.md](design/README.md)：设计管理说明
- [ui-board.html](design/ui-board.html)：本地 UI 设计看板

后续开发新功能前，请先检查：

```text
docs/PRD.md
docs/UX_RULES.md
docs/DATA_MODEL.md
docs/PRIVACY_RULES.md
```

如果新功能和这些规则冲突，优先遵守 docs 中的产品规则。

## 运行项目

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev -- --port 5300
```

打开：

```text
http://localhost:5300/
```

构建检查：

```bash
npm run build
```

## 目录结构

```text
README.md
docs/
  PRD.md
  UX_RULES.md
  DATA_MODEL.md
  PRIVACY_RULES.md
  ROADMAP.md
  CHANGELOG.md
design/
  figma-link.md
src/
  App.tsx
  types.ts
  data/
  utils/
  components/
  pages/
```

## 当前非目标

MVP 暂不包含：

- 真实登录
- 真实地图 API
- 真实图片上传
- 实时协作
- 公开社区
- 宠物订阅 / 粉丝系统
- 陌生宠物推荐 / 热门榜
- 复杂宠物健康管理
- 宠物网红主页
- AI 识别
