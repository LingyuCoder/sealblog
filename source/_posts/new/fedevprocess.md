layout: art
title: 聊一聊前端研发流程
subtitle: 
tags: 
- 工具
categories: 
- 前端工程化
date: 2020/3/25
---

最近也没写什么文章，在这里谈谈我对前端研发流程的一些理解。这里不涉及到具体技术，只是谈一谈每个步骤的能力及方案。

<!-- more -->

平常还写代码切模块的人，很容易发现，其实页面or模块的研发流程上大体分为如下几步：
- 项目初始化
- 项目代码开发
- 项目构建编译
- 项目自动化测试
- 项目集成测试
- 项目资源发布
- 项目线上调试

## 项目初始化

使用一个针对场景定制过的脚手架（boilerplate），填入一些新仓库的信息来生成**可运行**的最简项目代码。典型的开源方案如yeoman，create-react-app啥的都是干的这个。一般脚手架会定义如下内容：
  - 目录结构
  - 编码风格
  - 通用依赖方案
  - 构建编译方案
  - 本地调试方案
  - 单元测试方案
  - ...

脚手架是架构的直观体现，一般会清晰的定义模块、页面、应用之间的关系，以及落地规范和指导原则。一般情况下应该由架构师来开发脚手架，而业务落地的同学使用脚手架来初始化业务仓库进行代码开发，在开发过程中提炼出提效需求反馈给架构师，架构师将提效的功能集成到脚手架中。而脚手架最好能有一套自动化升级机制来保证提效的功能能够惠及到每个业务开发同学，而不是需要每个仓库手动升级。

## 项目代码开发

有了基础项目代码，然后就开始往里面塞入各种内容，模块、页面、工具类等等。这个过程中，需要的最重要能力是**所见即所得**，也就是要求有符合代码研发流程的配套工具。常见场景及需求能力如下
  - 应用开发：容器模拟、配置下发模拟
  - 页面开发：本地接口模拟、模板渲染模拟
  - 模块开发：模块运行环境模拟，模块交互模拟
  - 工具开发：针对不同的工具类型有不同的模拟能力要求

由于代码研发的流程非常长，对整个研发体验至关重要。因此一个优秀的本地研发工具必须要做到如下几点：
- 高可用：尽量降低对相关系统的依赖，防止出现依赖系统无法访问阻塞代码开发的情况
- 高性能：每个人都不喜欢等待，构建要快、生效要快，这也是为什么要做构建优化、要做HMR
- 可调试：代码报错了能够快速发现，对应的sourcemap必须要有，统一的日志工具也是不错的选择。另外如果移动端调试也应该有轻松简单的抓包方案

## 项目构建编译

过去前端嘲笑服务端，说他们天天编译浪费太多时间。但现在前端自己也离不开编译了。不管是ts、babel、sass什么的，谁不喜欢用更方便的特性来写代码呢？前端构建编译也在不断地演化推进，而大的模式不外乎本地构建和云端构建两种，针对这两个的区别主要有如下的考虑：

- 构建效率和成本：本地构建的成本是非常低的，而且构建速度一般都较快。云构建需要在机器上启动docker然后安装依赖再进行构建，成本和构建时间都比较高
- 构建产物的一致性：本地构建情况下，由于大多数情况下安装的资源都是semver规范下的一个版本范围，加之很多依赖资源没有很好地遵守semver版本规范，导致很容易出现版本号不一致（甚至魔改依赖资源）从而产出构建产物不一致问题，而云构建则相对较为稳定
- 团队规范遵守：本地构建的情况下，由于交付的是构建产物而不是源码，而生成这些构建产物的过程又是在本地，因此团队规范的遵守就更需要团队成员的自觉，云构建则相对更好去做规范的卡口
- 构建能力的动态升级：本地构建的一个问题就是构建器安装在本地，而大多数情况是不会去升级的。这里就意味着若构建能力变化是无法感知的，若要享受这个能力需要一个个仓库推动升级，对于模块化开发的场景是非常痛苦的。而云构建则能做到一次性升级，对于落地一些全局能力非常有帮助。

构建产物其实除了可运行代码，还有很多其他的内容，这里随便举两个例子：
- 文档构建：基于代码生成文档有很多方案，比如格式化注释，亦或是直接基于AST对源码做分析。比较典型的就是React的PropTypes，非常适合直接分析源码生成文档
- 埋点构建：通过分析代码和注释的方式自动化生成埋点，以及埋点对应的相互关系，方便后续数据分析

对应构建还需要对构建结果进行分析，典型的分析有：
- 构建耗时分析：哪些资源构建较为复杂，是否可以针对性的做一些缓存提效
- 依赖大小分析：哪些资源较大，是否做了tree shaking，是否可以更换成更加精细化的加载方式
- 依赖关系分析：对于较大的项目，通过构建直观的展现模块之间的依赖关系对于快速理解应用架构是非常有帮助的

## 项目自动化测试&集成测试

