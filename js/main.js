/**
 * Pitch a.k.a. Setback a.k.a. High Low Jack
 * A javascript implementation of a popular card game
 * Copyright 2012 Shawn J. Haworth
 * @version 0.0.1
 */
var pitch = new function() {
	
	var currentInstance = this;
	this._ai = true;
	this._deck;
	this._fullDeck;
	this._turn;
	this._dealer;
	this._trumpSuit;
	this._trickSuit;
	this._followSuit;
	this._trickStack;
	this._handStack;
	this._playerCardStack;
	this._currentBid;
	this._winningBidder;
	this._team1Points;
	this._team2Points;
	this._playerBids;
	this._dealer;
	this._players;
	this._playerList;
	this._gameInProgress;
	this._handInProgress;
	this._trickInProgress;
	this._allowOffLeading;
	this._humanPlayer = "player1";
	
	this.init = function() {
		var deck = new Array();
		var cards = [{"A":"C"},{"2":"C"},{"3":"C"},{"4":"C"},{"5":"C"},{"6":"C"},{"7":"C"},{"8":"C"},{"9":"C"},{"10":"C"},{"J":"C"},{"Q":"C"},{"K":"C"},
					{"A":"H"},{"2":"H"},{"3":"H"},{"4":"H"},{"5":"H"},{"6":"H"},{"7":"H"},{"8":"H"},{"9":"H"},{"10":"H"},{"J":"H"},{"Q":"H"},{"K":"H"},
					{"A":"S"},{"2":"S"},{"3":"S"},{"4":"S"},{"5":"S"},{"6":"S"},{"7":"S"},{"8":"S"},{"9":"S"},{"10":"S"},{"J":"S"},{"Q":"S"},{"K":"S"},
					{"A":"D"},{"2":"D"},{"3":"D"},{"4":"D"},{"5":"D"},{"6":"D"},{"7":"D"},{"8":"D"},{"9":"D"},{"10":"D"},{"J":"D"},{"Q":"D"},{"K":"D"}];
		var deckPosX = 0;
		var deckPosY = 0;
		var deckSuit = "C";
		for (var i = 0; i <= cards.length-1; i++) {
			var card = {};
			var cardVal;
			var suit;
			for (key in cards[i]) {
				cardVal = key;
			}
			suit = cards[i][cardVal];
			if (suit !== deckSuit) {
				deckPosX = 0;
				deckPosY += 98;
			} else {
				deckPosX += 73;
			}
			if (i === 0) deckPosX = 0;
			deckSuit = suit;
			var cardInfo = this.getCardRankAndPoints(cardVal);
			card.id = "card-" + i;
			card.suit = suit;
			card.rank = cardInfo.rank;
			card.points = cardInfo.points;
			card.loc = [deckPosX, deckPosY];
			card.val = cardVal;
			deck.push(card);
		}
		this._fullDeck = deck.slice(0);
		this._deck = deck;
		this._players = new Array();
		this._playerList = new Array("player1", "player2", "player3", "player4");
		this._playerBids = new Array();
		this._trickStack = new Array();
		this._handStack = new Array();
		this._dealer = this._playerList[0];
		this._team1Points = 0;
		this._team2Points = 0;
		this._gameInProgress = true;
		this._allowOffLeading = true;
		this.shuffle();
		this.deal();
		this.selectBids(2);
	};
	
	this.shuffle = function() {
		this._deck.sort(function() {
			return 0.5 - Math.random();
		});
	};
	
	this.deal = function() {
		for (var i = 1; i <= 4; i++) {
			var player = document.getElementById("player" + i);
			this.render("player" + i);
		}
		this._trickStack = new Array();
	};
	
	this.selectBids = function(playerNumber) {
		var bidSelector = document.getElementById("bid-selector");
		var bidTwo		= document.getElementById("bid-2");
		var bidThree	= document.getElementById("bid-3");
		var bidFour		= document.getElementById("bid-4");
		var bidPass		= document.getElementById("bid-0");
		bidTwo.addEventListener("click", this.setBid, true);
		bidThree.addEventListener("click", this.setBid, true);
		bidFour.addEventListener("click", this.setBid, true);
		bidPass.addEventListener("click", this.setBid, true);
		var playerLabel = document.getElementById("player-turn");
		var currentBidder = "player" + playerNumber;
		if (!this.allPlayersBid()) {
			this.setTurn(currentBidder);
		} else {
			this.setTurn(this._dealer);
		}
		playerLabel.innerHTML = this._turn + " - Its your turn.. select your bid.";
		bidSelector.style.display = "block";
		if (this.allPlayersBid()) {
			return true;	
		} else {
			return false;
		}
	};
	
	this.allPlayersBid = function() {
		for (var i = 0; i < this._playerList.length; i++) {
			if (this._playerBids[this._playerList[i]] == undefined 
				&& this._playerList[i] != this._dealer)
				return false;
		}
		return true;
	};
	
	this.findMaxBid = function() {
		var maxBid = 0;
		var maxPlayer;
		for (key in this._playerBids) {
			if (this._playerBids[key] > maxBid) {
				maxBid = this._playerBids[key];
				maxPlayer = key;
			}
		}
		if (maxBid != 0)
			return [maxBid, maxPlayer]
		else
			return [0, 0];
	};
	
	this.setBid = function(e) {
		var selectedBid = e.target || e.relatedTarget;
		currentInstance._playerBids[currentInstance._turn] = selectedBid.value;
		var bidderPattern = new RegExp(/[0-9]/);
		var currentBidder = bidderPattern.exec(currentInstance._turn);
		var nextBidder = parseInt(currentBidder[0]) == 4 ? 1 : parseInt(currentBidder[0]) + 1;
		var bidSelector = document.getElementById("bid-selector");
		var highBidder = currentInstance.findMaxBid();
		bidSelector.style.display = "none";
		if (currentInstance._turn != currentInstance._dealer) {
			currentInstance.selectBids(nextBidder);
			currentInstance.setBidMinimum(selectedBid);
		} else {
			currentInstance._currentBid = highBidder[0];
			if (selectedBid.value > 0) {
				currentInstance._winningBidder = currentInstance._dealer;
			} else {
				currentInstance._winningBidder = highBidder[1];
			}
			currentInstance.selectTrump();
		}
	};
	
	this.resetBidButtons = function() {
		document.getElementById("bid-0").style.display = "block";
		document.getElementById("bid-2").style.display = "block";
		document.getElementById("bid-3").style.display = "block";
		document.getElementById("bid-4").style.display = "block";
		document.getElementById("trumpArea").innerHTML = "";
	}
	
	this.setBidMinimum = function(selectedBid) {
		var highBidder = this.findMaxBid();
		if (this._turn == this._dealer) {
			if (highBidder[0] == 2) {
				document.getElementById("bid-2").style.display = "block";
			} else if (highBidder[0] == 3) {
				document.getElementById("bid-2").style.display = "none";
				document.getElementById("bid-3").style.display = "block";
			} else if (highBidder[0] == 4) {
				document.getElementById("bid-2").style.display = "none";
				document.getElementById("bid-3").style.display = "none";
				document.getElementById("bid-4").style.display = "block";
			} else if (highBidder[0] == 0 && highBidder[1] == 0) {
				document.getElementById("bid-0").style.display = "none";
				document.getElementById("bid-2").style.display = "block";
				document.getElementById("bid-3").style.display = "block";
				document.getElementById("bid-4").style.display = "block";
			}
		} else {
			if (selectedBid.value == 2) {
				document.getElementById("bid-2").style.display = "none";
			} else if (selectedBid.value == 3) {
				document.getElementById("bid-2").style.display = "none";
				document.getElementById("bid-3").style.display = "none";
			} else if (selectedBid.value == 4) {
				document.getElementById("bid-2").style.display = "none";
				document.getElementById("bid-3").style.display = "none";
				document.getElementById("bid-4").style.display = "none";
			}	
		}
	};
	
	this.selectTrump = function() {
		this._turn 		= this._winningBidder;
		var playerLabel = document.getElementById("player-turn-trump");
		var hearts		= document.getElementById("trump-H");
		var diamonds	= document.getElementById("trump-D");
		var clubs		= document.getElementById("trump-C");
		var spades		= document.getElementById("trump-S");
		hearts.addEventListener("click", this.setTrump, true);
		diamonds.addEventListener("click", this.setTrump, true);
		clubs.addEventListener("click", this.setTrump, true);
		spades.addEventListener("click", this.setTrump, true);
		var trumpSelector = document.getElementById("trump-selector");
		playerLabel.innerHTML =  this._turn + " - Select trump.";
		trumpSelector.style.display = "block";
	};
	
	this.setTrump = function(e) {
		var selectedTrump = e.target || e.relatedTarget;
		currentInstance._trumpSuit = selectedTrump.getAttribute("suit");
		var trumpSelector = document.getElementById("trump-selector");
		var trumpLabel = "";
		trumpSelector.style.display = "none";
		if (currentInstance._trumpSuit == "H")
			trumpLabel = "Hearts";
		else if (currentInstance._trumpSuit == "C")
			trumpLabel = "Clubs";
		else if (currentInstance._trumpSuit == "S")
			trumpLabel = "Spades";
		else if (currentInstance._trumpSuit == "D")
			trumpLabel = "Diamonds";
		document.getElementById("trumpArea").innerHTML = trumpLabel + " are trump.";
		currentInstance.startGame();
	};
	
	this.startGame = function() {
		this._handInProgress = true;
		console.log("Game started... Trump: " + this._trumpSuit + " Current Turn: " + this._winningBidder);
		this.setTurn(this._winningBidder);
	};
	
	
	this.setTurn = function(target) {
		this._turn = target;
		if (this._turn == this._humanPlayer && this._handInProgress) {
			var cards = document.getElementsByTagName("div");
			for (var i = 0; i < cards.length; i++) {
				if (cards[i].getAttribute("player") != undefined && cards[i].getAttribute("player") == target) {
					cards[i].addEventListener("click", this.playCard, true);
				} else {
					cards[i].removeEventListener("click", this.playCard, true);
				}
			}
		} else if (this._turn != this._humanPlayer && this._handInProgress) {
			var cards = document.getElementsByTagName("div");
			for (var i = 0; i < cards.length; i++) {
				if (cards[i].getAttribute("player") != undefined && cards[i].getAttribute("player") == target) {
					cards[i].addEventListener("aiclick", this.playCard, true);
					console.log("Adding aiclick event listener.");
				}
			}
			this.computerPlayCard();
		}
		
		document.getElementById("info").innerHTML = target + "... It's your turn.";
	};
	
	this.render = function(target) {
		var playerCards = new Array();
		for (var i = 0; i <= 5; i++) {
			playerCards.push(this._deck[i]);
			var sprite = document.createElement("div");
			var cardImg = document.createElement("img");
			var cardImgCont = document.createElement("div");
			cardImgCont.id = this._deck[i].id + "-cont";
			cardImgCont.className = "cardImg";
			cardImg.src = "img/cards.png";
			cardImg.style.left = "-" + this._deck[i].loc[0] + "px";
			cardImg.style.top = "-" + this._deck[i].loc[1] + "px";
			sprite.className = "card";
			sprite.id = this._deck[i].id;
			sprite.setAttribute("player", target);
			sprite.setAttribute("suit", this._deck[i].suit);
			sprite.setAttribute("val", this._deck[i].val);
			sprite.setAttribute("rank", this._deck[i].rank);
			sprite.setAttribute("points", this._deck[i].points);
			document.getElementById(target).appendChild(sprite);
			document.getElementById(sprite.id).appendChild(cardImgCont);
			document.getElementById(cardImgCont.id).appendChild(cardImg);
			this._deck.splice(i, 1);
		}
		console.log(playerCards);
		console.log(target);
		currentInstance._players[target] = playerCards;
		console.log(currentInstance._players);
	};
	
	this.playerHasSuit = function(player, suit) {
		for (var i = 0; i <= this._players[player].length-1; i++) {
			if (this._players[player][i].suit == suit) {
				return true
			}
		}
		return false;
	};
	
	this.playableCard = function(card, player) {
		if (this.playerHasSuit(player, this._followSuit) && card.getAttribute("suit") == this._followSuit) {
			return true;
		} else if (!this.playerHasSuit(player, this._followSuit) && card.getAttribute("suit") !== this._followSuit) {
			return true;
		} else if (card.getAttribute("suit") == this._trumpSuit) {
			return true;
		} else if (this._followSuit == null) {
			return true;
		}
		return false;
	};
	
	this.getTrickWinner = function() {
		var trickHasTrump = false;
		var maxFollowValue = 0;
		var maxFollowPlayer = "";
		var maxTrumpValue = 0;
		var maxTrumpPlayer = "";
		for (key in this._trickStack) {
			if (this._trickStack[key].getAttribute("suit") == this._trumpSuit) {
				trickHasTrump = true;
				if (parseInt(this._trickStack[key].getAttribute("rank")) > maxTrumpValue) {
					maxTrumpValue = parseInt(this._trickStack[key].getAttribute("rank"));
					maxTrumpPlayer = this._trickStack[key].getAttribute("player");
				}
			} else if (this._trickStack[key].getAttribute("suit") == this._followSuit) {
				if (parseInt(this._trickStack[key].getAttribute("rank")) > maxFollowValue) {
					maxFollowValue = parseInt(this._trickStack[key].getAttribute("rank"));
					maxFollowPlayer = this._trickStack[key].getAttribute("player");
				}
			}
		}
		if (trickHasTrump) {
			return maxTrumpPlayer;	
		} else {
			return maxFollowPlayer;
		}
	};
	
	this.getHandPoints = function() {
		console.log("Getting hand winner...");
		var bidLevel = this._playerBids[this._winningBidder];
		var team1 = 0; // 1, 4
		var team2 = 0; // 2, 3
		var highCardWinner;
		var lowCardWinner;
		var jackCardWinner;
		var highCardRank = 0;
		var lowCardRank = 13;
		var gamePointsTeam1 = 0;
		var gamePointsTeam2 = 0;
		for (var i = 0; i <= this._handStack.length-1; i++) {
			if (this._handStack[i].getAttribute("suit") == this._trumpSuit) {
				// Count rank points
				if (parseInt(this._handStack[i].getAttribute("rank")) > highCardRank) {
					highCardRank = parseInt(this._handStack[i].getAttribute("rank"));
					highCardWinner = this._handStack[i].getAttribute("player");
				}
				if (parseInt(this._handStack[i].getAttribute("rank")) < lowCardRank) {
					lowCardRank = parseInt(this._handStack[i].getAttribute("rank"));
					lowCardWinner = this._handStack[i].getAttribute("player");
				}
				if (parseInt(this._handStack[i].getAttribute("rank")) == 10) {
					var hasJack = this._handStack[i].getAttribute("player"); 
					if (hasJack == "player1" || hasJack == "player4") {
						jackCardWinner = "team1";
					} else {
						jackCardWinner = "team2";
					}
				}
			} 
			if (this._handStack[i].getAttribute("rank") >= 9) {
				// Count game points
				if (this._handStack[i].getAttribute("player") == "player1" || this._handStack[i].getAttribute("player") == "player4") {
					gamePointsTeam1 += parseInt(this._handStack[i].getAttribute("points"));
				} else {
					gamePointsTeam2 += parseInt(this._handStack[i].getAttribute("points"));
				}
			}
		}
		if (highCardWinner == "player1" || highCardWinner == "player4") {
			team1 += 1;
		} else {
			team2 += 1;
		}
		if (lowCardWinner == "player1" || lowCardWinner == "player4") {
			team1 += 1;
		} else {
			team2 += 1;
		}
		if (jackCardWinner == "team1") {
			team1 += 1;
		} else if (jackCardWinner == "team2") {
			team2 += 1;
		}
		if (gamePointsTeam1 > gamePointsTeam2) {
			team1 += 1;
		} else if (gamePointsTeam2 > gamePointsTeam1) {
			team2 += 1;
		}
		var teamBid = "";
		if (this._winningBidder == "player1" || this._winningBidder == "player4") {
			teamBid = "team1";
			if (team1 >= bidLevel) {
				this._team1Points += team1;
			} else if (team1 < bidLevel) {
				this._team1Points - bidLevel;
			}
		} else {
			teamBid = "team2";
			if (team2 >= bidLevel) {
				this._team2Points += team2;
			} else if (team2 < bidLevel) {
				this._team2Points - bidLevel;
			}
		}
		if (teamBid == "team1") {
			this._team2Points += team2;
		} else {
			this._team1Points += team1;
		}
		document.getElementById("team1Score").innerHTML = this._team1Points;
		document.getElementById("team2Score").innerHTML = this._team2Points;
	};
	
	this.updateGamePoints = function() {
		var gamePointsTeam1 = 0;
		var gamePointsTeam2 = 0;
		for (var i = 0; i <= this._handStack.length -1; i++) {
			if (this._handStack[i].getAttribute("rank") >= 9) {
				// Count game points
				if (this._handStack[i].getAttribute("player") == "player1" || this._handStack[i].getAttribute("player") == "player4") {
					gamePointsTeam1 += parseInt(this._handStack[i].getAttribute("points"));
				} else {
					gamePointsTeam2 += parseInt(this._handStack[i].getAttribute("points"));
				}
			}
		}
		document.getElementById("team1Game").innerHTML = gamePointsTeam1;
		document.getElementById("team2Game").innerHTML = gamePointsTeam2;
	}
	
	this.playCard = function(e) {
		if (currentInstance._gameInProgress && currentInstance._handInProgress) {
			var cardPlayed = e.target.nodeName == "IMG" ? 
							e.target.parentElement.parentElement || e.relatedTarget.parentElement.parentElement
							:
							e.target || e.relatedTarget;
			console.log(e.target);
			if (currentInstance._trickStack.length == 0) {
				currentInstance._followSuit = cardPlayed.getAttribute("suit");
			}
			if (currentInstance.playableCard(cardPlayed, currentInstance._turn)) {
				currentInstance._handStack.push(cardPlayed);
				currentInstance._trickStack.push(cardPlayed);
				currentInstance.removeCardFromPlayer(cardPlayed);
				if (currentInstance._trickStack.length < 4) {
					var playerPattern = new RegExp(/[0-9]/);
					var currentPlayer = playerPattern.exec(cardPlayed.getAttribute("player"));
					var nextPlayer = parseInt(currentPlayer[0]) == 4 ? 1 : parseInt(currentPlayer[0]) + 1;
					currentInstance.setTurn("player" + nextPlayer);
				} else {
					var trickWinner = currentInstance.getTrickWinner();
					console.log("Trick winner: " + trickWinner);
					currentInstance._trickStack = new Array();
					var cardArea = document.getElementById("cardArea");
					while (cardArea.hasChildNodes()) {
						cardArea.removeChild(cardArea.firstChild);
					}
					currentInstance.updateGamePoints();
					console.log(currentInstance._handStack.length);
					if (currentInstance._handStack.length == 24) {
						currentInstance.getHandPoints();
						currentInstance.nextHand();
					} else {
						currentInstance.setTurn(trickWinner);
					}
				}
			}
		}
	};
	
	this.computerPlayCard = function() {
		if (this._ai = true && this._turn != this._humanPlayer) {
			var cards = document.getElementsByTagName("div");
			var computerCards = new Array();
			for (var i = 0; i < cards.length; i++) {
				if (cards[i].getAttribute("player") != undefined && cards[i].getAttribute("player") == this._turn) {
					computerCards.push(cards[i]);
				}
			}
			var highestTrump = 0;
			var highestFollow = 0; 
			var cardToBePlayed = null;
			console.log(this._turn);
			console.log(computerCards);
			console.log(this._players);
			// Lead with high trump
			for (var i = 0; i < computerCards.length; i++) {
				if (computerCards[i].getAttribute("suit") == this._trumpSuit && computerCards[i].getAttribute("rank") > highestTrump) {
					highestTrump = computerCards[i].getAttribute("rank");
				}
				if (computerCards[i].getAttribute("suit") == this._followSuit && computerCards[i].getAttribute("rank") > highestFollow) {
					highestFollow = computerCards[i].getAttribute("rank");
				}
			}
			for (var i = 0; i < computerCards.length; i++) {
				if (computerCards[i].getAttribute("suit") == this._followSuit && computerCards[i].getAttribute("rank") == highestFollow) {
					cardToBePlayed = computerCards[i];
					break;
				}
			}
			if (cardToBePlayed == null) {
				// Check to see if player has trump suit
				for (var i = 0; i < computerCards.length; i++) {
					if (computerCards[i].getAttribute("suit") == this._trumpSuit && computerCards[i].getAttribute("rank") == highestTrump) {
						cardToBePlayed = computerCards[i];
						break;
					}
				}
			}
			if (cardToBePlayed == null) {
				// By now, we know that the player has no trump or follow, pick a low offsuit
				for (var i = 0; i < computerCards.length; i++) {
					cardToBePlayed = computerCards[i];
					break;
				}
			}
			var event;
			if (document.createEvent) {
				event = document.createEvent("HTMLEvents");
			    event.initEvent("aiclick", true, true);
			} else {
			    event = document.createEventObject();
			    event.eventType = "aiclick";
			}
			event.target = cardToBePlayed;
			if (document.createEvent) {
			    cardToBePlayed.dispatchEvent(event);
			} else {
				console.log("Firing ai click event");
				element.cardToBePlayed(event.eventType, event);
			}
		}
	}
	
	
	this.nextHand = function() {
		if (this._team1Points < 15 && this._team2Points < 15) {
			var playerPattern = new RegExp(/[0-9]/);
			var currentPlayer = playerPattern.exec(this._dealer);
			var nextDealer = parseInt(currentPlayer[0]) == 4 ? 1 : parseInt(currentPlayer[0]) + 1;
			this._dealer = "player" + nextDealer;
			var nextTurn = nextDealer == 4 ? 1 : nextDealer + 1;
			this.setTurn("player" + nextTurn);
			this._deck = this._fullDeck.slice(0);
			this._playerBids = new Array();
			this._trickStack = new Array();
			this._handStack = new Array();
			this.resetBidButtons();
			this.shuffle();
			this.deal();
			this.selectBids(nextTurn);
		} else if (this._team1Points >= 15 || this._team2Points >= 15) {
			this.init();
		}
	};
	
	this.removeCardFromPlayer = function(card) {
		console.log(card);
		for (var i = 0; i <= this._players[card.getAttribute("player")].length-1; i++) {
			if (this._players[card.getAttribute("player")][i].id == card.getAttribute("id")) {
				this._players[card.getAttribute("player")].splice(i, 1);
				var cardArea = document.getElementById("cardArea");
				cardArea.appendChild(card.parentNode.removeChild(card));
				break;
			}
		}
	};
	
	this.getCardRankAndPoints = function(cardValue) {
		cardRank = 0;
		cardPoints = 0;
		switch(cardValue) {
			case "A": {
				cardRank = 13;
				cardPoints = 4;
				break;
			}
			case "K": {
				cardRank = 12;
				cardPoints = 3;
				break;
			}
			case "Q": {
				cardRank = 11;
				cardPoints = 2;
				break;
			}
			case "J": {
				cardRank = 10;
				cardPoints = 1;
				break;
			}
			case "10": {
				cardRank = 9;
				cardPoints = 10;
				break;
			}
			case "9": {
				cardRank = 8
				;
				cardPoints = 0;
				break;
			}
			case "8": {
				cardRank = 7;
				cardPoints = 0;
				break;
			}
			case "7": {
				cardRank = 6;
				cardPoints = 0;
				break;
			}
			case "6": {
				cardRank = 5;
				cardPoints = 0;
				break;
			}
			case "5": {
				cardRank = 4;
				cardPoints = 0;
				break;
			}
			case "4": {
				cardRank = 3;
				cardPoints = 0;
				break;
			}
			case "3": {
				cardRank = 2;
				cardPoints = 0;
				break;
			}
			case "2": {
				cardRank = 1;
				cardPoints = 0;
				break;
			}
		}
		return {"points":cardPoints,"rank":cardRank};
	};
	
};
// And away we go...
pitch.init();