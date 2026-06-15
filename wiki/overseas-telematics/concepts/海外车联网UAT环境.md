# 海外车联网UAT环境

## 定义

海外车联网 UAT 环境是用于海外车联网业务联调、验证和发布前测试的环境。当前资料中，它承载 Flink CDC 数据同步任务，并按区域区分南非、俄罗斯、东南亚和沙特等业务范围。

## 特征

- 一套测试机部署承载多区域任务。
- 区域差异通过启动参数和 Job 配置目录体现。
- Flink CDC 任务用于把业务数据同步到下游系统。
- 运行状态通过 MRS/Yarn 页面观察。
- 快速访问入口按 K8s 服务、NodePort、前端域名和运营入口组织。

## 相关概念

- [[overseas-telematics/maps/UAT环境|UAT环境]]
- [[overseas-telematics/concepts/Flink CDC多区域数据同步|Flink CDC多区域数据同步]]
- [[overseas-telematics/concepts/区域级Flink Job启动|区域级Flink Job启动]]
- [[overseas-telematics/concepts/UAT快速访问入口|UAT快速访问入口]]
- [[overseas-telematics/concepts/K8s多区域服务暴露|K8s多区域服务暴露]]
- [[overseas-telematics/notes/UAT环境Flink CDC操作要点|UAT环境Flink CDC操作要点]]
- [[overseas-telematics/notes/UAT环境快速访问要点|UAT环境快速访问要点]]

## 相关来源

- [[overseas-telematics/sources/2026-06-13-smartlink-page-15127893|UAT 环境 Flink CDC 数据同步笔记]]
- [[overseas-telematics/sources/2026-06-13-smartlink-page-15127897|UAT 环境快速访问]]
