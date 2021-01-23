

Users = require('./usersModel');


var figlet = require('figlet');

const mongoose = require('mongoose')

var argv = require('yargs').argv;

if (argv.ships > 3 && argv.distance < 53.5) {
    console.log('Plunder more riffiwobbles!');
} else if (argv.name == 'Javier Urrutia'){
	console.log('scheard')
}
