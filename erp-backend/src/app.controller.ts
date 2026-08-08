import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * ROADMAP.md Phase 1 (platform foundation): a container orchestrator
   * (docker-compose, k8s, etc.) needs something to poll besides "did the
   * process start" — this checks the one dependency that actually matters
   * for the app to serve real traffic. Deliberately a hand-rolled check
   * rather than pulling in @nestjs/terminus for a single dependency;
   * revisit if/when Redis (V2_ARCHITECTURE.md §7) becomes a second thing
   * worth checking here.
   *
   * Always returns 200 — this reports status, it doesn't decide whether
   * to fail the caller's own health check. A DB outage shows up as
   * database: "down" in the body, not an HTTP error code, so a simple
   * "is it reachable" check (e.g. docker-compose's default TCP probe)
   * doesn't itself flap on a transient DB blip.
   */
  @Get('health')
  async getHealth() {
    let database: 'up' | 'down' = 'down';
    try {
      await this.dataSource.query('SELECT 1');
      database = 'up';
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      checks: { database },
    };
  }
}
