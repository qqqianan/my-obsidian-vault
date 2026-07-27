# OSRM Kubernetes 生产方案

## NFS 目录

NFS_PATH/
├── sources/<version>/combined.osm.pbf
├── versions/<version>/combined.osrm.*
└── current -> versions/<version>

## 首次部署

1. 修改 `NFS_SERVER` 和 `NFS_PATH`。
2. 修改 `OSM_PBF_URL`。
3. `kubectl apply -f osrm-production.yaml`
4. 手动触发第一次地图构建：

```bash
kubectl create job --from=cronjob/osrm-map-refresh osrm-map-refresh-initial -n fleet-system
```

5. 查看构建日志：

```bash
kubectl logs -f job/osrm-map-refresh-initial -n fleet-system -c osrm-builder
```

6. 查看发布结果：

```bash
kubectl rollout status deployment/osrm-backend -n fleet-system
```

## 回滚

在挂载 NFS 的管理机上：

```bash
cd NFS_PATH
ln -sfn versions/<old-version> current.rollback
mv -Tf current.rollback current
```

然后触发 Deployment 滚动更新：

```bash
kubectl patch deployment osrm-backend -n fleet-system --type=strategic \
  -p '{"spec":{"template":{"metadata":{"annotations":{"fleet-system/map-version":"<old-version>-rollback"}}}}}'
```

## 生产建议

- 不在 `/data/current` 原地构建。
- 新版本先构建、`--trial` 校验，成功后再切换 symlink。
- `maxUnavailable: 0`，新 Pod 不 Ready 时旧 Pod 继续服务。
- NFS 自身仍需要 HA、快照和备份。
- OSRM 和辅助镜像上线前锁定 digest。
- 大区域地图必须根据真实构建峰值重新设置 CPU/内存。
