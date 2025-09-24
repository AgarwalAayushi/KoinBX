import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryQueueService {
  private queue: string[] = [];

  addMessage(message: string) {
    this.queue.push(message);
  }

  getMessages() {
    return [...this.queue];
  }

  clear() {
    this.queue = [];
  }
}
