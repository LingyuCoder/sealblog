layout: art
title: 聊一聊前端自动化测试
subtitle: 
tags: 
- 自动化测试
- 工具
categories: 
- 前端工程化
date: 2016/3/7
---

以前不喜欢写测试，主要是觉得编写和维护测试用例非常的浪费时间。在真正写了一段时间的基础组件和基础工具后，才发现自动化测试有很多好处。测试最重要的自然是提升代码质量。代码有测试用例，虽不能说百分百无bug，但至少说明测试用例覆盖到的场景是没有问题的。有测试用例，发布前跑一下，可以杜绝各种疏忽而引起的功能bug。

<!-- more -->

## 前言

### 为何要测试

自动化测试一个重要特点就是快速反馈，反馈越迅速意味着开发效率越高。拿UI组件为例，开发过程都是打开浏览器刷新页面点点点才能确定UI组件工作情况是否符合自己预期。接入自动化测试以后，通过脚本代替这些手动点击，接入代码watch后每次保存文件都能快速得知自己的的改动是否影响功能，节省了很多时间，毕竟机器干事情比人总是要快得多。

有了自动化测试，开发者会更加信任自己的代码。开发者再也不会惧怕将代码交给别人维护，不用担心别的开发者在代码里搞“破坏”。后人接手一段有测试用例的代码，修改起来也会更加从容。测试用例里非常清楚的阐释了开发者和使用者对于这端代码的期望和要求，也非常有利于代码的传承。

### 考虑投入产出比来做测试

说了这么多测试的好处，并不代表一上来就要写出100%场景覆盖的测试用例。个人一直坚持一个观点：**基于投入产出比来做测试**。由于维护测试用例也是一大笔开销（毕竟没有多少测试会专门帮前端写业务测试用例，而前端使用的流程自动化工具更是没有测试参与了）。对于像基础组件、基础模型之类的不常变更且复用较多的部分，可以考虑去写测试用例来保证质量。个人比较倾向于先写少量的测试用例覆盖到80%+的场景，保证覆盖主要使用流程。一些极端场景出现的bug可以在迭代中形成测试用例沉淀，场景覆盖也将逐渐趋近100%。但对于迭代较快的业务逻辑以及生存时间不长的活动页面之类的就别花时间写测试用例了，维护测试用例的时间大了去了，成本太高。

## Node.js模块的测试

对于Node.js的模块，测试算是比较方便的，毕竟源码和依赖都在本地，看得见摸得着。

### 测试工具

测试主要使用到的工具是测试框架、断言库以及代码覆盖率工具：

