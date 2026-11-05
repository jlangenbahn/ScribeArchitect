import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  EssayTemplate: a.enum(['MULTI_PARAGRAPH']),

  Essay: a
    .model({
      title: a.string().required(),
      templateType: a.ref('EssayTemplate').required(),
      content: a.json().required(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
