import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
const rl = readline.createInterface({ input, output });


const size = process.argv[2];

const newarr = function(n){
    const arr = [];
    for(let i = 0; i < n; i++){
        arr.push(0);
    }
    return arr;
};

const repeat = function(str,n){
    return newarr(n).map(_=>str).join("");
};

const char = String.fromCharCode;
const code = (c)=>{
    return c.charCodeAt(0);
};


//bijective base 26 conversion
const alphaToNum = function(alph){
    return [...alph].map(c=>code(c)-97+1).reverse().map((v,i)=>v*(26**i)).reduce((a,b)=>a+b);
};

const c26map = Object.fromEntries([..."0123456789abcdefghijklmnop"].map((c,i)=>[c,i]));

const numToAlpha = function(n){
    let digits = [...n.toString(26)].map(c=>c26map[c]-1).reverse();
    const res = [];
    for(let i = 0; i < digits.length; i++){
        let n = digits[i];
        if(n >= 0){
            res.push(char(n+97));
            continue;
        }
        if(i === digits.length-1){
            break;
        }
        res.push(char(97+26+n));
        digits[i+1]--;
    }
    return res.reverse().join("");
};


const formatNumber = function(num){
    const numstr = num+"";
    if(numstr.length === 1){
        return numstr;
    }
    let res = "";
    for(let i = 0; i < numstr.length-1; i++){
        res += "⁰¹²³⁴⁵⁶⁷⁸⁹"[parseInt(numstr[i])];
    }
    res += numstr[numstr.length-1];
    return res;
}


const charmap = ["_", "\u001b[34;1mO\u001b[0m", "\u001b[31;1mX\u001b[0m"];
const nextTurn = [0,2,1];

class Board{
    constructor(n,turn = 1){
        this.board = newarr(n).map(_=>newarr(n));
        this.n = n;
        this.turn = turn;
    }
    draw(){
        const {board,n} = this;
        let res = "     "+newarr(n).map((_,i)=>`${formatNumber(i+1)} `.slice(0,2)).join("")+"\n";
        //let res = repeat("_",n*2+4)+"\n";
        res += board.map((r,i)=>(" "+numToAlpha(i+1).toUpperCase()).slice(-2)+" | "+r.map(n=>charmap[n]).join(" ")+" |").join("\n")+"\n";
        //res += "\n   "+repeat("_",n*2+4);
        console.log(res);
    }
    move(x,y){
        const {n,board} = this;
        //x is number
        //y is alphabet
        x = parseInt(x)-1;
        y = alphaToNum(y.toLowerCase())-1;
        if(x < 0 || y < 0 || x >= n || y >= n){
            return "Input is out of range";
        }
        if(board[y][x] !== 0){
            return "Cell not empty";
        }
        board[y][x] = this.turn;
        return "success";
    }
    async start(){
        let first = true;
        this.draw();
        while(true){
            console.log(`It's ${charmap[this.turn]}'s turn`);
            while(true){
                const move = await rl.question(`Make your move${first?" (i.e. A3)":""}: `);
                first = false;
                let y = move.match(/^[a-zA-Z]+/);
                let x = move.match(/[0-9]+$/);
                if(!x || !y){
                    await rl.question("Please make a valid move ([Enter] to continue)");
                    continue;
                }
                const res = this.move(x[0],y[0]);
                if(res !== "success"){
                    await rl.question(res+" ([Enter] to continue)");
                    continue;
                }
                break;
            }
            this.draw();
            if(await this.checkWin()){
                break;
            }
            this.turn = nextTurn[this.turn];
        }
        console.log(`${charmap[this.turn]} wins!`);
    }
    checkWin(){
        const {turn,board,n} = this;
        //horizontal
        outer1:
        for(let line of board){
            for(let c of line){
                if(c !== turn)continue outer1;
            }
            console.log("w1");
            return true;
        }

        //vertical
        outer2:
        for(let i = 0; i < n; i++){
            for(let j = 0; j < n; j++){
                const c = board[j][i];
                if(c !== turn)continue outer2;
            }
            console.log("w2");
            return true;
        }

        // diagonal
        let d1 = true;
        for(let i = 0; i < n; i++){
            const c = board[i][i];
            if(c !== turn){
                d1 = false;
                break;
            }
        }
        if(d1){
            console.log("w3");
            return true;
        }

        //diagonal ne to sw
        let d2 = true;
        for(let i = 0; i < n; i++){
            const c = board[i][n-i-1];
            if(c !== turn){
                d2 = false;
                break;
            }
        }
        if(d2){
            console.log("w4");
            return true;
        }

        return false;
    }
}

const main = async function(){
    while(true){
        const n = await rl.question(`Which size would you like to play? (input a number bigger than 0): `);
        const board = new Board(parseInt(n));
        await board.start();
        const again = await rl.question(`Would you like to play again? [y/N]: `);
        if(again.trim().toLowerCase() === "y"){
            continue;
        }
        break;
    }
    return true;
};

await main();
process.exit();





