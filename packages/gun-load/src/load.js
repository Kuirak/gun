if(typeof window === "undefined"){ //Not in the browser, Include from node
  var Gun = require('@gun/core');
}

;(function(){
  Gun.chain.open || require('@gun/open');

  Gun.chain.load = function(cb, opt, at){
    (opt = opt || {}).off = !0;
    return this.open(cb, opt, at);
  }
}());