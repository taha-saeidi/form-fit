import {requireChatGPTUser} from '../chatgpt-auth';import Planner from './planner';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/planner');return <Planner/>}
