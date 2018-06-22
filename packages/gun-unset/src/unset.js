if(typeof window === "undefined"){ //Not in the browser, Include from node
  var Gun = require('@gun/core');
}

;(function(){
	const rel_ = Gun.val.rel._;  // '#'
	const node_ = Gun.node._;  // '_'

	Gun.chain.unset = function(node){
		if( this && node && node[node_] && node[node_].put && node[node_].put[node_] && node[node_].put[node_][rel_] )
			this.put( { [node[node_].put[node_][rel_]]:null} );
		return this;
	}
}());