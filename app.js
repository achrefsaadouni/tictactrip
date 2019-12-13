const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');


app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(expressJwt({secret: 'app-super-shared-secret'}).unless({path: ['/api/token']}));

let USERS = [
    { 'id': 1, 'email': 'foo@bar.com' ,'wordsLeft': 80000},
    { 'id': 2, 'email': 'foo1@bar.com' ,'wordsLeft': 80000},
    { 'id': 3, 'email': 'foo2@bar.com' ,'wordsLeft': 80000},
    { 'id': 4, 'email': 'foo3@bar.com' ,'wordsLeft': 80000},
];


function getIdFromToken (req){
    let token =  req.headers['authorization'] ;
    token = token.slice(7, token.length);
    let decoded = jwt.decode(token, {complete: true});
    return decoded.payload.userID;
}

function EditWordsLeft(user,wordsUsed){
    USERS.forEach(function(item, i) { if (item.id === user.id) USERS[i].wordsLeft -= wordsUsed; });
}



function ResetWordsLeft(){
    USERS.forEach(function(item, i) { USERS[i].wordsLeft = 80000; });
}



// cette fonction permet de justifer un tableau de mots donnéés pour nous retourner les lignes
function textJustification(words) {
    let lines = [],
        index = 0;

    while (index < words.length) {
        let count = words[index].length;
        let last = index + 1;

        while (last < words.length) {
            if (words[last].length + count + 1 > 80) break;
            count += words[last].length + 1;
            last++;
        }

        let line = "";
        let difference = last - index - 1;

        // si nous sommes sur la dernière ligne ou si le nombre de mots dans la ligne est 1, on quit justifier

        if (last === words.length || difference === 0) {
            for (let i = index; i < last; i++) {
                line += words[i] + " ";
            }

            line = line.substr(0, line.length - 1);
            for (let i = line.length; i < 80; i++) {
                line += " ";
            }
        } else {

            // maintenant nous devons justifier au milieu, ce qui met une quantité égale d'espaces entre les mots

            let spaces = (80 - count) / difference;
            let remainder = (80 - count) % difference;

            for (let i = index; i < last; i++) {
                line += words[i];

                if (i < last - 1) {
                    let limit = spaces + (i - index < remainder ? 1 : 0);
                    for (let j = 0; j <= limit; j++) {
                        line += " ";
                    }
                }
            }
        }
        lines.push(line);
        index = last;
    }
    return lines;
}


function justify(text){
    let paragraphesJustifier = [];
    let paragraphes = text.split(/[\r\n\t]+/gm);
    for (let i=0; i < paragraphes.length; i++){
        let motsParagraphe = paragraphes[i].split(" ");
        let justifiedParagraphe = textJustification(motsParagraphe);
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
    const wordsCount = text.trim().split(/\s+/).length;
    if(user.wordsLeft >= wordsCount){
        const newText = justify(text);
        EditWordsLeft(user,wordsCount);
        return res.send(newText);
    }
    res.sendStatus(402);
});




app.listen(4000, function () {
    console.log('Server listening on port 4000!');

    //on fait appel a ResetWordsLeft apres chaque 24 h du lancement du serveur
    setInterval(ResetWordsLeft,86400000);
});
