// ===================================================================================================
/* WebGL */
var canvas;
var gl;


// ===================================================================================================
/* Matrizes */
var projec = mat4();            // Matriz de projeção
var lookat;


// ===================================================================================================
/* Input */
var currentlyPressedKeys = [];
var lastMouseX = 0;
var lastMouseY = 0;
var mouseDown = false;
var mouseRDown = false;




// ===================================================================================================
/* Objetos */
var vertices = [];
var points = [];
var colors = [];
var normals = [];
var normalsAux = [];
var pointsAux = [];

var objects = [];
var balls = [];

var index = 0;
var stringNames = [];
var objStrings = [];
var verticesStart = 0;
var previousPointsSize = 0;




var ballSize = 0.01;
var ballCircumference = 2 * Math.PI * ballSize;


// ===================================================================================================
/* Hitboxes */
var hitboxes = [];




// ===================================================================================================
/* Tabuleiro */
var boardNormal = vec4(0.0, 0.0, 1.0, 0.0);



// ===================================================================================================
/* Main */
window.onload = function init()
{
    
    /* Inicialização do WebGL */
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    
    // Diz para a janela nos avisar quando o seu tamanho mudar
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Seta os valores do tamanho da tela
    screenWidth = canvas.width;
    screenHeight = canvas.height;
    oldWidth = screenWidth;
    oldHeight = screenHeight;
    
    stringNames = ['sphere.obj']; //, 'pimbal3.obj'
    readObj(stringNames[0]);
}

/* LEITURA DE ARQUIVOS */
// Manda o JQuery ler o arquivo 'url'
var readObj = function(url) {
    $.get(url, readObjCallback);
};

// Callback para quando a leitura tiver sido feita,
// já que ela é assíncrona
var readObjCallback = function(obj) {
    // Coloca o novo objeto no vetor
    objStrings.push(obj);
    // Se ainda não acabou, lê o próximo
    if (objStrings.length < stringNames.length) {
        index++;
        readObj(stringNames[index]);
    }
    // Se já acabou, pode fazer o resto
    else
        finishInit();
};

function finishInit() {
    i = 0;
    
    // Liga os callbacks do mouse
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    readVertices(objStrings[0]);
    var ballVertexRange = readFaces(objStrings[0]);
    var ball = newObjectBall(ballVertexRange, vec4(0.0, 0.0, 0.0, 1.0), 0.1);
    balls.push(ball);
    
    ball.velocity = vec4(0.0, 0.0, 0.0, 0.0);
    
    
//    readVertices(objStrings[1]);
//    var tableVertexRange = readFaces(objStrings[1]);
//    var table = newObject(tableVertexRange, vec4(0.0, 0.0, 0.0, 1.0), 0.1, 90, 0, 0);
//    objects.push(table);
    
    
    var hitbox = [vec4(-1.5, -0.3, -1.5, 1.0),      // Retângulo
                  vec4( 1.5, -0.4, -1.5, 1.0),
                  vec4( 1.5, -0.4,  1.5, 1.0),
                  
                  vec4( 0.0,  1.0,  0.0, 0.0),      // Normal (unitária)
                  
                  -0.3 ];                           // Aumento de energia
    
    hitbox[3] = vcross(minus(hitbox[1], hitbox[0]), minus(hitbox[2], hitbox[0]));
    hitbox[3] = normalizev(hitbox[3]);
    
    hitboxes.push(hitbox);
    
    var hitbox2 = [vec4(-1.5, -0.3, -1.5, 1.0),      // Retângulo
                   vec4( 1.5, -0.4,  1.5, 1.0),
                   vec4(-1.5, -0.3,  1.5, 1.0),
                   
                   vec4( 0.0,  1.0,  0.0, 0.0),      // Normal (unitária)
                   
                   -0.3 ];                           // Aumento de energia
    
    hitbox2[3] = vcross(minus(hitbox2[1], hitbox2[0]), minus(hitbox2[2], hitbox2[0]));
    hitbox2[3] = normalizev(hitbox2[3]);
    
    hitboxes.push(hitbox2);
    
    
    
    var hitbox3 = [vec4(-1.5, -0.4, -1.5, 1.0),      // Retângulo
                   vec4( 1.5, -0.3,  1.5, 1.0),
                   vec4(-1.5, -0.4,  1.5, 1.0),
                   
                   vec4( 0.0,  1.0,  0.0, 0.0),      // Normal (unitária)
                   
                   -0.3 ];                           // Aumento de energia
    
    hitbox3[3] = vcross(minus(hitbox3[1], hitbox3[0]), minus(hitbox3[2], hitbox3[0]));
    hitbox3[3] = normalizev(hitbox3[3]);
    
    hitboxes.push(hitbox3);

    var hitbox4 = [vec4(-1.5, -0.4, -1.5, 1.0),      // Retângulo
                   vec4( 1.5, -0.3, -1.5, 1.0),
                   vec4( 1.5, -0.3,  1.5, 1.0),
                   
                   vec4( 0.0,  1.0,  0.0, 0.0),      // Normal (unitária)
                   
                   -0.3 ];                           // Aumento de energia
    
    hitbox4[3] = vcross(minus(hitbox4[1], hitbox4[0]), minus(hitbox4[2], hitbox4[0]));
    hitbox4[3] = normalizev(hitbox4[3]);
    
    hitboxes.push(hitbox4);
    
    
    
    
    
    
    //__________________________________________________________
    computeNormals();
    
    
    /* Configuração do WebGL */
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.1, 0.1, 0.1, 1.0 );
    
    
    
    
    // Enable hidden-surface removal
    gl.enable(gl.DEPTH_TEST);
    
    
    
    
    // Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    
    // Create a buffer object, initialize it, and associate it with the
    // associated attribute variable in our vertex shader
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    
    // Idem, para o vetor de "cores"
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    
    // Idem, para o vetor de normais
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.DYNAMIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
    
    
    
    
    
    
    // Pega as variáveis uniformes dos shaders
    modelViewLoc = gl.getUniformLocation(program, "modelView");
    projecLoc = gl.getUniformLocation(program, "projection");
    
    
    // Inicializa a matriz lookat na posição inicial desejada (arbitrária)
    eye = vec3(0.0, 0.0, 1.0);
    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
    lookat = lookAt(eye, at, up);
    
    
    
    // Inicializa a matriz de projeção
    updatePerspective();
    
    
    render();
};
























