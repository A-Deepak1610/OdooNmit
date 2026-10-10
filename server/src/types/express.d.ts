import { TokenPayload } from '../common/utils/token.util.js';

declare global {
  namespace Express {
    interface User extends TokenPayload {}
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
