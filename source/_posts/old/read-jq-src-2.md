layout: art
title: jQuery的数据缓存
subtitle: 闲来没事读源码系列——jQuery
tags: 
- JavaScript
categories: 
- 页面框架
date: 2014/5/10
---

这次记录了一下jQuery的数据缓存——data部分，jq中能使用data接口在节点上进行数据缓存，事实上jq将节点上的数据分成了两个部分：userData和privData，分别表示公有数据和私有数据。私有数据中存放了一些jq的其他功能需要使用的数据，比如自定义事件等等。而userData则存放jq使用者的数据。这两个数据区分别有自己的接口

<!-- more -->

## jQuery的数据缓存简介
jq中能使用data接口在节点上进行数据缓存，事实上jq将节点上的数据分成了两个部分：userData和privData，分别表示公有数据和私有数据。私有数据中存放了一些jq的其他功能需要使用的数据，比如自定义事件等等。而userData则存放jq使用者的数据。这两个数据区分别有自己的接口。

jq的数据并不是直接存在dom节点中的，jq把所有的数据集中放置在两个数据对象之中，dom节点里只有数据的id。获取或插入数据时，会根据id在数据对象中找到这个dom节点对应的区域，在上面操作。

## jq中数据缓存的限制
并不是所有对象或节点都能缓存数据，在`jQuery.acceptData`中给出了能够缓存数据的对象类型，只有element和document以及一般Object能够缓存数据
```javascript
jQuery.acceptData = function( owner ) {
    return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};
```

## 数据对象
jq中专门有一个数据对象类Data，用于构造数据对象。私有对象和公有对象都是铜鼓哦这个构造函数创建出来的Data类实例，其构造函数为
```javascript
function Data() {
    /*老式浏览器中没有Object.preventExtensions和Object.freeze方法来限制堆对象的操作。返回一个新建的空对象，他们没有set方法*/
    Object.defineProperty( this.cache = {}, 0, {
        get: function() {
            return {};
        }
    });
    /*为这个数据对象添上jQuery版本号+随机数的版本号*/
    this.expando = jQuery.expando + Math.random();
}
```

### 静态方法和属性
#### uid
数据对象的id，自增
#### accepts
判断是否能够接受数据，直接指向之前的acceptData

### 核心方法
#### key (owner)
owner表示数据的所有者，这个方法返回这个所有者所拥有的数据id

这个方法中首先会判断owner能否接受数据数据，不能直接返回0

然后会创建一个descriptor用于在创建时作为辅助对象，并尝试获取owner的当前jq版本的数据id，放在unlock变量中

如果这个unlock不存在，说明这个owner没有当前版本的数据缓存，那么就得新建了。首先通过`Data.uid`自增的方式获得一个唯一的id，然后将这个id写入到descriptor，jq首先会尝试es5的`Object.defineProperties`方法来创建一个不可遍历，不可写的键值对，键为jq版本号，值为数据id。如果不能使用es5的方法，会退一步使用extend写入。往owner中成功写入id后，再在数据对象的cache区域中申请一个区域就行了，实际上就是申请了一个空对象

最后，如果owner本来就id直接返回，否则返回新申请的id

```javascript
key: function( owner ) {
    /*如果这个所有者不能接收数据，返回0*/
    if ( !Data.accepts( owner ) ) {
        return 0;
    }
    var descriptor = {},
        /*获取这个所有者已经有这个版本的数据的id*/
        unlock = owner[ this.expando ];
    /*如果这个所有者没有对应的数据对象，那么创建一个*/
    if ( !unlock ) {
        /*自增的uid*/
        unlock = Data.uid++;
        /*往这个所有者中添加这个数据对象的版本号，并将其值设为id*/
        try {
            descriptor[ this.expando ] = { value: unlock };
            Object.defineProperties( owner, descriptor );
        /*如果不能使用Object.defineProperites，那么直接使用extend*/
        } catch ( e ) {
            descriptor[ this.expando ] = unlock;
            jQuery.extend( owner, descriptor );
        }
    }
    /*在cache中创建对象的数据空间*/
    if ( !this.cache[ unlock ] ) {
        this.cache[ unlock ] = {};
    }
    /*返回这个新的id*/
    return unlock;
},
```

