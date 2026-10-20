import estado from "../../../api/estado.json"

export async function GET() {
  return Response.json(estado)
}
