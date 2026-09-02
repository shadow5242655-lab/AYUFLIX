import { NextResponse } from 'next/server';
import { VIDEO_SERVERS, getServerUrl } from '@/lib/videoSources';

const ERROR_KEYWORDS = ['404', 'not found', 'file not found', 'does not exist', 'no video', 'unavailable', 'error', 'no results'];

async function checkServer(server, type, id, season, episode) {
  const url = getServerUrl(server, type, id, season, episode);
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow',
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      const text = await response.text();
      const hasError = ERROR_KEYWORDS.some(keyword => 
        text.toLowerCase().includes(keyword)
      );
      
      if (!hasError && text.length > 100) {
        return { success: true, serverId: server.id, serverName: server.name };
      }
    }
    
    return { success: false, serverId: server.id };
  } catch (error) {
    return { success: false, serverId: server.id };
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get('movieId');
  const type = searchParams.get('type') || 'movie';
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';
  
  if (!movieId) {
    return NextResponse.json({ success: false, message: 'movieId required' }, { status: 400 });
  }
  
  // Check all servers in parallel
  const checks = VIDEO_SERVERS.map(server => 
    checkServer(server, type, movieId, season, episode)
  );
  
  try {
    const results = await Promise.allSettled(checks);
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        return NextResponse.json({
          success: true,
          serverId: result.value.serverId,
          serverName: result.value.serverName,
        });
      }
    }
    
    // Return first server as fallback
    return NextResponse.json({
      success: false,
      serverId: VIDEO_SERVERS[0].id,
      serverName: VIDEO_SERVERS[0].name,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      serverId: VIDEO_SERVERS[0].id,
    });
  }
}
