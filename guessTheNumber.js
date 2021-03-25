/* -------------------------------------------------------------------------- */
/*                             Auxiliary functions                             */
/* -------------------------------------------------------------------------- */
function genMachineNumber(start,end){
	let machineNumber = Math.floor( Math.random()*(end-start+1) + start );
	return machineNumber
}
function validateUserNumber(number) {
	console.log(`~~~validateUserNumber:${number}~~~`);

	// true if number is in the level range boundaries
	return (number>=gameState.minNumber && number<=gameState.maxNumber) ?
		true:false;
}
// to hide/show node, just add/remove a predefined CSS class with "display:none",
function show(node) {
	node.classList.remove('hidden');
	// node.hidden = false;
}
function hide(node) {
	node.classList.add('hidden');
	// node.hidden = true;
}

function updatePlayStatus() {
	const triesLeft = gameState.maxTries - gameState.userTries.length;

	dom.playStatus.innerHTML = `You have ${triesLeft} tries left
		from ${gameState.maxTries} `;
}
function updateGuessHistoryTable(userNumber, status) {
	// make new TR element and set it on table body top:
	let tBody = dom.guessHistoryTable.tBodies[0];
	let newRowNode = document.createElement('TR');
	newRowNode.innerHTML = `
	<tr>
	 	<td>${userNumber}</td>
	 	<td>${status}</td>
	</tr>
	`;

	// tBody.insertBefore(newRow, tBody.firstChild); // for old browsers
	tBody.prepend(newRowNode);
	// console.dir(dom.guessHistoryTable.tBodies);
}

function processUserMove(){
	console.log(`~~~processUserMove~~~`);
	console.log(`gameState.userNumber:${gameState.userNumber}`);
	console.log(`gameState.machineNumber:${gameState.machineNumber}`);

	// state
	gameState.userTries.push(gameState.userNumber);

	// UI:
	if(gameState.userTries.length===1){
		show(dom.guessHistory);
	}

	dom.userNumberInput.value = "";

	if(gameState.userTries.length === gameState.maxTries){
		// user loss (reached maxTries):
		updatePlayStatus();
		updateGuessHistoryTable(gameState.userNumber, userGuessStatusDict.loss);
		processUserLoss();
	}else if(gameState.userNumber===gameState.machineNumber){
		// user guessed
		updatePlayStatus();
		updateGuessHistoryTable(gameState.userNumber, userGuessStatusDict.win);
		processUserWin();
	}else if (gameState.userNumber<gameState.machineNumber){
		// user number is low
		updatePlayStatus();
		updateGuessHistoryTable(gameState.userNumber, userGuessStatusDict.low);
	}else if (gameState.userNumber>gameState.machineNumber){
		// user number is high
		updatePlayStatus();
		updateGuessHistoryTable(gameState.userNumber, userGuessStatusDict.high);
	}else{
		console.log(`Ups, something went wrong!`);
	}
}
function processUserWin() {
	console.log(`~~~processUserWin~~~`);

	//UI:
	dom.gameEndMessage.innerHTML = `Bravo! You guessed my number (${gameState.machineNumber})
		from ${gameState.userTries.length} tries`;

	endGame();
}
function processUserLoss() {
	console.log(`~~~processUserLoss~~~`);
	//UI
	dom.gameEndMessage.innerHTML = `You loose! My number was (${gameState.machineNumber})`;

	endGame();
}

function initGameState() {
	console.log(`~~~initGameState~~~`);

	// set level (user selected or default)
	gameState.level = dom.selectLevelInput.value || defaultGameState.level;

	// get min max number range per selected level:
	gameState.minNumber = levels[gameState.level].range[0];
	gameState.maxNumber = levels[gameState.level].range[1];

	// set max tries (binary search max steps: logN(base 2)+1,)
	const N = gameState.maxNumber - gameState.minNumber;
	gameState.maxTries = Math.ceil(Math.log2(N) + 1);

	// generate machine number
	gameState.machineNumber = genMachineNumber(gameState.minNumber,gameState.maxNumber);
	// gameState.machineNumber = 7;

	console.dir(gameState);
}

function resetGameState() {
	// this makes shallow copy
	// gameState = {...defaultGameState};

	// make full clone
	gameState = JSON.parse(JSON.stringify(defaultGameState));
}

