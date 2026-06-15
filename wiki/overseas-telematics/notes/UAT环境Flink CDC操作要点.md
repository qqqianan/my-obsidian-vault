# UAT环境Flink CDC操作要点

## 核心结论

海外车联网 UAT 环境中的 Flink CDC 操作重点是：一套部署承载多区域任务，常规发布按区域一键启动，问题排查再退回单 Job 操作。

## 操作分层

- 区域级操作：用 `run_fleet_jobs.sh` 启动南非、俄罗斯、东南亚、沙特等区域任务。
- 单 Job 操作：用 `flink_app.py` 调试或重启单个任务。
- 环境准备：上传 JAR、切换业务用户、进入 `flink_starter`、复制配置和 JAR。
- 状态观察：通过 MRS/Yarn 运行页面确认 Job 状态。

## 关键判断

- 常规发布应优先走区域级脚本，减少手工逐条命令带来的遗漏风险。
- `flink_app.py` 更适合排查和局部重启，不应成为整区发布的主要路径。
- 多区域参数本质上是海外业务区域切分的操作入口。
- 涉及内部系统入口和口令的信息，不应沉淀为明文知识资产。

## 相关页面

- [[overseas-telematics/concepts/海外车联网UAT环境|海外车联网UAT环境]]
- [[overseas-telematics/concepts/Flink CDC多区域数据同步|Flink CDC多区域数据同步]]
- [[overseas-telematics/concepts/区域级Flink Job启动|区域级Flink Job启动]]
- [[overseas-telematics/sources/2026-06-13-smartlink-page-15127893|UAT 环境 Flink CDC 数据同步笔记]]

