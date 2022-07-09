//core and third party libraries
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { State, select } from '@ngrx/store';

// rxjs

// states
import { CoordinatesPuzzlesState } from '@redux/states/coordinates-puzzles.state';

// actions

// selectors
import { getLastCoordinatesPuzzles } from '@redux/selectors/coordinates-puzzles.selectors';

// models
import { CoordinatesPuzzle } from '@models/coordinates-puzzles.model';

// services

// components

@Component({
  selector: 'app-statics',
  templateUrl: './statics.component.html',
  styleUrls: ['./statics.component.scss'],
})
export class StaticsComponent implements OnInit, AfterViewInit {

  @ViewChild('lineCanvas') lineCanvas;
  lineChart: Chart;

  datasetW = new Array(20).fill(0);
  datasetB = new Array(20).fill(0);


  constructor(
    private store: State<CoordinatesPuzzlesState>
  ) {

    Chart.register(...registerables);
  }

  ngOnInit() { }

  ngAfterViewInit() {
    console.log('entra');

    this.lineChartMethod();
  }


  lineChartMethod() {

    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: new Array(20).fill(''), // genera '' * 20
        datasets: [
          {
            label: 'Blancas',
            data: this.datasetW,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          },
          {
            label: 'Negras',
            data: this.datasetB,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          }
        ]
      },
      options: {
        responsive: true
      },
    });

    this.store.pipe(
      select(getLastCoordinatesPuzzles(20)) // obtiene los últimos 20
    ).subscribe(coordinatesPuzzles => this.updateLineChart(coordinatesPuzzles));

  }


  // llega un máximo de 20 elementos (parámetro enviado en el selector)
  updateLineChart(coordinatesPuzzles: CoordinatesPuzzle[]) {

    const dataForW: number[] = [];
    const dataForB: number[] = [];

    for (const coordinatesPuzzle of coordinatesPuzzles) {
      if (coordinatesPuzzle.color === 'w') {
        dataForW.push(coordinatesPuzzle.score);
      } else {
        dataForB.push(coordinatesPuzzle.score);
      }
    }

    const indexW = dataForW.length;
    for (let i = indexW; i < 20; i++) {
      dataForW.push(0);
    }
    const indexB = dataForW.length;
    for (let i = indexB; i < 20; i++) {
      dataForB.push(0);
    }

    console.log('dataForW ', dataForW);

    // arreglos con posiciones y en orden inverso (el ultimo juego este en primer lugar en el arreglo)
    for (const dataset of this.lineChart.data.datasets) {
      // se identifica con el color de fondo y no con el nombre, puesto que el label puede ser traducido
      if (dataset.backgroundColor === 'rgba(153, 102, 255, 0.2)') { // Blancas
        dataset.data = dataForW.reverse();
      } else { // Negras
        dataset.data = dataForB.reverse();
      }
    }

    this.lineChart.update();
  }

}