function startPlay() {
	console.log(`~~~startPlay~~~`);

	initGameState();

	// UI
	updatePlayStatus();

	dom.levelStatus.innerHTML = `Playing Level: ${levels[gameState.level].displayName}`;
	dom.minRangeNode.innerHTML = gameState.minNumber;
	dom.maxRangeNode.innerHTML = gameState.maxNumber;

	hide(dom.selectLevel);
	show(dom.levelStatus);
	show(dom.gamePlayground);

	dom.userNumberInput.focus();
}
function startNewGame() {
	console.clear();

	// reset game
	resetGameState();

	dom.selectLevelInput.value = defaultGameState.level;
	dom.guessHistoryTable.tBodies[0].innerHTML="";
	dom.gameEndMessage.innerHTML = "";

	hide(dom.levelStatus);
	hide(dom.guessHistory);
	hide(dom.gamePlayground);
	hide(dom.gameEndArea);
	show(dom.selectLevel);

	dom.selectLevelInput.focus();
}
function endGame(msg) {
	console.log(`~~~endGame~~~`);
	// UI
	hide(dom.gamePlayground);
	hide(dom.levelStatus);

	show(dom.gameEndArea);
}

/* -------------------------------------------------------------------------- */
/*                 Events handlers Auxiliary functions                         */
/* -------------------------------------------------------------------------- */
function handleUserInput() {
	console.log(`~~~handleUserInput~~~`);
	gameState.userNumber = dom.userNumberInput.value*1;

	if( validateUserNumber(gameState.userNumber) ){
		processUserMove();
	}else{
		gameState.userNumber = undefined;

		alert(`Please, enter a number in range: ${gameState.minNumber},${gameState.maxNumber}`);
		dom.userNumberInput.value = "";
		dom.userNumberInput.focus();
	}
}


/* -------------------------------------------------------------------------- */
/*                              Global Variables                             */
/* -------------------------------------------------------------------------- */
const userGuessStatusDict = {
	// helps not to misspell a status
	'win':'win',
	'loss':'loss',
	'high':'high',
	'low':'low'
}

const levels = {
	'level1': {
		'range':[1,10],
		'displayName':'Easy'
	},
	'level2': {
		'range':[1,50],
		'displayName':'Basic'
	},
	'level3': {
		'range':[1,100],
		'displayName':'Advanced'
	},
}

// default game gameState (initialized in initGameState)
const defaultGameState = {
	level: 'level1',
	minNumber:undefined,
	maxNumber:undefined,
	maxTries:undefined,
	machineNumber: undefined,
	userNumber:undefined,
	userTries:[], // stores user numbers
}

// current game state - will be mutated after play starts
// note that this makes SHALLOW COPY, not full clone
// the full clone is made by resetGameState()
// We do that here, just to help editor's intellisense (as
// we don't have static types in JS)
let gameState = { ...defaultGameState};

// DOM cache:
const dom = {};
dom.selectLevel=document.querySelector('.select-level');
dom.selectLevelInput = document.querySelector('.select-level select');
dom.btnStartPlay = document.querySelector('.btn-start-play');
dom.levelStatus=document.querySelector('.level-status');
dom.gameEndArea = document.querySelector('.game-end-area');

dom.gamePlayground = document.querySelector('.game-playground');
dom.minRangeNode = document.querySelector('.range-min');
dom.maxRangeNode = document.querySelector('.range-max');
dom.userNumberInput = document.querySelector('.user-input-area input[type="number"]');
dom.btnGuess = document.querySelector('.btn-guess');
dom.btnResetGame = document.querySelector('.btn-reset-game');

dom.playStatus = document.querySelector('.play-status');
dom.guessHistory = document.querySelector('.guess-history');
dom.guessHistoryTable = document.querySelector('.guess-history>table');

dom.gameEndMessage = document.querySelector('.game-end-message');
dom.btnStartNewGame = document.querySelector('.btn-start-new-game');


/* -------------------------------------------------------------------------- */
/*                               Attach Events                                */
/* -------------------------------------------------------------------------- */
window.onload = function() {
	startNewGame();
}

dom.btnStartPlay.addEventListener('click', (e)=>{
	// a button element by default is a submit button, but here we do not want to
	// submit a form, so we must prevent the default submit event
	e.preventDefault();
	startPlay();
});
dom.btnResetGame.addEventListener('click', (e)=>{
	e.preventDefault();
	let ans=prompt('Start new game?','yes');
	if(ans){
		startNewGame()
	}
});

dom.btnGuess.addEventListener('click', (e)=>{
	e.preventDefault();
	handleUserInput();
});
dom.userNumberInput.addEventListener('keydown', (e)=>{
	// keyup will be fired when we press enter on dom.btnStartPlay,
	// because we focus this input in gameInit(), when pressing "Enter"
	// on btnStartPlay (it's keydown event triggers the "click"), so do not use keyup here
	if(e.keyCode === 13){
		handleUserInput();
	}
})

dom.btnStartNewGame.addEventListener('click', (e)=>{
	e.preventDefault();
	startNewGame();
});
