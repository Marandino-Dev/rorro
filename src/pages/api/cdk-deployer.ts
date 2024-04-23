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
  try {
    const {rows : developers} = await sql`SELECT * FROM developers`;

   if(!developers) return res.status(404).json({message: 'No developers found'});

    const highestCount = Math.max(...developers.map((developer) => developer.count));

  const filteredDevelopers = developers.filter((developer) => developer.count < highestCount)
    if(filteredDevelopers.length === 0) filteredDevelopers.push(...developers);

    const selectedDeveloper = filteredDevelopers[Math.floor(Math.random() * filteredDevelopers.length)];

    // up the count on the selected developer on the developers file and write it down with qsl
    await sql`UPDATE developers SET count = count + 1 WHERE name = ${selectedDeveloper.name}`;
    await sql`UPDATE developers set current = true WHERE name = ${selectedDeveloper.name}`;
    await sql`UPDATE developers set current = false WHERE name != ${selectedDeveloper.name}`;

  return res.status(200).json(
    selectedDeveloper.name
  );
    
  } catch (error) {
    return res.status(500).json({message: 'Internal server error', error: JSON.stringify(error)});
  }
}
