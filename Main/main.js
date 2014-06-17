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
var table;
var ball;

var index = 0;
var stringNames = [];
var objStrings = [];
var verticesStart = 0;
var previousPointsSize = 0;



// Fazer a bola girar
// Dar vidas
// Fazer o jogador perder vidas
// Criar a mola

// ===================================================================================================
/* Física */
var gravity = vec4(0.0, -0.0005, 0.0, 0.0);

var ballSize = 0.0013;
var ballCircumference = 2 * Math.PI * ballSize;



// ===================================================================================================
/* Hitboxes */
var hitboxes = [];




// ===================================================================================================
/* Tabuleiro */
var boardNormal = vec4(0.0, 0.0, 1.0, 0.0);



// ===================================================================================================
/* Gameplay */
var score = 0;

// Audio
var audioContext;
var audioChannels = [];
var audioNames = ["click"];

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
    
    stringNames = ['ball.vobj', 'pinball7.vobj'];
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
    
    
    
    //______________________________________________________________
    // Cria os objetos
    
    var ballVertexRange = readObject(objStrings[0]);
    ball = newObjectBall(ballVertexRange, vec4(0.0, 0.0, 0.25, 1.0), ballSize * 20);
    balls.push(ball);
    
    ball.velocity = vec4(0.0, 0.0, 0.0, 0.0);
    
    
    
    // Código para colocar o tabuleiro em jogo:

    var tableVertexRange = readObject(objStrings[1]);
    table = newObject(tableVertexRange, vec4(0.07, 0.0, 0.23, 1.0), 0.1, vec4(1.0, 0.0, 0.0, 0.0), 90);
    table.rotate(vec4(0.0, 0.0, 1.0, 0.0), -90);
    table.deform(vec4(1.0, 0.3, 1.0, 0.0));
    objects.push(table);

    
    
    
    
    
    
    //__________________________________________________________
    /* Hitboxes */

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
    newHitbox(vec2(0.8571, 0.8487), vec2(0.8571, 0.8856), 0.9, 0);  //  |
    newHitbox(vec2(0.8571, 0.8856), vec2(1.0714, 0.7804), 0.9, 0);  //  \ dir
    newHitbox(vec2(1.0714, 0.7804), vec2(1.0714, -0.2000), 0.4, 0);  //  | dir
    
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
    lightLoc = gl.getUniformLocation(program, "light");
    
    // Inicializa a matriz lookat na posição inicial desejada (arbitrária)
    eye = vec3(0.0, -0.4, 0.7);
    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
    lookat = lookAt(eye, at, up);
    
    
    
    // Inicializa a matriz de projeção
    updatePerspective();
    
    
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
function readObject( string ) {
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
        
        colors.push(vec4(0.2, 0.2, 0.6 + (vertex[1] - 0.5) * 0.25, 0.0));
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
    document.getElementById("Score").innerHTML = "<font color=\"green\" size=\"2\" face=\"BlairMdITC TT\">Score: " + score + "</font>";
}


//_____________________________________________________
// Events

function ballWillCrash (energyCoefficient) {
    playSound("click");
}

function ballDidCrash (energyCoefficient) {
    if (energyCoefficient > 1) {
        addToScore(100);
    }
    else {
        addToScore(10);
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
    // Cria uma fonte para tocar o som
    var source = audioContext.createBufferSource();
    // Pega o arquivo
    source.buffer = audioChannels[ id ];
    // Toca o som
    source.connect(audioContext.destination);
    source.start(0);
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






//var hitbox = [vec2(0.0, -0.1),      // Coordenadas
//              vec2(1.0, -0.1),
//              
//              vec4(0.0, 1.0, 0.0, 0.0),      // Normal (unitária)
//              
//              0.0 ];                        // Aumento de energia

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

    
    
    
    
    
    // _____________________________________________________________
    
    // Se nao tivermos achado nenhuma hitbox
    if (resultHitboxIndex == -1) {
        this.translate(speed);
    }
    else if (resultHitboxIndex == -2) {
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
    }

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
        
        ball.translate(vec4(deltaX, -deltaY, 0.0, 0.0));
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
        gl.uniform3f(lightLoc, 0.7, 1.0, 1.0);
        
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
        gl.uniform3f(lightLoc, 0.6, 1.0, 1.0);
        
        // Desenha o objeto
        gl.drawArrays( gl.TRIANGLES, obj.vertexStart, obj.vertexEnd);
    }
    
    
    requestAnimFrame(render);
}






