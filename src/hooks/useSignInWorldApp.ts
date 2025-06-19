import { MiniKit, SignMessageInput } from "@worldcoin/minikit-js"
import { useEffect, useState } from "react"
// import { hashSafeMessage } from "@safe-global/protocol-kit";
const messageToSign = 'Welcome to EdgeOS! Click to sign a message with your wallet to log in. This request will not trigger a blockchain transaction or cost any gas fees.'

const useSignInWorldApp = () => {
  const [address, setAddress] = useState<string | null>(null)

  const signIn = async () => {

    if (!MiniKit.isInstalled()) {
      return { status: 'error', code: 3, message: 'Wallet not installed' }
    }

    // if(MiniKit.user?.walletAddress) {
    //   return { finalPayload: { address: MiniKit.user?.walletAddress, status: 'success' } }
    // }

    const nonce = crypto.randomUUID().replace(/-/g, "");

    const {commandPayload: generateMessageResult, finalPayload: walletAuthFinalPayload} = await MiniKit.commandsAsync.walletAuth({
      nonce: nonce,
      expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      statement: 'This is my statement and here is a link https://worldcoin.com/apps',
    })

    if (walletAuthFinalPayload.status === 'error') {
      return { status: 'error', code: 5, message: 'Error wallet auth' }
    } else {
      const signMessagePayload: SignMessageInput = {
        message: messageToSign,
      };

      const {finalPayload} = await MiniKit.commandsAsync.signMessage(signMessagePayload);

      if (finalPayload.status === 'error') {
        return { status: 'error', code: 4, message: 'Error sign message' }
      }

      // const messageHash = hashSafeMessage(messageToSign);
      // console.log('messageHash', JSON.stringify(messageHash))

      // const isValid = await (
      //   await Safe.init({
      //     provider:
      //       "https://worldchain-mainnet.g.alchemy.com/v2/UMfeLyPi588EQ35Q3hNpilN65kiUB5VY",
      //     safeAddress: finalPayload.address,
      //   })
      // ).isValidSignature(messageHash, finalPayload.signature);

      // if (isValid) {
      //   console.log("Signature is valid");
      // }


      if(finalPayload.status === 'success') {
        console.log("finalPayload", JSON.stringify(finalPayload))
        return { status: 'success', code: 2, signature: finalPayload.signature, address: finalPayload.address }
      } else {
        return { status: 'error', code: 4, message: 'Error sign message' }
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