var draw = function(){

  var selectedImage = '';

  var x;
  var y;
  var canMove = true; //true if selected image is able to move
  var canDrop = true; //true if selected image is able to be dropped
  var moveReset; //reset timer for moving image after rotating
  var dropReset; //reset timer for dropping image after rotating

  function concatData(id, data) {
      return id + ": " + data + "<br>";
  }

  // renders each frame
  // docs on Frame - https://developer.leapmotion.com/documentation/javascript/api/Leap.Frame.html
  function draw(frame) {

    var hand = frame.hands;

    for (var i = 0; i < hand.length; i++) { //for each of the hands
    
      var radius = 50; // create a circle for the finger
      var palmNormalInertia = 0.43; //value at which to register a hand roll movement to scale an image
      

      var finger = hand[i].fingers[1]; //index finger
      var pos = finger.dipPosition;
      var palmNorm = hand[i].roll(); //palm normal value



      //hand directly above Leap should be in middle of screen
      x = $(window).width()/2 + pos[0]*6 ;
      y = $(window).height() - pos[1]*3;

      //  update the cursor
      $("#hand" + i).css({
        "position": "absolute", 
        "top": y + "px",
        "left": x + "px",
      });

      // if we've selected an image move it to its new position
      if(selectedImage != '' && canMove == true){
        $('#' + selectedImage).css({
          "position": "absolute", 
          "top": y + "px",
          "left": x + "px",
        });
      }

      //select an image if user pinches on an image (and there is no image currently selected)
      if(hand[i].pinchStrength > 0.9){
        if(selectedImage == '') onPicture(x, y);
      } 

      //scale image if palm normal is 
      if(selectedImage != ''){
        if (palmNorm > palmNormalInertia) decreaseSize(); 
        else if (palmNorm < -palmNormalInertia) increaseSize();
      }

      //If a gesture has been made by the user
      if(frame.valid && frame.gestures.length > 0){

        frame.gestures.forEach(function(gesture){

          var handIds = gesture.handIds;
          handIds.forEach(function(handId){
            var hand = frame.hand(handId); //hand the gesture occured on        
          });

          switch (gesture.type){
            case "circle":
                console.log("Circle Gesture");
                document.getElementById("output").innerHTML = "circle gesture "+ selectedImage;
                //rotate
                
                if(selectedImage != ''){
                  canMove = false;
                  canDrop = false;
                  clearTimeout(moveReset);
                  clearTimeout(dropReset);
                  dropReset = setTimeout(function(){canDrop = true},300);
                  moveReset = setTimeout(function(){canMove = true},600);

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
                document.getElementById("output").innerHTML = "keytap gesture";
                // this is pretty gross as well but if we've got something selected and we do this gesture we will put it back down again
                if(selectedImage != '' && canDrop == true) selectedImage = '';
                break;
            case "screenTap":

                console.log("Screen Tap Gesture");
                document.getElementById("output").innerHTML = "screenTap gesture";
                break;
            case "swipe":
                console.log("Swipe Gesture");
                document.getElementById("output").innerHTML = "swipe gesture";
                break;
          }
        });
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