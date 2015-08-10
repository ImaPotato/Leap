var draw = function(){

  var selectedImage = '';
  var mode = 1; //1 is regular and -1 is edit mode

var x;
var y;

  function concatData(id, data) {
      return id + ": " + data + "<br>";
  }

  // renders each frame
  // docs on Frame - https://developer.leapmotion.com/documentation/javascript/api/Leap.Frame.html
  function draw(frame) {

    var hand = frame.hands;

    for (var i = 0; i < hand.length; i++) { //for each of the hands
    
      var finger = hand[i].fingers[1]; //index finger
      var pos = finger.dipPosition;

      // create a circle for the finger
      var radius = 50;

    //previous x, y
    // var x = pos[0]*5;
    //var y = $(window).height() - pos[1]*3.5;

    //hand directly above Leap should be in middle of screen
    x = $(window).width()/2 + pos[0]*6 ;
    y = $(window).height() - pos[1]*3;

      //  update the cursor
      $("#hand" + i).css({
        "position": "absolute", 
        "top": y + "px",
        "left": x + "px",
      });

      // if we've selected an image and we're in moving mode move it to its new position
      if(selectedImage != '' && mode == 1){
        $('#' + selectedImage).css({
          "position": "absolute", 
          "top": y + "px",
          "left": x + "px",
        });
      }

      if(hand[i].pinchStrength > 0.85){
        if(selectedImage == '') onPicture(x, y);
      } 

      if(frame.valid && frame.gestures.length > 0){

        frame.gestures.forEach(function(gesture){

          var handIds = gesture.handIds;
          handIds.forEach(function(handId){

            var hand = frame.hand(handId);

            //hand the gesture occured on

          });
          var m = mode==1 ? "moving mode  " : "edit mode  ";
          switch (gesture.type){
            case "circle":
                console.log("Circle Gesture");
                document.getElementById("output").innerHTML = m+ " circle gesture "+ selectedImage;
                //if we're in edit mode -rotate
                if(selectedImage != '' && mode == -1){

                  var clockwise = false;
                  var pointableID = gesture.pointableIds[0];
                  var direction = frame.pointable(pointableID).direction;
                  var dotProduct = Leap.vec3.dot(direction, gesture.normal);

                  if (dotProduct  >  0) clockwise = true;
                  if (!clockwise) rotateACW(); else rotateCW();

                }
                break;
            case "keyTap":
                console.log("Key Tap Gesture");
                document.getElementById("output").innerHTML = m + " keytap gesture";
                // this is pretty gross as well but if we've got something selected and we do this gesture we will put it back down again
                if(selectedImage != '') selectedImage = '';
                break;
            case "screenTap":
            //tying screenTap to mode change because swipe is awful
                console.log("Screen Tap Gesture");
                document.getElementById("output").innerHTML = m+" screenTap gesture";
                //edit mode
                mode = mode *-1;
                break;
            case "swipe":
                console.log("Swipe Gesture");
                document.getElementById("output").innerHTML = m+" swipe gesture";
                //edit mode
                mode = mode *-1;
                break;
            }


        });
        //both hands on screen and edit mode
            if(frame.hands.length==2 && selectedImage != '' && mode==-1){
             document.getElementById("output").innerHTML = " scaling "+ selectedImage;

              //scaling
              var x1 = hand[0].fingers[1].dipPosition[0];
              var y1 = hand[0].fingers[1].dipPosition[1];

              var x2 = hand[1].fingers[1].dipPosition[0];
              var y2 = hand[1].fingers[1].dipPosition[1];
                
              var dist = Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );  
              if (dist> 100) increaseSize(); else decreaseSize();
            }
      }
    } 
         

     //printing some data
    var output = document.getElementById('output');
    var frameString = concatData("frame_id", frame.id);
    frameString += concatData("num_hands", frame.hands.length);
    frameString += concatData("num_fingers", frame.fingers.length);
    frameString += "<br>";

    //$('#output').innerHtml(frameString);

  };

  function onPicture(x, y){
  //check if on cat picture
    $('img').each(function(){
      if(x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height){
        // won't work once we bring rotation into the mix but for now it'll do...
        selectedImage = this.id;
        $(this).css({"border-color": "#67BCDB", "border-width":"2px", "border-style":"solid"});
      } else {
        // we will need a better way of doing this as this will only work with one hand...
        $(this).css({"border-width":"0px"});
      }
    });
  }

  function checkForGesture(){

  }

  function increaseSize(){
    $('#' + selectedImage).css({ "width": "+=" + $('#' + selectedImage).width() * .01, "height": "+=" + $('#' + selectedImage).height() * .01});
  }
  function decreaseSize(){
    $('#' + selectedImage).css({ "width": "-=" + $('#' + selectedImage).width() * .01, "height": "-=" + $('#' + selectedImage).height() * .01});
  }

  function rotateACW(){
    var img = $('#' + selectedImage);
    var angle = img.getRotateAngle();
    img.rotate(angle -0.5);
  }

  function rotateCW(){
    var img = $('#' + selectedImage);
    var angle = img.getRotateAngle();
    img.rotate(angle -359.5);
  }

  // listen to Leap Motion
  Leap.loop({enableGestures: true}, draw);

} 