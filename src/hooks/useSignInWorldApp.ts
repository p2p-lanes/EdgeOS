import { MiniKit, SignMessageInput } from "@worldcoin/minikit-js"
import { useEffect, useState } from "react"

const useSignInWorldApp = () => {
  const [address, setAddress] = useState<string | null>(null)

  const signIn = async () => {
    if (!MiniKit.isInstalled()) {
      return { error: 'Wallet not installed' }
    }

    // if(MiniKit.user?.walletAddress) {
    //   return { finalPayload: { address: MiniKit.user?.walletAddress, status: 'success' } }
    // }

    const nonce = crypto.randomUUID().replace(/-/g, "");

    const {commandPayload: generateMessageResult, finalPayload} = await MiniKit.commandsAsync.walletAuth({
      nonce: nonce,
      expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      statement: 'This is my statement and here is a link https://worldcoin.com/apps',
    })

    if (finalPayload.status === 'error') {
      return { error: '' }
    } else {
      const signMessagePayload: SignMessageInput = {
        message: "Hello world",
      };

      const {finalPayload} = await MiniKit.commandsAsync.signMessage(signMessagePayload);

      console.log("finalPayload", finalPayload)
      return { generateMessageResult, finalPayload: { address: '0x0000000000000000000000000000000000000000', status: 'success' } }
    }
  }

  useEffect(() => {
    if(MiniKit.user?.walletAddress) {
      setAddress(MiniKit.user?.walletAddress)
    }
  }, [MiniKit.user?.walletAddress])

  return { signIn, address }
}
export default useSignInWorldApp