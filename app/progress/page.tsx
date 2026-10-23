import {requireChatGPTUser} from '../chatgpt-auth';import Progress from './progress';
export const dynamic='force-dynamic';export default async function Page(){await requireChatGPTUser('/progress');return <Progress/>}
