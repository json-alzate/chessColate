import { RouterReducerState } from '@ngrx/router-store';
import { RouterStateUrl } from './router.state';

// models


// states
import { UIState } from './ui.state';
import { AuthState } from './auth.state';
import { CurrentGameState } from './current-game.state';
import { MovesState } from './moves.state';
import { CoordinatesPuzzlesState } from './coordinates-puzzles.state';
import { PuzzlesState } from './puzzles.state';
import { UserPuzzlesState } from './user-puzzles.state';



export interface AppState {
  ui: UIState;
  auth: AuthState;
  router: RouterReducerState<RouterStateUrl>;
  currentGame: CurrentGameState;
  moves: MovesState;
  coordinatesPuzzles: CoordinatesPuzzlesState;
  puzzles: PuzzlesState;
  userPuzzles: UserPuzzlesState;
}
