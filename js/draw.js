var draw = function(){

  var selectedImage = '';

  var x;
  var y;
  var canMove = true; //true if selected image is able to move
  var canDrop = true; //true if selected image is able to be dropped
  var canMoveZ = false; //true when selected image can move forward or backward along z axis
  var canPinch = true;

  var moveReset; //reset timer for moving image after rotating
  var dropReset; //reset timer for dropping image after rotating
  var depthReset; //reset timer for adjusting z-index of selected image
  var pinchReset; //reset timer for selecting and deslecting images

  var zDelayStarted = false; //If a delay for adjusting z-index is currently in progress or not

  var selectImages = [];

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
      var palmPitchInertia = 0.66;

      var finger = hand[i].fingers[1]; //index finger
      var pos = finger.dipPosition;
      var palmNorm = hand[i].roll(); //palm roll normal value
      var palmPitch = hand[i].pitch(); //palm pitch normal value


      //TESTING HAND PITCH TESTING HAND PITCH
      //console.log(hand[i].pitch());

      //hand directly above Leap should be in middle of screen
      x = $(window).width()/2 + pos[0]*6 ;
      y = $(window).height() - pos[1]*3;

      //  update the cursor
      $("#hand" + i).css({
        "position": "absolute", 
        "top": y + "px",
        "left": x + "px",
      });

      // lets do something really gross, if the x position of the cursor is less then 200px, we can assume that it's over the side panel 
      if(x < 200){

        // check if they're currently holding a picture, if they are place it

        // see if they've attempted to select anything

        if(hand[i].pinchStrength > 0.9){

          var id = onPicturePanel(x, y); 

          if(id != '' && canPinch){

            canPinch = false;
            pinchReset = setTimeout(function(){canPinch = true}, 500);

            var index = -1;

            for (var z = 0; z < selectImages.length; z++){
              if(selectImages[z] == id){
                index = z;
              }
            } 

            if (index != -1){
              selectImages.splice(index, z);
            } else {
              selectImages.push(id);
            }

            $('.unmoveable').each(function(){

              var contains = false;

              for (var z = 0; z < selectImages.length; z ++){
                if (selectImages[z] == this.id){
                  contains = true;
                }
              }

              if (contains){
                $(this).css({"border-color": "#67BCDB", "border-width":"2px", "border-style":"solid"});
              } else {
                $(this).css({"border-width":"0px"});
              }


            });

          }
        } 

        // if they palm down move scroll bar down, the opposite if they palm up
        if (palmNorm > palmNormalInertia){

        } 
        else if (palmNorm < -palmNormalInertia){

        }

        // if they swipe right move all images onto the screen
        if(frame.valid && frame.gestures.length > 0){

          frame.gestures.forEach(function(gesture){

            var handIds = gesture.handIds;
            handIds.forEach(function(handId){
              var hand = frame.hand(handId); //hand the gesture occured on        
            });

            switch (gesture.type){
              case "swipe":
                  if (selectImages.length != 0){

                    for(var i = 0; i < selectImages.length; i++){
                      $("#img-"selectImages[i]);
                    }

                    //deselect everything
                    selectImages = [];
                    $('.unmoveable').each(function(){
                      $(this).css({"border-width":"0px"});
                    });

                  }
                  console.log("Swipe Gesture");
                  document.getElementById("output").innerHTML = "swipe gesture";
                  break;
            }
          });
        }

      } else {

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
          if(selectedImage == ''){
            onPicture(x, y); 
            recolour("select");
          } 
        } 

        //scale selected image depending on palm roll
        if(selectedImage != ''){
          if (palmNorm > palmNormalInertia) decreaseSize(); 
          else if (palmNorm < -palmNormalInertia) increaseSize();
        }

        //adjust z-index of selected image depending on palm pitch
        if(selectedImage != ''){
          if(palmPitch > palmPitchInertia){
            if(!zDelayStarted){
              zDelayStarted = true
              depthReset = setTimeout(function(){canMoveZ = true},2000);
            }
            if(canMoveZ){
              moveBack();
            } 

          }   
          else if (palmPitch < -palmPitchInertia){
            if(!zDelayStarted){
              zDelayStarted = true
              depthReset = setTimeout(function(){canMoveZ = true},2000);
            }
            if(canMoveZ){
              moveForward();
            }     
          }
          else{
            clearTimeout(depthReset);
            zDelayStarted = false;
          }
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
                    dropReset = setTimeout(function(){canDrop = true},400);
                    moveReset = setTimeout(function(){canMove = true},1000);

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
                  if(selectedImage != '' && canDrop == true) {
                    selectedImage = ''; 
                    recolour("unselect");
                  }
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
    }     

    //printing some data
    var output = document.getElementById('output');
    var frameString = concatData("frame_id", frame.id);
    frameString += concatData("num_hands", frame.hands.length);
    frameString += concatData("num_fingers", frame.fingers.length);
    frameString += "<br>";


  };

  function onPicture(x, y){
  //check if on cat picture
    $('img:not(.unmoveable)').each(function(){
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

  function onPicturePanel(x, y){
  //check if on cat picture
    var img = '';
    $('.unmoveable').each(function(){
      if(x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height){
        // won't work once we bring rotation into the mix but for now it'll do...
        img = this.id;
      }
    });
    return img;
  }

  function increaseSize(){
    $('#' + selectedImage).css({ "width": "+=" + $('#' + selectedImage).width() * .01, "height": "+=" + $('#' + selectedImage).height() * .01});
  }
  function decreaseSize(){
    $('#' + selectedImage).css({ "width": "-=" + $('#' + selectedImage).width() * .01, "height": "-=" + $('#' + selectedImage).height() * .01});
  }

  //rotate image anti-clockwise
  function rotateACW(){
    var img = $('#' + selectedImage);
    var angle = img.getRotateAngle();
    img.rotate(angle -0.2);
  }

  //rotate image clockwise
  function rotateCW(){
    var img = $('#' + selectedImage);
    var angle = img.getRotateAngle();
    img.rotate(angle -359.8);
  }

  function moveBack(){
    var initialZ = $('#' + selectedImage).css("z-index");
    $('#' + selectedImage).css({
      "z-index": (parseInt(initialZ) - 1).toString()
    }); 
    console.log("Image moved back. InitialZ: " + initialZ + " and new z: " + (parseInt(initialZ) -1).toString());
    canMoveZ = false;
    zDelayStarted = false;
  }

  function moveForward(){
    var initialZ = $('#' + selectedImage).css("z-index");
    $('#' + selectedImage).css({
      "z-index": (parseInt(initialZ) + 1).toString()
    }); 
    console.log("Image moved forward. InitialZ: " + initialZ + " and new z: " + (parseInt(initialZ) + 1).toString());
    canMoveZ = false;
    zDelayStarted = false;
  }

  //recolour the header depending on the event
  function recolour(event){
    switch(event){
      case "select":
        $(".header").css("background-color", "#0099FF");
        break;

      case "unselect":
        $(".header").css("background-color", "#E6E6E6");
        break;
    }

  }

  // listen to Leap Motion
  Leap.loop({enableGestures: true}, draw);

} 