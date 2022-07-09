//core and third party libraries
import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';

import {
  COLOR,
  INPUT_EVENT_TYPE,
  MOVE_INPUT_MODE,
  SQUARE_SELECT_TYPE,
  Chessboard,
  BORDER_TYPE
} from 'cm-chessboard/src/cm-chessboard/Chessboard.js';

// rxjs
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


// states
import { UIState } from '@redux/states/ui.state';

// actions
import { requestAddOneCoordinatesPuzzle } from '@redux/actions/coordinates-puzzles.actions';

// selectors
import { getProfile } from '@redux/selectors/auth.selectors';


// models
import { CoordinatesPuzzle } from '@models/coordinates-puzzles.model';
import { Profile } from '@models/profile.model';

// services

// components



@Component({
  selector: 'app-coordinates',
  templateUrl: './coordinates.page.html',
  styleUrls: ['./coordinates.page.scss'],
})
export class CoordinatesPage implements OnInit {

  letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  numbers = ['1', '2', '3', '4', '5', '6', '7', '8'];
  board;

  subsSeconds;
  private unsubscribeIntervalSeconds$ = new Subject<void>();

  isPlaying = false;
  currentPuzzle = '';
  puzzles: string[] = [];

  squaresGood: string[] = [];
  squaresBad: string[] = [];
  score = 0;
  time = 60;
  progressValue = 1;
  timeColor: 'success' | 'warning' | 'danger' = 'success';

  // Options
  color: 'random' | 'white' | 'black' = 'random';

  profile: Profile;


  constructor(
    private store: Store<UIState>,

  ) {
    this.store.pipe(select(getProfile)).subscribe((profile: Profile) => {
      this.profile = profile;
    });
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.loadBoard();
  }


  async loadBoard() {
    this.board = await new Chessboard(document.getElementById('boardCordinates'), {
      position: 'empty',
      style: {
        showCoordinates: false,
        borderType: BORDER_TYPE.thin
      },
      sprite: { url: '/assets/images/chessboard-sprite-staunty.svg' }
    });

    this.board.enableSquareSelect((event) => {
      switch (event.type) {
        case SQUARE_SELECT_TYPE.primary:

          if (this.isPlaying) {

            if (event.square === this.currentPuzzle) {
              this.squaresGood.push(this.currentPuzzle);
              this.nextPuzzle();
            } else {
              this.timeColor = 'danger';
              this.squaresBad.push(this.currentPuzzle);
            }

          }

        // left click
        case SQUARE_SELECT_TYPE.secondary:
        // right click
      }
    })



  }

  changeOrientation(orientation?: 'w' | 'b') {
    this.board.setOrientation(orientation);
  }


  generatePuzzles(count = 1): string[] {
    const puzzles = [];

    for (let i = 0; i < count; i++) {
      const puzzle = `${this.letters[Math.floor(Math.random() * this.letters.length)]}${this.numbers[Math.floor(Math.random() * this.numbers.length)]}`;
      puzzles.push(puzzle);
    }

    return puzzles;
  }


  play() {
    this.puzzles = this.generatePuzzles(200);
    this.currentPuzzle = this.puzzles[0];
    this.time = 60;
    this.score = 0;
    this.squaresBad = [];
    this.squaresGood = [];

    let orientation: 'w' | 'b' = this.color === 'white' ? 'w' : 'b';

    if (this.color === 'random') {
      orientation = Math.random() < 0.5 ? 'w' : 'b';
    }

    this.changeOrientation(orientation);

    this.isPlaying = true;
    this.initInterval();
    this.board.setPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }


  initInterval() {


    const seconds = interval(1000);
    this.subsSeconds = seconds.pipe(
      takeUntil(this.unsubscribeIntervalSeconds$)
    );

    this.subsSeconds.subscribe(() => {
      this.time = this.time - 1;
      this.progressValue = this.time / 60;
      if (this.time < 1) {
        this.stopGame();
      } else if (this.time > 15) {
        this.timeColor = 'success';
      } else {
        this.timeColor = 'warning';
      }
    });

  }


  nextPuzzle() {
    this.score++;
    this.currentPuzzle = this.puzzles[this.score];
  }


  stopGame() {
    this.unsubscribeIntervalSeconds$.next();
    this.saveGame();
    this.isPlaying = false;
    this.board.setPosition('empty');
    this.currentPuzzle = '';
    this.progressValue = 1;
    this.timeColor = 'success';
    this.time = 60;
  }


  saveGame() {
    const coordinatesPuzzle: CoordinatesPuzzle = {
      uidUser: this.profile?.uid,
      score: this.score,
      squaresGood: this.squaresGood,
      squaresBad: this.squaresBad,
      date: new Date().getTime(),
      round: this.puzzles,
      color: this.board.getOrientation()
    };

    // FIXME: se esta guardando dos veces en firestore
    const action = requestAddOneCoordinatesPuzzle({ coordinatesPuzzle });
    this.store.dispatch(action);
  }

}
