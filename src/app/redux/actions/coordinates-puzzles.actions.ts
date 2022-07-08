import { createAction, props } from '@ngrx/store';

import { CoordinatesPuzzle } from '@models/coordinates-puzzles.model';

export const requestGetCoordinatesPuzzles = createAction(
    '[Coordinates-puzzles] requestGetCoordinatesPuzzles',
    props<{ uidUser: string }>()
);


export const addCoordinatesPuzzles = createAction(
    '[Coordinates-puzzles] addCoordinatesPuzzles',
    props<{ coordinatesPuzzles: CoordinatesPuzzle[] }>()
);


export const requestAddOneCoordinatesPuzzle = createAction(
    '[Coordinates-puzzles] requestAddOneCoordinatesPuzzle',
    props<{ coordinatesPuzzle: CoordinatesPuzzle }>()
);

export const addOneCoordinatesPuzzle = createAction(
    '[Coordinates-puzzles] addOneCoordinatesPuzzle',
    props<{ coordinatesPuzzle: CoordinatesPuzzle }>()
);
