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
var i = 0;
var vertices = [];
var points = [];
var colors = [];
var normals = [];
var normalsAux = [];
var pointsAux = [];

var objects = [];
var balls = [];
var flippers = [];
var obstacles = [];
var table;
var cylinder;

var ballVertexRange;
var newBallVertexRange;
var otherBallVertexRange;
var tableVertexRange;

var index = 0;
var stringNames = [];
var objStrings = [];
var verticesStart = 0;
var previousPointsSize = 0;


// Colocar a aceleração com base no tempo
// Colocar a mola com o tempo
// Arrumar os pontos
// Arrumar os sons
// Arrumar comandos
// Arrumar as normais dos obstáculos


// SKYBOX
// TEXTURA NA MESA


// ===================================================================================================
/* Física */
var gravity = vec4(0.0, -0.0003, 0.0, 0.0);

var ballSize = 0.0013;
var ballCircumference = 2 * Math.PI * ballSize;

var springForce = 0;


// ===================================================================================================
/* Hitboxes */
var hitboxes = [];




// ===================================================================================================
/* Tabuleiro */
var boardNormal = vec4(0.0, 0.0, 1.0, 0.0);
var startingPosition = vec4(0.227, -0.35, 0.25, 1.0);


var lookAtAngle = Math.PI/6;
var lookatRadius = 1.0;


var obstacleEnergy = 1.1;


// ===================================================================================================
/* Gameplay */
var score = 0;
var highScore = 0;
var lives = 3;

var crashTime = 0;

var play = true;

var flipperLeftIsMoving = false;
var flipperRightIsMoving = false;
var flipperLeftMovementTime = 0;
var flipperRightMovementTime = 0;

var object1Hit = false;
var object2Hit = false;
var object3Hit = false;

// Audio
var soundOn = true;

var audioContext;
var audioChannels = [];
var audioNames = ["click", "ballLift2", "buzzBell", "flip", "score2-2"];


var ARlight = 0.7843;
var AGlight = 0.7843;
var ABlight = 0.7843;
var DRlight = 0.7843;
var DGlight = 0.7843;
var DBlight = 0.7843;
var SRlight = 0.7843;
var SGlight = 0.7843;
var SBlight = 0.7843;

var KA = 1;
var KD = 1;
var KS = 1;

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
    
    stringNames = ['sphere3.vobj', 'pinball7.vobj', 'flipper2l.vobj', 'flipper2r.vobj', 'obstaculo4.vobj', 'cilindro.vobj'];
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
    // Se já acabou, podemos começar a carregar os sons
    else
        initSounds();
};




