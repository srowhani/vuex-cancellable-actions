let ACTION_UID = 0;

export const nextUid = (basePrefix = 'action') =>
  `${basePrefix}-${ACTION_UID++}`;
