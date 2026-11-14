import { definePluginApp } from "@get-bb/plugin-sdk/app";

function ZCodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3 4h18L9.2 19.5h11.3V23H2L13.8 7.5H3z" />
    </svg>
  );
}

export default definePluginApp((app) => {
  for (const providerId of ["acp-zcode-start", "acp-zcode"]) {
    app.slots.experimental_providerIcon({ providerKind: "agent", providerId, icon: ZCodeIcon });
  }
});
