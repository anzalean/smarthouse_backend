import BaseRepository from './BaseRepository.js';
import { Session } from '../models/index.js';
import { SESSION_STATUS } from '../constants/constants.js';

class SessionRepository extends BaseRepository {
  constructor() {
    super(Session);
  }

  async findByRefreshToken(refreshToken) {
    return this.findOne({ refreshToken });
  }

  async findByAccessToken(accessToken) {
    return this.findOne({ accessToken });
  }

  async findActiveSessionByUserId(userId) {
    return this.find({
      userId,
      status: SESSION_STATUS.ACTIVE,
      refreshTokenValidUntil: { $gt: new Date() },
    });
  }

  async invalidateSession(id) {
    return this.update(id, {
      status: SESSION_STATUS.REVOKED,
      lastActivity: new Date(),
    });
  }

  async invalidateSessionByRefreshToken(refreshToken) {
    return this.model.findOneAndUpdate(
      { refreshToken },
      {
        status: SESSION_STATUS.REVOKED,
        lastActivity: new Date(),
      },
      { new: true }
    );
  }

  async invalidateAllUserSessions(userId) {
    return this.updateMany(
      { userId, status: SESSION_STATUS.ACTIVE },
      {
        status: SESSION_STATUS.REVOKED,
        lastActivity: new Date(),
      }
    );
  }

  async cleanupExpiredSessions() {
    const now = new Date();
    return this.deleteMany({
      $or: [
        { refreshTokenValidUntil: { $lt: now } },
        { expiresAt: { $lt: now } },
      ],
    });
  }
}

export default new SessionRepository();
