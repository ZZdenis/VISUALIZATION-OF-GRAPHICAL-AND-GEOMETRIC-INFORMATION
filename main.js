'use strict';

let gl;                         // The webgl context.
let surface;                    // A surface model
let shProgram;                  // A shader program
let spaceball;                  // A SimpleRotator object that lets the user rotate the view by mouse.
let sphere;
let pos = [0, 0]

function deg2rad(angle) {
    return angle * Math.PI / 180;
}


// Constructor
function Model(name) {
    this.name = name;
    this.iVertexBuffer = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iTextureBuffer = gl.createBuffer();
    this.count = 0;

    this.BufferData = function (vertices) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);

        this.count = vertices.length / 3;
    }
    this.BufferData2 = function (normals) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STREAM_DRAW);

    }
    this.BufferData3 = function (textures) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTextureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STREAM_DRAW);

    }
    this.Draw = function () {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribNormal);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTextureBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTexture, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTexture);

        gl.drawArrays(gl.TRIANGLES, 0, this.count);
    }
}


// Constructor
function ShaderProgram(name, program) {

    this.name = name;
    this.prog = program;

    // Location of the attribute variable in the shader program.
    this.iAttribVertex = -1;
    // Location of the uniform specifying a color for the primitive.
    this.iColor = -1;
    // Location of the uniform matrix representing the combined transformation.
    this.iModelViewProjectionMatrix = -1;

    this.Use = function () {
        gl.useProgram(this.prog);
    }
}


/* Draws a colored cube, along with a set of coordinate axes.
 * (Note that the use of the above drawPrimitive function is not an efficient
 * way to draw with WebGL.  Here, the geometry is so simple that it doesn't matter.)
 */
function draw() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* Set the values of the projection transformation */
    // let projection = m4.perspective(Math.PI / 8, 1, 8, 12);
    let projection = m4.orthographic(-2, 2, -2, 2, -2, 2);

    /* Get the view matrix from the SimpleRotator object.*/
    let modelView = spaceball.getViewMatrix();

    let rotateToPointZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
    let translateToPointZero = m4.translation(0, 0, -0);

    let matAccum0 = m4.multiply(rotateToPointZero, modelView);
    let matAccum1 = m4.multiply(translateToPointZero, matAccum0);

    /* Multiply the projection matrix times the modelview matrix to give the
       combined transformation matrix, and send that to the shader program. */
    let modelViewProjection = m4.multiply(projection, matAccum1);

    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);

    /* Draw the six faces of a cube, with different colors. */
    gl.uniform4fv(shProgram.iColor, [1, 1, 0, 1]);
    gl.uniform3fv(shProgram.iPosition, [Math.cos(Date.now() * 0.001), Math.sin(Date.now() * 0.001), 1]);
    gl.uniform2fv(shProgram.iP, pos);
    gl.uniform1f(shProgram.iR, document.getElementById('r').value);

    surface.Draw();
    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, m4.multiply(modelViewProjection,
        m4.translation(...get3D(pos[0] * 2 * Math.PI, pos[1] * 2 * Math.PI))));
    gl.uniform4fv(shProgram.iColor, [1, 1, 0, -1]);
    sphere.Draw()
}

function animate() {
    draw()
    window.requestAnimationFrame(animate)
}