function finishInit() {
    i = 0;
    
    //______________________________________________________________
    // Liga os callbacks
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    currentlyPressedKeys[90] = false;
    currentlyPressedKeys[88] = false;
    

    
    
    //______________________________________________________________
    // Cria os objetos
    
    
    // Bola
    ballVertexRange = readObject(objStrings[0], colorBallForVertex);
    newBallVertexRange = readObject(objStrings[0], colorNewBallForVertex);
    otherBallVertexRange = readObject(objStrings[0], colorOtherBallForVertex);
    ball = newObjectBall(ballVertexRange, startingPosition, ballSize * 20);
    balls.push(ball);
    
    ball.velocity = vec4(0.0, 0.0, 0.0, 0.0);
    
    // Tabuleiro
    tableVertexRange = readObject(objStrings[1], black);
    table = newObject(tableVertexRange, vec4(0.07, 0.0, 0.23, 1.0), 0.1, vec4(1.0, 0.0, 0.0, 0.0), 90);
    table.rotate(vec4(0.0, 0.0, 1.0, 0.0), -90);
    table.deform(vec4(1.0, 0.3, 1.0, 0.0));
    objects.push(table);

    var flipperLVertexRange = readObject(objStrings[2], blue);     // flipper esquerdo
    var flipper = newObjectFlipper(flipperLVertexRange, true, vec4(-0.03, -0.31, 0.24, 1.0), 0.08, vec4(1.0, 0.0, 0.0, 0.0), 90);
    flipper.rotate(vec4(0.0, 0.0, 1.0, 0.0), -110);
    flipper.deform(vec4(1.0, 0.5, 1.0, 0.0));
    objects.push(flipper);
    flippers.push(flipper);

    var flipperRVertexRange = readObject(objStrings[3], blue);     // flipper direito
    var flipper2 = newObjectFlipper(flipperRVertexRange, false, vec4(0.11, -0.311, 0.24, 1.0), 0.08, vec4(1.0, 0.0, 0.0, 0.0), 90);
    flipper2.rotate(vec4(0.0, 0.0, 1.0, 0.0), -70);
    flipper2.deform(vec4(-1.0, 0.5, 1.0, 0.0));
    objects.push(flipper2);
    flippers.push(flipper2);
    
    var obstacleVertexRange1 = readObject(objStrings[4], red);    // Obstáculo
    var obs1 = newObject(obstacleVertexRange1, vec4(0.0, 0.1, 0.24, 1.0), 0.08, vec4(1.0, 0.0, 0.0, 0.0), 90);
    obstacles.push(obs1);
    var obstacleVertexRange2 = readObject(objStrings[4], green);    // Obstáculo
    var obs2 = newObject(obstacleVertexRange2, vec4(0.1, 0.15, 0.24, 1.0), 0.08, vec4(1.0, 0.0, 0.0, 0.0), 90);
    obstacles.push(obs2);
    var obstacleVertexRange3 = readObject(objStrings[4], yellow);    // Obstáculo
    var obs3 = newObject(obstacleVertexRange3, vec4(0.07, 0.0, 0.24, 1.0), 0.08, vec4(1.0, 0.0, 0.0, 0.0), 90);
    obstacles.push(obs3);
    
    
    
    var cylinderVertexRange = readObject(objStrings[5], white);
    cylinder = newObject(cylinderVertexRange, vec4(0.222, -0.375, 0.245, 1.0), 0.05, vec4(1.0, 0.0, 0.0, 0.0), 90);
    objects.push(cylinder);
    
    //__________________________________________________________
    /* Hitboxes */
    
    
    // Obstaculos
    newHitbox(vec2(-0.3505, 0.7383), vec2(-0.2005, 0.8083), obstacleEnergy + 0.1, 0); // /
    newHitbox(vec2(-0.2205, 0.7883), vec2(-0.0505, 0.7583), obstacleEnergy + 0.1, 0); // \ Dir
    newHitbox(vec2(-0.0705, 0.7383), vec2(-0.2005, 0.7083), obstacleEnergy + 0.1, 0); // /
    newHitbox(vec2(-0.2205, 0.6883), vec2(-0.3505, 0.7583), obstacleEnergy + 0.1, 0); // \ Esq

    newHitbox(vec2(-0.3505 + 0.5847, 0.7383 + 0.0822), vec2(-0.2005 + 0.5847, 0.8083 + 0.0822), obstacleEnergy + 0.2, 0); // /
    newHitbox(vec2(-0.2205 + 0.5847, 0.7883 + 0.0822), vec2(-0.0505 + 0.5847, 0.7583 + 0.0822), obstacleEnergy + 0.2, 0); // \ Dir
    newHitbox(vec2(-0.0705 + 0.5847, 0.7383 + 0.0822), vec2(-0.2005 + 0.5847, 0.7083 + 0.0822), obstacleEnergy + 0.2, 0); // /
    newHitbox(vec2(-0.2205 + 0.5847, 0.6883 + 0.0822), vec2(-0.3505 + 0.5847, 0.7583 + 0.0822), obstacleEnergy + 0.2, 0); // \ Esq

    newHitbox(vec2(-0.3505 + 0.4093, 0.7383 - 0.1645), vec2(-0.2005 + 0.4093, 0.8083 - 0.1645), obstacleEnergy + 0.3, 0); // /
    newHitbox(vec2(-0.2205 + 0.4093, 0.7883 - 0.1645), vec2(-0.0505 + 0.4093, 0.7583 - 0.1645), obstacleEnergy + 0.3, 0); // \ Dir
    newHitbox(vec2(-0.0705 + 0.4093, 0.7383 - 0.1645), vec2(-0.2005 + 0.4093, 0.7083 - 0.1645), obstacleEnergy + 0.3, 0); // /
    newHitbox(vec2(-0.2205 + 0.4093, 0.6883 - 0.1645), vec2(-0.3505 + 0.4093, 0.7583 - 0.1645), obstacleEnergy + 0.3, 0); // \ Esq
    
    // Flippers
    newHitbox(vec2(-0.5454, 0.1070), vec2(-0.0714, 0.0590), 0.6, 0);       // Esq
    newHitbox(vec2(0.0909, 0.0590), vec2(0.6038, 0.1070), 0.6, 0);       // Dir
    
    
    // Limites
    newHitbox(vec2(-1.2, 0.0), vec2(1.2, 0.0), 0.2, 0);       // Chão
    newHitbox(vec2(-1.0, -0.2), vec2(-1.0, 1.2), 0.9, 1);       // Esquerda
    newHitbox(vec2(1.1493, -0.2), vec2(1.1493, 1.2), 0.4, 0);        // Direita
    newHitbox(vec2(1.2, 1.0), vec2(-1.2, 1.0), 0.9, 0);        // Teto
    
    // bumper direito
    newHitbox(vec2(0.3506, 0.0369), vec2(0.7922, 0.2398), 0.9, 0);  //  /       esq
    newHitbox(vec2(0.7142, 0.1734), vec2(0.7142, 0.3210), 0.9, 0);  //  |
    newHitbox(vec2(0.7142, 0.3210), vec2(0.7922, 0.3210), 0.9, 0);  //  _
    newHitbox(vec2(0.7922, 0.3210), vec2(0.7922, 0.2121), 0.9, 0);  //  |
    newHitbox(vec2(0.7922, 0.2121), vec2(0.4480, 0.0369), 0.9, 0);  //  /

    
    // bumper esquerdo
    newHitbox(vec2(-0.3506, 0.0369), vec2(-0.7792, 0.2398), 0.9, 1);  //  \       dir
    newHitbox(vec2(-0.7012, 0.1734), vec2(-0.7012, 0.3210), 0.9, 1);  //  |
    newHitbox(vec2(-0.7012, 0.3210), vec2(-0.7792, 0.3210), 0.9, 1);  //  _
    newHitbox(vec2(-0.7792, 0.3210), vec2(-0.7792, 0.2121), 0.9, 1);  //  |
    newHitbox(vec2(-0.7792, 0.2121), vec2(-0.4280, 0.0369), 0.9, 1);  //  |
    
    
    // Tri direito
    newHitbox(vec2(1.0714, 0.2859), vec2(0.7142, 0.4261), 0.9, 0);  //  \ dir
    newHitbox(vec2(0.7142, 0.4261), vec2(1.0714, 0.5996), 0.9, 0);  //  /
    
    
    // Tri esquerdo
    newHitbox(vec2(-1.0714, 0.2416), vec2(-0.7012, 0.4261), 0.9, 1);  //  / dir
    newHitbox(vec2(-0.7012, 0.4261), vec2(-1.0714, 0.6088), 0.9, 1);  //  \ dir
    
    // Corner esquerdo
    newHitbox(vec2(-1.0714, 0.7693), vec2(-0.5064, 1.0202), 0.9, 1);  //  / dir
    
    // Corner direito
    newHitbox(vec2(0.6928, 1.0202), vec2(1.2207, 0.7693), 0.9, 1);  //  / dir
    
    // Rod
    newHitbox(vec2(1.0000, -0.2000), vec2(1.0000, 0.8100), 0.9, 0);  //  | esq
    newHitbox(vec2(1.0714, 0.7435), vec2(0.8571, 0.8487), 0.9, 0);  //  \ esq
    newHitbox(vec2(0.8571, 0.8487), vec2(0.8571, 1.0), 0.9, 0);  //  |
    newHitbox(vec2(0.8571, 0.8856), vec2(1.0714, 0.7804), 0.9, 0);  //  \ dir
    newHitbox(vec2(1.0714, 0.7804), vec2(1.0714, -0.2000), 0.4, 0);  //  | dir

    
    
    
    
    
    
    
    //__________________________________________________________
    /* Gameplay */
    resetLives();
    setScore(0);
    
    
    
    
    //__________________________________________________________
    /* Projeção */
    updatePerspective();
    updateLookAt(0);
    
    
    
    
    
    //__________________________________________________________
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
    aLightLoc = gl.getUniformLocation(program, "aLight");
    dLightLoc = gl.getUniformLocation(program, "dLight");
    sLightLoc = gl.getUniformLocation(program, "sLight");
    constsLoc = gl.getUniformLocation(program, "constants");
    
    render();
};


