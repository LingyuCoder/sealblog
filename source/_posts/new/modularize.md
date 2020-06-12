layout: art
title: 聊一聊前端模块化
tags: 
- 杂谈
categories: 
- 杂谈
date: 2020/6/12
---

从15年4月9日入职阿里就开始做天猫算起，到如今已经五年多了。仔细思考了下这五年，虽然做了各种不同形态的业务，从商家端做到了消费者端，从源码开发做到了搭建渲染，但万法归一终究逃不出一个词：模块化，这里聊一下我对于模块化的一些思考。

<!-- more -->

## 源码下的模块

最初在天猫商品线，页面主要是重源码的前端应用开发。在这种场景下的模块化，主要是对一大坨互相缠绕在一起的源码通过合理的架构，基于DRY原则和SRP原则，将重复的部分整合，将独立的部分抽离。由此将代码分离成多个细小的独立的碎片后，提炼这些碎片的共性、制订一套能适配它们的接口规范，以此来实现代码架构的模块化。最终沉淀出一套基于模块化的开发规范，提升代码整体的可维护性和可扩展性。

源码的模块化实际上是对于页面级前端架构的理解。这里面主要会涉及到如下几个方面：

- 拆分方式：基于页面结构拆分，还是基于业务逻辑拆分
- 渲染方式：是模板引擎的整体替换，还是dom diff的差异迭代
- 数据&UI同步：是基于双向绑定的方式，还是基于总线控制的方式，还是手动触发更新
- 数据管理：模块自己内部管理数据，还是全局统一管理
- 模块通信：模块直接引用实例，还是基于事件，还是基于消息，或者基于单向数据流
- 加载规范：模块的规范，模块的加载器，依赖的加载
- 数据规范：模块自身接受的数据的描述

当然源码架构层面做了模块化，也只是将源码做了合理的拆分，而随着业务场景越来越复杂，模块的数量越来越多，就出现问题了。如此大量的模块被加载，但通常一次页面渲染仅仅只是使用其中的很小一部分，这也就意味着其余的模块加载和运行都是性能浪费。这个问题在商品线的宝贝发布页尤其突出，由于宝贝发布页作为一个横向的业务产品，需要支持整个天猫各个行业的定制化诉求，同时也需要支持各种平台自己的能力诉求，因此模块数量会非常多。但实际上商家在管理的时候其实只是使用其所在行业的模块。这种场景下，对于模块化能力就提出了新的要求：动态下发的能力。

## 动态下发的模块
讨论动态下发，最核心的问题就是如下几个：

- WHO：谁来下发
- HOW：怎么下发
- WHAT：下发什么

首先需要将页面和业务场景的映射关系梳理清楚，主要有两种：
1. 个性化的业务场景：多业务场景对应一个页面，当用户访问到页面之后基于个性化分析得出业务场景以及业务场景对应的模块，各种横向业务支持的页面大多属于此类
2. 预设的业务场景：一个业务场景对应一个或多个页面：当用户访问到当前页面即已经决定了业务场景以及业务场景对应的模块，如斑马搭建场景下大多属于此类

### WHO
谁来下发这个问题，而对于第一种情况，由于需要个性化能力，而个性化的业务场景判断属于业务特有的逻辑，因此大多数情况由专门的业务应用承载。而对于第二个种情况，由于页面生成时已经进行了预设，因此可以在BFF层或者是搭建系统的渲染层进行承载，当然部分非前后端分离的业务也可以在业务应用的vm模板上控制。

### HOW
怎么下发这个问题，对应的说第一种场景，由于后台应用承载，也就意味着通常会采用后端接口的方式进行下发。而对于第二种情况，则可以在生成HTML代码时下发。下发的方式非常影响页面性能，因此前端会尝试做SSR这样的同构渲染方案，以此来提升性能

