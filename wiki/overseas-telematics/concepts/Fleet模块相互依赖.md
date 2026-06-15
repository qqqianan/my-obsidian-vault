# Fleet模块相互依赖

## 定义

Fleet 模块相互依赖是指 `overseas-fleet-new` 中 `fleet-basic` 与 `fleet-report` 的 API 存在互相依赖，导致直接按普通顺序编译时可能无法一次通过。

## 推荐顺序

资料中建议 `overseas-fleet-new` 按以下顺序处理：

1. `fleet-common`
2. `fleet-dao`
3. `fleet-basic`
4. `fleet-report`

## 处理思路

如果 `fleet-basic` 和 `fleet-report` 的相互依赖阻塞编译，可以临时采用以下方式：

- 先注释其中一方相关代码。
- 临时调整一方对另一方的依赖。
- 让其中一方先编译通过后，再恢复或对齐依赖。

## 相关概念

- [[overseas-telematics/concepts/海外项目编译链路|海外项目编译链路]]

## 相关来源

- [[overseas-telematics/sources/2026-06-13-smartlink-page-15127908|海外项目编译笔记]]