function normalForHitbox(v1, v2) {
    var a = vec4(v1[0] * 0.171, v1[1] * 0.608, 0.0, 0.0);
    var b = vec4(v2[0] * 0.171, v2[1] * 0.608, 0.0, 0.0);
    var v = minus(a, b);
    var n = cross(v, boardNormal);
    normalize(n);
    n = vec4(n[0], n[1], n[2], 0.0);
    
    return n;
}

function newHitbox(v1, v2, e, direction) {
    var n = normalForHitbox(v1, v2);
    if (direction == 1) n = mult(-1, n);
    
    var hitbox = [v1, v2, n, e];
    
    hitboxes.push(hitbox);
}






















/* INICIALIZAÇÃO DE OBJETOS */
// Lê os vértices de cada peça e os armazena no vetor
function readObject( string, colorFunction ) {
    if (! colorFunction) {
        colorFunction = blue;
    }
    
    var result;
    var numberOfVertices;
    var i = 3;
    
    // Checa se o começo do arquivo está certo
    if (string.charAt(0) != 'f') {
        console.log("Erro: char era para ser 'f' mas é ", string.charAt(0));
        console.log("O arquivo lido não é um .vobj");
        return -1;
    }
    
    // Acha o número de vértices
    while(string.charAt(i) != "\n") i++;
    numberOfVertices = parseInt(string.substr(2, i-1));
    i ++;                           // Pula o "\n "
    
    // Para cada vértice
    for (var v = 0; v < numberOfVertices; v++) {
        var j;                      // j vai para o fim de cada número
        var vertex = vec4();        // O novo vértice a ser adicionado
        
        // Leitura da coordenada x
        for (j = i; string.charAt(j) != ' '; j++);              // Acha o fim do número
        vertex[0] = parseFloat(string.substr(i, j-1)) / 2;    // Adiciona a coordenada ao novo vértice
        
        // Leitura da coordenada y
        i = j + 1;                                                  // Pula para o número seguinte
        for (j = i; string.charAt(j) != ' '; j++);
        vertex[1] = parseFloat(string.substr(i, j-1)) / 2;
        
        // Leitura da coordenada z
        i = j + 1;
        for (j = i; string.charAt(j) != '\n'; j++);
        vertex[2] = parseFloat(string.substr(i, j-1)) / 2;
        
        
        vertex[3] = 1.0;    // Coordenada homogênea
        
        i = j + 1;          // Vai para a próxima linha
        
        // Coloca o novo vértice na lista
        points.push( vertex );
        
        
        //___________________________________________________________________
        // Coloca a nova cor na lsta
        
        colors.push( colorFunction( vertex ) );
    }
    
    
    
    
    var vertexStart = previousPointsSize;
    previousPointsSize = points.length;
    var vertexEnd = points.length;

    result = vec2(vertexStart, vertexEnd - vertexStart);
    
    
    //________________________________________________________________________________
    
    
    
    // Checa se o resto do arquivo está certo
    if (string.charAt(i) != 'n') {
        console.log("Erro: char era para ser 'n' mas é ", string.charAt(i));
        console.log("O arquivo lido não é um *.vobj correto.");
        return -1;
    }
    
    // Para cada normal
    for (var v = 0; v < numberOfVertices; v++) {
        var normal = vec4();        // A nova normal a ser adicionada
        
        // Leitura da coordenada x
        for (j = i; string.charAt(j) != ' '; j++);              // Acha o fim do número
        normal[0] = parseFloat(string.substr(i, j-1)) / 2;    // Adiciona a coordenada à nova normal
        
        // Leitura da coordenada y
        i = j + 1;                                                  // Pula para o número seguinte
        for (j = i; string.charAt(j) != ' '; j++);
        normal[1] = parseFloat(string.substr(i, j-1)) / 2;
        
        // Leitura da coordenada z
        i = j + 1;
        for (j = i; string.charAt(j) != '\n'; j++);
        normal[2] = parseFloat(string.substr(i, j-1)) / 2;
        
        normal[3] = 0.0;     // Coordenada homogênea
        
        i = j + 1;          // Vai para a próxima linha
        
        // Coloca a nova normal na lista
        normals.push( normal );
    }
    
    
    
    return result;
}



