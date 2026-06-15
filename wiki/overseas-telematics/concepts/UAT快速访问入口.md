# UAT快速访问入口

## 定义

UAT 快速访问入口是海外车联网 UAT 环境中用于快速定位后端服务、管理系统、接口文档和前端运营页面的一组访问路径。

## 当前资料覆盖的入口

- K8s 服务 NodePort 入口
- XXL 任务管理入口
- Swagger 接口文档入口
- Nacos 配置中心入口
- 国际版、俄罗斯、东南亚、沙特的运营平台和车队页面

## 设计意义

快速访问入口把分散的服务地址、端口和前端路径集中到一个页面，适合发布验证、联调排查和跨区域对照。

## 安全边界

入口页可以记录地址、用途和账号名，但明文口令应放在凭据仓库或密码管理器中，wiki 只记录 `<凭据已省略>`。

## 相关概念

- [[overseas-telematics/concepts/海外车联网UAT环境|海外车联网UAT环境]]
- [[overseas-telematics/concepts/K8s多区域服务暴露|K8s多区域服务暴露]]
- [[overseas-telematics/concepts/NodePort区域对照|NodePort区域对照]]

## 相关来源

- [[overseas-telematics/sources/2026-06-13-smartlink-page-15127897|UAT 环境快速访问]]

