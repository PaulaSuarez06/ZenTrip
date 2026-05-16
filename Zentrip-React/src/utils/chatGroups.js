const GROUP_WINDOW_MS = 5 * 60 * 1000;

function toMs(createdAt) {
  if (!createdAt) return 0;
  if (typeof createdAt === 'number') return createdAt;
  if (typeof createdAt.toMillis === 'function') return createdAt.toMillis();
  if (createdAt.seconds) return createdAt.seconds * 1000;
  return 0;
}

export function buildGroups(messages) {
  const groups = [];
  for (const msg of messages) {
    const last = groups.at(-1);
    if (last && last.uid === msg.uid) {
      const lastTs = toMs(last.msgs.at(-1)?.createdAt);
      const currTs = toMs(msg.createdAt);
      // Group if same user AND (timestamps missing OR within time window)
      if (lastTs === 0 || currTs === 0 || currTs - lastTs < GROUP_WINDOW_MS) {
        last.msgs.push(msg);
        continue;
      }
    }
    groups.push({ uid: msg.uid, displayName: msg.displayName, msgs: [msg] });
  }
  return groups;
}

export function bubbleRadius(isOwn, isOnly, isFirst, isLast) {
  if (isOwn) {
    if (isOnly) return 'rounded-2xl rounded-tr-sm';
    if (isFirst) return 'rounded-2xl rounded-tr-sm rounded-br-md';
    if (isLast) return 'rounded-2xl rounded-tr-sm';
    return 'rounded-l-2xl rounded-r-md';
  }
  if (isOnly) return 'rounded-2xl rounded-tl-sm';
  if (isFirst) return 'rounded-2xl rounded-tl-sm rounded-bl-md';
  if (isLast) return 'rounded-2xl rounded-tl-sm';
  return 'rounded-r-2xl rounded-l-md';
}
