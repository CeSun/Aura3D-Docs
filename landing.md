---
layout: home
titleTemplate: false
hero:
  name: Aura3D
  text: 轻量级、高性能、可扩展的 Avalonia 3D 控件库
  tagline: 场景、模型、动画、粒子、实例化开箱即用，渲染管线可整体替换，一套代码覆盖桌面 / 移动 / 浏览器
  actions:
    - theme: brand
      text: 中文文档
      link: /home
    - theme: alt
      text: English Docs
      link: /en/home
features:
  - title: 可替换渲染管线
    details: 默认 Blinn-Phong 前向管线，内置 PBR（前向 / 延迟）与卡通渲染；RenderPass 自由组合出自定义管线，不必直接面对 VAO/VBO。
  - title: 场景图与模型加载
    details: 节点树与变换继承，glTF/GLB 原生支持，FBX / OBJ 等 50+ 格式经 Assimp 导入；内置几何体，三角形级点击拾取。
  - title: 光照与阴影
    details: 方向光 / 点光 / 聚光三类光源，主方向光自动 CSM 级联阴影，HDR 环境贴图与 IBL 环境光。
  - title: 动画与粒子
    details: 骨骼动画、2D 混合空间与条件状态机，支持骨骼手动操作；发射器式粒子系统，网格粒子与 Flipbook 序列帧。
  - title: 高性能渲染
    details: InstancedMesh GPU 实例化与 HISM 层次实例组（增量更新、自动分组），八叉树空间索引与视锥剔除。
  - title: 一套代码，多端覆盖
    details: Windows / Linux / macOS / Android / iOS / 浏览器（WebAssembly），面向 .NET 8+——桌面 GL、WebGL2、iOS ANGLE(Metal) 收敛在同一套 GLES 3.0 API 之下。
---
