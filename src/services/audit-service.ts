import { getRepository, Repository } from 'typeorm';
import { Audit } from '../entities/audit-entity';
import { User } from '../entities/user-entity';
import { AuditEventsAction } from '../entities/audit-action-events-entity';
import { RefreshToken } from '../entities/auth-entity';
import { logger } from '../configs/logger';

const getUser = async (token: string, id: string) => {
  const tokens: Repository<RefreshToken> = getRepository(RefreshToken);
  const users: Repository<User> = getRepository(User);
  let userIdent = id;

  if (!userIdent) {
    const tokenInstance = await tokens.findOne({ token });

    if (tokenInstance) {
      const { userId } = tokenInstance;
      userIdent = userId;
    }
  }

  return users.findOne({ id: userIdent });
};

const addAudit = async (eventName: string, result: string, token: any, userId: string): Promise<void> => {
  const audits: Repository<Audit> = getRepository(Audit);
  const auditEvents: Repository<AuditEventsAction> = getRepository(AuditEventsAction);

  try {
    const eventInstance = await auditEvents.findOne({ name: eventName });
    const userInstance = await getUser(token, userId);

    await audits.save({
      user: userInstance,
      action: eventInstance,
      result,
    });
  } catch (e) {
    logger.error(e);
  }
};

export { addAudit };
