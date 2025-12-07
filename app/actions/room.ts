"use server";

// Re-export all actions for backward compatibility
export type { ActionState, UserRoom } from "./types";
export { USER_TOKEN_COOKIE } from "./types";
export { getUserRooms, getTotalRoomsCount, isRoomAdmin } from "./queries";
export { createRoom } from "./create-room";
export { joinRoom } from "./join-room";
export { shuffleRoom } from "./admin";
