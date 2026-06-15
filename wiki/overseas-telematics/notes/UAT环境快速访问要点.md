# UAT环境快速访问要点

## 核心结论

海外车联网 UAT 环境的快速访问重点是：服务名跨区域保持一致，访问差异主要由区域 NodePort、前端域名和系统入口决定。

## 关键要点

- K8s 服务按 ClusterIP 和 NodePort 区分访问范围。
- ClusterIP 表示仅集群内访问，不直接作为外部入口。
- NodePort 服务需要结合区域端口和节点 IP 访问。
- 前端运营入口按国际版、俄罗斯、东南亚、沙特拆分。
- 南非 Node 访问示例可作为访问格式参考，但实际访问要替换为当前环境端口。
- 账号名和入口用途可以记录，明文口令不进入知识库。

## 相关页面

- [[overseas-telematics/concepts/UAT快速访问入口|UAT快速访问入口]]
- [[overseas-telematics/concepts/K8s多区域服务暴露|K8s多区域服务暴露]]
- [[overseas-telematics/concepts/NodePort区域对照|NodePort区域对照]]
- [[overseas-telematics/concepts/海外车联网UAT环境|海外车联网UAT环境]]
- [[overseas-telematics/sources/2026-06-13-smartlink-page-15127897|UAT 环境快速访问]]

