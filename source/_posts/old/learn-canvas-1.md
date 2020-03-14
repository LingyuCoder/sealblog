layout: art
title: 前端动画对比
subtitle: Canvas动画学习系列
tags: 
- Canvas
- JavaScript
- 动画
- 游戏
categories: 
- 互动动画
date: 2015/4/18
---

将近三个月没写文章了，就在这三个月内，我从一只学生狗变成了上班族。现在一切都稳定下来了，决定重新开始写点东西了。以后的计划是每周一篇，努力坚持~

之前玩了很长时间的Canvas动画，也写了一些工具和一些demo，放在了我Github上的[learn-canvas](https://github.com/LingyuCoder/learn-canvas)仓库里。在学习Canvas动画的过程中学到了不少宝贵的新知识，这篇主要是个人对于Canvas动画的一些想法以及与其他前端动画实现的一些对比。

<!-- more -->


## 动画？
几年前，网页开发主要的侧重点还在于功能的实现。那时候的界面虽然不漂亮甚至很丑，但只要提供了用户切实需要的功能，也往往能够得到认可。但如今，随着互联网的快速发展，提供相同功能的互联网产品层出不穷，相互之间的竞争也日益增大。

互联网产品与传统的软件产品不同，以前用户通常是通过购买软件安装软体来获取服务，这种方式使得用户在竞品之间相互转换的代价很高，因此产品往往会有一批自己的用户，竞品相互之间会各有一片领地，然后通过销售、广告等等渠道缓慢的蚕食对手的地盘。

然而互联网产品的情境就完全不同了，用户只需要在浏览器中敲入一个网址，就可以轻松的获取服务。这方便了产品的推广和传播，同时也大大降低了用户对于产品的依赖程度，用户可以很方便的获取到其他同类产品的服务。因此服务提供商就需要想尽各种办法来留住用户。

当然留住用户的方法有很多，比如提供竞品没有的功能、仔细研究特殊用户群的痛点并提供针对性的解决方案等等，但其中的一个比较直接的方式就是“让我们的产品用起来比别人的用起来爽”，说白了也就是提升用户体验。浏览器的性能提升以及对CSS3和HTML5规范的支持，为用户带来了多种多样前所未有的互联网产品体验，动画就是其中一个。

动画给用户带来的体验提升是非常直接的，添加了动画后，信息的展现不再是冰冷冷的文字和图片，变得更加生动、直观，各种模仿现实的动画效果也使得页面元素的展现更加自然、亲切。在页面上实现动画比较常见的有三种方法：

1. CSS动画
2. JavaScript动画
3. Canvas、WebGL动画

这里就说说这三种动画

## CSS动画
CSS3可以很方便的通过修改页面元素的样式来实现动画，主要是两种：`transition`和`animation`：

### transition
`transition`为状态的转变提供了过渡动画，比如`transition: width 1s linear`，如果当前宽度为200，修改其宽度为400，那么就会发生一个时长为1s的动画，在这个动画过程中宽度逐渐增加转变为400。具体的转变方式由linear这种缓动函数来指定，linear就是线性的变化

### animation
`animation`则是通过定义`keyframes`关键帧来实现动画，一个典型的keyframes大致是这个样子的：


```css
@keyframes myAnime {
    0% {
        top: 0
    },
    50% {
        top: 200px;
    },
    100% {
        top: -200px;   
    }
} 
```

然后在通过在元素样式中定义`animation`：

```css
.ele {
    animation: myAnime 5s linear 2s infinite alternate;
}
```

通过这种方法就可以让元素动起来，具体每个参数有什么作用，可以去看看W3C或是MDN的介绍

### 优势和缺陷
CSS动画有很多优点：

1. 写起来很简单，也比较直观，非常适合实现一些元素动效
2. 在绝大部分时间CSS动画的性能都比较好（不触发重布局和重绘，还能使用上GPU加速）

但缺陷也很多：

1. 动画过程控制能力较弱，逐帧控制不可行
2. 部分浏览器不兼容，现在大部分都可以，尤其是移动端
3. 若触发重布局和重绘，会大幅度降低性能
4. 由于是CSS实现因此有不少局限性（页面滚动动画等）
5. 基于页面元素，不可能实现像素级的渲染控制

## JavaScript动画
JavaScript的动画本质上和CSS动画相似，同样是构建在页面元素的基础之上，比如jQuery的`$.fn.animate`就实现了JavaScript动画。

JavaScript动画本质上就是通过每隔一小段时间修改一次元素的CSS样式来实现动画。由于每一帧元素的样式都需要计算当前时间点所需要展现的样式属性值，因此只要修改计算的方式就能干预动画过程。这种逐帧绘制的方式有很多好处：由于每一帧都能进行干预，因此拥有极强的控制能力，可以单帧的控制、变换，写得好完全可以兼容IE6，并且像页面滚动这样的效果也可以实现。但由于计算过程需要自己实现，因此JavaScript动画往往较为复杂，所以性能上很容易出现问题，而且一般需要依赖外部动画库（不久之后就不需要了）。另外JavaScript动画和CSS动画同样是基于页面元素和CSS样式，因此有自己的局限性，像素级的控制无法实现。

JavaScript动画往往用于CSS动画无法完成动画的场景，比如兼容低级浏览器、实现一些细粒度动画等等

## Canvas、WebGL动画
Canvas和WebGL分别提供了2D和3D的画布进行绘制，这种绘制脱离元素和CSS，因此可以随心所欲定义绘制方案。这里就以Canvas为主，因为WebGL我不会哈哈。

Canvas本身提供了一系列的绘制方法，但同样需要JavaScript来控制，与JavaScript动画类似。Canvas本质上可以看做一叠白纸，并且提供了一些圆规直尺的工具，然后画一个动画的过程就是：画一帧，然后把换下一张白纸再画下一帧，和童年在书上画翻页动画原理一样。因此Canvas动画的好处有：

1. 拥有JavaScript动画的控制能力
2. 完全脱离CSS和元素，绘制的方式和结果完全由自己控制，可以实现像素级别的控制
3. 能够利用GPU加速，性能不错
4. 可以进行画布控制，导入图像或导出图像
5. 可以进行图像分析

但是这些好处也是需要付出代价的：

1. 所有的绘制细节都要自己去控制，需要大量代码
2. 不再基于CSS和DOM，因此在交互上很麻烦，只能在canvas上监听然后再计算位置投射到对应的元素上

由于这种像素级别的控制能力，往往会使用Canvas做游戏和像音频可视化这样的复杂视觉效果

## 最后
今天先写到这里，下一篇写一写Canvas动画里的一些基础知识