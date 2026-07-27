# OSRM 地图版本化发布

## 定义

OSRM 地图版本化发布是指：地图构建不覆盖线上正在使用的数据，而是在独立版本目录完成预处理和完整加载校验；校验通过后，只切换一个稳定入口，再通过滚动更新让新进程加载新版本。

## 标准链路

```text
OSM PBF
  -> versions/<version>.building
  -> osrm-extract
  -> osrm-partition
  -> osrm-customize
  -> osrm-routed --algorithm mld --trial
  -> versions/<version>
  -> current 软链接切换
  -> Deployment PodTemplate 更新
  -> RollingUpdate
```

## 核心不变量

- 在线进程只读取 `current` 指向的已验证正式版本。
- 构建中的 `<version>.building` 永远不对在线进程可见。
- 构建失败不改变 `current`，旧版本继续服务。
- 切换软链接不会让既有 OSRM 进程热加载地图，必须创建新 Pod。
- 新 Pod Ready 之前，旧 Pod 继续承载流量。
- 回滚是把 `current` 指回旧版本，再触发一次滚动更新。

## 存储布局

```text
NFS_PATH/
├── sources/<version>/combined.osm.pbf
├── versions/<version>/combined.osrm.*
└── current -> versions/<version>
```

`Retain` 保护的是 PV 释放后的底层数据保留语义，不等于共享存储高可用。NFS 服务仍需单独具备冗余、复制、快照、备份和恢复能力。

## 适用边界

该模式适合第一阶段按固定周期下载完整 `latest.osm.pbf` 并全量重建。国家和区域数量增加后，应考虑按国家拆分 Builder、版本和 OSRM 服务，避免所有区域合并后每晚全量重建。

## 相关页面

- [[overseas-telematics/sources/2026-07-27-OSRM-Kubernetes生产方案|OSRM Kubernetes 生产方案]]
- [[overseas-telematics/notes/OSRM-Kubernetes生产部署要点|OSRM Kubernetes 生产部署要点]]
- [[overseas-telematics/maps/地图与路线服务|地图与路线服务]]
