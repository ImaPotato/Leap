var draw = function(){

  var selectedImage = '';

  // renders each frame
  // docs on Frame - https://developer.leapmotion.com/documentation/javascript/api/Leap.Frame.html
  function draw(frame) {

    var hand = frame.hands;

    for (var i = 0; i < hand.length; i++) { //for each of the hands
    
      var finger = hand[i].fingers[1]; //index finger
      
      var pos = finger.dipPosition;

      // create a circle for the finger
      var radius = 50;
      var x = pos[0]*5;
      var y = $(window).height() - pos[1]*3.5;

      //  update the cursor
      $("#hand" + i).css({
        "position": "absolute", 
        "top": y + "px",
        "left": x + "px",
      });

      // if we've selected an image move it to its new position
      if(selectedImage != ''){
        $('#' + selectedImage).css({
          "position": "absolute", 
          "top": y + "px",
          "left": x + "px",
        });
      }

      if(frame.valid && frame.gestures.length > 0){
        frame.gestures.forEach(function(gesture){
          var handIds = gesture.handIds;
          handIds.forEach(function(handId){
            var hand = frame.hand(handId);

            //hand the gesture occured on

          });

          switch (gesture.type){
            case "circle":
                console.log("Circle Gesture");
                break;
            case "keyTap":
                console.log("Key Tap Gesture");
                // this is pretty gross as well but if we've got something selected and we do this gesture we will put it back down again
                if(selectedImage == ''){
                  onPicture(x, y);
                } else {
                  selectedImage = '';
                }
                break;
            case "screenTap":
                console.log("Screen Tap Gesture");
                break;
            case "swipe":
                console.log("Swipe Gesture");
                break;
            }
        });
      }
    }

     //printing some data
     var output = document.getElementById('output');
     var frameString = "";
     frameString += frame.hands.length;
     frameString += "<br>"
     output.innerHTML = "number of hands: "+ frameString;
  };

  function onPicture(x, y){
  //check if on cat picture
    $('img').each(function(){
      if(x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height){
        // won't work once we bring rotation into the mix but for now it'll do...
        console.log(this);
        console.log(this.id);
        selectedImage = this.id;
        $(this).css({"border-color": "#C1E0FF", 
                      "border-width":"1px", 
                      "border-style":"solid"});
      } else {
        // we will need a better way of doing this as this will only work with one hand...
        $(this).css({"border-color": "#C1E0FF", 
                      "border-width":"0px", 
                      "border-style":"solid"});
      }
    });
  }

  // listen to Leap Motion
  Leap.loop({enableGestures: true}, draw);

} 