import { Container, getContainer } from "@cloudflare/containers";

export class Phoenix extends Container {
  defaultPort = 8080;
  sleepAfter = "30m";

  override envVars = {
    PHX_SERVER: "true",
    PORT: "8080",
    PHX_HOST: "papershub-live.chaistudios.workers.dev",
  };
}

export default {
  async fetch(request: Request, env: Env) {
    return getContainer(env.PHOENIX, "papershub").fetch(request);
  },
};
