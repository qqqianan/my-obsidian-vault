# 来源：OSRM Kubernetes 生产方案

## 基本信息

- 原始配置：[osrm-production.yaml](../../../raw/overseas-telematics/osrm-k8s-production/osrm-production.yaml)
- 部署说明：[README.md](../../../raw/overseas-telematics/osrm-k8s-production/README.md)
- 类型：Kubernetes 部署模板与架构说明
- 来源：用户提供的本地文件及配套说明
- 资料日期：2026-07-27
- 整理日期：2026-07-27
- 所属领域：[[overseas-telematics/首页|海外车联网知识库]]
- 状态：已整理，生产候选模板

## 内容摘要

该方案把 OSRM 地图预处理与在线路线服务拆分，通过 Kubernetes CronJob 定期下载 OSM PBF，按 MLD 流程执行 `osrm-extract`、`osrm-partition`、`osrm-customize`，再用 `osrm-routed --trial` 做发布前加载校验。构建产物在 NFS 上按版本保存，校验通过后原子切换 `current` 软链接，并修改 Deployment PodTemplate annotation 触发 RollingUpdate，使新 Pod 加载新地图、Ready 后再逐步替换旧 Pod。

## 关键设计

- 构建目录使用 `<version>.building`，成功后才改名为正式版本，避免半成品被在线服务读取。
- `sources/`、`versions/` 与 `current` 分离；旧版本保留，可通过切换软链接并滚动重启进行回滚。
- OSRM 运行 Pod 以只读方式挂载地图数据，只有地图构建任务拥有写权限。
- Deployment 使用 2 副本、`maxUnavailable: 0`、`maxSurge: 1` 和 PDB，降低换图期间服务中断风险。
- CronJob 使用 `concurrencyPolicy: Forbid`，避免多个定时任务重叠写入版本目录。
- PV 使用 `Retain`，但这只保留后端存储资产，不替代 NFS 自身的高可用、快照和备份。
- ServiceAccount 仅被授予目标 Deployment 的 `get`、`patch` 权限，用于成功构建后触发滚动更新。

## 默认配置

- Namespace：`fleet-system`
- OSRM 镜像：`ghcr.io/project-osrm/osrm-backend:v26.5.0`
- 默认地图源：Geofabrik 南非 latest PBF
- 调度：每天 `Asia/Singapore` 03:00
- NFS 申请容量：300 GiB，访问模式 `ReadWriteMany`
- OSRM API：集群内 `ClusterIP:5000`

## 使用前必须修改或确认

- 将 `NFS_SERVER`、`NFS_PATH` 替换为真实 NFS 参数。
- 将 `OSM_PBF_URL` 改为目标国家或区域的数据源。
- 根据实际 PBF 大小、Builder 峰值内存、运行时 RSS、QPS 和 Match 点数校准资源。
- 将 OSRM 与辅助镜像从 tag 锁定为经过验证的 digest。
- 验证 NFS 对软链接与同目录 rename 的语义，并演练发布和回滚。
- 补充版本与源文件的保留、清理、容量告警策略。
- 验证 Builder 异常终止场景；当前发布容器依赖共享文件等待结果，Builder 若被 OOMKill/SIGKILL，shell `EXIT` trap 可能来不及写失败标记。

## 来源边界

该资料给出了一套可落地的生产候选模板，但尚未包含真实 NFS 地址、目标地图范围、容量测算、压测结果、监控告警、灾备指标和故障演练记录，因此不能仅凭模板认定已达到生产验收标准。

## 外部参考

- [Project OSRM / osrm-backend](https://github.com/Project-OSRM/osrm-backend)
- [OSRM Command-Line Tools](https://project-osrm.org/docs/v26.4.0/tools)
- [Kubernetes Rolling Update](https://kubernetes.io/docs/tasks/run-application/update-deployment-rolling/)
- [Kubernetes PV Reclaim Policy](https://kubernetes.io/docs/tasks/administer-cluster/change-pv-reclaim-policy/)
- [Kubernetes CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)

## 提炼页面

- [[overseas-telematics/concepts/OSRM地图版本化发布|OSRM地图版本化发布]]
- [[overseas-telematics/notes/OSRM-Kubernetes生产部署要点|OSRM Kubernetes 生产部署要点]]
- [[overseas-telematics/maps/地图与路线服务|地图与路线服务]]
