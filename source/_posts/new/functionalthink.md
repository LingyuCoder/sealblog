layout: art
title: 玩函数式编程有感
subtitle: 
tags: 
- 函数式编程
categories: 
- 编程基础
date: 2020/3/1
---

之前有了解过函数式编程，也用过ramda库做一些数据转换，但一直没有深入。最近仔细思考了一下自己最近一两年的工作内容和自己的能力模型，发现自己做的绝大多数事情都比较简单粗暴，缺乏结构化的设计与思考，缺少对复杂问题的抽象与沉淀。

<!-- more -->

## 问题抽象

在我个人看来，前端工程师实际上是在做前端相关工作的工程师，首先立足点是工程师，然后才是前端这个领域。工程师核心能力就是对一个复杂问题进行抽象，自顶向下逐步细化，再自底向上逐步实现，形成一个工程，最终解决问题。

举个例子，比如我们要做一个移动端业务需求，通常都会有一些自顶向下的细化抽象的流程，比如：应用 => 页面 => 区块 => 模块 => 业务组件 => 原子组件 => 标签 这么一个流程。但实际上由于各种完善的内部搭建系统的存在和职责细分，有产品和设计师解决了应用、页面以及部分区块的抽象，而各种组件的封装解决了部分业务组件、原子组件、标签的抽象，因此最终我们可能只需要实现部分区块、模块、部分业务组件的抽象。最终可能就是简单的代码堆砌就能完成需求。当然这里我并不是说这种开发方式不好，这样确实可以大幅度提升开发效率，在单位时间内完成更多的业务需求。但作为一个工程师，局限在小范围的问题之中，问题抽象的发挥空间有限，长久往复就会变成”无情的切图机器“。

要跳出这个局限范围有很多的方式，向上与业务一同基于业务思考去做应用、页面的抽象，向下与基建团队一同共建组件基础，当然也可以跳出这个移动端页面开发范围去投入诸如前端工程化、端能力建设、前端智能化等全新的范围。总体而言就是扩大自己的抽象能力发挥空间，通过解决更大的问题，来实现更大的自我价值。当这个空间足够大时，就可以拍着胸脯说自己是”架构师“了。

当我们面临更大的问题，就需要更多抽象问题的方法。我认为一个优秀的架构师，会针对所需要解决的问题以及问题的上下文，找到最合适的抽象方法来对问题自顶向下的细化，然后再选择最合适的方案来自底向上去实现，最终交付这个问题的完整解决方案。

## 编程范式

而所谓编程范式，就是抽象问题的方法。

比如命令式编程，其实就是把问题抽象成一步步的流程，进而将流程转化为代码控制机器按照你所设想的流程运行，这种方式可以适合解决一些小范围的问题，对于机器是有好的，但并不符合人类的思维方式。而面向对象则是把问题抽象成一个个对象，对象将数据和操作它的方法封装来解决局部子问题，再通过各种继承、组合等方式将对象联系起来来解决更大范围的问题。而函数式编程则是把问题抽象成一个个函数，在函数内部来解决子问题，再通过各种函数的组装生成更多的函数来解决更大范围的问题。

仔细思考我们所编写的代码，实际上一直都是在操作数据，而面向对象的核心是数据，函数式编程的核心是操作。个人认为它们没有优劣之分，而是两个不同角度看待问题的产物。当我们需要机器做的事情是模拟的是一个名词，比如人，那么面向对象显然更合适。当我们需要机器做的事情是模拟一个动词，比如修改，那么函数式显然更合适。

## 前端开发

回到前端开发上面来，回归到日常页面开发中。前端页面的开发本质上其实分为两部分，一个是数据加工成UI，一个是用户操作改变数据，而MV*就是在解决这两个问题。

那么面向对象的方式是如何开发页面的呢？我们将页面上的模块或区域拆分成一个个对象，对象内部封装了一些内部状态以及状态变更的行为， 另外还会封装一些UI绘制，对象对外也有一些方法来输入输出数据。对于第一部分——数据加工成UI，我们是通过对象的联系，将数据交给对象然后对象自己通过他们创建的联系进行分发。而对于第二部分——用户操作改变数据，如果只是在一个对象内部的状态变化还算简单，当所触发的变化横跨多个对象，那么对于这些变化就强依赖对象之间提前建立的联系。这里就会发现一个问题，UI渲染本身是一颗树，而创建的对象本应与这棵树有明确的对应关系，但由于这些对象为了满足数据变化所建立了各种复杂的关系，使得对象之间又形成了一张网。在这个网的每个节点自身的状态加上网本身的复杂度提升，就带来了不确定性。早年间的天猫都是KISSY+模板引擎+Class的方式就是这个问题。一旦页面复杂起来，基本上就变得无法维护了。

这里其实就是问题的抽象不合理导致的。我们回头再看这两部分，第一部分数据加工成UI，第二部分用户操作改变数据。第一部分数据和UI是名词，加工是动词。第二部分用户和数据是名词，操作和改变是动词。按照面向对象抽象名词，函数式抽象动词的方式，我们发现之前我们强行将动词抽象按照名词使用面向对象进行抽象，显然是不合适的。

那么我们换一种抽象方式。将UI、数据、用户使用面向对象抽象，再将加工、操作、改变抽象成函数，然后仔细想一下就会发现，这不就是React + Redux么？UI就是一个个的Component、而数据就是Store、用户就是Action，操作就是dispatch、改变和加工就是reducer。

进一步思考数据加工成UI这一部分，UI是什么？Class Component的思路就是我们确实是有UI，它是一个实体所以它是一个对象。UI对象由子UI对象或VDOM组合而成。而到了Hooks其实就是换了个角度，其实我们没有UI，我们是在绘制UI，这一部分用函数式的说法就是数据加工并绘制界面，加工和绘制都是动词，输入是数据，输出是界面也就是VDOM。绘制过程由子绘制过程组合而成。可以看到Hooks实际上是React更加函数化的方式，在将加工、操作、改变等动词函数化之后，进一步将之前作为名词的UI也函数化。当然这只是一个表面的变化，React内部的机制也更加的函数式，这里就不展开了。

## 总结

吹逼吹了这么多，你可能会有疑问，这篇文章究竟想表达什么？安利函数式编程？答案是否定的。我在并不是在呼吁大家都来函数式编程然后把代码全部重构，而是表达我对于问题抽象方式思考的一些看法。毕竟知乎上各种编程大牛们整天吵来吵去也没个结果。而我觉得作为一个工程师，不管是面向对象也好，还是函数式编程也好，最重要的是沉淀出一套行之有效的抽象问题的方法论。当遇到问题的时候，能够根据问题的本质找到最合适的切入角度来拆解细分。我个人也在不断寻找这一套方法论。今天这一站是函数式编程，明天可能又会是其他的什么东东。所谓工程师，最重要的还是解决问题的能力。