---
title: Architecture Overview
---

# 架构概述

本章将介绍 Theia 的整体架构。

Theia 设计运行在本地桌面应用以及浏览器和远程服务器的环境中。为了一套代码支持这两种情况，Theia 运行在两个独立的进程中。这两个进程分别称为前端和后端，它们通过 WebSocket 传输 JSON-RPC 或用 HTTP 上的 REST API 进行通信。 对于 Electron 桌面应用，后端和前端都运行在本地，而浏览器和远程服务器环境中，后端将在远程主机上运行。

前端和后端进程都有各自的依赖注入 (DI) 容器（见下文），用扩展的方式为这些容器增添能力。

## 前端

前端进程指客户端，用于呈现 UI。 在浏览器中，它只用于渲染，而在 Electron 桌面上，它运行在 Electron Window 之中，它实质上是一个拥有 Electron 和 Node.js API 能力的浏览器。

因此，任何前端代码都可以将浏览器视为平台，而不是 Node.js。

前端进程的启动会首先加载完所有依赖注入（DI）模块，获得所有扩展，然后创建 `FrontendApplication` 实例，并在其上调用`start()`。

## 后端

后端进程运行在 Node.js 上， 我们使用 express 框架作为 HTTP 服务器。 在它之上，不得使用任何有关浏览器（DOM API）的代码。

后端的启动同样也会首先加载所有依赖注入（DI）的模块，获得扩展，然后创建 `BackendApplication` 实例，并在其上调用`start(portNumber)`。

默认情况下，后端的 express 服务器也用于返回前端静态代码。

## 前后台分离

在扩展的顶层文件夹中，我们用专门的文件夹进行前后台分离：

  - `common` 文件夹存放不依赖于任何前后进程的通用代码。
  - `browser` 文件夹存放以浏览器作为运行平台的代码（DOM API）。
  - `electron-browser` 文件夹存放需要 DOM API 的前端代码以及 Electron 渲染进程的特定 API 代码。
  - `node` 文件夹存放需要 Node.js 的（后端）代码。
  - `node-electron` 文件夹存放特定于 Electron 的（后端）代码。

## 参见

有关 Theia 架构的高级概述，请参阅此文档：
[Multi-Language IDE Implemented in JS - Scope and Architecture](https://docs.google.com/document/d/1aodR1LJEF_zu7xBis2MjpHRyv7JKJzW7EWI9XRYCt48)
