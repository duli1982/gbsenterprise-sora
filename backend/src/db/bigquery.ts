let BigQuery: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BigQuery = require('@google-cloud/bigquery').BigQuery;
} catch {
  BigQuery = class {};
}

let bigquery: any;
try {
  bigquery = new BigQuery();
} catch {
  // Allow tests to provide a mock implementation
  bigquery = {} as any;
}

export default bigquery;
