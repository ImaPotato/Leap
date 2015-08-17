var imageArray = [];
var loaders = [];

var images = function() {

  function loadImage(src) {
    var deferred = $.Deferred();
    var img = new Image();

    img.onload = function() {
      imageArray.push(img);
      deferred.resolve();
    };

    img.src = src;
    img.style.zIndex = "1";

    return deferred.promise();
  }

  this.initialiseImages = function() {
    for (var i = 1; i < 8; i++) {
      loaders.push(loadImage('image/' + i + '.png'));
    }
  };

  this.addImages = function() {
    for (var i = 0; i < 7; i++) {
      //this is also really bad...
      $('#panel').append(
        "<div>" +
        "<img id=img-" + i + " src='" + imageArray[i].src + "' class='img-rounded unmoveable' style='height:128px;z-index:1'> " +
        "<hr>" +
        "</div>");
    }
  };

  this.removeAll = function() {

  };

  this.removeOne = function() {

  };

};