#### set (owner, data, value)
既然我们成功申请了空间，那么自然需要一个方法往这个空间里面添加我们的缓冲数据，set就是干这个的

owner是数据所有者，data是需要加入的数据对象或名称，value则是当data表示数据名称时，它用来表示数据的值。可以看出，这是一个兼容多种接口的方法

逻辑很简单，先获得owner的id，这里使用上面的key方法获得id，保证了获得id后，一定已经有相应的数据空间

获取到id后做接口兼容判断，如果data是字符串，直接往这个dom的数据空间中写入`data:value`键值对就行了。如果data不是字符串，而是一个对象，那么将这个对象中的键值对一一写入到数据空间中。这里有一个小优化，当数据空间中没有数据的时候，使用了`jQuery.extend`来直接浅拷贝进去

```javascript
/*加入数据（往cache中加数据）*/
set: function( owner, data, value ) {
    var prop,
        /*首先获得这个所有者的id（没有就新建一个）*/
        unlock = this.key( owner ),
        /*获得这个数据对象对应的cache内的空间*/
        cache = this.cache[ unlock ];

    /*如果数据时string直接写进去*/
    if ( typeof data === "string" ) {
        cache[ data ] = value;

    /*如果不是string，是对象，那么遍历对象复制进去，如果正好cache中是空对象，直接extend*/
    } else {
        if ( jQuery.isEmptyObject( cache ) ) {
            jQuery.extend( this.cache[ unlock ], data );
        } else {
            for ( prop in data ) {
                cache[ prop ] = data[ prop ];
            }
        }
    }
    return cache;
},
```

#### get (owner, key)
从owner对应的数据空间中获取数据的方法，也是一个兼容多接口的方法，当存在key时只获取key所对应的值。否则获取整个数据空间对象

思路很明了也很简单，首先获取owner的数据id，然后获取元素的数据空间，最后判断是否存在key来确定返回的内容

```javascript
/*获取数据（从cache中取数据）*/
get: function( owner, key ) {
    /*通过owner获取id，从cache中获取在对应的完整缓存对象*/
    var cache = this.cache[ this.key( owner ) ];
    /*如果美没有申明要取的键，返回整个缓存，否则只返回键对应的值*/
    return key === undefined ?
        cache : cache[ key ];
},
```

#### access (owner, key, value)
一个包含了get和set的接口方法，根据参数来判断调用set方法还是get方法，使接口符合jq风格

owner是数据所有者，这个参数总是存在的，接口分为以下三种：
1. 如果没有key和value，那么使用get方法获取整个数据空间对象
2. 如果只有key而key是字符串，没有value，那么使用get方法获得数据空间中key对应的值
3. 如果只有key而key是对象，那么使用set方法将key中所有的键值对写入到数据空间中
4. 如果key和value都存在，那么使用set方法往数据空间中写入key:value键值对

```javascript
access: function( owner, key, value ) {
    var stored;
    if ( key === undefined ||
            ((key && typeof key === "string") && value === undefined) ) {

        stored = this.get( owner, key );

        return stored !== undefined ?
            stored : this.get( owner, jQuery.camelCase(key) );
    }

    this.set( owner, key, value );

    return value !== undefined ? value : key;
},
```

#### remove (owner, key)
既然有增改查，必然有删。这里就是删除，需要注意的是这里key可能是数组，如果是数组，就要把数组中所有元素作为键分别进行删除了。这里会把所有需要删除的key包裹成一个数组，最后字需要循环遍历这个数组使用delete删除就行了

