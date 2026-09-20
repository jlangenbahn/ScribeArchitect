import { defineAuth } from '@aws-amplify/backend';

/**
 * Cognito user pool with email sign-in.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
