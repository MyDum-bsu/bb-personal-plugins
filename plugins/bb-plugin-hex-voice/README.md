# Hex Voice

Registers Hex Parakeet v3 as a local BB voice service. Recordings reach the BB server, are converted to 16 kHz mono WAV using ffmpeg and sent to the running Hex loopback API; temporary files are removed afterward. No recording is sent to a cloud service by this plugin. The service uses the Russian language setting and requires Hex with its Parakeet v3 model and ffmpeg installed on the BB server machine. The model and language selection are separate from Hex's own dictation selection.

```sh
bb plugin build .
bb plugin install .
bb settings ai-services set voice hex-parakeet --plugin hex-voice
```

The service is available only while Hex is running. Inference latency and the BB request timeout limit long recordings. An API failure is shown to the user; the service never silently sends audio to another provider.