/* INICIALIZAÇÃO DE OBJETOS */
// Lê os vértices de cada peça e os armazena no vetor
function readVertices(string) {
    /* Pula as quatro primeiras linhas:
     
     # Blender v2.70 (sub 0) OBJ File: ''
     # www.blender.org
     mtllib bispo.mtl
     o Line02
     */
    
    i = 0;
    for (var bla = 0; bla < 4; bla++) {
        while (string.charAt(i) != '\n') i++;
        i++;
    }
    
    // Para cada linha começada com "v "
    while (string.charAt(i) == 'v' && string.charAt(i+1) != 'n') {
        i += 2;                     // Pula o "v "
        var j;                      // j vai para o fim de cada número
        var vertex = vec4();        // O novo vértice a ser adicionado
        
        // Leitura da coordenada x
        for (j = i; string.charAt(j) != ' '; j++);            // Acha o fim do número
        vertex[0] = parseFloat(string.substr(i, j-1)) / 2;    // Adiciona a coordenada ao novo vértice
        
        // Leitura da coordenada y
        i = j + 1;                                                  // Pula para o número seguinte
        for (j = i; string.charAt(j) != ' '; j++);
        vertex[1] = parseFloat(string.substr(i, j-1)) / 2;
        
        // Leitura da coordenada z
        i = j + 1;
        for (j = i; string.charAt(j) != '\n'; j++);
        vertex[2] = parseFloat(string.substr(i, j-1)) / 2;
        
        i = j + 1;      // Vai para a próxima linha
        
        vertex[3] = 1.0;            // Coordenada homogênea
        
        // Coloca o novo vértice na lista
        vertices.push( vertex );
        normalsAux.push( [vec4( 0.0, 0.0, 0.0, 0.0 )] );
    }
    
}





