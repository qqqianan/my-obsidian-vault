# 网易云音乐 NCM 转 MP3 教程

本教程适用于 macOS，使用已安装的 `ncmdump` 将 `.ncm` 文件转换为 MP3 或 FLAC。请只处理自己有权使用的音乐文件。

## 1. 检查程序

如果程序已安装到当前用户命令目录，可运行：

```bash
ncmdump --help
```

如果提示找不到命令，使用完整路径：

```bash
/Users/qianan/.local/bin/ncmdump --help
```

也可以临时把本地命令目录加入 PATH：

```bash
export PATH="$HOME/.local/bin:$PATH"
```

## 2. 转换单个文件

```bash
ncmdump "/path/to/song.ncm"
```

默认输出到原 `.ncm` 文件所在目录。路径包含中文、日文或表情符号时，用引号包住路径。

## 3. 批量转换目录

只处理当前目录：

```bash
ncmdump -d "$HOME/Music/网易云缓存"
```

递归处理所有子目录：

```bash
ncmdump -d "$HOME/Music/网易云缓存" -r
```

## 4. 指定 MP3 输出目录

```bash
mkdir -p "$HOME/Music/Converted"
ncmdump -d "$HOME/Music/网易云缓存" \
  -o "$HOME/Music/Converted" \
  -r
```

也可以转换单个文件并指定输出目录：

```bash
ncmdump "/path/to/song.ncm" -o "$HOME/Music/Converted"
```

## 5. 确认无误后删除源文件

`-m` 会在转换成功后删除原 `.ncm` 文件：

```bash
ncmdump -d "$HOME/Music/网易云缓存" \
  -o "$HOME/Music/Converted" \
  -r -m
```

建议先不加 `-m` 转换一批并检查输出，确认文件正常后再使用。

## 6. 从源码重新编译

安装依赖：

```bash
brew install taglib
```

进入源码目录并编译：

```bash
cd /Users/qianan/Projects/personel/ncmdump
cmake -DCMAKE_BUILD_TYPE=Release -B build
cmake --build build --config Release -j$(sysctl -n hw.ncpu)
```

安装到当前用户命令目录：

```bash
mkdir -p ~/.local/bin
install -m 755 build/ncmdump ~/.local/bin/ncmdump
```

如果 CMake 找不到 `CMakeLists.txt`，确认当前目录是 `/Users/qianan/Projects/personel/ncmdump`，或直接指定源码和构建目录：

```bash
cmake -S /Users/qianan/Projects/personel/ncmdump \
  -B /Users/qianan/Projects/personel/ncmdump/build \
  -DCMAKE_BUILD_TYPE=Release
```

## 7. 常用参数

| 参数 | 作用 |
|---|---|
| `-h`, `--help` | 查看帮助 |
| `-v`, `--version` | 查看版本 |
| `-d <目录>` | 批量处理目录中的 `.ncm` 文件 |
| `-r` | 配合 `-d` 递归处理子目录 |
| `-o <目录>` | 指定输出目录 |
| `-m` | 转换成功后删除原文件 |

## 8. 常见问题

- **`ncmdump: command not found`**：检查 `~/.local/bin` 是否在 PATH 中，或直接使用 `/Users/qianan/.local/bin/ncmdump`。
- **转换后没有封面**：部分网易云音乐 3.0 之后生成的 `.ncm` 文件可能不再内置封面数据，音频转换成功但没有封面；可进一步查看项目作者推荐的 `ncmdump-go` 或 GUI 版本。
- **输出格式**：工具可能输出 MP3 或 FLAC，实际格式取决于源文件及工具处理结果。

## 来源

- [[personal-memos/sources/ncmdump-使用说明|ncmdump 使用说明]]
