import { getRepository, Repository } from 'typeorm';
import { Audit } from '../entities/audit-entity';
import { User } from '../entities/user-entity';
import { AuditEventsAction } from '../entities/audit-action-events-entity';
import { RefreshToken } from '../entities/auth-entity';
import { logger } from '../configs/logger';

class AuditController {
  private audits: Repository<Audit>;

  private auditEvents: Repository<AuditEventsAction>;

  private users: Repository<User>;

  private tokens: Repository<RefreshToken>;

  public constructor() {
    this.audits = getRepository(Audit);
    this.auditEvents = getRepository(AuditEventsAction);
    this.users = getRepository(User);
    this.tokens = getRepository(RefreshToken);
  }

  private getUser = async (token: string, id: string) => {
    let userIdent = id;

    if (!userIdent) {
      const tokenRow = await this.tokens.findOne({ token });

      if (tokenRow) {
        const { userId } = tokenRow;
        userIdent = userId;
      }
    }

    return this.users.findOne({ id: userIdent });
  };

  public add = async (token: any, userId: string, eventName: string, result: string): Promise<void> => {
    try {
      const eventEntity = await this.auditEvents.findOne({ name: eventName });
      const userEntity = await this.getUser(token, userId);

      await this.audits.save({
        user: userEntity,
        action: eventEntity,
        result,
      });
    } catch (e) {
      logger.error(e);
    }
  };
}

export default AuditController;