// Lê as faces, ou seja, os grupos de vértices correspondentes
// a faces e coloca esses grupos em um novo vetor
function readFaces(string) {
    // Pula todas as linhas "vn ", que não vai ser usadas por enquanto
    while (string.charAt(i) == 'v') {
        while (string.charAt(i) != '\n') i++;
        i++;
    }
    
    /* Pula mais duas linhas:
     
     usemtl wire_255255255
     s off
     */
    while (string.charAt(i) != '\n') i++;
    i++;
    while (string.charAt(i) != '\n') i++;
    i++;
    
    // Para cada face
    while (string.charAt(i) == 'f') {
        i += 2;                 // Pula o "f "
        var j;                  // Vai para o fim de cada número
        
        var number = [];        // Triângulo a ser adicionado (índice dos 3 vértices na lista)
        
        // Primeiro vértice
        for (j = i; string.charAt(j) != '/'; j++);          // Lê até a primeira '/'
        number[0] = parseInt(string.substr(i, j-1)) - 1;    // Adiciona o número
        for (i = j; string.charAt(i) != ' '; i++);          // Pula o resto, que por
                                                            // enquanto não vamos usar
        i++;
        
        // Segundo vértice
        for (j = i; string.charAt(j) != '/'; j++);
        number[1] = parseInt(string.substr(i, j-1)) - 1;
        for (i = j; string.charAt(i) != ' '; i++);
        i++;
        
        // Terceiro vértice
        for (j = i; string.charAt(j) != '/'; j++);
        number[2] = parseInt(string.substr(i, j-1)) - 1;
        for (i = j; string.charAt(i) != '\n'; i++);
        i++;
        
        //__Adiciona os vértices__________________________________________________________________________
        
        
        // Adiciona os vértices, em ordem, ao vetor de "pontos"
        for (var k = 0; k < 3; k++) {
            points.push(vertices[verticesStart + number[k]]);
        }

        //__Adiciona as normais________________________________________________________________________
        
        var v1 = minus(vertices[verticesStart + number[1]], vertices[verticesStart + number[0]]);
        var v2 = minus(vertices[verticesStart + number[1]], vertices[verticesStart + number[2]]);
        var faceNormal = vcross(v2, v1);
        var faceNormal = normalizev(faceNormal);

        normalsAux[verticesStart + number[0]].push(faceNormal);
        normalsAux[verticesStart + number[1]].push(faceNormal);
        normalsAux[verticesStart + number[2]].push(faceNormal);
        
        pointsAux.push(verticesStart + number[0]);
        pointsAux.push(verticesStart + number[1]);
        pointsAux.push(verticesStart + number[2]);
        
        //__________________________________________________________________________
        
        // Adiciona as cores ao vetor de cores
        for (var k = 0; k < 3; k++) {
            var c = vertices[verticesStart + number[k]];
            var col = vec4(c[0], c[1], c[2], 1.0);
            col = plus(col, vec4(0.5, 0.5, 0.5, 1.0));
            
            colors.push(col);
        }
        
    }
    
    // Configura a peça para saber onde é
    // o começo e o final dos seus vértices na lista
    var vertexStart = previousPointsSize;
    previousPointsSize = points.length;
    var vertexEnd = points.length;
    
    verticesStart = vertices.length;
    
    return vec2(vertexStart, vertexEnd - vertexStart);
}



function computeNormals () {
    for (var i = 0; i < normalsAux.length; i++) {
        
        var n = vec4(0.0, 0.0, 0.0, 0.0);
        var j;
        
        for (j = 0; j < normalsAux[i].length; j++) {
            n = plus(n, normalsAux[i][j]);
        }
        
        n = mult(1/j, n);
        normalsAux[i][0] = n;
    }
    
    for (var i = 0; i < points.length; i++) {
        normals.push(normalsAux[pointsAux[i]][0]);
    }
    
    normalsAux = [];
    pointsAux = [];
}



/* Cria um novo objeto de acordo com os parâmetros passados */

function newObject( vertexRange, position, size, theta, phi, psi ) {
    
    if (! position) position = vec4(0.0, 0.0, 0.0, 1.0);
    if (! size    )     size = 1.0;
    if (! theta   )    theta = 0.0;
    if (! phi     )      phi = 0.0;
    if (! psi     )      psi = 0.0;
    
    
    
    var obj = ({
               // Intervalo correspondente aos vértices do objeto
               vertexStart: vertexRange[0],
               vertexEnd: vertexRange[1],
               
               //==============================================
               
               // Posição do objeto no mundo e sua matriz de translação
               position: position,
               translationMatrix: translate(position),
               
               // Matriz de rotação
               rotationMatrix: rotateInXYZ(theta, phi, psi),
               
               // Matriz de escala
               scaleMatrix: scale(size),
               
               // Matriz produto das três anteriores
               modelViewMatrix: null,
               
               // Método de atualização da modelViewMatrix e flag para
               //  evitar de aualizá-la desnecessariamente
               updateModelViewMatrix: updateModelViewMatrix,
               hasToUpdateMatrix: true,
               
               //==============================================
               
               // Métodos de transformação geométrica dos objetos
               translate: translateInc,
               rotate: rotateInXYZInc,
               scale: scaleInc,
               deform: deformInc,
               
               });
    
    return obj;
}




