# Conversion to Lerna

* Remove unused files / Move to archive
* Create packages
  * should we extract things like radisk / file / s3 etc to own  @gun/radisk-store @gun/file-store @gun/s3-store and you need to import it like extended API? 
* use mocha.js & mocha.css from node_modules/mocha/* (are there local changes?)
* add rebuild.js to reflect changes in gun-core / gun-sea to /gun.js /sea.js
* add build/minification to gun-sea
* add browser/ server  entry to gun-sea
* is gun-nts addon or is it part of gun-server
* gun-gun package with gun-server and gun-core  in one package - is this really useful?
* which extended APIs will be archived/removed?
* use @gun module names in unbuild code
