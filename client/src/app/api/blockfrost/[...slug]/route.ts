import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  try {
    const { slug } = await context.params;

    const network = slug[0];
    let key = process.env.BLOCKFROST_API_KEY_PREPROD;


    switch (network) {
      case 'testnet':
        key = process.env.BLOCKFROST_API_KEY_TESTNET;
        break;
      case 'mainnet':
        key = process.env.BLOCKFROST_API_KEY_MAINNET;
        break;
      case 'preview':
        key = process.env.BLOCKFROST_API_KEY_PREVIEW;
        break;
    }

    const axiosInstance = axios.create({
      baseURL: `https://cardano-${network}.blockfrost.io/api/v0`,
      headers: { project_id: key },
    });

    const url = slug.slice(1).join('/');
    const searchParams = req.url.split('?')[1] || '';
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

    const { data } = await axiosInstance.get(fullUrl);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response?.data || error?.message || 'Unknown error' },
      { status: error?.response?.status || 500 },
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  try {
    const { slug } = await context.params;

    const network = slug[0];
    const endpoint = slug.slice(1).join('/');

    let key = process.env.BLOCKFROST_API_KEY_PREPROD;
    switch (network) {
      case 'testnet':
        key = process.env.BLOCKFROST_API_KEY_TESTNET;
        break;
      case 'mainnet':
        key = process.env.BLOCKFROST_API_KEY_MAINNET;
        break;
      case 'preview':
        key = process.env.BLOCKFROST_API_KEY_PREVIEW;
        break;
    }

    const axiosInstance = axios.create({
      baseURL: `https://cardano-${network}.blockfrost.io/api/v0`,
      headers: { project_id: key },
    });

    const body = await req.arrayBuffer();
    const headers = { 'Content-Type': 'application/cbor' };

    // Convert ArrayBuffer to Uint8Array for axios
    const bodyBytes = new Uint8Array(body);
    const { data, status } = await axiosInstance.post(endpoint, bodyBytes, {
      headers,
    });
    return NextResponse.json(data, { status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response?.data || error?.message || 'Unknown error' },
      { status: error?.response?.status || 500 },
    );
  }
}