需要注意的是，这里有一个驼峰判断，比如`-moz-transform`这样的属性，会转成驼峰形式`mozTransform`，但删除时候为了保险起见会尝试普通key形式和驼峰的key。另外key如果是一个带有空白字符（比如空格或回车等）的字符串，那么也会做分割，生成一个key数组

```javascript
/*从owner移除属性 */
remove: function( owner, key ) {
    var i, name, camel,
        unlock = this.key( owner ),
        cache = this.cache[ unlock ];
    /*如果没有key，移除整个owner所拥有的缓存*/
    if ( key === undefined ) {
        this.cache[ unlock ] = {};
    } else {
        // Support array or space separated string of keys
        /*如果key是数组，那么将key中的每个元素转换成驼峰形式然后进行删除*/
        if ( jQuery.isArray( key ) ) {
            name = key.concat( key.map( jQuery.camelCase ) );
        } else {
            /*如果key不是数组，将key转成驼峰*/
            camel = jQuery.camelCase( key );
            /*如果cache[key]存在，那么删除key和驼峰形式key对应的键值对*/
            if ( key in cache ) {
                name = [ key, camel ];
            } else {
                /*如果cache[key]不存在，那么要尝试删除驼峰形式的key*/
                name = camel;
                /*key可能是一个带有空格的字符串，所以需要对齐进行分割来获得所有要删除的key*/
                name = name in cache ?
                    [ name ] : ( name.match( rnotwhite ) || [] );
            }
        }
        /*上面都是获取移除的key的数组，真真移除key是在这里，用的delete*/
        i = name.length;
        while ( i-- ) {
            delete cache[ name[ i ] ];
        }
    }
},
```

#### hasData (owner)
判断一个元素是否含有数据，直接判断这个元素对应的数据空间是否存在，如果存在看它是不是空对象
```javascript
/*判断是否存在数据*/
hasData: function( owner ) {
    /*判断缓存对象是否是空对象*/
    return !jQuery.isEmptyObject(
        this.cache[ owner[ this.expando ] ] || {}
    );
},
```

#### discard (owner)
移除掉owner的所有缓存，直接在cache上用delete删
```javascript
/*移除整个缓存对象*/
discard: function( owner ) {
    if ( owner[ this.expando ] ) {
        delete this.cache[ owner[ this.expando ] ];
    }
}
```

### 数据对象创建
```javascript
/*私有数据对象*/
var data_priv = new Data();
/*公有数据对象*/
var data_user = new Data();
```

可以看到，私有数据对象和公有数据对象都是数据对象构造函数的实例

## jQuery对数据对象操作接口
### dataAttr方法
事由于HTML5存在`data-xxx`来在DOM节点上缓存数据，jq的数据缓存机制决定，当用户从DOM节点获取数据时，不仅获得其在jq中缓存的数据，也会获得使用HTML5的`data-xxx`缓存的数据，这个方法就是读取DOM节点中的所有`data-xxx`形式的数据，将其被分到jq的数据对象中。由于HTML5的缓存很弱，只能缓存字符串类型，这里在保存前还会做相应的数据转换，转换诸如true、false、null、数字以及还会判断是否是json，然后解析json

```javscript
function dataAttr( elem, key, data ) {
    var name;

    /*如果没有data，而元素为element类型*/
    if ( data === undefined && elem.nodeType === 1 ) {

        /*从data-xxx属性中获取数据*/
        name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
        data = elem.getAttribute( name );
        /*如果对象是字符串，分别尝试转成true、false、null，如果使用{}包裹，当做JSON解析*/
        if ( typeof data === "string" ) {
            try {
                data = data === "true" ? true :
                    data === "false" ? false :
                    data === "null" ? null :
                    // Only convert to a number if it doesn't change the string
                    +data + "" === data ? +data :
                    rbrace.test( data ) ? jQuery.parseJSON( data ) :
                    data;
            } catch( e ) {}

            /*写入到公共数据对象中*/
            data_user.set( elem, key, data );
        } else {
            data = undefined;
        }
    }
    return data;
}
```

