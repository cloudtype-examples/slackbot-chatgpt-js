import { WebClient } from '@slack/web-api';
import { createEventAdapter } from '@slack/events-api';
import { SocketModeClient } from '@slack/socket-mode';
import openai from 'openai';
import dotenv from 'dotenv';

dotenv.config();

openai.apiKey = process.env.OPENAI_API_KEY;

const appToken = process.env.SLACK_APP_TOKEN;
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;


const webClient = new WebClient(process.env.SLACK_BOT_TOKEN);
const slackEvents = createEventAdapter(slackSigningSecret);
const socketModeClient = new SocketModeClient({ appToken });

const generateResponse = async (text) => {
  const response = await openai.complete({
    engine: 'davinci',
    prompt: text,
    maxTokens: 60,
  });
  console.log(response);
  return response.choices[0].text.trim();
};

const handleMessage = async (event) => {
  try {
    const { text, channel } = event;
    const response = await generateResponse(text);
    await webClient.chat.postMessage({
      channel,
      text: response,
    });
  } catch (error) {
    console.error(error);
  }
};


(async () => {
  await socketModeClient.start();
  slackEvents.on('message', handleMessage);
  console.log(handleMessage);
})();