/* Cria uma nova bola */
function newObjectBall ( vertexRange, position, size, theta, phi, psi ) {
    
    if (! position) position = vec4(0.0, 0.0, 0.0, 1.0);
    if (! size    )     size = 1.0;
    if (! theta   )    theta = 0.0;
    if (! phi     )      phi = 0.0;
    if (! psi     )      psi = 0.0;
    
    
    
    var obj = ({
               // O começo é idêntico ao método de contrução
               //  de objetos genéricos acima
               vertexStart: vertexRange[0],
               vertexEnd: vertexRange[1],
               
               //==============================================
               
               position: position,
               translationMatrix: translate(position),
               
               rotationMatrix: rotateInXYZ(theta, phi, psi),
               
               scaleMatrix: scale(size),
               
               modelViewMatrix: null,
               
               updateModelViewMatrix: updateModelViewMatrix,
               hasToUpdateMatrix: true,
               
               //==============================================
               
               translate: translateObj,
               rotate: rotateObj,
               scale: scaleObj,
               deform: deformObj,
               
               //==============================================
               
               // Variáveis e métodos da física da bola
               
               // Tempo desde a última atualização
               time: (new Date()).getTime(),
               // Massa sa bola
               mass: 1.0,
               // Velocidade atual instantânea
               velocity: vec4(-0.0, 0.0, 0.0, 0.0),
               // Acumulador de forças
               forces: gravity(),
               // Aplica as forças, move a bola e reseta o acumulador
               applyForces: applyForces,
               
               });
    
    return obj;
}



/* Funções de transformação geométrica dos objetos */

// Translação
function translateObj(vector) {
    // Atualiza a posição
    this.position = plus(this.position, vector);
    
    this.hasToUpdateMatrix = true;
    
    // Atualiza a matriz de translação
    this.translationMatrix = translateInc(vector, this.translationMatrix);
}

// Rotação
function rotateObj(theta, phi, psi) {
    this.hasToUpdateMatrix = true;
    
    this.rotationMatrix = rotateInXYZInc(theta, phi, psi, this.rotationMatrix);
}

// Escala
function scaleObj(a) {
    this.hasToUpdateMatrix = true;
    
    this.scaleMatrix = scaleInc(a, this.scaleMatrix);
}

// Deformação
function deformObj(v) {
    this.hasToUpdateMatrix = true;
    
    this.scaleMatrix = deformInc(v, this.scaleMatrix);
}



// Aplica as forças acumuladas a um objeto
function applyForces () {
    // Pega a aceleração
    var accel = mult(1.0/this.mass, this.forces);           // F = ma -> a = F/m
    
    // Zera o acumulador de forças
    this.forces = gravity();
    
    // Acha o intervalo de tempo
    var time = (new Date()).getTime() - this.time;
    this.time += time;
    time /= 1000;
    
    // Calcula a nova velocidade
    this.velocity = plus(this.velocity, mult(time, accel)); // v = v_0 + at
    
    
    /*\\\________________________________________________________________________*/
    
    
    
    // Calcula o limite de deslocamento
    var limit = limitForMovement(this);         // "O quanto a bola pode andar"
    
    
    // Se não vai bater em ninguem, é só andar
    if (limit == null) {
        this.translate(this.velocity);
    }
    
    // Se vai bater em alguém, tratamos a colisão
    else {
        // Pega as informações da colisão
        var normalVector = limit[0];
        var energyCoefficient = limit[1];
        limit = limit[2];
        
        
        
        /*\\\________________________________________________________________________*/
        
        
        limit = plus(limit, mult(0.0001, normalVector));
        
        // Calcula o deslocamento
        var proj = projection(this.velocity, limit);
        
        var v1 = normalizev(this.velocity);
        
        var sizeV1 = normS(this.velocity)*normS(limit)/normS(proj);
        sizeV1 = Math.sqrt(sizeV1);
        v1 = mult(0.999 * sizeV1, v1);
        
        // Anda até o obstáculo
        this.translate(v1);
        
        
        /*\\\________________________________________________________________________*/
        
        // Reflete a velocidade
        // Calcula a direção de reflexão
        var p = projection(this.velocity, mult(-1, normalizev(limit)));
        
        var reflection = minus(this.velocity, mult(2, p));

        var refProj = projection(reflection, normalVector);
        reflection = plus(reflection, mult(energyCoefficient, refProj));
        
        
        this.velocity = reflection;
        
    }
    
    
    
    
    
    // Coloca rotação na bola
    // Descobre o eixo de rotação
    
    var rotationAxis = vcross(this.velocity, boardNormal);
    rotationAxis[0] = -rotationAxis[0];
    var angle = norm(this.velocity)/ballCircumference * 360;
    var matrix = MVrotate(angle, rotationAxis);
//    console.log(matrix);
    this.rotationMatrix = times(matrix, this.rotationMatrix);
//    this.hasToUpdateMatrix = true;
    
}




