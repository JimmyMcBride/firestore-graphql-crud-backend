"use strict";

const { auth, Compute } = require("google-auth-library");

/**
 * This example directly instantiates a Compute client to acquire credentials.
 * Generally, you wouldn't directly create this class, rather call the
 * `auth.getClient()` method to automatically obtain credentials.
 */
async function main() {
  const client = new Compute({
    // Specifying the serviceAccountEmail is optional. It will use the default
    // service account if one is not defined.
    serviceAccountEmail:
      "firebase-adminsdk-4tb19@full-stack-react-graphql.iam.gserviceaccount.com"
  });
  const projectId = await auth.getProjectId();
  const url = `https://dns.googleapis.com/dns/v1/projects/${projectId}`;
  const res = await client.request({ url });
  console.log(res.data);
}

module.exports = { main };
