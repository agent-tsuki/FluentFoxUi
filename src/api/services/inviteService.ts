/**
 * Invite service: staff invites (admin side) and the public invite link
 * (preview + accept). Accept errors keep their codes (INVITE_EMAIL_MISMATCH,
 * INVITE_EXPIRED, INVITE_USED, INVITE_REVOKED, INVITE_NOT_FOUND) so the page
 * can branch on them.
 */
import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { ApiInvite, ApiInvitePreview, InvitePreview, NewInviteInput, StaffInvite } from '@/types/admin'
import { fromGrant, toInvite, toInvitePreview } from './adminMappers'

const enc = encodeURIComponent

export const inviteService = {
  async listInvites(): Promise<StaffInvite[]> {
    const res = await apiClient.get<ApiResponse<ApiInvite[] | null>>('/admin/invites')
    return (res.data ?? []).map(toInvite)
  },

  async createInvite(input: NewInviteInput): Promise<StaffInvite> {
    const res = await apiClient.post<ApiResponse<ApiInvite>>('/admin/invites', {
      email:  input.email.trim().toLowerCase(),
      grants: input.grants.map(fromGrant),
    })
    return toInvite(res.data)
  },

  /** Issues a new link (and a fresh 7-day expiry) and emails it again. */
  async resendInvite(id: string): Promise<StaffInvite> {
    const res = await apiClient.post<ApiResponse<ApiInvite>>(`/admin/invites/${enc(id)}/resend`)
    return toInvite(res.data)
  },

  async revokeInvite(id: string): Promise<void> {
    await apiClient.delete(`/admin/invites/${enc(id)}`)
  },

  /** Public: what the invite grants, with the invited email masked. */
  async previewInvite(token: string): Promise<InvitePreview> {
    const res = await apiClient.get<ApiResponse<ApiInvitePreview>>(`/invites/${enc(token)}`)
    return toInvitePreview(res.data)
  },

  /** Signed in: the verified email must match the invite's. */
  async acceptInvite(token: string): Promise<void> {
    await apiClient.post(`/invites/${enc(token)}/accept`)
  },
}
