import { Component, OnInit } from '@angular/core';

import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

import {
  COLOR,
  INPUT_EVENT_TYPE,
  MOVE_INPUT_MODE,
  SQUARE_SELECT_TYPE,
  Chessboard,
  BORDER_TYPE
} from 'cm-chessboard/src/cm-chessboard/Chessboard.js';
import Chess from 'chess.js';

@Component({
  selector: 'app-infinite',
  templateUrl: './infinite.component.html',
  styleUrls: ['./infinite.component.scss'],
})
export class InfiniteComponent implements OnInit {

  timeColor = 'success';
  board;
  chessInstance = new Chess();

  formGame: UntypedFormGroup;
  phasesSelectedToShow = 'Todas';

  constructor(
    private formBuilder: UntypedFormBuilder
  ) {
    this.buildFormGame();
  }

  get phasesField() {
    return this.formGame.get('phases');
  }

  ngOnInit() { }

  ionViewDidEnter() {
    this.loadBoard();
  }


  buildFormGame() {
    this.formGame = this.formBuilder.group({
      eloRange: [0, [Validators.required, Validators.min(0)]],
      phases: [[]],
      time: [3],
    });
  }

  checkboxChange(event, phase) {
    // adiciona o quita la fase del arreglo de fases del formulario
    if (event.detail.checked) {
      this.phasesField.value.push(phase);
    }
    else {
      const index = this.phasesField.value.indexOf(phase);
      this.phasesField.value.splice(index, 1);
    }

    // se unen las fases en un string para mostrarlas en el label
    this.phasesSelectedToShow = this.phasesField.value.join(', ');

  }


  async loadBoard() {


    // Se valida si es la primera vez que se carga el tablero
    if (!this.board) {
      this.board = await new Chessboard(document.getElementById('boardPuzzleInfinite'), {
        position: 'empty',
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


            }
            // return true, if input is accepted/valid, `false` takes the move back
            return theMove;
          case INPUT_EVENT_TYPE.moveCanceled:
            console.log('moveCanceled ', this.chessInstance.pgn());
        }
      });

    }

  }


}
