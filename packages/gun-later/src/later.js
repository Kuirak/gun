if(typeof window === "undefined"){ //Not in the browser, Include from node
  var Gun = require('@gun/core');
}

;(function(){
	Gun.chain.open || require('@gun/open');

	Gun.chain.later = function(cb, age){
		var gun = this;
		age = age * 1000; // convert to milliseconds.
		setTimeout(function(){
			gun.open(cb, {off: true});
		}, age);
		return gun;
	}
}());