自动化测试对于功能稳定明确的场景是非常必要的。毕竟维护测试用例也是一个庞大的工程，在快速迭代的场景下，**投入产出比**可能较低。在快速变化的项目中，只对其中不变的核心链路进行自动化测试。自动化测试的核心问题有如下几个：
- 自动化测试的触发与卡口：触发机制保证项目的流程严格经过测试，本地触发时非常不合理的。最好是能做到发布流程中，比如代码push后的git钩子中。而自动化测试应该成为严格的卡口，测试用例没有通过、测试覆盖率没有达标，应回退到开发流程中，不应进行集成测试，更别提资源发布了。
- 测试用例的管理：在快速奔跑的互联网环境下，考虑投入产出比是非常重要的，从99%覆盖率到100%覆盖率会额外花费非常大的成本，由于前端并非像服务端那样中心式，小部分用户出问题，并不会影响其他正常的用户。因此找到一个测试用例维护成本与业务高可用要求之间的平衡是测试用例管理最重要的部分
- 测试环境模拟：由于大多数情况下我们开发的页面都会存在外部依赖，典型的比如依赖客户端运行容器的jsbridge能力、依赖服务端数据、依赖其他页面上的资源、依赖浏览器BOM能力等等，因此模拟这些环境能力是自动化测试重要部分。而这其中这些能力失效时的破坏性测试也是非常有必要的。

代码自动化测试完成后，就需要和真实的上下游链路进行真实的集成测试，在真实的环境下，与依赖方一起进行完整的链路测试。在这期间，前端可能只是其中的一小部分，那么我们要做的就有:
- 保证自己负责的部分尽可能的稳定
- 明确上下游依赖以及出现问题时的排查链路
- 阻塞式问题优先响应，非阻塞式问题定好处理节奏

## 项目资源发布

构建产物的发布有很多种方式，针对不同的使用场景可以有不同的发布方式，有很多时候会有多个发布流程。典型的比如一个工具类，它既可以发布到CDN供页面加载使用，也可以发布到NPM供Nodejs环境使用。发布的关注点主要有如下几个：
- 发布渠道
  - CDN：通常符合特定的路径规范，供模块加载器异步加载
  - NPM：供代码打包的方式使用
  - 服务器：在一些系统里面是前端资源放在服务端机器上
- 发布环境
  - 研发环境：供研发环境使用，方便多模块联调、回归测试
  - 线上环境：发布到线上可供用户使用，具体使用方式需要根据版本管理方式而定
- 校验能力
  - 可用性校验：依赖资源是否已经发上线，依赖的功能容器是否已经具备
  - 易用性校验：通常是性能校验，比较常见的是页面性能评分
  - 安全性校验：是否有代码级别的安全漏洞及不规范实践等等
- 版本管理
  - 覆盖式发布：同一个资源URI，发布新的，老的就会被替换。需要很好地灰度方案防止出现大规模bug
  - 非覆盖式发布：根据版本生成不同的URI，需要使用资源的页面指定版本，对应服务端或者页面渲染侧要有版本控制能力
- 灰度能力
  - 流量灰度：基于流量灰度，最粗暴的灰度方式，容易出现一个用户多次访问结果不一致的情况
  - 用户灰度：基于用户灰度，相对温和的灰度方式，一个用户多次访问看到内容相同。最简单的方式就是用户ID进行Hash
  - 协同灰度：当服务端也需要灰度时，前端的灰度需要配合服务端灰度，防止前后端版本不一致导致功能bug
- 回滚能力
  - 版本切换：当非覆盖式发布式，能快速切换版本实现回滚。而覆盖式发布则需要一个模拟的版本切换功能
  - 协同回滚：服务端回滚时，前端如何与服务端配合回滚且协同生效

## 项目线上调试

前端也是很容易出现线上问题的，而且由于前端分布式的特点，因此排查问题会非常痛苦，项目线上调试非常必要，毕竟不管怎么模拟，线上用户真实的环境总是与模拟环境不同的。因此当项目发布到线上用户反馈问题时，应当建立起对应的调试机制，而对于前端而言主要关注如下几点：

- 问题发现：首先需要有可靠的问题发现机制，这里就涉及到前端稳定性相关的服务化方案，主要是通过日志上报、实时计算、算法分析告警来实现，这可以单独写一整篇文章，就不展开讨论了
- 问题定位：遇到问题时，能够精确定位并实现问题场景的复现。这看起来很简单，但实际上在如今大数据、个性化的算法能力影响下，其实想要实现场景的复现是非常困难的，因此合理的日志上报能力便非常重要，将关键数据上报以实现场景复现定位问题
- 问题排查：在线上遇到问题时，若无法本地复现场景，那么就应当找到线上场景并实现访问资源替换到本地功能，这种情况下可能会需要用户+技术支持配合，采用资源代理的方式将用户访问的资源代理到本机通过debug来找到真正问题所在

## 其他

目前大多数情况下的本地开发流程大体就这些了，当然其实还有很多其他东西也可以列入到研发流程中，比前端云开发以及WebIDE，这种模式现在还在快速发展期，后续我会写一篇文章谈一谈我对WebIDE的看法。