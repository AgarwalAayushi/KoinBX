import { Controller, Get, Post } from '@nestjs/common';
import { InMemoryQueueService } from './in-memory-queue.service';

@Controller('kafka')
export class KafkaController {
  constructor(private readonly queue: InMemoryQueueService) {}

  @Get('messages')
  getMessages() {
    return this.queue.getMessages();
  }

  @Post('clear')
  clear() {
    this.queue.clear();
    return { ok: true };
  }
}
