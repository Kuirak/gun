if(typeof window !== "undefined"){
  var Gun = window.Gun;
} else {
  var Gun = require('@gun/core');
}
Gun.chain.open || require('@gun/open');

Gun.chain.load = function(cb, opt, at){
	(opt = opt || {}).off = !0;
	return this.open(cb, opt, at);
}