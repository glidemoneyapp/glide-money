import { LinkingOptions } from '@react-navigation/native'

export const linking: LinkingOptions<any> = {
  prefixes: ['glidemoney://'],
  config: {
    screens: {
      PlaidReturn: 'link/plaid-return'
    }
  }
}


