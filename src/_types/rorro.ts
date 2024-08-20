export type SlackUser = {
  slackId: string;
  fullName: string;
  count: number;
  holiday: boolean;
  onDuty: boolean;
  backup: boolean;
}

// https://api.slack.com/interactivity/slash-commands
type SlackCommandPayload = {
  /** The Request Token from Slack */
  token: string;
  team_id: string;
  /** The Unique string that Slack uses for the organization */
  team_domain: string;
  enterprise_id: string;
  enterprise_name: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  /** The user name who invoked this */
  user_name: string;
  /** The exact command the user invoked, e.g: /rr*/
  command: string;
  /** The text after the command, usually the optional parameters */
  text: string;
  response_url: string;
  trigger_id: string;
  api_app_id: string;
}


export type SlackCommandRequest = {
  body?: SlackCommandPayload
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
}

type RotationConfiguration = {
  hasBackup?: boolean; //defaults to true
  customMessage?: string; //default message will be something like
  // the current "rotation.name" is "rotation.user.active"????? need to decide if this will have separated tables for everyone, it should tbh. but what about the 
  // add here if we ever add automatic rotation and that kind of stuff
}
