import {
  AnnouncementPageSchema,
  AnnouncementSchema,
  type CreateAnnouncementInput,
  type ListAnnouncementsQuery,
  type UpdateAnnouncementInput,
} from "@default/types/announcements";
import { getApi } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { parseWith } from "../parse";
import type { PaginatedResult } from "../types";
import type { Announcement } from "@default/types/announcements";

export async function listAnnouncements(
  params: ListAnnouncementsQuery,
): Promise<PaginatedResult<Announcement>> {
  const data = await getApi().get(API_ENDPOINTS.ANNOUNCEMENTS.LIST, {
    params,
  });
  return parseWith(
    AnnouncementPageSchema,
    API_ENDPOINTS.ANNOUNCEMENTS.LIST,
  )(data);
}

export async function getAnnouncement(id: number): Promise<Announcement> {
  const endpoint = API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id);
  const data = await getApi().get(endpoint);
  return parseWith(AnnouncementSchema, endpoint)(data);
}

export async function createAnnouncement(
  data: CreateAnnouncementInput,
): Promise<Announcement> {
  const result = await getApi().post(API_ENDPOINTS.ANNOUNCEMENTS.LIST, data);
  return parseWith(AnnouncementSchema, API_ENDPOINTS.ANNOUNCEMENTS.LIST)(
    result,
  );
}

export async function updateAnnouncement(
  id: number,
  data: UpdateAnnouncementInput,
): Promise<Announcement> {
  const endpoint = API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id);
  const result = await getApi().put(endpoint, data);
  return parseWith(AnnouncementSchema, endpoint)(result);
}

export function deleteAnnouncement(id: number): Promise<void> {
  return getApi().delete(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id));
}
