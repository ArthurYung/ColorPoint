# Color Point

> 桌面吸色工具

<p align="center">
  <img src="/icon.png" alt="" height="200">
</p>
<p align="center">
    <img src="https://img.shields.io/github/release/ArthurYung/ColorPoint.svg" alt="">
    <img src="https://img.shields.io/github/downloads/ArthurYung/ColorPoint/total.svg" alt="">
    <img src="https://img.shields.io/github/release-date/ArthurYung/ColorPoint.svg" alt="">
</p>

## 应用说明

**一款基于Electron开发的桌面应用**

目前支持:
- `RGBA色值`
- `十六进制色值`
- `透明度计算`
- `自定义快捷键`
- `取色记录`


## 下载安装

[Windows](https://github.com/ArthurYung/ColorPoint/releases/download/1.0.7/Color-Point-win32-x64.7z)   
[MacOS](https://github.com/ArthurYung/ColorPoint/releases/download/1.0.6/Color-Point-darwin-x64.zip)


## 开始使用

### 可在主界面自定义快捷键 .  
![start](https://raw.githubusercontent.com/ArthurYung/ColorPoint/master/gifs/start.gif)   

### 点击开始按钮或使用快捷键开始吸取颜色，吸取颜色后会自动复制到剪切板 .  
![use](https://raw.githubusercontent.com/ArthurYung/ColorPoint/master/gifs/use.gif)    

### 系统托盘內也有开始按钮 .  
![fast](https://raw.githubusercontent.com/ArthurYung/ColorPoint/master/gifs/fast.gif)   

### 吸取颜色时左下角菜单可切换色值类型 .  
当切换透明度模式时，你可以得到一个带有指定透明度的色值。   
**这个色值叠加到所选背景色之后的颜色和当前屏幕所选颜色相同。 即(底色rgba1 & 透明度色值rgba2) = 屏幕色rgba3**   
右键可将鼠标所指颜色设置为透明度计算的底色，点击透明度左侧色块可切换底色为纯黑/纯白。
![alpha](https://raw.githubusercontent.com/ArthurYung/ColorPoint/master/gifs/alpha.gif)

## 开发说明

下载项目并安装依赖

```bash
  git clone https://github.com/ArthurYung/ColorPoint.git
  cd colorPoint && npm install
```

启动项目
```bash
  npm start
```

打包生产
```bash
  npm run build:mac
```
**未使用热更新，如有需要可自行实现**


## License

[MIT](LICENSE.md)
