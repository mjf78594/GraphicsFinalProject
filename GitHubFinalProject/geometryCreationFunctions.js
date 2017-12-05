//This function produces the points for the grassy surface below the track
function makeLandscape() {
    var bRightX = 100.0;
    var bLeftX = -100.0;
    //var bUpY = 100; //(Currently unused, but it may be needed in the future)
    var bDownY = -100.0;
    var bCloseZ = 100.0;
    var bFarZ = -100.0;
    var groundColor = vec4(.5, .5, .5, 1.0);

    var normalVec = vec4(0.0, 1.0, 0.0, 0.0);

    landscape.push(vec4(bLeftX, bDownY, bFarZ, 1.0));//Top left
    landscape.push(groundColor);
    landscape.push(normalVec); //Normal vector
    landscape.push(vec4(bRightX, bDownY, bFarZ, 1.0));//Top right
    landscape.push(groundColor);
    landscape.push(normalVec); //Normal vector
    landscape.push(vec4(bLeftX, bDownY, bCloseZ, 1.0));//Bottom left
    landscape.push(groundColor);
    landscape.push(normalVec); //Normal vector
    landscape.push(vec4(bLeftX, bDownY, bCloseZ, 1.0));//Duplicate point for start
    landscape.push(groundColor);
    landscape.push(normalVec); //Normal vector
    landscape.push(vec4(bRightX, bDownY, bFarZ, 1.0));//duplicate top right
    landscape.push(groundColor);
    landscape.push(normalVec); //Normal vector
    landscape.push(vec4(bRightX, bDownY, bCloseZ, 1.0));//Bottom right
    landscape.push(groundColor);
    landscape.push(normalVec); //Normal vector

    groundVertices +=6;
}

//This function produces the points for a pyramid (just a fun add on)
function makePyramid() {
    var bRightX = 15.0;
    var bLeftX = -15.0;
    var bUpY = -60;
    var bDownY = -100.0;
    var bCloseZ = 15.0;
    var bFarZ = -15.0;

    var normalRight = vec4(normalize(cross(normalize(subtract(vec4(bRightX, bDownY, bFarZ, 1.0), vec4(0, bUpY, 0, 1.0))), normalize(subtract(vec4(bRightX, bDownY, bCloseZ, 1.0), vec4(0, bUpY, 0, 1.0))))), 0.0);
    var normalLeft = vec4(normalize(cross(normalize(subtract(vec4(bLeftX, bDownY, bFarZ, 1.0), vec4(0, bUpY, 0, 1.0))), normalize(subtract(vec4(bLeftX, bDownY, bCloseZ, 1.0), vec4(0, bUpY, 0, 1.0))))), 0.0);
    var normalBack = vec4(normalize(cross(normalize(subtract(vec4(bLeftX, bDownY, bFarZ, 1.0), vec4(0, bUpY, 0, 1.0))), normalize(subtract(vec4(bRightX, bDownY, bFarZ, 1.0), vec4(0, bUpY, 0, 1.0))))), 0.0);
    var normalFront = vec4(normalize(cross(normalize(subtract(vec4(bLeftX, bDownY, bCloseZ, 1.0), vec4(0, bUpY, 0, 1.0))), normalize(subtract(vec4(bRightX, bDownY, bCloseZ, 1.0), vec4(0, bUpY, 0, 1.0))))), 0.0);


    //left face of pyramid
    pyramid.push(vec4(bLeftX, bDownY, bFarZ, 1.0)); //Position
    pyramid.push(vec4(0.6, 0.0, 0.9, 1.0));//Purple
    pyramid.push(normalLeft); //Normal vector
    pyramid.push(vec4(bLeftX, bDownY, bCloseZ, 1.0));//Position
    pyramid.push(vec4(0.6, 0.0, 0.9, 1.0));//Purple
    pyramid.push(normalLeft); //Normal vector
    pyramid.push(vec4(0, bUpY, 0, 1.0));//Position
    pyramid.push(vec4(0.6, 0.0, 0.9, 1.0));//Purple
    pyramid.push(normalLeft); //Normal vector

    //Right face of pyramid
    pyramid.push(vec4(bRightX, bDownY, bFarZ, 1.0));//Position
    pyramid.push(vec4(0.6, 0.1, 0.3, 1.0)); //maroon
    pyramid.push(normalRight); //Normal vector
    pyramid.push(vec4(bRightX, bDownY, bCloseZ, 1.0));//Position
    pyramid.push(vec4(0.6, 0.1, 0.3, 1.0)); //maroon
    pyramid.push(normalRight); //Normal vector
    pyramid.push(vec4(0, bUpY, 0, 1.0));//Position
    pyramid.push(vec4(0.6, 0.1, 0.3, 1.0)); //maroon
    pyramid.push(normalRight); //Normal vector

    //Front face of pyramid
    pyramid.push(vec4(bLeftX, bDownY, bCloseZ, 1.0));//Position
    pyramid.push(vec4(0.6, 0.7, 0.1, 1.0));//Tan
    pyramid.push(normalFront); //Normal vector
    pyramid.push(vec4(bRightX, bDownY, bCloseZ, 1.0));//Position
    pyramid.push(vec4(0.6, .7, 0.1, 1.0));//Tan
    pyramid.push(normalFront); //Normal vector
    pyramid.push(vec4(0, bUpY, 0, 1.0));//Position
    pyramid.push(vec4(0.6, 0.7, 0.1, 1.0));//Tan
    pyramid.push(normalFront); //Normal vector

    //Back face of pyramid
    pyramid.push(vec4(bLeftX, bDownY, bFarZ, 1.0));//Position
    pyramid.push(vec4(0.3, 0.7, 0.8, 1.0));//Slate blue
    pyramid.push(normalBack); //Normal vector
    pyramid.push(vec4(bRightX, bDownY, bFarZ, 1.0));//Position
    pyramid.push(vec4(0.3, .7, 0.8, 1.0));//Slate blue
    pyramid.push(normalBack); //Normal vector
    pyramid.push(vec4(0, bUpY, 0, 1.0));//Position
    pyramid.push(vec4(0.3, 0.7, 0.8, 1.0));//Slate blue
    pyramid.push(normalBack); //Normal vector

    pyramidVertices +=12;
}