### WHAT
下发什么的核心问题则是如何基于下发的内容拿到对应模块的可运行代码来执行。针对不同的情况有不同的下发策略：
1. 当应用中存在映射，可以基于映射找到对应的资源，可以只下发映射的key，这种方式对于下发方较为友好，对于下发方仅仅是增加一个业务的模块抽象，并不需要关心前端模块相关资产，适合由后端提供接口的场景，但由于需要在应用中维护映射，所以灵活性较差。当然也可以通过再找其他系统下发映射的方式来动态添加。
2. 依然只下发一个映射的key，但并不直接维护映射，而是基于映射的key拼接出获取可运行代码的方式。通常我们的模块都是存放在CDN上，符合一定的路径规范，因此通过下发模块名及版本的方式即可拼接出模块的真实路径。由于前端大多数情况都是非覆盖式发布，因此要采取这种方式，需要下发方增加版本控制的能力，同时还需要保证所有的模块都符合特定的路径规范
3. 既然页面只是想拿到模块的可运行代码，那么直接下发源码也是一种模式。这种方式对于前端来说省去了寻址的过程，减少了一个请求（当然也可能存在依赖导致请求并没有减少），但缺点就是下发方需要去对应系统中拿到完整的模块可运行代码，而且同样需要有对应的版本管理机制。

而当模块的动态下发能力具备后，就需要确定每一次下发究竟应该下发哪些模块，这也就设计到业务场景的定义了。如在斑马内大多数情况属于预设业务场景，因此可以通过搭建来确定下发的模块。而对于个性化的业务场景，就需要有对应的场景化的配置能力。

## 场景化的模块
在进入天猫搜索后，前端主要是开发native搜索瀑布流中的动态weex坑位，搜索与商品一样作为一个横向业务，要承接行业、平台和品牌商的需求的同时，搜索的产品自己也会有一些业务上的玩法。因此模块数量随着接入的业务快速增加，如何管理好这些模块，什么时候出、用什么数据出、出了怎么排列，就成为了新的问题。

### 场景定义
首先需要明确场景的定义，以搜索为例，当一个用户进入到页面并发起请求，可能决定场景因素有：

- 搜索词：用户在搜索输入框填入的词，是品类词比如手机，还是品牌词比如苹果，还是具体的型号词比如iphone 11，还是宽泛词比如运动
- 类目：由于部分类型的词是可以推算出类目的，类目也可以加入场景的定义中
- 人群：基于用户在平台的历史行为推算出来的抽象的用户分类，不同的人群相同的词也可以推荐不同的内容，比如运动鞋
- 时间：当用户在特定的时间访问页面，并搜索一些特定的词，可以推算出用户的购买意图。比如节日送礼的场景
- 位置：基于用户当前所在的地理位置，去推荐一些基于LBS的服务。比如O2O线下门店信息透出
- 上游：不同的上游来源的用户可能有不同的心智，比如从首页进来的和从营销活动进来的是完全不同的
- 行为：用户在当前页面上的一些行为，可以通过边缘计算能力，去猜测用户的购买意图
- ...

### 场景交叉
我们可以将一个或多个因素的组合形成一个场景，并为场景圈选一个或多个模块。而当页面基于场景来下发模块，就很容易遇到场景相互交叉的问题，比如一个业务配置了消费电子类目出A模块，另一个业务配置了新人人群出B模块，那么当一个新用户搜索手机的时候，到底是出A模块还是B模块还是都出，就需要有一定的规则来进行干预和管控：
- 首先是审核机制的建立，页面的拥有者作为页面最终效果的保证，需要严格审核场景和模块的配置，避免出现不必要的交集，这里审核应该是两个层面的，一个是行业内部收敛，一个是业务整体收敛
- 当不可避免的交集出现时，则需要拟定页面的模块互斥规则，以及模块的插入和录入规则。这里的规则包含如下几个部分：
  - 出不出：圈选一批模块定义为同角色模块，为他们定义互斥逻辑，以及在互斥下的优先级
  - 出在哪：模块的排序规则可能会相对复杂，页面上不同场景下的模块其实是很抽象的，因此只能基于一些规则控制。比如置顶/置底、基于某模块插入/替换、基于位置插入/替换。而这些规则只能保证一定的可用性，某些情况还是需要case by case来看

