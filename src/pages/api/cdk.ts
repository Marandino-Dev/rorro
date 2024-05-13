import type { NextApiRequest, NextApiResponse } from "next";

import { sql } from "@vercel/postgres";

type Developer = {
  name: string;
  count: number;
};

export const runtime = 'nodejs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const {text = ''} = req.body;
  // const arguments = text.split(' ').slice(1);
  const command = text.split(' ')[0];

  try {
    
    switch (command) {
      case 'list':
        return listHandler(req, res);
      case 'assign':
        return assignHandler(req, res);
      case "current":
        return currentHandler(req, res);
      default:
        console.info('default')
        return res.status(200).json(
          {
            response_type: 'ephemeral',
            text: `Please provide a valid command. \n Available commands: /cdk list, /cdk assign, /cdk current`
          }
        );
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: JSON.stringify(error) });
  }
}
const listHandler = async function(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  try {
    const {rows : developers} = await sql`SELECT * FROM developers`;
   if(!developers) return res.status(404).json({message: 'No developers found'});

  return res.status(200).json(
    {
      response_type: 'ephemeral',
      // it should return the list of developers with their count
      text: developers.map((developer) => `${developer.name}: ${developer.count}`).join('\n')
    }
  );

    // TODO: add a check that returns who is the current developer
    // TODO: add some sort of log where it'd be ordered by date, to keep track of dates as the "current" might not be enough
    
  } catch (error) {
    return res.status(500).json({message: 'Internal server error', error: JSON.stringify(error)});
  }
}


export async function assignHandler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  const authorizedUsers = ["U0467DXP7D5", "U065JMM3WEB"]
  if (!authorizedUsers.includes(req.body.user_id))
    return res.status(200).json({text: 'You are not authorized to run this command.'});
  try {
    const {rows : developers} = await sql`SELECT * FROM developers`;

   if(!developers) return res.status(404).json({message: 'No developers found'});

    const highestCount = Math.max(...developers.map((developer) => developer.count));

    const currentDeveloper = developers.find((developer) => developer.current);

    const filteredDevelopers = developers.filter((developer) => developer.count < highestCount)
    if(filteredDevelopers.length === 0) filteredDevelopers.push(...developers);

    const selectedDeveloper = filteredDevelopers[Math.floor(Math.random() * filteredDevelopers.length)];
    console.log("selected: ", selectedDeveloper?.name)

const currentDate = new Date().toISOString();
    // Insert the log into the database
  await sql`
  INSERT INTO logs (backup_deployer, current_deployer, date, executed_by)
  VALUES (${currentDeveloper?.name || "not applicable"}, ${selectedDeveloper.name}, ${currentDate}, ${req.body.user_name})`;

    // up the count on the selected developer on the developers file and write it down with qsl

    // await sql`UPDATE developers SET count = count + 1 WHERE name = ${selectedDeveloper.name}`;
    // await sql`UPDATE developers set current = true WHERE name = ${selectedDeveloper.name}`;
    // await sql`UPDATE developers set current = false WHERE name != ${selectedDeveloper.name}`;




  return res.status(200).json(
    {
      response_type: 'in_channel',
      text: `This Week's CDK Deployer:  <@${selectedDeveloper.slack_id}> | Backup: <@${currentDeveloper?.slack_id}>.`,
    }
  );

    // TODO: add a check that returns who is the current developer
    // TODO: add some sort of log where it'd be ordered by date, to keep track of dates as the "current" might not be enough
    
  } catch (error) {
    return res.status(500).json({message: 'Internal server error', error: JSON.stringify(error)});
  }
}

const currentHandler = async function (
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
  try {
    const { rows: developers } = await sql`SELECT * FROM developers`;
    if (!developers) return res.status(404).json({ message: 'No developers found' });

    const currentDeveloper = developers.find((developer) => developer.current);
    if(!currentDeveloper) return res.status(404).json({ message: 'No current developer found' })

    return res.status(200).json(
      {
        response_type: 'ephemeral',
        text: `Current CDK Deployer:  <@${currentDeveloper.slack_id}>.`,
      }
    );
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: JSON.stringify(error) });
  } 
}
