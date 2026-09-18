import { Schema, model } from 'mongoose';
import type { AuthUser } from '@voicesos/shared';
import { languageEnum, userRoleEnum } from './subdocuments.js';

export interface UserDocument {
  _id: string;
  role: AuthUser['role'];
  displayName: string | null;
  email: string | null;
  preferredLanguage: AuthUser['preferredLanguage'];
  createdAt: string;
}

const userSchema = new Schema<UserDocument>(
  {
    _id: { type: String, required: true },
    role: { type: String, required: true, enum: userRoleEnum },
    displayName: { type: String, default: null },
    email: { type: String, default: null },
    preferredLanguage: { type: String, required: true, enum: languageEnum },
    createdAt: { type: String, required: true },
  },
  { versionKey: false, collection: 'users' },
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });

export const UserModel = model<UserDocument>('User', userSchema);

export function toAuthUser(doc: UserDocument): AuthUser {
  return {
    id: doc._id,
    role: doc.role,
    displayName: doc.displayName,
    email: doc.email,
    preferredLanguage: doc.preferredLanguage,
    createdAt: doc.createdAt,
  };
}