### 场景数据
不同的业务有不同的针对场景的定义，比如做XaaS的业务可能需要加上租户的因素，做2B业务可能需要加上企业相关的因素，而做O2O则涉及到线下门店以及主子账号，等等等等。设定因素来组合出场景，然后为场景圈选需要展示的模块，而模块的数据则可以通过静态和动态两种不同的方式填充：
- 静态数据：基于模块自身定义的可接受的数据格式生成表单来录入
- 动态数据：基于业务自身定义的数据源来录入。而数据源本身也有很多种不同的接入形式，比如mtop、HSF等等，这里面就涉及到模块数据源标准化的问题，这个后面会提到

综上可以总结出，场景化下的模块化，主要在模块自身的基础上扩展了如下几个规则：

- 场景定义的规则
- 模块展现的规则
- 模块排序的规则
- 模块的数据规则

最好的规则就是没有规则，这些规则最终都可以落到算法层面，通过对用户的学习来做到真正的千人千面。当然最后可能还是需要一个干预能力做一些强规则。

通过场景化实现了页面更强的动态化下发能力，但这也仅仅是解决了模块到页面的组装能力，而模块自身的生产问题并没有解决，大量的业务催生大量的模块依然会造成大量人力投入。但模块拆的越细，模块的复用性越高，模块组装成页面的组合成本越高。如何找到最合适的拆分粒度呢？

## 职责拆分的模块
页面拆分成模块时，我们通常都会按照如下两种方式拆分：

- 按照页面结构：将页面划分为多个互相较为独立的区域，并将这些区域各自作为模块实现。这种拆分方式对研发友好，抽象难度较低，成本低易于维护，但当页面结构和业务逻辑的映射不那么清晰时，就很容易出现“这个需求不好做”的情况
- 按照业务逻辑：将整体业务逻辑拆分成多个子业务逻辑，并在模块内处理该逻辑的所有页面操作。这种拆分方式更贴近业务，更能适应业务的发展。但可维护性较差，经常会使得页面结构非常零散，也容易出现多模块交叉管理相同页面内容的情况

大多数情况下，移动端的页面本身结构较为清晰，在初期采用按照页面结构拆分的方案即可实现。但最终随着业务逐渐的发展，导致页面上业务逻辑逐渐变得复杂，就出现了各种各样的问题：
- 随着页面业务的发展，模块间联动需求上升
- 随着集成的场景增多，模块的可维护性下降
- 随着业务耦合性提升，模块的可复用性下降

而仔细思考模块的核心构成，有如下三个部分：
- 模块的数据：主要受到业务逻辑复杂度影响，模块的联动本质上是跨模块修改数据
- 模块的渲染界面：主要受到业务场景数量的影响
- 模块的交互模式：主要受到业务表达的影响

既然如此，想要提升模块的复用性，就得从业务复杂度、业务场景数量和业务表达这三个方面出发，将业务标准化。

### 业务复杂度
业务复杂度是非常难以标准化的，决定业务复杂度的是商业，商业本身就是在随着社会的发展、市场的变动而不断转变、不断试错的。业务复杂度是无法被消除的，只能被转嫁。前端通常会尽可能将业务逻辑交给服务端实现，让前端只是作为轻量化的数据展示，本质上就是将业务复杂度从端侧转移到了服务上。而服务上则通过将不同的业务提炼出共性的部分形成中台，进而形成标准化的数据源，比如商品、产品、店铺、品牌、沉淀固化的营销玩法等数据。但由于各种技术原因、业务原因、政治原因，终究不是所有数据源都是标准的。所以就需要一个中间层来对将非标准的数据以及业务逻辑进行处理，去适配前端模块化的诉求。这个领域前后端做过不少的尝试，从Restful到BFF，再从GraphQL到Faas，目前看来Faas确实是比较合适的解决形态，当然做Faas这一层的前提是为前端更好的模块化服务，而不是单纯的做无情的action层工具人。

