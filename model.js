const  fs = require("fs");
const  DB_FILENAME = "quiezzes.json";

let quiezzes = [
    {
        question:"Capital de Italia",
        answer: "Roma"
    },
    {
        question:"Capital de Francia",
        answer: "París"
    },
    {
        question:"Capital de España",
        answer: "Madrid"
    },
    {
        question:"Capital de Portugal",
        answer: "Lisboa"
    } ];
const load = () => {

    fs.readFile(DB_FILENAME, (err, data) => {
        if (err) {

        if(err.code === "ENOENT"){
            save();
            return;

    }
    throw err;
    }
    let json = JSON.parse(data);
        if(json){
            quiezzes = json;
        }
});
};
const save = () => {
    fs.writeFile(DB_FILENAME,
        JSON.stringify(quiezzes),
        err => {
        if (err) throw err;
    });
};



exports.acount = () => quiezzes.length;
exports.add = (question, answer) => {
    quiezzes.push({
        question: (question || "").trim(),
        answer:(answer || "").trim()
    });
    save();
};
exports.update = (id, question ,answer) => {
    const quiz =quiezzes[id];
    if (typeof quiz === "undefined"){
        throw new Error(`El valor del parametro id no es valido.`);
    }
    quiezzes.splice(id, 1,{
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};
exports.getAll = () => JSON.parse(JSON.stringify(quiezzes));

exports.getByIndex = id =>{
    const quiz =quiezzes[id];
    if (typeof quiz === "undefined"){
        throw new Error(`El valor del parametro id no es valido.`);
    }
    return JSON.parse(JSON.stringify(quiz));
};

exports.deleteByIndex = id => {
    const quiz =quiezzes[id];
    if (typeof quiz === "undefined"){
        throw new Error(`El valor del parametro id no es valido.`);
    }
    quiezzes.splice(id, 1);
    save();
};

load();