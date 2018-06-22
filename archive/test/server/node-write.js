var Gun = require('../src');

var location = {host:"localhost"};

var gun = Gun( { file: 'write.json', peers: ['http://' + location.host + ':8080/gun'] });

gun.get( 'data' ).path('stuff').put({a: {data: 1}, b: {data: 2}});