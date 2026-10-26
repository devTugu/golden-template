"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  announcementKeys,
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncement,
  listAnnouncements,
  updateAnnouncement,
} from "@default/api";
import type {
  CreateAnnouncementInput,
  ListAnnouncementsQuery,
  UpdateAnnouncementInput,
} from "@default/types/announcements";
import { listQueryOptions } from "../list-query-options";

export { announcementKeys };

export const useAnnouncements = (params: ListAnnouncementsQuery) =>
  useQuery({
    queryKey: announcementKeys.list(params),
    queryFn: () => listAnnouncements(params),
    ...listQueryOptions,
  });

export const useAnnouncement = (id: number, enabled = true) =>
  useQuery({
    queryKey: announcementKeys.detail(id),
    queryFn: () => getAnnouncement(id),
    enabled: enabled && id > 0,
  });

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncementInput) => createAnnouncement(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateAnnouncementInput;
    }) => updateAnnouncement(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: announcementKeys.detail(id),
      });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAnnouncement(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
};
