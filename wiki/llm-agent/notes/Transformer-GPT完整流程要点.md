# Transformer / GPT 完整流程要点

## 核心判断

这份材料最适合拿来建立一个“从输入文字到下一个 token 生成”的整体心智模型。它把 GPT 解释成一条连续流水线，而不是一堆互相割裂的术语。

## 四个最值得记住的点

- GPT 的基本工作方式是“基于当前前缀预测下一个 token”，不是一次性生成整段答案。
- Attention 的关键不是“所有词互相看一遍”，而是先决定看谁，再决定拿什么。
- 每层 Transformer 不是推倒重来，而是在 residual 主干上不断叠加来自上下文和 MLP 的修正量。
- 真正让在线推理可用的，不只是模型结构本身，还有 [[llm-agent/concepts/KV Cache与Prefix Cache|KV Cache]]、prefix 复用和 batching 这些工程机制。

## 一个适合教学的讲解顺序

1. [[llm-agent/concepts/Transformer推理流程|先讲完整推理主线]]，让人知道输入如何一步步变成输出。
2. [[llm-agent/concepts/Attention中的QKV|再讲 Q/K/V]]，解释 attention 为什么能从上下文里取到相关信息。
3. [[llm-agent/concepts/KV Cache与Prefix Cache|再讲缓存机制]]，解释为什么自回归推理在工程上还能跑得动。
4. [[llm-agent/concepts/推理吞吐优化|最后讲吞吐优化]]，把 batching、多 GPU 和缓存压缩连到线上服务问题上。

## 这份材料的边界

原文虽然在开头提到了“训练流程”，但主体实际讲的是推理链路与推理性能优化。关于训练，只点到了“这些矩阵和分工是训练学出来的”。如果后续要补全完整知识链，还需要单独沉淀预训练目标、反向传播、优化器、SFT、RLHF 或其他对齐阶段材料。

## 一句话总结

这份总结的核心价值，是把“GPT 为什么能生成、为什么一 token 一 token 生成、为什么推理需要缓存和 batching”讲成了一条能复述出来的主线。

## 相关页面

- [[llm-agent/sources/2026-08-14-Transformer-GPT完整流程总结|2026-08-14 Transformer / GPT 完整流程总结]]
- [[llm-agent/concepts/Transformer推理流程|Transformer推理流程]]
- [[llm-agent/concepts/Attention中的QKV|Attention中的QKV]]
- [[llm-agent/concepts/KV Cache与Prefix Cache|KV Cache与Prefix Cache]]
- [[llm-agent/concepts/推理吞吐优化|推理吞吐优化]]
- [[llm-agent/maps/Transformer与GPT基础|Transformer与GPT基础]]
