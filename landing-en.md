---
layout: home
titleTemplate: false
hero:
  name: Aura3D
  text: A lightweight, high-performance and extensible Avalonia 3D control library
  tagline: Scenes, models, animation, particles and instancing out of the box, a fully replaceable render pipeline, one codebase across desktop, mobile and the browser
  actions:
    - theme: brand
      text: English Docs
      link: /en/home
    - theme: alt
      text: 中文文档
      link: /home
features:
  - title: Replaceable Render Pipelines
    details: Blinn-Phong forward by default, with PBR (forward and deferred) and cel shading built in; compose custom pipelines from RenderPasses without touching VAO/VBO.
  - title: Scene Graph & Model Loading
    details: Node tree with transform inheritance, native glTF/GLB, 50+ more formats (FBX, OBJ, …) via Assimp; built-in geometries and triangle-precise click picking.
  - title: Lighting & Shadows
    details: Directional / point / spot lights, automatic CSM cascaded shadows for the main directional light, HDR environment maps and IBL.
  - title: Animation & Particles
    details: Skeletal animation, 2D blend spaces and condition state machines with manual bone control; emitter-based particle system with mesh particles and flipbooks.
  - title: High-Performance Rendering
    details: InstancedMesh GPU instancing and HISM hierarchical instance groups (incremental updates, auto-grouping), octree spatial index and frustum culling.
  - title: One Codebase, Every Platform
    details: Windows / Linux / macOS / Android / iOS / browser (WebAssembly), targeting .NET 8+ — desktop GL, WebGL2 and iOS ANGLE(Metal) converge behind one GLES 3.0 API.
---
