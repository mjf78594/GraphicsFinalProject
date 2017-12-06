"use strict";

var gl;
var canvas;
var program;
var lightPogram;
var bufferId;
var mode; //Moving: 1 / Not moving : 0

var cameraType;//1 for free-roam, 2 for first person, 3 for reaction
var freeRoam; //Should be currently pointing at the cart or at the origin

//Toggle modes for lights
var redT;
var greenT;
var blueT;
var whiteT;
var spotlight;

var lookingFrom; //Where the camera is pointing from
var lookingAt; //Where the camera is pointing to
var currentPoint; //The current cart location
var forwardPoint; //The next point the cart will be located
var forwardVector; //The Forward vector for the cart


//Arrays for buffers
var landscape;
var pyramid;
var cart;
var trackPoints;
var track;
var rails;
var sphereverts;
var lightGlobe;


var zoom;
var dolly;

var savedZoom;
var savedDolly;

var worldToDraw;

//Arrays of vec4 colors
var trackColors;
var railColors;

//Counters for the number of vertices that need to be rendered
var groundVertices; //The number of vertices for the ground.
var pyramidVertices; //The number of vertices for a pyramid.
var cartVertices;//The number of vertices for the cart
var wheelVertices;//For the triangle Fan wheels
var depthVertices;//For the triangle Fan wheel depth
var headVertices; //For the sphere for the riders head.
var eyeVertices; //For the spheres of the riders eyes.
var trackVertices; //For the rail tracks.
var railVertices; // For the actual rails.
var lightVerts;

//Uniforms
var umv;
var uproj;

//shader variable indices for per vertex and material attributes
var vPosition; //
var vNormal;
var vAmbientDiffuseColor; //Ambient and Diffuse can be the same for the material
var vSpecularColor; //highlight color
var vSpecularExponent;

//uniform indices for light properties
var light_position;
var light_color;
var ambient_light; //the 'fudge' term
var spotlight_color;

var spotlight_position;
var spotlight_direction;
var cutoff;

//Angle Offsets
var xAngle;
var yAngle;
var zAngle;

var headAngle;

//Position offsets
var xOffset;
var yOffset;
var zOffset;

//Scale offset
var xScale;
var yScale;
var zScale;

//Cart positions
var posX;
var negX;
var posY;
var negY;
var posZ;
var negZ;
var depth;

var trackIndex;
var movementMat;

//Only used for linear interpolation
var p0 = 0; //Control point index 0 is the starting P0
var t = 0; //t is the free parameter
var tstep = 0.2; //delta t