function CreateSurfaceData() {
    const numUSteps = 150;
    const numVSteps = 150;
    const vertices = [];
    for (let i = 0; i <= numUSteps; i++) {
        for (let j = 0; j <= numVSteps; j++) {
            const u = i * (2 * Math.PI) / numUSteps;
            const v = j * (2 * Math.PI) / numVSteps;
            const uInc = 1 * (2 * Math.PI) / numUSteps;
            const vInc = 1 * (2 * Math.PI) / numVSteps;
            let v1 = get3D(u, v);
            let v2 = get3D(u + uInc, v);
            let v3 = get3D(u, v + vInc);
            let v4 = get3D(u + uInc, v + vInc);
            vertices.push(...v1, ...v2, ...v3, ...v3, ...v2, ...v4);
        }
    }
    return vertices;
}
function CreateSurfaceData2() {
    const numUSteps = 150;
    const numVSteps = 150;
    const normals = [];
    for (let i = 0; i <= numUSteps; i++) {
        for (let j = 0; j <= numVSteps; j++) {
            const u = i * (2 * Math.PI) / numUSteps;
            const v = j * (2 * Math.PI) / numVSteps;
            const uInc = 1 * (2 * Math.PI) / numUSteps;
            const vInc = 1 * (2 * Math.PI) / numVSteps;
            let n1 = getNormal(u, v);
            let n2 = getNormal(u + uInc, v);
            let n3 = getNormal(u, v + vInc);
            let n4 = getNormal(u + uInc, v + vInc);
            normals.push(...n1, ...n2, ...n3, ...n3, ...n2, ...n4);
        }
    }
    console.log(normals)
    return normals;
}
function CreateSurfaceData3() {
    const numUSteps = 150;
    const numVSteps = 150;
    const textures = [];
    for (let i = 0; i <= numUSteps; i++) {
        for (let j = 0; j <= numVSteps; j++) {
            const u = i / numUSteps;
            const v = j / numVSteps;
            const uInc = 1 / numUSteps;
            const vInc = 1 / numVSteps;
            textures.push(...[u, v], ...[u + uInc, v], ...[u, v + vInc], ...[u, v + vInc], ...[u + uInc, v], ...[u + uInc, v + vInc]);
        }
    }
    return textures;
}
const a = 0.5;
const b = 0.5;
const c = 0.5;
function get3D(u, v) {
    const x0 = c * Math.cos(v) ** 3;
    const y0 = c * Math.sin(v) ** 3;

    const x = (a + x0 * Math.cos(u) + y0 * Math.sin(u)) * Math.cos(u);
    const y = (a + x0 * Math.cos(u) + y0 * Math.sin(u)) * Math.sin(u);
    const z = b * u - x0 * Math.sin(u) + y0 * Math.cos(u);

    return [x, y, z]
}
const e = 0.001
function getNormal(u, v) {
    let uv = get3D(u, v)
    let ue = get3D(u + e, v)
    let ve = get3D(u, v + e)
    const dU = [
        (uv[0] - ue[0]) / e,
        (uv[1] - ue[1]) / e,
        (uv[2] - ue[2]) / e
    ]
    const dV = [
        (uv[0] - ve[0]) / e,
        (uv[1] - ve[1]) / e,
        (uv[2] - ue[2]) / e
    ]
    return m4.normalize(m4.cross(dU, dV))
}

function CreateSphereData() {
    let vertexList = [];

    let u = 0,
        t = 0;
    while (u < Math.PI * 2) {
        while (t < Math.PI) {
            let v = getSphereVertex(u, t);
            let w = getSphereVertex(u + 0.1, t);
            let wv = getSphereVertex(u, t + 0.1);
            let ww = getSphereVertex(u + 0.1, t + 0.1);
            vertexList.push(...v, ...w, ...wv, ...wv, ...w, ...ww);
            t += 0.1;
        }
        t = 0;
        u += 0.1;
    }
    return vertexList;
}
const radius = 0.1;
function getSphereVertex(long, lat) {
    return [
        radius * Math.cos(long) * Math.sin(lat),
        radius * Math.sin(long) * Math.sin(lat),
        radius * Math.cos(lat)
    ]
}

/* Initialize the WebGL context. Called from init() */
function initGL() {
    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    shProgram = new ShaderProgram('Basic', prog);
    shProgram.Use();

    shProgram.iAttribVertex = gl.getAttribLocation(prog, "vertex");
    shProgram.iAttribNormal = gl.getAttribLocation(prog, "normal");
    shProgram.iAttribTexture = gl.getAttribLocation(prog, "texture");
    shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
    shProgram.iColor = gl.getUniformLocation(prog, "color");
    shProgram.iPosition = gl.getUniformLocation(prog, "position");
    shProgram.iP = gl.getUniformLocation(prog, "p");
    shProgram.iR = gl.getUniformLocation(prog, "r");

    surface = new Model('Surface');
    surface.BufferData(CreateSurfaceData());
    surface.BufferData2(CreateSurfaceData2());
    surface.BufferData3(CreateSurfaceData3());
    sphere = new Model()
    sphere.BufferData(CreateSphereData())
    sphere.BufferData2(CreateSphereData())
    sphere.BufferData3(CreateSphereData())
    gl.enable(gl.DEPTH_TEST);
}



/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type Error is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 * The second and third parameters are strings that contain the
 * source code for the vertex shader and for the fragment shader.
 */
function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vShader);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }
    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}


/**
 * initialization function that will be called when the page has loaded
 */
function init() {
    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        LoadTexture()
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    spaceball = new TrackballRotator(canvas, draw, 0);

    animate();
}

function LoadTexture() {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const image = new Image();
    image.crossOrigin = 'anonymus';
    image.src = "https://raw.githubusercontent.com/GOB1F/vggi/main/dark%2Brough%2Btree%2Bbark.jpeg";
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );
        console.log("imageLoaded")
        draw()
    }
}

window.onkeydown = (e) => {
    console.log(e.keyCode)
    if (e.keyCode == 87) { //w
        pos[0] = Math.min(pos[0] + 0.01, 1);
    }
    else if (e.keyCode == 65) { //a
        pos[1] = Math.max(pos[1] - 0.01, 0);
    }
    else if (e.keyCode == 83) { //s
        pos[0] = Math.max(pos[0] - 0.01, 0);
    }
    else if (e.keyCode == 68) { //d
        pos[1] = Math.min(pos[1] + 0.01, 1);
    }
}