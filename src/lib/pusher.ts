import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: "2115661",
  key: "0cdae9a9c3203d68398f",
  secret: "77add10f91f5dafa9bee",
  cluster: "ap2",
  useTLS: true,
});

export const PUSHER_CHANNEL = "order-updates";
export const PUSHER_EVENT = "status-update";