// Retorna o deslocamento máximo que a bola pode ter com relação a uma superfície
function limitForMovement(ball) {
    
    
    // Variável que guarda as informações da hitbox mais próxima
    var result = null;
    
    
    
    
    // Vamos ver se a bola vai atravessar cada hitbox ou não
    for (var i = 0; i < hitboxes.length; i++) {
        // Pega as informações da hitbox atual
        var hitbox = hitboxes[i];
        var hitboxTriangle = [hitbox[0], hitbox[1], hitbox[2]];
        var hitboxNormal = hitbox[3];
        var hitboxEnergy = hitbox[4];
        
        
        
        // Acha o ponto da bola mais perto da superfície
        var ballCenterToSurface = mult(-ballSize, hitboxNormal);
        var ballSurface = plus(ball.position, ballCenterToSurface);
        
        // Descobre se a superfície está do lado certo do plano da hitbox
        var ballSurfaceToHitbox = minus(ballSurface, hitbox[0]);
        var ballSurfaceToHitboxOrientation = vdot(ballSurfaceToHitbox, hitboxNormal);
        
        if (ballSurfaceToHitboxOrientation > 0) {
            // Estamos do lado certo!!
            // Vamos descobrir se vamos atravessar no próximo frame
            
            // Acha a posição da superfície no próximo frame
            var nextBallSurface = plus(ballSurface, ball.velocity);
            
            // Descobre se a superfície está do lado certo do plano da hitbox
            var nextBallSurfaceToHitbox = minus(nextBallSurface, hitbox[0]);
            var nextBallSurfaceToHitboxOrientation = vdot(nextBallSurfaceToHitbox, hitboxNormal);
            
            if (nextBallSurfaceToHitboxOrientation < 0) {
                // Vamos atravessar a hitbox
                
                // Acha o vetor que leva a superfície da bola à hitbox
                var distance = easyProjection(ballSurfaceToHitbox, hitboxNormal);
                
                // Acha o ponto em que a superfície da bola toca a hitbox
                var intersection = minus(ballSurface, distance);
                
                // Se esse ponto está dentro do triângulo da hitbox
                if (isInside(hitboxTriangle, intersection)) {
                    result = [hitboxNormal, hitboxEnergy, mult(-1, distance)];
                }
            }
        }
        
        
        
    }
    
    
    
    // O resultado está estruturado assim:
    // [Índice da hitbox mais perto no hitboxes[], Vetor que leva a bola à hitbox]
    
    
    // Se não vamos bater em ninguém, não há o que retornar
    if (result == null) {
        return null;
    }
    
    // Caso contrário, organizamos as informações e retornamos
    return result;
}



// retorna se o ponto está dentro do triângulo ou não
function isInside( hitboxTriangle, p ) {
    var a = hitboxTriangle[0];
    var b = hitboxTriangle[1];
    var c = hitboxTriangle[2];
    
    // Compute vectors
    var v0 = minus(c, a);
    var v1 = minus(b, a);
    var v2 = minus(p, a);
    
    // Compute dot products
    var dot00 = vdot(v0, v0)
    var dot01 = vdot(v0, v1)
    var dot02 = vdot(v0, v2)
    var dot11 = vdot(v1, v1)
    var dot12 = vdot(v1, v2)
    
    // Compute barycentric coordinates
    var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
    
    // Check if point is in triangle
    return ((u >= 0) && (v >= 0) && (u + v < 1));
}

















// Retorna a "força da gravidade", ajustada
//  de acordo com a inclinação da mesa
function gravity() {
    return vec4(0.0, -0.05, 0.0, 0.0);
}




