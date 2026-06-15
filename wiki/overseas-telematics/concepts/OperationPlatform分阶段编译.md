# OperationPlatform分阶段编译

## 定义

OperationPlatform 分阶段编译是指 `intl-OperationPlatform-new` 不能一次性全量编译，而要先安装用户中心依赖的前置模块，等用户中心和运营公共模块就绪后，再编译剩余模块。

## 第一阶段

先编译：

- `modular-common`
- `open-server`
- `open-server-api`

原因是 `smartlink-user-center` 中的 `usercenter-permission` 和 `usercenter-user` 依赖这些模块。

## 第二阶段

在 `intl-smartlink-user-center-new` 和 `intl-ykadmin-new` 就绪后，再编译：

- `auth-client`
- `modular-logging`
- `smart-team`
- `gateway-server`
- `intl-logistics`
- `modular-provider`

其中 `modular-provider` 依赖最多，适合放最后。

## 风险

如果第一阶段抢先全量编译 `intl-OperationPlatform-new`，会遇到它的其他模块反向依赖 `smartlink-user-center` 的问题，导致编译顺序打架。

## 相关概念

- [[overseas-telematics/concepts/海外项目编译链路|海外项目编译链路]]

## 相关来源

- [[overseas-telematics/sources/2026-06-13-smartlink-page-15127908|海外项目编译笔记]]

