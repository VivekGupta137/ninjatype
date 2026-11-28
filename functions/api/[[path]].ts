import { handleRequest } from "../../src/server/account/handler";
import type { Env } from "../../src/server/account/env";

/** All site APIs except /api/multiplayer/* (own function). Currently: /api/auth/* and /api/me (accounts). */
export const onRequest: PagesFunction<Env> = ({ request, env }) => handleRequest(request, env);
