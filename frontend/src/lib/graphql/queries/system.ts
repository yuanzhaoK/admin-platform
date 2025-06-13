import { gql } from '@apollo/client';

// 健康检查
export const HEALTH_CHECK = gql`
  query HealthCheck {
    health
  }
`; 