# OSRM Kubernetes 生产部署要点

## 稳定结论

OSRM 地图构建与在线服务应分离。新地图必须在独立目录完成 MLD 预处理和 `--trial` 加载校验，成功后才发布；在线 Pod 不应参与构建，也不应拥有地图写权限。

地图发布的最小安全单元不是“覆盖文件”，而是“版本目录 + 稳定入口 + 进程滚动替换”：

1. 在 `<version>.building` 构建。
2. 通过 `--trial` 后转为正式版本。
3. 原子切换 `current`。
4. 修改 PodTemplate annotation 触发 RollingUpdate。
5. 等新 Pod Ready 后再退出旧 Pod。

## 上线检查清单

- NFS 地址、导出路径、容量和访问权限已确认。
- NFS 具备 HA、快照、备份和已验证的恢复流程。
- OSM PBF 来源、覆盖范围、更新时间和下载失败策略已确认。
- OSRM、curl 等镜像已锁定 digest，并完成镜像安全扫描。
- Builder 与 Runtime 资源基于真实地图和压测结果配置。
- `current` 切换、首次发布、失败不切换和旧版本回滚均已演练。
- 监控覆盖 CronJob 成败、构建耗时、下载大小、磁盘容量、Pod 启动时长、OSRM QPS/延迟/错误率。
- 已定义 sources、失败构建目录和历史 versions 的保留及清理策略。
- 已处理 Builder OOMKill/SIGKILL 时发布容器可能持续等待的问题，例如设置 Job/Pod deadline 或采用单容器串行发布流程。
- 业务探针或合成请求能够验证 Route/Match/Table 的实际可用性；TCP 探针只能证明端口可连接。

## 回滚原则

旧版本目录必须保留。发现地图质量问题时，将 `current` 指回已知正常版本，再修改 Deployment PodTemplate 触发滚动更新。回滚完成应通过代表性路线、Match 和 Table 请求验证，而不只检查 Pod Ready。

## 容量演进

早期使用“每日下载完整 PBF + 全量重建”通常更简单可靠。区域规模扩大后，应按国家或区域拆分地图流水线、版本目录和运行服务，并基于实际请求路由选择对应实例。

## 来源与边界

稳定结论来自 [[overseas-telematics/sources/2026-07-27-OSRM-Kubernetes生产方案|OSRM Kubernetes 生产方案]]。其中资源数值、南非地图 URL 和每日 03:00 调度均为模板配置，不应视为俄罗斯或其他大区域的生产推荐值。异常终止、清理和业务探针条目是基于该模板结构补充的上线风险检查项。

## 相关页面

- [[overseas-telematics/concepts/OSRM地图版本化发布|OSRM 地图版本化发布]]
- [[overseas-telematics/maps/地图与路线服务|地图与路线服务]]
