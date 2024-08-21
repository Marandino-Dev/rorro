/** Slack Response Type in order to choose what type of display the return message will have */
export enum SlackResponseType {
  /** Used to return a message in the same channel the command was executed. Everyone can see it */
  InChannel = 'in_channel',
  /** Used to return a temporary message that only the user will be able to see */
  Ephemeral = 'ephemeral',
  // not much info about this one yet, haven't tried it.
  Modal = 'trigger_id',
}
export function getSlackMessage(responseType: SlackResponseType, responseText: string) {

  //TODO: expand upon this, make it be able to use different types of response.
  // https://api.slack.com/interactivity/handling#responses
  return {
    response_type: responseType,
    text: responseText,
  }

}

