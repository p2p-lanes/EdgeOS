import { MiniKit, SignMessageInput } from "@worldcoin/minikit-js"
import { useEffect, useState } from "react"

const useSignInWorldApp = () => {
  const [address, setAddress] = useState<string | null>(null)

  const signIn = async () => {
    if (!MiniKit.isInstalled()) {
      return { status: 'error', code: 0, message: 'Wallet not installed' }
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
      return { status: 'error', code: 1, message: 'Error wallet auth' }
    } else {
      const signMessagePayload: SignMessageInput = {
        message: "1",
      };

      const {finalPayload} = await MiniKit.commandsAsync.signMessage(signMessagePayload);

      if(finalPayload.status === 'success') {
        console.log("finalPayload", JSON.stringify(finalPayload))
        return { status: 'success', signature: finalPayload.signature, address: finalPayload.address }
      } else {
        return { status: 'error', code: 2, message: 'Error sign message' }
      }
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