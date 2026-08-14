# Transformer与GPT基础

这个主题地图汇总与 Transformer / GPT 基础机制相关的页面，重点覆盖推理主线、attention 工作方式，以及推理阶段的缓存和吞吐优化。

## 核心问题

- 文本是如何一步步变成下一个 token 的？
- Q/K/V 在 attention 里分别承担什么作用？
- 为什么 GPT 必须一 token 一 token 地生成？
- 为什么 KV Cache、Prefix Cache 和 batching 会直接决定线上推理体验？

## 推荐阅读顺序

1. [[llm-agent/notes/Transformer-GPT完整流程要点|Transformer / GPT 完整流程要点]]
2. [[llm-agent/concepts/Transformer推理流程|Transformer推理流程]]
3. [[llm-agent/concepts/Attention中的QKV|Attention中的QKV]]
4. [[llm-agent/concepts/KV Cache与Prefix Cache|KV Cache与Prefix Cache]]
5. [[llm-agent/concepts/推理吞吐优化|推理吞吐优化]]

## 来源

- [[llm-agent/sources/2026-08-14-Transformer-GPT完整流程总结|2026-08-14 Transformer / GPT 完整流程总结]]
