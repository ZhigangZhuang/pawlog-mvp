# 毛孩档案 App MVP

一个移动端优先的毛孩图文记录 App，用来统一记录自家宠物和附近流浪猫狗。

产品一句话定位：

> 给每只毛孩建立一个长期主页，可以私密记录，也可以分享给可信的人一起更新。

本产品不做宠物版小红书，不做公开宠物订阅平台，不做公开附近流浪动物地图。

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

- 首页：只看和我有关的毛孩动态
- 图鉴：搜索、分类、筛选所有我能看到的毛孩
- +：发动态、新建毛孩、导入照片
- 地图：我的记录地点，流浪动物默认模糊
- 我的：数据、共享权限、工具和设置

当前支持：

- 首页图文动态流
- 动态详情
- 毛孩主页
- 图鉴
- 发动态
- 多动物动态
- 动物关系
- 送养/转交后的持续记录
- 分享给我的 / 允许我记录
- 流浪动物位置保护
- 120+ 条 mock 动态和 40+ 只 mock 毛孩

## 文档入口

产品和开发规则已经拆到 `docs/`：

- [PRD.md](docs/PRD.md)：产品定位、核心对象、功能范围
- [UX_RULES.md](docs/UX_RULES.md)：不可轻易违背的交互规则
- [DATA_MODEL.md](docs/DATA_MODEL.md)：核心数据模型
- [PRIVACY_RULES.md](docs/PRIVACY_RULES.md)：流浪动物和分享隐私红线
- [ROADMAP.md](docs/ROADMAP.md)：版本规划
- [QA_CHECKLIST.md](docs/QA_CHECKLIST.md)：手工验收清单
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
- AI 识别
