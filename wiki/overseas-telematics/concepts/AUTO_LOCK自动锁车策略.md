# AUTO_LOCK自动锁车策略

## 定义

`AUTO_LOCK` 自动锁车策略，是全图监控锁车流程中针对本部、当地、商户等机构类型组织的自动锁车指令策略。它不是直接固定下发 `LOCK`，而是根据锁车中台当前状态决定下一步实际指令。

## 状态分支

- 已锁定 `LOCKED`：直接置为已锁定状态，`retryLockStatus = 3`。
- 使能未开启 `ENABLE_CLOSE`：实际下发 `ENABLE` 指令。
- 防控未激活 `NOT_ACTIVE`：实际下发 `ACTIVE` 指令。
- 已使能且已激活：实际下发 `LOCK` 指令。

## 关键含义

- `AUTO_LOCK` 负责把“我要锁车”的业务意图转换成当前车辆状态下可执行的下一条指令。
- 页面提示操作成功不等于车辆立即已锁定，最终仍需等待回调和 [[overseas-telematics/concepts/锁车状态回显|锁车状态回显]]。
- 如果实际下发的是 `ENABLE` 或 `ACTIVE`，后续是否继续进入 `LOCK` 需要结合策略后置动作和回调结果判断。

## 相关页面

- [[overseas-telematics/concepts/全图监控锁车流程|全图监控锁车流程]]
- [[overseas-telematics/concepts/锁车状态回显|锁车状态回显]]
- [[overseas-telematics/notes/全图监控锁车流程要点|全图监控锁车流程要点]]
- [[overseas-telematics/sources/2026-06-13-海外车联网运营平台全图监控锁车流程图|海外车联网运营平台全图监控锁车流程图]]
