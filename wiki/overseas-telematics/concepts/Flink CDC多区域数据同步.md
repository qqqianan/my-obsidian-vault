# Flink CDC多区域数据同步

## 定义

Flink CDC 多区域数据同步是指在同一套 Flink CDC 部署中，按海外业务区域组织和启动不同数据同步任务。当前资料覆盖的区域包括南非、俄罗斯、东南亚和沙特。

## 为什么需要多区域组织

海外车联网业务天然存在区域差异，数据链路、配置、发布节奏和排查范围都可能按区域拆分。把 Flink CDC Job 按区域组织，可以让常规发布以区域为单位启动，同时保留单 Job 调试能力。

## 任务类型

- [[overseas-telematics/concepts/StarRocks同步|StarRocks同步]]：面向 StarRocks 的数据同步任务。
- [[overseas-telematics/concepts/Fleet同步|Fleet同步]]：面向 Fleet 业务系统的数据同步任务。

两类任务都涉及 car、device、fleet、relation 等数据对象。

## 相关操作

- 常规发布：使用 [[overseas-telematics/concepts/区域级Flink Job启动|区域级Flink Job启动]]。
- 单任务调试：使用 `flink_app.py` 对指定 Job 目录执行 `start`。

## 相关来源

- [[overseas-telematics/sources/2026-06-13-smartlink-page-15127893|UAT 环境 Flink CDC 数据同步笔记]]

