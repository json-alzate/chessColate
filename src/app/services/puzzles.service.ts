import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Store, select } from '@ngrx/store';

// states
import { PuzzlesState } from '@redux/states/puzzles.state';


// actions
import { requestLoadPuzzles, addPuzzles } from '@redux/actions/puzzles.actions';
import { requestAddOneUserPuzzle } from '@redux/actions/user-puzzles.actions';

// selectors
import { getPuzzlesToResolve } from '@redux/selectors/puzzles.selectors';
import { getProfile } from '@redux/selectors/auth.selectors';


// models
import { Puzzle, PuzzleQueryOptions } from '@models/puzzle.model';

// services
import { FirestoreService } from '@services/firestore.service';
import { UserPuzzlesService } from '@services/user-puzzles.service';
import { AppService } from '@services/app.service';

// utils
import { randomNumber } from '@utils/random-number';

@Injectable({
  providedIn: 'root'
})
export class PuzzlesService {

  private puzzles: Puzzle[] = [];

  constructor(
    private http: HttpClient,
    private firestoreService: FirestoreService,
    private userPuzzlesService: UserPuzzlesService,
    private store: Store<PuzzlesState>,
    private appService: AppService
  ) { }

  public async getPuzzle(elo: number, options?: PuzzleQueryOptions, attempts: number = 0): Promise<Puzzle> {


    /*
     lógica para el numero de intentos:
      - se establece un numero máximo de intentos (MAX_ATTEMPTS)
      - Si se alcanza el numero máximo de intentos, se eliminan las options, hasta solo quedar con elo
      - Si es mayor, es por que se sobre paso el numero máximo de intentos, y se retorna null registrando el error
     */

    const MAX_ATTEMPTS = 6;  // establece un número máximo de intentos

    // cuando se valla alcanzando el limite se abre el rango para que no se quede sin puzzles
    if (attempts === 4) {
      this.appService.logWaring('Se esta llegando al máximo de intentos sin encontrar un puzzle adecuado.', [elo, options, attempts]);
      // se borra options, para que se busque un puzzle solo con el elo que se pidió
      return this.getPuzzle(elo, undefined, attempts + 1);
    }


    if (attempts > MAX_ATTEMPTS) {
      this.appService.logError('Se sobrepaso el número máximo de intentos sin encontrar un puzzle adecuado.', [elo, options, attempts]);
      // TODO: Es un blank state, corregir
      return null;  // o podrías lanzar un error, dependiendo de lo que prefieras
    }

    const eloRangeStart = elo - (options?.rangeStart ?? 100);
    const eloRangeEnd = elo + (options?.rangeEnd ?? 100);

    // search in the local array of puzzles
    const puzzlesFilter = this.puzzles.filter((p) =>
      // que este en el rango de elo
      (p.rating >= eloRangeStart && p.rating <= eloRangeEnd) &&
      // si options.themes existe, que el puzzle tenga alguno de los temas que se buscan
      (!options?.themes || options.themes.some((t) => p.themes.includes(t))) &&
      // si options.openingFamily existe, que el puzzle tenga la misma openingFamily
      (!options?.openingFamily || p.openingFamily === options.openingFamily) &&
      // si options.openingVariation existe, que el puzzle tenga la misma openingVariation
      (!options?.openingVariation || p.openingVariation === options.openingVariation)
    );

    // se selecciona un puzzle aleatorio del array de puzzles filtrados
    const puzzle = puzzlesFilter[Math.floor(Math.random() * puzzlesFilter.length)];
    // si se encuentra un puzzle en el array local, se valida que no este en la lista de puzzles del usuario
    if (puzzle) {

      const userPuzzles = this.userPuzzlesService.getUserPuzzles;

      // se busca que el puzzle no este en la lista de puzzles del usuario
      const puzzleInUserPuzzles = userPuzzles.find((p) => p.uidPuzzle === puzzle.uid);
      // si el puzzle esta en la lista de puzzles del usuario, se busca otro puzzle
      if (puzzleInUserPuzzles) {
        // se elimina el puzzle del array local para reducir la posibilidad de que se vuelva a encontrar
        this.puzzles = this.puzzles.filter((p) => p.uid !== puzzle.uid);

        await this.loadMorePuzzles(elo, options);
        // se busca otro puzzle
        return this.getPuzzle(elo, options, attempts + 1);
      } else {
        // se retorna el puzzle
        return puzzle;
      }

    } else {
      // si no se encuentra un puzzle en el array local, se busca en la base de datos
      await this.loadMorePuzzles(elo, options);
      // se busca otro puzzle
      return this.getPuzzle(elo, options, attempts + 1);
    }
  }

  async loadMorePuzzles(elo: number, options?: PuzzleQueryOptions, actionMethod?: 'toStore' | 'return') {
    // se cargan los puzzles desde la base de datos, para que se actualice la lista de puzzles disponibles
    const newPuzzlesFromDB = await this.firestoreService.getPuzzles(elo, options);
    if (!actionMethod || actionMethod === 'toStore') {
      // adicionar puzzles al estado de redux
      this.store.dispatch(addPuzzles({ puzzles: newPuzzlesFromDB }));
      // se adiciona al array local de puzzles
      this.puzzles.push(...newPuzzlesFromDB);
    } else if (actionMethod === 'return') {
      return newPuzzlesFromDB;
    }
  }



  /**
   * Con este método se suben los puzzles a la base de datos
   */
  getPuzzlesToUpload() {
    this.http.get('/assets/data/puzzlesToUpload.csv', { responseType: 'text' }).subscribe(puzzles => {
      // console.log(puzzles);

      const list = puzzles.split('\n');
      // console.log(list);


      let index = 1;

      for (const puzzle of list) {
        const puzzleData = puzzle.split(',');
        // console.log(puzzleData);

        const puzzleToAdd: Puzzle = {
          uid: puzzleData[0],
          fen: puzzleData[1],
          moves: puzzleData[2],
          rating: Number(puzzleData[3]),
          ratingDeviation: Number(puzzleData[4]),
          popularity: Number(puzzleData[5]),
          nbPlays: Number(puzzleData[6]),
          randomNumberQuery: randomNumber(),
          themes: puzzleData[7].split(' '),
          gameUrl: puzzleData[8],
          openingFamily: puzzleData[9] || '',
          openingVariation: puzzleData[10] || ''
        };

        // 03vMK

        console.log(index, '--', puzzleToAdd.randomNumberQuery);

        // this.firestoreService.adminAddNewPuzzle(puzzleToAdd);
        index++;
      }


    });
  }

  async getOnePuzzleByUid(uidPuzzle: string) {
    return await this.firestoreService.getPuzzleByUid(uidPuzzle);
  }

  async getTotalPuzzlesInDB() {
    return await this.firestoreService.adminGetTotalPuzzles();
  }


}
