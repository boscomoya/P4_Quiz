const {log, biglog, errorlog, colorize} = require("./out");
const {models} = require('./model');
const Sequelize = require('sequelize');

exports.helpCmd = (socket, rl) => {
    log(socket, " comandos");
    log(socket, " h|help -muestra esta ayuda.");
    log(socket, " list -listar los quizzes existentes.");
    log(socket, " show <id> -muestra la pregunta y la respuestas del quiz indicado.");
    log(socket, " add -añadir un nuevo quiz interactivamente.");
    log(socket, " delete <id> -borra el quiz indicado.");
    log(socket, " edit <id> -edita el quiz indicado.");
    log(socket, " test <id> -probar el test indicado.");
    log(socket, " p|play -jugar a preguntar aleatoriamente todos los quizzes.");
    log(socket, " q|quit -salir del programa.");
    log(socket, " credits -créditos.");
    rl.prompt();

};
exports.listCmd = (socket, rl) => {

    models.quiz.findAll()
        .each(quiz => {
        log(socket, `[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
})
.catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
});
};
    exports.quitCmd = (socket, rl) =>
    {
        rl.close();
        socket.end();

    };

const  validateId = id => {
    return new Sequelize.Promise((resolve, reject) => {
        if (typeof id === "undefined"){
            reject(new Error(`falta el parametro <id>.`));
    }else{
            id = parseInt(id);
            if(Number.isNaN(id)){
                reject(new Error(`El valor del parametro <id> no es un numero`));
            } else{
                resolve(id);
            }
    }
    });
};
exports.showCmd = (socket, rl,id) => {
   validateId(id)
       .then(id => models.quiz.findById(id))
       .then(quiz => {
           if(!quiz){
               throw new Error(`No existe un quiz asociado al id =${id}`);

    }
   log(socket, `[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
    })
.catch(error => {
    errorlog(socket, error.message);
    })
.then(() => {
    rl.prompt();
    }) ;


};

const makeQuestion = (rl, text) => {
    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
    });
    });
};


exports.addCmd = (socket, rl) => {
  makeQuestion(rl, 'Introduzca una pregunta: ')
      .then(q => {
          return makeQuestion(rl, 'Introduzca la respuesta')
              .then(a => {
                  return {question: q,answer: a};
          })  ;
  })
.then(quiz => {
    return models.quiz.create(quiz);
    })
 .then((quiz) => {
            log(socket, `${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);

    })
 .catch(Sequelize.ValidationError, error => {
     errorlog(socket, 'El quiz es erroneo:');
     error.errors.forEach(({message}) => errorlog(message));
})
.catch(error => {
    errorlog(error.message);
    })
.then(() => {
    rl.prompt();
    }) ;


};
exports.deleteCmd = (socket, rl,id) =>
{

    validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))
.catch(error => {
    errorlog(socket, error.message);

})
    .then(() => {
        rl.prompt();
});
    

};

exports.editCmd = (socket, rl ,id) => {
   validateId(id)
       .then(id => models.quiz.findById(id))
       .then(quiz => {
           if(!quiz){
               throw new Error(`no existe un quiz asociado al id=${id}.`);
    }
    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
           return makeQuestion(rl, ' introduzca la pregunta: ')
         .then(q => {
             process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
             return makeQuestion(rl, 'introduzca la respuesta: ')
                 .then(a => {
                     quiz.question = q;
                     quiz.answer = a;
                     return quiz;
             });
         }) ;
    })
.then(quiz => {
    return quiz.save();
    })
.then(quiz => {
    log(socket, `se ha cambiado el quiz ${colorize(quiz.id , 'magenta')} por : ${quiz.question}`)
    })
 .catch(Sequelize.ValidationError, error => {
     errorlog(socket, 'El quiz es erroneo:');
     error.errors.forEach(({message}) => errorlog(message));
})
.catch(error => {
    errorlog(socket, error.message);

})

.then(() => {
    rl.prompt();
    }) ;


};

exports.testCmd = (socket, rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
.then(quiz => {
        if (!quiz) {
        throw new Error(`No existe un quiz asociado al id=${id}`);
    }

    let pregunta = quiz.question.toString();
    makeQuestion(rl, pregunta + '? ')
        .then(a => {
        let respuesta = a.toLowerCase().trim();
    let res = quiz.answer.toLowerCase().trim();
    if (respuesta === res) {
        log(socket, `Su respuesta es correcta. `);
        biglog(socket, 'Correcta', 'green');
        rl.prompt();
    } else {
        log(socket, `Su respuesta es incorrecta. `);
        biglog(socket, 'Incorrecta', 'red');
        rl.prompt();
    }

})
})
.catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
});

};
exports.playCmd = (socket, rl) => {


    let score = 0;
    let toBePlayed = [];

    const playOne = () => {

        return Promise.resolve()
            .then (() => {
            if (toBePlayed.length <= 0) {
            console.log(socket,"No quedan más preguntas se ha acabado el juegos");
            return;
        }
        let pos = Math.floor(Math.random() * toBePlayed.length);
        let quiz = toBePlayed[pos];
        toBePlayed.splice(pos, 1);

        return makeQuestion(rl, `${quiz.question}:`) //
            .then(respuesta => {
            if(respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
            score++;
            log(socket,'Resuesta correcta', 'green');
            return playOne();
        } else {
            log(socket,'Respuesta incorrecta', 'red');
            log(socket,"Fin del juego");
        }
    })
    })
    }

    models.quiz.findAll({raw: true}) //para comprobar que no te repita una pregunta que ya habías acertado antes
        .then(quizzes => {
        toBePlayed = quizzes;
})
.then(() => {
        return playOne();
})
.catch(e => {
        console.log(socket,"error: " + e);
})
.then(() => {
        console.log(socket,`Tu puntuación actual es:${score}`);
    rl.prompt();
})
};
exports.creditsCmd = (socket, rl) =>{
    log(socket, "Autor de la práctica: ");
    log(socket, " PABLO Bosco Moya Rodriguez","blue");
    rl.prompt();
}