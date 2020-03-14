layout: art
title: 通过JavaScript增加交互性
subtitle: 翻译自谷歌Web开发最佳实践手册
categories: 
- 页面开发
tags: 
- HTML
- CSS
date: 2014/5/21
---

JavaScript允许我们网页中的几乎所有的部分：网页内容、样式等等，它还能提供用户交互的行为。然而，JavaScript也会在页面被渲染时阻塞和延迟DOM树的构建。保证JavaScript代码的异步性，删除不必要的JavaScript代码，可以优化性能。

<!-- more -->

### 长话短说
* JavaScript可以对DOM和CSSOM进行查询和修改
* JavaScript的执行会阻塞CSSOM的构建
* JavaScript阻塞DOM树的构建，除非显式的声明为异步

### JavaScript造成的阻塞
JavaScript一个跑在浏览器中的动态语言，JavaScript允许我们修改页面中的每一方面：我们能够通过在DOM树上添加或删除节点来修改网页内容，也能修改元素的CSSOM属性，还能处理用户输入等等。这里提供了一个例子：

```html
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link href="style.css" rel="stylesheet">
    <title>Critical Path: Script</title>
  </head>
  <body>
    <p>Hello <span>web performance</span> students!</p>
    <div><img src="awesome-photo.jpg"></div>
    <script>
      var span = document.getElementsByTagName('span')[0];
      span.textContent = 'interactive'; // change DOM text content
      span.style.display = 'inline';  // change CSSOM property
      // create a new element, style it, and append it to the DOM
      var loadTime = document.createElement('div');
      loadTime.textContent = 'You loaded this page on: ' + new Date();
      loadTime.style.color = 'blue';
      document.body.appendChild(loadTime);
    </script>
  </body>
</html>
```

* JavaScript允许我们进入到DOM树中，甚至获取隐藏的span元素。事实上隐藏的元素并不存在于渲染树中，但它仍然存在于DOM树中。因此，当我们获取到它的引用时，我们能够修改其内部的文字（通过textContent进行修改），我们甚至能修改它的display样式值，从‘none’改到‘inline’。这上面说的都完成之后，我们的网页将会显示“Hello interative students!”
* JavaScript也允许我们创建节点，为节点赋予样式，在DOM中添加和删除节点。事实上，在技术上，我们的整个页面可以通过一个巨大JavaScript文件来一个一个创建节点并给他们赋予样式。这同样能工作，但使用HTML和CSS明显更加简单。JavaScript函数的第二部分创建了一个div元素，并设定了文字，赋予了样式，然后将其添加到body上。

这里，我们修改了已经存在DOM节点的的内容和CSS样式，并在文档中加入了一个全新的节点。JavaScript为我们的网页提供了更强的能力和灵活性。

然而，这里潜伏着一个大的性能问题。JavaScript为我们提供了更强的能力，但也为渲染的方式和时间带来的一定的限制。

首先，注意上面的例子中，我们的内联脚本放在了页面的底部。这是为什么呢？你可以自己试试，如果你将脚本移动到span元素的上面，可以看到script里面的脚本将会运行失败并报出错误说在文档中找不到任何span元素（`getElementsByTagName('span')`返回null）。这说明了很重要的一点：脚本运行的位置，是其在文档中的位置。当HTML解析器发现到了script标签时，他会暂停DOM的构建并将控制权交给JavaScript引擎。一旦JavaScript运行完毕，浏览器将会回到之前的位置，继续DOM的构建。

换句话说，脚本内部无法发现其后面的元素，因为他们还没有被处理过。或者再换个说法：**运行内联脚本将阻塞DOM的构建，这也意味着阻塞页面初始的渲染**。

页面中的脚本的另一个点在于：脚本不仅仅能够修改DOM，也能够修改CSSOM。事实上，上面的例子中，我们已经修改了span元素的display属性，将它从none修改到inline

那么，如果浏览器还没有完成CSSOM的下载和构建，就需要运行脚本，浏览器会怎么做？答案很简单，但效率不好：**浏览器将延迟脚本的执行，直到CSSOM的下载和构建全部完成之后，才会执行。与此同时，在我们等待的时候，DOM构建也会阻塞。**

简而言之，JavaScript引入了很多的DOM、CSSOM之间的相互依赖，同时JavaScript的执行将会在浏览器处理和页面渲染时导致明显的时延：
1. 脚本在文档中的位置很重要
2. 发现script标签时，会暂停DOM的构建，直到脚本被运行完成，DOM构建才会继续
3. JavaScript能够查询和修改DOM和CSSOM
4. JavaScript只有在CSSOM被构建完毕之后才会执行

当我们谈及“渲染性能优化”，在很大程度上，我们谈及的是HTML、CSS和JavaScript之间的依赖关系图。

### 解析器的阻塞和异步JavaScript
默认情况下，JavaScript的执行是“解析器阻塞”的：当浏览器在文档中遇到一个script标签时，DOM的构建会被暂停，控制权递交给JavaScript运行，DOM的构建将会在JavaScript运行完成之后继续执行。这可以从上面的内联脚本例子中看出来。事实上，内联脚本总是“解析器阻塞”的，除非特别照顾这些代码来推迟其执行。

那么如何通过script标签包含脚本？我们继续使用之前的的例子，将代码放在单独文件中：

```html
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link href="style.css" rel="stylesheet">
    <title>Critical Path: Script External</title>
  </head>
  <body>
    <p>Hello <span>web performance</span> students!</p>
    <div><img src="awesome-photo.jpg"></div>
    <script src="app.js"></script>
  </body>
</html>
```

```javascript
var span = document.getElementsByTagName('span')[0];
span.textContent = 'interactive'; // 改变DOM中的文本
span.style.display = 'inline';  // 改变CSSOM属性
// 创建一个新元素，为其添加样式，并将其加入到DOM中
var loadTime = document.createElement('div');
loadTime.textContent = 'You loaded this page on: ' + new Date();
loadTime.style.color = 'blue';
document.body.appendChild(loadTime);
```

你是否认为通过`<scirpt>`引入的JavaScript代码和内联JavaScrip它的执行顺序不同？当然，这个答案是否定的，这两者的处理方式几样。无论是前者还是后者，浏览器都在处理后面的文档之前，暂停并执行脚本。**然而：在当浏览器使用外部JavaScript文件时，也不得不暂停并等待脚本从磁盘、缓存、或陈远程服务器中获取。这可能在为页面渲染带来上千万毫秒的时延**

有一个好戏，我们确实有一个解决方法。默认情况下，所有的JavaScript都是“解析器阻塞”的，浏览器也不知道JavaScript脚本究竟会在网页山做些什么，因此它会假定最坏的情况并阻塞解析器。然而，如果我们有办法告诉浏览器我们的脚本不需要在它所处的文档位置上被执行，那会怎样呢？如果这样做，浏览器会继续DOM构建，并直到DOM构建完成后，运行脚本，无论是文件是从高速缓存直接中获取还是从远程服务器中获取。

那么我们怎样实现呢，我们能直接标记脚本为异步脚本：
```html
 <html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link href="style.css" rel="stylesheet">
    <title>Critical Path: Script Async</title>
  </head>
  <body>
    <p>Hello <span>web performance</span> students!</p>
    <div><img src="awesome-photo.jpg"></div>
    <script src="app.js" async></script>
  </body>
</html>
```

增加了async属性能够高速浏览器，它不会在下载和执行过程中阻塞DOM构建。这是一个巨大的效率提升！
