import { Timestamp } from 'firebase/firestore';

export const createTimestamp = () => Timestamp.now();

export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};