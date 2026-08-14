# KV Cache与Prefix Cache

## 定义

KV Cache 是自回归推理中对历史 token 的 K/V 表示做缓存的机制。因为生成新 token 时，历史 K/V 会被反复使用，而历史 Q 通常不会再参与未来位置的计算，所以工程上缓存的是 K/V，而不是完整的 Q/K/V。

Prefix Cache 则是更进一步的前缀复用：当两个请求拥有完全相同的前缀时，这段前缀在各层产生的 K/V 可以直接复用，不需要再次计算。

## 为什么能成立

GPT 使用 causal attention。序列中前面的 token 在计算时看不到未来 token，因此相同前缀在不同请求里产生的历史 K/V 结果是一致的。只要前缀完全相同，这部分缓存就可以命中。

## 现实意义

- 降低重复计算：生成越长，缓存越重要。
- 降低单次延迟：新 token 只需计算自身表示并读取历史缓存。
- 提高吞吐：同样显存条件下可以承载更多活跃请求。
- 支撑长上下文：没有缓存时，自回归推理的成本会更难接受。

## 设计边界

- KV Cache 会显著占用显存，层数、head 数、上下文长度和并发数都会推高缓存体积。
- Prefix Cache 只有在“前缀完全一致”时才好命中，不是零散 token 级的任意复用。
- 更激进的优化会尝试压缩缓存表示，例如来源中提到的 MLA，把完整 K/V 换成更小的 latent 表示，以换取更低显存和更高并发。

## 相关来源

- [[llm-agent/sources/2026-08-14-Transformer-GPT完整流程总结|2026-08-14 Transformer / GPT 完整流程总结]]

## 相关概念

- [[llm-agent/concepts/Transformer推理流程|Transformer推理流程]]
- [[llm-agent/concepts/推理吞吐优化|推理吞吐优化]]
- [[llm-agent/notes/Transformer-GPT完整流程要点|Transformer / GPT 完整流程要点]]
- [[llm-agent/maps/Transformer与GPT基础|Transformer与GPT基础]]
