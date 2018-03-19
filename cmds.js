const {log, biglog, errorlog, colorize} = require("./out");
const model = require('./model');


exports.helpCmd = rl => {
    log(" comandos");
    log(" h|help -muestra esta ayuda.");
    log(" list -listar los quizzes existentes.");
    log(" show <id> -muestra la pregunta y la respuestas del quiz indicado.");
    log(" add -añadir un nuevo quiz interactivamente.");
    log(" delete <id> -borra el quiz indicado.");
    log(" edit <id> -edita el quiz indicado.");
    log(" test <id> -probar el test indicado.");
    log(" p|play -jugar a preguntar aleatoriamente todos los quizzes.");
    log(" q|quit -salir del programa.");
    log(" credits -créditos.");
    rl.prompt();

};
exports.listCmd = rl => {
    model.getAll().forEach((quiz, id) => {
        log(` [${colorize(id, 'magenta')}]:${quiz.question}`);
    });
    rl.prompt();
};
exports.quitCmd = rl => {
    rl.close();
    rl.prompt();
};
exports.showCmd = (rl,id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parametro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        }catch (error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

exports.addCmd = rl => {
    rl.question(colorize('Introduzca una pregunta: ', 'red'), question => {

        rl.question(colorize(' Introduzca la respuesta ','red'), answer => {
           model.add(question, answer);
           log(` ${colorize('se ha añadido', 'magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt();
         });
    });
};
exports.deleteCmd = (rl,id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parametro id.`);
    }else{
        try{
             model.deleteByIndex(id);

        }catch (error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

exports.editCmd = (rl ,id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parametro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
            rl.question(colorize('Introduzca una pregunta: ', 'red'),question => {
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
                rl.question(colorize(' Introduzca la respuesta ','red'),answer => {
                model.update(id, question, answer);
                log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt();
            });
        });

        }catch (error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.testCmd = (rl,id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parametro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            rl.question("¿"+quiz.question+"? ",answer => {
           if( answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
               log("Su respuesta es correcta ","green");
               biglog('Correcto','green');
            }else{
                log("Su respuesta es incorrecta ","red");
                biglog('Incorrecto','red');
            }

            rl.prompt();

        });

        }catch (error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};
exports.playCmd = rl => {
    let score = 0;
    let toBeResolved = [];
    for ( let i = 0; i <  4;++i){
       toBeResolved.push(i);
    };
    const playOne = () =>{


    if (toBeResolved.length === 0){
        log("no hay nada que preguntar","red");

        rl.prompt();
    }else{
        let d = Math.round(Math.random()*toBeResolved.length);
        let quiz = model.getByIndex(d);
        toBeResolved = toBeResolved.filter(elem => elem != d); 

        rl.question("¿"+quiz.question+"? ",answer => {
            if( answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
            log("Su respuesta es correcta ","green");
            log('Correcto','green');
            score=score+1;
            console.log(`"su puntuacion es de :"${score}`);
         
            playOne();
        }else{
            log("Su respuesta es incorrecta ","red");
            console.log(`"su puntuacion es de :"${score}`);
            rl.prompt();
            }




    });

};
    };
    playOne();
} ;
exports.creditsCmd = rl =>{
    console.log("Autor de la práctica: ");
    log(" PABLO Bosco Moya Rodriguez","blue");
    rl.prompt();
}
