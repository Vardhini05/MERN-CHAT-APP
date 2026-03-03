export const getSender = (loggedUser, users) => {
  if (!loggedUser || !users || users.length < 2) return "";

  return users[0]?._id === loggedUser?._id
    ? users[1]?.name || ""
    : users[0]?.name || "";
};

export const getSenderFull = (loggedUser, users) => {
  if (!loggedUser || !users || users.length < 2) return null;

  return users[0]?._id === loggedUser?._id
    ? users[1] || null
    : users[0] || null;
};

export const isSameSender = (messages, m, i, userId) => {
  if (!messages || !m) return false;

  return (
    i < messages.length - 1 &&
    messages[i + 1]?.sender?._id !== m?.sender?._id &&
    m?.sender?._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  if (!messages || messages.length === 0) return false;

  return (
    i === messages.length - 1 &&
    messages[messages.length - 1]?.sender?._id !== userId
  );
};

export const isSameSenderMargin = (messages, m, i, userId) => {
  if (!messages || !m) return "auto";

  if (
    i < messages.length - 1 &&
    messages[i + 1]?.sender?._id === m?.sender?._id &&
    m?.sender?._id !== userId
  ) {
    return 33;
  } else if (
    (i < messages.length - 1 &&
      messages[i + 1]?.sender?._id !== m?.sender?._id &&
      m?.sender?._id !== userId) ||
    (i === messages.length - 1 && m?.sender?._id !== userId)
  ) {
    return 0;
  } else {
    return "auto";
  }
};

export const isSameUser = (messages, m, i) => {
  if (!messages || !m) return false;

  return (
    i > 0 &&
    messages[i - 1]?.sender?._id === m?.sender?._id
  );
};