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
    for (var i = 1; i < 6; i++) {
      loaders.push(loadImage('image/' + i + '.png'));
    }
  };

  this.addImages = function() {
    for (var i = 1; i < 6; i++) {
      //this is also really bad...
      $('#panel').append(
        "<div>" +
        "<img id=img-" + i + " src='" + imageArray[i - 1].src + "' class='img-rounded unmoveable' style='height:82px;z-index:1'> " +
        "<hr>" +
        "</div>");
    }
  };

  this.removeAll = function() {

  };

  this.removeOne = function() {

  };

};
