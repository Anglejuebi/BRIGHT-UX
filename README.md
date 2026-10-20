# BRIGHT-UX

BRIGHT 智能阅片系统的中文宣传页。零构建静态站点，部署在 GitHub Pages。

**部署目标**：https://anglejuebi.github.io/BRIGHT-UX/（仓库创建并推送后生效）

---

## 这是什么

一个以真实系统界面为主体的单页站点，按「产品概览 → 阅片与对照 → 结果图层 → 标注工作流 → 上传与流转 → 团队管理 → 开始使用」组织。页面是纯 HTML / CSS / 原生 ES Module JavaScript，没有框架、没有构建步骤，也没有后端。

页面里的截图来自 BRIGHT 系统实拍，已做像素级匿名化；虚拟 IHC、虚拟热图在页面和界面里都明确标注为「虚拟示意 / 模拟展示」，不作为模型预测或临床结论宣传。

## 目录

~~~text
site/
  index.html                 七段式单页
  favicon.svg
  .nojekyll                  GitHub Pages 原样发布
  assets/
    css/main.css             设计系统、响应式、动效降级
    js/config.js             系统入口地址（唯一运行时配置）
    js/app.js                导航、标签页、对比滑块、热点、灯箱、粒子、动效开关
    img/                     已匿名化的 WebP 截图、对比裁切、OG 图
.github/workflows/
  deploy-pages.yml           push 到 main 后自动发布 site/
ASSETS.md                    每张图的来源、裁切与匿名化记录
~~~

## 本地预览

在仓库根目录执行：

~~~bash
python3 -m http.server 4173 -d site
~~~

然后打开 http://localhost:4173/ 。不要直接双击 index.html：ES Module 和相对路径在 file:// 下行为不一致。

## 修改系统入口

所有「进入系统 / 进入 BRIGHT」按钮都读取 site/assets/js/config.js：

~~~js
window.BRIGHT_CONFIG = {
  appUrl: "http://192.168.20.43:8081/"
};
~~~

改这一处即可，不要在各个组件里分别硬编码。HTML 里的内网地址只是无 JavaScript 时的兜底。

## 部署

仓库已配置 .github/workflows/deploy-pages.yml：

1. push 到 main；
2. GitHub → Settings → Pages → Source 选择 **GitHub Actions**（工作流里的 actions/configure-pages 带 enablement: true，通常会自动开启）；
3. 等待 Actions 里的 Deploy BRIGHT-UX to GitHub Pages 完成；
4. 打开 https://anglejuebi.github.io/BRIGHT-UX/ 。

如果 Pages 没有自动开启，在仓库 Settings → Pages 手动把 Source 设为 GitHub Actions，再重新运行一次工作流。仓库需要是 public 才能使用免费的 GitHub Pages（private 仓库的 Pages 取决于账户计划）。

## 设计与内容约束

- 白底、浅粉、学术感；桌面内容宽度上限 1240px；正文 16–18px / 1.7。
- 七个章节；导航为「产品概览｜阅片与对照｜标注工作流｜团队管理｜进入系统」。
- 同一场景的结果图层才用标签切换：分割标注 / 虚拟 IHC / 虚拟热图都来自 314 切片的 0.2X 同一视野。
- 「全局概览 / 局部视野」是两张真实截图，明确说明不是连续缩放动画。
- 对比滑块使用同一张 5.2X 截图的左右裁切，标注为静态截图演示。
- 上传章节的热点最多同时展开一个；页面不提供上传表单，不会提交任何文件。
- 标注章节使用只读草稿预览与真实工具栏；不宣称页面里发生了实时标注。
- 团队章节只写截图能支持的内容；XML / GeoJSON / TIF 注明「以系统配置为准」。
- 不虚构准确率、速度、机构背书、论文、合作方、联系邮箱。
- 截图中的患者/病例标识、用户名、管理员账号已在像素层面替换；任务与标注管理截图中的病例条形码、切片与轮次记录也改为演示标签；原始未脱敏文件不进入本仓库。
- 支持键盘操作、prefers-reduced-motion、页脚「动态效果」开关；粒子画布仅装饰，不接收点击。

## 资产

逐张图的来源、裁切坐标与匿名化说明见 [ASSETS.md](ASSETS.md)。原始素材包不随仓库发布。
