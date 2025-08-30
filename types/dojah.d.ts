declare module 'dojah-kyc-sdk-react' {
  import { Component } from 'react'

  interface DojahProps {
    appID: string
    publicKey: string
    type: 'custom' | 'modal'
    response: (status: string, data?: any) => void
    onError?: (error: any) => void
    onMount?: (instance: any) => void
    config?: {
      debug?: boolean
      mobile?: boolean
      pages?: string[]
      aml?: boolean
      selfie?: boolean
    }
    userData?: {
      first_name?: string
      last_name?: string
      dob?: string
      residence_country?: string
      email?: string
      phone?: string
    }
  }

  class Dojah extends Component<DojahProps> {
    destroy?: () => void
  }

  export default Dojah
}
