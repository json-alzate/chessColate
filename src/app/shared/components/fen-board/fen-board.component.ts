import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

import {
  Chessboard,
  BORDER_TYPE
} from 'cm-chessboard';

import { createUid } from '@utils/create-uid';

// Services
import { UiService } from '@services/ui.service';

@Component({
  selector: 'app-fen-board',
  templateUrl: './fen-board.component.html',
  styleUrls: ['./fen-board.component.scss'],
})
export class FenBoardComponent implements OnInit, AfterViewInit {

  fen: string;
  uid: string;
  board;


  constructor(
    private uiService: UiService
  ) { }


  @Input() set setFen(fen: string) {
    this.uid = createUid();
    this.fen = fen;
  };



  ngOnInit() { }

  ngAfterViewInit() {
    this.buildBoard();
  }

  buildBoard() {

    // Se configura la ruta de las piezas con un timestamp para que no se guarde en cache (assetsCache: false, no se ven bien las piezas)
    const uniqueTimestamp = new Date().getTime();
    const piecesPath = `${this.uiService.pieces}?t=${uniqueTimestamp}`;

    const cssClass = this.uiService.currentBoardStyleSelected.name !== 'default' ? this.uiService.currentBoardStyleSelected.name : null;

    console.log(this.uid);


    this.board = new Chessboard(document.getElementById(this.uid), {
      responsive: true,
      position: this.fen,
      assetsUrl: '/assets/cm-chessboard/',
      assetsCache: true,
      style: {
        cssClass,
        borderType: BORDER_TYPE.thin,
        pieces: {
          file: piecesPath
        }
      },
      extensions: []
    });
  }

}
