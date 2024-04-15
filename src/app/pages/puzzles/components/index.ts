import { StaticsComponent } from './statics/statics.component';
import { BlockSettingsComponent } from './block-settings/block-settings.component';
import { BoardPuzzleComponent } from './board-puzzle/board-puzzle.component';
import { ActivityChartComponent } from './activity-chart/activity-chart.component';
import { BlockPresentationComponent } from './block-presentation/block-presentation.component';
import { PuzzleSolutionComponent } from './puzzle-solution/puzzle-solution.component';

export const COMPONENTS = [
    StaticsComponent,
    BlockSettingsComponent,
    BoardPuzzleComponent,
    ActivityChartComponent,
    BlockPresentationComponent,
    PuzzleSolutionComponent
];

export const ENTRY_COMPONENTS: any[] = [
    BlockPresentationComponent,
    PuzzleSolutionComponent
];
