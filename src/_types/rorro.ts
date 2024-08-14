export type SlackUser = {
  slackId: string;
  fullName: string;
  count: number;
  holiday: boolean;
  onDuty: boolean;
  backup: boolean;
}

export type LogType = 'status' | 'rotation' | 'revert';

export type Log = {
  description: string; // Changed User ${slackId || fullName} status.
  date: number; // date in millis
  executed_by: string; // username
  type: LogType;
}

// rotations 
export type Rotation = {
  id: string; // organization-rotationName
  name: string;
  organization: string;
  admin: string[]; // save the Slack user ids, just in case save at least the one who created the rotation
  configuration: RotationConfiguration;
  onDuty: SlackUser;
  backup: SlackUser;
}

type RotationConfiguration = {
  hasBackup?: boolean; //defaults to true
  customMessage?: string; //default message will be something like
  // the current "rotation.name" is "rotation.user.active"????? need to decide if this will have separated tables for everyone, it should tbh. but what about the 
  // add here if we ever add automatic rotation and that kind of stuff
}
