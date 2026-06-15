# NodePort区域对照

## 定义

NodePort 区域对照是把同一 K8s 服务在不同海外区域的 NodePort 端口放在同一张表中，方便发布、联调和排查时快速定位访问入口。

## 当前资料中的区域

- 俄罗斯
- 沙特
- 东南亚
- 南非

## 当前资料中的 NodePort 服务

- `gateway-server-svc`
- `jackfish-gateway-svc`
- `modular-provider-svc`
- `open-server-svc`
- `smartlink-xxl-job-admin-svc`

其余服务多为 ClusterIP，仅集群内访问。

## 使用方式

先按服务名确定目标服务，再按区域查找对应 NodePort。南非 Node 访问示例可以作为访问方式参考，但实际访问应按当前环境 NodePort 替换。

## 相关概念

- [[overseas-telematics/concepts/K8s多区域服务暴露|K8s多区域服务暴露]]
- [[overseas-telematics/concepts/UAT快速访问入口|UAT快速访问入口]]

## 相关来源

- [[overseas-telematics/sources/2026-06-13-smartlink-page-15127897|UAT 环境快速访问]]

