# K8s多区域服务暴露

## 定义

K8s 多区域服务暴露是指在海外车联网 UAT 环境中，不同区域使用一致的服务名，但通过不同的服务类型和端口暴露访问能力。

## 当前资料中的模式

- ClusterIP：仅集群内访问。
- NodePort：通过节点 IP 和区域端口对外访问。
- 服务名在俄罗斯、沙特、东南亚、南非之间保持一致。
- 区域差异主要体现在 NodePort 端口。

## 价值

这种模式让服务命名保持稳定，同时允许不同区域拥有独立访问端口。排查时可以先确认服务名，再按区域查找对应 NodePort。

## 相关概念

- [[overseas-telematics/concepts/NodePort区域对照|NodePort区域对照]]
- [[overseas-telematics/concepts/UAT快速访问入口|UAT快速访问入口]]
- [[overseas-telematics/concepts/海外车联网UAT环境|海外车联网UAT环境]]

## 相关来源

- [[overseas-telematics/sources/2026-06-13-smartlink-page-15127897|UAT 环境快速访问]]

