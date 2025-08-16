export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "AImeet";

export async function GET() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("summaries");
    const history = await collection.find({}).sort({ _id: -1 }).limit(10).toArray();
    await client.close();
    return NextResponse.json({ success: true, history });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
