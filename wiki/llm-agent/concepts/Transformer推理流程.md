# Transformer推理流程

## 定义

Transformer 推理流程指的是：一段文本如何经过 tokenizer、embedding、位置编码、多层 Transformer、词表投影和 sampling，最终一步步生成下一个 token 的完整链路。对 GPT 这类自回归模型来说，这个流程不是一次性生成整段文本，而是“生成一个 token，加入上下文，再重新计算下一轮”。

## 主线结构

可以把这条链路压缩成六步：

1. 文本切成 token，并映射成 token id。
2. token id 查 embedding 表，变成高维向量。
3. 位置信息加入到 attention 相关计算里，保证模型区分顺序。
4. 多层 Transformer 反复做 norm、attention、residual、MLP、residual。
5. 最后一层 hidden state 投影到词表空间，对每个候选 token 打分。
6. 通过 softmax 和 sampling 选出下一个 token，再进入下一轮。

## 为什么重要

很多关于 GPT 的误解，来自把“模型一次看完整句并一次产出完整答案”当成直觉。实际上它做的是前缀条件下的下一 token 预测。理解这一点之后，很多工程问题会自然连起来，比如为什么有 causal mask、为什么要做 [[llm-agent/concepts/KV Cache与Prefix Cache|KV Cache]]、为什么延迟会随着上下文变长而上升、为什么 prefix 复用能省大量计算。

## 关键组件的现实意义

- Tokenizer：把文字世界映射到数学世界。
- Embedding：给每个 token 一个初始表示，但此时上下文含义还不完整。
- Attention：从上下文里挑选和提取当前 token 需要的信息。
- MLP：对拿回来的信息做内部加工和模式强化。
- Residual：保留原理解，再叠加修正量，而不是推倒重来。
- Norm：控制层间数值尺度，保持深层网络稳定。
- Sampling：把词表分数变成实际生成行为。

## 一个容易忽略的边界

这条流程描述的是推理，不是完整训练。训练阶段还需要 next-token loss、反向传播、梯度更新、数据配比和对齐流程。原始来源只对“矩阵和功能分工是训练学出来的”做了点到为止的说明。

## 相关来源

- [[llm-agent/sources/2026-08-14-Transformer-GPT完整流程总结|2026-08-14 Transformer / GPT 完整流程总结]]

## 相关概念

- [[llm-agent/notes/Transformer-GPT完整流程要点|Transformer / GPT 完整流程要点]]
- [[llm-agent/concepts/Attention中的QKV|Attention中的QKV]]
- [[llm-agent/concepts/KV Cache与Prefix Cache|KV Cache与Prefix Cache]]
- [[llm-agent/concepts/推理吞吐优化|推理吞吐优化]]
- [[llm-agent/maps/Transformer与GPT基础|Transformer与GPT基础]]
