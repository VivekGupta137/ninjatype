export interface Env {
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN?: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    ALLOWED_ORIGINS: string;
    /** Comma-separated emails that always get Pro (testing, staff). */
    PRO_GRANT_EMAILS?: string;
    /** Dodo Payments API key; checkout and the portal are disabled without it. */
    DODO_PAYMENTS_API_KEY?: string;
    /** Dodo Payments webhook signing secret (`whsec_...`); the billing webhook is disabled without it. */
    DODO_PAYMENTS_WEBHOOK_KEY?: string;
    /** "live_mode" for real payments; anything else uses the Dodo test environment. */
    DODO_PAYMENTS_ENVIRONMENT?: string;
    /** Dodo product ids of the two subscription plans. */
    DODO_PRODUCT_MONTHLY?: string;
    DODO_PRODUCT_YEARLY?: string;
}
