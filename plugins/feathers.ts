// plugins/feathers.js
import { feathers } from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
import axios from "axios";

export default defineNuxtPlugin(() => {
  const feathersClient = feathers();
  const config = useRuntimeConfig();
  // Configure the REST client
  const restClient = rest(config.public.FEATHERS_URL);
  feathersClient.configure(restClient.axios(axios));

  return {
    provide: {
      feathers: feathersClient,
    },
  };
});