function colorBallForVertex (vertex) {
    if (vertex[1] <= 0.1 && vertex[1] >= -0.1)
        return yellow(vertex);
    else
        return red(vertex);
}

function colorNewBallForVertex (vertex) {
    if (vertex[1] <= 0.1 && vertex[1] >= -0.1)
        return yellow(vertex);
    else
        return blue(vertex);
}

function colorOtherBallForVertex (vertex) {
    if (vertex[1] <= 0.1 && vertex[1] >= -0.1)
        return yellow(vertex);
    else
        return green(vertex);
}

function red ( vertex ) { return vec4(0.6 + (vertex[1] - 0.5) * 0.25, 0.2, 0.2, 0.0); }
function blue ( vertex ) { return vec4(0.2, 0.2, 0.6 + (vertex[1] - 0.5) * 0.25, 0.0); }
function green ( vertex ) { return vec4(0.2, 0.6 + (vertex[1] - 0.5) * 0.25, 0.2, 0.0); }

function cyan ( vertex ) { return vec4(0.2, 0.6 + (vertex[1] - 0.5) * 0.25, 0.6 + (vertex[1] - 0.5) * 0.25, 0.0); }
function yellow ( vertex ) { return vec4(0.6 + (vertex[1] - 0.5) * 0.25, 0.6 + (vertex[1] - 0.5) * 0.25, 0.2, 0.0); }
function magenta ( vertex ) { return vec4(0.6 + (vertex[1] - 0.5) * 0.25, 0.2, 0.6 + (vertex[1] - 0.5) * 0.25, 0.0); }

function white ( vertex ) { return vec4(0.6 + (vertex[1] - 0.5) * 0.25, 0.6 + (vertex[1] - 0.5) * 0.25, 0.6 + (vertex[1] - 0.5) * 0.25, 0.0); }
function black ( vertex ) { return vec4(0.2 + (vertex[1] - 0.5) * 0.25, 0.2 + (vertex[1] - 0.5) * 0.25, 0.2 + (vertex[1] - 0.5) * 0.25, 0.0); }



/* Cria um novo objeto de acordo com os parâmetros passados */

function newObject( vertexRange, position, size, vector, angle ) {
    
    if (! position) position = vec4(0.0, 0.0, 0.0, 1.0);
    if (! size    )     size = 1.0;
    if (! vector  )   vector = vec4(0.0, 1.0, 0.0, 0.0);
    if (! angle   )    angle = 0.0;
    
    
    
    var obj = ({
               // Intervalo correspondente aos vértices do objeto
               vertexStart: vertexRange[0],
               vertexEnd: vertexRange[1],
               
               //==============================================
               
               // Posição do objeto no mundo e sua matriz de translação
               position: position,
               translationMatrix: translate(position),
               
               // Matriz de rotação
               rotationMatrix: mvlibRotate(vector, angle),
               
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
               translate: translateObj,
               rotate: rotateObj,
               scale: scaleObj,
               deform: deformObj,
               
               });
    
    return obj;
}

/* Cria um novo flipper */
function newObjectFlipper( vertexRange, isLeft, position, size, vector, angle ) {
    
    if (! position) position = vec4(0.0, 0.0, 0.0, 1.0);
    if (! size    )     size = 1.0;
    if (! vector  )   vector = vec4(0.0, 1.0, 0.0, 0.0);
    if (! angle   )    angle = 0.0;
    
    
    
    var obj = ({
               // Intervalo correspondente aos vértices do objeto
               vertexStart: vertexRange[0],
               vertexEnd: vertexRange[1],
               
               //==============================================
               
               // Orientação do flipper
               isLeft: isLeft,
               
               // Posição do objeto no mundo e sua matriz de translação
               position: position,
               translationMatrix: translate(position),
               
               // Matriz de rotação
               rotationMatrix: mvlibRotate(vector, angle),
               
               // Matriz de escala
               scaleMatrix: scale(size),
               
               // Matriz produto das três anteriores
               modelViewMatrix: null,
               
               // Método de atualização da modelViewMatrix e flag para
               //  evitar de aualizá-la desnecessariamente
               updateModelViewMatrix: updateModelViewMatrix,
               hasToUpdateMatrix: true,
               
               //==============================================
               moveFlipper: moveFlipper,
               resetFlipper: resetFlipper,
               movementTime: 0,
               
               //==============================================               
               
               // Métodos de transformação geométrica dos objetos
               translate: translateObj,
               rotate: rotateObj,
               scale: scaleObj,
               deform: deformObj,
               
               });
    
    return obj;
}