window.onload = function init() {

    //Set canvas reference for gl
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if(!gl) {
        alert("WebGL isn't available");
    }

    //initialize programs
    program = initShaders(gl, "vert-shader.glsl", "frag-shader.glsl");
    gl.useProgram(program);

    lightPogram = initShaders(gl, "lightVert-shader.glsl", "lightFrag-shader.glsl");

    //initialize uniforms from shader
    umv = gl.getUniformLocation(program, "mv");
    uproj = gl.getUniformLocation(program, "proj");
    vAmbientDiffuseColor = gl.getAttribLocation(program, "vAmbientDiffuseColor");
    vSpecularColor = gl.getAttribLocation(program, "vSpecularColor");
    vSpecularExponent = gl.getAttribLocation(program, "vSpecularExponent");
    light_position = gl.getUniformLocation(program, "light_position");
    light_color = gl.getUniformLocation(program, "light_color");
    ambient_light = gl.getUniformLocation(program, "ambient_light");
    spotlight_color = gl.getUniformLocation(program, "spotlight_color");
    spotlight_position = gl.getUniformLocation(program, "spotlight_position");
    spotlight_direction = gl.getUniformLocation(program, "spotlight_direction");
    cutoff = gl.getUniformLocation(program, "cutoff");

    gl.uniform1f(cutoff, Math.cos(radians(20.0)));

    redT = greenT = blueT = redT = whiteT = spotlight = false;
    cameraType = mode = 1; // Initialize motion, ambient light and viewPoint
    savedZoom = zoom = 45;
    savedDolly = dolly = 325;
    currentPoint = lookingAt = vec3(0.0, 0.0, 0.0); //X, Y, Z points for the camera to look at
    forwardVector = normalize(vec4(-1.0, 1.0, - 8.0, 0.0));
    lookingFrom = vec3(0.0, 0.0, dolly); //Point the camera is looking from
    freeRoam = 0;
    trackIndex = 0;//Initialize track index to start the roller coaster
    lightVerts = groundVertices = depthVertices = cartVertices = wheelVertices = headVertices = eyeVertices = 0;//Vertex counts
    pyramidVertices = trackVertices = railVertices = 0;//Vertex counts
    xOffset = yOffset = zOffset = 0.0;
    headAngle = xAngle = yAngle = zAngle = 0.0;//Angle offsets
    xScale = yScale = zScale = 1.0;//Scale offsets

    //Cart locations
    posX = 4.0;
    negX = -4.0;
    posY = 2.0;
    negY = -2.0;
    posZ = 2.0;
    negZ = -2.0;
    depth = 0.8;

    //Initialize empty vertex arrays
    cart = [];
    landscape = [];
    pyramid = [];
    trackPoints = [];
    track = [];
    rails = [];
    sphereverts = [];
    worldToDraw = [];
    lightGlobe = [];

    //identity matrix, will be used for movement orientation
    movementMat = mat4();

    /////Define the colors of the track and rails
    trackColors = [];
    trackColors.push(vec4(0.8, 0.4, 0.2, 1.0)); //brown
    trackColors.push(vec4(0.8, 0.4, 0.2, 1.0)); //brown
    trackColors.push(vec4(0.8, 0.4, 0.2, 1.0)); //brown
    trackColors.push(vec4(0.8, 0.4, 0.2, 1.0)); //brown
    trackColors.push(vec4(0.8, 0.4, 0.2, 1.0)); //brown
    trackColors.push(vec4(0.8, 0.4, 0.2, 1.0)); //brown

    railColors = [];
    railColors.push(vec4(0.0, 0.0, 0.0, 1.0)); //black
    railColors.push(vec4(0.0, 0.0, 0.0, 1.0)); //black
    railColors.push(vec4(0.0, 0.0, 0.0, 1.0)); //black
    railColors.push(vec4(0.0, 0.0, 0.0, 1.0)); //black
    railColors.push(vec4(0.0, 0.0, 0.0, 1.0)); //black
    railColors.push(vec4(0.0, 0.0, 0.0, 1.0)); //black

    //Keyboard listener
    window.addEventListener("keydown", function(event) {
        switch(event.key) {
            case "m":
                //start/stop the roller coaster
                if(mode === 1) {
                    mode = 0;
                } else {
                    mode = 1;
                }
                break;
            case "r":
                resetCamera();
                break;
            case "c":
                if(cameraType === 1) {
                    saveCamera();
                    cameraType = 2;
                    resetCamera();
                } else if(cameraType === 2) {
                    cameraType = 3;
                } else {
                    cameraType = 1;
                    dolly = savedDolly;
                    zoom = savedZoom;
                }
                break;
            case "ArrowLeft":
                //Move the riders head left
                headAngle += 2.0;
                if(headAngle >= 85) {
                    headAngle = 85;
                }
                break;
            case "ArrowRight":
                //Move the riders head right
                headAngle -= 2.0;
                if(headAngle <= -85) {
                    headAngle = -85;
                }
                break;
            case "x":
                if(cameraType === 1) {
                    zoom -= 1.0;
                    //Clamp the zoom in to 0
                    if(zoom <= 5) {
                        zoom = 5;
                    }
                }
                break;
            case "z":
                if(cameraType === 1) {
                    zoom += 1.0;
                    if(zoom >= 100) {
                        zoom = 100;
                    }
                }
                break;
            case "q":
                if(cameraType === 1) {
                    dolly += 3.0;
                    if(dolly >= 325) {
                        dolly = 325;
                    }
                }
                break;
            case "e":
                if(cameraType === 1) {
                    dolly -= 3.0;
                    //Clamp the dolly in to 0
                    if(dolly <= 5) {
                        dolly = 5;
                    }
                }
                break;
            case "f":
                if(cameraType === 1) {
                    if(freeRoam === 1) {
                        freeRoam = 0;
                    } else {
                        freeRoam = 1;
                    }
                }
                break;
            case "1":
                redT = !redT;
                break;
            case "2":
                greenT = !greenT;
                break;
            case "3":
                blueT = !blueT;
                break;
            case "4":
                whiteT = !whiteT;
                break;
            case "5":
                spotlight = !spotlight;
                break;
        }
        requestAnimationFrame(render);
    });

    //File Reader with listener
    //https://codepen.io/matt-west/pen/KjEHg
    var fileInput = document.getElementById("fileInput");
    fileInput.addEventListener('change', function(e){
        var file = fileInput.files[0];
        var textType = /text.*/;
        if(file.type.match(textType)){

            var reader = new FileReader();
            reader.onload = function(e){
                parseData(reader.result); //ok, we have our data, so parse it
                requestAnimationFrame(render); //ask for a new frame
            };
            reader.readAsText(file);
        }else{
            console.log("File not supported: " + file.type + ".");
        }
    });

    //Set up the landscape, cart, wheels, track boards and rails (Handled in geometryCreationFunctions.js)
    makeLandscape();
    makePyramid();
    generateSphere(60, vec4(1.0, 0.0, 0.0, 1.0), lightGlobe); //Create a light source
    generateSphere(60, vec4(0.0, 1.0, 0.0, 1.0), lightGlobe); //Create a light source
    generateSphere(60, vec4(0.0, 0.0, 1.0, 1.0), lightGlobe); //Create a light source
    generateSphere(60, vec4(1.0, 1.0, 1.0, 1.0), lightGlobe); //Create a light source
    //makeCube(4.0, -4.0, 4.0, 0.0, 2.0, -2.0, cartColors, cart); //Use this to make a cube cart
    generateSphere(60, vec4(0.8, 0.1, 0.5, 1.0), cart);
    makeWheels();
    makeCube(4.0, -4.0, 0.5, -0.5, 0.75, -0.75, trackColors, track);
    makeCube(0.25, -0.25, 1.0, 0.0, 2.0, -2.0, railColors, rails);
    generateSphere(60, vec4(1.0, 1.0, 1.0, 1.0), sphereverts);//Create the head
    generateSphere(60, vec4(0.0, 0.0, 0.0, 1.0), sphereverts);//Create the eyes

    //Update the vertice counts
    headVertices += sphereverts.length/6;
    eyeVertices += sphereverts.length/6;

    //Make sure the worlds are set up correctly
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.6, 0.8, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //Concatinate the vertex arrays into the world to draw
    worldToDraw = landscape.concat(pyramid).concat(lightGlobe).concat(cart).concat(sphereverts);
    //////Bind buffer and set position and color/////
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(worldToDraw), gl.STATIC_DRAW);
    //Set position
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 48, 0);
    gl.enableVertexAttribArray(vPosition);
    //Set color
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 48, 16);
    gl.enableVertexAttribArray(vColor);
    //Set Normals
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 48, 32);
    gl.enableVertexAttribArray(vNormal);

    window.setInterval(update, 16);
}

