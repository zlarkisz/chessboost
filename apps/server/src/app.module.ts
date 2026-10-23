import { Module } from '@nestjs/common';
import { BoostModule } from './boost/boost.module';
import { GameModule } from './game/game.module';
import { MatchModule } from './match/match.module';

@Module({
  imports: [GameModule, BoostModule, MatchModule],
})
export class AppModule {}
