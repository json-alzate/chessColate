//core and third party libraries
import { Component, OnInit } from '@angular/core';

import {
  COLOR,
  INPUT_EVENT_TYPE,
  MOVE_INPUT_MODE,
  SQUARE_SELECT_TYPE,
  Chessboard,
  BORDER_TYPE
} from 'cm-chessboard/src/cm-chessboard/Chessboard.js';
import Chess from 'chess.js';
import { createUid } from '@utils/create-uid';

// rxjs

// states

// actions

// selectors

// models
import { Puzzle } from '@models/puzzle.model';

// services

// components


@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss'],
})
export class TrainingComponent implements OnInit {

  // timer
  time = 60;
  timeColor = 'success';

  board;
  chessInstance = new Chess();

  allowNextPuzzle = false;

  solution: string[] = ['e8d7', 'a2e6', 'd7d8', 'f7f8'];
  moveNumber = 0;

  // TODO: only for test
  puzzleToResolve: Puzzle = {
    uid: '00sHx',
    fen: 'q3k1nr/1pp1nQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 b k - 0 17',
    moves: 'e8d7 a2e6 d7d8 f7f8',
    rating: 1760,
    ratingDeviation: 80,
    popularity: 83,
    nbPlays: 72,
    themes: ['mate', 'mateIn2', 'middlegame', 'short'],
    gameUrl: 'https://lichess.org/yyznGmXs/black#34',
    openingFamily: 'Italian_Game',
    openingVariation: 'Italian_Game_Classical_Variation'
  };

  constructor() { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.loadBoard();
  }


  async loadBoard() {
    this.chessInstance.load(this.puzzleToResolve.fen);
    this.board = await new Chessboard(document.getElementById('boardPuzzle'), {
      position: this.puzzleToResolve.fen,
      style: {
        borderType: BORDER_TYPE.thin
      },
      sprite: { url: '/assets/images/chessboard-sprite-staunty.svg' }
    });


    this.board.enableMoveInput((event) => {
      // handle user input here
      switch (event.type) {
        case INPUT_EVENT_TYPE.moveStart:
          // console.log(`moveStart: ${event.square}`);
          // return `true`, if input is accepted/valid, `false` aborts the interaction, the piece will not move
          return true;
        case INPUT_EVENT_TYPE.moveDone:

          const objectMove = { from: event.squareFrom, to: event.squareTo };
          const theMove = this.chessInstance.move(objectMove);

          if (theMove) {

            const moveToEvaluate = `${theMove.from}${theMove.to}`;
            console.log('moveToEvaluate ', theMove, moveToEvaluate, this.solution[this.moveNumber]);
            if (moveToEvaluate === this.solution[this.moveNumber]) {
              console.log('correct!!!');
              this.moveNumber++;
              this.puzzleMoveResponse(this.moveNumber);
            } else {
              console.log('Wrong');

            }

          }
          // return true, if input is accepted/valid, `false` takes the move back
          return theMove;
        case INPUT_EVENT_TYPE.moveCanceled:
          console.log('moveCanceled ', this.chessInstance.pgn());
      }
    });


  }

  /**
   * Reacciona con el siguiente movimiento en el puzzle, cuando el usuario realiza una jugada correcta
   * React with the following movement in the puzzle, when the user makes a correct move
   *
   * @param moveNumber: number
   */
  async puzzleMoveResponse(moveNumber: number) {
    const move = this.chessInstance.move(this.solution[moveNumber], { sloppy: true });
    console.log('mode next ', move, this.solution[moveNumber]);

    const fen = this.chessInstance.fen();
    await this.board.setPosition(fen, true);
    this.moveNumber++;
  }


}