//Resets the zoom and dolly
function resetCamera() {
    zoom = 45;
    dolly = 325;
}

//This function preserves the cameraMode 1 zoom and dolly
function saveCamera() {
    savedDolly = dolly;
    savedZoom = zoom;
}

//Parses through the data and creates vec4's out of the data for track points
function parseData(data) {
    var points = data.split(/\s+/); //split on white space
    //three numbers at a time for xyz
    for(var i = 0; i < points.length; i+= 3) {
        trackPoints.push(vec4(parseFloat(points[i]), parseFloat(points[i + 1]), parseFloat(points[i + 2]), 1));
    }

    worldToDraw = worldToDraw.concat(track).concat(rails);
    //////Bind buffer and set position and color/////
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(worldToDraw), gl.STATIC_DRAW);
    //Set position
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 48, 0);
    gl.enableVertexAttribArray(vPosition);
    //Set color
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 48, 16);
    gl.enableVertexAttribArray(vColor);
    //Set Normals
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 48, 32);
    gl.enableVertexAttribArray(vNormal);
}

//This function updates the angles for movement
function update() {
    if(mode === 1) {
        zAngle -= 10.0;
        yAngle += 1.0;//To show off the cart before the track is loaded
        if (trackPoints.length > 0) {
            zAngle -=10;
            yAngle = -90;

            var points = [trackPoints[p0], trackPoints[(p0+1)%trackPoints.length], trackPoints[(p0+2)%trackPoints.length]];
            t+=tstep; //Increase to next t value
            if(t >= 1){//Move to next set of control points
                t-=1;
                p0= (p0+1)%trackPoints.length;//advance to next set of control points
                points = [trackPoints[p0], trackPoints[(p0+1)%trackPoints.length], trackPoints[(p0+2)%trackPoints.length]];
            }

            //Provide orientation for the new forward vector
            var xOrient;
            var yOrient;
            var zOrient;
            xOrient = points[1][0] - points[0][0];
            yOrient = points[1][1] - points[0][1];
            zOrient = points[1][2] - points[0][2];

            var xOr2;
            var yOr2;
            var zOr2;
            xOr2 = points[2][0] - points[1][0];
            yOr2 = points[2][1] - points[1][1];
            zOr2 = points[2][2] - points[1][2];

            forwardPoint = vec3(points[1][0]*(1.0-t) + t*points[2][0], points[1][1]*(1.0-t) + t*points[2][1] - 88, points[1][2]*(1.0-t) + t*points[2][2]);

            //Set the side and forward vectors
            var up = vec4(0, 1, 0, 0);
            var forward = vec4(xOrient*(1.0-t) + t*xOr2, yOrient*(1.0-t) + t*yOr2, zOrient*(1.0-t) + t*zOr2, 0);
            forward =  normalize(forward);

            forwardVector = forward;

            //Take the cross product to get the perpendicular vector
            var perp = cross(normalize(forward), normalize(up));
            var side = vec4(perp, 0.0);

            //Make sure up is perpendicular
            perp = cross(normalize(side), normalize(forward));
            up = vec4(perp, 0.0);

            var origin = vec4(points[0][0]*(1.0-t) + t*points[1][0], points[0][1]*(1.0-t) + t*points[1][1] - 85.5, points[0][2]*(1.0-t) + t*points[1][2], 1.0);

            //Create the movement matrix
            movementMat = mat4(side, up, forward, origin);
            movementMat = transpose(movementMat);

            //Set the current point for the free roaming Camera
            currentPoint = vec3(origin);

            /*
            *************** This is the documentation for project 3 ***************
            *The free roam camera: For this camera dollying and zooming is allowed.
            What is happening here is that we are looking from the point (0,0, dolly) where dolly is an integer between 5 and 405,
            and we are looking at the currentPoint (the point on the track the car is currently located).

            * The free center camera: exactly the same as the free roaming camera except that we are looking at (0,0,0).

            * The ViewPoint Camera: For this camera dollying and zooming is not allowed.
            The point we are looking at is the next point on the track but with a scaled 'forward' vector added to make it look better.
            Where the rider is looking is then moved left or right based on the riders head angle by adding a 'side' vector
            scaled proportional to 1/4 the head angle.
            The point we are looking from is a point just a few 'up' vectors and a few 'forward' vectors from the current track point.

            * The reaction camera: For this camera dollying and zooming is not allowed.
            The point we are looking at is the carts current location, but with a scaled up vector added to make it look at the rider.
            The point we are looking from is 18 'forward' vectors forward from the carts next location raised up about 7 'up' vectors.
            The riders head also moves where the camera is located by adding a 'side' vector scaled proportionally to 1/2 the head angle,
            similar to what was done for the viewpoint camera.
            */
            if(cameraType === 1 && freeRoam === 1) {
                // Free Roam camera
                lookingFrom = vec3(0.0, 0.0, dolly);
                lookingAt = currentPoint;
            } else if(cameraType === 1) {
                // Free Center Camera
                lookingFrom = vec3(0.0, 0.0, dolly);
                lookingAt = vec3(0.0, 0.0, 0.0);
            } else if(cameraType === 2) {
                // ViewPoint Camera
                lookingFrom = add(currentPoint, vec3(scale(6, up)));
                lookingFrom = add(lookingFrom, vec3(scale(2, forward)));
                // Adjust for head angle
                if(headAngle > 0 || headAngle < 0) {
                    forward = vec3(mult(rotate(headAngle, up), vec4(forward, 0.0)));
                }
                lookingAt = add(forwardPoint, vec3(scale(10, forward)));
                lookingAt = add(lookingAt, vec3(scale(3, up)));
            } else if(cameraType === 3) {
                // Reaction camera
                // Adjust for head angle
                if(headAngle > 0 || headAngle < 0) {
                    forward = vec3(mult(rotate(headAngle, up), vec4(forward, 0.0)));
                }
                lookingFrom = add(forwardPoint, vec3(scale(18, forward)));
                lookingFrom = add(lookingFrom, vec3(scale(7, up)));
                lookingAt = add(currentPoint, vec3(scale(6, up)));
            }
        }
    }
    if(cameraType === 1 && freeRoam === 1) {
        // Free Roam camera
        lookingFrom = vec3(0.0, 0.0, dolly);
        lookingAt = currentPoint;
    } else if(cameraType === 1) {
        // Free Center Camera
        lookingFrom = vec3(0.0, 0.0, dolly);
        lookingAt = vec3(0.0, 0.0, 0.0);
    }
    requestAnimationFrame(render);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Set perspective
    var p = perspective(zoom, canvas.width / canvas.height, 1.0, 425.0);
    gl.uniformMatrix4fv(uproj, false, flatten(p));

    //Set ViewPoint
    var mv = lookAt(lookingFrom, lookingAt, vec3(0, 1, 0));
    gl.uniformMatrix4fv(umv, false, flatten(mv));

    //Make sure we have a way to get back to a designated reference matrix
    var commonMat = mv;

    //Every single spot in the entire scene gets at least .5/1% light (R, G, B, A{opacity/transparancy})
    gl.uniform4fv(ambient_light, vec4(.2, .2, .2, 1));

    /////Set the Light Positions/////
    //(X, Y, Z, w) coordinates for where the lights should exist in space.
    //And add it to eye-space for every object in the scene by doing a mult immediately.
    var lightPositions = [];
    lightPositions.push(mult(mv, vec4(-95, 15, -95, 1)));
    lightPositions.push(mult(mv, vec4(95, 15, 95, 1)));
    lightPositions.push(mult(mv, vec4(-95, 15, 95, 1)));
    lightPositions.push(mult(mv, vec4(95, 15, -95, 1)));
    gl.uniform4fv(light_position, flatten(lightPositions));

    if(trackPoints.length > 0) {
        mv = commonMat;
        mv = mult(mv, movementMat);
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, translate(negX + 8.5, negY + 1.75, posZ - 3.0));
        var sLightCurrent = mult(mv, vec4(0.0, 0.0, 0.0, 1.0));
        gl.uniform4fv(spotlight_position, flatten(sLightCurrent));

        var sLightDirection = mult(commonMat, forwardVector);
        gl.uniform4fv(spotlight_direction, flatten(sLightDirection));
    } else {
        mv = commonMat;
        mv = mult(mv, rotateY(-90));
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, rotateY(headAngle));
        mv = mult(mv, translate(xOffset - 1.0, negY + 1.0, zOffset - 7.0));
        var sLightCurrent = mult(mv, vec4(0.0, 0.0, 0.0, 1.0));
        gl.uniform4fv(spotlight_position, flatten(sLightCurrent));

        var sLightDirection = mult(mv, forwardVector);
        gl.uniform4fv(spotlight_direction, flatten(sLightDirection));
    }

    /////Set The Light Colors/////
    var sLightC = vec4(0.0, 0.0, 0.0, 1.0);
    if(spotlight) {
        sLightC = vec4(1.0, 1.0, 1.0, 1.0);
    }
    gl.uniform4fv(spotlight_color, flatten(sLightC));

    //The array of light colors for the floating lights
    var lightColors = [];
    var redC = vec4(0.0, 0.0, 0.0, 1.0);
    var greenC = vec4(0.0, 0.0, 0.0, 1.0);
    var blueC = vec4(0.0, 0.0, 0.0, 1.0);
    var whiteC = vec4(0.0, 0.0, 0.0, 1.0);
    if(greenT) {
        greenC = vec4(0, 0, .4, 1.0);
    }
    if(redT) {
        redC = vec4(.4, 0, 0, 1.0);
    }
    if(blueT) {
        blueC = vec4(0, .4, 0, 1.0);
    }
    if(whiteT) {
        whiteC = vec4(.4, .4, .4, 1.0);
    }
    lightColors.push(greenC);
    lightColors.push(redC);
    lightColors.push(blueC);
    lightColors.push(whiteC);
    gl.uniform4fv(light_color, flatten(lightColors));


    ///////////Drawing begins here ///////////////
    //placeholder is a counter keeping track of the starting index of where we are in the buffer.
    var placeholder = 0;

    //set the specular color and exponent for ground
    gl.vertexAttrib4fv(vSpecularColor, vec4(1.0, 1.0, 1.0, 1.0));
    //30.0 is the level of gloss, 100 = max
    gl.vertexAttrib1f(vSpecularExponent, 10.0);

    ////Draw Ground////
    gl.drawArrays(gl.TRIANGLES, 0, groundVertices);
    placeholder += groundVertices;

    ////Draw some pyramids/////
    //set the specular color and exponent for pyramids
    gl.vertexAttrib4fv(vSpecularColor, vec4(0.0, 0.0, 0.0, 1.0));
    gl.vertexAttrib1f(vSpecularExponent, 0.0);

    gl.drawArrays(gl.TRIANGLES, placeholder, pyramidVertices);

    mv = commonMat;
    mv = mult(mv, translate(30, -50, 30));
    mv = mult(mv, rotateY(90));
    mv = mult(mv, scalem(.5, .5, .5));
    gl.uniformMatrix4fv(umv, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, placeholder, pyramidVertices);

    mv = commonMat;
    mv = mult(mv, translate(-30, -50, 30));
    mv = mult(mv, rotateY(180));
    mv = mult(mv, scalem(.5, .5, .5));
    gl.uniformMatrix4fv(umv, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, placeholder, pyramidVertices);

    mv = commonMat;
    mv = mult(mv, translate(30, -50, -30));
    mv = mult(mv, rotateY(270));
    mv = mult(mv, scalem(.5, .5, .5));
    gl.uniformMatrix4fv(umv, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, placeholder, pyramidVertices);

    mv = commonMat;
    mv = mult(mv, translate(-30, -50, -30));
    mv = mult(mv, scalem(.5, .5, .5));
    gl.uniformMatrix4fv(umv, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, placeholder, pyramidVertices);
    placeholder += pyramidVertices;

    ///////Draw the light spheres///////
    //set the specular color and exponent for lights
    gl.vertexAttrib4fv(vSpecularColor, vec4(1.0, 1.0, 1.0, 1.0));
    gl.vertexAttrib1f(vSpecularExponent, 30.0);

    //Red Light
    mv = commonMat;
    mv = mult(mv, translate(95, 20, 95));
    mv = mult(mv, scalem(5, 5, 5));
    gl.uniformMatrix4fv(umv, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, placeholder, lightVerts/4);
    placeholder += lightVerts/4;

    //Green Light
    mv = commonMat;
    mv = mult(mv, translate(-95, 20, 95));
    mv = mult(mv, scalem(5, 5, 5));
    gl.uniformMatrix4fv(umv, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, placeholder, lightVerts/4);
    placeholder += lightVerts/4;

    //Blue Light
    mv = commonMat;
    mv = mult(mv, translate(-95, 20, -95));
    mv = mult(mv, scalem(5, 5, 5));
    gl.uniformMatrix4fv(umv, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, placeholder, lightVerts/4);
    placeholder += lightVerts/4;

    //White Light
    mv = commonMat;
    mv = mult(mv, translate(95, 20, -95));
    mv = mult(mv, scalem(5, 5, 5));
    gl.uniformMatrix4fv(umv, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, placeholder, lightVerts/4);
    placeholder += lightVerts/4;

    //////Draw Cart//////
    if(trackPoints.length > 0) {
        //set the specular exponent for the cart body
        gl.vertexAttrib1f(vSpecularExponent, 40.0);

        //The Cart body
        mv = commonMat;
        mv = mult(mv, movementMat);
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, scalem(5.0, 2.5, 3.0));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLES, placeholder, cartVertices);

        placeholder += cartVertices;

        //set the specular exponent for the wheels
        gl.vertexAttrib1f(vSpecularExponent, 5.0);

        //////Rotate the wheels and Draw them//////
        //Right front wheel
        mv = commonMat;
        mv = mult(mv, movementMat);
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, translate(posX - 1.5, negY, posZ + depth));
        mv = mult(mv, rotateZ(zAngle));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLE_FAN, placeholder, wheelVertices);
        gl.drawArrays(gl.TRIANGLE_STRIP, placeholder + wheelVertices, depthVertices);

        //Right back wheel
        mv = commonMat;
        mv = mult(mv, movementMat);
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, translate(posX - 1.5, negY, -posZ - depth));
        mv = mult(mv, scalem(xScale, yScale, -zScale, 1.0));
        mv = mult(mv, rotateZ(zAngle));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLE_FAN, placeholder, wheelVertices);
        gl.drawArrays(gl.TRIANGLE_STRIP, placeholder + wheelVertices, depthVertices);

        //left back wheel
        mv = commonMat;
        mv = mult(mv, movementMat);
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, translate(negX + 1.5, negY, - posZ - depth));
        mv = mult(mv, scalem(xScale, yScale, -zScale, 1.0));
        mv = mult(mv, rotateZ(zAngle));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLE_FAN, placeholder, wheelVertices);
        gl.drawArrays(gl.TRIANGLE_STRIP, placeholder + wheelVertices, depthVertices);

        //left front wheel
        mv = commonMat;
        mv = mult(mv, movementMat);
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, translate(negX + 1.5, negY, posZ + depth));
        mv = mult(mv, rotateZ(zAngle));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLE_FAN, placeholder, wheelVertices);
        gl.drawArrays(gl.TRIANGLE_STRIP, placeholder + wheelVertices, depthVertices);

        placeholder += wheelVertices + depthVertices;

        //set the specular color and exponent for the headlight and rider
        gl.vertexAttrib4fv(vSpecularColor, vec4(1.0, 1.0, 1.0, 1.0));
        gl.vertexAttrib1f(vSpecularExponent, 0.0);

        //Draw the headlight
        mv = commonMat;
        mv = mult(mv, movementMat);
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, translate(negX + 8.5, negY + 2.5, posZ - 2.0));
        mv = mult(mv, scalem(.75, .75, .75));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLES, placeholder, headVertices);

        //Draw the rider
        mv = commonMat;
        mv = mult(mv, movementMat);
        mv = mult(mv, rotateY(180));
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, rotateY(-headAngle));
        mv = mult(mv, translate(negX + 4.0, negY + 5.5, posZ - 2.0));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLES, placeholder, headVertices);

        placeholder += headVertices;

        mv = commonMat;
        mv = mult(mv, movementMat);
        mv = mult(mv, rotateY(180));
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, rotateY(-headAngle));
        mv = mult(mv, translate(negX + 3.2, negY + 5.7, posZ - 2.5));
        mv = mult(mv, scalem(.15, .15, .15));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLES, placeholder, eyeVertices);

        mv = commonMat;
        mv = mult(mv, movementMat);
        mv = mult(mv, rotateY(180));
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, rotateY(-headAngle));
        mv = mult(mv, translate(negX + 3.2, negY + 5.7, posZ - 1.5));
        mv = mult(mv, scalem(.15, .15, .15));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLES, placeholder, eyeVertices);

        placeholder += eyeVertices;
    } else {
        //set the specular color and exponent for the cart body
        gl.vertexAttrib4fv(vSpecularColor, vec4(0.8, 0.1, 0.5, 1.0));
        gl.vertexAttrib1f(vSpecularExponent, 15.0);

        //The Cart body
        mv = commonMat;
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, translate(xOffset, negY + 2.0, zOffset));
        mv = mult(mv, scalem(5.0, 2.5, 3.0));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLES, placeholder, cartVertices);

        placeholder += cartVertices;

        //////Rotate the wheels and Draw them//////
        //set the specular color and exponent for the wheels
        gl.vertexAttrib4fv(vSpecularColor, vec4(0.6, 0.3, 0.1, 1.0));
        gl.vertexAttrib1f(vSpecularExponent, 15.0);

        //Right front wheel
        mv = commonMat;
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, translate(posX - 1.5, negY - 0.5, posZ + depth));
        mv = mult(mv, rotateZ(zAngle));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLE_FAN, placeholder, wheelVertices);
        gl.drawArrays(gl.TRIANGLE_STRIP, placeholder + wheelVertices, depthVertices);

        //Right back wheel
        mv = commonMat;
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, translate(posX - 1.5, negY - 0.5, -posZ - depth));
        mv = mult(mv, scalem(xScale, yScale, -zScale, 1.0));
        mv = mult(mv, rotateZ(zAngle));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLE_FAN, placeholder, wheelVertices);
        gl.drawArrays(gl.TRIANGLE_STRIP, placeholder + wheelVertices, depthVertices);

        //left back wheel
        mv = commonMat;
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, translate(negX + 1.5, negY - 0.5, -posZ - depth));
        mv = mult(mv, scalem(xScale, yScale, -zScale, 1.0));
        mv = mult(mv, rotateZ(zAngle));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLE_FAN, placeholder, wheelVertices);
        gl.drawArrays(gl.TRIANGLE_STRIP, placeholder + wheelVertices, depthVertices);

        //left front wheel
        mv = commonMat;
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, translate(negX + 1.5, negY - 0.5, posZ + depth));
        mv = mult(mv, rotateZ(zAngle));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLE_FAN, placeholder, wheelVertices);
        gl.drawArrays(gl.TRIANGLE_STRIP, placeholder + wheelVertices, depthVertices);

        placeholder += wheelVertices + depthVertices;

        //set the specular color and exponent for the spotlight and rider
        gl.vertexAttrib4fv(vSpecularColor, vec4(0.1, 0.1, 0.1, 1.0));
        gl.vertexAttrib1f(vSpecularExponent, 5.0);

        //Draw the spotlight
        mv = commonMat;
        mv = mult(mv, rotateY(-90));
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, rotateY(headAngle));
        mv = mult(mv, translate(xOffset, negY + 2.0, zOffset - 4.5));
        mv = mult(mv, scalem(.75, .75, .75));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLES, placeholder, headVertices);

        //Draw the rider
        mv = commonMat;
        mv = mult(mv, rotateY(-90));
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, rotateY(headAngle));
        mv = mult(mv, translate(xOffset, negY + 5.5, zOffset));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLES, placeholder, headVertices);

        placeholder += headVertices;

        mv = commonMat;
        mv = mult(mv, rotateY(-90));
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, rotateY(headAngle));
        mv = mult(mv, translate(negX + 4.5, negY + 5.7, posZ - 2.8));
        mv = mult(mv, scalem(.15, .15, .15));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLES, placeholder, eyeVertices);

        mv = commonMat;
        mv = mult(mv, rotateY(-90));
        mv = mult(mv, rotateY(yAngle));
        mv = mult(mv, rotateY(headAngle));
        mv = mult(mv, translate(negX + 3.5, negY + 5.7, posZ - 2.8));
        mv = mult(mv, scalem(.15, .15, .15));
        gl.uniformMatrix4fv(umv, false, flatten(mv));
        gl.drawArrays(gl.TRIANGLES, placeholder, eyeVertices);
    }

    /////Draw track points if there are some available//////
    //set the specular color and exponent for the tracks
    gl.vertexAttrib4fv(vSpecularColor, vec4(0.1, 0.1, 0.1, 1.0));
    gl.vertexAttrib1f(vSpecularExponent, 1.0);

    if(trackPoints.length > 0) {
        for(var i = 0; i < trackPoints.length; i++) {
            //Calculate the orientations
            var xOrient;
            var yOrient;
            var zOrient;
            if (i === trackPoints.length - 1) {
                xOrient = trackPoints[0][0] - trackPoints[i][0];
                yOrient = trackPoints[0][1] - trackPoints[i][1];
                zOrient = trackPoints[0][2] - trackPoints[i][2];
            } else {
                xOrient = trackPoints[i + 1][0] - trackPoints[i][0];
                yOrient = trackPoints[i + 1][1] - trackPoints[i][1];
                zOrient = trackPoints[i + 1][2] - trackPoints[i][2];
            }

            //Set the side and forward vectors
            var up = vec4(0, 1, 0, 0);
            var forward = vec4(xOrient, yOrient, zOrient, 0);

            //Take the cross product to get the perpendicular vector
            var perp = cross(normalize(forward), normalize(up));
            var side = vec4(perp, 0.0);

            //Make sure up is perpendicular
            perp = cross(normalize(side), normalize(forward));
            up = vec4(perp, 0.0);

            //Make sure forward is normalized
            perp = cross(normalize(up), normalize(side));
            forward = vec4(perp, 0.0);

            var origin = vec4(trackPoints[i][0], trackPoints[i][1] - 90, trackPoints[i][2], 1.0);

            var orientMat = mat4(side, up, forward, origin);
            orientMat = transpose(orientMat);

            //Draw the track boards based on new orientation
            mv = commonMat;
            mv = mult(mv, orientMat);
            gl.uniformMatrix4fv(umv, false, flatten(mv));
            gl.drawArrays(gl.TRIANGLES, placeholder, trackVertices);
            //Draw the left rails
            mv = mult(mv, translate(2.0, yOffset, zOffset));
            gl.uniformMatrix4fv(umv, false, flatten(mv));
            gl.drawArrays(gl.TRIANGLES, placeholder + trackVertices, railVertices);
            //Draw the right rails
            mv = mult(mv, translate(-4.0, yOffset, zOffset));
            gl.uniformMatrix4fv(umv, false, flatten(mv));
            gl.drawArrays(gl.TRIANGLES, placeholder + trackVertices, railVertices);
        }
    }
}