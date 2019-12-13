const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');


app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(expressJwt({secret: 'app-super-shared-secret'}).unless({path: ['/api/token']}));

let USERS = [
    { 'id': 1, 'email': 'foo@bar.com' ,'motsrestant': 80000},
    { 'id': 2, 'email': 'foo1@bar.com' ,'motsrestant': 300},
    { 'id': 3, 'email': 'foo2@bar.com' ,'motsrestant': 80000},
    { 'id': 4, 'email': 'foo3@bar.com' ,'motsrestant': 80000},
];


function getIdFromToken (req){
    let token =  req.headers['authorization'] ;
    token = token.slice(7, token.length);
    let decoded = jwt.decode(token, {complete: true});
    return decoded.payload.userID;
}

function Editmotsrestant(user,motsUsed){
    USERS.forEach(function(item, i) { if (item.id === user.id) USERS[i].motsrestant -= motsUsed; });
}



function Resetmotsrestant(){
    USERS.forEach(function(item, i) { USERS[i].motsrestant = 80000; });
}



// cette fonction permet de justifer un tableau de mots donnéés pour nous retourner les lignes
function justiferTableau(mots) {
    let lignes = [],
        indice = 0;

    while (indice < mots.length) {
        let count = mots[indice].length;
        let last = indice + 1;

        while (last < mots.length) {
            if (mots[last].length + count + 1 > 80) break;
            count += mots[last].length + 1;
            last++;
        }

        let ligne = "";
        let difference = last - indice - 1;

        // si nous sommes sur la dernière ligne ou si le nombre de mots dans la ligne est 1, on quit justifier

        if (last === mots.length || difference === 0) {
            for (let i = indice; i < last; i++) {
                ligne += mots[i] + " ";
            }

            ligne = ligne.substr(0, ligne.length - 1);
            for (let i = ligne.length; i < 80; i++) {
                ligne += " ";
            }
        } else {

            // maintenant nous devons justifier au milieu, ce qui met une quantité égale d'espaces entre les mots

            let spaces = (80 - count) / difference;
            let remainder = (80 - count) % difference;

            for (let i = indice; i < last; i++) {
                ligne += mots[i];

                if (i < last - 1) {
                    let limit = spaces + (i - indice < remainder ? 1 : 0);
                    for (let j = 0; j <= limit; j++) {
                        ligne += " ";
                    }
                }
            }
        }
        lignes.push(ligne);
        indice = last;
    }
    return lignes;
}


function justify(text){
    let paragraphesJustifier = [];
    let paragraphes = text.split(/[\r\n\t]+/gm);
    for (let i=0; i < paragraphes.length; i++){
        let motsParagraphe = paragraphes[i].split(" ");
        let justifiedParagraphe = justiferTableau(motsParagraphe);
        let listText = justifiedParagraphe.join("\n");
        paragraphesJustifier.push(listText);
    }
    return paragraphesJustifier.join("\n");
}

app.post('/api/token',   (req,res,next) => {
    const body = req.body;
    const user = USERS.find(user => user.email === body.email);
    if(!user) return res.sendStatus(401);
    const token = jwt.sign({userID: user.id}, 'app-super-shared-secret', {expiresIn: '2h'});
    res.send({token});
});


app.post('/api/justify',   (req,res,next) => {
    const user = USERS.find(user => user.id === getIdFromToken(req));
    const text = req.body.replace('\n','');
    const motsCount = text.trim().split(/\s+/).length;
    console.log(motsCount);
    if(user.motsrestant >= motsCount){
        const newText = justify(text);
        Editmotsrestant(user,motsCount);
        return res.send(newText);
    }
    res.sendStatus(402);
});




const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }
    return false;
};

const port = normalizePort(process.env.PORT || "2500");
app.listen(port, function () {
    console.log('Server listening on port 4000!');

    //on fait appel a Resetmotsrestant apres chaque 24 h du lancement du serveur
    setInterval(Resetmotsrestant,86400000);
});
