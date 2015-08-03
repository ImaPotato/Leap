var imageArray = [];
var loaders = [];

var images = function(){

	function loadImage(src) {
	    var deferred = $.Deferred();
	    var img = new Image();

	    img.onload = function() {
	    	imageArray.push(img);
	        deferred.resolve();
	    };

	    img.src = src;

	    return deferred.promise();
	}

	this.initialiseImages = function(){
		for(var i = 1; i < 8; i++){
			loaders.push(loadImage('/image/' + i + '.png'));
		}
	};

	this.addImages = function(){
    	for (var i = 0; i < 7; i++){
      		//this is also really bad...
      		$('#imagepanel').append("<img id=img-" + i + " src='"+ imageArray[i].src + "' class='img-rounded' " + 
        		" style='height:128px;margin-left:10px; margin-top:10px;'>");
    	}
	};

	this.removeAll = function(){

	};

	this.removeOne = function(){

	};

};