### 静态方法
jq提供一系列的静态方法操作数据对象，jq为公有数据对象和私有数据对象分别定义了一套接口，私有数据对象的操作前一般都带下划线

#### hasData (elem)
判断元素是否含有数据，这里会检测公有数据和私有数据
```javascript
hasData: function( elem ) {
    return data_user.hasData( elem ) || data_priv.hasData( elem );
},
```
#### data (elem, name, data)
通过数据对象的access方法获得或写入数据，只操作公有数据对象
```javascript
data: function( elem, name, data ) {
    return data_user.access( elem, name, data );
},
```
#### removeData (elem, name)
从数据对象移除数据，只操作公有数据对象
```javascript
removeData: function( elem, name ) {
    data_user.remove( elem, name );
},
```
####\_data (elem, name, data)
通过数据对象的access方法获得或写入数据，只操作私有数据对象
```javascript
_data: function( elem, name, data ) {
    return data_priv.access( elem, name, data );
},
```
####\_removeData (elem, name)
从数据对象移除数据，只操作私有数据对象
```javascript
_removeData: function( elem, name ) {
    data_priv.remove( elem, name );
}
```

### 在jq对象上添加数据对象操作方法
jq对象既然维护了一系列的DOM节点，自然通过扩展fn的方式为这些DOM节点提供数据对象操作方法

#### data (key, value)
jq的接口有个特点，写全部，得第一。当往jq对象中写入数据时，每个DOM节点都会被写入数据，而读取数据时，只会读取DOM列表中的第一个节点的数据。这里也不例外。这个方法同样是重载方法：
1. 如果key和value都不存在，获取第一个元素的公有对象。在获取数据前，会检查第一个DOM节点，判断它是否存在HTML5的data属性，如果存在，会获取其值并复制到元素的jq数据对象中，并在元素的私有数据空间写入一个`hasDataAttrs:true`作为标示，最后返回合并了HTML5的data后的数据空间对象
2. 如果key是对象，那么每个DOM节点都需要写入这个对象，然后返回这个jq对象
3. 否则使用access来判断具体需要获取值还是写入。获取时，在含有DOM节点，有key而没有value时，获取key对应的值。如果通过直接key没有获得数据，就尝试将key转换为驼峰格式来获取对应的值。如果还获取不到，那么尝试使用dataAttr方法获取包含了HTML5的data的数据。如果还是获取不到，我们尽力了，返回undefined。写入时，则会遍历jq对象中所有的DOM节点，每个节点都会先检查是否有驼峰形式的key，无论有没有都写进去。但如果存在连字符，而没有驼峰key，那么写入普通key的键值对作为备份。

