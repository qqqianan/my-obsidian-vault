# Attention中的QKV

## 定义

在 attention 里，每个 token 的当前表示会经过线性变换，生成 Q、K、V 三类向量。一个实用的理解方式是：Q 表示“我现在想找什么信息”，K 表示“别人应该通过什么特征找到我”，V 表示“如果别人关注我，我真正提供什么信息”。

## 工作方式

attention 的核心可以分成三步：

1. 用当前 token 的 Q 和历史 token 的 K 做匹配，得到相关性分数。
2. 对分数做 softmax，得到应该关注每个历史 token 的比例。
3. 用这些比例对历史 token 的 V 做加权求和，形成当前 head 的输出。

可以浓缩成一句话：Q/K 决定看谁，V 决定拿什么。

## 为什么重要

这个分工解释了 attention 为什么不是“把所有上下文平均混在一起”。它会先做选择，再做提取。也正因为如此，attention 才能在“苹果发布了新款”这样的上下文里，把“苹果”从水果逐步收敛到公司语义。

## 和多头机制的关系

真实模型中并不是一个 Q/K/V 系统，而是多个 attention head 并行工作。每个 head 会在自己的子空间里学习不同的关注模式，最后再拼接并投影回主干 hidden state。把不同 head 想成“从不同角度看同一段上下文”是一个不错的入门理解，但不应机械地认为每个 head 永远绑定某个固定功能。

## 边界

Q/K/V 的功能分工是一种解释框架，不是训练时人工硬编码的角色说明。真正的参数是通过训练从数据里学出来的，因此具体 head 的行为会随模型、层数和任务而变化。

## 相关来源

- [[llm-agent/sources/2026-08-14-Transformer-GPT完整流程总结|2026-08-14 Transformer / GPT 完整流程总结]]

## 相关概念

- [[llm-agent/concepts/Transformer推理流程|Transformer推理流程]]
- [[llm-agent/concepts/KV Cache与Prefix Cache|KV Cache与Prefix Cache]]
- [[llm-agent/notes/Transformer-GPT完整流程要点|Transformer / GPT 完整流程要点]]
- [[llm-agent/maps/Transformer与GPT基础|Transformer与GPT基础]]
