const canvas = document.getElementById("c");
const context = canvas.getContext('2d');

canvas.width = 800;
canvas.height = canvas.width;

let setting = {
    round: 0,
    cells: 0,
    speed: 1,
    scale: 10,
    zoom: canvas.width / 10
}
let map = {
    current: [],
    next: []
}
let timeout = null;

createMap();
render();
update();

function createMap() {      // map létrehozása 2D tömbben
    map.current = [];
    for(let i = 0; i < canvas.height / setting.zoom; i++) {             // zoom-tól függ, hogy meddig iterál -> ha zoom = X, akkor X*X lesz a map
        map.current[i] = [];
        for(let j = 0; j < canvas.width / setting.zoom; j++) {
            map.current[i][j] = Math.floor(Math.random() * 2);          // minden cella értéke 0 vagy 1 lehet
            setting.cells += map.current[i][j];                         // élő sejtek számolása
        }
    }
    map.next = Array.from(map.current);
    setting.round = 0;
    document.getElementById("cells").innerHTML = setting.cells;
}
function render() {         // négyzetrács kirajzolása
    for(let i = 0; i < canvas.height / setting.zoom; i++) {
        for(let j = 0; j < canvas.width / setting.zoom; j++) {
            context.beginPath();
            context.rect(i * setting.zoom, j * setting.zoom, setting.zoom, setting.zoom);
            context.fillStyle = map.current[i][j] ? 'black' : 'white';  // ternary: ha a cella értéke 1 (true), akkor feketére festi
            context.fill();                                             // ha 0 (false), akkor fehérre
            context.stroke();
        }
    }
}
function nextMap() {        // következő map számolása, map.currentet csak olvassa, map.next-et írja is
    let nextCells = 0, changed = false;
    
    for(let i = 0; i < canvas.height / setting.zoom; i++) {
        for(let j = 0; j < canvas.width / setting.zoom; j++) {
            let neighbors = 0;
            for(let a = -1; a < 2; a++){                                // a cellák szomszédjainak megnézése
                for(let b = -1; b < 2; b++){
                    let skip = false;
                    // a szélső celláknak kevesebb, mint 8 szomszédja van, ezért figyelni kell, hogy azokra ne hivatkozzunk
                    // ha az index túl kicsi, vagy túl nagy lenne, akkor a 'skip' változó 'true' lesz
                    // ellenkező esetben x-ben és y-ban lesz tárolva a cellától számított relatív index
                    let x = (i + a < 0) || (i + a > (map.current.length - 1)) ? skip = true : i + a;
                    let y = (j + b < 0) || (j + b > (map.current.length - 1)) ? skip = true : j + b;
                    if(a === 0 && b === 0) { skip = true; }             // ha a = 0 és b = 0, akkor az éppen vizsgált cellát kapjuk és nem szomszédot
                    if(!skip && map.current[x][y]) {                    // ha !(skip = true), akkor a másik feltétel már nem kerül kiértékelésre
                        neighbors++;
                    }
                }
            }
            if(map.current[i][j] && neighbors < 2) {                    // ha a cella értéke 1 (true) és 2-nél kevesebb a szomszéd
                map.next[i][j] = 0;                                     // akkor meghal a sejt
                changed = true;
            } else if(map.current[i][j] && neighbors > 3) {             // ha a cella értéke 1 (true) és 3-nál több a szomszéd
                map.next[i][j] = 0;                                     // akkor meghal a sejt
                changed = true;
            } else if(!map.current[i][j] && neighbors === 3) {          // ha a cella értéke 0 (false) és pont 3 szomszéd van
                map.next[i][j] = 1;                                     // akkor életre kel
                changed = true;
            }
            nextCells += map.next[i][j];                                // élő sejtek számolása
        }
    }
    setting.cells = nextCells;
    map.current = Array.from(map.next);                                 // map.current-be átmásolás, mert a render() mindig azt rajzolja ki
    return changed;                                                     // ha changed = false, akkor később sem fog változni, így leáll a folyamat
}
function update() {
    let changed = nextMap();
    render();
    document.getElementById("round").innerHTML = ++setting.round;
    document.getElementById("cells").innerHTML = setting.cells;
    timeout = window.setTimeout(update, 1000 / setting.speed);          // update 1000ms és 100ms időközönként hívódik
    if(!changed) {
        window.clearTimeout(timeout);
    }
}
function changeSpeed() {
    setting.speed = parseInt(document.getElementById("speed").value);
}
function changeZoom() {
    setting.scale = parseInt(document.getElementById("zoom").value) * 10;
    setting.zoom = canvas.width / setting.scale;
    window.clearTimeout(timeout);
    createMap();
    render();
    update();
}