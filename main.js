
const readline = require('readline');


const {log, biglog, errorlog, colorize} = require("./out");
const cmds = require('./cmds');

biglog('core quiz', 'green');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colorize("quiz > ",'blue'),
    completer(line) {
    const completions = 'h help add show delete edit list test p play credits q quit'.split(' ');
    const hits = completions.filter((c) => c.startsWith(line));
    // show all completions if none found
    return [hits.length ? hits : completions, line];
}

});

rl.prompt();

rl.on('line', (line) => {
     let args = line.split(" ");
     let cmd = args[0].toLowerCase().trim();
    switch (cmd) {
case '':
    rl.prompt();
    break;
    case 'h':
case 'help':
    cmds.helpCmd(rl);
    break;
case 'add':
    break;
        case 'q':
        case 'quit':
            cmds.quitCmd(rl);
            break;

        case 'show':
            cmds.showCmd(rl,args[1]);
            break;
        case 'list':
            cmds.listCmd(rl);
            break;
        case 'add':
            cmds.addCmd(rl);
            break;
        case 'delete':
            cmds.deleteCmd(rl,args[1]);
            break;
        case 'edit':
            cmds.editCmd(rl,args[1]);
            break;
        case 'test':
            cmds.testCmd(rl,args[1]);
            break;

default:
    log(`no existe este comando '${colorize(cmd, 'red')}'`);
    log(`Use ${colorize('help', 'green')} para ver los comandos disponibles.`);
    rl.prompt();
    break;
}

})
.on('close', () => {
    log('adios');
process.exit(0);
});




