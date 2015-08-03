var imageArray = [];
var loaders = [];

var images = function(){

	function loadSprite(src) {
	    var deferred = $.Deferred();
	    var sprite = new Image();

	    sprite.onload = function() {
	    	imageArray.push(sprite);
	        deferred.resolve();
	    };

	    sprite.src = src;

	    return deferred.promise();
	}

	this.initialiseImages = function(){
		for(var i = 1; i < 6; i++){
			loaders.push(loadSprite('/image/' + i + '.png'));
		}
	};

	this.addImages = function(){
    	for (var i = 0; i < 5; i++){
      		//this is also really bad...
      		$('#imagepanel').append("<img id=img-" + i + " src='"+ imageArray[i].src + "' class='img-rounded' " + 
        		" style='height:128px;border:1px solid #021a40;margin-left:10px; margin-top:10px;'>");
    	}
	};

	this.removeAll = function(){

	};

	this.removeOne = function(){

	};

};