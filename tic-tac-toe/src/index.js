import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
	return (
		<button className="square" onClick={props.onClick}>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderSquare(i) {
		return (
			<Square
				value={this.props.squares[i]}
				onClick={() => this.props.onClick(i)}
			/>
		);
	}
	render() {
		return (
			<div>
				<div className="board-row">
					{this.renderSquare(0)}
					{this.renderSquare(1)}
					{this.renderSquare(2)}
				</div>
				<div className="board-row">
					{this.renderSquare(3)}
					{this.renderSquare(4)}
					{this.renderSquare(5)}
				</div>
				<div className="board-row">
					{this.renderSquare(6)}
					{this.renderSquare(7)}
					{this.renderSquare(8)}
				</div>
			</div>
		);
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [{
				squares: Array(9).fill(null),
			}],
			marker: 'X',
			stepNumber: 0,
			hasWon: false
		};
	}

	jumpTo(step) {
    this.setState({
      stepNumber: step,
      marker: (step % 2) === 0 ? 'X' : 'O',
		});
	}
	
	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];

		// bail if there's a winner or if that square already has a marker
		if (current.squares[i] || this.state.hasWon) {
			return;
		}

		// add marker
		const squares = current.squares.slice();
		squares[i] = this.state.marker;

		// update game play
		this.setState({
			history: history.concat([{
				squares: squares,
			}]),
			stepNumber: this.state.stepNumber + 1
		});

		// handle win or continue
		let hasWon = determineWin(squares, i)
		if (hasWon) {
			this.setState({ hasWon: true})
		} else {
			this.setState({ marker: nextMove(this.state.marker)})
		}
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const status = determineStatus(this.state.marker, this.state.hasWon);

		const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
				'Go to start';
			return (
				<li key={move}>
					<button onClick={() => this.jumpTo(move)}>{desc}</button>
				</li>
			);
		});

		return (
			<div className="game">
				<div className="game-board">
					<Board 
						squares = {current.squares}
						onClick = {(i) => this.handleClick(i)}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<ol>{moves}</ol>
				</div>
			</div>
		);
	}
}

// ========================================

ReactDOM.render(
	<Game />,
	document.getElementById('root')
);

function nextMove(marker) {
	if (marker === 'X') {
		return 'O'
	} else {
		return 'X'
	}
}

function determineStatus(marker, hasWon) {
	if (hasWon) {
		return `${marker} has won!`
	} else {
		return `Current move: ${marker}`
	}
}

function determineWin(squares, index) {
	let horizontalWin = function(squares, index) {
		let row = Math.floor(index / 3) * 3
		let rowValues = squares.slice(row,row+3)
		return squares[index] && rowValues.every(value => value === squares[row]);
	}
	let verticalWin = function(squares, index) {
		let col = index % 3
		let colValues = [squares[col], squares[col+3], squares[col+6]]
		return squares[index] && colValues.every(value => value === squares[col]);
	}
	let diagonalWin = function(squares, index) {
		if (!squares[4] || index % 2 !== 0) {
			return;
		}
		let leftCol = [squares[0], squares[4], squares[8]];
		let rightCol = [squares[2], squares[4], squares[6]];

		return squares[index] && (
			leftCol.every(value => value === squares[index]) || rightCol.every(value => value === squares[index])
		);
	}
	
	return verticalWin(squares, index) || horizontalWin(squares, index) || diagonalWin(squares, index)
}