$(document).ready(function() {

  var image = new images();
  image.initialiseImages();

  //this will be triggered when the images have been loaded
  //this is really bad practice but uh fuck it
  $.when.apply(null, loaders).done(function() {

    image.addImages();
    
    // start doing stuff
    var d = new draw();

  });
});
