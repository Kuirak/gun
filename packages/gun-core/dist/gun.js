(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Gun = factory());
}(this, (function () { 'use strict';

	// Generic javascript utilities.
	var Type = {};
	//Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
	Type.fns = Type.fn = {is: function(fn){ return (!!fn && 'function' == typeof fn) }};
	Type.bi = {is: function(b){ return (b instanceof Boolean || typeof b == 'boolean') }};
	Type.num = {is: function(n){ return !list_is(n) && ((n - parseFloat(n) + 1) >= 0 || Infinity === n || -Infinity === n) }};
	Type.text = {is: function(t){ return (typeof t == 'string') }};
	Type.text.ify = function(t){
		if(Type.text.is(t)){ return t }
		if(typeof JSON !== "undefined"){ return JSON.stringify(t) }
		return (t && t.toString)? t.toString() : t;
	};
	Type.text.random = function(l, c){
		var s = '';
		l = l || 24; // you are not going to make a 0 length random number, so no need to check type
		c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
		while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l--; }
		return s;
	};
	Type.text.match = function(t, o){ var r = false;
		t = t || '';
		o = Type.text.is(o)? {'=': o} : o || {}; // {'~', '=', '*', '<', '>', '+', '-', '?', '!'} // ignore case, exactly equal, anything after, lexically larger, lexically lesser, added in, subtacted from, questionable fuzzy match, and ends with.
		if(Type.obj.has(o,'~')){ t = t.toLowerCase(); o['='] = (o['='] || o['~']).toLowerCase(); }
		if(Type.obj.has(o,'=')){ return t === o['='] }
		if(Type.obj.has(o,'*')){ if(t.slice(0, o['*'].length) === o['*']){ r = true; t = t.slice(o['*'].length); } else { return false }}
		if(Type.obj.has(o,'!')){ if(t.slice(-o['!'].length) === o['!']){ r = true; } else { return false }}
		if(Type.obj.has(o,'+')){
			if(Type.list.map(Type.list.is(o['+'])? o['+'] : [o['+']], function(m){
				if(t.indexOf(m) >= 0){ r = true; } else { return true }
			})){ return false }
		}
		if(Type.obj.has(o,'-')){
			if(Type.list.map(Type.list.is(o['-'])? o['-'] : [o['-']], function(m){
				if(t.indexOf(m) < 0){ r = true; } else { return true }
			})){ return false }
		}
		if(Type.obj.has(o,'>')){ if(t > o['>']){ r = true; } else { return false }}
		if(Type.obj.has(o,'<')){ if(t < o['<']){ r = true; } else { return false }}
		function fuzzy(t,f){ var n = -1, i = 0, c; for(;c = f[i++];){ if(!~(n = t.indexOf(c, n+1))){ return false }} return true } // via http://stackoverflow.com/questions/9206013/javascript-fuzzy-search
		if(Type.obj.has(o,'?')){ if(fuzzy(t, o['?'])){ r = true; } else { return false }} // change name!
		return r;
	};
	Type.list = {is: function(l){ return (l instanceof Array) }};
	Type.list.slit = Array.prototype.slice;
	Type.list.sort = function(k){ // creates a new sort function based off some key
		return function(A,B){
			if(!A || !B){ return 0 } A = A[k]; B = B[k];
			if(A < B){ return -1 }else if(A > B){ return 1 }
			else { return 0 }
		}
	};
	Type.list.map = function(l, c, _){ return obj_map(l, c, _) };
	Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
	Type.obj = {is: function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }};
	Type.obj.put = function(o, k, v){ return (o||{})[k] = v, o };
	Type.obj.has = function(o, k){ return o && Object.prototype.hasOwnProperty.call(o, k) };
	Type.obj.del = function(o, k){
		if(!o){ return }
		o[k] = null;
		delete o[k];
		return o;
	};
	Type.obj.as = function(o, k, v, u){ return o[k] = o[k] || (u === v? {} : v) };
	Type.obj.ify = function(o){
		if(obj_is(o)){ return o }
		try{o = JSON.parse(o);
		}catch(e){o={};}	return o;
	}
	;(function(){ var u;
		function map(v,k){
			if(obj_has(this,k) && u !== this[k]){ return }
			this[k] = v;
		}
		Type.obj.to = function(from, to){
			to = to || {};
			obj_map(from, map, to);
			return to;
		};
	}());
	Type.obj.copy = function(o){ // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
		return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
	}
	;(function(){
		function empty(v,i){ var n = this.n;
			if(n && (i === n || (obj_is(n) && obj_has(n, i)))){ return }
			if(i){ return true }
		}
		Type.obj.empty = function(o, n){
			if(!o){ return true }
			return obj_map(o,empty,{n:n})? false : true;
		};
	}());
	(function(){
		function t(k,v){
			if(2 === arguments.length){
				t.r = t.r || {};
				t.r[k] = v;
				return;
			} t.r = t.r || [];
			t.r.push(k);
		}	var keys = Object.keys;
		Type.obj.map = function(l, c, _){
			var u, i = 0, x, r, ll, lle, f = fn_is(c);
			t.r = null;
			if(keys && obj_is(l)){
				ll = keys(l); lle = true;
			}
			if(list_is(l) || ll){
				x = (ll || l).length;
				for(;i < x; i++){
					var ii = (i + Type.list.index);
					if(f){
						r = lle? c.call(_ || this, l[ll[i]], ll[i], t) : c.call(_ || this, l[i], ii, t);
						if(r !== u){ return r }
					} else {
						//if(Type.test.is(c,l[i])){ return ii } // should implement deep equality testing!
						if(c === l[lle? ll[i] : i]){ return ll? ll[i] : ii } // use this for now
					}
				}
			} else {
				for(i in l){
					if(f){
						if(obj_has(l,i)){
							r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
							if(r !== u){ return r }
						}
					} else {
						//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
						if(c === l[i]){ return i } // use this for now
					}
				}
			}
			return f? t.r : Type.list.index? 0 : -1;
		};
	}());
	Type.time = {};
	Type.time.is = function(t){ return t? t instanceof Date : (+new Date().getTime()) };

	var fn_is = Type.fn.is;
	var list_is = Type.list.is;
	var obj = Type.obj, obj_is = obj.is, obj_has = obj.has, obj_map = obj.map;
	var type = Type;

	/* Based on the Hypothetical Amnesia Machine thought experiment */
	function HAM(machineState, incomingState, currentState, incomingValue, currentValue){
		if(machineState < incomingState){
			return {defer: true}; // the incoming value is outside the boundary of the machine's state, it must be reprocessed in another state.
		}
		if(incomingState < currentState){
			return {historical: true}; // the incoming value is within the boundary of the machine's state, but not within the range.

		}
		if(currentState < incomingState){
			return {converge: true, incoming: true}; // the incoming value is within both the boundary and the range of the machine's state.

		}
		if(incomingState === currentState){
			incomingValue = Lexical(incomingValue) || "";
			currentValue = Lexical(currentValue) || "";
			if(incomingValue === currentValue){ // Note: while these are practically the same, the deltas could be technically different
				return {state: true};
			}
			/*
				The following is a naive implementation, but will always work.
				Never change it unless you have specific needs that absolutely require it.
				If changed, your data will diverge unless you guarantee every peer's algorithm has also been changed to be the same.
				As a result, it is highly discouraged to modify despite the fact that it is naive,
				because convergence (data integrity) is generally more important.
				Any difference in this algorithm must be given a new and different name.
			*/
			if(incomingValue < currentValue){ // Lexical only works on simple value types!
				return {converge: true, current: true};
			}
			if(currentValue < incomingValue){ // Lexical only works on simple value types!
				return {converge: true, incoming: true};
			}
		}
		return {err: "Invalid CRDT Data: "+ incomingValue +" to "+ currentValue +" at "+ incomingState +" to "+ currentState +"!"};
	}
	if(typeof JSON === 'undefined'){
		throw new Error(
			'JSON is not included in this browser. Please load it first: ' +
			'ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js'
		);
	}
	var Lexical = JSON.stringify;
	var HAM_1 = HAM;

	var Val = {};
	Val.is = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
		if(v === u){ return false }
		if(v === null){ return true } // "deletes", nulling out keys.
		if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
		if(text_is(v) // by "text" we mean strings.
		|| bi_is(v) // by "binary" we mean boolean.
		|| num_is(v)){ // by "number" we mean integers or decimals. 
			return true; // simple values are valid.
		}
		return Val.rel.is(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
	};
	Val.rel = {_: '#'};
	(function(){
		Val.rel.is = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
			if(v && v[rel_] && !v._ && obj_is$1(v)){ // must be an object.
				var o = {};
				obj_map$1(v, map, o);
				if(o.id){ // a valid id was found.
					return o.id; // yay! Return it.
				}
			}
			return false; // the value was not a valid soul relation.
		};
		function map(s, k){ var o = this; // map over the object...
			if(o.id){ return o.id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
			if(k == rel_ && text_is(s)){ // the key should be '#' and have a text value.
				o.id = s; // we found the soul!
			} else {
				return o.id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
			}
		}
	}());
	Val.rel.ify = function(t){ return obj_put({}, rel_, t) }; // convert a soul into a relation and return it.
	type.obj.has._ = '.';
	var rel_ = Val.rel._, u;
	var bi_is = type.bi.is;
	var num_is = type.num.is;
	var text_is = type.text.is;
	var obj$1 = type.obj, obj_is$1 = obj$1.is, obj_put = obj$1.put, obj_map$1 = obj$1.map;
	var val = Val;

	var Node = {_: '_'};
	Node.soul = function(n, o){ return (n && n._ && n._[o || soul_]) }; // convenience function to check to see if there is a soul on a node and return it.
	Node.soul.ify = function(n, o){ // put a soul on an object.
		o = (typeof o === 'string')? {soul: o} : o || {};
		n = n || {}; // make sure it exists.
		n._ = n._ || {}; // make sure meta exists.
		n._[soul_] = o.soul || n._[soul_] || text_random(); // put the soul on it.
		return n;
	};
	Node.soul._ = val.rel._;
	(function(){
		Node.is = function(n, cb, as){ var s; // checks to see if an object is a valid node.
			if(!obj_is$2(n)){ return false } // must be an object.
			if(s = Node.soul(n)){ // must have a soul on it.
				return !obj_map$2(n, map, {as:as,cb:cb,s:s,n:n});
			}
			return false; // nope! This was not a valid node.
		};
		function map(v, k){ // we invert this because the way we check for this is via a negation.
			if(k === Node._){ return } // skip over the metadata.
			if(!val.is(v)){ return true } // it is true that this is an invalid node.
			if(this.cb){ this.cb.call(this.as, v, k, this.n, this.s); } // optionally callback each key/value.
		}
	}());
	(function(){
		Node.ify = function(obj, o, as){ // returns a node from a shallow object.
			if(!o){ o = {}; }
			else if(typeof o === 'string'){ o = {soul: o}; }
			else if(o instanceof Function){ o = {map: o}; }
			if(o.map){ o.node = o.map.call(as, obj, u$1, o.node || {}); }
			if(o.node = Node.soul.ify(o.node || {}, o)){
				obj_map$2(obj, map, {o:o,as:as});
			}
			return o.node; // This will only be a valid node if the object wasn't already deep!
		};
		function map(v, k){ var o = this.o, tmp, u; // iterate over each key/value.
			if(o.map){
				tmp = o.map.call(this.as, v, ''+k, o.node);
				if(u === tmp){
					obj_del(o.node, k);
				} else
				if(o.node){ o.node[k] = tmp; }
				return;
			}
			if(val.is(v)){
				o.node[k] = v;
			}
		}
	}());
	var obj$2 = type.obj, obj_is$2 = obj$2.is, obj_del = obj$2.del, obj_map$2 = obj$2.map;
	var text = type.text, text_random = text.random;
	var soul_ = Node.soul._;
	var u$1;
	var node = Node;

	function State(){
		var t;
		/*if(perf){
			t = start + perf.now(); // Danger: Accuracy decays significantly over time, even if precise.
		} else {*/
			t = time();
		//}
		if(last < t){
			return N = 0, last = t + State.drift;
		}
		return last = t + ((N += 1) / D) + State.drift;
	}
	var time = type.time.is, last = -Infinity, N = 0, D = 1000; // WARNING! In the future, on machines that are D times faster than 2016AD machines, you will want to increase D by another several orders of magnitude so the processing speed never out paces the decimal resolution (increasing an integer effects the state accuracy).
	var perf = (typeof performance !== 'undefined')? (performance.timing && performance) : false, start = (perf && perf.timing && perf.timing.navigationStart) || (perf = false);
	State._ = '>';
	State.drift = 0;
	State.is = function(n, k, o){ // convenience function to get the state on a key on a node and return it.
		var tmp = (k && n && n[N_] && n[N_][State._]) || o;
		if(!tmp){ return }
		return num_is$1(tmp = tmp[k])? tmp : -Infinity;
	};
	State.lex = function(){ return State().toString(36).replace('.','') };
	State.ify = function(n, k, s, v, soul){ // put a key's state on a node.
		if(!n || !n[N_]){ // reject if it is not node-like.
			if(!soul){ // unless they passed a soul
				return; 
			}
			n = node.soul.ify(n, soul); // then make it so!
		} 
		var tmp = obj_as(n[N_], State._); // grab the states data.
		if(u$2 !== k && k !== N_){
			if(num_is$1(s)){
				tmp[k] = s; // add the valid state.
			}
			if(u$2 !== v){ // Note: Not its job to check for valid values!
				n[k] = v;
			}
		}
		return n;
	};
	State.to = function(from, k, to){
		var val = from[k]; // BUGGY!
		if(obj_is$3(val)){
			val = obj_copy(val);
		}
		return State.ify(to, k, State.is(from, k), val, node.soul(from));
	}
	;(function(){
		State.map = function(cb, s, as){ var u; // for use with Node.ify
			var o = obj_is$3(o = cb || s)? o : null;
			cb = fn_is$1(cb = cb || s)? cb : null;
			if(o && !cb){
				s = num_is$1(s)? s : State();
				o[N_] = o[N_] || {};
				obj_map$3(o, map, {o:o,s:s});
				return o;
			}
			as = as || obj_is$3(s)? s : u;
			s = num_is$1(s)? s : State();
			return function(v, k, o, opt){
				if(!cb){
					map.call({o: o, s: s}, v,k);
					return v;
				}
				cb.call(as || this || {}, v, k, o, opt);
				if(obj_has$1(o,k) && u === o[k]){ return }
				map.call({o: o, s: s}, v,k);
			}
		};
		function map(v,k){
			if(N_ === k){ return }
			State.ify(this.o, k, this.s) ;
		}
	}());
	var obj$3 = type.obj, obj_as = obj$3.as, obj_has$1 = obj$3.has, obj_is$3 = obj$3.is, obj_map$3 = obj$3.map, obj_copy = obj$3.copy;
	var num = type.num, num_is$1 = num.is;
	var fn = type.fn, fn_is$1 = fn.is;
	var N_ = node._, u$2;
	var state = State;

	var Graph = {};
	(function(){
		Graph.is = function(g, cb, fn, as){ // checks to see if an object is a valid graph.
			if(!g || !obj_is$4(g) || obj_empty(g)){ return false } // must be an object.
			return !obj_map$4(g, map, {cb:cb,fn:fn,as:as}); // makes sure it wasn't an empty object.
		};
		function map(n, s){ // we invert this because the way'? we check for this is via a negation.
			if(!n || s !== node.soul(n) || !node.is(n, this.fn, this.as)){ return true } // it is true that this is an invalid graph.
			if(!this.cb){ return }
			nf.n = n; nf.as = this.as; // sequential race conditions aren't races.
			this.cb.call(nf.as, n, s, nf);
		}
		function nf(fn){ // optional callback for each node.
			if(fn){ node.is(nf.n, fn, nf.as); } // where we then have an optional callback for each key/value.
		}
	}());
	(function(){
		Graph.ify = function(obj, env, as){
			var at = {path: [], obj: obj};
			if(!env){
				env = {};
			} else
			if(typeof env === 'string'){
				env = {soul: env};
			} else
			if(env instanceof Function){
				env.map = env;
			}
			if(env.soul){
				at.rel = val.rel.ify(env.soul);
			}
			env.graph = env.graph || {};
			env.seen = env.seen || [];
			env.as = env.as || as;
			node$$1(env, at);
			env.root = at.node;
			return env.graph;
		};
		function node$$1(env, at){ var tmp;
			if(tmp = seen(env, at)){ return tmp }
			at.env = env;
			at.soul = soul;
			if(node.ify(at.obj, map, at)){
				//at.rel = at.rel || Val.rel.ify(Node.soul(at.node));
				env.graph[val.rel.is(at.rel)] = at.node;
			}
			return at;
		}
		function map(v,k,n){
			var at = this, env = at.env, is, tmp;
			if(node._ === k && obj_has$2(v,val.rel._)){
				return n._; // TODO: Bug?
			}
			if(!(is = valid(v,k,n, at,env))){ return }
			if(!k){
				at.node = at.node || n || {};
				if(obj_has$2(v, node._)){ // && Node.soul(v) ? for safety ?
					at.node._ = obj_copy$1(v._);
				}
				at.node = node.soul.ify(at.node, val.rel.is(at.rel));
				at.rel = at.rel || val.rel.ify(node.soul(at.node));
			}
			if(tmp = env.map){
				tmp.call(env.as || {}, v,k,n, at);
				if(obj_has$2(n,k)){
					v = n[k];
					if(u$3 === v){
						obj_del$1(n, k);
						return;
					}
					if(!(is = valid(v,k,n, at,env))){ return }
				}
			}
			if(!k){ return at.node }
			if(true === is){
				return v;
			}
			tmp = node$$1(env, {obj: v, path: at.path.concat(k)});
			if(!tmp.node){ return }
			return tmp.rel; //{'#': Node.soul(tmp.node)};
		}
		function soul(id){ var at = this;
			var prev = val.rel.is(at.rel), graph = at.env.graph;
			at.rel = at.rel || val.rel.ify(id);
			at.rel[val.rel._] = id;
			if(at.node && at.node[node._]){
				at.node[node._][val.rel._] = id;
			}
			if(obj_has$2(graph, prev)){
				graph[id] = graph[prev];
				obj_del$1(graph, prev);
			}
		}
		function valid(v,k,n, at,env){ var tmp;
			if(val.is(v)){ return true }
			if(obj_is$4(v)){ return 1 }
			if(tmp = env.invalid){
				v = tmp.call(env.as || {}, v,k,n);
				return valid(v,k,n, at,env);
			}
			env.err = "Invalid value at '" + at.path.concat(k).join('.') + "'!";
			if(type.list.is(v)){ env.err += " Use `.set(item)` instead of an Array."; }
		}
		function seen(env, at){
			var arr = env.seen, i = arr.length, has;
			while(i--){ has = arr[i];
				if(at.obj === has.obj){ return has }
			}
			arr.push(at);
		}
	}());
	Graph.node = function(node$$1){
		var soul = node.soul(node$$1);
		if(!soul){ return }
		return obj_put$1({}, soul, node$$1);
	}
	;(function(){
		Graph.to = function(graph, root, opt){
			if(!graph){ return }
			var obj = {};
			opt = opt || {seen: {}};
			obj_map$4(graph[root], map, {obj:obj, graph: graph, opt: opt});
			return obj;
		};
		function map(v,k){ var tmp, obj;
			if(node._ === k){
				if(obj_empty(v, val.rel._)){
					return;
				}
				this.obj[k] = obj_copy$1(v);
				return;
			}
			if(!(tmp = val.rel.is(v))){
				this.obj[k] = v;
				return;
			}
			if(obj = this.opt.seen[tmp]){
				this.obj[k] = obj;
				return;
			}
			this.obj[k] = this.opt.seen[tmp] = Graph.to(this.graph, tmp, this.opt);
		}
	}());
	var fn_is$2 = type.fn.is;
	var obj$4 = type.obj, obj_is$4 = obj$4.is, obj_del$1 = obj$4.del, obj_has$2 = obj$4.has, obj_empty = obj$4.empty, obj_put$1 = obj$4.put, obj_map$4 = obj$4.map, obj_copy$1 = obj$4.copy;
	var u$3;
	var graph = Graph;

	// On event emitter generic javascript utility.
	var onto = function onto(tag, arg, as){
		if(!tag){ return {to: onto} }
		var u, tag = (this.tag || (this.tag = {}))[tag] ||
		(this.tag[tag] = {tag: tag, to: onto._ = {
			next: function(arg){ var tmp;
				if((tmp = this.to)){ 
					tmp.next(arg);
			}}
		}});
		if(arg instanceof Function){
			var be = {
				off: onto.off || 
				(onto.off = function(){
					if(this.next === onto._.next){ return !0 }
					if(this === this.the.last){
						this.the.last = this.back;
					}
					this.to.back = this.back;
					this.next = onto._.next;
					this.back.to = this.to;
					if(this.the.last === this.the){
						delete this.on.tag[this.the.tag];
					}
				}),
				to: onto._,
				next: arg,
				the: tag,
				on: this,
				as: as,
			};
			(be.back = tag.last || tag).to = be;
			return tag.last = be;
		}
		if((tag = tag.to) && u !== arg){ tag.next(arg); }
		return tag;
	};

	// request / response module, for asking and acking messages.
	 // depends upon onto!
	var ask = function ask(cb, as){
		if(!this.on){ return }
		if(!(cb instanceof Function)){
			if(!cb || !as){ return }
			var id = cb['#'] || cb, tmp = (this.tag||empty)[id];
			if(!tmp){ return }
			tmp = this.on(id, as);
			clearTimeout(tmp.err);
			return true;
		}
		var id = (as && as['#']) || Math.random().toString(36).slice(2);
		if(!cb){ return id }
		var to = this.on(id, cb, as);
		to.err = to.err || setTimeout(function(){
			to.next({err: "Error: No ACK received yet."});
			to.off();
		}, (this.opt||{}).lack || 9000);
		return id;
	};

	function Dup(opt){
		var dup = {s:{}};
		opt = opt || {max: 1000, age: 1000 * 9};//1000 * 60 * 2};
		dup.check = function(id){ var tmp;
			if(!(tmp = dup.s[id])){ return false }
			if(tmp.pass){ return tmp.pass = false }
			return dup.track(id);
		};
		dup.track = function(id, pass){
			var it = dup.s[id] || (dup.s[id] = {});
			it.was = time_is();
			if(pass){ it.pass = true; }
			if(!dup.to){
				dup.to = setTimeout(function(){
					var now = time_is();
					type.obj.map(dup.s, function(it, id){
						if(opt.age > (now - it.was)){ return }
						type.obj.del(dup.s, id);
					});
					dup.to = null;
				}, opt.age + 9);
			}
			return it;
		};
		return dup;
	}
	var time_is = type.time.is;
	var dup = Dup;

	function Gun(o){
		if(o instanceof Gun){ return (this._ = {gun: this}).gun }
		if(!(this instanceof Gun)){ return new Gun(o) }
		return Gun.create(this._ = {gun: this, opt: o});
	}

	Gun.is = function(gun){ return (gun instanceof Gun) || (gun && gun._ && gun._.gun && true) || false };

	Gun.version = 0.9;

	Gun.chain = Gun.prototype;
	Gun.chain.toJSON = function(){};


	type.obj.to(type, Gun);
	Gun.HAM = HAM_1;
	Gun.val = val;
	Gun.node = node;
	Gun.state = state;
	Gun.graph = graph;
	Gun.on = onto;
	Gun.ask = ask;
	Gun.dup = dup;
	(function(){
		Gun.create = function(at){
			at.root = at.root || at;
			at.graph = at.graph || {};
			at.on = at.on || Gun.on;
			at.ask = at.ask || Gun.ask;
			at.dup = at.dup || Gun.dup();
			var gun = at.gun.opt(at.opt);
			if(!at.once){
				at.on('in', root, at);
				at.on('out', root, obj_to(at, {out: root}));
				Gun.on('create', at);
				at.on('create', at);
			}
			at.once = 1;
			return gun;
		};
		function root(msg){
			//console.log("add to.next(at)"); // TODO: MISSING FEATURE!!!
			var ev = this, at = ev.as, gun = at.gun, dup$$1, tmp;
			//if(!msg.gun){ msg.gun = at.gun }
			if(!(tmp = msg['#'])){ tmp = msg['#'] = text_rand(9); }
			if((dup$$1 = at.dup).check(tmp)){
				if(at.out === msg.out){
					msg.out = u$4;
					ev.to.next(msg);
				}
				return;
			}
			dup$$1.track(tmp);
			//msg = obj_to(msg);//, {gun: at.gun}); // can we delete this now?
			if(!at.ask(msg['@'], msg)){
				if(msg.get){
					Gun.on.get(msg, gun);
					//at.on('get', get(msg));
				}
				if(msg.put){
					Gun.on.put(msg, gun);
					//at.on('put', put(msg));
				}
			}
			ev.to.next(msg);
			if(!at.out){
				msg.out = root;
				at.on('out', msg);
			}
		}
	}());
	(function(){
		Gun.on.put = function(msg, gun){
			var at = gun._, ctx = {gun: gun, graph: at.graph, put: {}, map: {}, souls: {}, machine: Gun.state(), ack: msg['@']};
			if(!Gun.graph.is(msg.put, null, verify, ctx)){ ctx.err = "Error: Invalid graph!"; }
			if(ctx.err){ return at.on('in', {'@': msg['#'], err: Gun.log(ctx.err) }) }
			obj_map$5(ctx.put, merge, ctx);
			if(!ctx.async){ 
				at.stop = {}; // temporary fix till a better solution?
				obj_map$5(ctx.map, map, ctx);
			}
			if(u$4 !== ctx.defer){
				setTimeout(function(){
					Gun.on.put(msg, gun);
				}, ctx.defer - ctx.machine);
			}
			if(!ctx.diff){ return }
			at.on('put', obj_to(msg, {put: ctx.diff}));
		};
		function verify(val$$1, key, node$$1, soul){ var ctx = this;
			var state$$1 = Gun.state.is(node$$1, key);
			if(!state$$1){ return ctx.err = "Error: No state on '"+key+"' in node '"+soul+"'!" }
			var vertex = ctx.graph[soul] || empty$1, was = Gun.state.is(vertex, key, true), known = vertex[key];
			var HAM = Gun.HAM(ctx.machine, state$$1, was, val$$1, known);
			if(!HAM.incoming){
				if(HAM.defer){ // pick the lowest
					ctx.defer = (state$$1 < (ctx.defer || Infinity))? state$$1 : ctx.defer;
				}
				return;
			}
			ctx.put[soul] = Gun.state.to(node$$1, key, ctx.put[soul]);
			(ctx.diff || (ctx.diff = {}))[soul] = Gun.state.to(node$$1, key, ctx.diff[soul]);
			ctx.souls[soul] = true;
		}
		function merge(node$$1, soul){
			var ctx = this, cat = ctx.gun._, at = (cat.next || empty$1)[soul];
			if(!at){
				if(!(cat.opt||empty$1).super){
					ctx.souls[soul] = false;
					return; 
				}
				at = (ctx.gun.get(soul)._);
			}
			var msg = ctx.map[soul] = {
				put: node$$1,
				get: soul,
				gun: at.gun
			}, as = {ctx: ctx, msg: msg};
			ctx.async = !!cat.tag.node;
			if(ctx.ack){ msg['@'] = ctx.ack; }
			obj_map$5(node$$1, each, as);
			if(!ctx.async){ return }
			if(!ctx.and){
				// If it is async, we only need to setup on listener per context (ctx)
				cat.on('node', function(m){
					this.to.next(m); // make sure to call other context's listeners.
					if(m !== ctx.map[m.get]){ return } // filter out events not from this context!
					ctx.souls[m.get] = false; // set our many-async flag
					obj_map$5(m.put, aeach, m); // merge into view
					if(obj_map$5(ctx.souls, function(v){ if(v){ return v } })){ return } // if flag still outstanding, keep waiting.
					if(ctx.c){ return } ctx.c = 1; // failsafe for only being called once per context.
					this.off();
					cat.stop = {}; // temporary fix till a better solution?
					obj_map$5(ctx.map, map, ctx); // all done, trigger chains.
				});
			}
			ctx.and = true;
			cat.on('node', msg); // each node on the current context's graph needs to be emitted though.
		}
		function each(val$$1, key){
			var ctx = this.ctx, graph$$1 = ctx.graph, msg = this.msg, soul = msg.get, node$$1 = msg.put, at = (msg.gun._);
			graph$$1[soul] = Gun.state.to(node$$1, key, graph$$1[soul]);
			if(ctx.async){ return }
			at.put = Gun.state.to(node$$1, key, at.put);
		}
		function aeach(val$$1, key){
			var msg = this, node$$1 = msg.put, at = (msg.gun._);
			at.put = Gun.state.to(node$$1, key, at.put);
		}
		function map(msg, soul){
			if(!msg.gun){ return }
			//console.log('map ->', soul, msg.put);
			(msg.gun._).on('in', msg);
		}

		Gun.on.get = function(msg, gun){
			var root = gun._, soul = msg.get[_soul], node$$1 = root.graph[soul], has = msg.get[_has];
			var next = root.next || (root.next = {}), at = next[soul];
			if(!node$$1 || !at){ return root.on('get', msg) }
			if(has){
				if(!obj_has$3(node$$1, has)){ return root.on('get', msg) }
				node$$1 = Gun.state.to(node$$1, has);
				// If we have a key in-memory, do we really need to fetch?
				// Maybe... in case the in-memory key we have is a local write
				// we still need to trigger a pull/merge from peers.
			} else {
				node$$1 = Gun.obj.copy(node$$1);
			}
			node$$1 = Gun.graph.node(node$$1);
			//tmp = at.ack;
			root.on('in', {
				'@': msg['#'],
				how: 'mem',
				put: node$$1,
				gun: gun
			});
			//if(0 < tmp){
			//	return;
			//}
			root.on('get', msg);
		};
	}());
	(function(){
		Gun.chain.opt = function(opt){
			opt = opt || {};
			var gun = this, at = gun._, tmp = opt.peers || opt;
			if(!obj_is$5(opt)){ opt = {}; }
			if(!obj_is$5(at.opt)){ at.opt = opt; }
			if(text_is$1(tmp)){ tmp = [tmp]; }
			if(list_is$1(tmp)){
				tmp = obj_map$5(tmp, function(url, i, map){
					map(url, {url: url});
				});
				if(!obj_is$5(at.opt.peers)){ at.opt.peers = {};}
				at.opt.peers = obj_to(tmp, at.opt.peers);
			}
			at.opt.peers = at.opt.peers || {};
			obj_to(opt, at.opt); // copies options on to `at.opt` only if not already taken.
			Gun.on('opt', at);
			at.opt.uuid = at.opt.uuid || function(){ return state_lex() + text_rand(12) };
			return gun;
		};
	}());

	var list_is$1 = Gun.list.is;
	var text$1 = Gun.text, text_is$1 = text$1.is, text_rand = text$1.random;
	var obj$5 = Gun.obj, obj_is$5 = obj$5.is, obj_has$3 = obj$5.has, obj_to = obj$5.to, obj_map$5 = obj$5.map, obj_copy$2 = obj$5.copy;
	var state_lex = Gun.state.lex, _soul = Gun.val.rel._, _has = '.', node_ = Gun.node._, rel_is = Gun.val.rel.is;
	var empty$1 = {}, u$4;

	console.debug = function(i, s){ return (console.debug.i && i === console.debug.i && console.debug.i++) && (console.log.apply(console, arguments) || s) };

	Gun.log = function(){ return (!Gun.log.off && console.log.apply(console, arguments)), [].slice.call(arguments).join(' ') };
	Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) }

	;Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, feel free to ask for help on https://gitter.im/amark/gun and ask StackOverflow questions tagged with 'gun'!");

	if(typeof window !== "undefined"){ window.Gun = Gun; }
	try{ if(typeof common !== "undefined"){ common.exports = Gun; } }catch(e){}
	var root = Gun;

	// WARNING: GUN is very simple, but the JavaScript chaining API around GUN
	// is complicated and was extremely hard to build. If you port GUN to another
	// language, consider implementing an easier API to build.

	root.chain.chain = function(sub){
		var gun = this, at = gun._, chain = new (sub || gun).constructor(gun), cat = chain._, root$$1;
		cat.root = root$$1 = at.root;
		cat.id = ++root$$1.once;
		cat.back = gun._;
		cat.on = root.on;
		cat.on('in', input, cat); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
		cat.on('out', output, cat); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
		return chain;
	};

	function output(msg){
		var get, at = this.as, back = at.back, root$$1 = at.root;
		if(!msg.I){ msg.I = at.gun; }
		if(!msg.gun){ msg.gun = at.gun; }
		this.to.next(msg);
		if(get = msg.get){
			/*if(u !== at.put){
				at.on('in', at);
				return;
			}*/
			if(get['#'] || at.soul){
				get['#'] = get['#'] || at.soul;
				msg['#'] || (msg['#'] = text_rand$1(9));
				back = (root$$1.gun.get(get['#'])._);
				if(!(get = get['.'])){
					if(obj_has$4(back, 'put')){
					//if(u !== back.put){
						back.on('in', back);
					}
					if(back.ack){ return }
					msg.gun = back.gun;
					back.ack = -1;
				} else
				if(obj_has$4(back.put, get)){
					back.on('in', {
						gun: back.gun,
						put: root.state.to(back.put, get),
						get: back.get
					});
					return;
				}
				root$$1.ask(ack, msg);
				return root$$1.on('in', msg);
			}
			if(root$$1.now){
				root$$1.now[at.id] = root$$1.now[at.id] || true;
			}
			if(get['.']){
				if(at.get){
					msg = {get: {'.': at.get}, gun: at.gun};
					(back.ask || (back.ask = {}))[at.get] = msg.gun._; // TODO: PERFORMANCE? More elegant way?
					return back.on('out', msg);
				}
				msg = {get: {}, gun: at.gun};
				return back.on('out', msg);
			}
			at.ack = at.ack || -1;
			if(at.get){
				msg.gun = at.gun;
				get['.'] = at.get;
				(back.ask || (back.ask = {}))[at.get] = msg.gun._; // TODO: PERFORMANCE? More elegant way?
				return back.on('out', msg);
			}
		}
		return back.on('out', msg);
	}

	function input(msg){
		var ev = this, cat = this.as, gun = msg.gun, at = gun._, change = msg.put, rel;
		if(cat.get && msg.get !== cat.get){
			msg = obj_to$1(msg, {get: cat.get});
		}
		if(cat.has && at !== cat){
			msg = obj_to$1(msg, {gun: cat.gun});
			if(at.ack){
				cat.ack = at.ack;
				//cat.ack = cat.ack || at.ack;
			}
		}
		if(node_$1 === cat.get && change && change['#']){
			// TODO: Potential bug? What if (soul.has = pointer) gets changed to (soul.has = primitive), we still need to clear out / wipe /reset (soul.has._) to have _id = nothing, or puts might have false positives (revert back to old soul).
			cat._id = change['#'];
		}
		if(u$5 === change){
			ev.to.next(msg);
			if(cat.soul){ return } // TODO: BUG, I believe the fresh input refactor caught an edge case that a `gun.get('soul').get('key')` that points to a soul that doesn't exist will not trigger val/get etc.
			echo(cat, msg, ev);
			if(cat.has){
				not(cat, msg);
			}
			obj_del$2(at.echo, cat.id);
			obj_del$2(cat.map, at.id);
			return;
		}
		if(cat.soul){
			ev.to.next(msg);
			echo(cat, msg, ev);
			obj_map$6(change, map, {at: msg, cat: cat});
			return;
		}
		if(!(rel = root.val.rel.is(change))){
			if(root.val.is(change)){
				if(cat.has || cat.soul){
					not(cat, msg);
				} else
				if(at.has || at.soul){
					(at.echo || (at.echo = {}))[cat.id] = cat;
					(cat.map || (cat.map = {}))[at.id] = cat.map[at.id] || {at: at};
					//if(u === at.put){ return } // Not necessary but improves performance. If we have it but at does not, that means we got things out of order and at will get it. Once at gets it, it will tell us again.
				}
				ev.to.next(msg);
				echo(cat, msg, ev);
				return;
			}
			if(cat.has && at !== cat && obj_has$4(at, 'put')){
				cat.put = at.put;
			}		if((rel = root.node.soul(change)) && at.has){
				at.put = (cat.root.gun.get(rel)._).put;
			}
			ev.to.next(msg);
			echo(cat, msg, ev);
			relate(cat, msg, at, rel);
			obj_map$6(change, map, {at: msg, cat: cat});
			return;
		}
		relate(cat, msg, at, rel);
		ev.to.next(msg);
		echo(cat, msg, ev);
	}

	function relate(at, msg, from, rel){
		if(!rel || node_$1 === at.get){ return }
		var tmp = (at.root.gun.get(rel)._);
		if(at.has){
			from = tmp;
		} else 
		if(from.has){
			relate(from, msg, from, rel);
		}
		if(from === at){ return }
		(from.echo || (from.echo = {}))[at.id] = at;
		if(at.has && !(at.map||empty$2)[from.id]){ // if we haven't seen this before.
			not(at, msg);
		}
		tmp = (at.map || (at.map = {}))[from.id] = at.map[from.id] || {at: from};
		var now = at.root.now;
		//now = now || at.root.stop;
		if(rel === tmp.rel){
			// NOW is a hack to get synchronous replies to correctly call.
			// and STOP is a hack to get async behavior to correctly call.
			// neither of these are ideal, need to be fixed without hacks,
			// but for now, this works for current tests. :/
			if(!now){
				return;
				/*var stop = at.root.stop;
				if(!stop){ return }
				if(stop[at.id] === rel){ return }
				stop[at.id] = rel;*/
			} else {
				if(u$5 === now[at.id]){ return }
				if((now._ || (now._ = {}))[at.id] === rel){ return }
				now._[at.id] = rel;
			}
		}
		ask$1(at, tmp.rel = rel);
	}
	function echo(at, msg, ev){
		if(!at.echo){ return } // || node_ === at.get ?
		if(at.has){ msg = obj_to$1(msg, {event: ev}); }
		obj_map$6(at.echo, reverb, msg);
	}
	function reverb(to){
		to.on('in', this);
	}
	function map(data, key){ // Map over only the changes on every update.
		var cat = this.cat, next = cat.next || empty$2, via = this.at, chain, at;
		if(node_$1 === key && !next[key]){ return }
		if(!(at = next[key])){
			return;
		}
		//if(data && data[_soul] && (tmp = Gun.val.rel.is(data)) && (tmp = (cat.root.gun.get(tmp)._)) && obj_has(tmp, 'put')){
		//	data = tmp.put;
		//}
		if(at.has){
			if(!(data && data[_soul$1] && root.val.rel.is(data) === root.node.soul(at.put))){
				at.put = data;
			}
			chain = at.gun;
		} else {
			chain = via.gun.get(key);
		}
		at.on('in', {
			put: data,
			get: key,
			gun: chain,
			via: via
		});
	}
	function not(at, msg){
		if(!(at.has || at.soul)){ return }
		var tmp = at.map, root$$1 = at.root;
		at.map = null;
		if(!root$$1.now || !root$$1.now[at.id]){
			if((!msg['@']) && null === tmp){ return }
		}
		if(u$5 === tmp && root.val.rel.is(at.put)){ return } // TODO: Bug? Threw second condition in for a particular test, not sure if a counter example is tested though.
		obj_map$6(tmp, function(proxy){
			if(!(proxy = proxy.at)){ return }
			obj_del$2(proxy.echo, at.id);
		});
		obj_map$6(at.next, function(neat, key){
			neat.put = u$5;
			if(neat.ack){
				neat.ack = -1;
			}
			neat.on('in', {
				get: key,
				gun: neat.gun,
				put: u$5
			});
		});
	}
	function ask$1(at, soul){
		var tmp = (at.root.gun.get(soul)._);
		if(at.ack){
			tmp.on('out', {get: {'#': soul}});
			if(!at.ask){ return } // TODO: PERFORMANCE? More elegant way?
		}
		obj_map$6(at.ask || at.next, function(neat, key){
			//(tmp.gun.get(key)._).on('out', {get: {'#': soul, '.': key}});
			//tmp.on('out', {get: {'#': soul, '.': key}});
			neat.on('out', {get: {'#': soul, '.': key}});
			//at.on('out', {get: {'#': soul, '.': key}});
		});
		root.obj.del(at, 'ask'); // TODO: PERFORMANCE? More elegant way?
	}
	function ack(msg, ev){
		var as = this.as, get = as.get || empty$2, at = as.gun._, tmp = (msg.put||empty$2)[get['#']];
		if(at.ack){ at.ack = (at.ack + 1) || 1; }
		if(!msg.put /*|| node_ == get['.']*/ || (get['.'] && !obj_has$4(tmp, at.get))){
			if(at.put !== u$5){ return }
			//at.ack = 0;
			at.on('in', {
				get: at.get,
				put: at.put = u$5,
				gun: at.gun,
				'@': msg['@']
			});
			return;
		}
		if(node_$1 == get['.']){ // is this a security concern?
			at.on('in', {get: at.get, put: tmp[at.get], gun: at.gun, '@': msg['@']});
			return;
		}
		//if(/*!msg.gun &&*/ !get['.'] && get['#']){ at.ack = (at.ack + 1) || 1 }
		//msg = obj_to(msg);
		msg.gun = at.root.gun;
		//Gun.on('put', at);
		root.on.put(msg, at.root.gun);
	}
	var empty$2 = {}, u$5;
	var obj$6 = root.obj, obj_has$4 = obj$6.has, obj_put$2 = obj$6.put, obj_del$2 = obj$6.del, obj_to$1 = obj$6.to, obj_map$6 = obj$6.map;
	var text_rand$1 = root.text.random;
	var _soul$1 = root.val.rel._, node_$1 = root.node._;

	root.chain.back = function(n, opt){ var tmp;
		n = n || 1;
		if(-1 === n || Infinity === n){
			return this._.root.gun;
		} else
		if(1 === n){
			return (this._.back || this._).gun;
		}
		var gun = this, at = gun._;
		if(typeof n === 'string'){
			n = n.split('.');
		}
		if(n instanceof Array){
			var i = 0, l = n.length, tmp = at;
			for(i; i < l; i++){
				tmp = (tmp||empty$3)[n[i]];
			}
			if(u$6 !== tmp){
				return opt? gun : tmp;
			} else
			if((tmp = at.back)){
				return tmp.gun.back(n, opt);
			}
			return;
		}
		if(n instanceof Function){
			var yes, tmp = {back: at};
			while((tmp = tmp.back)
			&& !(yes = n(tmp, opt))){}
			return yes;
		}
		if(root.num.is(n)){
			return (at.back || at).gun.back(n - 1);
		}
		return this;
	};
	var empty$3 = {}, u$6;

	root.chain.put = function(data, cb, as){
		// #soul.has=value>state
		// ~who#where.where=what>when@was
		// TODO: BUG! Put probably cannot handle plural chains!
		var gun = this, at = (gun._), root$$1 = at.root.gun, tmp;
		as = as || {};
		as.data = data;
		as.via = as.gun = as.via || as.gun || gun;
		if(typeof cb === 'string'){
			as.soul = cb;
		} else {
			as.ack = as.ack || cb;
		}
		if(at.soul){
			as.soul = at.soul;
		}
		if(as.soul || root$$1 === gun){
			if(!obj_is$6(as.data)){
				(as.ack||noop).call(as, as.out = {err: root.log("Data saved to the root level of the graph must be a node (an object), not a", (typeof as.data), 'of "' + as.data + '"!')});
				if(as.res){ as.res(); }
				return gun;
			}
			as.soul = as.soul || (as.not = root.node.soul(as.data) || (as.via.back('opt.uuid') || root.text.random)());
			if(!as.soul){ // polyfill async uuid for SEA
				as.via.back('opt.uuid')(function(err, soul){ // TODO: improve perf without anonymous callback
					if(err){ return root.log(err) } // TODO: Handle error!
					(as.ref||as.gun).put(as.data, as.soul = soul, as);
				});
				return gun;
			}
			as.gun = gun = root$$1.get(as.soul);
			as.ref = as.gun;
			ify(as);
			return gun;
		}
		if(root.is(data)){
			data.get('_').get(function(at, ev, tmp){ ev.off();
				if(!(tmp = at.gun) || !(tmp = tmp._.back) || !tmp.soul){
					return root.log("The reference you are saving is a", typeof at.put, '"'+ as.put +'", not a node (object)!');
				}
				gun.put(root.val.rel.ify(tmp.soul), cb, as);
			});
			return gun;
		}
		as.ref = as.ref || (root$$1._ === (tmp = at.back))? gun : tmp.gun;
		if(as.ref._.soul && root.val.is(as.data) && at.get){
			as.data = obj_put$3({}, at.get, as.data);
			as.ref.put(as.data, as.soul, as);
			return gun;
		}
		as.ref.get('_').get(any, {as: as});
		if(!as.out){
			// TODO: Perf idea! Make a global lock, that blocks everything while it is on, but if it is on the lock it does the expensive lookup to see if it is a dependent write or not and if not then it proceeds full speed. Meh? For write heavy async apps that would be terrible.
			as.res = as.res || stun; // Gun.on.stun(as.ref); // TODO: BUG! Deal with locking?
			as.gun._.stun = as.ref._.stun;
		}
		return gun;
	};

	function ify(as){
		as.batch = batch;
		var opt = as.opt||{}, env = as.env = root.state.map(map$1, opt.state);
		env.soul = as.soul;
		as.graph = root.graph.ify(as.data, env, as);
		if(env.err){
			(as.ack||noop).call(as, as.out = {err: root.log(env.err)});
			if(as.res){ as.res(); }
			return;
		}
		as.batch();
	}

	function stun(cb){
		if(cb){ cb(); }
		return;
		var as = this;
		if(!as.ref){ return }
		if(cb){
			as.after = as.ref._.tag;
			as.now = as.ref._.tag = {};
			cb();
			return;
		}
		if(as.after){
			as.ref._.tag = as.after;
		}
	}

	function batch(){ var as = this;
		if(!as.graph || obj_map$7(as.stun, no)){ return }
		as.res = as.res || function(cb){ if(cb){ cb(); } };
		as.res(function(){
			var cat = (as.gun.back(-1)._), ask = cat.ask(function(ack){
				cat.root.on('ack', ack);
				this.off(); // One response is good enough for us currently. Later we may want to adjust this.
				if(!as.ack){ return }
				as.ack(ack, this);
			}, as.opt);
			// NOW is a hack to get synchronous replies to correctly call.
			// and STOP is a hack to get async behavior to correctly call.
			// neither of these are ideal, need to be fixed without hacks,
			// but for now, this works for current tests. :/
			var tmp = cat.root.now; obj$7.del(cat.root, 'now'); cat.root.PUT = true;
			var tmp2 = cat.root.stop;
			(as.ref._).now = true;
			(as.ref._).on('out', {
				gun: as.ref, put: as.out = as.env.graph, opt: as.opt, '#': ask
			});
			obj$7.del((as.ref._), 'now');
			obj$7.del((cat.root), 'PUT');
			cat.root.now = tmp;
			cat.root.stop = tmp2;
		}, as);
		if(as.res){ as.res(); }
	} function no(v,k){ if(v){ return true } }

	function map$1(v,k,n, at){ var as = this;
		//if(Gun.is(v)){} // TODO: HANDLE!
		if(k || !at.path.length){ return }
		(as.res||iife)(function(){
			var path = at.path, ref = as.ref, opt = as.opt;
			var i = 0, l = path.length;
			for(i; i < l; i++){
				ref = ref.get(path[i]);
			}
			if(root.node.soul(at.obj)){
				var id = root.node.soul(at.obj) || (as.via.back('opt.uuid') || root.text.random)();
				if(!id){ // polyfill async uuid for SEA
					(as.stun = as.stun || {})[path] = true; // make DRY
					as.via.back('opt.uuid')(function(err, id){ // TODO: improve perf without anonymous callback
						if(err){ return root.log(err) } // TODO: Handle error.
						ref.back(-1).get(id);
						at.soul(id);
						as.stun[path] = false;
						as.batch();
					});
					return;
				}
				ref.back(-1).get(id);
				at.soul(id);
				return;
			}
			(as.stun = as.stun || {})[path] = true;
			ref.get('_').get(soul, {as: {at: at, as: as}});
		}, {as: as, at: at});
	}

	function soul(msg, ev){ var as = this.as, cat = as.at; as = as.as;
		//ev.stun(); // TODO: BUG!?
		if(!msg.gun || !msg.gun._.back){ return } // TODO: Handle
		var at = msg.gun._, at_ = at;
		var _id = (msg.put||empty$4)['#'];
		ev.off();
		at = (msg.gun._.back); // go up 1!
		var id = id || root.node.soul(cat.obj) || root.node.soul(at.put) || root.val.rel.is(at.put) || _id || at_._id || (as.via.back('opt.uuid') || root.text.random)(); // TODO: BUG!? Do we really want the soul of the object given to us? Could that be dangerous?
		if(!id){ // polyfill async uuid for SEA
			at.via.back('opt.uuid')(function(err, id){ // TODO: improve perf without anonymous callback
				if(err){ return root.log(err) } // TODO: Handle error.
				solve(at, at_._id = at_._id || id, cat, as);
			});
			return;
		}
		solve(at, at_._id = at_._id || id, cat, as);
	}

	function solve(at, id, cat, as){
		at.gun.back(-1).get(id);
		cat.soul(id);
		as.stun[cat.path] = false;
		as.batch();
	}

	function any(at, ev){
		var as = this.as;
		if(!at.gun || !at.gun._){ return } // TODO: Handle
		if(at.err){ // TODO: Handle
			console.log("Please report this as an issue! Put.any.err");
			return;
		}
		var cat = (at.gun._.back), data = cat.put, opt = as.opt||{}, tmp;
		if((tmp = as.ref) && tmp._.now){ return }
		ev.off();
		if(as.ref !== as.gun){
			tmp = (as.gun._).get || cat.get;
			if(!tmp){ // TODO: Handle
				console.log("Please report this as an issue! Put.no.get"); // TODO: BUG!??
				return;
			}
			as.data = obj_put$3({}, tmp, as.data);
			tmp = null;
		}
		if(u$7 === data){
			if(!cat.get){ return } // TODO: Handle
			if(!cat.soul){
				tmp = cat.gun.back(function(at){
					if(at.soul){ return at.soul }
					as.data = obj_put$3({}, at.get, as.data);
				});
			}
			tmp = tmp || cat.get;
			cat = (cat.root.gun.get(tmp)._);
			as.not = as.soul = tmp;
			data = as.data;
		}
		if(!as.not && !(as.soul = root.node.soul(data))){
			if(as.path && obj_is$6(as.data)){ // Apparently necessary
				as.soul = (opt.uuid || as.via.back('opt.uuid') || root.text.random)();
			} else {
				//as.data = obj_put({}, as.gun._.get, as.data);
				if(node_$2 == at.get){
					as.soul = (at.put||empty$4)['#'] || at._id;
				}
				as.soul = as.soul || at.soul || cat.soul || (opt.uuid || as.via.back('opt.uuid') || root.text.random)();
			}
			if(!as.soul){ // polyfill async uuid for SEA
				as.via.back('opt.uuid')(function(err, soul){ // TODO: improve perf without anonymous callback
					if(err){ return root.log(err) } // Handle error.
					as.ref.put(as.data, as.soul = soul, as);
				});
				return;
			}
		}
		as.ref.put(as.data, as.soul, as);
	}
	var obj$7 = root.obj, obj_is$6 = obj$7.is, obj_put$3 = obj$7.put, obj_map$7 = obj$7.map;
	var u$7, empty$4 = {}, noop = function(){}, iife = function(fn,as){fn.call(as||empty$4);};
	var node_$2 = root.node._;

	root.chain.get = function(key, cb, as){
		var gun, tmp;
		if(typeof key === 'string'){
			var back = this, cat = back._;
			var next = cat.next || empty$5;
			if(!(gun = next[key])){
				gun = cache(key, back);
			}
			gun = gun.gun;
		} else
		if(key instanceof Function){
			gun = this;
			var at = gun._, root$$1 = at.root, tmp = root$$1.now, ev;
			as = cb || {};
			as.use = key;
			as.out = as.out || {};
			as.out.get = as.out.get || {};
			ev = at.on('in', use, as);
			(root$$1.now = {$:1})[as.now = at.id] = ev;
			at.on('out', as.out);
			root$$1.now = tmp;
			return gun;
		} else
		if(num_is$2(key)){
			return this.get(''+key, cb, as);
		} else
		if(tmp = rel.is(key)){
			return this.get(tmp, cb, as);
		} else {
			(as = this.chain())._.err = {err: root.log('Invalid get request!', key)}; // CLEAN UP
			if(cb){ cb.call(as, as._.err); }
			return as;
		}
		if(tmp = cat.stun){ // TODO: Refactor?
			gun._.stun = gun._.stun || tmp;
		}
		if(cb && cb instanceof Function){
			gun.get(cb, as);
		}
		return gun;
	};
	function cache(key, back){
		var cat = back._, next = cat.next, gun = back.chain(), at = gun._;
		if(!next){ next = cat.next = {}; }
		next[at.get = key] = at;
		if(back === cat.root.gun){
			at.soul = key;
		} else
		if(cat.soul || cat.has){
			at.has = key;
			//if(obj_has(cat.put, key)){
				//at.put = cat.put[key];
			//}
		}
		return at;
	}
	function use(msg){
		var ev = this, as = ev.as, gun = msg.gun, at = gun._, root$$1 = at.root, data = msg.put, tmp;
		if((tmp = root$$1.now) && ev !== tmp[as.now]){
			return ev.to.next(msg);
		}
		if(u$8 === data){
			data = at.put;
		}
		if((tmp = data) && tmp[rel._] && (tmp = rel.is(tmp))){
			tmp = (at.root.gun.get(tmp)._);
			if(u$8 !== tmp.put){
				msg = obj_to$2(msg, {put: tmp.put});
			}
		}
		as.use(msg, msg.event || ev);
		ev.to.next(msg);
	}
	var obj$8 = root.obj, obj_has$5 = obj$8.has, obj_to$2 = root.obj.to;
	var num_is$2 = root.num.is;
	var rel = root.val.rel, node_$3 = root.node._;
	var empty$5 = {}, u$8;

	var src = root;

	return src;

})));
