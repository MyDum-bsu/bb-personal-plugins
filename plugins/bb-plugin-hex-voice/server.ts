import { execFile } from "node:child_process";
import { access, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir, homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { BbPluginApi } from "@get-bb/plugin-sdk";

const execute = promisify(execFile);
const model = "parakeet_v3";
const discovery = join(homedir(), ".local", "share", "hex", "local-api.json");
const maxWavBytes = 64 * 1024 * 1024;

async function hexConnection() {
  const data = JSON.parse(await readFile(discovery, "utf8"));
  if (!Number.isInteger(data.port) || data.port < 1 || data.port > 65535 || typeof data.token !== "string" || !data.token) {
    throw new Error("Hex local API discovery is invalid");
  }
  return { base: `http://127.0.0.1:${data.port}`, authorization: `Bearer ${data.token}` };
}

async function status() {
  try {
    await access(discovery);
    const hex = await hexConnection();
    const response = await fetch(`${hex.base}/health`, { headers: { Authorization: hex.authorization }, signal: AbortSignal.timeout(1500) });
    return response.ok ? { ready: true } : { ready: false, message: "Hex local service is unavailable" };
  } catch {
    return { ready: false, message: "Start Hex on the BB server machine" };
  }
}

async function transcribe(audio: File, { signal }: { signal: AbortSignal }) {
  const dir = await mkdtemp(join(tmpdir(), "bb-hex-voice-"));
  try {
    const input = join(dir, "recording"), output = join(dir, "recording.wav");
    await writeFile(input, Buffer.from(await audio.arrayBuffer()), { mode: 0o600 });
    await execute("ffmpeg", ["-nostdin", "-hide_banner", "-loglevel", "error", "-i", input, "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", "-f", "wav", output], { signal });
    if ((await stat(output)).size > maxWavBytes) throw new Error("Recording exceeds Hex's WAV limit");
    const wav = await readFile(output);
    const hex = await hexConnection();
    const response = await fetch(`${hex.base}/transcriptions?model=${model}&language=ru`, {
      method: "POST", headers: { Authorization: hex.authorization, "Content-Type": "audio/wav", "Content-Length": String(wav.length) },
      body: wav, signal,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as { code?: string };
      throw new Error(`Hex transcription failed (${response.status}${error.code ? `: ${error.code}` : ""})`);
    }
    const result = await response.json() as { transcript?: unknown };
    if (typeof result.transcript !== "string") throw new Error("Hex returned an invalid transcription");
    return result.transcript;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export default function hexVoice(bb: BbPluginApi) {
  bb.experimental_aiServices.register({ id: "hex-parakeet", displayName: "Hex · Parakeet v3", status, transcribe });
}