/* Cria uma nova bola */
function newObjectBall ( vertexRange, position, size, vector, angle ) {
    
    if (! position) position = vec4(0.0, 0.0, 0.0, 1.0);
    if (! size    )     size = 1.0;
    if (! vector  )   vector = vec4(0.0, 1.0, 0.0, 0.0);
    if (! angle   )    angle = 0.0;
    
    
    
    var obj = ({
               // O começo é idêntico ao método de contrução
               //  de objetos genéricos acima
               vertexStart: vertexRange[0],
               vertexEnd: vertexRange[1],
               
               //==============================================
               
               position: position,
               translationMatrix: translate(position),
               
               rotationMatrix: mvlibRotate(vector, angle),
               
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
               
               checkLoseLife: checkLoseLife,
               
               // Variáveis e métodos da física da bola
               
               // Tempo desde a última atualização
               time: (new Date()).getTime(),
               // Massa da bola
               mass: 1.0,
               // Velocidade atual instantânea
               velocity: vec4(-0.0, 0.0, 0.0, 0.0),
               // Aplica as forças, move a bola e reseta o acumulador
               applyForces: applyForces,
               
               });
    
    return obj;
}



function checkLoseLife() {
    if (this.position[1] <= -0.353) {     // Essa bola passou!
        if (this.position[0] <= 0.21) {
            
            if (balls.length == 1) {       // Perdeu uma vida!
                if (lives != 0)             // Se ainda tinha vidas, só perde uma
                    loseLife();
                else {                      // Se não o jogo começa de novo
                    loseLife();
                    resetLives();
                }
                
                // Leva a bola para a posição inicial
                resetBalls();
            }
            else {                      // Se tinha várias bolas, só tira essa do vetor
                var index = balls.indexOf(this);
                balls.splice(index, 1);
            }
        }
    }
}

function startFlipperMovement(isLeft) {
    if (isLeft) {
        flipperLeftIsMoving = true;
    }
    else {
        flipperRightIsMoving = true;
    }
    
    playSound("flip");
}



function moveFlipper() {
    if (this.isLeft)
        angle = 20;
    else
        angle = -20;
    
    this.rotate(vec4(0.0, 0.0, 1.0, 0.0), angle);
}

function resetFlipper() {
    if (this.isLeft) {
        angle = -20 * 3;
    }
    else {
        angle = 20 * 3;
    }
    
    this.rotate(vec4(0.0, 0.0, 1.0, 0.0), angle);
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
function rotateObj(v, a) {
    this.hasToUpdateMatrix = true;
    
    this.rotationMatrix = times(mvlibRotate(v, a), this.rotationMatrix);
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















// ===================================================================================================
/* Gameplay */

//_____________________________________________________
// Score
function addToScore ( value ) {
    score += value;
    updateScore();
}

function setScore ( value ) {
    score = value;
    updateScore();
}


function updateScore () {
    if (score > highScore) highScore = score;
    
    document.getElementById("Score").innerHTML = "\
    <font color=\"green\" size=\"2\" face=\"BlairMdITC TT\">Score: " + score + "</font>\
    <font color=\"gold\" size=\"2\" face=\"BlairMdITC TT\">High Score: " + highScore + "</font>";
}


//_____________________________________________________
// Lives
function loseLife () {
    playSound("buzzBell");
    
    lives -= 1;
    updateLives();
}

function resetLives () {
    lives = 3;
    setScore(0);
    updateLives();
}

function updateLives () {
    var livesString = "";
    for (var i = 0; i < lives;  i++)
        livesString = livesString + "O ";
    for (; i < 3; i++)
        livesString = livesString + "X ";
    
    document.getElementById("Lives").innerHTML = "<font color=\"red\" size=\"2\" face=\"BlairMdITC TT\">Lives: " + livesString + "</font>";
}





//_____________________________________________________
// Spring
function contractSpring() {
    if (springForce <= 100) {
        springForce += 2;
        cylinder.translate(vec4(0.0, -0.015 * 2 / 100, 0.0, 0.0));
    }
}

function releaseSpring() {
    playSound("ballLift2");

    cylinder.translate(vec4(0.0, 0.015 * springForce / 100, 0.0, 0.0));
    
    if (balls[0].position[0] >= 0.21) {
        if (balls[0].position[1] <= -0.34) {
            if (play == true) {
                var force = springForce/5000;
                balls[0].velocity = vec4(0.0, force, 0.0, 0.0);
            }
        }
    }
    
    springForce = 0;
}




//_____________________________________________________
// Gravity
function resetGravity() {
    gravity = vec4(0.0, -0.0003, 0.0, 0.0);
}

function updateGravity() {
    gravity = vec4(0.0, -0.0003 * Math.cos(lookAtAngle), 0.0, 0.0);
}



//_____________________________________________________
// Reset
function resetGame() {
    resetLives();
    setScore(0);
    resetGravity();
    resetBalls();
}

function resetBalls() {
    ball = newObjectBall(ballVertexRange, startingPosition, ballSize * 20);
    ball.velocity = vec4(0.0, 0.0, 0.0, 0.0);
    
    balls = [];
    balls.push(ball);
}






//_____________________________________________________
// Events

function ballWillCrash (energyCoefficient) {
    if (energyCoefficient >= obstacleEnergy && energyCoefficient <= obstacleEnergy + 0.3) {
        playSound("score2-2");
        if (energyCoefficient == obstacleEnergy + 0.1)
            object1Hit = true;
        if (energyCoefficient == obstacleEnergy + 0.2) {
            object2Hit = true;
            createMoreBalls();
        }
        if (energyCoefficient == obstacleEnergy + 0.3)
            object3Hit = true;
    }
    
    playSound("click");
}

function createMoreBalls () {
    
    if (balls.length == 1) {
        var newBall = newObjectBall(newBallVertexRange, vec4(0.0, 0.1, 0.25, 1.0), ballSize * 20);
        newBall.velocity = vec4(-0.005, 0.0, 0.0, 0.0);
        balls.push(newBall);
        
        var otherBall = newObjectBall(otherBallVertexRange, vec4(0.07, 0.0, 0.25, 1.0), ballSize * 20);
        otherBall.velocity = vec4(0.005, 0.0, 0.0, 0.0);
        balls.push(otherBall);
    }
}


function ballDidCrash (energyCoefficient) {
    var time = (new Date()).getTime();
    var dt = time - crashTime;
    
    if (dt >= 200) {
        if (energyCoefficient <= 1) {
            addToScore(3);
        }
        else if (energyCoefficient == obstacleEnergy) {
            addToScore(100);
        }
        else {
            addToScore(20);
        }
        
        
        
        crashTime = time;
    }
    

}



//_____________________________________________________
// Audio

function initSounds () {
    
    // Cria o contexto de áudio
    try {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        audioContext = new AudioContext();
    }
    catch(e) {
        alert('Web Audio API is not supported in this browser');
    }
    
    // Cria um vetor com os caminhos para os arquivos de áudio
    var audioPaths = [];
    for (var i = 0; i < audioNames.length; i++) {
        audioPaths[i] = "Audio/" + audioNames[i] + ".wav";
    }
    
    // Lê os arquivos (assincronamente)
    var bufferLoader = new BufferLoader( audioContext, audioPaths, finishLoadingAudio);
    
    bufferLoader.load();
}

function finishLoadingAudio ( bufferList ) {
    // Coloca os arquivos lidos no seu vetor
    for (var i = 0; i < audioNames.length; i++) {
        audioChannels[audioNames[i]] = bufferList[i];
    }
    
    finishInit();
}

function playSound (id ) {
    if (soundOn == true && play == true) {
        // Cria uma fonte para tocar o som
        var source = audioContext.createBufferSource();
        // Pega o arquivo
        source.buffer = audioChannels[ id ];
        // Toca o som
        source.connect(audioContext.destination);
        source.start(0);
    }
}






//_____________________
// Audio Buffers

function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    
    var loader = this;
    
    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
                                       request.response,
                                       function(buffer) {
                                       if (!buffer) {
                                       alert('error decoding file data: ' + url);
                                       return;
                                       }
                                       loader.bufferList[index] = buffer;
                                       if (++loader.loadCount == loader.urlList.length)
                                       loader.onload(loader.bufferList);
                                       },
                                       function(error) {
                                       console.error('decodeAudioData error', error);
                                       }
                                       );
    }
    
    request.onerror = function() {
        alert('BufferLoader: XHR error');
    }
    
    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}