//this function creates a 3D cube/box/rectangle
function makeCube(highX, lowX, highY, lowY, highZ, lowZ, colors, array) {
    //vec4's alternate between vertex and color

    //front
    array.push(vec4(highX, lowY, highZ, 1.0));//Bottom Right
    array.push(colors[0]);
    array.push(vec4(0.0, 0.0, 1.0, 0.0)); //Normal Vector
    array.push(vec4(highX, highY, highZ, 1.0));//Top Right
    array.push(colors[0]);
    array.push(vec4(0.0, 0.0, 1.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, highY, highZ, 1.0));//Top Left
    array.push(colors[0]);
    array.push(vec4(0.0, 0.0, 1.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, highY, highZ, 1.0));//Top Left
    array.push(colors[0]);
    array.push(vec4(0.0, 0.0, 1.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, lowY, highZ, 1.0));//Bottom Left
    array.push(colors[0]);
    array.push(vec4(0.0, 0.0, 1.0, 0.0)); //Normal Vector
    array.push(vec4(highX, lowY, highZ, 1.0));//Bottom Right
    array.push(colors[0]);
    array.push(vec4(0.0, 0.0, 1.0, 0.0)); //Normal Vector

    //back
    array.push(vec4(lowX, lowY, lowZ, 1.0));
    array.push(colors[1]);
    array.push(vec4(0.0, 0.0, -1.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, highY, lowZ, 1.0));
    array.push(colors[1]);
    array.push(vec4(0.0, 0.0, -1.0, 0.0)); //Normal Vector
    array.push(vec4(highX, highY, lowZ, 1.0));
    array.push(colors[1]);
    array.push(vec4(0.0, 0.0, -1.0, 0.0)); //Normal Vector
    array.push(vec4(highX, highY, lowZ, 1.0));
    array.push(colors[1]);
    array.push(vec4(0.0, 0.0, -1.0, 0.0)); //Normal Vector
    array.push(vec4(highX, lowY, lowZ, 1.0));
    array.push(colors[1]);
    array.push(vec4(0.0, 0.0, -1.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, lowY, lowZ, 1.0));
    array.push(colors[1]);
    array.push(vec4(0.0, 0.0, -1.0, 0.0)); //Normal Vector

    //left
    array.push(vec4(highX, highY, highZ, 1.0));
    array.push(colors[2]);
    array.push(vec4(1.0, 0.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(highX, lowY, highZ, 1.0));
    array.push(colors[2]);
    array.push(vec4(1.0, 0.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(highX, lowY, lowZ, 1.0));
    array.push(colors[2]);
    array.push(vec4(1.0, 0.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(highX, lowY, lowZ, 1.0));
    array.push(colors[2]);
    array.push(vec4(1.0, 0.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(highX, highY, lowZ, 1.0));
    array.push(colors[2]);
    array.push(vec4(1.0, 0.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(highX, highY, highZ, 1.0));
    array.push(colors[2]);
    array.push(vec4(1.0, 0.0, 0.0, 0.0)); //Normal Vector

    //right
    array.push(vec4(lowX, highY, lowZ, 1.0));
    array.push(colors[3]);
    array.push(vec4(-1.0, 0.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, lowY, lowZ, 1.0));
    array.push(colors[3]);
    array.push(vec4(-1.0, 0.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, lowY, highZ, 1.0));
    array.push(colors[3]);
    array.push(vec4(-1.0, 0.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, lowY, highZ, 1.0));
    array.push(colors[3]);
    array.push(vec4(-1.0, 0.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, highY, highZ, 1.0));
    array.push(colors[3]);
    array.push(vec4(-1.0, 0.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, highY, lowZ, 1.0));
    array.push(colors[3]);
    array.push(vec4(-1.0, 0.0, 0.0, 0.0)); //Normal Vector

    //top
    array.push(vec4(highX, highY, highZ, 1.0));
    array.push(colors[4]);
    array.push(vec4(0.0, 1.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(highX, highY, lowZ, 1.0));
    array.push(colors[4]);
    array.push(vec4(0.0, 1.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, highY, lowZ, 1.0));
    array.push(colors[4]);
    array.push(vec4(0.0, 1.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, highY, lowZ, 1.0));
    array.push(colors[4]);
    array.push(vec4(0.0, 1.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, highY, highZ, 1.0));
    array.push(colors[4]);
    array.push(vec4(0.0, 1.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(highX, highY, highZ, 1.0));
    array.push(colors[4]);
    array.push(vec4(0.0, 1.0, 0.0, 0.0)); //Normal Vector

    //bottom
    array.push(vec4(highX, lowY, lowZ, 1.0));
    array.push(colors[5]);
    array.push(vec4(0.0, -1.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(highX, lowY, highZ, 1.0));
    array.push(colors[5]);
    array.push(vec4(0.0, -1.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, lowY, highZ, 1.0));
    array.push(colors[5]);
    array.push(vec4(0.0, -1.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, lowY, highZ, 1.0));
    array.push(colors[5]);
    array.push(vec4(0.0, -1.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(lowX, lowY, lowZ, 1.0));
    array.push(colors[5]);
    array.push(vec4(0.0, -1.0, 0.0, 0.0)); //Normal Vector
    array.push(vec4(highX, lowY, lowZ, 1.0));
    array.push(colors[5]);
    array.push(vec4(0.0, -1.0, 0.0, 0.0)); //Normal Vector

    if(array === track) {
        trackVertices += 36;
    } else if(array === rails) {
        railVertices += 36;
    }

}

//This function creates the wheels in their entirety
function makeWheels() {
    var wheels = []; //Empty Array
    var deepWheels = [];//Empty Array
    var r = 1.5;//radius
    var red = 0.0;
    var grn = 0.0;
    var blu = 0.0;

    //Push center and then create the sin/cos points
    wheels.push(vec4(0.0, 0.0, 0.0, 1.0));//Center vertex
    wheels.push(vec4(red, grn, blu, 1.0)); //black
    wheels.push(vec4(0.0, 0.0, 1.0, 0.0)); //Normal

    wheelVertices++;
    for(var j = 0; j <= 80; j++) {
        //Calculate trig coordinates
        var xCoord = r*Math.cos(j*2*Math.PI/80);
        var yCoord = r*Math.sin(j*2*Math.PI/80);

        //Set vertices for wheels
        wheels.push(vec4(xCoord, yCoord, 0.0, 1.0));//Last vertex
        wheels.push(vec4(red, grn, blu, 1.0)); //Orange
        wheels.push(vec4(0.0, 0.0, 1.0, 0.0)); //Normal
        wheelVertices++;

        //Update the color to produce an effect to show rotation
        red += .03;
        grn += .02;
        blu += .01;

        //Set vertices for the tires
        deepWheels.push(vec4(xCoord, yCoord, 0.0, 1.0));//Last vertex
        deepWheels.push(vec4(0.0, 0.0, 0.0, 1.0)); //Black
        deepWheels.push(vec4(xCoord, yCoord, 0.0, 0.0)); //Normal
        deepWheels.push(vec4(xCoord, yCoord, -1*depth, 1.0));//Last vertex - depth
        deepWheels.push(vec4(0.0, 0.0, 0.0, 1.0)); //Black
        deepWheels.push(vec4(xCoord, yCoord, 0.0, 0.0)); //Normal
        depthVertices += 2;
    }
    //Add the wheel and tire vertices to the cart
    cart = cart.concat(wheels);
    cart = cart.concat(deepWheels);
}

//This function creates spheres for the head and eyes of the rider
function generateSphere(subdiv, color, array) {

    var step = (360.0 / subdiv) * (Math.PI / 180.0); //how much do we increase the angles by per triangle

    for (var lat = 0; lat <= Math.PI; lat += step) { //latitude
        for (var lon = 0; lon + step <= 2 * Math.PI; lon += step) { //longitude
            //triangle 1
            array.push(vec4(Math.sin(lat) * Math.cos(lon), Math.sin(lon) * Math.sin(lat), Math.cos(lat), 1.0)); //position
            array.push(color); //color
            array.push(vec4(Math.sin(lat) * Math.cos(lon), Math.sin(lon) * Math.sin(lat), Math.cos(lat), 0.0)); //normal
            array.push(vec4(Math.sin(lat) * Math.cos(lon + step), Math.sin(lat) * Math.sin(lon + step), Math.cos(lat), 1.0)); //position
            array.push(color); //color
            array.push(vec4(Math.sin(lat) * Math.cos(lon+step), Math.sin(lat) * Math.sin(lon+step), Math.cos(lat), 0.0)); //normal
            array.push(vec4(Math.sin(lat + step) * Math.cos(lon + step), Math.sin(lon + step) * Math.sin(lat + step), Math.cos(lat + step), 1.0)); //etc
            array.push(color); //color
            array.push(vec4(Math.sin(lat+step) * Math.cos(lon+step), Math.sin(lon+step) * Math.sin(lat+step), Math.cos(lat+step), 0.0));//normal

            //triangle 2
            array.push(vec4(Math.sin(lat + step) * Math.cos(lon + step), Math.sin(lon + step) * Math.sin(lat + step), Math.cos(lat + step), 1.0));
            array.push(color); //color
            array.push(vec4(Math.sin(lat+step) * Math.cos(lon+step), Math.sin(lon+step) * Math.sin(lat+step), Math.cos(lat+step), 0.0));//normal
            array.push(vec4(Math.sin(lat + step) * Math.cos(lon), Math.sin(lat + step) * Math.sin(lon), Math.cos(lat + step), 1.0));
            array.push(color); //color
            array.push(vec4(Math.sin(lat+step) * Math.cos(lon), Math.sin(lat+step) * Math.sin(lon), Math.cos(lat+step),0.0));//normal
            array.push(vec4(Math.sin (lat) * Math.cos(lon), Math.sin(lon) * Math.sin(lat), Math.cos(lat), 1.0));
            array.push(color); //color
            array.push(vec4(Math.sin(lat) * Math.cos(lon), Math.sin(lon) * Math.sin(lat), Math.cos(lat), 0.0));//normal

            if(array === cart) {
                cartVertices += 6;
            } else if (array === lightGlobe) {
                lightVerts += 6;
            }
        }
    }
}