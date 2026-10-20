# 发布资产清单

本页只使用 BRIGHT 系统真实界面截图。原始素材包中的文件标记为 public_ready: false，因此在进入本站前做了**像素级**匿名化：患者 ID、用户名、管理员账号、内部编号被替换或裁切，而不是靠 CSS 遮挡。

所有图片位于 site/assets/img/，统一转为 WebP（OG 图除外）。原始截图尺寸均为 1440×900。

## 页面用图

| 发布文件 | 尺寸 | 来源 | 处理 |
| --- | --- | --- | --- |
| bright-reading-detail.webp / -960.webp | 1440×900 / 960×600 | reading-detail.png | 患者 ID → DEMO-2410-HE；底部用户名 → 演示用户 |
| bright-reading-overview.webp / -960.webp | 1440×900 / 960×600 | reading-mask.png | 患者 ID → DEMO-2410-HE；用户名 → 演示用户 |
| bright-virtual-ihc.webp / -960.webp | 1440×900 / 960×600 | virtual-ihc.png | 同上；保留界面中的「虚拟 IHC」标签 |
| bright-virtual-heatmap.webp / -960.webp | 1440×900 / 960×600 | virtual-heatmap.png | 同上；保留界面中的「虚拟热图」标签 |
| bright-draft-preview.webp / -960.webp | 1440×900 / 960×600 | draft-preview.png | 侧栏 TCGA 块 → TCGA-DEMO-01Z-00 / DX-DEMO-0000-0000；序列号 → S-DEMO-0001；工具栏与底部 admin → 管理员 |
| bright-upload-workflow.webp / -800.webp | 1104×884 / 800×641 | upload-private.png | 裁切 (168, 0, 1272, 884)；两行患者 ID → DEMO-2410-HE / DEMO-2411-HE；序列号 → S-DEMO-0001/0002 |
| bright-task-management.webp / -960.webp | 1440×740 / 960×493 | admin-tasks.png | 裁切 y=90..830，去掉顶部管理员条；用户列表与表格用户名 → 演示用户A/B/C；病例/切片/轮次 → 演示切片、DEMO-SLIDE、demo-round |
| bright-annotation-results.webp / -960.webp | 1440×760 / 960×507 | annotation-management.png | 裁切 y=90..850；表格用户名 → 演示用户A/B/C；病例/切片/记录 → DEMO-CASE、demo-record |
| bright-annotation-toolbar.webp | 1176×56 | annotation-workspace-reference.png | 裁切工具栏 (264, 0, 1440, 56)；只作真实控件展示，空工作区不作为标注成果 |
| bright-compare-original.webp | 579×777 | reading-detail.png | 同一 5.2X 视野左侧裁切 (265, 57, 579, 777) |
| bright-compare-segmentation.webp | 579×777 | reading-detail.png | 同一 5.2X 视野右侧裁切 (852, 57, 579, 777) |
| og-bright.jpg | 1200×630 | 页面截图合成 | 社交分享卡片；含 DEMO-2410-HE 演示数据 |

-960 / -800 是响应式副图，只改变尺寸，不改变内容。

## 未使用的源图

- focus-view.png：独立的私有聚焦视野，与主叙事不是同一场景，未用于「同场景切换」。
- annotation-workspace-reference.png：空标注工作区，只取工具栏局部；不用它宣称标注成果。
- 其余源图仅作为核对底稿，不进入发布目录。

## 匿名化核对

- 患者 ID：201817499-3,4-HE → DEMO-2410-HE；201909689-5,6-HE → DEMO-2410-HE（0.2X 场景）；上传记录第二行 → DEMO-2411-HE。
- 用户名：jingqi → 演示用户 / 演示用户A；test / test1 → 演示用户B / 演示用户C。
- 管理员：admin → 管理员。
- 病历/病例记录：任务分配与标注管理截图中的 TCGA 条形码、切片哈希、轮次哈希统一替换为演示切片 01–05、DEMO-CASE / DEMO-SLIDE / demo-record；发布图中不保留原始条形码或记录哈希。
- 核对方式：对替换区域逐张放大检查，确认字体、底色、行高与周围一致；表格行一度出现偏移，已重绘并复查。
- 顶部含管理员账号的横幅已整段裁掉；原始 source 和未匿名化素材只保留在 _unpack，不进入 site/。

## 发布口径

- 虚拟 IHC、虚拟热图 = 虚拟示意 / 模拟展示，不是模型预测结论。
- 对比滑块 = 静态截图演示，不是实时联动。
- 截图 = 系统界面实录；演示数据已匿名化。
- 不出现准确率、速度、机构、论文、联系方式等未经证实的信息。
- 版本号：V0.3.1-261019。
