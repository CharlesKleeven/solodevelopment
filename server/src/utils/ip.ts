import crypto from 'crypto';
import { Request } from 'express';

export function getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
    if (ip.startsWith('::ffff:')) return ip.substring(7);
    return ip;
}

export function hashIP(ip: string): string {
    const salt = process.env.IP_HASH_SALT || process.env.JWT_SECRET || 'solodev-salt';
    return crypto.createHash('sha256').update(ip + salt).digest('hex').substring(0, 16);
}
