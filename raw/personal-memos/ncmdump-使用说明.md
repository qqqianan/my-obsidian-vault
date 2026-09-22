---
Title: ncmdump 使用说明（macOS）
Type: personal memo
Domain: personal-memos
Source: /Users/qianan/Projects/personel/ncmdump/ncmdump-使用说明.md
Imported: 2026-09-22
---

# ncmdump 使用说明（macOS）

`ncmdump` 用于把网易云音乐缓存文件 `.ncm` 转换为常见的 MP3 或 FLAC 文件。

> 请只转换你有权使用的音乐文件，并遵守相关平台的服务条款和版权规定。

## 一、已安装位置

本机源码目录：

```text
/Users/qianan/Projects/personel/ncmdump
```

已编译程序：

```text
/Users/qianan/.local/bin/ncmdump
```

终端中可以直接运行：

```bash
ncmdump --help
```

如果提示找不到命令，可以直接使用完整路径：

```bash
/Users/qianan/.local/bin/ncmdump --help
```

## 二、从源码重新编译

### 1. 安装依赖

```bash
brew install taglib
```

### 2. 进入正确的项目目录

必须进入 `ncmdump` 目录，因为 `CMakeLists.txt` 在这里：

```bash
cd /Users/qianan/Projects/personel/ncmdump
```

### 3. 配置和编译

```bash
cmake -DCMAKE_BUILD_TYPE=Release -B build
cmake --build build --config Release -j$(sysctl -n hw.ncpu)
```

编译完成后，程序位于：

```text
/Users/qianan/Projects/personel/ncmdump/build/ncmdump
```

如需安装到当前用户的命令目录：

```bash
mkdir -p ~/.local/bin
install -m 755 build/ncmdump ~/.local/bin/ncmdump
```

## 三、转换单个文件

```bash
ncmdump "/path/to/song.ncm"
```

转换后的 MP3 或 FLAC 默认保存在原 `.ncm` 文件所在目录。

例如：

```bash
ncmdump "$HOME/Music/网易云缓存/歌曲.ncm"
```

文件名包含中文、日文或表情符号时，可以直接使用引号包住路径。

## 四、一次转换多个文件

```bash
ncmdump "/path/to/第一首.ncm" "/path/to/第二首.ncm"
```

## 五、批量转换文件夹

转换文件夹下的 `.ncm` 文件，但不处理子文件夹：

```bash
ncmdump -d "/path/to/ncm文件夹"
```

递归处理所有子文件夹：

```bash
ncmdump -d "/path/to/ncm文件夹" -r
```

## 六、指定输出目录

把转换结果统一放到指定目录：

```bash
ncmdump -d "/path/to/ncm文件夹" -o "$HOME/Music/Converted"
```

递归转换并保留原目录结构：

```bash
ncmdump -d "/path/to/ncm文件夹" -o "$HOME/Music/Converted" -r
```

单个文件也可以指定输出目录：

```bash
ncmdump "/path/to/song.ncm" -o "$HOME/Music/Converted"
```

## 七、转换成功后删除原文件

使用 `-m` 会在文件成功转换后删除原 `.ncm` 文件：

```bash
ncmdump -d "/path/to/ncm文件夹" -o "$HOME/Music/Converted" -r -m
```

建议先不加 `-m` 测试一批文件，确认输出正常后再使用。

## 八、常用选项

| 参数 | 作用 |
|---|---|
| `-h`, `--help` | 查看帮助 |
| `-v`, `--version` | 查看版本 |
| `-d <目录>` | 批量处理目录中的 `.ncm` 文件 |
| `-r` | 配合 `-d` 递归处理子目录 |
| `-o <目录>` | 指定输出目录 |
| `-m` | 转换成功后删除原文件 |

## 九、常见报错

### `CMake Error: The source directory ... does not appear to contain CMakeLists.txt`

说明 CMake 执行目录不对。不要在 `MoneyPrinterTurbo` 目录中配置 `ncmdump`，应执行：

```bash
cd /Users/qianan/Projects/personel/ncmdump
cmake -DCMAKE_BUILD_TYPE=Release -B build
```

也可以不切换目录，直接指定源码目录和构建目录：

```bash
cmake -S /Users/qianan/Projects/personel/ncmdump \
      -B /Users/qianan/Projects/personel/ncmdump/build \
      -DCMAKE_BUILD_TYPE=Release
```

### `ncmdump: command not found`

确认当前用户的本地命令目录在 PATH 中：

```bash
echo "$PATH"
```

临时加入 PATH：

```bash
export PATH="$HOME/.local/bin:$PATH"
```

如需永久生效，可将上面的 `export` 写入 `~/.zshrc`，然后重新打开终端。

### 转换后没有封面

部分网易云音乐 3.0 之后生成的 `.ncm` 文件不再内置封面数据。此时音频转换可能成功，但输出文件没有封面。可以查看项目作者推荐的 `ncmdump-go` 或 GUI 版本。

## 十、最常用的完整示例

```bash
mkdir -p "$HOME/Music/Converted"
ncmdump -d "$HOME/Music/网易云缓存" \
  -o "$HOME/Music/Converted" \
  -r
```

转换完成后，到 `$HOME/Music/Converted` 查看 MP3 或 FLAC 文件。