1. 测试框架：[Mocha](https://mochajs.org/)、[Jasmine](http://jasmine.github.io/)等等，测试主要提供了清晰简明的语法来描述测试用例，以及对测试用例分组，测试框架会抓取到代码抛出的AssertionError，并增加一大堆附加信息，比如那个用例挂了，为什么挂等等。测试框架通常提供TDD（测试驱动开发）或BDD（行为驱动开发）的测试语法来编写测试用例，关于TDD和BDD的对比可以看一篇比较知名的文章[The Difference Between TDD and BDD](http://joshldavis.com/2013/05/27/difference-between-tdd-and-bdd/)。不同的测试框架支持不同的测试语法，比如Mocha既支持TDD也支持BDD，而Jasmine只支持BDD。这里后续以Mocha的BDD语法为例
2. 断言库：[Should.js](https://shouldjs.github.io/)、[chai](http://chaijs.com/)、[expect.js](https://github.com/Automattic/expect.js)等等，断言库提供了很多语义化的方法来对值做各种各样的判断。当然也可以不用断言库，Node.js中也可以直接使用[原生assert库](https://nodejs.org/api/assert.html)。这里后续以Should.js为例
3. 代码覆盖率：[istanbul](https://github.com/gotwarlost/istanbul)等等为代码在语法级分支上打点，运行了打点后的代码，根据运行结束后收集到的信息和打点时的信息来统计出当前测试用例的对源码的覆盖情况。

### 一个煎蛋的栗子

以如下的Node.js项目结构为例

```
.
├── LICENSE
├── README.md
├── index.js
├── node_modules
├── package.json
└── test
    └── test.js
```

首先自然是安装工具，这里先装测试框架和断言库：`npm install --save-dev mocha should`。装完后就可以开始测试之旅了。

比如当前有一段js代码，放在`index.js`里

```js
'use strict';
module.exports = () => 'Hello Tmall';
```

那么对于这么一个函数，首先需要定一个测试用例，这里很明显，运行函数，得到字符串`Hello Tmall`就算测试通过。那么就可以按照Mocha的写法来写一个测试用例，因此新建一个测试代码在`test/index.js`

```js
'use strict';
require('should');
const mylib = require('../index');

describe('My First Test', () => {
  it('should get "Hello Tmall"', () => {
    mylib().should.be.eql('Hello Tmall');
  });
});
```

测试用例写完了，那么怎么知道测试结果呢？

由于我们之前已经安装了Mocha，可以在node_modules里面找到它，Mocha提供了命令行工具_mocha，可以直接在`./node_modules/.bin/_mocha`找到它，运行它就可以执行测试了：

![Hello Tmall](https://img.alicdn.com/tps/TB12qJ5LVXXXXbHXFXXXXXXXXXX-930-322.png)

这样就可以看到测试结果了。同样我们可以故意让测试不通过，修改`test.js`代码为：

```js
'use strict';
require('should');
const mylib = require('../index');

describe('My First Test', () => {
  it('should get "Hello Taobao"', () => {
    mylib().should.be.eql('Hello Taobao');
  });
});
```

就可以看到下图了：

![Taobao is different with Tmall](https://img.alicdn.com/tps/TB1Uid7LVXXXXXNXFXXXXXXXXXX-1150-706.png)

Mocha实际上支持很多参数来提供很多灵活的控制，比如使用`./node_modules/.bin/_mocha --require should`，Mocha在启动测试时就会自己去加载Should.js，这样`test/test.js`里就不需要手动`require('should');`了。更多参数配置可以查阅[Mocha官方文档](http://mochajs.org/)。

那么这些测试代码分别是啥意思呢？

这里首先引入了断言库Should.js，然后引入了自己的代码，这里`it()`函数定义了一个测试用例，通过Should.js提供的api，可以非常语义化的描述测试用例。那么describe又是干什么的呢？

`describe`干的事情就是给测试用例分组。为了尽可能多的覆盖各种情况，测试用例往往会有很多。这时候通过分组就可以比较方便的管理（这里提一句，`describe`是可以嵌套的，也就是说外层分组了之后，内部还可以分子组）。另外还有一个非常重要的特性，就是每个分组都可以进行预处理（`before`、`beforeEach`）和后处理（`after`, `afterEach`）。

如果把`index.js`源码改为：

```js
'use strict';
module.exports = bu => `Hello ${bu}`;
```

为了测试不同的bu，测试用例也对应的改为：

```js
'use strict';
require('should');
const mylib = require('../index');
let bu = 'none';

describe('My First Test', () => {
  describe('Welcome to Tmall', () => {
    before(() => bu = 'Tmall');
    after(() => bu = 'none');
    it('should get "Hello Tmall"', () => {
      mylib(bu).should.be.eql('Hello Tmall');
    });
  });
  describe('Welcome to Taobao', () => {
    before(() => bu = 'Taobao');
    after(() => bu = 'none');
    it('should get "Hello Taobao"', () => {
      mylib(bu).should.be.eql('Hello Taobao');
    });
  });
});
```

同样运行一下`./node_modules/.bin/_mocha`就可以看到如下图：

![all bu welcomes you](https://img.alicdn.com/tps/TB1KwBQLVXXXXbkaXXXXXXXXXXX-824-456.png)

这里`before`会在每个分组的所有测试用例运行前，相对的`after`则会在所有测试用例运行后执行，如果要以测试用例为粒度，可以使用`beforeEach`和`afterEach`，这两个钩子则会分别在该分组每个测试用例运行前和运行后执行。由于很多代码都需要模拟环境，可以再这些`before`或`beforeEach`做这些准备工作，然后在`after`或`afterEach`里做回收操作。

### 异步代码的测试

#### 回调

这里很显然代码都是同步的，但很多情况下我们的代码都是异步执行的，那么异步的代码要怎么测试呢？

比如这里`index.js`的代码变成了一段异步代码：

```js
'use strict';
module.exports = (bu, callback) => process.nextTick(() => callback(`Hello ${bu}`));
```

由于源代码变成异步，所以测试用例就得做改造：

```js
'use strict';
require('should');
const mylib = require('../index');

describe('My First Test', () => {
  it('Welcome to Tmall', done => {
    mylib('Tmall', rst => {
      rst.should.be.eql('Hello Tmall');
      done();
    });
  });
});
```

这里传入`it`的第二个参数的函数新增了一个`done`参数，当有这个参数时，这个测试用例会被认为是异步测试，只有在`done()`执行时，才认为测试结束。那如果`done()`一直没有执行呢？Mocha会触发自己的超时机制，超过一定时间（默认是2s，时长可以通过`--timeout`参数设置）就会自动终止测试，并以测试失败处理。

当然，`before`、`beforeEach`、`after`、`afterEach`这些钩子，同样支持异步，使用方式和`it`一样，在传入的函数第一个参数加上done，然后在执行完成后执行即可。

#### Promise

平常我们直接写回调会感觉自己很low，也容易出现回调金字塔，我们可以使用Promise来做异步控制，那么对于Promise控制下的异步代码，我们要怎么测试呢？

首先把源码做点改造，返回一个Promise对象：

```js
'use strict';
module.exports = bu => new Promise(resolve => resolve(`Hello ${bu}`));
```

当然，如果是co党也可以直接使用co包裹：

```js
'use strict';
const co = require('co');
module.exports = co.wrap(function* (bu) {
  return `Hello ${bu}`;
});
```

对应的修改测试用例如下：

```js
'use strict';
require('should');
const mylib = require('../index');

describe('My First Test', () => {
  it('Welcome to Tmall', () => {
    return mylib('Tmall').should.be.fulfilledWith('Hello Tmall');
  });
});
```

Should.js在8.x.x版本自带了Promise支持，可以直接使用`fullfilled()`、`rejected()`、`fullfilledWith()`、`rejectedWith()`等等一系列API测试Promise对象。

> 注意：使用should测试Promise对象时，请一定要return，一定要return，一定要return，否则断言将无效

#### 异步运行测试

有时候，我们可能并不只是某个测试用例需要异步，而是整个测试过程都需要异步执行。比如测试Gulp插件的一个方案就是，首先运行Gulp任务，完成后测试生成的文件是否和预期的一致。那么如何异步执行整个测试过程呢？

其实Mocha提供了异步启动测试，只需要在启动Mocha的命令后加上`--delay`参数，Mocha就会以异步方式启动。这种情况下我们需要告诉Mocha什么时候开始跑测试用例，只需要执行`run()`方法即可。把刚才的`test/test.js`修改成下面这样：

```js
'use strict';
require('should');
const mylib = require('../index');

setTimeout(() => {
  describe('My First Test', () => {
    it('Welcome to Tmall', () => {
      return mylib('Tmall').should.be.fulfilledWith('Hello Tmall');
    });
  });
  run();
}, 1000);
```

直接执行`./node_modules/.bin/_mocha`就会发生下面这样的杯具：

![no cases](https://img.alicdn.com/tps/TB1ZxtSLVXXXXc_XVXXXXXXXXXX-826-178.png)

那么加上`--delay`试试：

![oh my green](https://img.alicdn.com/tps/TB11.R0LVXXXXXqXVXXXXXXXXXX-838-306.png)

熟悉的绿色又回来了！

#### 代码覆盖率

单元测试玩得差不多了，可以开始试试代码覆盖率了。首先需要安装代码覆盖率工具istanbul：`npm install --save-dev istanbul`，istanbul同样有命令行工具，在`./node_modules/.bin/istanbul`可以寻觅到它的身影。Node.js端做代码覆盖率测试很简单，只需要用istanbul启动Mocha即可，比如上面那个测试用例，运行`./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- --delay`，可以看到下图：

![my first coverage](https://img.alicdn.com/tps/TB1xmhULVXXXXXhaXXXXXXXXXXX-1296-848.jpg)

这就是代码覆盖率结果了，因为index.js中的代码比较简单，所以直接就100%了，那么修改一下源码，加个if吧：

```js
'use strict';
module.exports = bu => new Promise(resolve => {
  if (bu === 'Tmall') return resolve(`Welcome to Tmall`);
  resolve(`Hello ${bu}`);
});

```

测试用例也跟着变一下：

```js
'use strict';
require('should');
const mylib = require('../index');

setTimeout(() => {
  describe('My First Test', () => {
    it('Welcome to Tmall', () => {
      return mylib('Tmall').should.be.fulfilledWith('Welcome to Tmall');
    });
  });
  run();
}, 1000);
```

换了姿势，我们再来一次`./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- --delay`，可以得到下图：

![coverage again](https://img.alicdn.com/tps/TB1slV0LVXXXXaDXVXXXXXXXXXX-1286-830.jpg)

> 当使用istanbul运行Mocha时，istanbul命令自己的参数放在`--`之前，需要传递给Mocha的参数放在`--`之后

如预期所想，覆盖率不再是100%了，这时候我想看看哪些代码被运行了，哪些没有，怎么办呢？

运行完成后，项目下会多出一个`coverage`文件夹，这里就是放代码覆盖率结果的地方，它的结构大致如下：

```
.
├── coverage.json
├── lcov-report
│   ├── base.css
│   ├── index.html
│   ├── prettify.css
│   ├── prettify.js
│   ├── sort-arrow-sprite.png
│   ├── sorter.js
│   └── test
│       ├── index.html
│       └── index.js.html
└── lcov.info
```

* coverage.json和lcov.info：测试结果描述的json文件，这个文件可以被一些工具读取，生成可视化的代码覆盖率结果，这个文件后面接入持续集成时还会提到。
* lcov-report：通过上面两个文件由工具处理后生成的覆盖率结果页面，打开可以非常直观的看到代码的覆盖率

这里`open coverage/lcov-report/index.html`可以看到文件目录，点击对应的文件进入到文件详情，可以看到`index.js`的覆盖率如图所示：

![coverage report](https://img.alicdn.com/tps/TB1VChTLVXXXXX2aXXXXXXXXXXX-1196-434.png)

这里有四个指标，通过这些指标，可以量化代码覆盖情况：

* statements：可执行语句执行情况
* branches：分支执行情况，比如if就会产生两个分支，我们只运行了其中的一个
* Functions：函数执行情况
* Lines：行执行情况

下面代码部分，没有被执行过得代码会被标红，这些标红的代码往往是bug滋生的土壤，我们要尽可能消除这些红色。为此我们添加一个测试用例：

```js
'use strict';
require('should');
const mylib = require('../index');

setTimeout(() => {
  describe('My First Test', () => {
    it('Welcome to Tmall', () => {
      return mylib('Tmall').should.be.fulfilledWith('Welcome to Tmall');
    });
    it('Hello Taobao', () => {
      return mylib('Taobao').should.be.fulfilledWith('Hello Taobao');
    });
  });
  run();
}, 1000);
```

再来一次`./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- --delay`，重新打开覆盖率页面，可以看到红色已经消失了，覆盖率100%。目标完成，可以睡个安稳觉了


### 集成到package.json

好了，一个简单的Node.js测试算是做完了，这些测试任务都可以集中写到`package.json`的`scripts`字段中，比如：

```json
{
  "scripts": {
    "test": "NODE_ENV=test ./node_modules/.bin/_mocha --require should",
    "cov": "NODE_ENV=test ./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- --delay"
  },
}
```

这样直接运行`npm run test`就可以跑单元测试，运行`npm run cov`就可以跑代码覆盖率测试了，方便快捷

### 对多个文件分别做测试

通常我们的项目都会有很多文件，比较推荐的方法是**对每个文件单独去做测试**。比如代码在`./lib/`下，那么`./lib/`文件夹下的每个文件都应该对应一个`./test/`文件夹下的`文件名_spec.js`的测试文件

为什么要这样呢？不能直接运行`index.js`入口文件做测试吗？

直接从入口文件来测其实是黑盒测试，我们并不知道代码内部运行情况，只是看某个特定的输入能否得到期望的输出。这通常可以覆盖到一些主要场景，但是在代码内部的一些边缘场景，就很难直接通过从入口输入特定的数据来解决了。比如代码里需要发送一个请求，入口只是传入一个url，url本身正确与否只是一个方面，当时的网络状况和服务器状况是无法预知的。传入相同的url，可能由于服务器挂了，也可能因为网络抖动，导致请求失败而抛出错误，如果这个错误没有得到处理，很可能导致故障。因此我们需要把黑盒打开，对其中的每个小块做白盒测试。

当然，并不是所有的模块测起来都这么轻松，前端用Node.js常干的事情就是写构建插件和自动化工具，典型的就是Gulp插件和命令行工具，那么这俩种特定的场景要怎么测试呢？

### Gulp插件的测试

现在前端构建使用最多的就是Gulp了，它简明的API、流式构建理念、以及在内存中操作的性能，让它备受追捧。虽然现在有像webpack这样的后起之秀，但Gulp依旧凭借着其繁荣的生态圈担当着前端构建的绝对主力。目前天猫前端就是使用Gulp作为代码构建工具。

用了Gulp作为构建工具，也就免不了要开发Gulp插件来满足业务定制化的构建需求，构建过程本质上其实是对源代码进行修改，如果修改过程中出现bug很可能直接导致线上故障。因此针对Gulp插件，尤其是会修改源代码的Gulp插件一定要做仔细的测试来保证质量。

#### 又一个煎蛋的栗子

比如这里有个煎蛋的Gulp插件，功能就是往所有js代码前加一句注释`// 天猫前端招人，有意向的请发送简历至lingyucoder@gmail.com`，Gulp插件的代码大概就是这样：


```js
'use strict';

const _ = require('lodash');
const through = require('through2');
const PluginError = require('gulp-util').PluginError;
const DEFAULT_CONFIG = {};

module.exports = config => {
  config = _.defaults(config || {}, DEFAULT_CONFIG);
  return through.obj((file, encoding, callback) => {
    if (file.isStream()) return callback(new PluginError('gulp-welcome-to-tmall', `Stream is not supported`));
    file.contents = new Buffer(`// 天猫前端招人，有意向的请发送简历至lingyucoder@gmail.com\n${file.contents.toString()}`);
    callback(null, file);
  });
};
```

对于这么一段代码，怎么做测试呢？

一种方式就是直接伪造一个文件传入，Gulp内部实际上是通过vinyl-fs从操作系统读取文件并做成虚拟文件对象，然后将这个虚拟文件对象交由through2创造的Transform来改写流中的内容，而外层任务之间通过orchestrator控制，保证执行顺序（如果不了解可以看看这篇翻译文章[Gulp思维——Gulp高级技巧](https://segmentfault.com/a/1190000000711469)）。当然一个插件不需要关心Gulp的任务管理机制，只需要关心传入一个vinyl对象能否正确处理。因此只需要伪造一个虚拟文件对象传给我们的Gulp插件就可以了。

首先设计测试用例，考虑两个主要场景：

1. 虚拟文件对象是流格式的，应该抛出错误
2. 虚拟文件对象是Buffer格式的，能够正常对文件内容进行加工，加工完的文件加上`// 天猫前端招人，有意向的请发送简历至lingyucoder@gmail.com`的头

对于第一个测试用例，我们需要创建一个流格式的vinyl对象。而对于各第二个测试用例，我们需要创建一个Buffer格式的vinyl对象。

当然，首先我们需要一个被加工的源文件，放到`test/src/testfile.js`下吧：

```js
'use strict';
console.log('hello world');
```

这个源文件非常简单，接下来的任务就是把它分别封装成流格式的vinyl对象和Buffer格式的vinyl对象。

##### 构建Buffer格式的虚拟文件对象

构建一个Buffer格式的虚拟文件对象可以用vinyl-fs读取操作系统里的文件生成vinyl对象，Gulp内部也是使用它，默认使用Buffer：

```js
'use strict';
require('should');
const path = require('path');
const vfs = require('vinyl-fs');
const welcome = require('../index');

describe('welcome to Tmall', function() {
  it('should work when buffer', done => {
    vfs.src(path.join(__dirname, 'src', 'testfile.js'))
      .pipe(welcome())
      .on('data', function(vf) {
        vf.contents.toString().should.be.eql(`// 天猫前端招人，有意向的请发送简历至lingyucoder@gmail.com\n'use strict';\nconsole.log('hello world');\n`);
        done();
      });
  });
});
```

这样测了Buffer格式后算是完成了主要功能的测试，那么要如何测试流格式呢？

##### 构建流格式的虚拟文件对象

方案一和上面一样直接使用vinyl-fs，增加一个参数`buffer: false`即可：

把代码修改成这样：

```js
'use strict';
require('should');
const path = require('path');
const vfs = require('vinyl-fs');
const PluginError = require('gulp-util').PluginError;
const welcome = require('../index');

describe('welcome to Tmall', function() {
  it('should work when buffer', done => {
    // blabla
  });
  it('should throw PluginError when stream', done => {
    vfs.src(path.join(__dirname, 'src', 'testfile.js'), {
      buffer: false
    })
      .pipe(welcome())
      .on('error', e => {
        e.should.be.instanceOf(PluginError);
        done();
      });
  });
});
```

这样vinyl-fs直接从文件系统读取文件并生成流格式的vinyl对象。

如果内容并不来自于文件系统，而是来源于一个已经存在的可读流，要怎么把它封装成一个流格式的vinyl对象呢？

这样的需求可以借助`vinyl-source-stream`：

```js
'use strict';
require('should');
const fs = require('fs');
const path = require('path');
const source = require('vinyl-source-stream');
const vfs = require('vinyl-fs');
const PluginError = require('gulp-util').PluginError;
const welcome = require('../index');

describe('welcome to Tmall', function() {
  it('should work when buffer', done => {
    // blabla
  });
  it('should throw PluginError when stream', done => {
    fs.createReadStream(path.join(__dirname, 'src', 'testfile.js'))
      .pipe(source())
      .pipe(welcome())
      .on('error', e => {
        e.should.be.instanceOf(PluginError);
        done();
      });
  });
});
```

这里首先通过`fs.createReadStream`创建了一个可读流，然后通过vinyl-source-stream把这个可读流包装成流格式的vinyl对象，并交给我们的插件做处理

> Gulp插件执行错误时请抛出PluginError，这样能够让gulp-plumber这样的插件进行错误管理，防止错误终止构建进程，这在gulp watch时非常有用

#### 模拟Gulp运行

我们伪造的对象已经可以跑通功能测试了，但是这数据来源终究是自己伪造的，并不是用户日常的使用方式。如果采用最接近用户使用的方式来做测试，测试结果才更加可靠和真实。那么问题来了，怎么模拟真实的Gulp环境来做Gulp插件的测试呢？

首先模拟一下我们的项目结构：

```
test
├── build
│   └── testfile.js
├── gulpfile.js
└── src
    └── testfile.js
```

一个简易的项目结构，源码放在src下，通过gulpfile来指定任务，构建结果放在build下。按照我们平常使用方式在`test`目录下搭好架子，并且写好gulpfile.js：

```js
'use strict';
const gulp = require('gulp');
const welcome = require('../index');
const del = require('del');

gulp.task('clean', cb => del('build', cb));

gulp.task('default', ['clean'], () => {
  return gulp.src('src/**/*')
    .pipe(welcome())
    .pipe(gulp.dest('build'));
});
```

接着在测试代码里来模拟Gulp运行了，这里有两种方案：

1. 使用child_process库提供的`spawn`或`exec`开子进程直接跑`gulp`命令，然后测试build目录下是否是想要的结果
2. 直接在当前进程获取gulpfile中的Gulp实例来运行Gulp任务，然后测试build目录下是否是想要的结果

开子进程进行测试有一些坑，istanbul测试代码覆盖率时时无法跨进程的，因此开子进程测试，首先需要子进程执行命令时加上istanbul，然后还需要手动去收集覆盖率数据，当开启多个子进程时还需要自己做覆盖率结果数据合并，相当麻烦。

那么不开子进程怎么做呢？可以借助run-gulp-task这个工具来运行，其内部的机制就是首先获取gulpfile文件内容，在文件尾部加上`module.exports = gulp;`后require gulpfile从而获取Gulp实例，然后将Gulp实例递交给run-sequence调用内部未开放的API`gulp.run`来运行。

我们采用不开子进程的方式，把运行Gulp的过程放在`before`钩子中，测试代码变成下面这样：


```js
'use strict';
require('should');
const path = require('path');
const run = require('run-gulp-task');
const CWD = process.cwd();
const fs = require('fs');

describe('welcome to Tmall', () => {
  before(done => {
    process.chdir(__dirname);
    run('default', path.join(__dirname, 'gulpfile.js'))
      .catch(e => e)
      .then(e => {
        process.chdir(CWD);
        done(e);
      });
  });
  it('should work', function() {
    fs.readFileSync(path.join(__dirname, 'build', 'testfile.js')).toString().should.be.eql(`// 天猫前端招人，有意向的请发送简历至lingyucoder@gmail.com\n'use strict';\nconsole.log('hello world');\n`);
  });
});
```

这样由于不需要开子进程，代码覆盖率测试也可以和普通Node.js模块一样了

### 测试命令行输出

#### 双一个煎蛋的栗子

当然前端写工具并不只限于Gulp插件，偶尔还会写一些辅助命令啥的，这些辅助命令直接在终端上运行，结果也会直接展示在终端上。比如一个简单的使用commander实现的命令行工具：

```js
// in index.js
'use strict';
const program = require('commander');
const path = require('path');
const pkg = require(path.join(__dirname, 'package.json'));

program.version(pkg.version)
  .usage('[options] <file>')
  .option('-t, --test', 'Run test')
  .action((file, prog) => {
    if (prog.test) console.log('test');
  });

module.exports = program;

// in bin/cli
#!/usr/bin/env node
'use strict';
const program = require('../index.js');

program.parse(process.argv);

!program.args[0] && program.help();

// in package.json
{
  "bin": {
    "cli-test": "./bin/cli"
  }
}
```

#### 拦截输出

要测试命令行工具，自然要模拟用户输入命令，这一次依旧选择不开子进程，直接用伪造一个`process.argv`交给`program.parse`即可。命令输入了问题也来了，数据是直接`console.log`的，要怎么拦截呢？

这可以借助sinon来拦截`console.log`，而且sinon非常贴心的提供了mocha-sinon方便测试用，这样`test.js`大致就是这个样子:

```js
'use strict';
require('should');
require('mocha-sinon');
const program = require('../index');
const uncolor = require('uncolor');

describe('cli-test', () => {
  let rst;
  beforeEach(function() {
    this.sinon.stub(console, 'log', function() {
      rst = arguments[0];
    });
  });
  it('should print "test"', () => {
    program.parse([
      'node',
      './bin/cli',
      '-t',
      'file.js'
    ]);
    return uncolor(rst).trim().should.be.eql('test');
  });
});
```

> PS：由于命令行输出时经常会使用colors这样的库来添加颜色，因此在测试时记得用uncolor把这些颜色移除

### 小结

Node.js相关的单元测试就扯这么多了，还有很多场景像服务器测试什么的就不扯了，因为我不会。当然前端最主要的工作还是写页面，接下来扯一扯如何对页面上的组件做测试。

## 页面测试

对于浏览器里跑的前端代码，做测试要比Node.js模块要麻烦得多。Node.js模块纯js代码，使用V8运行在本地，测试用的各种各样的依赖和工具都能快速的安装，而前端代码不仅仅要测试js，CSS等等，更麻烦的事需要模拟各种各样的浏览器，比较常见的前端代码测试方案有下面几种：

1. 构建一个测试页面，人肉直接到虚拟机上开各种浏览器跑测试页面（比如公司的f2etest）。这个方案的缺点就是不好做代码覆盖率测试，也不好持续化集成，同时人肉工作较多
2. 使用PhantomJS构建一个伪造的浏览器环境跑单元测试，好处是解决了代码覆盖率问题，也可以做持续集成。这个方案的缺点是PhantomJS毕竟是Qt的webkit，并不是真实浏览器环境，PhantomJS也有各种各样兼容性坑
3. 通过Karma调用本机各种浏览器进行测试，好处是可以跨浏览器做测试，也可以测试覆盖率，但持续集成时需要注意只能开PhantomJS做测试，毕竟集成的Linux环境不可能有浏览器。这可以说是目前看到的最好的前端代码测试方式了

> 这里以gulp为构建工具做测试，后面在React组件测试部分再介绍以webpack为构建工具做测试

### 叒一个煎蛋的栗子

前端代码依旧是js，一样可以用Mocha+Should.js来做单元测试。打开node_modules下的Mocha和Should.js，你会发现这些优秀的开源工具已经非常贴心的提供了可在浏览器中直接运行的版本：`mocha/mocha.js`和`should/should.min.js`，只需要把他们通过`script`标签引入即可，另外Mocha还需要引入自己的样式`mocha/mocha.css`

首先看一下我们的前端项目结构：

```
.
├── gulpfile.js
├── package.json
├── src
│   └── index.js
└── test
    ├── test.html
    └── test.js
```

比如这里源码`src/index.js`就是定义一个全局函数：

```js
window.render = function() {
  var ctn = document.createElement('div');
  ctn.setAttribute('id', 'tmall');
  ctn.appendChild(document.createTextNode('天猫前端招人，有意向的请发送简历至lingyucoder@gmail.com'));
  document.body.appendChild(ctn);
}
```

而测试页面`test/test.html`大致上是这个样子：

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="../node_modules/mocha/mocha.css"/>
  <script src="../node_modules/mocha/mocha.js"></script>
  <script src="../node_modules/should/should.js"></script>
</head>

<body>
  <div id="mocha"></div>
  <script src="../src/index.js"></script>
  <script src="test.js"></script>
</body>

</html>
```

head里引入了测试框架Mocha和断言库Should.js，测试的结果会被显示在`<div id="mocha"></div>`这个容器里，而`test/test.js`里则是我们的测试的代码。

前端页面上测试和Node.js上测试没啥太大不同，只是需要指定Mocha使用的UI，并需要手动调用`mocha.run()`：

```js
mocha.ui('bdd');
describe('Welcome to Tmall', function() {
  before(function() {
    window.render();
  });
  it('Hello', function() {
    document.getElementById('tmall').textContent.should.be.eql('天猫前端招人，有意向的请发送简历至lingyucoder@gmail.com');
  });
});
mocha.run();
```

在浏览器里打开`test/test.html`页面，就可以看到效果了：

![test page](https://img.alicdn.com/tps/TB11u5oLVXXXXbQXXXXXXXXXXXX-1656-492.png)

在不同的浏览器里打开这个页面，就可以看到当前浏览器的测试了。这种方式能兼容最多的浏览器，当然要跨机器之前记得把资源上传到一个测试机器都能访问到的地方，比如CDN。

测试页面有了，那么来试试接入PhantomJS吧

### 使用PhantomJS进行测试

PhantomJS是一个模拟的浏览器，它能执行js，甚至还有webkit渲染引擎，只是没有浏览器的界面上渲染结果罢了。我们可以使用它做很多事情，比如对网页进行截图，写爬虫爬取异步渲染的页面，以及接下来要介绍的——对页面做测试。

当然，这里我们不是直接使用PhantomJS，而是使用mocha-phantomjs来做测试。`npm install --save-dev mocha-phantomjs`安装完成后，就可以运行命令`./node_modules/.bin/mocha-phantomjs ./test/test.html`来对上面那个`test/test.html`的测试了：

![PhantomJS test](https://img.alicdn.com/tps/TB1qUt1LVXXXXaRaXXXXXXXXXXX-934-324.png)

单元测试没问题了，接下来就是代码覆盖率测试

#### 覆盖率打点

首先第一步，改写我们的`gulpfile.js`：

```js
'use strict';
const gulp = require('gulp');
const istanbul = require('gulp-istanbul');

gulp.task('test', function() {
  return gulp.src(['src/**/*.js'])
    .pipe(istanbul({
      coverageVariable: '__coverage__'
    }))
    .pipe(gulp.dest('build-test'));
});
```

这里把覆盖率结果保存到`__coverage__`里面，把打完点的代码放到`build-test`目录下，比如刚才的`src/index.js`的代码，在运行`gulp test`后，会生成`build-test/index.js`，内容大致是这个样子：

```js
var __cov_WzFiasMcIh_mBvAjOuQiQg = (Function('return this'))();
if (!__cov_WzFiasMcIh_mBvAjOuQiQg.__coverage__) { __cov_WzFiasMcIh_mBvAjOuQiQg.__coverage__ = {}; }
__cov_WzFiasMcIh_mBvAjOuQiQg = __cov_WzFiasMcIh_mBvAjOuQiQg.__coverage__;
if (!(__cov_WzFiasMcIh_mBvAjOuQiQg['/Users/lingyu/gitlab/dev/mui/test-page/src/index.js'])) {
   __cov_WzFiasMcIh_mBvAjOuQiQg['/Users/lingyu/gitlab/dev/mui/test-page/src/index.js'] = {"path":"/Users/lingyu/gitlab/dev/mui/test-page/src/index.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"(anonymous_1)","line":1,"loc":{"start":{"line":1,"column":16},"end":{"line":1,"column":27}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":6,"column":1}},"2":{"start":{"line":2,"column":2},"end":{"line":2,"column":42}},"3":{"start":{"line":3,"column":2},"end":{"line":3,"column":34}},"4":{"start":{"line":4,"column":2},"end":{"line":4,"column":85}},"5":{"start":{"line":5,"column":2},"end":{"line":5,"column":33}}},"branchMap":{}};
}
__cov_WzFiasMcIh_mBvAjOuQiQg = __cov_WzFiasMcIh_mBvAjOuQiQg['/Users/lingyu/gitlab/dev/mui/test-page/src/index.js'];
__cov_WzFiasMcIh_mBvAjOuQiQg.s['1']++;window.render=function(){__cov_WzFiasMcIh_mBvAjOuQiQg.f['1']++;__cov_WzFiasMcIh_mBvAjOuQiQg.s['2']++;var ctn=document.createElement('div');__cov_WzFiasMcIh_mBvAjOuQiQg.s['3']++;ctn.setAttribute('id','tmall');__cov_WzFiasMcIh_mBvAjOuQiQg.s['4']++;ctn.appendChild(document.createTextNode('天猫前端招人\uFF0C有意向的请发送简历至lingyucoder@gmail.com'));__cov_WzFiasMcIh_mBvAjOuQiQg.s['5']++;document.body.appendChild(ctn);};
```

这都什么鬼！不管了，反正运行它就好。把`test/test.html`里面引入的代码从`src/index.js`修改为`build-test/index.js`，保证页面运行时使用的是编译后的代码。

#### 编写钩子

运行数据会存放到变量`__coverage__`里，但是我们还需要一段钩子代码在单元测试结束后获取这个变量里的内容。把钩子代码放在`test/hook.js`下，里面内容这样写：

```js
'use strict';

var fs = require('fs');

module.exports = {
  afterEnd: function(runner) {
    var coverage = runner.page.evaluate(function() {
      return window.__coverage__;
    });
    if (coverage) {
      console.log('Writing coverage to coverage/coverage.json');
      fs.write('coverage/coverage.json', JSON.stringify(coverage), 'w');
    } else {
      console.log('No coverage data generated');
    }
  }
};
```

这样准备工作工作就大功告成了，执行命令`./node_modules/.bin/mocha-phantomjs ./test/test.html --hooks ./test/hook.js`，可以看到如下图结果，同时覆盖率结果被写入到`coverage/coverage.json`里面了。

![coverage hook](https://img.alicdn.com/tps/TB1goylLVXXXXc8XXXXXXXXXXXX-1356-416.png)

#### 生成页面

有了结果覆盖率结果就可以生成覆盖率页面了，首先看看覆盖率概况吧。执行命令`./node_modules/.bin/istanbul report --root coverage text-summary`，可以看到下图：

![coverage summary](https://img.alicdn.com/tps/TB1dC5kLVXXXXXRXpXXXXXXXXXX-1338-354.png)

还是原来的配方，还是想熟悉的味道。接下来运行`./node_modules/.bin/istanbul report --root coverage lcov`生成覆盖率页面，执行完后`open coverage/lcov-report/index.html`，点击进入到`src/index.js`：

![coverage page](https://img.alicdn.com/tps/TB1ZqV.LVXXXXXFXVXXXXXXXXXX-1480-470.png)

一颗赛艇！这样我们对前端代码就能做覆盖率测试了

### 接入Karma

[Karma](https://karma-runner.github.io/0.13/index.html)是一个测试集成框架，可以方便地以插件的形式集成测试框架、测试环境、覆盖率工具等等。Karma已经有了一套相当完善的插件体系，这里尝试在PhantomJS、Chrome、FireFox下做测试，首先需要使用npm安装一些依赖：

1. karma：框架本体
2. karma-mocha：Mocha测试框架
3. karma-coverage：覆盖率测试
4. karma-spec-reporter：测试结果输出
5. karma-phantomjs-launcher：PhantomJS环境
6. phantomjs-prebuilt: PhantomJS最新版本
7. karma-chrome-launcher：Chrome环境
8. karma-firefox-launcher：Firefox环境


安装完成后，就可以开启我们的Karma之旅了。还是之前的那个项目，我们把该清除的清除，只留下源文件和而是文件，并增加一个karma.conf.js文件：

```
.
├── karma.conf.js
├── package.json
├── src
│   └── index.js
└── test
    └── test.js
```

`karma.conf.js`是Karma框架的配置文件，在这个例子里，它大概是这个样子：

```js
'use strict';

module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    files: [
      './node_modules/should/should.js',
      'src/**/*.js',
      'test/**/*.js'
    ],
    preprocessors: {
      'src/**/*.js': ['coverage']
    },
    plugins: ['karma-mocha', 'karma-phantomjs-launcher', 'karma-chrome-launcher', 'karma-firefox-launcher', 'karma-coverage', 'karma-spec-reporter'],
    browsers: ['PhantomJS', 'Firefox', 'Chrome'],
    reporters: ['spec', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [{
        type: 'json',
        subdir: '.',
        file: 'coverage.json',
      }, {
        type: 'lcov',
        subdir: '.'
      }, {
        type: 'text-summary'
      }]
    }
  });
};
```

这些配置都是什么意思呢？这里挨个说明一下：

- frameworks: 使用的测试框架，这里依旧是我们熟悉又亲切的Mocha
- files：测试页面需要加载的资源，上面的test目录下已经没有test.html了，所有需要加载内容都在这里指定，如果是CDN上的资源，直接写URL也可以，不过建议尽可能使用本地资源，这样测试更快而且即使没网也可以测试。这个例子里，第一行载入的是断言库Should.js，第二行是src下的所有代码，第三行载入测试代码
- preprocessors：配置预处理器，在上面files载入对应的文件前，如果在这里配置了预处理器，会先对文件做处理，然后载入处理结果。这个例子里，需要对src目录下的所有资源添加覆盖率打点（这一步之前是通过gulp-istanbul来做，现在karma-coverage框架可以很方便的处理，也不需要钩子啥的了）。后面做React组件测试时也会在这里使用webpack
- plugins：安装的插件列表
- browsers：需要测试的浏览器，这里我们选择了PhantomJS、FireFox、Chrome
- reporters：需要生成哪些代码报告
- coverageReporter：覆盖率报告要如何生成，这里我们期望生成和之前一样的报告，包括覆盖率页面、lcov.info、coverage.json、以及命令行里的提示


好了，配置完成，来试试吧，运行`./node_modules/karma/bin/karma start --single-run`，可以看到如下输出：

![run karma](https://img.alicdn.com/tps/TB1QzGnLVXXXXXeXpXXXXXXXXXX-2076-1632.jpg)

可以看到，Karma首先会在9876端口开启一个本地服务，然后分别启动PhantomJS、FireFox、Chrome去加载这个页面，收集到测试结果信息之后分别输出，这样跨浏览器测试就解决啦。如果要新增浏览器就安装对应的浏览器插件，然后在`browsers`里指定一下即可，非常灵活方便。

那如果我的mac电脑上没有IE，又想测IE，怎么办呢？可以直接运行`./node_modules/karma/bin/karma start`启动本地服务器，然后使用其他机器开对应浏览器直接访问本机的9876端口（当然这个端口是可配置的）即可，同样移动端的测试也可以采用这个方法。这个方案兼顾了前两个方案的优点，弥补了其不足，是目前看到最优秀的前端代码测试方案了

### React组件测试

去年React旋风一般席卷全球，当然天猫也在技术上紧跟时代脚步。天猫商家端业务已经全面切入React，形成了React组件体系，几乎所有新业务都采用React开发，而老业务也在不断向React迁移。React大红大紫，这里单独拉出来讲一讲React+webpack的打包方案如何进行测试

> 这里只聊React Web，不聊React Native

> 事实上天猫目前并未采用webpack打包，而是Gulp+Babel编译React CommonJS代码成AMD模块使用，这是为了能够在新老业务使用上更加灵活，当然也有部分业务采用webpack打包并上线

#### 叕一个煎蛋的栗子

这里创建一个React组件，目录结构大致这样（这里略过CSS相关部分，只要跑通了，集成CSS像PostCSS、Less都没啥问题）：

```
.
├── demo
├── karma.conf.js
├── package.json
├── src
│   └── index.jsx
├── test
│   └── index_spec.jsx
├── webpack.dev.js
└── webpack.pub.js
```

React组件源码`src/index.jsx`大概是这个样子：

```js
import React from 'react';
class Welcome extends React.Component {
  constructor() {
    super();
  }
  render() {
    return <div>{this.props.content}</div>;
  }
}
Welcome.displayName = 'Welcome';
Welcome.propTypes = {
  /**
   * content of element
   */
  content: React.PropTypes.string
};
Welcome.defaultProps = {
  content: 'Hello Tmall'
};
module.exports = Welcome;
```

那么对应的`test/index_spec.jsx`则大概是这个样子：

```js
import 'should';
import Welcome from '../src/index.jsx';
import ReactDOM from 'react-dom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
describe('test', function() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  it('Hello Tmall', function() {
    let cp = ReactDOM.render(<Welcome/>, container);
    let welcome = TestUtils.findRenderedComponentWithType(cp, Welcome);
    ReactDOM.findDOMnode(welcome).textContent.should.be.eql('Hello Tmall');
  });
});
```

由于是测试React，自然要使用React的TestUtils，这个工具库提供了不少方便查找节点和组件的方法，最重要的是它提供了模拟事件的API，这可以说是UI测试最重要的一个功能。更多关于TestUtils的使用请参考[React官网](https://facebook.github.io/react/docs/test-utils.html)，这里就不扯了...

代码有了，测试用例也有了，接下就差跑起来了。`karma.conf.js`肯定就和上面不一样了，首先它要多一个插件`karma-webpack`，因为我们的React组件是需要webpack打包的，不打包的代码压根就没法运行。另外还需要注意代码覆盖率测试也出现了变化。因为现在多了一层Babel编译，Babel编译ES6、ES7源码生成ES5代码后会产生很多polyfill代码，因此如果对build完成之后的代码做覆盖率测试会包含这些polyfill代码，这样测出来的覆盖率显然是不可靠的，这个问题可以通过`isparta-loader`来解决。React组件的`karma.conf.js`大概是这个样子：

```js
'use strict';
const path = require('path');

module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    files: [
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      'test/**/*_spec.jsx'
    ],
    plugins: ['karma-webpack', 'karma-mocha',, 'karma-chrome-launcher', 'karma-firefox-launcher', 'karma-phantomjs-launcher', 'karma-coverage', 'karma-spec-reporter'],
    browsers: ['PhantomJS', 'Firefox', 'Chrome'],
    preprocessors: {
      'test/**/*_spec.jsx': ['webpack']
    },
    reporters: ['spec', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [{
        type: 'json',
        subdir: '.',
        file: 'coverage.json',
      }, {
        type: 'lcov',
        subdir: '.'
      }, {
        type: 'text-summary'
      }]
    },
    webpack: {
      module: {
        loaders: [{
          test: /\.jsx?/,
          loaders: ['babel']
        }],
        preLoaders: [{
          test: /\.jsx?$/,
          include: [path.resolve('src/')],
          loader: 'isparta'
        }]
      }
    },
    webpackMiddleware: {
      noInfo: true
    }
  });
};
```

这里相对于之前的karma.conf.js，主要有以下几点区别：

1. 由于webpack的打包功能，我们在测试代码里直接import组件代码，因此不再需要在files里手动引入组件代码
2. 预处理里面需要对每个测试文件都做webpack打包
3. 添加webpack编译相关配置，在编译源码时，需要定义preLoaders，并使用isparta-loader做代码覆盖率打点
4. 添加webpackMiddleware配置，这里noInfo作用是不需要输出webpack编译时那一大串信息

这样配置基本上就完成了，跑一把`./node_modules/karma/bin/karma start --single-run`：

![react karma](https://img.alicdn.com/tps/TB1TDN.LVXXXXXWXVXXXXXXXXXX-2100-1530.jpg)

很好，结果符合预期。`open coverage/lcov-report/index.html`打开覆盖率页面：

![react coverage](https://img.alicdn.com/tps/TB1UBWaLVXXXXXuXVXXXXXXXXXX-1782-938.jpg)

鹅妹子音！！！直接对jsx代码做的覆盖率测试！这样React组件的测试大体上就完工了

### 小结

前端的代码测试主要难度是如何模拟各种各样的浏览器环境，Karma给我们提供了很好地方式，对于本地有的浏览器能自动打开并测试，本地没有的浏览器则提供直接访问的页面。前端尤其是移动端浏览器种类繁多，很难做到完美，但我们可以通过这种方式实现主流浏览器的覆盖，保证每次上线大多数用户没有问题。

## 持续集成

测试结果有了，接下来就是把这些测试结果接入到持续集成之中。持续集成是一种非常优秀的多人开发实践，通过代码push触发钩子，实现自动运行编译、测试等工作。接入持续集成后，我们的每一次push代码，每个Merge Request都会生成对应的测试结果，项目的其他成员可以很清楚地了解到新代码是否影响了现有的功能，在接入自动告警后，可以在代码提交阶段就快速发现错误，提升开发迭代效率。

持续集成会在每次集成时提供一个几乎空白的虚拟机器，并拷贝用户提交的代码到机器本地，通过读取用户项目下的持续集成配置，自动化的安装环境和依赖，编译和测试完成后生成报告，在一段时间之后释放虚拟机器资源。

### 开源的持续集成

开源比较出名的持续集成服务当属[Travis](https://travis-ci.org/)，而代码覆盖率则通过[Coveralls](https://coveralls.io/)，只要有GitHub账户，就可以很轻松的接入Travis和Coveralls，在网站上勾选了需要持续集成的项目以后，每次代码push就会触发自动化测试。这两个网站在跑完测试以后，会自动生成测试结果的小图片

![build result](https://img.alicdn.com/tps/TB1veJ7LVXXXXXMaXXXXXXXXXXX-420-64.png)

Travis会读取项目下的`travis.yml`文件，一个简单的例子：

```yml
language: node_js
node_js:
  - "stable"
  - "4.0.0"
  - "5.0.0"
script: "npm run test"
after_script: "npm install coveralls@2.10.0 && cat ./coverage/lcov.info | coveralls"
```

language定义了运行环境的语言，而对应的node_js可以定义需要在哪几个Node.js版本做测试，比如这里的定义，代表着会分别在最新稳定版、4.0.0、5.0.0版本的Node.js环境下做测试

而script则是测试利用的命令，一般情况下，都应该把自己这个项目开发所需要的命令都写在package.json的scripts里面，比如我们的测试方法`./node_modules/karma/bin/karma start --single-run`就应当这样写到scripts里：

```json
{
  "scripts": {
    "test": "./node_modules/karma/bin/karma start --single-run"
  }
}
```

而after_script则是在测试完成之后运行的命令，这里需要上传覆盖率结果到coveralls，只需要安装coveralls库，然后获取lcov.info上传给Coveralls即可

> 更多配置请参照Travis官网介绍

这样配置后，每次push的结果都可以上Travis和Coveralls看构建和代码覆盖率结果了

![travis](https://img.alicdn.com/tps/TB1eC41LVXXXXXhapXXXXXXXXXX-2074-806.png)

![coveralls](https://img.alicdn.com/tps/TB1KSacLVXXXXXxXVXXXXXXXXXX-1924-1468.jpg)

### 内网的持续集成

当然，我们的工作相关代码肯定不能发到GitHub上，但这并不意味着我们不能做持续集成了。内网有[CISE平台](cise.alibaba-inc.com)和[UITest平台](ci.uitest.taobao.net/task)可以做同样的事情。

对于需要加入持续集成的项目，大致上需要如下几步：

1. 开启项目持续集成功能
2. 创建配置文件
3. 配置插件和命令
4. 将测试结果标志写入README

#### 开启项目持续集成

GitLab项目页面 -> 左侧菜单Setting -> 左侧菜单Services -> CISE -> 勾选Active -> SAVE CHANGES，这样就可以开启项目持续集成了

![cise open](https://img.alicdn.com/tps/TB1zf88LVXXXXXuaXXXXXXXXXXX-2746-692.jpg)

#### 创建配置文件

与开源的Travis相同，CISE需要在项目下创建一个`.cise.yml`，内容大致如下：

```yml
stage:
  node-4:
    prepare:
      exec:
      # 安装 nvm, 存在则不重复安装
      - ls /root/nvm || git clone http://gitlab.alibaba-inc.com/node/nvm.git --depth 1 /root/nvm
      - echo 'source /root/nvm/nvm.sh' >> /root/.bashrc
      - nvm use 4.0.0 || nvm install 4.0.0
      - nvm alias default 4.0.0
      # 安装 tnpm, 存在则不重新安装
      - tnpm -v || npm install --silent -g tnpm --registry=http://registry.npm.alibaba-inc.com
      - tnpm install -g @ali/def-ci --silent
      # --unsafe-perm: http://gitlab.alibaba-inc.com/uitest/knight/issues/6
      - tnpm install --silent --unsafe-perm
      - node -v; npm -v; tnpm -v
    unit_test:
      exec:
      - fed-ci --repo ${scm_url} --branch ${scm_branch} --commitId ${source_version} --ciseBuildId ${build_idx} --ciseId ${task_id} --empId ${creator_emp_id}
  node-5:
    prepare:
      exec:
      # 安装 nvm, 存在则不重复安装
      - ls /root/nvm || git clone http://gitlab.alibaba-inc.com/node/nvm.git --depth 1 /root/nvm
      - echo 'source /root/nvm/nvm.sh' >> /root/.bashrc
      - nvm use 5.0.0 || nvm install 5.0.0
      - nvm alias default 5.0.0
      # 安装 tnpm, 存在则不重新安装
      - tnpm -v || npm install --silent -g tnpm --registry=http://registry.npm.alibaba-inc.com
      - tnpm install -g @ali/def-ci --silent
      # --unsafe-perm: http://gitlab.alibaba-inc.com/uitest/knight/issues/6
      - tnpm install --silent --unsafe-perm
      - node -v; npm -v; tnpm -v
    unit_test:
      exec:
      - fed-ci --repo ${scm_url} --branch ${scm_branch} --commitId ${source_version} --ciseBuildId ${build_idx} --ciseId ${task_id} --empId ${creator_emp_id}

pipeline:
- node-4, node-5
```

CISE的配置稍微复杂一些，但是更加灵活。通过上面的配置，会分别在Node.js 4.0.0版本和Node.js 5.0.0版本进行测试，在prepare里可以清除的看到需要做哪些准备，

#### 配置插件和命令

而在package.json里需要配置需要配置对应的scripts和ci插件：

```json
{
  "scripts": {
    "ci": "./node_modules/karma/bin/karma start --single-run"
  },
  "ciPlugins": {
    "test": ""
  }
}
```

CISE会自动执行`npm run ci`，并自动收集`coverage/coverage.json`生成覆盖率结果

#### 将测试结果标志写入README

首先需要`tnpm install --save-dev @ali/def`安装@ali/def工具，然后在项目路径下执行`def ci badge`就可以生成markdown格式的标志了，把他们复制到自己的README里即可

![def ci badge](https://img.alicdn.com/tps/TB1fJiqLVXXXXbMXXXXXXXXXXXX-2092-582.jpg)

#### 执行测试

好了，准备完成了，只需要push一下代码，就可以看到CISE平台自动创建测试任务：

![执行测试](https://img.alicdn.com/tps/TB1tS5rLVXXXXbXXXXXXXXXXXXX-2752-1300.jpg)

测试的结果也可以在UITest上查看

![UITest](https://img.alicdn.com/tps/TB1bbCbLVXXXXXAXVXXXXXXXXXX-2100-1292.jpg)

> Karma跑PhantomJS的方案似乎没有办法在CISE的机器上运行，原因是karma-phantomjs-launcher依赖了2+版本的phantomjs——phantomjs-prebuilt，这个库是C++实现，在CISE机器上由于C++库版本的问题无法编译通过。目前没有看到比较好的解决办法，倒是mocha-phantomjs依赖的phantomjs 1.9+版本可以在CISE机器上正常运行

### 小结

项目接入持续集成在多人开发同一个仓库时候能起到很大的用途，每次push都能自动触发测试，测试没过会发生告警。如果需求采用Issues+Merge Request来管理，每个需求一个Issue+一个分支，开发完成后提交Merge Request，由项目Owner负责合并，项目质量将更有保障


## 总结

这里只是前端测试相关知识的一小部分，还有非常多的内容可以深入挖掘，而测试也仅仅是前端流程自动化的一部分。在前端技术快速发展的今天，前端项目不再像当年的刀耕火种一般，越来越多的软件工程经验被集成到前端项目中，前端项目正向工程化、流程化、自动化方向高速奔跑。还有更多优秀的提升开发效率、保证开发质量的自动化方案亟待我们挖掘。