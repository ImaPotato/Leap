$(document).ready(function(){

  var image = new images();
  image.initialiseImages();

  //this will be triggered when the images have been loaded
  //this is really bad practice but uh fuck it
  $.when.apply(null, loaders).done(function() {

    console.log('Finished loading images');

    image.addImages();

    console.log('Added images to DOM');

    //we're now safe to access the image array (it's also bad practice to have global variables...)
    var d = new draw();

  });
});