// ===================================================================================================
/* Física */



// Aplica as forças acumuladas a um objeto
function applyForces () {
    if (mouseDown) {
        this.velocity = vec4(0.0, 0.0, 0.0, 0.0);
        return 0;
    }
    
    
    this.velocity = plus(this.velocity, gravity);
    
    var speed = this.velocity;
    
    var resultHitboxIndex = -1;
    var resultHitboxDistance = vec4(100.0, 0.0, 0.0, 0.0);
    var resultTooCloseDistances = [];
    
    // Para cada hitbox
    for (var i = 0; i < hitboxes.length; i++) {
        // Pega as informações da hitbox
        var hitbox = hitboxes[i];
        var n = hitbox[2];
    
        var h0 = vec4(hitbox[0][0] * 0.171 + 0.036, hitbox[0][1] * 0.608 - 0.355, this.position[2], 0.0);
        var h1 = vec4(hitbox[1][0] * 0.171 + 0.036, hitbox[1][1] * 0.608 - 0.355, this.position[2], 0.0);
        
        
        // Descobre se a bola está na frente da hitbox
        var ballClosest = plus(this.position, mult(-ballSize, n));
        var ballToHitbox = minus(h0, ballClosest);
        
        if (dot(n, ballToHitbox) < 0) {
            // Se estiver, descobre se vai atravessar o plano
            var destination = plus(ballClosest, speed);
            var destToHitbox = minus(h0, destination);
            
            if (dot(n, destToHitbox) > 0) {
                // Se for, vê se está nos limites
                
                var p = projection(ballToHitbox, n);        // Está na direção da hitbox!
                var newPosition = plus(ballClosest, p);
                
                var HorTest = false;
                var VerTest = false;
                var h, H;
                var v, V;
                if (h0[0] != h1[0]) {
                    if (h0[0] < h1[0]) {
                        h = h0[0];
                        H = h1[0];
                    }
                    else {
                        h = h1[0];
                        H = h0[0];
                    }
                    
                    if (newPosition[0] > h && newPosition[0] < H) {
                        HorTest = true;
                    }
                }   // Teste horizontal
                if (h0[1] != h1[1]) {
                    if (h0[1] < h1[1]) {
                        v = h0[1];
                        V = h1[1];
                    }
                    else {
                        v = h1[1];
                        V = h0[1];
                    }
                    
                    if (newPosition[1] > v && newPosition[1] < V) {
                        VerTest = true;
                    }
                }   // Teste vertical
                
                if (HorTest || VerTest) {
                    // Se for, ve se essa eh a hitbox mais perto
                    
                    
                    if (normS(p) < normS(resultHitboxDistance)) {
                        resultHitboxDistance = p;
                        resultHitboxIndex = i;
                    }
                }
            }
        } // Fecha os 3 ifs
        else if (dot(n, ballToHitbox) == 0.0) {    // Está perto demais!!
            resultHitboxIndex = -2;
            resultTooCloseDistances.push(n);
        }
        
        
    } // For das hitboxes

    
    
    
    var hitFlipper = false;
    if (flipperLeftIsMoving) {
        if (ballHitsLeftFlipper(this)) {
            this.velocity = plus(this.velocity, mult(0.01, vec4(0.2, 1.0, 0.0, 0.0)));
            hitFlipper = true;
        }
    }
    if (flipperRightIsMoving) {
        if (ballHitsRightFlipper(this)) {
            this.velocity = plus(this.velocity, mult(0.01, vec4(-0.2, 1.0, 0.0, 0.0)));
            hitFlipper = true;
        }
    }
    
    if (hitFlipper == true) {
        this.translate(vec4(0.0, 0.02, 0.0, 00));
        ballWillCrash(3.0);
        ballDidCrash(3.0);
    }
    else {
    
        // _____________________________________________________________
        
        // Se nao tivermos achado nenhuma hitbox
        if (resultHitboxIndex == -1) {
            this.translate(speed);
        }
        else if (resultHitboxIndex == -2) {     // Se não tem nenhuma mas está perto demais de alguém
            for (var i = 0; i < resultTooCloseDistances.length; i++) {
                this.translate(mult(0.001, resultTooCloseDistances[i]));
            }
        }
        // Se achamos alguma
        else {
            var hitbox = hitboxes[resultHitboxIndex];
            var n = hitbox[2];
            
            var translationLimit = plus(resultHitboxDistance, mult(0.01, n));
            this.translate(resultHitboxDistance);
            
            var p = projection(speed, resultHitboxDistance);
            
            this.velocity = plus(speed, mult(-2 * hitbox[3], p));
            
            if (normS(p) <= 0.01*0.01) {
                this.velocity = plus(this.velocity, mult(0.001, n));
            }
            
            if (normS(this.velocity) >= 0.00001) {
                ballWillCrash(hitbox[3]);
                ballDidCrash(hitbox[3]);
            }
        }
        
    }
    
    // _____________________________________________________________
    /* Rotação da bola */
    
    var axis = cross(boardNormal, this.velocity);
    var angle = 90 * norm(this.velocity) / ballCircumference;
    this.rotate(axis, angle)
    
}


