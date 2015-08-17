var draw = function() {

  var selectedImage = '';
  //don't judge
  var imgcount = 10;

  var x, y, selX = 0, selY;

  var canMove = true; //true if selected image is able to move
  var canDrop = true; //true if selected image is able to be dropped
  var canMoveZ = false; //true when selected image can move forward or backward along z axis
  var canPinch = true;
  var scaling = false;

  var maxSize = 800;
  var minSize = 50;

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

      if (i == 1) break;

      var radius = 50; // create a circle for the finger
      var palmNormalInertia = 0.40; //threshold value for palm role angle at which to start scaling
      var palmPitchInertia = 0.75; //threshold value for palm pitch angle at which to start changing image depth forward
      var palmPitchInertia2 = -0.10; //threshold value for palm pitch angle at which to start changing image depth backward

      var finger = hand[i].fingers[1]; //index finger
      var pos = finger.dipPosition;
      var palmNorm = hand[i].roll(); //palm roll normal value
      var palmPitch = hand[i].pitch(); //palm pitch normal value

      //hand directly above Leap should be in middle of screen
      x = $(window).width() / 2 + pos[0] * 6;
      y = $(window).height() - pos[1] * 3;

      //  update the cursor
      $("#hand" + i).css({
        "position": "absolute",
        "top": y + "px",
        "left": x + "px",
      });

      // lets do something really gross, if the x position of the cursor is less then 200px, we can assume that it's over the side panel
      if (x - selX < 200) {
        if (hand[i].pinchStrength > 0.9) {

          var id = onPicturePanel(x, y);

          if (id != '' && canPinch) {

            canPinch = false;
            pinchReset = setTimeout(function() {
              canPinch = true
            }, 500);

            var index = -1;

            for (var z = 0; z < selectImages.length; z++) {
              if (selectImages[z] == id) {
                index = z;
              }
            }
            if (index != -1) {
              $("#" + id).css({
                "border-width": "0px"
              });
              selectImages.splice(index, 1);
            } else {
              $("#" + id).css({
                "border-color": "#67BCDB",
                "border-width": "2px",
                "border-style": "solid"
              });
              selectImages.push(id);
            }
          }
        }

        // if they swipe right move all images onto the screen
        if (frame.valid && frame.gestures.length > 0) {

          frame.gestures.forEach(function(gesture) {

            var handIds = gesture.handIds;
            handIds.forEach(function(handId) {
              var hand = frame.hand(handId); //hand the gesture occured on
            });

            switch (gesture.type) {
              case "swipe":
                onSwipe();
                document.getElementById("output").innerHTML = "swipe gesture";
                break;
            }
          });
        }

      } else {

        // if we've selected an image move it to its new position
        if (selectedImage != '' && canMove == true) {

          $('#' + selectedImage).css({
            "position": "absolute",
            "top": y - selY + "px",
            "left": x - selX + "px",
          });
        }

        //select an image if user pinches on an image (and there is no image currently selected)
        if (hand[i].pinchStrength > 0.9) {
          if (selectedImage == '') {
            if (onPicture(x, y)) {
              recolour("select");
            }
          }
        }

        if (palmNorm > palmNormalInertia && selectedImage != '') {
          recolour("scale");
          decreaseSize();
          scaling = true;
        } else if (palmNorm < -palmNormalInertia && selectedImage != '') {
          recolour("scale");
          increaseSize();
          scaling = true;
        } else {
          scaling = false;
        }

        //adjust z-index of selected image depending on palm pitch
        if (selectedImage != '') {
          if (palmPitch < palmPitchInertia2) {
            if (!zDelayStarted) {
              zDelayStarted = true
              recolour("depth");
              depthReset = setTimeout(function() {
                canMoveZ = true
              }, 1500);
            }
            if (canMoveZ) {
              moveBack();
            }

          } else if (palmPitch > palmPitchInertia) {
            if (!zDelayStarted) {
              zDelayStarted = true
              recolour("depth");
              depthReset = setTimeout(function() {
                canMoveZ = true
              }, 1500);
            }
            if (canMoveZ) {
              moveForward();
            }
          } else {
            clearTimeout(depthReset);
            zDelayStarted = false;
            if (canMove && !scaling) {
              recolour("select");
            }
          }
        }

        //If a gesture has been made by the user
        if (frame.valid && frame.gestures.length > 0) {
          frame.gestures.forEach(function(gesture) {

            var handIds = gesture.handIds;
            handIds.forEach(function(handId) {
              var hand = frame.hand(handId); //hand the gesture occured on
            });

            switch (gesture.type) {
              case "circle":
                //rotate
                if (selectedImage != '') {
                  canMove = false;
                  canDrop = false;
                  clearTimeout(moveReset);
                  clearTimeout(dropReset);
                  dropReset = setTimeout(function() {
                    canDrop = true
                  }, 400);
                  moveReset = setTimeout(function() {
                    canMove = true
                  }, 1000);

                  var clockwise = false;
                  var pointableID = gesture.pointableIds[0];
                  var direction = frame.pointable(pointableID).direction;
                  var dotProduct = Leap.vec3.dot(direction, gesture.normal);

                  if (dotProduct > 0) clockwise = true;
                  recolour("rotate");
                  if (!clockwise) rotateACW();
                  else rotateCW();
                }
                break;
              case "keyTap":
                // this is pretty gross as well but if we've got something selected and we do this gesture we will put it back down again
                if (selectedImage != '' && canDrop == true) {
                  selectedImage = '';
                  recolour("unselect");
                  deselectAll();
                }
                break;
              case "screenTap":

                break;
              case "swipe":
                onSwipe();
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

  function onSwipe() {
    if (selectImages.length != 0) {

      for (var i = 0; i < selectImages.length; i++) {

        var img = $('#' + selectImages[i]);
        var pan = $('#imagepanel');

        var cln = img.clone();

        cln.removeClass("unmoveable");

        cln.attr('id', "img-" + imgcount);
        imgcount++;

        pan.append(cln);
      }

      //deselect everything
      selectImages = [];

      $('.unmoveable').each(function() {
        $(this).css({
          "border-width": "0px"
        });
      });

      deselectAll();

    }
  }

  function onPicture(x, y) {
    var result = false;
    selX = 0;
    selY = 0;
    deselectAll();
    //this isn't the fastest operation but means we can easily deal with rotated images.
    var image = document.elementFromPoint(x, y);
    if (image.nodeName.toLowerCase() === 'img') {
      selectedImage = image.id;

      var elemRect = image.getBoundingClientRect(),
        offsetY = y - elemRect.top,
        offsetX = x - elemRect.left;

      selX = offsetX;
      selY = offsetY;

      $("#" + image.id).css({
        "border-color": "#67BCDB",
        "border-width": "2px",
        "border-style": "solid"
      });
      result = true;
    }
    return result;
  }

  function onPicturePanel(x, y) {
    //check if on cat picture
    var img = '';
    $('.unmoveable').each(function() {
      if (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height) {
        // won't work once we bring rotation into the mix but for now it'll do...
        img = this.id;
      }
    });
    return img;
  }

  function increaseSize() {
    if ($('#' + selectedImage).width() < maxSize && $('#' + selectedImage).height() < maxSize) {
      $('#' + selectedImage).css({
        "width": "+=" + $('#' + selectedImage).width() * .01,
        "height": "+=" + $('#' + selectedImage).height() * .01
      });

      selX += selX * .01;
      selY += selY * .01;
    }
  }

  function decreaseSize() {
    if ($('#' + selectedImage).width() > minSize && $('#' + selectedImage).height() > minSize) {
      $('#' + selectedImage).css({
        "width": "-=" + $('#' + selectedImage).width() * .01,
        "height": "-=" + $('#' + selectedImage).height() * .01
      });

      selX -= selX * .01;
      selY -= selY * .01;
    }
  }

  //rotate image anti-clockwise
  function rotateACW() {
    var img = $('#' + selectedImage);
    var angle = img.getRotateAngle();
    img.rotate(angle - 0.2);
  }

  //rotate image clockwise
  function rotateCW() {
    var img = $('#' + selectedImage);
    var angle = img.getRotateAngle();
    img.rotate(angle - 359.8);
  }

  function moveBack() {
    var initialZ = $('#' + selectedImage).css("z-index");
    $('#' + selectedImage).css({
      "z-index": (parseInt(initialZ) - 1).toString()
    });
    canMoveZ = false;
    zDelayStarted = false;
    clearTimeout(depthReset);
  }

  function moveForward() {
    var initialZ = $('#' + selectedImage).css("z-index");
    $('#' + selectedImage).css({
      "z-index": (parseInt(initialZ) + 1).toString()
    });
    canMoveZ = false;
    zDelayStarted = false;
    clearTimeout(depthReset);
  }

  function deselectAll() {
    $('img:not(.unmoveable)').each(function() {
      $(this).css({
        "border-width": "0px"
      });
    });
  }

  //recolour the header and change output text depending on the event
  function recolour(event) {
    switch (event) {
      case "select":
        document.getElementById("output").innerHTML = "Moving image";
        $(".header").css("background-color", "#0099FF");
        break;

      case "unselect":
        document.getElementById("output").innerHTML = "";
        $(".header").css("background-color", "#3BCEAC");
        break;

      case "depth":
        document.getElementById("output").innerHTML = "Changing depth. Current z: " + $('#' + selectedImage).css("z-index");
        $(".header").css("background-color", "#FF9933");
        break;

      case "rotate":
        document.getElementById("output").innerHTML = "Rotating";
        $(".header").css("background-color", "#33CC33");
        break;

      case "scale":
        document.getElementById("output").innerHTML = "Scaling";
        $(".header").css("background-color", "#CF537C");
        break;
    }
  }
  // listen to Leap Motion
  Leap.loop({
    enableGestures: true
  }, draw);

}