```javascript
data: function( key, value ) {
    var i, name, data,
        elem = this[ 0 ],
        attrs = elem && elem.attributes;

    
    /*如果没有key也没有value，获取jq对象中第一个元素的所有公有数据，需要考虑dom元素的data-属性*/
    if ( key === undefined ) {
        /*jq对象中有节点*/
        if ( this.length ) {
            /*第一个节点的数据*/
            data = data_user.get( elem );
            /*如果节点为element类型且私有数据中没有标记hasDataAttrs
            将节点中的所有data-类型的属性写入到公共数据中
            然后在私有数据中设定hasDataAttrs为true*/
            if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
                i = attrs.length;
                while ( i-- ) {
                    name = attrs[ i ].name;

                    if ( name.indexOf( "data-" ) === 0 ) {
                        name = jQuery.camelCase( name.slice(5) );
                        dataAttr( elem, name, data[ name ] );
                    }
                }
                data_priv.set( elem, "hasDataAttrs", true );
            }
        }

        return data;
    }

    /*如果key是一个对象，说明需要将这个对象添加到jq中每个节点的公有数据中*/
    if ( typeof key === "object" ) {
        return this.each(function() {
            data_user.set( this, key );
        });
    }
    /*通过access判断*/
    return access( this, function( value ) {
        var data,
            /*生成驼峰的key*/
            camelKey = jQuery.camelCase( key );
        /*如果jq对象中有元素，且没有value，说明调用get获取数据*/
        if ( elem && value === undefined ) {
            /*直接使用key获取*/
            data = data_user.get( elem, key );
            if ( data !== undefined ) {
                return data;
            }
            /*如果直接用key未能获取导数据，尝试驼峰格式的key*/
            data = data_user.get( elem, camelKey );
            if ( data !== undefined ) {
                return data;
            }

            /*如果还是无法获取，尝试从data-属性获取*/
            data = dataAttr( elem, camelKey, undefined );
            if ( data !== undefined ) {
                return data;
            }

            /*我们尝试了所有情况，但还是没有数据，返回undefined*/
            return;
        }

        /*写入数据*/
        this.each(function() {
            /*通过驼峰形式key获取公共数据*/
            var data = data_user.get( this, camelKey );
            /*往驼峰形式key中写入公共数据*/
            data_user.set( this, camelKey, value );

            /*key中存在连字符，而通过驼峰形式的key获取不到数据，需要直接对key写入数据*/
            if ( key.indexOf("-") !== -1 && data !== undefined ) {
                data_user.set( this, key, value );
            }
        });
    }, null, value, arguments.length > 1, null, true );
},
```

#### removeData (key)
这个就比较简单了，直接遍历jq对象中所有的DOM节点，每个都删除就行了
```javascript
/*从公共数据中移除包含key（或key中元素）的键值对*/
removeData: function( key ) {
    return this.each(function() {
        data_user.remove( this, key );
    });
}
```

## 为动画服务的queue和dequeue
事实上，jq还提供了一套为动画服务器的queue和dequeue接口，为动画服务提供data操作。这套接口操作是在私有数据对象上的。

### 静态方法
#### queue (elem, type, data)
逻辑不复杂，也分读写两种情况。以`type + "queue"`（如果没有传入type，默认为fxqueue）为key，从私有数据空间获取数据。

如果是写情况，没有获得到数据或或得到的数据不是数组时，直接把key:data这样的键值对写进私有数据空间。如果获得到数据且是个数组，那么把data加在这个数组的后面。

如果是读情况，获得导数据后直接返回，如果没有数据，返回一个空数组

```javascript
/*压入或读取一组数据*/
queue: function( elem, type, data ) {
    var queue;

    if ( elem ) {
        /*重命名一下type，默认叫fxqueue*/
        type = ( type || "fx" ) + "queue";
        /*从私有数据中获得已有的queue数据*/
        queue = data_priv.get( elem, type );

        /*如果存在data，需要写入数据*/
        if ( data ) {
            /*之前没有缓存中没有数据且data是一个数组，那么就把这个data缓存*/
            if ( !queue || jQuery.isArray( data ) ) {
                queue = data_priv.access( elem, type, jQuery.makeArray(data) );
            /*之前有数据，直接把data连在数据数组后头*/
            } else {
                queue.push( data );
            }
        }
        return queue || [];
    }
},
```

#### dequeue (elem, type)
事实上，在使用queue时一般都是压入一个函数和字符串混合成的数组，这里需要递归去执行这些函数

会找到第一个不是inprogress字符串的函数弹出并裕兴，然后将inprogress字符串压入，递归执行dequeue方法。如果所有全部执行完（数组为空），那么这组数据可以删除掉了。事实上在每次dequeue函数结束完成之后，会调动钩子中的函数，这些将会在动画中详细介绍