function ballHitsLeftFlipper (ball) {
    var p1 = vec4(-0.5454 * 0.171 + 0.036, 0.1070 * 0.608 - 0.355, ball.position[2], 0.0);
    var p2 = vec4(-0.0714 * 0.171 + 0.036, 0.1550 * 0.608 - 0.355, ball.position[2], 0.0);
    var p3 = vec4(-0.0714 * 0.171 + 0.036, 0.0590 * 0.608 - 0.355, ball.position[2], 0.0);
    var tri = [p1, p2, p3];
    
    return isInside(tri, ball.position);
}

function ballHitsRightFlipper (ball) {
    var p1 = vec4(0.0909 * 0.171 + 0.036, 0.0590 * 0.608 - 0.355, ball.position[2], 0.0);
    var p2 = vec4(0.0909 * 0.171 + 0.036, 0.1550 * 0.608 - 0.355, ball.position[2], 0.0);
    var p3 = vec4(0.6038 * 0.171 + 0.036, 0.1070 * 0.608 - 0.355, ball.position[2], 0.0);
    var tri = [p1, p2, p3];
    
    return isInside(tri, ball.position);
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
//    projec = mat4();
//    var orthoZoom = 0.5;
//    projec = ortho(orthoZoom  * -canvas.width/canvas.height, orthoZoom  * canvas.width/canvas.height, orthoZoom  * -1.6, orthoZoom  * 1.6, orthoZoom  * -4.1, orthoZoom  * -0.1);
    projec = perspective(60, canvas.width/canvas.height, 4.0, 0.0001);
}

function updateLookAt( inclination ) {
    // Se está dentro dos limites
    if ( lookAtAngle + Math.PI * inclination / 180 <= Math.PI/4 &&
        lookAtAngle + Math.PI * inclination / 180 >= 0 ) {
    
        // Acha os novos ângulos
        lookAtAngle += Math.PI * inclination / 180;
        var upAngle = Math.Pi/2 + lookAtAngle;
        
        // Calcula o zoom adequado
        var radius = - lookAtAngle / Math.PI + 1.0;
        
        // Acha os vetores
        eye = vec3(0.0, -Math.sin(lookAtAngle) * radius, Math.cos(lookAtAngle) * radius);
        at = vec3(0.0, 0.0, 0.0);
        up = vec3(0.0, Math.cos(lookAtAngle), Math.sin(lookAtAngle));
        
        // Atualiza a matriz
        lookat = lookAt(eye, at, up);
        
        updateGravity();
    }
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
    
    if (mouseDown) {
        deltaX /= screenWidth;
        deltaY /= screenHeight;
        
        balls[0].translate(vec4(deltaX, -deltaY, 0.0, 0.0));
    }
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
        updateLookAt(0.1);
        xSpeed -= 1;
    }
    if (currentlyPressedKeys[40] == true) {
        // Down cursor key
        updateLookAt(-0.1);
        xSpeed += 1;
    }
    if (currentlyPressedKeys[32] == true) {
        contractSpring();
    }
    
    
    if (xSpeed != 0 || ySpeed != 0) {
        /* Do other stuff */
    }
    
}


