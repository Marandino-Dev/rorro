import { type NextApiRequest, type NextApiResponse } from 'next';

import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const { text = '' } = req.body;
  // const arguments = text.split(' ').slice(1);
  const command = text.split(' ')[0];

  try {

    switch (command) {
    case 'list':
      return listHandler(req, res);
    case 'assign':
      return assignHandler(req, res);
    case 'current':
      return currentHandler(req, res);
    case 'revert':
      return revertHandler(req, res);
    default:
      return res.status(200).json(
        {
          response_type: 'ephemeral',
          text: 'Please provide a valid command. \n Available commands: `/cdk list`, `/cdk assign`, `/cdk revert`, `/cdk current`',
        }
      );
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: JSON.stringify(error) });
  }
}
const listHandler = async function (
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  try {
    const { rows: developers } = await sql`SELECT * FROM developers`;
    if (!developers) return res.status(404).json({ message: 'No developers found' });

    return res.status(200).json(
      {
        response_type: 'ephemeral',
        // it should return the list of developers with their count
        text: developers.map((developer) => `${developer.name}: ${developer.count}`).join('\n'),
      }
    );

    // TODO: add a check that returns who is the current developer
    // TODO: add some sort of log where it'd be ordered by date, to keep track of dates as the "current" might not be enough

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: JSON.stringify(error) });
  }
};

export async function assignHandler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const authorizedUsers = ['U0467DXP7D5', 'U065JMM3WEB'];
  if (!authorizedUsers.includes(req.body.user_id))
    return res.status(200).json({ text: 'You are not authorized to run this command.' });
  try {
    const { rows: developers } = await sql`SELECT * FROM developers`;

    if (!developers) return res.status(404).json({ message: 'No developers found' });

    const highestCount = Math.max(...developers.map((developer) => developer.count));

    const currentDeveloper = developers.find((developer) => developer.current);

    const filteredDevelopers = developers.filter((developer) => developer.count < highestCount);
    if (filteredDevelopers.length === 0) filteredDevelopers.push(...developers);

    const selectedDeveloper = filteredDevelopers[Math.floor(Math.random() * filteredDevelopers.length)];
    console.log('selected: ', selectedDeveloper?.name);

    const currentDate = new Date().toISOString();
    // Insert the log into the database
    await sql`
  INSERT INTO logs (backup_deployer, current_deployer, date, executed_by)
  VALUES (${currentDeveloper?.slack_id || 'not applicable'}, ${selectedDeveloper.slack_id}, ${currentDate}, ${req.body.user_name})`;

    // up the count on the selected developer on the developers file and write it down with qsl

    await sql`UPDATE developers SET count = count + 1 WHERE name = ${selectedDeveloper.name}`;
    await sql`UPDATE developers set current = true WHERE name = ${selectedDeveloper.name}`;
    await sql`UPDATE developers set current = false WHERE name != ${selectedDeveloper.name}`;

    return res.status(200).json(
      {
        response_type: 'in_channel',
        text: `This Week's CDK Deployer:  <@${selectedDeveloper.slack_id}> | Backup: <@${currentDeveloper?.slack_id}>.`,
      }
    );

    // TODO: add a check that returns who is the current developer
    // TODO: add some sort of log where it'd be ordered by date, to keep track of dates as the "current" might not be enough

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: JSON.stringify(error) });
  }
}

const revertHandler = async function (
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  // TODO: refactor this and mix it
  const authorizedUsers = ['U0467DXP7D5', 'U065JMM3WEB'];
  if (!authorizedUsers.includes(req.body.user_id))
    return res.status(200).json({ text: 'You are not authorized to run this command.' });
  try {
    const { rows: developers } = await sql`SELECT * FROM developers`;
    if (!developers) return res.status(404).json({ message: 'No developers found' });

    const { rows: logs } = await sql`SELECT * FROM logs ORDER BY id DESC LIMIT 2`;
    if (!logs) return res.status(404).json({ message: 'No logs found' });

    const lastLog = logs[0];
    const previousLog = logs[1];
    console.log('lastLog: ', lastLog, 'previousLog: ', previousLog, 'logs', logs);
    if (!lastLog) return res.status(404).json({ message: 'No logs found' });

    const currentDate = new Date().toISOString();
    // Insert the log into the database
    await sql`
    INSERT INTO logs (backup_deployer, current_deployer, date, executed_by)
    VALUES (${previousLog.backup_deployer}, ${previousLog.current_deployer}, ${currentDate}, ${'reverted by: ' + req.body.user_name})`;

    await sql`UPDATE developers SET count = count - 1 WHERE slack_id = ${lastLog.current_deployer}`;
    await sql`UPDATE developers SET current = false WHERE slack_id = ${lastLog.current_deployer}`;
    await sql`UPDATE developers SET current = true WHERE slack_id = ${lastLog.backup_deployer}`;

    return res.status(200).json(
      {
        response_type: 'in_channel',
        text: `CDK Deployer reverted back to:  <@${lastLog.backup_deployer}>.`,
      }
    );
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: JSON.stringify(error) });
  }

};

const currentHandler = async function (
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  try {
    const { rows: logs } = await sql`SELECT * FROM logs ORDER BY date DESC LIMIT 1`;
    // const { rows: developers } = await sql`SELECT * FROM developers`;
    // if (!developers) return res.status(404).json({ message: 'No developers found' });
    // const currentDeveloper = developers.find((developer) => developer.current);

    if (!logs) return res.status(404).json({ message: 'No logs found' });
    const lastLog = logs[0];

    // if(!currentDeveloper) return res.status(404).json({ message: 'No current developer found' })
    // TODO: do something here to validate that the current deployer from the developers table is the same as the current from the logs...

    return res.status(200).json(
      {
        response_type: 'ephemeral',
        text: `Current CDK Deployer:  <@${lastLog.current_deployer}> | Backup: <@${lastLog.backup_deployer}>.`,
      }
    );
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: JSON.stringify(error) });
  }
};