### 业务场景数量
业务场景本身是业务复杂度的进一步提炼，通过对商业的理解，将一些有共性的业务进行归纳总结，形成一定数量的业务上层节点，比如行业、类目。而对于每个上层的业务节点，节点内通常都是可以采用相同的解决方案来承载的，但节点之间则要求有一定的差异性。由于在商业的理解下这些节点就是不同性质的，那么他们的侧重点也多少会有些不同，这些都是用户的市场行为决定的。比如买手机，我们会关注性能、尺寸、续航等手机自身的具象指标，而买衣服则会更关注款式、搭配、潮流等一些抽象指标，而买家具则会更关注物流、服务、保修等相关配套服务等等。因此即便是相同标准化的数据，其对应的表达也是不同的，而且这一部分没有办法被转嫁，只能在前端域内解决。那么其核心解决方案就是生产的提效，这部分目前看下来从模块复杂到简单依次的解决方案有工具链能力提升、D2C转代码和AI直接生成。

### 业务表达
业务表达是相对变化较少的，因为这一部分已经经过了多层抽象，从商业到运营到产品经理到交互设计师，而随着用户对于手机的使用时间逐渐增加，经过各种APP的训练，用户习惯也逐渐固化下来，而针对用户习惯所形成的交互模式也趋于稳定。比如tab、dialog、slider、listview等等。因此这一部分也是最容易标准化和形成沉淀的。需要将业务历史过来所开发的各种交互拿出来归纳总结一下，与交互设计、产品经理达成规范上的一致，就可能实现标准化。
综上所述，实际上模块本身不同的部分，可标准化程度是完全不同的，而模块作为数据+界面+交互的集合体，想要提升可复用性，必然是将模块按照职责进行拆分，并保证拆分后的模块的纯度，将交互模块和数据模块发展成标类模块，将界面模块快速生产，实现前端研发真正的low code。而最终在搭建出页面的时候则需要实现多级的搭建，让技术能力强的角色去通过这些细粒度组件去搭建出楼层组件，再由技术能力较弱的角色去实现最终业务的搭建。这也就是我在手猫导购频道做深度搭建的理念和期望。

在我个人理解，其实前端的模块和电商的商品本质上是非常相似的，因此其中的很多流程都是可以对齐和做到更好的。电商在商品的一整套模式能否给我们一些启发呢？

## 商品化的模块
首先来说一下模块的生产。商品本身只是一个实体，映射到模块其实就是就是一段可运行代码。商品的生产都是品牌商自己的工厂和流水线产出，产出后有些大的品牌商有自己的供应链体系，能够基于自己线下的物流和门店能力处理好线下与线上的生产、仓储和库存关系，而有些小品牌商则依赖平台提供的供应链能力。

### 供应链
供应链能对应到模块开发的工具链。平台定义了一套规范，并给与了这套规范的一个推荐的工具链解决方案。但有能力的团队完全可以基于自己的团队能力去基于推荐的工具链解决方案去扩展出自己的工具链体系，最终能将生产结果对接到平台的规范上即可。

由于每个团队有自己独特的业务特性、成长历程、团队构成、技术资产，正如品牌商能结合自身的线下门店实现基于区域库存和门店的快速物流服务，团队结合自身已有的资产才能更高质量、高效率的实现模块的生产和迭代。同时由于团队面向的业务存在不同的特性，针对这些不同特性的研发、调试链路也是完全不一样的。正如相同的商品在城市这种高密度市场和农村这种低密度市场销售模式可以完全不同，就算是完全相同的模块，也需要在不同的业务能力下去做可集成的开发和调试。比如页面支持LBS切换，那么模块在位置切换后需要做对应的数据切换和展现切换。通常情况下，为了对这些模块做集成调试，就需要页面或者容器提供模拟的LBS切换能力，这个扩展的口子应该是推荐工具链能力所具备的，而实现则需要业务团队自己去集成。

### 商品发布
然后就是模块的发布。商品在平台发布的流程，实际上是一个实体针对这个平台的元数据补全。而为了让商品能够更好的管理，防止出现大量不同商家发布完全相同属性的商品，也就有了产品体系，也就是对商品的标准化。衍生到模块，其实模块自身作为一段可运行代码，其与平台对接的部分不应当存在于模块内部，而应该在进入平台的同时以模块元数据的方式补充到模块上，并在这个补充的过程中对其进行分类和标准化定义。也就是将模块的元数据抽离，让模块更加纯粹，让平台去适应模块，而不是模块适应平台。

