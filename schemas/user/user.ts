import { z } from "zod"

import { UserDto } from "@/config/schema"

export type CreateUserDto = z.infer<typeof UserDto>

export const getUserByIdDtoSchema = z.object({
  id: z.string().min(1, "User ID is required"),
})

export type GetUserByIdDto = z.infer<typeof getUserByIdDtoSchema>

export const updateUserDtoSchema = UserDto.partial().extend({
  id: z.string().min(1, "User ID is required"),
})

export type UpdateUserDto = z.infer<typeof updateUserDtoSchema>

export const deleteUserDtoSchema = z.object({
  id: z.string().min(1, "User ID is required"),
})
export type DeleteUserDto = z.infer<typeof deleteUserDtoSchema>

export const listUsersDtoSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

export type ListUsersDto = z.infer<typeof listUsersDtoSchema>