// Callbacks do teclado
function handleKeyDown(event) {
    if (event.keyCode == 90) {
        if (currentlyPressedKeys[event.keyCode] == false)
            startFlipperMovement(true);
    }
    else if (event.keyCode == 88) {
        if (currentlyPressedKeys[event.keyCode] == false)
            startFlipperMovement(false);
    }
    
    currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
    if (event.keyCode == 32) {          // Space
        releaseSpring();
    }
    else if (event.keyCode == 82) {     // R
        resetGame();
    }
    else if (event.keyCode == 65) {     // A
        if (soundOn == true) {
            soundOn = false;
        }
        else {
            soundOn = true;
        }
    }
    else if (event.keyCode == 80) {     // P
        if (play == true) {
            play = false;
        }
        else {
            play = true;
        }
    }
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
        if (play == true) {
            obj.applyForces();
        }
        obj.checkLoseLife();
        
        // Atualiza as informações da bola
        obj.updateModelViewMatrix();
        
        // Manda para o shader a matriz a ser aplicada (projeção x view x model)
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(times(lookat, obj.modelViewMatrix)));
        gl.uniformMatrix4fv(projecLoc, false, flatten(projec));
        gl.uniform4f(aLightLoc, ARlight, AGlight, ABlight, 1.0);
        gl.uniform4f(dLightLoc, DRlight, DGlight, DBlight, 1.0);
        gl.uniform4f(sLightLoc, SRlight, SGlight, SBlight, 1.0);
        gl.uniform3f(constsLoc, KA, KD, KS);
        
        // Desenha a bola
        gl.drawArrays( gl.TRIANGLES, obj.vertexStart, obj.vertexEnd);
    }
    
    // Para cada objeto
    for (i = 0; i < objects.length; i++) {
        var obj = objects[i];
        
        // Atualiza as informações do objeto
        obj.updateModelViewMatrix();
        
        // Manda para o shader a matriz a ser aplicada (projeção x view x model)
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(times(lookat, obj.modelViewMatrix)));
        gl.uniformMatrix4fv(projecLoc, false, flatten(projec));
        gl.uniform4f(aLightLoc, ARlight, AGlight, ABlight, 1.0);
        gl.uniform4f(dLightLoc, DRlight, DGlight, DBlight, 1.0);
        gl.uniform4f(sLightLoc, SRlight, SGlight, SBlight, 1.0);
        gl.uniform3f(constsLoc, KA, KD, KS);
        
        // Desenha o objeto
        gl.drawArrays( gl.TRIANGLES, obj.vertexStart, obj.vertexEnd);
    }
    
    // Para cada objeto
    for (i = 0; i < obstacles.length; i++) {
        var lightUp = false;
        if (i==0 && object1Hit) {
            lightUp = true;
            object1Hit = false;
        }
        else if (i==1 && object2Hit) {
            lightUp = true;
            object2Hit = false;
        }
        else if (i==2 && object3Hit) {
            lightUp = true;
            object3Hit = false;
        }
        
        var obj = obstacles[i];
        
        var myKA = KA, myKD = KD, myKS = KS;
        if (lightUp == true) {
            myKA = 2.0;
            myKD = 2.0;
            myKS = 2.0;
        }
        
        // Atualiza as informações do objeto
        obj.updateModelViewMatrix();
        
        // Manda para o shader a matriz a ser aplicada (projeção x view x model)
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(times(lookat, obj.modelViewMatrix)));
        gl.uniformMatrix4fv(projecLoc, false, flatten(projec));
        gl.uniform4f(aLightLoc, ARlight, AGlight, ABlight, 1.0);
        gl.uniform4f(dLightLoc, DRlight, DGlight, DBlight, 1.0);
        gl.uniform4f(sLightLoc, SRlight, SGlight, SBlight, 1.0);
        gl.uniform3f(constsLoc, myKA, myKD, myKS);
        
        // Desenha o objeto
        gl.drawArrays( gl.TRIANGLES, obj.vertexStart, obj.vertexEnd);
    }
    
    if (flipperLeftMovementTime >= 1) {
        flipperLeftIsMoving = false;
        flipperLeftMovementTime = 0;
        
        for (i = 0; i < flippers.length; i++) {
            var flipper = flippers[i];
            if (flipper.isLeft)
                flipper.resetFlipper();
        }
    }
    if (flipperRightMovementTime >= 1) {
        flipperRightIsMoving = false;
        flipperRightMovementTime = 0;
        
        for (i = 0; i < flippers.length; i++) {
            var flipper = flippers[i];
            if (!flipper.isLeft)
                flipper.resetFlipper();
        }
    }
    
    if (flipperLeftIsMoving) {
        flipperLeftMovementTime += 0.4;
        for (i = 0; i < flippers.length; i++) {
            var flipper = flippers[i];
            
            if (flipper.isLeft) {
                flipper.moveFlipper();
            }
        }
    }
    if (flipperRightIsMoving) {
        flipperRightMovementTime += 0.4;
        for (i = 0; i < flippers.length; i++) {
            var flipper = flippers[i];
            
            if (!flipper.isLeft) {
                flipper.moveFlipper();
            }
        }
    }
    
    requestAnimFrame(render);
}