### 零配件
而同一个商家在平台针对不同能力的消费者，也会发布不同粒度的商品。比如在捷安特，你不仅能买到完整的自行车，也能买到很多的零部件。而模块本身也可以多粒度发布，也正如前面职责拆分，为技术能力不足的人（运营&产品）提供了完整模块的同时，也为有一定技术能力能自己组装的人（产品&后端&前端）提供了更细粒度的模块。当然所谓完整模块也只不过是一个出厂时的预装搭配，如果不满意也可以自行更换。因此模块的发布链路和模块市场上的元数据的补全都应该支持多粒度，以此扩充整个模块市场中的商品数量，为未来模块的智能化生成提供物料。

### 导购
再就是模块的查找选用，大部分用户进入平台都会采用搜索的方式来查找自己想要的商品。而挑选了对应的商品后，就总是想看一看如果买了它之后的效果。就好比我们装修房子买家具，在购买家具之前总是希望能够看一看，这套家具放在家里是否合适，风格是否协调，因此衍生出了不少AR、VR到家的营销方案。
那么回到模块上面来，则首先需要基于模块的分类和标准化提供强有力的搜索能力。搜索的结果会直接影响使用者的判断，若找不到很有可能就会重新实现一个一样的东西出来。而选出来的模块，也需要给与其搭配试错的场子，看模块与模块之间的搭配是否合理，模块与页面整体是否协调，也就是在模块市场内，能够提供页面的模拟能力以及场景的模拟能力，快速查看模块在不同场景下的效果。

### 物流
再之后是模块的交付，商品在下单购买后会有物流公司将商品从商家或平台的仓库中调拨到对应的城市仓库，再由快递小哥打包运给用户。而这里用户所在的片区其实就是用户的场景。对于商品来说，由于其是实体，也就有运输和库存。但模块好就好在没有繁杂的库存逻辑，所以对应交付模块主要是针对用户的场景做交付，这个已经在之前场景化的模块章节做了详细的阐述，这里就不继续扯淡了。

### 服务
最后是模块的渲染，我个人一直认为，模块的渲染过程其实就是装修，把各种各样的原材料通过合理的方式装修成一个漂亮的房间。而这里装修的过程其实就是商品组装的服务，正如家具的上门安装，京东的上门装机等等。正如装修遇到的用户诉求、用户户型等等因素的不同，装修师傅在样板的基础上都会有很多的可扩展方案，模块的渲染的能力取决于渲染器对于不同业务场景的适配灵活度。这里主要体现在对于特殊定制能力的扩展性上，比如回退拦截、变形吸顶、绝对定位等等。这里面就需要页面的渲染器，也就是页面的装修师傅能提供：
- 规范化的装修流程：对于页面上模块元数据加工到页面DOM的流程足够清晰明确，比如渲染服务的流程整体应该是：页面元数据解析 -> 页面渲染数据准备 -> 页面渲染数据加工 -> 页面渲染
- 样板房：给予规范化的装修流程下，每个步骤提供一个默认的方案，能够实现最基本的页面渲染
- 定制化诉求：当用户对于流程提出一些自己的想法，能够在不影响其他流程的前提下提供一定的定制能力，比如渲染服务可以抽象出：元数据解析器、渲染数据准备器、多个渲染数据处理器、渲染器。每个元件都是插件化，可以动态替换的。
- 施工流程管理：当所有的方案敲定后开始施工，这也就涉及到页面整体生命流程的控制，如各个元件的加载、页面渲染、页面重新绘制等等。

## 总结
> 以上都是我编的，我编不下去了

以上都是我自己对于前端模块化的理解，现在在集团内有非常优秀的前端模块化的解决方案，从研发自动化&智能化到模块市场、到搭建平台到页面渲染，但对于场景化的模块下发能力以及多粒度的模块交付能力目前感觉还是关注的比较少，而FaaS体系还在建设当中，希望未来这些体系融合起来能有更好的模块研发、发布、选用、搭建、渲染体验。