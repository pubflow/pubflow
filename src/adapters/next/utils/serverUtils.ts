// src/adapters/next/utils/serverUtils.ts
import { GetServerSidePropsContext, GetServerSideProps } from 'next';
import { PubFlow } from '../../..';


export interface ServerSideOptions {
  requireAuth?: boolean;
  userTypes?: string | string[];
  redirectTo?: string;
}

export function createServerSideClient(context: GetServerSidePropsContext) {
  return new PubFlow({
    baseUrl: process.env.NEXT_PUBLIC_API_URL!,
    headers: {
      cookie: context.req.headers.cookie || '',
      'x-session-id': context.req.cookies['sessionId'] || ''
    }
  });
}

export function withServerSideAuth(
  handler?: GetServerSideProps,
  options: ServerSideOptions = {}
) {
  return async (context: GetServerSidePropsContext) => {
    try {
      const client = createServerSideClient(context);
      
      if (options.requireAuth) {
        const session = await client.auth.getSession();
        
        if (!session) {
          return {
            redirect: {
              destination: options.redirectTo || '/login',
              permanent: false
            }
          };
        }

        if (options.userTypes && !client.auth.hasUserType(options.userTypes)) {
          return {
            redirect: {
              destination: '/unauthorized',
              permanent: false
            }
          };
        }

        // Call original handler if provided
        if (handler) {
          const result = await handler(context);
          
          if ('props' in result) {
            return {
              ...result,
              props: {
                ...result.props,
                session
              }
            };
          }
          return result;
        }

        return {
          props: {
            session
          }
        };
      }

      // If no auth required, just call handler
      return handler ? handler(context) : { props: {} };
    } catch (error) {
      if (options.requireAuth) {
        return {
          redirect: {
            destination: options.redirectTo || '/login',
            permanent: false
          }
        };
      }
      throw error;
    }
  };
}
