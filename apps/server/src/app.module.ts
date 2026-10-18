import { Module } from '@nestjs/common';
import { BoostModule } from './boost/boost.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [GameModule, BoostModule],
})
export class AppModule {}
