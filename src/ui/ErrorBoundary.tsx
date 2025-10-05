import React from 'react'
import { View, Text } from 'react-native'

interface Props { children: React.ReactNode }
interface State { error?: Error }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: undefined }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Something went wrong.</Text>
      </View>
    )
    return this.props.children as any
  }
}


