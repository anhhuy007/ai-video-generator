import { ElevenLabsClient } from 'elevenlabs'

export const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_EVENTLAB_API_KEY
  // apiKey: 'sk_11d0828df2ac0dec42713904869e609dc95bb888b01900f6'
  // apiKey: 'sk_9d73083c717d20916cbf97a028b814424b93590424282f16'
})