// Multiplica as matrizes de um objeto (se necessário) para obter a matriz final de model view
function updateModelViewMatrix() {
    if (this.hasToUpdateMatrix) {
        this.modelViewMatrix = times3(this.translationMatrix, this.rotationMatrix, this.scaleMatrix);
        this.hasToUpdateMatrix = false;
    }
}

















/* MATRIZES DE PROJEÇÃO */
// Cria e seta a matriz de perspectiva
function updatePerspective() {
    //    projec = perspective(60, canvas.width/canvas.height, 2.0, 0.0001);
    var orthoZoom = 0.5;
    projec = ortho(orthoZoom  * -canvas.width/canvas.height, orthoZoom  * canvas.width/canvas.height, orthoZoom  * -1, orthoZoom  * 1, orthoZoom  * -4.1, orthoZoom  * -0.1);
}




























/* Redimensionamento */
function resizeCanvas() {
    // Guarda os valores anteriores
    var wAntigo = canvas.width;
    var hAntigo = canvas.height;
    
    // Pega o novo tamanho da nossa janela
    if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
    
    // Redimensiona o tamanho do viewPort
    gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );
    
    // Arruma a projeção
    updatePerspective();
}











/* CALLBACKS DE INPUT */
// Lida com o botão do mouse sendo apertado
function handleMouseDown(event) {
    // Seta a flag dizendo para outras funções que o botão
    // está apertado
    if (event.button == 0)
        mouseDown = true;
    else if (event.button == 2)
        mouseRDown = true;
    // E seta a localização anterior do mouse,
    // para efeitos de comparação com a atual
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

// Lida com o botão do mouse sendo solto
function handleMouseUp(event) {
    // Reseta a flag
    if (event.button == 0)
        mouseDown = false;
    else if (event.button == 2)
        mouseRDown = false;
}


// Lida com o mouse se movendo
function handleMouseMove(event) {
    
    // Pega as novas coordenadas
    var newX = event.clientX;
    var newY = event.clientY;
    
    // Calcula a distância percorrida
    var deltaX = newX - lastMouseX;
    var deltaY = newY - lastMouseY;
    
    
    /* DO STUFF */
    
    // Atualiza a posição "anterior" do mouse
    lastMouseX = newX
    lastMouseY = newY;
    
}

// Callback próprio para lidar com as teclas
function handleKeys() {
    var ySpeed = 0;
    var xSpeed = 0;
    if (currentlyPressedKeys[37] == true) {
        // Left cursor key
        ySpeed -= 1;
    }
    if (currentlyPressedKeys[39] == true) {
        // Right cursor key
        ySpeed += 1;
    }
    if (currentlyPressedKeys[38] == true) {
        // Up cursor key
        xSpeed -= 1;
    }
    if (currentlyPressedKeys[40] == true) {
        // Down cursor key
        xSpeed += 1;
    }
    
    
    
    if (xSpeed != 0 || ySpeed != 0) {
        /* Do other stuff */
    }
    
}


// Callbacks do teclado
function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

















/* RENDERING */
function render() {
    
    // Callback para executar as ações referentes ao teclado
    handleKeys();
    
    // Limpa a tela
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    
    // Para cada bola
    for (i = 0; i < balls.length; i++) {
        var obj = balls[i];
        
        // Move a bola
        obj.applyForces();
        
        // Atualiza as informações da bola
        obj.updateModelViewMatrix();
        
        // Manda para o shader a matriz a ser aplicada (projeção x view x model)
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(times(lookat, obj.modelViewMatrix)));
        gl.uniformMatrix4fv(projecLoc, false, flatten(projec));
        
        // Desenha a bola
        gl.drawArrays( gl.TRIANGLES, obj.vertexStart, obj.vertexEnd);
    }
    
    // Para cada objeto
    for (i = 0; i < objects.length; i++) {
        var obj = objects[i];
        
        // Atualiza as informações do objeto
        obj.updateModelViewMatrix();
        
        // Manda para o shader a matriz a ser aplicada (projeção x view x model)
        gl.uniformMatrix4fv(matrixLoc, false, flatten(times(projec, times(lookat, obj.modelViewMatrix))));
        
        // Desenha o objeto
        gl.drawArrays( gl.TRIANGLES, obj.vertexStart, obj.vertexEnd);
    }
    
    
    
    
    requestAnimFrame(render);
}