```javascript
/*运行一组数据，找到第一个不是inprogress字符串的函数弹出并运行，然后将inprogress重新压入，递归执行dequeue，如果函数全部执行完，那么通过钩子把这组数据删掉*/
dequeue: function( elem, type ) {
    /*获取type，默认为fx*/
    type = type || "fx";
    /*获取一组数据*/
    var queue = jQuery.queue( elem, type ),
        startLength = queue.length,
        /*获取状态*/
        fn = queue.shift(),
        /*获取元素的钩子*/
        hooks = jQuery._queueHooks( elem, type ),
        next = function() {
            jQuery.dequeue( elem, type );
        };

    /*如果当前数据第一个元素是字符串，说明正在处理，拿到它下一个元素，是个函数*/
    if ( fn === "inprogress" ) {
        fn = queue.shift();
        startLength--;
    }
    if ( fn ) {

        /*调用这个函数，如果类型是默认的fx，那么将继续处于处理中状态*/
        if ( type === "fx" ) {
            queue.unshift( "inprogress" );
        }

        /*删除掉钩子中的停止函数*/
        delete hooks.stop;
        /*在这个函数上调用，并提供钩子*/
        fn.call( elem, next, hooks );
    }
    /*如果队列已经空了，那么调用empty删除掉这个键值对*/
    if ( !startLength && hooks ) {
        hooks.empty.fire();
    }
},
```

####\_queueHooks (elem, type)
提供默认钩子的函数
```javascript
_queueHooks: function( elem, type ) {
    var key = type + "queueHooks";
    return data_priv.get( elem, key ) || data_priv.access( elem, key, {
        empty: jQuery.Callbacks("once memory").add(function() {
            data_priv.remove( elem, [ type + "queue", key ] );
        })
    });
}
```

### jq对象上的queue和dequeue
#### queue (type, data)
对jq对象中的每个DOM节点分别调用queue方法。但如果数据的第一个元素是函数而不是inprogress，那么会立即调用dequeue开始执行
```javascript
queue: function( type, data ) {
        var setter = 2;

        if ( typeof type !== "string" ) {
            data = type;
            type = "fx";
            setter--;
        }

        if ( arguments.length < setter ) {
            return jQuery.queue( this[0], type );
        }

        return data === undefined ?
            this :
            this.each(function() {
                var queue = jQuery.queue( this, type, data );

                // ensure a hooks for this queue
                jQuery._queueHooks( this, type );

                if ( type === "fx" && queue[0] !== "inprogress" ) {
                    jQuery.dequeue( this, type );
                }
            });
    },
```

#### dequeue (type)
对jq对象中每个DOM元素执行dequeue操作

```javascript
/*对jq对象中的每个元素执行dequeue操作，执行内部已压入的函数*/
dequeue: function( type ) {
    return this.each(function() {
        jQuery.dequeue( this, type );
    });
},
```

#### clearQueue (type)
清除jq对象中每个DOM的type对应的数据列表
```javascript
/*清除对应的类型的操作列表*/
clearQueue: function( type ) {
    return this.queue( type || "fx", [] );
},
```

#### promise (type, obj)
获取一个promise对象，这个promise对象会在jq中的所有DOM元素type所对应的数据列表中的方法都已被执行完时resolve
```javascript
/*创建一个deferred对象，如果队列中所有的函数都被执行完毕，那么resolve这个deferred对象*/
promise: function( type, obj ) {
    var tmp,
        count = 1,
        defer = jQuery.Deferred(),
        elements = this,
        i = this.length,
        resolve = function() {
            if ( !( --count ) ) {
                defer.resolveWith( elements, [ elements ] );
            }
        };

    if ( typeof type !== "string" ) {
        obj = type;
        type = undefined;
    }
    type = type || "fx";
    
    while ( i-- ) {
        tmp = data_priv.get( elements[ i ], type + "queueHooks" );
        if ( tmp && tmp.empty ) {
            count++;
            tmp.empty.add( resolve );
        }
    }
    resolve();
    return defer.promise( obj );
}
```

## 总结
缓存的这块的核心知识还是比较好理解的，除了queue和dequeue要结合动画理解，需要注意的是HTML5的data带来的问题。其他的实际上就是对象上的增删改查了

