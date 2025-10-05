/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import { Configuration, PlaidApi } from "plaid";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

const plaid = new PlaidApi(new Configuration({
  basePath: "https://sandbox.plaid.com",
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID as string,
      "PLAID-SECRET": process.env.PLAID_SECRET as string,
    },
  },
}));

export const createLinkToken = onRequest(async (_req, res) => {
  try {
    const r = await plaid.linkTokenCreate({
      user: { client_user_id: "uid-placeholder" },
      client_name: "GlideMoney",
      products: ["transactions"],
      country_codes: ["CA", "US"],
      language: "en",
    });
    res.json({ link_token: r.data.link_token });
  } catch (e: any) {
    logger.error("createLinkToken", e);
    res.status(500).json({ error: "FAILED" });
  }
});
