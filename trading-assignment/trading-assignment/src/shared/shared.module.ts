import { Module } from '@nestjs/common';
import { InMemoryQueueService } from './in-memory-queue.service';
import { KafkaController } from './kafka.controller';

@Module({
  providers: [InMemoryQueueService],
  exports: [InMemoryQueueService],
  controllers: [KafkaController],
})
export class SharedModule {}
