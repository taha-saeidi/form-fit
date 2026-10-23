// Sites OAuth identities are not valid on this independent deployment.
export async function POST(){return Response.json({error:'MCP integration is disabled on the VPS edition until independent authentication is configured.'},{status:503})}
