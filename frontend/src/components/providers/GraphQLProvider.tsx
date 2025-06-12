'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/graphql/client';

interface GraphQLProviderProps {
  children: React.ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
} 