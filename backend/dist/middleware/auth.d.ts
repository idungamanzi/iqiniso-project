import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    adminId?: number;
    adminEmail?: string;
}
export declare function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map