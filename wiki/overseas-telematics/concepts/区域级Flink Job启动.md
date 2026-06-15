# 区域级Flink Job启动

## 定义

区域级 Flink Job 启动是指通过脚本按区域批量提交该区域所需的 Flink CDC Job，而不是逐条手工执行单个任务。

## 当前资料中的脚本

资料推荐使用 `run_fleet_jobs.sh` 作为常规发布入口。区域参数如下：

- 不传参数：南非（默认）
- `sg`：东南亚
- `sa`：沙特
- `ru`：俄罗斯

## 使用场景

- 常规发布
- 整区启停
- 避免人工遗漏某个 Job
- 保持同一区域内任务启动方式一致

## 与单 Job 启动的关系

单 Job 启动适合调试和局部重启。区域级启动适合标准发布流程。两者应明确分工，避免常规发布中过度依赖手工逐条命令。

## 相关概念

- [[overseas-telematics/concepts/Flink CDC多区域数据同步|Flink CDC多区域数据同步]]
- [[overseas-telematics/concepts/海外车联网UAT环境|海外车联网UAT环境]]

## 相关来源

- [[overseas-telematics/sources/2026-06-13-smartlink-page-15127893|UAT 环境 Flink CDC 数据同步笔记]]

